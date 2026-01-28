import type { Author, Post } from '@/types/models';
import type { IPostService, PostId, AddPostPayload, AddCommentPayload, UpdatePostsFn } from './types';

function toUserHandle(author: Author) {
  return author.handle;
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export function createApiPostService(
  currentUser: Author,
  updatePosts: UpdatePostsFn
): IPostService {
  return {
    addPost(payload: AddPostPayload) {
      fetchJson<Post>('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: payload.author,
          content: payload.content,
        }),
      }).then((data) => {
        updatePosts((prev) => [data, ...prev]);
      });
    },

    addComment(postId: PostId, payload: AddCommentPayload) {
      fetchJson<Post>(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: payload.author,
          content: payload.content,
        }),
      }).then((data) => {
        updatePosts((prev) => prev.map((p) => (p.id === postId ? data : p)));
      });
    },

    toggleLike(postId: PostId) {
      fetchJson<{ liked: boolean }>(`/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      }).then(({ liked }) => {
        updatePosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            // 以 server 回傳 liked 為準（避免多端競態）
            const wasLiked = p.isLikedByMe;
            const nextLiked = liked;
            const nextCount =
              nextLiked === wasLiked
                ? p.likeCount
                : nextLiked
                  ? p.likeCount + 1
                  : Math.max(0, p.likeCount - 1);
            return { ...p, isLikedByMe: nextLiked, likeCount: nextCount };
          })
        );
      });
    },

    toggleCommentLike(postId: PostId, commentId: PostId) {
      fetchJson<{ liked: boolean }>(`/api/posts/${postId}/comments/${commentId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      }).then(({ liked }) => {
        updatePosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: p.comments.map((c) => {
                if (c.id !== commentId) return c;
                const wasLiked = c.isLikedByMe;
                const nextLiked = liked;
                const nextCount =
                  nextLiked === wasLiked
                    ? c.likeCount
                    : nextLiked
                      ? c.likeCount + 1
                      : Math.max(0, c.likeCount - 1);
                return { ...c, isLikedByMe: nextLiked, likeCount: nextCount };
              }),
            };
          })
        );
      });
    },
  };
}

