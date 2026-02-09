import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerPusher } from '@/lib/pusher';

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
 * PUT /api/posts/:postId/like
 * 切換貼文按讚（寫入資料庫）
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

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
      select: { id: true },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.postLike.delete({ where: { id: existing.id } }),
        prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      const updated = await prisma.post.findUnique({
        where: { id: postId },
        select: { likeCount: true },
      });
      if (updated) {
        await triggerPusher(`post-${postId}`, 'post-like-updated', {
          likeCount: updated.likeCount,
        });
      }
      return NextResponse.json({ liked: false, likeCount: updated?.likeCount ?? 0 });
    }

    await prisma.$transaction([
      prisma.postLike.create({
        data: { post: { connect: { id: postId } }, user: { connect: { id: user.id } } },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    const updated = await prisma.post.findUnique({
      where: { id: postId },
      select: { likeCount: true },
    });
    if (updated) {
      await triggerPusher(`post-${postId}`, 'post-like-updated', {
        likeCount: updated.likeCount,
        likedBy: { name: user.name, handle: user.handle, avatar: user.avatar },
      });
    }
    return NextResponse.json({ liked: true, likeCount: updated?.likeCount ?? 0 });
  } catch (error) {
    console.error('Error toggling post like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

