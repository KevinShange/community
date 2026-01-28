import TopNavigation from '../../components/TopNavigation';

// 主贴文假资料
const mainPost = {
  id: 1,
  author: 'Jordan Smith',
  username: '@jsmith_ux',
  verified: true,
  time: '10:24 AM · Oct 24, 2023',
  views: '12.5K',
  content: 'Just launched the new design system for our workspace app! Focused on high contrast, better typography, and a "less is more" philosophy. What do you think about the new interaction patterns? 🚀✨',
  stats: {
    reposts: 142,
    quotes: 32,
    likes: 2800,
    bookmarks: 45
  }
};

// 回复假资料
const replies = [
  {
    id: 1,
    author: 'Elena Chen',
    username: '@elenachen',
    time: '2h',
    content: 'The typography choice is excellent. The Plus Jakarta Sans really shines in this context. Clean and modern!',
    stats: {
      comments: 3,
      reposts: 12,
      likes: 89,
      views: 450
    },
    liked: false
  },
  {
    id: 2,
    author: 'Marcus Web',
    username: '@m_webb',
    time: '1h',
    content: 'Love the "less is more" approach! The high contrast really improves readability. Can\'t wait to see more updates.',
    stats: {
      comments: 1,
      reposts: 5,
      likes: 156,
      views: 320
    },
    liked: true
  },
  {
    id: 3,
    author: 'Sarah Lee',
    username: '@sarahlee_ux',
    time: '45m',
    content: 'The interaction patterns are intuitive. Great work on the spacing and micro-interactions!',
    stats: {
      comments: 0,
      reposts: 8,
      likes: 67,
      views: 210
    },
    liked: false
  },
  {
    id: 4,
    author: 'Design Pro',
    username: '@designpro',
    time: '30m',
    content: 'This is exactly what we need. The design system looks cohesive and well-thought-out. Congratulations!',
    stats: {
      comments: 2,
      reposts: 15,
      likes: 234,
      views: 580
    },
    liked: true
  },
  {
    id: 5,
    author: 'UI Master',
    username: '@uimaster',
    time: '15m',
    content: 'The contrast improvements are noticeable. Great attention to accessibility!',
    stats: {
      comments: 1,
      reposts: 4,
      likes: 45,
      views: 180
    },
    liked: false
  }
];

