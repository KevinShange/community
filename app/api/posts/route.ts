import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Post } from '@/types/models';
import { headers } from 'next/headers';

type FeedItem = {
  post: Awaited<ReturnType<typeof prisma.post.findMany>>[number];
  sortAt: Date;
  retweetedBy?: { name: string; avatar: string | null; handle: string };
  retweetedAt?: Date;
};

function formatPostToResponse(
  post: FeedItem['post'],
  opts: {
    retweetedBy?: FeedItem['retweetedBy'];
    retweetedAt?: Date;
    retweetCountByPostId: Map<string, number>;
    myPostLikeIds: Set<string>;
    myPostRetweetIds: Set<string>;
    myCommentLikeIds: Set<string>;
    me: { id: string } | null;
  }
): Post {
  const avatar = post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.handle}`;
  const base: Post = {
    id: post.id,
    author: {
      name: post.author.name,
      avatar,
      handle: post.author.handle,
    },
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    likeCount: post.likeCount,
    isLikedByMe: opts.me ? opts.myPostLikeIds.has(post.id) : false,
    replyCount: post.comments.length,
    retweetCount: opts.retweetCountByPostId.get(post.id) ?? post.retweetCount ?? 0,
    isRetweetedByMe: opts.me ? opts.myPostRetweetIds.has(post.id) : false,
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
      isLikedByMe: opts.me ? opts.myCommentLikeIds.has(comment.id) : false,
    })),
  };
  if (opts.retweetedBy) {
    base.retweetedBy = {
      name: opts.retweetedBy.name,
      avatar: opts.retweetedBy.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opts.retweetedBy.handle}`,
      handle: opts.retweetedBy.handle,
    };
    base.retweetedAt = opts.retweetedAt?.toISOString();
  }
  return base;
}

