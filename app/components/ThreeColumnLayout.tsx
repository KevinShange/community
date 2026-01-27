'use client';

import { ReactNode } from 'react';
import { useUserStore } from '@/store/useUserStore';

interface ThreeColumnLayoutProps {
  children: ReactNode;
}

export default function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  const { currentUser } = useUserStore();
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* 左側導航欄 - 最窄，固定寬度 */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-800 bg-gray-950">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="p-4 flex flex-col h-full">
            {/* 應用程式標誌 */}
            <div className="mb-8">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
                  <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" fill="none" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
            </div>
            
            {/* 導航連結 */}
            <nav className="space-y-1 mb-6">
              <a
                href="/"
                className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-800 transition-colors group relative"
              >
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <span className="font-bold text-blue-500 text-xl">Home</span>
              </a>
              
              <a
                href="/explore"
                className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-800 transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors"
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
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-xl">Explore</span>
              </a>
              
              <a
                href="/notifications"
                className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-800 transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-xl">Notifications</span>
              </a>
              
              <a
                href="/messages"
                className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-800 transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-xl">Messages</span>
              </a>
              
              <a
                href="/profile"
                className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-800 transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-xl">Profile</span>
              </a>
            </nav>
            
            {/* Post 按鈕 */}
            <div className="mb-6">
              <button className="w-full h-12 bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 text-white font-bold rounded-full transition-all">
                Post
              </button>
            </div>
            
            {/* 用戶資訊 */}
            <div className="mt-auto pt-8">
              <div className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-800 transition-colors cursor-pointer group">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-100 truncate">{currentUser.name}</div>
                  <div className="text-sm text-gray-500 truncate">{currentUser.handle}</div>
                </div>
                <button className="p-1 hover:bg-gray-700 rounded-full transition-colors">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 中央內容區 - 最寬，可滾動 */}
      <main className="flex-1 min-w-0 border-r border-gray-800">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {/* 右側輔助資訊欄 - 中等寬度，固定 */}
      <aside className="w-80 flex-shrink-0">
        <div className="sticky top-0 h-screen overflow-y-auto hide-scrollbar">
          <div className="p-4 space-y-5">
            {/* 搜索框 */}
            <div className="mb-2">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-10 pl-12 pr-4 bg-gray-800 rounded-full text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800"
                />
              </div>
            </div>
            
            {/* What's happening */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-100 mb-4">What's happening</h2>
                
                <div className="space-y-4">
                  {/* 趨勢項目 */}
                  <div className="py-3 hover:bg-gray-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Trending in Design</p>
                        <p className="text-[15px] font-bold text-gray-100 group-hover:text-blue-500 transition-colors">#TailwindCSS</p>
                        <p className="text-xs text-gray-500 mt-1">12.5k posts</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-3 hover:bg-gray-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Trending in Technology</p>
                        <p className="text-[15px] font-bold text-gray-100 group-hover:text-blue-500 transition-colors">#NextJS</p>
                        <p className="text-xs text-gray-500 mt-1">8.2k posts</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-3 hover:bg-gray-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Trending in Web Development</p>
                        <p className="text-[15px] font-bold text-gray-100 group-hover:text-blue-500 transition-colors">#React</p>
                        <p className="text-xs text-gray-500 mt-1">25.1k posts</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-3 text-left text-blue-500 hover:bg-gray-800/50 rounded-lg transition-colors mt-2">
                  <span className="text-[15px]">Show more</span>
                </button>
              </div>
            </div>
            
            {/* Who to follow */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-100 mb-4">Who to follow</h2>
                
                <div className="space-y-4">
                  {/* 推薦關注項目 */}
                  <div className="flex items-center gap-3 py-2 hover:bg-gray-800/50 transition-colors group">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-100 text-[15px] mb-0.5">UI Design Daily</div>
                      <div className="text-sm text-gray-500">@uidesigndaily</div>
                    </div>
                    <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-full text-sm transition-colors">
                      Follow
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 py-2 hover:bg-gray-800/50 transition-colors group">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-100 text-[15px] mb-0.5">Web Dev Tips</div>
                      <div className="text-sm text-gray-500">@webdevtips</div>
                    </div>
                    <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-full text-sm transition-colors">
                      Follow
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 py-2 hover:bg-gray-800/50 transition-colors group">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-100 text-[15px] mb-0.5">Design Inspiration</div>
                      <div className="text-sm text-gray-500">@designinspo</div>
                    </div>
                    <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-full text-sm transition-colors">
                      Follow
                    </button>
                  </div>
                </div>
                
                <button className="w-full py-3 text-left text-blue-500 hover:bg-gray-800/50 rounded-lg transition-colors mt-2">
                  <span className="text-[15px]">Show more</span>
                </button>
              </div>
            </div>
            
            {/* 版權資訊 */}
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                <a href="#" className="hover:underline">Terms of Service</a>
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Cookie Policy</a>
                <a href="#" className="hover:underline">Accessibility</a>
                <a href="#" className="hover:underline">Ads info</a>
              </div>
              <div className="text-xs text-gray-500 mt-2">© 2024 SocialFeed Inc.</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
