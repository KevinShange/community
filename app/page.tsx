import TopNavigation from './components/TopNavigation';

// 假資料
const posts = [
  {
    id: 1,
    author: 'Design System',
    username: '@designsystem',
    time: '2h',
    content: 'Just launched our new design system! Check out the beautiful components and patterns we\'ve created. 🎨',
    image: true,
    imageUrl: '/api/placeholder/600/400',
    stats: { comments: 12, reposts: 45, likes: 1200, shares: 8 }
  },
  {
    id: 2,
    author: 'Sarah Chen',
    username: '@sarahchen',
    time: '4h',
    content: 'Working on some exciting new features for the platform. Can\'t wait to share them with everyone!',
    image: false,
    stats: { comments: 24, reposts: 82, likes: 562, shares: 15 }
  },
  {
    id: 3,
    author: 'Minimalist Daily',
    username: '@minimalistdaily',
    time: '6h',
    content: '"Simplicity is the ultimate sophistication." - Leonardo da Vinci',
    image: false,
    stats: { comments: 8, reposts: 312, likes: 941, shares: 42 }
  },
  {
    id: 4,
    author: 'Tech Trends',
    username: '@techtrends',
    time: '8h',
    content: 'The future of web development is looking brighter than ever. Here are the top 5 trends to watch in 2024.',
    image: true,
    imageUrl: '/api/placeholder/600/300',
    stats: { comments: 56, reposts: 128, likes: 2100, shares: 33 }
  },
  {
    id: 5,
    author: 'Creative Studio',
    username: '@creativestudio',
    time: '12h',
    content: 'New project reveal coming soon! Stay tuned for something special. ✨',
    image: false,
    stats: { comments: 18, reposts: 67, likes: 789, shares: 12 }
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <TopNavigation variant="home" />
      
      {/* 發布內容區域 */}
      <div className="px-4 pt-4 pb-5 border-b border-gray-800">
        <div className="flex gap-4">
          {/* 使用者頭像 */}
          <div className="w-12 h-12 bg-orange-400 rounded-full flex-shrink-0"></div>
          
          <div className="flex-1">
            {/* 輸入框 */}
            <div className="mb-4">
              <textarea
                placeholder="What's happening?"
                className="w-full bg-transparent text-gray-100 placeholder:text-gray-500 text-xl resize-none focus:outline-none min-h-[80px] leading-relaxed"
                rows={3}
              />
            </div>
            
            {/* 工具列和 Post 按鈕 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 圖片圖示 */}
                <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>
                  </svg>
                </button>
                
                {/* GIF 圖示 */}
                <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"/>
                  </svg>
                </button>
                
                {/* 投票圖示 */}
                <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </button>
                
                {/* 表情圖示 */}
                <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="15.5" cy="9.5" r="1.5"/>
                    <circle cx="8.5" cy="9.5" r="1.5"/>
                    <path d="M12 18c2.28 0 4.22-1.66 5-4H7c.78 2.34 2.72 4 5 4z"/>
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  </svg>
                </button>
              </div>
              
              {/* Post 按鈕 */}
              <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 text-white font-bold rounded-full transition-all">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 內容流 */}
      <div className="divide-y divide-gray-800">
        {posts.map((post) => (
          <article key={post.id} className="px-4 py-6 hover:bg-gray-950/50 transition-colors">
            <div className="flex items-start gap-3">
              {/* 使用者頭像 */}
              <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
              
              <div className="flex-1 min-w-0">
                {/* 使用者資訊 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-100 text-[15px]">{post.author}</span>
                  <span className="text-gray-500 text-[15px]">{post.username}</span>
                  <span className="text-gray-500 text-[15px]">·</span>
                  <span className="text-gray-500 text-[15px]">{post.time}</span>
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
                    {post.content}
                  </p>
                </div>
                
                {/* 圖片 */}
                {post.image && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-gray-800">
                    <div className="w-full aspect-video bg-gray-800"></div>
                  </div>
                )}
                
                {/* 操作列 */}
                <div className="flex items-center justify-between max-w-md mt-4">
                  {/* 評論 */}
                  <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
                    <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">{post.stats.comments}</span>
                  </button>
                  
                  {/* 轉發 */}
                  <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
                    <div className="p-2 group-hover:bg-green-500/10 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-green-500 transition-colors">{post.stats.reposts}</span>
                  </button>
                  
                  {/* 喜歡 */}
                  <button className="flex items-center gap-2 group hover:text-red-500 transition-colors">
                    <div className="p-2 group-hover:bg-red-500/10 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-red-500 transition-colors">{post.stats.likes > 1000 ? `${(post.stats.likes / 1000).toFixed(1)}k` : post.stats.likes}</span>
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
        ))}
      </div>
    </div>
  );
}
