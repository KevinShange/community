import { ReactNode } from 'react';

interface ThreeColumnLayoutProps {
  children: ReactNode;
}

export default function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* 左側導航欄 - 最窄，固定寬度 */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-800">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="p-4">
            {/* 應用程式標誌 */}
            <div className="mb-8">
              <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
            </div>
            
            {/* 導航連結 */}
            <nav className="space-y-2 mb-6">
              <div className="h-10 bg-gray-800 rounded-lg"></div>
              <div className="h-10 bg-gray-800 rounded-lg"></div>
              <div className="h-10 bg-gray-800 rounded-lg"></div>
              <div className="h-10 bg-gray-800 rounded-lg"></div>
            </nav>
            
            {/* Post 按鈕 */}
            <div className="mb-8">
              <div className="h-12 bg-blue-500 rounded-full"></div>
            </div>
            
            {/* 用戶資訊 */}
            <div className="mt-auto pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                </div>
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
