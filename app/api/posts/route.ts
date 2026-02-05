import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Post } from '@/types/models';
import { headers } from 'next/headers';

/**
 * GET /api/posts
 * 從資料庫查詢貼文列表
 * Query: feed=following 時僅回傳登入使用者有 follow 的作者的貼文
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const feed = searchParams.get('feed'); // 'following' | null
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    const me = userHandle ? await prisma.user.findUnique({ where: { handle: userHandle } }) : null;

    // Following feed：需登入，且只顯示有 follow 的作者的貼文
    let authorIdFilter: { in: string[] } | undefined;
    if (feed === 'following' && me) {
      const follows = await prisma.follow.findMany({
        where: { followerId: me.id },
        select: { followingId: true },
      });
      const followingIds = follows.map((f) => f.followingId);
      if (followingIds.length === 0) {
        // 沒有 follow 任何人，回傳空陣列
        return NextResponse.json([]);
      }
      authorIdFilter = { in: followingIds };
    }

    // 查詢貼文（可依作者篩選），包含作者資訊和留言
    const posts = await prisma.post.findMany({
      where: authorIdFilter ? { authorId: authorIdFilter } : undefined,
      include: {
        author: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 若有登入使用者，查詢目前使用者對貼文/留言的按讚與轉發狀態
    const myPostLikeIds = new Set<string>();
    const myPostRetweetIds = new Set<string>();
    const myCommentLikeIds = new Set<string>();
    if (me) {
      const postIds = posts.map((p) => p.id);
      const commentIds = posts.flatMap((p) => p.comments.map((c) => c.id));

      if (postIds.length) {
        const [likes, retweets] = await Promise.all([
          prisma.postLike.findMany({
            where: { userId: me.id, postId: { in: postIds } },
            select: { postId: true },
          }),
          prisma.postRetweet.findMany({
            where: { userId: me.id, postId: { in: postIds } },
            select: { postId: true },
          }),
        ]);
        likes.forEach((l) => myPostLikeIds.add(l.postId));
        retweets.forEach((r) => myPostRetweetIds.add(r.postId));
      }
      if (commentIds.length) {
        const likes = await prisma.commentLike.findMany({
          where: { userId: me.id, commentId: { in: commentIds } },
          select: { commentId: true },
        });
        likes.forEach((l) => myCommentLikeIds.add(l.commentId));
      }
    }

    // 轉換為前端需要的格式
    const formattedPosts: Post[] = posts.map((post) => ({
      id: post.id,
      author: {
        name: post.author.name,
        avatar: post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.handle}`,
        handle: post.author.handle,
      },
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      likeCount: post.likeCount,
      isLikedByMe: me ? myPostLikeIds.has(post.id) : false,
      replyCount: post.comments.length,
      retweetCount: post.retweetCount,
      isRetweetedByMe: me ? myPostRetweetIds.has(post.id) : false,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        postId: post.id,
        author: {
          name: comment.author.name,
          avatar: comment.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.handle}`,
          handle: comment.author.handle,
        },
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        likeCount: comment.likeCount,
        isLikedByMe: me ? myCommentLikeIds.has(comment.id) : false,
      })),
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

type IncomingAuthor = {
  name: string;
  avatar?: string;
  handle: string; // 例如 @johndoe
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
 * POST /api/posts
 * 新增貼文（寫入資料庫）
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { author: IncomingAuthor; content: string };
    if (!body?.author?.handle || !body?.author?.name) {
      return NextResponse.json({ error: 'Missing author' }, { status: 400 });
    }
    if (!body?.content?.trim()) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const user = await getOrCreateUser(body.author);

    const created = await prisma.post.create({
      data: {
        content: body.content.trim(),
        author: { connect: { id: user.id } },
      },
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const formatted: Post = {
      id: created.id,
      author: {
        name: created.author.name,
        avatar:
          created.author.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${created.author.handle}`,
        handle: created.author.handle,
      },
      content: created.content,
      createdAt: created.createdAt.toISOString(),
      likeCount: created.likeCount,
      isLikedByMe: false,
      replyCount: created.comments.length,
      retweetCount: 0,
      isRetweetedByMe: false,
      comments: [],
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
