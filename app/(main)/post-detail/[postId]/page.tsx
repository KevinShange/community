'use client';

import { useParams, useRouter } from 'next/navigation';
import TopNavigation from '../../../components/TopNavigation';
import ContentWithLinks from '../../../components/ContentWithLinks';
import PostMenuDropdown from '../../../components/PostMenuDropdown';
import PostImages from '../../../components/PostImages';
import ReplyComposer from '../../../components/ReplyComposer';
import CommentList from '../../../components/CommentList';
import { usePostStore } from '@/store/usePostStore';
import { useUserStore } from '@/store/useUserStore';

function formatTime(dateString: string | Date) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds}秒前`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分鐘前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小時前`;
  return `${Math.floor(diffInSeconds / 86400)}天前`;
}

function formatDateTime(dateString: string | Date) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ' · ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.postId as string | undefined;
  const { posts, toggleLike, toggleRetweet, deletePost } = usePostStore();
  const { currentUser } = useUserStore();

  const post = postId ? posts.find((p) => String(p.id) === String(postId)) : null;

  if (!postId) {
    router.replace('/');
    return null;
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <TopNavigation variant="post-detail" title="Post" onBack={() => router.back()} />
        <div className="px-4 py-12 text-center text-gray-500">
          找不到該文章，或已被刪除。
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopNavigation variant="post-detail" title="Post" onBack={() => router.back()} />

      {/* 主文章 */}
      <article className="px-4 py-6 border-b border-gray-800">
        <div className="flex items-start gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
          />
          <div className="flex-1 min-w-0">
            {post.retweetedBy && (
              <div className="flex items-center gap-2 mb-1 text-gray-500 text-[13px]">
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
                <button
                  type="button"
                  onClick={() => router.push(`/profile/${encodeURIComponent(post.retweetedBy!.handle)}`)}
                  className="hover:underline text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  {post.retweetedBy.name}
                </button>
                <span>轉發了</span>
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => router.push(`/profile/${encodeURIComponent(post.author.handle)}`)}
                className="font-bold text-gray-100 text-[15px] hover:underline text-left cursor-pointer"
              >
                {post.author.name}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/profile/${encodeURIComponent(post.author.handle)}`)}
                className="text-gray-500 text-[15px] hover:underline hover:text-gray-300 text-left cursor-pointer"
              >
                {post.author.handle}
              </button>
              <span className="text-gray-500 text-[15px]">·</span>
              <span className="text-gray-500 text-[15px]">{formatTime(post.createdAt)}</span>
              <div className="ml-auto">
                <PostMenuDropdown
                  post={post}
                  currentUser={currentUser}
                  onToggleRetweet={toggleRetweet}
                  onDeletePost={deletePost}
                />
              </div>
            </div>
            <div className="mb-3">
              <p className="text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                <ContentWithLinks content={post.content} />
              </p>
              {post.imageUrls && post.imageUrls.length > 0 && (
                <div className="mt-2">
                  <PostImages imageUrls={post.imageUrls} maxHeight="320px" />
                </div>
              )}
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-500 text-[15px] mb-3">
                <span>{formatDateTime(post.createdAt)}</span>
                <span>·</span>
                <span className="font-bold text-gray-400">Views</span>
              </div>
              <div className="flex items-center gap-6 text-gray-500 text-[15px] mb-4 pb-4 border-b border-gray-800">
                <span><span className="font-bold text-gray-100">{post.retweetCount}</span> Reposts</span>
                <span>Quotes</span>
                <span><span className="font-bold text-gray-100">{post.likeCount > 1000 ? `${(post.likeCount / 1000).toFixed(1)}K` : post.likeCount}</span> Likes</span>
                <span>Bookmarks</span>
              </div>
            </div>
            <div className="flex items-center justify-between max-w-md">
              <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors cursor-pointer" type="button">
                <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">{post.replyCount}</span>
              </button>
              <button
                onClick={() => toggleRetweet(post.id)}
                className="flex items-center gap-2 group hover:text-green-500 transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-full transition-colors ${post.isRetweetedByMe ? 'bg-green-500/10' : 'group-hover:bg-green-500/10'}`}>
                  <svg className={`w-5 h-5 transition-colors ${post.isRetweetedByMe ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                  </svg>
                </div>
                <span className={`text-sm transition-colors ${post.isRetweetedByMe ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'}`}>
                  {post.retweetCount > 1000 ? `${(post.retweetCount / 1000).toFixed(1)}k` : post.retweetCount}
                </span>
              </button>
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-2 group hover:text-red-500 transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-full transition-colors ${post.isLikedByMe ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'}`}>
                  <svg className={`w-5 h-5 transition-colors ${post.isLikedByMe ? 'text-red-500 fill-red-500' : 'text-gray-500 group-hover:text-red-500'}`} fill={post.isLikedByMe ? 'currentColor' : 'none'} stroke={post.isLikedByMe ? 'none' : 'currentColor'} viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span className={`text-sm transition-colors ${post.isLikedByMe ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`}>
                  {post.likeCount > 1000 ? `${(post.likeCount / 1000).toFixed(1)}k` : post.likeCount}
                </span>
              </button>
              <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors cursor-pointer" type="button">
                <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* 留言框：與主頁發文框類似的 Reply 框 */}
      <ReplyComposer postId={post.id} />

      {/* 此文章的其他留言 */}
      <div className="divide-y divide-gray-800">
        <CommentList postId={post.id} comments={post.comments} />
      </div>
    </div>
  );
}
