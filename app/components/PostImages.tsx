'use client';

interface PostImagesProps {
  imageUrls: string[];
  className?: string;
  /** 單圖時是否限制最大高度（避免過大） */
  maxHeight?: string;
}

export default function PostImages({ imageUrls, className = '', maxHeight = '320px' }: PostImagesProps) {
  if (!imageUrls?.length) return null;

  const count = Math.min(imageUrls.length, 4);
  const gridClass =
    count === 1
      ? 'overflow-hidden max-w-full'
      : count === 2
        ? 'grid grid-cols-2 gap-1 overflow-hidden'
        : count === 3
          ? 'grid grid-cols-3 gap-1 overflow-hidden'
          : 'grid grid-cols-2 gap-1 overflow-hidden';

  return (
    <div className={`${gridClass} ${className}`}>
      {imageUrls.slice(0, 4).map((url) => (
        <div
          key={url}
          className={`relative min-h-0 ${count === 1 ? '' : 'aspect-square'}`}
        >
          <img
            src={url}
            alt=""
            className={count === 1
              ? 'max-w-full h-auto w-auto block'
              : 'w-full h-full object-cover'}
            style={count === 1 ? { maxHeight } : undefined}
          />
        </div>
      ))}
    </div>
  );
}
