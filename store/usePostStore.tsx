'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import type { Post, Comment } from '@/types/models';
import { createApiPostService } from '@/services/postService';
import { useUserStore } from '@/store/useUserStore';

export type FeedType = 'for-you' | 'following';

/** 用於即時更新單一貼文（部分欄位或函式） */
export type UpdatePostFn = (prev: Post) => Post;

/** Store 對外介面（含即時推播用方法） */
interface PostStoreContextType {
  posts: Post[];
  feed: FeedType;
  setFeed: (feed: FeedType) => void;
  refetch: () => void;
  /** 依 postId 更新 store 中的貼文（供 Pusher 即時更新使用） */
  updatePostById: (postId: string | number, update: Partial<Post> | UpdatePostFn) => void;
  /** 從即時推播新增一則貼文到列表頂部（避免重複） */
  prependPostFromRealtime: (post: Post) => void;
  toggleLike: (postId: string | number) => void;
  toggleRetweet: (postId: string | number) => void;
  toggleCommentLike: (postId: string | number, commentId: string | number) => void;
  addComment: (postId: string | number, comment: Omit<Comment, 'id' | 'postId'>) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likeCount' | 'isLikedByMe' | 'replyCount' | 'retweetCount' | 'isRetweetedByMe' | 'comments'>) => void;
  deletePost: (postId: string | number) => void;
}

const PostStoreContext = createContext<PostStoreContextType | undefined>(undefined);

export function PostStoreProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feed, setFeedState] = useState<FeedType>('for-you');
  const { currentUser } = useUserStore();

  const refetch = useCallback(() => {
    const headers: HeadersInit = {};
    if (currentUser?.handle) {
      headers['x-user-handle'] = currentUser.handle;
    }
    const url = feed === 'following' ? '/api/posts?feed=following' : '/api/posts';
    fetch(url, { headers })
      .then((res) => res.json())
      .then((data: Post[]) => setPosts(data))
      .catch(() => setPosts([]));
  }, [currentUser?.handle, feed]);

  const setFeed = useCallback((newFeed: FeedType) => {
    setFeedState(newFeed);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updatePostById = useCallback((postId: string | number, update: Partial<Post> | UpdatePostFn) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (String(p.id) !== String(postId)) return p;
        return typeof update === 'function' ? update(p) : { ...p, ...update };
      })
    );
  }, []);

  const prependPostFromRealtime = useCallback((post: Post) => {
    setPosts((prev) => {
      const exists = prev.some((p) => String(p.id) === String(post.id));
      if (exists) return prev;
      return [post, ...prev];
    });
  }, []);

  const postService = useMemo(() => {
    if (!currentUser) {
      return {
        addPost: () => {},
        addComment: () => {},
        toggleLike: () => {},
        toggleRetweet: () => {},
        toggleCommentLike: () => {},
        deletePost: () => {},
      };
    }
    return createApiPostService(currentUser, (updater) => setPosts(updater), refetch);
  }, [currentUser, refetch]);

  return (
    <PostStoreContext.Provider
      value={{
        posts,
        feed,
        setFeed,
        refetch,
        updatePostById,
        prependPostFromRealtime,
        toggleLike: postService.toggleLike,
        toggleRetweet: postService.toggleRetweet,
        toggleCommentLike: postService.toggleCommentLike,
        addComment: postService.addComment,
        addPost: postService.addPost,
        deletePost: postService.deletePost,
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
