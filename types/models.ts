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
  /** 圖片 URL 陣列（Cloudinary） */
  imageUrls?: string[];
  createdAt: string | Date;
  likeCount: number;
  isLikedByMe: boolean;
}

/**
 * 貼文（Post）資料模型
 * 在 Follow 動態中若為「被關注用戶轉發」則會帶上 retweetedBy / retweetedAt
 */
export interface Post {
  id: string | number;
  author: Author;
  content: string;
  /** 圖片 URL 陣列（Cloudinary） */
  imageUrls?: string[];
  createdAt: string | Date;
  likeCount: number;
  isLikedByMe: boolean;
  replyCount: number;
  retweetCount: number;
  isRetweetedByMe: boolean;
  comments: Comment[];
  /** 若為轉發出現在動態中，表示是誰轉發的 */
  retweetedBy?: Author;
  /** 轉發時間（ISO 字串） */
  retweetedAt?: string;
}

/** 私訊一則 */
export interface DirectMessageItem {
  id: string;
  sender: Author;
  receiver: Author;
  content: string;
  imageUrls?: string[];
  createdAt: string;
}

/** 對話摘要（左欄列表一項） */
export interface ConversationSummary {
  partner: Author;
  /** 此聊天室對象是否為已追蹤使用者 */
  isFollowing: boolean;
  /** 最後一則訊息是否為對方發送（用於顯示未讀圓點） */
  lastMessageFromPartner?: boolean;
  /** 是否有未讀訊息（對方發送且晚於上次已讀時間） */
  hasUnread?: boolean;
  lastMessage: {
    content: string;
    imageUrls?: string[];
    createdAt: string;
  } | null;
}

/** 通知一則（按讚/轉發/回覆/追蹤） */
export type NotificationType = 'like' | 'repost' | 'reply' | 'follow';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actor: Author;
  postId?: string;
  commentId?: string;
  createdAt: string;
  isUnread: boolean;
}
