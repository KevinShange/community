import type { Post, Comment } from '@/types/models';
import type { IPostService, PostId, AddPostPayload, AddCommentPayload, UpdatePostsFn } from './types';

/**
 * 建立「本地 state」版的貼文服務
 * 所有操作都透過 updatePosts 改寫本地 posts，無任何 API 呼叫
 *
 * @param updatePosts - 由 Store 注入，例如 (fn) => setPosts(fn)
 */
export function createLocalPostService(updatePosts: UpdatePostsFn): IPostService {
  return {
    addPost(post: AddPostPayload) {
      const newPost: Post = {
        ...post,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        likeCount: 0,
        isLikedByMe: false,
        replyCount: 0,
        retweetCount: 0,
        isRetweetedByMe: false,
        comments: [],
      };
      updatePosts((prev) => [newPost, ...prev]);
    },

    addComment(postId: PostId, comment: AddCommentPayload) {
      updatePosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const newComment: Comment = {
            ...comment,
            id: Date.now(),
            postId,
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
            replyCount: post.replyCount + 1,
          };
        })
      );
    },

    toggleLike(postId: PostId) {
      updatePosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            isLikedByMe: !post.isLikedByMe,
            likeCount: post.isLikedByMe ? post.likeCount - 1 : post.likeCount + 1,
          };
        })
      );
    },

    toggleRetweet(postId: PostId) {
      updatePosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            isRetweetedByMe: !post.isRetweetedByMe,
            retweetCount: post.isRetweetedByMe ? post.retweetCount - 1 : post.retweetCount + 1,
          };
        })
      );
    },

    toggleCommentLike(postId: PostId, commentId: PostId) {
      updatePosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            comments: post.comments.map((c) => {
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
    },

    deletePost(postId: PostId) {
      updatePosts((prev) => prev.filter((p) => p.id !== postId));
    },
  };
}
