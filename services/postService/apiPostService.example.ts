/**
 * API 版貼文服務範例（未來替換用）
 *
 * 使用方式：在 usePostStore 中改為
 *   const postService = useMemo(
 *     () => createApiPostService(apiClient, (updater) => setPosts(updater)),
 *     [apiClient]
 *   );
 *
 * UI 不需任何改動，仍使用 usePostStore() 的 addPost、toggleLike 等。
 */
import type { Post } from '@/types/models';
import type { IPostService, PostId, AddPostPayload, AddCommentPayload, UpdatePostsFn } from './types';

// 假設的 API 客戶端型別，可換成 fetch / axios / tRPC 等
interface ApiClient {
  post: (path: string, body: unknown) => Promise<{ data: Post }>;
  postComment: (postId: PostId, body: unknown) => Promise<{ data: Post }>;
  putLike: (postId: PostId) => Promise<void>;
  putRetweet: (postId: PostId) => Promise<{ retweeted: boolean }>;
  putCommentLike: (postId: PostId, commentId: PostId) => Promise<void>;
  delete: (postId: PostId) => Promise<void>;
}

export function createApiPostService(
  api: ApiClient,
  updatePosts: UpdatePostsFn
): IPostService {
  return {
    addPost(payload: AddPostPayload) {
      api.post('/posts', payload).then(({ data }) => {
        updatePosts((prev) => [data, ...prev]);
      });
    },
    addComment(postId: PostId, payload: AddCommentPayload) {
      api.postComment(postId, payload).then(({ data }) => {
        updatePosts((prev) =>
          prev.map((p) => (p.id === postId ? data : p))
        );
      });
    },
    toggleLike(postId: PostId) {
      api.putLike(postId).then(() => {
        updatePosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              isLikedByMe: !p.isLikedByMe,
              likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1,
            };
          })
        );
      });
    },
    toggleCommentLike(postId: PostId, commentId: PostId) {
      api.putCommentLike(postId, commentId).then(() => {
        updatePosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: p.comments.map((c) => {
                if (c.id !== commentId) return c;
                return {
                  ...c,
                  isLikedByMe: !c.isLikedByMe,
                  likeCount: c.isLikedByMe ? c.likeCount - 1 : c.likeCount + 1,
                };
              }),
            };
          })
        );
      });
    },
    toggleRetweet(postId: PostId) {
      api.putRetweet(postId).then(({ retweeted }) => {
        updatePosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            const wasRetweeted = p.isRetweetedByMe;
            const nextCount =
              retweeted === wasRetweeted
                ? p.retweetCount
                : retweeted
                  ? p.retweetCount + 1
                  : Math.max(0, p.retweetCount - 1);
            return { ...p, isRetweetedByMe: retweeted, retweetCount: nextCount };
          })
        );
      });
    },
    deletePost(postId: PostId) {
      updatePosts((prev) => prev.filter((p) => p.id !== postId));
      api.delete(postId).catch(() => {
        updatePosts((prev) => [...prev]); // 失敗時可選擇還原
      });
    },
  };
}
