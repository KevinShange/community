import { ReactNode } from 'react';

interface ThreeColumnLayoutProps {
  children: ReactNode;
}

export default function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
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
                <span className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"></span>
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <span className="font-bold text-gray-100">Home</span>
              </a>
              
              <a
                href="/explore"
                className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-800 transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-gray-300"
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
                <span className="text-gray-400 group-hover:text-gray-300">Explore</span>
              </a>
              
              <a
                href="/notifications"
                className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-800 transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-gray-300"
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
                <span className="text-gray-400 group-hover:text-gray-300">Notifications</span>
              </a>
              
              <a
                href="/messages"
                className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-800 transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-gray-300"
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
                <span className="text-gray-400 group-hover:text-gray-300">Messages</span>
              </a>
              
              <a
                href="/profile"
                className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-800 transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-gray-300"
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
                <span className="text-gray-400 group-hover:text-gray-300">Profile</span>
              </a>
            </nav>
            
            {/* Post 按鈕 */}
            <div className="mb-8">
              <button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-colors">
                Post
              </button>
            </div>
            
            {/* 用戶資訊 */}
            <div className="mt-auto pt-8">
              <div className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-800 transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-amber-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-100 truncate">Alex Rivera</div>
                  <div className="text-sm text-gray-500 truncate">@arivera_design</div>
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
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* 搜索框 */}
            <div>
              <div className="h-10 bg-gray-800 rounded-full"></div>
            </div>
            
            {/* What's happening */}
            <div className="bg-gray-900 rounded-2xl p-4">
              <div className="h-6 bg-gray-800 rounded mb-4 w-1/2"></div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-800 rounded mt-4 w-1/3"></div>
            </div>
            
            {/* Who to follow */}
            <div className="bg-gray-900 rounded-2xl p-4">
              <div className="h-6 bg-gray-800 rounded mb-4 w-1/2"></div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-800 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-800 rounded mt-4 w-1/3"></div>
            </div>
            
            {/* 版權資訊 */}
            <div className="text-xs text-gray-500 space-y-2">
              <div className="h-3 bg-gray-800 rounded"></div>
              <div className="h-3 bg-gray-800 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
