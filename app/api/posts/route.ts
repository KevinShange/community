import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Post } from '@/types/models';

/**
 * GET /api/posts
 * 從資料庫查詢貼文列表
 */
export async function GET() {
  try {
    // 查詢所有貼文，包含作者資訊和留言
    const posts = await prisma.post.findMany({
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
      isLikedByMe: false, // TODO: 根據當前使用者判斷
      replyCount: post.comments.length,
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
        isLikedByMe: false, // TODO: 根據當前使用者判斷
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
