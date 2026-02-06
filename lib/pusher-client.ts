'use client';

/**
 * 瀏覽器端 Pusher 客戶端（用於訂閱即時事件）
 * 僅在客戶端執行，使用 NEXT_PUBLIC_PUSHER_* 環境變數
 */
import Pusher from 'pusher-js';

const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (typeof window === 'undefined') return null;
  if (!key || !cluster) return null;
  if (!pusherClient) {
    pusherClient = new Pusher(key, {
      cluster,
      forceTLS: true,
    });
  }
  return pusherClient;
}

export function isPusherConfigured(): boolean {
  return Boolean(key && cluster);
}