/**
 * GET /api/posts
 * 從資料庫查詢貼文列表
 * Query: feed=following 時回傳登入使用者關注的作者的貼文，以及關注用戶的轉發
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const feed = searchParams.get('feed'); // 'following' | null
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    const me = userHandle ? await prisma.user.findUnique({ where: { handle: userHandle } }) : null;

    if (feed === 'following' && me) {
      const follows = await prisma.follow.findMany({
        where: { followerId: me.id },
        select: { followingId: true },
      });
      const followingIds = follows.map((f) => f.followingId);
      if (followingIds.length === 0) {
        return NextResponse.json([]);
      }

      // 1) 關注用戶發的貼文（原創）
      const postsByFollowing = await prisma.post.findMany({
        where: { authorId: { in: followingIds } },
        include: {
          author: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // 2) 關注用戶的轉發（PostRetweet 中 userId in followingIds）
      const retweetsByFollowing = await prisma.postRetweet.findMany({
        where: { userId: { in: followingIds } },
        include: {
          post: {
            include: {
              author: true,
              comments: {
                include: { author: true },
                orderBy: { createdAt: 'asc' },
              },
            },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const feedItems: FeedItem[] = [];
      for (const p of postsByFollowing) {
        feedItems.push({ post: p, sortAt: p.createdAt });
      }
      for (const r of retweetsByFollowing) {
        feedItems.push({
          post: r.post,
          sortAt: r.createdAt,
          retweetedBy: {
            name: r.user.name,
            avatar: r.user.avatar,
            handle: r.user.handle,
          },
          retweetedAt: r.createdAt,
        });
      }
      feedItems.sort((a, b) => b.sortAt.getTime() - a.sortAt.getTime());

      const allPostIds = [...new Set(feedItems.map((item) => item.post.id))];
      const retweetCountByPostId = new Map<string, number>();
      if (allPostIds.length) {
        const retweets = await prisma.postRetweet.findMany({
          where: { postId: { in: allPostIds } },
          select: { postId: true },
        });
        for (const r of retweets) {
          retweetCountByPostId.set(r.postId, (retweetCountByPostId.get(r.postId) ?? 0) + 1);
        }
      }

      const myPostLikeIds = new Set<string>();
      const myPostRetweetIds = new Set<string>();
      const myCommentLikeIds = new Set<string>();
      if (allPostIds.length) {
        const commentIds = feedItems.flatMap((item) => item.post.comments.map((c) => c.id));
        const [likes, myRetweets] = await Promise.all([
          prisma.postLike.findMany({
            where: { userId: me.id, postId: { in: allPostIds } },
            select: { postId: true },
          }),
          prisma.postRetweet.findMany({
            where: { userId: me.id, postId: { in: allPostIds } },
            select: { postId: true },
          }),
        ]);
        likes.forEach((l) => myPostLikeIds.add(l.postId));
        myRetweets.forEach((r) => myPostRetweetIds.add(r.postId));
        if (commentIds.length) {
          const cl = await prisma.commentLike.findMany({
            where: { userId: me.id, commentId: { in: commentIds } },
            select: { commentId: true },
          });
          cl.forEach((l) => myCommentLikeIds.add(l.commentId));
        }
      }

      const formattedPosts: Post[] = feedItems.map((item) =>
        formatPostToResponse(item.post, {
          retweetedBy: item.retweetedBy,
          retweetedAt: item.retweetedAt,
          retweetCountByPostId,
          myPostLikeIds,
          myPostRetweetIds,
          myCommentLikeIds,
          me,
        })
      );
      return NextResponse.json(formattedPosts);
    }

    // Profile 動態：指定使用者的發文 + 該使用者的轉發
    const profileHandle = searchParams.get('profile');
    if (profileHandle) {
      const profileUser = await prisma.user.findUnique({
        where: { handle: profileHandle },
      });
      if (!profileUser) {
        return NextResponse.json([]);
      }

      const postsByUser = await prisma.post.findMany({
        where: { authorId: profileUser.id },
        include: {
          author: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const retweetsByUser = await prisma.postRetweet.findMany({
        where: { userId: profileUser.id },
        include: {
          post: {
            include: {
              author: true,
              comments: {
                include: { author: true },
                orderBy: { createdAt: 'asc' },
              },
            },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const feedItems: FeedItem[] = [];
      for (const p of postsByUser) {
        feedItems.push({ post: p, sortAt: p.createdAt });
      }
      for (const r of retweetsByUser) {
        feedItems.push({
          post: r.post,
          sortAt: r.createdAt,
          retweetedBy: {
            name: r.user.name,
            avatar: r.user.avatar,
            handle: r.user.handle,
          },
          retweetedAt: r.createdAt,
        });
      }
      feedItems.sort((a, b) => b.sortAt.getTime() - a.sortAt.getTime());

      const allPostIds = [...new Set(feedItems.map((item) => item.post.id))];
      const retweetCountByPostId = new Map<string, number>();
      if (allPostIds.length) {
        const retweets = await prisma.postRetweet.findMany({
          where: { postId: { in: allPostIds } },
          select: { postId: true },
        });
        for (const r of retweets) {
          retweetCountByPostId.set(r.postId, (retweetCountByPostId.get(r.postId) ?? 0) + 1);
        }
      }

      const myPostLikeIds = new Set<string>();
      const myPostRetweetIds = new Set<string>();
      const myCommentLikeIds = new Set<string>();
      if (me && allPostIds.length) {
        const commentIds = feedItems.flatMap((item) => item.post.comments.map((c) => c.id));
        const [likes, myRetweets] = await Promise.all([
          prisma.postLike.findMany({
            where: { userId: me.id, postId: { in: allPostIds } },
            select: { postId: true },
          }),
          prisma.postRetweet.findMany({
            where: { userId: me.id, postId: { in: allPostIds } },
            select: { postId: true },
          }),
        ]);
        likes.forEach((l) => myPostLikeIds.add(l.postId));
        myRetweets.forEach((r) => myPostRetweetIds.add(r.postId));
        if (commentIds.length) {
          const cl = await prisma.commentLike.findMany({
            where: { userId: me.id, commentId: { in: commentIds } },
            select: { commentId: true },
          });
          cl.forEach((l) => myCommentLikeIds.add(l.commentId));
        }
      }

      const formattedProfilePosts: Post[] = feedItems.map((item) =>
        formatPostToResponse(item.post, {
          retweetedBy: item.retweetedBy,
          retweetedAt: item.retweetedAt,
          retweetCountByPostId,
          myPostLikeIds,
          myPostRetweetIds,
          myCommentLikeIds,
          me,
        })
      );
      return NextResponse.json(formattedProfilePosts);
    }

    // 非 following：原本邏輯（全部貼文或依作者篩選此處未用，僅查全部）
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const postIds = posts.map((p) => p.id);
    const retweetCountByPostId = new Map<string, number>();
    if (postIds.length) {
      const retweets = await prisma.postRetweet.findMany({
        where: { postId: { in: postIds } },
        select: { postId: true },
      });
      for (const r of retweets) {
        retweetCountByPostId.set(r.postId, (retweetCountByPostId.get(r.postId) ?? 0) + 1);
      }
    }

    const myPostLikeIds = new Set<string>();
    const myPostRetweetIds = new Set<string>();
    const myCommentLikeIds = new Set<string>();
    if (me) {
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

    const feedItems: FeedItem[] = posts.map((p) => ({ post: p, sortAt: p.createdAt }));
    const formattedPosts: Post[] = feedItems.map((item) =>
      formatPostToResponse(item.post, {
        retweetCountByPostId,
        myPostLikeIds,
        myPostRetweetIds,
        myCommentLikeIds,
        me,
      })
    );
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
