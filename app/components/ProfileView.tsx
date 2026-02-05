'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopNavigation from './TopNavigation';
import ContentWithLinks from './ContentWithLinks';
import EditProfileModal from './EditProfileModal';
import PostMenuDropdown from './PostMenuDropdown';
import { useUserStore } from '@/store/useUserStore';
import { usePostStore } from '@/store/usePostStore';
import type { Post, Author } from '@/types/models';

// 假資料：地點（追蹤數改為實際資料）
const FAKE_LOCATION = 'San Francisco, CA';

interface ProfileData {
  name: string;
  bio: string;
  birthday: string | null;
  coverImage: string | null;
  joinedAt: string;
  avatar: string | null;
  followingCount: number;
  followersCount: number;
  /** 目前登入者是否已追蹤此使用者（僅在查看他人 Profile 時有意義） */
  isFollowing: boolean;
}

function getProfileHeaders(handle: string, viewerHandle?: string | null): HeadersInit {
  const h: HeadersInit = { 'x-user-handle': handle };
  if (viewerHandle) {
    // 額外告訴後端目前查看者是誰，用於判斷是否已追蹤
    (h as Record<string, string>)['x-viewer-handle'] = viewerHandle;
  }
  return h;
}

function formatJoinedAt(iso: string): string {
  const d = new Date(iso);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `Joined ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatBirthdayDisplay(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}

// 貼文假資料：轉發數、瀏覽量（用於 Profile 卡片顯示）
function getFakeRetweetCount(_postId: string | number) {
  return 12;
}
function getFakeViewCount(_postId: string | number) {
  return '12k';
}

function formatTime(dateString: string | Date) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
}

type ProfileTab = 'posts' | 'replies' | 'highlights' | 'likes';

interface ProfileViewProps {
  /**
   * 要查看的使用者 handle（例如 "@sarahchen"）
   * 不傳時表示顯示目前登入使用者
   */
  viewedHandle?: string;
}

export default function ProfileView({ viewedHandle }: ProfileViewProps) {
  const { currentUser: loggedInUser, setCurrentUser } = useUserStore();
  const { posts, toggleLike, toggleRetweet, deletePost } = usePostStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  /** 該 Profile 的貼文（發文 + 轉發），由 /api/posts?profile=handle 取得 */
  const [profilePosts, setProfilePosts] = useState<Post[] | null>(null);

  // 目前正在查看的 handle（若未指定則為登入者）
  const effectiveHandle = viewedHandle ?? loggedInUser?.handle ?? '';
  const isSelfProfile = !viewedHandle || (loggedInUser?.handle && loggedInUser.handle === viewedHandle);

  const fetchProfile = useCallback(async () => {
    if (!effectiveHandle) {
      setProfileData(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch('/api/profile', {
        headers: getProfileHeaders(effectiveHandle, loggedInUser?.handle ?? null),
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name ?? (isSelfProfile ? loggedInUser?.name ?? '' : effectiveHandle),
          bio: data.bio ?? '',
          birthday: data.birthday ?? null,
          coverImage: data.coverImage ?? null,
          joinedAt: data.joinedAt ?? new Date().toISOString(),
          avatar: data.avatar ?? null,
          followingCount: typeof data.followingCount === 'number' ? data.followingCount : 0,
          followersCount: typeof data.followersCount === 'number' ? data.followersCount : 0,
          isFollowing: Boolean(data.isFollowing),
        });
      } else {
        setProfileData(null);
      }
    } catch {
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  }, [effectiveHandle, isSelfProfile, loggedInUser?.handle, loggedInUser?.name]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 取得該 Profile 的貼文（發文 + 轉發）
  useEffect(() => {
    if (!effectiveHandle) {
      setProfilePosts(null);
      return;
    }
    const headers: HeadersInit = {};
    if (loggedInUser?.handle) {
      headers['x-user-handle'] = loggedInUser.handle;
    }
    fetch(`/api/posts?profile=${encodeURIComponent(effectiveHandle)}`, { headers })
      .then((res) => res.json())
      .then((data: Post[]) => setProfilePosts(Array.isArray(data) ? data : []))
      .catch(() => setProfilePosts([]));
  }, [effectiveHandle, loggedInUser?.handle]);

  // 依目前正在查看的 handle 過濾貼文（fallback，當 profile API 未用時）
  const userPosts = effectiveHandle ? posts.filter((p) => p.author.handle === effectiveHandle) : [];
  const displayPosts = profilePosts ?? userPosts;
  const likedPosts = loggedInUser ? posts.filter((p) => p.isLikedByMe) : [];
  const postCount = displayPosts.length;

  // 若換成查看別人且目前 Tab 在 Likes，上方規則要求不顯示 Likes，因此強制切回 Posts
  useEffect(() => {
    if (!isSelfProfile && activeTab === 'likes') {
      setActiveTab('posts');
    }
  }, [isSelfProfile, activeTab]);

  if (!loggedInUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <p>請先登入以查看個人檔案</p>
      </div>
    );
  }

  const tabs: { key: ProfileTab; label: string }[] = isSelfProfile
    ? [
        { key: 'posts', label: 'Posts' },
        { key: 'replies', label: 'Replies' },
        { key: 'highlights', label: 'Highlights' },
        { key: 'likes', label: 'Likes' },
      ]
    : [
        { key: 'posts', label: 'Posts' },
        { key: 'replies', label: 'Replies' },
        { key: 'highlights', label: 'Highlights' },
      ];

  const firstAuthor = userPosts[0]?.author;

  const displayName =
    profileData?.name ??
    firstAuthor?.name ??
    (isSelfProfile ? loggedInUser.name : effectiveHandle || loggedInUser.name) ??
    effectiveHandle ??
    'User';

  const displayHandle =
    effectiveHandle || firstAuthor?.handle || loggedInUser.handle || '';

  const displayAvatar =
    profileData?.avatar ??
    firstAuthor?.avatar ??
    (isSelfProfile ? loggedInUser.avatar : loggedInUser.avatar) ??
    '';

  const displayFollowingCount =
    typeof profileData?.followingCount === 'number' ? profileData.followingCount : 0;
  const displayFollowersCount =
    typeof profileData?.followersCount === 'number' ? profileData.followersCount : 0;

  const isFollowing = !isSelfProfile && profileData ? profileData.isFollowing : false;

  const handleToggleFollow = async () => {
    if (isSelfProfile || !loggedInUser || !effectiveHandle || followLoading) return;
    try {
      setFollowLoading(true);
      const res = await fetch('/api/profile/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          viewer: {
            name: loggedInUser.name,
            avatar: loggedInUser.avatar,
            handle: loggedInUser.handle,
          },
          targetHandle: effectiveHandle,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: Boolean(data.isFollowing),
              followingCount:
                typeof data.followingCount === 'number' ? data.followingCount : prev.followingCount,
              followersCount:
                typeof data.followersCount === 'number' ? data.followersCount : prev.followersCount,
            }
          : prev,
      );
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <TopNavigation variant="profile" title={String(displayName)} subtitle={`${postCount} Posts`} />

      {/* 封面與頭像 */}
      <div className="relative">
        <div
          className="h-48 w-full bg-gray-800 bg-cover bg-center"
          style={{
            backgroundImage: profileData?.coverImage
              ? `url(${profileData.coverImage})`
              : 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80)',
          }}
        />
        <div className="absolute -bottom-16 left-4">
          <img
            src={displayAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={String(displayName)}
            className="w-32 h-32 rounded-full border-4 border-gray-950 object-cover"
          />
        </div>
        <div className="absolute top-4 right-4">
          {isSelfProfile ? (
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-full border border-gray-600 text-gray-100 font-bold text-[15px] hover:bg-gray-800 transition-colors"
            >
              Edit profile
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleFollow}
              disabled={followLoading}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-900 font-bold text-[15px] hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isFollowing ? '已 follow' : '尚未 follow'}
            </button>
          )}
        </div>
      </div>

      {/* 使用者資訊區 */}
      <div className="pt-20 px-4 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-100">
            {String(profileLoading ? displayName : profileData?.name ?? displayName)}
          </h2>
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-4-4-4-.47 0-.92.08-1.34.23C14.2 2.92 13.36 2 12 2s-2.2.92-2.66 2.23c-.42-.15-.87-.23-1.34-.23-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4-1.272.65-2.147 2.02-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 4 4 .21 0 .41-.03.61-.08-.32.62-.73 1.19-1.17 1.72-.94 1.07-2.12 1.9-3.44 2.44-1.32.54-2.72.84-4.16.84-1.44 0-2.84-.3-4.16-.84-1.32-.54-2.5-1.37-3.44-2.44-.44-.53-.85-1.1-1.17-1.72-.2.05-.4.08-.61.08-2.21 0-4-1.79-4-4 0-.174.012-.344.032-.514C2.782 15.298 2 13.995 2 12.5c0-1.58.875-2.95 2.148-3.6-.154-.435-.238-.905-.238-1.4 0-2.21 1.71-4 4-4 .47 0 .92.08 1.34.23C7.8 2.92 8.64 2 10 2s2.2.92 2.66 2.23c.42-.15.87-.23 1.34-.23 2.21 0 4 1.79 4 4 0 .495-.084.965-.238 1.4 1.272.65 2.147 2.02 2.147 3.6 0 1.495-.782 2.798-1.942 3.486.02.17.032.34.032.514 0 2.21-1.708 4-4 4-.21 0-.41-.03-.61-.08.32.62.73 1.19 1.17 1.72.94 1.07 2.12 1.9 3.44 2.44 1.32.54 2.72.84 4.16.84 1.44 0 2.84-.3 4.16-.84 1.32-.54 2.5-1.37 3.44-2.44.44-.53.85-1.1 1.17-1.72.2.05.4.08.61.08 2.21 0 4-1.79 4-4 0-.174-.012-.344-.032-.514 1.16-.688 1.942-1.991 1.942-3.486z" />
          </svg>
        </div>
        <p className="text-gray-500 text-[15px] mt-0.5">{displayHandle || effectiveHandle || '—'}</p>
        <p className="text-gray-100 text-[15px] mt-3 whitespace-pre-wrap leading-relaxed">
          {profileLoading ? '…' : profileData?.bio ?? ''}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-gray-500 text-[15px]">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {FAKE_LOCATION}
          </span>
          {profileData?.joinedAt && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatJoinedAt(profileData.joinedAt)}
            </span>
          )}
          {profileData?.birthday && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatBirthdayDisplay(profileData.birthday)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-gray-100 text-[15px]">
            <strong className="text-gray-100">{displayFollowingCount.toLocaleString()}</strong>
            <span className="text-gray-500 ml-1">Following</span>
          </span>
          <span className="text-gray-100 text-[15px]">
            <strong className="text-gray-100">{displayFollowersCount.toLocaleString()}</strong>
            <span className="text-gray-500 ml-1">Followers</span>
          </span>
        </div>
      </div>

      {/* 標籤列 */}
      <div className="border-b border-gray-800">
        <div className="flex">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 py-4 relative text-[15px] font-medium transition-colors hover:bg-gray-900/50"
            >
              <span className={activeTab === key ? 'text-gray-100' : 'text-gray-500'}>{label}</span>
              {activeTab === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* 貼文列表：Posts 為該使用者的貼文與轉發，自身 Profile 額外有 Likes 分頁 */}
      <div className="divide-y divide-gray-800">
        {activeTab === 'posts' &&
          displayPosts.map((post) => (
            <ProfilePostCard
              key={post.retweetedBy ? `${post.id}-${post.retweetedBy.handle}-${post.retweetedAt ?? ''}` : post.id}
              post={post}
              currentUser={loggedInUser}
              onToggleLike={() => toggleLike(post.id)}
              onToggleRetweet={() => toggleRetweet(post.id)}
              onDeletePost={deletePost}
              formatTime={formatTime}
              onGoToProfile={(handle) => router.push(`/profile/${encodeURIComponent(handle)}`)}
              onGoToPost={(id) => router.push(`/post-detail/${id}`)}
            />
          ))}
        {activeTab === 'posts' && displayPosts.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500 text-[15px]">尚無貼文</div>
        )}
        {isSelfProfile && activeTab === 'likes' &&
          likedPosts.map((post) => (
            <ProfilePostCard
              key={post.id}
              post={post}
              currentUser={loggedInUser}
              onToggleLike={() => toggleLike(post.id)}
              onToggleRetweet={() => toggleRetweet(post.id)}
              onDeletePost={deletePost}
              formatTime={formatTime}
              onGoToProfile={(handle) => router.push(`/profile/${encodeURIComponent(handle)}`)}
              onGoToPost={(id) => router.push(`/post-detail/${id}`)}
            />
          ))}
        {isSelfProfile && activeTab === 'likes' && likedPosts.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500 text-[15px]">尚無喜歡的貼文</div>
        )}
        {(activeTab === 'replies' || activeTab === 'highlights') && (
          <div className="px-4 py-12 text-center text-gray-500 text-[15px]">此標籤內容尚未實作</div>
        )}
      </div>

      {isSelfProfile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialValues={{
            name: profileData?.name ?? loggedInUser.name,
            bio: profileData?.bio ?? '',
            birthday: profileData?.birthday ?? '',
          }}
          userHandle={loggedInUser.handle}
          onSuccess={(updated) => {
            setProfileData((prev) =>
              prev
                ? {
                    ...prev,
                    name: updated.name,
                    bio: updated.bio,
                    birthday: updated.birthday,
                  }
                : {
                    name: updated.name,
                    bio: updated.bio,
                    birthday: updated.birthday,
                    coverImage: null,
                    joinedAt: new Date().toISOString(),
                    avatar: loggedInUser.avatar ?? null,
                  },
            );
            setCurrentUser({ ...loggedInUser, name: updated.name });
          }}
        />
      )}
    </div>
  );
}

function ProfilePostCard({
  post,
  currentUser,
  onToggleLike,
  onToggleRetweet,
  onDeletePost,
  formatTime,
  onGoToProfile,
  onGoToPost,
}: {
  post: Post;
  currentUser: Author | null;
  onToggleLike: () => void;
  onToggleRetweet: () => void;
  onDeletePost: (postId: string | number) => void;
  formatTime: (d: string | Date) => string;
  onGoToProfile: (handle: string) => void;
  onGoToPost: (postId: string | number) => void;
}) {
  const fakeViews = getFakeViewCount(post.id);

  return (
    <article className="px-4 py-6 hover:bg-gray-950/50 transition-colors">
      <div className="flex items-start gap-3">
        <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full flex-shrink-0 object-cover" />
        <div className="flex-1 min-w-0">
          {/* 轉發標示：該使用者轉發的貼文 */}
          {post.retweetedBy && (
            <div className="flex items-center gap-2 mb-1 text-gray-500 text-[13px]">
              <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
              </svg>
              <button
                type="button"
                onClick={() => onGoToProfile(post.retweetedBy!.handle)}
                className="hover:underline text-gray-500 hover:text-gray-300"
              >
                {post.retweetedBy.name}
              </button>
              <span>轉發了</span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => onGoToProfile(post.author.handle)}
              className="font-bold text-gray-100 text-[15px] hover:underline text-left"
            >
              {post.author.name}
            </button>
            <button
              type="button"
              onClick={() => onGoToProfile(post.author.handle)}
              className="text-gray-500 text-[15px] hover:underline hover:text-gray-300"
            >
              {post.author.handle}
            </button>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-[15px]">{formatTime(post.createdAt)}</span>
            <div className="ml-auto">
              <PostMenuDropdown
                post={post}
                currentUser={currentUser}
                onToggleRetweet={onToggleRetweet}
                onDeletePost={onDeletePost}
              />
            </div>
          </div>
          {/* 點選內容轉跳至 Post 頁面 */}
          <button
            type="button"
            className="w-full text-left mb-3"
            onClick={() => onGoToPost(post.id)}
          >
            <p className="text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              <ContentWithLinks content={post.content} />
            </p>
          </button>
          {/* 操作列：阻止點擊冒泡 */}
          <div className="flex items-center justify-between max-w-md mt-4" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onGoToPost(post.id)}
              className="flex items-center gap-2 group hover:text-blue-500 transition-colors"
            >
              <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500 group-hover:text-blue-500">{post.replyCount}</span>
            </button>
            <button
              onClick={onToggleRetweet}
              className="flex items-center gap-2 group hover:text-green-500 transition-colors"
            >
              <span className={`text-sm transition-colors ${post.isRetweetedByMe ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'}`}>RETWEET</span>
              <div className={`p-2 rounded-full transition-colors ${post.isRetweetedByMe ? 'bg-green-500/10' : 'group-hover:bg-green-500/10'}`}>
                <svg
                  className={`w-5 h-5 transition-colors ${post.isRetweetedByMe ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                </svg>
              </div>
              <span className={`text-sm transition-colors ${post.isRetweetedByMe ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'}`}>
                {post.retweetCount > 1000 ? `${(post.retweetCount / 1000).toFixed(1)}k` : post.retweetCount}
              </span>
            </button>
            <button onClick={onToggleLike} className="flex items-center gap-2 group hover:text-red-500 transition-colors">
              <div
                className={`p-2 rounded-full transition-colors ${
                  post.isLikedByMe ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'
                }`}
              >
                <svg
                  className={`w-5 h-5 transition-colors ${
                    post.isLikedByMe ? 'text-red-500 fill-red-500' : 'text-gray-500 group-hover:text-red-500'
                  }`}
                  fill={post.isLikedByMe ? 'currentColor' : 'none'}
                  stroke={post.isLikedByMe ? 'none' : 'currentColor'}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <span
                className={`text-sm transition-colors ${
                  post.isLikedByMe ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'
                }`}
              >
                {post.likeCount > 1000 ? `${(post.likeCount / 1000).toFixed(1)}k` : post.likeCount}
              </span>
            </button>
            <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors" type="button">
              <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500 group-hover:text-blue-500">{fakeViews}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

