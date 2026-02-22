'use client';

import { useEffect } from 'react';
import { getPusherClient, isPusherConfigured } from '@/lib/pusher-client';
import { useUserStore } from '@/store/useUserStore';
import { useMessagesUnreadStore } from '@/store/useMessagesUnreadStore';
import type { DirectMessageItem } from '@/types/models';

/**
 * 全域訂閱 user-messages 頻道：收到「對方發給我的」新 DM 時將左欄 Messages 未讀小圓點設為 true，
 * 不進 Messages 頁也會即時亮點。
 */
export default function MessagesUnreadPusher() {
  const { currentUser } = useUserStore();
  const { setHasUnread } = useMessagesUnreadStore();

  useEffect(() => {
    if (!currentUser?.handle || !isPusherConfigured()) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `user-messages-${currentUser.handle}`;
    const channel = pusher.subscribe(channelName);
    const myHandle = currentUser.handle;

    channel.bind('new-dm', (data: DirectMessageItem) => {
      // 只對「對方傳給我的」訊息亮未讀點；自己發出的不亮
      if (data.sender.handle !== myHandle) {
        setHasUnread(true);
      }
    });

    return () => {
      channel.unbind('new-dm');
      pusher.unsubscribe(channelName);
    };
  }, [currentUser?.handle, setHasUnread]);

  return null;
}
