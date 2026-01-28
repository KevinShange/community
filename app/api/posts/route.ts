import { NextResponse } from 'next/server';
import { mockPosts } from '@/data/mockPosts';

/**
 * GET /api/posts
 * 回傳假資料貼文列表（不使用資料庫）
 */
export async function GET() {
  return NextResponse.json(mockPosts);
}
