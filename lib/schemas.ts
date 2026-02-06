import { z } from 'zod';

/** 登入表單：email + 密碼 */
export const loginInputSchema = z.object({
  email: z
    .string()
    .min(1, '請輸入 Email')
    .email('請輸入有效的 Email 格式')
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, '請輸入密碼'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

/** API 發文／留言用的作者物件 */
const authorSchema = z.object({
  name: z.string().min(1, '作者名稱為必填'),
  handle: z.string().min(1, '作者 handle 為必填'),
  avatar: z.string().url().optional().or(z.literal('')),
});

/** 建立貼文 request body */
const MAX_CONTENT_LENGTH = 5000;

const contentSchema = z
  .string()
  .max(MAX_CONTENT_LENGTH, `內容不可超過 ${MAX_CONTENT_LENGTH} 字元`)
  .transform((v) => v.trim())
  .pipe(z.string().min(1, '內容不可為空'));

export const createPostSchema = z.object({
  author: authorSchema,
  content: contentSchema,
  imageUrls: z
    .array(z.string().url())
    .max(4, '最多 4 張圖片')
    .optional()
    .default([]),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/** 建立留言（reply）request body */
export const createReplySchema = z.object({
  author: authorSchema,
  content: contentSchema,
  imageUrls: z
    .array(z.string().url())
    .max(4, '最多 4 張圖片')
    .optional()
    .default([]),
});

export type CreateReplyInput = z.infer<typeof createReplySchema>;
