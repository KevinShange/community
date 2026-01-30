/**
 * 登入方式：email 為信箱登入，oauth 為社群登入
 */
export type LoginType = 'email' | 'oauth';

/**
 * 作者資訊
 */
export interface Author {
  name: string;
  avatar: string;
  handle: string;
  /** 登入方式，用於主畫面顯示名稱／名稱(網址) */
  loginType?: LoginType;
  /** 僅 email 登入時有值，用於衍生顯示名稱 */
  email?: string;
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
