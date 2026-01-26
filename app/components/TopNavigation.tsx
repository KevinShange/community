interface TopNavigationProps {
  variant?: 'home' | 'post-detail';
  title?: string;
  onBack?: () => void;
}

export default function TopNavigation({ 
  variant = 'home',
  title,
  onBack 
}: TopNavigationProps) {
  if (variant === 'post-detail') {
    return (
      <div className="sticky top-0 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="返回"
          >
            <svg
              className="w-5 h-5 text-gray-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          {title && (
            <h1 className="text-xl font-bold text-gray-100">{title}</h1>
          )}
        </div>
      </div>
    );
  }

  // Home variant with tabs
  return (
    <div className="sticky top-0 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 z-10">
      <div className="px-4">
        <h1 className="text-xl font-bold text-gray-100 py-4">Home</h1>
        <div className="flex">
          <button className="flex-1 relative py-3 group">
            <span className="font-bold text-gray-100 text-[15px]">For You</span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></span>
          </button>
          <button className="flex-1 py-3 group">
            <span className="text-gray-500 group-hover:text-gray-300 transition-colors text-[15px]">
              Following
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
