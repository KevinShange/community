'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { PostStoreProvider } from '@/store/usePostStore';
import { UserStoreProvider } from '@/store/useUserStore';
import SessionSync from './SessionSync';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserStoreProvider>
        <SessionSync />
        <PostStoreProvider>
          {children}
        </PostStoreProvider>
      </UserStoreProvider>
    </SessionProvider>
  );
}
