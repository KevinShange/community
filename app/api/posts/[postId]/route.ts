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
 * DELETE /api/posts/:postId
 * 刪除貼文（僅貼文作者可刪除）
 * body: { user: { name, avatar?, handle } }
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = (await _req.json()) as { user?: IncomingAuthor };

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }
    if (!body?.user?.handle || !body?.user?.name) {
      return NextResponse.json({ error: 'Missing user' }, { status: 400 });
    }

    const user = await getOrCreateUser(body.user);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== user.id) {
      return NextResponse.json({ error: 'Only the author can delete this post' }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: postId } });

    const { triggerPusher } = await import('@/lib/pusher');
    await triggerPusher('feed', 'post-deleted', { postId });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
