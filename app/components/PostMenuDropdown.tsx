'use client';

import { useState, useRef, useEffect } from 'react';
import type { Post } from '@/types/models';
import type { Author } from '@/types/models';

interface PostMenuDropdownProps {
  post: Post;
  currentUser: Author | null;
  onToggleRetweet: (postId: string | number) => void;
  onDeletePost: (postId: string | number) => void;
  onClose?: () => void;
}

export default function PostMenuDropdown({
  post,
  currentUser,
  onToggleRetweet,
  onDeletePost,
}: PostMenuDropdownProps) {
  const [open, setOpen] = useState(false);
  const [authorIsFollowing, setAuthorIsFollowing] = useState<boolean | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOwnPost = currentUser && post.author.handle === currentUser.handle;

  // 點擊外部關閉
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // 開啟選單時，若非自己的貼文則取得發文者的 isFollowing
  useEffect(() => {
    if (!open || isOwnPost || !currentUser) return;
    setAuthorIsFollowing(null);
    fetch('/api/profile', {
      headers: {
        'x-user-handle': post.author.handle,
        'x-viewer-handle': currentUser.handle,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && typeof data.isFollowing === 'boolean' && setAuthorIsFollowing(data.isFollowing))
      .catch(() => setAuthorIsFollowing(false));
  }, [open, isOwnPost, currentUser, post.author.handle]);

  const handleToggleFollow = async () => {
    if (!currentUser || isOwnPost || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await fetch('/api/profile/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewer: { name: currentUser.name, avatar: currentUser.avatar, handle: currentUser.handle },
          targetHandle: post.author.handle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuthorIsFollowing(Boolean(data.isFollowing));
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRepost = () => {
    onToggleRetweet(post.id);
    setOpen(false);
  };

  const handleDelete = () => {
    onDeletePost(post.id);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 hover:bg-blue-500/10 rounded-full transition-colors group cursor-pointer"
        aria-label="更多選項"
      >
        <svg
          className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 py-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl z-50 min-w-[200px]"
          role="menu"
        >
          {!isOwnPost && (
            <>
              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={followLoading || authorIsFollowing === null}
                className="w-full px-4 py-3 text-left text-gray-100 hover:bg-gray-800 transition-colors text-[15px] font-medium rounded-lg mx-1 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                role="menuitem"
              >
                {followLoading ? '…' : authorIsFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button
                type="button"
                onClick={handleRepost}
                className="w-full px-4 py-3 text-left text-gray-100 hover:bg-gray-800 transition-colors text-[15px] font-medium rounded-lg mx-1 cursor-pointer"
                role="menuitem"
              >
                {post.isRetweetedByMe ? 'Undo Repost' : 'Repost post'}
              </button>
            </>
          )}
          {isOwnPost && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-800 transition-colors text-[15px] font-medium rounded-lg mx-1 cursor-pointer"
              role="menuitem"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
