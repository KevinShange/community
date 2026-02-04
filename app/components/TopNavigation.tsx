'use client';

import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';

interface TopNavigationProps {
  variant?: 'home' | 'post-detail' | 'profile';
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function TopNavigation({ 
  variant = 'home',
  title,
  subtitle,
  onBack 
}: TopNavigationProps) {
  const { currentUser } = useUserStore();

  if (variant === 'profile') {
    return (
      <div className="sticky top-0 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="返回"
          >
            <svg
              className="w-5 h-5 text-gray-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold text-gray-100 truncate">{title}</h1>
            {subtitle && (
              <span className="text-sm text-gray-500">{subtitle}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'post-detail') {
    return (
      <div className="sticky top-0 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              aria-label="返回"
            >
              <svg
                className="w-5 h-5 text-gray-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {title && (
              <h1 className="text-xl font-bold text-gray-100">{title}</h1>
            )}
          </div>
          <button
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="搜索"
          >
            <svg
              className="w-5 h-5 text-gray-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Home variant：email 登入顯示衍生名稱，OAuth 登入顯示名稱 (網址)
  const displayTitle = currentUser
    ? currentUser.loginType === 'oauth' && currentUser.handle?.startsWith('http')
      ? `${currentUser.name} (${currentUser.handle}) 的動態`
      : `${currentUser.name} 的動態`
    : 'Home';

  return (
    <div className="sticky top-0 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 z-10">
      <div className="px-4">
        <div className="flex items-center justify-between gap-2 py-4">
          <h1 className="text-xl font-bold text-gray-100 truncate min-w-0" title={displayTitle}>
            {displayTitle}
          </h1>
        </div>
        <div className="flex">
          <button className="flex-1 relative py-3 group">
            <span className="font-bold text-gray-100 text-[15px]">For You</span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></span>
          </button>
          <button className="flex-1 py-3 group">
            <span className="text-gray-500 group-hover:text-gray-300 transition-colors text-[15px]">
              Following
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
