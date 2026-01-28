'use client';

import { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    // 依目前登入者帶入按讚狀態（x-user-handle）
    const headers: HeadersInit = {};
    if (currentUser?.handle) {
      headers['x-user-handle'] = currentUser.handle;
    }
    fetch('/api/posts', { headers })
      .then((res) => res.json())
      .then((data: Post[]) => setPosts(data))
      .catch(() => setPosts([]));
  }, [currentUser?.handle]);

  const postService = useMemo(() => {
    // AuthGuard 已保證在主頁/發文區一定有 currentUser；但 Provider 會包住整個 app，
    // 因此在未登入時提供 no-op，避免呼叫端意外炸掉。
    if (!currentUser) {
      return {
        addPost: () => {},
        addComment: () => {},
        toggleLike: () => {},
        toggleCommentLike: () => {},
      };
    }
    return createApiPostService(currentUser, (updater) => setPosts(updater));
  }, [currentUser]);

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
