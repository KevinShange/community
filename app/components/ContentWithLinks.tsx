'use client';

/** 僅辨識 http/https 連結，結尾可含常見標點（不納入 href） */
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;

function trimTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?)\]]+$/, '');
}

interface ContentWithLinksProps {
  content: string;
  className?: string;
}

/**
 * 顯示文章內容，將連結部分變色並轉成可點擊的 hyperlink
 */
export default function ContentWithLinks({ content, className = '' }: ContentWithLinksProps) {
  const parts = content.split(URL_REGEX);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.match(/^https?:\/\//)) {
          const href = trimTrailingPunctuation(part);
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
