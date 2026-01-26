/**
 * 作者資訊
 */
export interface Author {
  name: string;
  avatar: string;
  handle: string;
}

/**
 * 留言（Comment）資料模型
 */
export interface Comment {
  id: string | number;
  postId: string | number;
  author: Author;
  content: string;
  createdAt: string | Date;
  likeCount: number;
  isLikedByMe: boolean;
}

/**
 * 貼文（Post）資料模型
 */
export interface Post {
  id: string | number;
  author: Author;
  content: string;
  createdAt: string | Date;
  likeCount: number;
  isLikedByMe: boolean;
  replyCount: number;
  comments: Comment[];
}
