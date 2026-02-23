'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { PostStoreProvider } from '@/store/usePostStore';
import { UserStoreProvider } from '@/store/useUserStore';
import { MessagesUnreadProvider } from '@/store/useMessagesUnreadStore';
import { NotificationsUnreadProvider } from '@/store/useNotificationsUnreadStore';
import SessionSync from './SessionSync';
import PusherSubscriber from './PusherSubscriber';
import MessagesUnreadPusher from './MessagesUnreadPusher';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserStoreProvider>
        <MessagesUnreadProvider>
          <NotificationsUnreadProvider>
          <SessionSync />
          <MessagesUnreadPusher />
          <PostStoreProvider>
            <PusherSubscriber />
            {children}
          </PostStoreProvider>
          </NotificationsUnreadProvider>
        </MessagesUnreadProvider>
      </UserStoreProvider>
    </SessionProvider>
  );
}
