export default function PostComposer() {
  return (
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
  );
}
