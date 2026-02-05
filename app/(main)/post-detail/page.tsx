'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /post-detail 無 postId 時導向首頁
 */
export default function PostDetailIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