export default function PostDetail() {
  return (
    <div className="min-h-screen">
      <TopNavigation variant="post-detail" title="Post" />
      
      {/* 主贴文区域 */}
      <article className="px-4 py-6 border-b border-gray-800">
        <div className="flex items-start gap-3">
          {/* 使用者头像 */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0"></div>
          
          <div className="flex-1 min-w-0">
            {/* 使用者资讯 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-gray-100 text-[15px]">{mainPost.author}</span>
              {mainPost.verified && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              )}
              <span className="text-gray-500 text-[15px]">{mainPost.username}</span>
              <div className="ml-auto">
                <button className="p-1.5 hover:bg-blue-500/10 rounded-full transition-colors group">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* 内容 */}
            <div className="mb-3">
              <p className="text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {mainPost.content}
              </p>
            </div>
            
            {/* 时间和浏览数 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-500 text-[15px] mb-3">
                <span>{mainPost.time}</span>
                <span>·</span>
                <span>{mainPost.views} Views</span>
              </div>
              
              {/* 详细统计 */}
              <div className="flex items-center gap-6 text-gray-500 text-[15px] mb-4 pb-4 border-b border-gray-800">
                <span>{mainPost.stats.reposts} Reposts</span>
                <span>{mainPost.stats.quotes} Quotes</span>
                <span>{mainPost.stats.likes > 1000 ? `${(mainPost.stats.likes / 1000).toFixed(1)}K` : mainPost.stats.likes} Likes</span>
                <span>{mainPost.stats.bookmarks} Bookmarks</span>
              </div>
            </div>
            
            {/* 操作列 */}
            <div className="flex items-center justify-between max-w-md">
              {/* 评论 */}
              <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
                <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
              </button>
              
              {/* 转发 */}
              <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
                <div className="p-2 group-hover:bg-green-500/10 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                </div>
              </button>
              
              {/* 喜欢 */}
              <button className="flex items-center gap-2 group hover:text-red-500 transition-colors">
                <div className="p-2 group-hover:bg-red-500/10 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
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
          </div>
        </div>
      </article>

      {/* 回复输入区 */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-start gap-3">
          {/* 当前用户头像 */}
          <div className="w-10 h-10 bg-amber-700 rounded-full flex-shrink-0"></div>
          
          <div className="flex-1 min-w-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Post your reply"
                className="w-full py-3 px-4 bg-transparent text-gray-100 placeholder:text-gray-500 focus:outline-none text-[15px]"
              />
            </div>
            
            {/* 附件图标 */}
            <div className="flex items-center gap-4 mt-3 mb-3">
              {/* 图片 */}
              <button className="p-2 hover:bg-blue-500/10 rounded-full transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </button>
              {/* GIF */}
              <button className="p-2 hover:bg-blue-500/10 rounded-full transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9.5 13v-1h1v1c0 .55-.45 1-1 1s-1-.45-1-1v-3c0-.55.45-1 1-1s1 .45 1 1v.5h1V9c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1v-.5h-1V13zm5-1v.5h1v1h-1v1h-1v-1h-1v-1h1v-.5h1zm1-2h-1v4h1v-4z"/>
                </svg>
              </button>
              {/* 图表/投票 */}
              <button className="p-2 hover:bg-blue-500/10 rounded-full transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </button>
              {/* 表情符号 */}
              <button className="p-2 hover:bg-blue-500/10 rounded-full transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"/>
                  <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor"/>
                  <path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            
            {/* Reply 按钮 */}
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-colors">
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 回复列表 */}
      <div className="divide-y divide-gray-800">
        {replies.map((reply) => (
          <article key={reply.id} className="px-4 py-6 hover:bg-gray-950/50 transition-colors">
            <div className="flex items-start gap-3">
              {/* 使用者头像 */}
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex-shrink-0"></div>
              
              <div className="flex-1 min-w-0">
                {/* 使用者资讯 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-100 text-[15px]">{reply.author}</span>
                  <span className="text-gray-500 text-[15px]">{reply.username}</span>
                  <span className="text-gray-500 text-[15px]">·</span>
                  <span className="text-gray-500 text-[15px]">{reply.time}</span>
                  <div className="ml-auto">
                    <button className="p-1.5 hover:bg-blue-500/10 rounded-full transition-colors group">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* 内容 */}
                <div className="mb-3">
                  <p className="text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {reply.content}
                  </p>
                </div>
                
                {/* 操作列 */}
                <div className="flex items-center justify-between max-w-md mt-4">
                  {/* 评论 */}
                  <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
                    <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </div>
                    {reply.stats.comments > 0 && (
                      <span className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">{reply.stats.comments}</span>
                    )}
                  </button>
                  
                  {/* 转发 */}
                  <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
                    <div className="p-2 group-hover:bg-green-500/10 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                      </svg>
                    </div>
                    {reply.stats.reposts > 0 && (
                      <span className="text-sm text-gray-500 group-hover:text-green-500 transition-colors">{reply.stats.reposts}</span>
                    )}
                  </button>
                  
                  {/* 喜欢 */}
                  <button className="flex items-center gap-2 group hover:text-red-500 transition-colors">
                    <div className="p-2 group-hover:bg-red-500/10 rounded-full transition-colors">
                      <svg className={`w-5 h-5 transition-colors ${reply.liked ? 'text-red-500 fill-red-500' : 'text-gray-500 group-hover:text-red-500'}`} fill={reply.liked ? 'currentColor' : 'none'} stroke={reply.liked ? 'none' : 'currentColor'} viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    {reply.stats.likes > 0 && (
                      <span className={`text-sm transition-colors ${reply.liked ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`}>{reply.stats.likes}</span>
                    )}
                  </button>
                  
                  {/* 浏览/统计 */}
                  <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
                    <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                    </div>
                    {reply.stats.views > 0 && (
                      <span className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">{reply.stats.views}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
