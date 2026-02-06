'use client';

import type { Comment } from '@/types/models';
import { useRouter } from 'next/navigation';
import { usePostStore } from '@/store/usePostStore';
import ContentWithLinks from './ContentWithLinks';
import PostImages from './PostImages';

interface CommentListProps {
  postId: string | number;
  comments: Comment[];
}

export default function CommentList({ postId, comments }: CommentListProps) {
  const router = useRouter();
  const { toggleCommentLike } = usePostStore();

  const goToProfile = (handle: string) => {
    router.push(`/profile/${encodeURIComponent(handle)}`);
  };

  // 格式化時間顯示
  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}秒前`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分鐘前`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}小時前`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}天前`;
    }
  };

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          {/* 使用者頭像 */}
          <img 
            src={comment.author.avatar} 
            alt={comment.author.name}
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
          />
          
          <div className="flex-1 min-w-0">
            {/* 使用者資訊：名稱與 handle 可點擊前往該使用者 Profile */}
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => goToProfile(comment.author.handle)}
                className="font-bold text-gray-100 text-[15px] hover:underline text-left"
              >
                {comment.author.name}
              </button>
              <button
                type="button"
                onClick={() => goToProfile(comment.author.handle)}
                className="text-gray-500 text-[15px] hover:underline hover:text-gray-300"
              >
                {comment.author.handle}
              </button>
              <span className="text-gray-500 text-[15px]">·</span>
              <span className="text-gray-500 text-[15px]">{formatTime(comment.createdAt)}</span>
            </div>
            
            {/* 留言內容 */}
            <div className="mb-2">
              <p className="text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                <ContentWithLinks content={comment.content} />
              </p>
              {comment.imageUrls && comment.imageUrls.length > 0 && (
                <div className="mt-2">
                  <PostImages imageUrls={comment.imageUrls} maxHeight="200px" />
                </div>
              )}
            </div>
            
            {/* 操作列：留言、轉發、喜歡 */}
            <div className="flex items-center gap-4">
              {/* 留言 */}
              <button
                type="button"
                className="flex items-center gap-1.5 group hover:text-blue-500 transition-colors"
                aria-label="留言"
              >
                <div className="p-1.5 rounded-full transition-colors group-hover:bg-blue-500/10">
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
              </button>
              {/* 轉發 */}
              <button
                type="button"
                className="flex items-center gap-1.5 group hover:text-green-500 transition-colors"
                aria-label="轉發"
              >
                <div className="p-1.5 rounded-full transition-colors group-hover:bg-green-500/10">
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                  </svg>
                </div>
              </button>
              {/* 喜歡 */}
              <button 
                onClick={() => toggleCommentLike(postId, comment.id)}
                className="flex items-center gap-1.5 group hover:text-red-500 transition-colors"
              >
                <div className={`p-1.5 rounded-full transition-colors ${comment.isLikedByMe ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'}`}>
                  <svg 
                    className={`w-4 h-4 transition-colors ${comment.isLikedByMe ? 'text-red-500 fill-red-500' : 'text-gray-500 group-hover:text-red-500'}`} 
                    fill={comment.isLikedByMe ? 'currentColor' : 'none'} 
                    stroke={comment.isLikedByMe ? 'none' : 'currentColor'}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                {comment.likeCount > 0 && (
                  <span className={`text-xs transition-colors ${comment.isLikedByMe ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`}>
                    {comment.likeCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
