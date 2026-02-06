import type { Author, Post } from '@/types/models';
import type { IPostService, PostId, AddPostPayload, AddCommentPayload, UpdatePostsFn } from './types';

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

const TEMP_POST_ID = 'temp-post';
const TEMP_COMMENT_ID = 'temp-comment';

export function createApiPostService(
  currentUser: Author,
  updatePosts: UpdatePostsFn,
  refetch?: () => void
): IPostService {
  const handleError = (err: unknown) => {
    console.error('Post service error:', err);
    refetch?.();
  };

  return {
    addPost(payload: AddPostPayload) {
      const optimistic: Post = {
        id: TEMP_POST_ID,
        author: payload.author,
        content: payload.content,
        imageUrls: payload.imageUrls,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        isLikedByMe: false,
        replyCount: 0,
        retweetCount: 0,
        isRetweetedByMe: false,
        comments: [],
      };
      updatePosts((prev) => [optimistic, ...prev]);

      fetchJson<Post>('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: payload.author,
          content: payload.content,
          imageUrls: payload.imageUrls,
        }),
      })
        .then((data) => {
          updatePosts((prev) => prev.map((p) => (p.id === TEMP_POST_ID ? data : p)));
        })
        .catch((err) => {
          updatePosts((prev) => prev.filter((p) => p.id !== TEMP_POST_ID));
          handleError(err);
        });
    },

    addComment(postId: PostId, payload: AddCommentPayload) {
      const optimisticComment = {
        id: TEMP_COMMENT_ID,
        postId,
        author: payload.author,
        content: payload.content,
        imageUrls: payload.imageUrls,
        createdAt: payload.createdAt instanceof Date ? payload.createdAt.toISOString() : payload.createdAt,
        likeCount: 0,
        isLikedByMe: false,
      };
      updatePosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            replyCount: p.replyCount + 1,
            comments: [...p.comments, optimisticComment],
          };
        })
      );

      fetchJson<Post>(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: payload.author,
          content: payload.content,
          imageUrls: payload.imageUrls,
        }),
      })
        .then((data) => {
          updatePosts((prev) => prev.map((p) => (p.id === postId ? data : p)));
        })
        .catch((err) => {
          updatePosts((prev) =>
            prev.map((p) => {
              if (p.id !== postId) return p;
              return {
                ...p,
                replyCount: Math.max(0, p.replyCount - 1),
                comments: p.comments.filter((c) => c.id !== TEMP_COMMENT_ID),
              };
            })
          );
          handleError(err);
        });
    },

    toggleLike(postId: PostId) {
      fetchJson<{ liked: boolean }>(`/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      })
        .then(({ liked }) => {
          updatePosts((prev) =>
            prev.map((p) => {
              if (p.id !== postId) return p;
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
        })
        .catch(handleError);
    },

    toggleRetweet(postId: PostId) {
      fetchJson<{ retweeted: boolean }>(`/api/posts/${postId}/retweet`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      })
        .then(({ retweeted }) => {
          updatePosts((prev) =>
            prev.map((p) => {
              if (p.id !== postId) return p;
              const wasRetweeted = p.isRetweetedByMe;
              const nextRetweeted = retweeted;
              const nextCount =
                nextRetweeted === wasRetweeted
                  ? p.retweetCount
                  : nextRetweeted
                    ? p.retweetCount + 1
                    : Math.max(0, p.retweetCount - 1);
              return { ...p, isRetweetedByMe: nextRetweeted, retweetCount: nextCount };
            })
          );
        })
        .catch(handleError);
    },

    toggleCommentLike(postId: PostId, commentId: PostId) {
      fetchJson<{ liked: boolean }>(`/api/posts/${postId}/comments/${commentId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      })
        .then(({ liked }) => {
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
        })
        .catch(handleError);
    },

    deletePost(postId: PostId) {
      updatePosts((prev) => prev.filter((p) => p.id !== postId));
      fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Delete failed');
        })
        .catch((err) => {
          handleError(err);
          refetch?.();
        });
    },
  };
}

