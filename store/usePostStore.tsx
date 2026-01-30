'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import type { Post, Comment } from '@/types/models';
import { createApiPostService } from '@/services/postService';
import { useUserStore } from '@/store/useUserStore';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const { currentUser } = useUserStore();

  const refetch = useCallback(() => {
    const headers: HeadersInit = {};
    if (currentUser?.handle) {
      headers['x-user-handle'] = currentUser.handle;
    }
    fetch('/api/posts', { headers })
      .then((res) => res.json())
      .then((data: Post[]) => setPosts(data))
      .catch(() => setPosts([]));
  }, [currentUser?.handle]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const postService = useMemo(() => {
    if (!currentUser) {
      return {
        addPost: () => {},
        addComment: () => {},
        toggleLike: () => {},
        toggleCommentLike: () => {},
      };
    }
    return createApiPostService(currentUser, (updater) => setPosts(updater), refetch);
  }, [currentUser, refetch]);

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
