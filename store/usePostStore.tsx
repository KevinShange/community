'use client';

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import type { Post, Comment } from '@/types/models';
import { mockPosts } from '@/data/mockPosts';
import { createLocalPostService } from '@/services/postService';

/** Store 對外介面（與原本一致，UI 不需改動） */
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

  const postService = useMemo(
    () => createLocalPostService((updater) => setPosts(updater)),
    []
  );

  return (
    <PostStoreContext.Provider
      value={{
        posts,
        toggleLike: postService.toggleLike,
        toggleCommentLike: postService.toggleCommentLike,
        addComment: postService.addComment,
        addPost: postService.addPost,
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
