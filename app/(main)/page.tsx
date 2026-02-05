'use client';

import TopNavigation from '../components/TopNavigation';
import PostComposer from '../components/PostComposer';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import ContentWithLinks from '../components/ContentWithLinks';
import { usePostStore } from '@/store/usePostStore';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { posts, feed, toggleLike } = usePostStore();
  const router = useRouter();

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
  return (
    <div className="min-h-screen">
      <TopNavigation variant="home" />
      
      {/* 發布內容區域 */}
      <PostComposer />
      
      {/* 內容流 */}
      <div className="divide-y divide-gray-800">
        {feed === 'following' && posts.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500 text-[15px]">
            你關注的用戶尚未發文，或請先關注更多用戶以在此看到他們的動態。
          </div>
        )}
        {posts.map((post) => (
          <article key={post.id} className="px-4 py-6 hover:bg-gray-950/50 transition-colors">
            <div className="flex items-start gap-3">
              {/* 使用者頭像 */}
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
              />
              
              <div className="flex-1 min-w-0">
                {/* 使用者資訊 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-100 text-[15px]">{post.author.name}</span>
                  <button
                    type="button"
                    onClick={() => router.push(`/profile/${encodeURIComponent(post.author.handle)}`)}
                    className="text-gray-500 text-[15px] hover:underline hover:text-gray-300"
                  >
                    {post.author.handle}
                  </button>
                  <span className="text-gray-500 text-[15px]">·</span>
                  <span className="text-gray-500 text-[15px]">{formatTime(post.createdAt)}</span>
                  <div className="ml-auto">
                    <button className="p-1.5 hover:bg-blue-500/10 rounded-full transition-colors group">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* 內容 */}
                <div className="mb-3">
                  <p className="text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    <ContentWithLinks content={post.content} />
                  </p>
                </div>
                
                {/* 操作列 */}
                <div className="flex items-center justify-between max-w-md mt-4">
                  {/* 評論 */}
                  <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
                    <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">{post.replyCount}</span>
                  </button>
                  
                  {/* 轉發 */}
                  <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
                    <div className="p-2 group-hover:bg-green-500/10 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                      </svg>
                    </div>
                  </button>
                  
                  {/* 喜歡 */}
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-2 group hover:text-red-500 transition-colors"
                  >
                    <div className={`p-2 rounded-full transition-colors ${post.isLikedByMe ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'}`}>
                      <svg 
                        className={`w-5 h-5 transition-colors ${post.isLikedByMe ? 'text-red-500 fill-red-500' : 'text-gray-500 group-hover:text-red-500'}`} 
                        fill={post.isLikedByMe ? 'currentColor' : 'none'} 
                        stroke={post.isLikedByMe ? 'none' : 'currentColor'}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <span className={`text-sm transition-colors ${post.isLikedByMe ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`}>
                      {post.likeCount > 1000 ? `${(post.likeCount / 1000).toFixed(1)}k` : post.likeCount}
                    </span>
                  </button>
                  
                  {/* 分享 */}
                  <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
                    <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                      </svg>
                    </div>
                  </button>
                </div>
                
                {/* 留言列表 */}
                <CommentList postId={post.id} comments={post.comments} />
                
                {/* 留言輸入框 */}
                <CommentForm postId={post.id} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
