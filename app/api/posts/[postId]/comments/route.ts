import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notificationService';
import type { Post } from '@/types/models';
import { createReplySchema } from '@/lib/schemas';

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
 * POST /api/posts/:postId/comments
 * 新增留言（寫入資料庫），回傳更新後的 Post（含 comments）
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = createReplySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.flatten().formErrors[0]
        ?? parsed.error.flatten().fieldErrors.content?.[0]
        ?? parsed.error.flatten().fieldErrors.author?.[0]
        ?? 'Invalid request body';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { author, content, imageUrls } = parsed.data;

    const user = await getOrCreateUser(author);

    const createdComment = await prisma.comment.create({
      data: {
        post: { connect: { id: postId } },
        author: { connect: { id: user.id } },
        content,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      },
      select: { id: true },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await createNotification(prisma, {
      type: 'reply',
      actorId: user.id,
      targetUserId: post.authorId,
      postId,
      commentId: createdComment.id,
    });

    const postImageUrls: string[] = Array.isArray(post.imageUrls)
      ? post.imageUrls.filter((u): u is string => typeof u === 'string')
      : [];
    const formatted: Post = {
      id: post.id,
      author: {
        name: post.author.name,
        avatar: post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.handle}`,
        handle: post.author.handle,
      },
      content: post.content,
      imageUrls: postImageUrls.length > 0 ? postImageUrls : undefined,
      createdAt: post.createdAt.toISOString(),
      likeCount: post.likeCount,
      isLikedByMe: false, // 由前端 optimistic 更新；完整狀態請用 GET /api/posts（帶 x-user-handle）
      replyCount: post.comments.length,
      retweetCount: post.retweetCount ?? 0,
      isRetweetedByMe: false,
      comments: post.comments.map((c) => {
        const commentImageUrls: string[] = Array.isArray(c.imageUrls)
          ? c.imageUrls.filter((u): u is string => typeof u === 'string')
          : [];
        return {
          id: c.id,
          postId: post.id,
          author: {
            name: c.author.name,
            avatar: c.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author.handle}`,
            handle: c.author.handle,
          },
          content: c.content,
          imageUrls: commentImageUrls.length > 0 ? commentImageUrls : undefined,
          createdAt: c.createdAt.toISOString(),
          likeCount: c.likeCount,
          isLikedByMe: false,
        };
      }),
    };

    // 即時推播：新留言至該貼文頻道
    const newComment = formatted.comments[formatted.comments.length - 1];
    if (newComment) {
      const { triggerPusher } = await import('@/lib/pusher');
      await triggerPusher(`post-${postId}`, 'new-comment', {
        comment: newComment,
        postId,
      });
    }

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

