import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
 * PUT /api/posts/:postId/comments/:commentId/like
 * 切換留言按讚（寫入資料庫）
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const body = (await req.json()) as { user: IncomingAuthor };

    if (!commentId) {
      return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
    }
    if (!body?.user?.handle || !body?.user?.name) {
      return NextResponse.json({ error: 'Missing user' }, { status: 400 });
    }

    const user = await getOrCreateUser(body.user);

    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId: user.id } },
      select: { id: true },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.commentLike.delete({ where: { id: existing.id } }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ liked: false });
    }

    await prisma.$transaction([
      prisma.commentLike.create({
        data: { comment: { connect: { id: commentId } }, user: { connect: { id: user.id } } },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

