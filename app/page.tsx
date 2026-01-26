import TopNavigation from './components/TopNavigation';

export default function Home() {
  return (
    <div className="min-h-screen">
      <TopNavigation variant="home" />
      
      {/* 發布內容區域 */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-4">
            <div className="h-20 bg-gray-800 rounded-lg"></div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-gray-800 rounded"></div>
                <div className="w-6 h-6 bg-gray-800 rounded"></div>
                <div className="w-6 h-6 bg-gray-800 rounded"></div>
                <div className="w-6 h-6 bg-gray-800 rounded"></div>
              </div>
              <div className="h-9 bg-blue-500 rounded-full w-24"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 內容流 */}
      <div className="divide-y divide-gray-800">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-gray-800 rounded w-24"></div>
                  <div className="h-3 bg-gray-800 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                </div>
                <div className="h-48 bg-gray-800 rounded-xl"></div>
                <div className="flex items-center justify-between pt-2">
                  <div className="w-5 h-5 bg-gray-800 rounded"></div>
                  <div className="w-5 h-5 bg-gray-800 rounded"></div>
                  <div className="w-5 h-5 bg-gray-800 rounded"></div>
                  <div className="w-5 h-5 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
