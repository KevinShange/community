'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useUserStore } from '@/store/useUserStore';
import PostModal from '@/app/components/PostModal';

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

interface ThreeColumnLayoutProps {
  children: ReactNode;
}

export default function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  const pathname = usePathname();
  const { currentUser } = useUserStore();
  const isProfile = pathname === '/profile';
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next));
        } catch (_) {}
      }
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored != null) setSidebarCollapsed(JSON.parse(stored));
    } catch (_) {}
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const navLinkClass = (active: boolean) =>
    `flex items-center rounded-full transition-colors group relative overflow-hidden ${
      sidebarCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
    } ${active ? 'bg-gray-800' : 'hover:bg-gray-800'}`;

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* 左側導航欄 - 可切換僅圖示 / 正常寬度，快捷鍵 Ctrl+B 或 Cmd+B */}
      <aside
        className={`flex-shrink-0 border-r border-gray-800 bg-gray-950 transition-[width] duration-200 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className={`flex flex-col h-full transition-[padding] duration-200 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            {/* 應用程式標誌 */}
            <div className={sidebarCollapsed ? 'mb-6 flex justify-center' : 'mb-8'}>
              <div className={`bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ${sidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}>
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
              <Link href="/" className={navLinkClass(pathname === '/')}>
                <svg
                  className={`w-6 h-6 flex-shrink-0 ${pathname === '/' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                {!sidebarCollapsed && (
                  <span className={`font-bold text-xl whitespace-nowrap ${pathname === '/' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`}>Home</span>
                )}
              </Link>
              
              <Link href="/explore" className={navLinkClass(false)}>
                <svg
                  className="w-6 h-6 flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {!sidebarCollapsed && <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-xl whitespace-nowrap">Explore</span>}
              </Link>
              
              <Link href="/notifications" className={navLinkClass(false)}>
                <svg
                  className="w-6 h-6 flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {!sidebarCollapsed && <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-xl whitespace-nowrap">Notifications</span>}
              </Link>
              
              <Link href="/messages" className={navLinkClass(false)}>
                <svg
                  className="w-6 h-6 flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {!sidebarCollapsed && <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-xl whitespace-nowrap">Messages</span>}
              </Link>
              
              <Link href="/profile" className={navLinkClass(!!isProfile)}>
                <svg
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${isProfile ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {!sidebarCollapsed && (
                  <span className={`font-bold text-xl transition-colors whitespace-nowrap ${isProfile ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`}>Profile</span>
                )}
              </Link>
            </nav>
            
            {/* Post 按鈕 */}
            <div className={sidebarCollapsed ? 'mb-6 flex justify-center' : 'mb-6'}>
              <button
                type="button"
                onClick={() => setPostModalOpen(true)}
                className={`bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 text-white font-bold rounded-full transition-all cursor-pointer ${
                  sidebarCollapsed ? 'w-10 h-10 flex items-center justify-center p-0' : 'w-full h-12'
                }`}
                title="Post"
              >
                {sidebarCollapsed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.5 4v15a1.5 1.5 0 001.5 1.5h16a1.5 1.5 0 001.5-1.5V4A1.5 1.5 0 0020 2.5h-16A1.5 1.5 0 002.5 4zM5 6h14v2H5V6zm0 4h14v8H5v-8z" />
                  </svg>
                ) : (
                  'Post'
                )}
              </button>
            </div>
            
            {/* 底部區塊：切換按鈕 + 用戶資訊 */}
            <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={toggleSidebar}
              className={`flex items-center rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-100 cursor-pointer ${
                sidebarCollapsed ? 'justify-center p-3 w-full' : 'gap-3 px-4 py-3 w-full'
              }`}
              title={sidebarCollapsed ? '展開側欄 (Ctrl+B)' : '收合為僅圖示 (Ctrl+B)'}
              aria-label={sidebarCollapsed ? '展開側欄' : '收合為僅圖示'}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
              {!sidebarCollapsed && <span className="text-sm">收合側欄</span>}
            </button>
            
            {/* 用戶資訊（登入後由 AuthGuard 保護，此處一定有 currentUser） */}
            {currentUser && (
            <div className={`relative ${sidebarCollapsed ? 'pt-2' : 'pt-4'}`} ref={userMenuRef}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setUserMenuOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setUserMenuOpen((prev) => !prev);
                  }
                }}
                className={`flex items-center rounded-full hover:bg-gray-800 transition-colors cursor-pointer group ${
                  sidebarCollapsed ? 'justify-center p-2' : 'gap-3 p-3'
                }`}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                />
                {!sidebarCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-100 truncate">{currentUser.name}</div>
                      <div className="text-sm text-gray-500 truncate">{currentUser.handle}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserMenuOpen((prev) => !prev);
                      }}
                      className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="更多選項"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              {userMenuOpen && (
                <div
                  className={`absolute bottom-full mb-2 py-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl z-50 ${sidebarCollapsed ? 'left-0 right-0 min-w-[160px]' : 'left-0 right-0 min-w-[200px]'}`}
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full px-4 py-3 text-left text-gray-100 hover:bg-gray-800 transition-colors text-[15px] font-medium rounded-lg mx-1"
                    role="menuitem"
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
            )}
            </div>
          </div>
        </div>
      </aside>

      {/* Post 發文彈出視窗 */}
      <PostModal isOpen={postModalOpen} onClose={() => setPostModalOpen(false)} />

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
