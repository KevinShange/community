import type { Post, Comment } from '@/types/models';

/** 貼文／留言共用 ID 型別 */
export type PostId = string | number;

/** 由 Store 注入的「更新 posts」函式，Local/API 實作共用 */
export type UpdatePostsFn = (updater: (prev: Post[]) => Post[]) => void;

/** 新增貼文時傳入的 payload（不含自動生成欄位） */
export type AddPostPayload = Omit<
  Post,
  'id' | 'createdAt' | 'likeCount' | 'isLikedByMe' | 'replyCount' | 'retweetCount' | 'isRetweetedByMe' | 'comments'
>;

/** 新增留言時傳入的 payload（不含 id、postId） */
export type AddCommentPayload = Omit<Comment, 'id' | 'postId'>;

/**
 * 貼文服務介面（抽象合約）
 * - UI / Store 只依賴此介面，不依賴實作細節
 * - 目前：Local 實作改寫本地 state
 * - 未來：替換為 ApiPostService，內部改為呼叫 REST/GraphQL 即可，UI 不需大改
 */
export interface IPostService {
  addPost(post: AddPostPayload): void;
  addComment(postId: PostId, comment: AddCommentPayload): void;
  toggleLike(postId: PostId): void;
  toggleRetweet(postId: PostId): void;
  toggleCommentLike(postId: PostId, commentId: PostId): void;
  deletePost(postId: PostId): void;
}
