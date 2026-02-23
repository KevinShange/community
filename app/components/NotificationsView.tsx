'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useNotificationsUnreadStore } from '@/store/useNotificationsUnreadStore';
import type { NotificationItem, NotificationType } from '@/types/models';

const TYPE_LABELS: Record<NotificationType, string> = {
  like: '按讚了你的貼文',
  repost: '轉發了你的貼文',
  reply: '回覆了你的貼文',
  follow: '追蹤了你',
};

function formatNotificationTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'like':
      return (
        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'repost':
      return (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'reply':
      return (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      );
    case 'follow':
      return (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
  }
}

function getHeaders(handle: string): HeadersInit {
  return { 'Content-Type': 'application/json', 'x-user-handle': handle };
}

export default function NotificationsView() {
  const { currentUser } = useUserStore();
  const { setHasUnread } = useNotificationsUnreadStore();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchList = useCallback(
    async (cursor?: string) => {
      if (!currentUser?.handle) return;
      const url = cursor
        ? `/api/notifications?cursor=${encodeURIComponent(cursor)}`
        : '/api/notifications';
      const res = await fetch(url, { headers: getHeaders(currentUser.handle) });
      if (!res.ok) return;
      const data = (await res.json()) as { items: NotificationItem[]; nextCursor: string | null };
      if (cursor) {
        setItems((prev) => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
      setNextCursor(data.nextCursor);
    },
    [currentUser?.handle]
  );

  useEffect(() => {
    if (!currentUser?.handle) return;
    setLoading(true);
    fetchList().finally(() => setLoading(false));
  }, [currentUser?.handle, fetchList]);

  // 進入頁面即標記已讀，並清除左欄小圓點
  useEffect(() => {
    if (!currentUser?.handle) return;
    fetch('/api/notifications/read', {
      method: 'POST',
      headers: getHeaders(currentUser.handle),
    })
      .then((res) => res.ok && setHasUnread(false))
      .catch(() => {});
  }, [currentUser?.handle, setHasUnread]);

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-950 text-gray-100">
      {/* 頂部：標題 + 齒輪 */}
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <h1 className="text-xl font-bold text-gray-100 truncate min-w-0">Notifications</h1>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-800 flex-shrink-0"
            aria-label="Manage notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        {/* 子頁籤：只實作 All */}
        <div className="flex">
          <button
            type="button"
            className="flex-1 relative py-3 cursor-default"
            aria-current="page"
          >
            <span className="text-[15px] font-bold text-gray-100">All</span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          </button>
          <button
            type="button"
            className="flex-1 relative py-3 cursor-default"
            aria-disabled
          >
            <span className="text-[15px] text-gray-500">Mentions</span>
          </button>
        </div>
      </div>

      {/* 通知列表 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-gray-500">載入中...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm">尚無通知。</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {items.map((n) => {
              const content = (
                <>
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-100 text-[15px]">
                      <span className="font-semibold hover:underline">
                        {n.actor.name}
                      </span>{' '}
                      <span className="text-gray-500">{TYPE_LABELS[n.type]}</span>
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">@{n.actor.handle}</p>
                  </div>
                  <div className="flex-shrink-0 text-gray-500 text-sm">
                    {formatNotificationTime(n.createdAt)}
                  </div>
                </>
              );
              const className =
                'flex items-start gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors text-left w-full';
              if (n.postId) {
                return (
                  <Link
                    key={n.id}
                    href={`/post-detail/${n.postId}`}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              }
              if (n.type === 'follow') {
                return (
                  <Link
                    key={n.id}
                    href={`/profile/${encodeURIComponent(n.actor.handle)}`}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              }
              return (
                <div key={n.id} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        )}
        {nextCursor && !loading && (
          <div className="p-4 flex justify-center">
            <button
              type="button"
              onClick={() => fetchList(nextCursor)}
              className="text-sm text-blue-400 hover:underline"
            >
              載入更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
