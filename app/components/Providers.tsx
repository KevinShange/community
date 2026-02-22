'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { PostStoreProvider } from '@/store/usePostStore';
import { UserStoreProvider } from '@/store/useUserStore';
import { MessagesUnreadProvider } from '@/store/useMessagesUnreadStore';
import SessionSync from './SessionSync';
import PusherSubscriber from './PusherSubscriber';
import MessagesUnreadPusher from './MessagesUnreadPusher';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserStoreProvider>
        <MessagesUnreadProvider>
          <SessionSync />
          <MessagesUnreadPusher />
          <PostStoreProvider>
            <PusherSubscriber />
            {children}
          </PostStoreProvider>
        </MessagesUnreadProvider>
      </UserStoreProvider>
    </SessionProvider>
  );
}
