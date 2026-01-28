'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * 保護需登入的頁面：未登入時導向 /login
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isLoggedIn } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}
