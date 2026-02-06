'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { PostStoreProvider } from '@/store/usePostStore';
import { UserStoreProvider } from '@/store/useUserStore';
import SessionSync from './SessionSync';
import PusherSubscriber from './PusherSubscriber';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserStoreProvider>
        <SessionSync />
        <PostStoreProvider>
          <PusherSubscriber />
          {children}
        </PostStoreProvider>
      </UserStoreProvider>
    </SessionProvider>
  );
}
