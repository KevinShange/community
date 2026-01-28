/**
 * 貼文服務層（postService）
 *
 * 使用方式：
 * - Store 透過 createLocalPostService(setPosts) 取得 IPostService，並把方法轉給 Context
 * - UI 仍然只用 usePostStore()，介面不變
 *
 * 未來替換成 API：
 * - 新增 createApiPostService(apiClient, updatePosts) 實作 IPostService
 * - 在 usePostStore 裡改為：const postService = createApiPostService(api, setPosts)
 * - UI / 呼叫端不需改動
 */
export type { IPostService, PostId, AddPostPayload, AddCommentPayload, UpdatePostsFn } from './types';
export { createLocalPostService } from './localPostService';
export { createApiPostService } from './apiPostService';