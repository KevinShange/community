/**
 * 服務端 Pusher 實例（用於 API 觸發推播）
 * 使用 .env 的 PUSHER_SECRET、NEXT_PUBLIC_PUSHER_* 設定
 */
import Pusher from 'pusher';

const appId = process.env.NEXT_PUBLIC_PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

function createPusherServer(): Pusher | null {
  if (!appId || !key || !secret || !cluster) {
    return null;
  }
  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}

let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (pusherServer === null) {
    pusherServer = createPusherServer();
  }
  return pusherServer;
}

/** 推播到指定 channel，若 Pusher 未設定則靜默略過 */
export async function triggerPusher(
  channel: string,
  event: string,
  data: unknown
): Promise<void> {
  const pusher = getPusherServer();
  if (!pusher) return;
  try {
    await pusher.trigger(channel, event, data);
  } catch (err) {
    console.error('[Pusher] trigger error:', err);
  }
}
