'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Post, Comment } from '@/types/models';
import { mockPosts } from '@/data/mockPosts';

interface PostStoreContextType {
  posts: Post[];
  toggleLike: (postId: string | number) => void;
  toggleCommentLike: (postId: string | number, commentId: string | number) => void;
  addComment: (postId: string | number, comment: Omit<Comment, 'id' | 'postId'>) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likeCount' | 'isLikedByMe' | 'replyCount' | 'comments'>) => void;
}

const PostStoreContext = createContext<PostStoreContextType | undefined>(undefined);

export function PostStoreProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  /**
   * 切換貼文點讚狀態
   */
  const toggleLike = useCallback((postId: string | number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLikedByMe: !post.isLikedByMe,
            likeCount: post.isLikedByMe ? post.likeCount - 1 : post.likeCount + 1,
          };
        }
        return post;
      })
    );
  }, []);

  /**
   * 切換留言點讚狀態
   */
  const toggleCommentLike = useCallback((postId: string | number, commentId: string | number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  isLikedByMe: !comment.isLikedByMe,
                  likeCount: comment.isLikedByMe ? comment.likeCount - 1 : comment.likeCount + 1,
                };
              }
              return comment;
            }),
          };
        }
        return post;
      })
    );
  }, []);

  /**
   * 新增留言
   */
  const addComment = useCallback((postId: string | number, comment: Omit<Comment, 'id' | 'postId'>) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newComment: Comment = {
            ...comment,
            id: Date.now(), // 簡單的 ID 生成，實際應用中應使用更可靠的方式
            postId,
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
            replyCount: post.replyCount + 1,
          };
        }
        return post;
      })
    );
  }, []);

  /**
   * 新增貼文
   */
  const addPost = useCallback((post: Omit<Post, 'id' | 'createdAt' | 'likeCount' | 'isLikedByMe' | 'replyCount' | 'comments'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now(), // 簡單的 ID 生成
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isLikedByMe: false,
      replyCount: 0,
      comments: [],
    };
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  return (
    <PostStoreContext.Provider
      value={{
        posts,
        toggleLike,
        toggleCommentLike,
        addComment,
        addPost,
      }}
    >
      {children}
    </PostStoreContext.Provider>
  );
}

/**
 * Hook 用於存取貼文狀態
 */
export function usePostStore() {
  const context = useContext(PostStoreContext);
  if (context === undefined) {
    throw new Error('usePostStore must be used within a PostStoreProvider');
  }
  return context;
}
