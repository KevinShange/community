import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notificationService';

type IncomingAuthor = {
  name: string;
  avatar?: string;
  handle: string;
};

async function getOrCreateUser(author: IncomingAuthor) {
  return prisma.user.upsert({
    where: { handle: author.handle },
    update: {
      name: author.name,
      avatar: author.avatar,
    },
    create: {
      name: author.name,
      avatar: author.avatar,
      handle: author.handle,
    },
  });
}

/**
 * PUT /api/posts/:postId/retweet
 * 切換貼文轉發（寫入資料庫）
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = (await req.json()) as { user: IncomingAuthor };

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }
    if (!body?.user?.handle || !body?.user?.name) {
      return NextResponse.json({ error: 'Missing user' }, { status: 400 });
    }

    const user = await getOrCreateUser(body.user);

    const existing = await prisma.postRetweet.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
      select: { id: true },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.postRetweet.delete({ where: { id: existing.id } }),
        prisma.post.update({
          where: { id: postId },
          data: { retweetCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ retweeted: false });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.postRetweet.create({
        data: { post: { connect: { id: postId } }, user: { connect: { id: user.id } } },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { retweetCount: { increment: 1 } },
      }),
    ]);
    await createNotification(prisma, {
      type: 'repost',
      actorId: user.id,
      targetUserId: post.authorId,
      postId,
    });

    return NextResponse.json({ retweeted: true });
  } catch (error) {
    console.error('Error toggling post retweet:', error);
    return NextResponse.json({ error: 'Failed to toggle retweet' }, { status: 500 });
  }
}
