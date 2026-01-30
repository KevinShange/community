'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store/useUserStore';
import type { Author } from '@/types/models';

/**
 * 將 NextAuth session 同步到 useUserStore，讓既有元件沿用 Author 型別與 isLoggedIn。
 */
export default function SessionSync() {
  const { data: session, status } = useSession();
  const { setCurrentUser } = useUserStore();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      setCurrentUser(null);
      return;
    }
    const u = session.user;
    const author: Author = {
      name: u.name ?? 'User',
      avatar: (u.image as string) ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
      handle: (u as { handle?: string }).handle ?? `@${(u.email ?? u.id).toString().split('@')[0]}`,
      loginType: (u as { loginType?: Author['loginType'] }).loginType ?? 'email',
      email: u.email ?? undefined,
    };
    setCurrentUser(author);
  }, [session, status, setCurrentUser]);

  return null;
}
