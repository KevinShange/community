'use client';

import Link from 'next/link';

/** 僅辨識 http/https 連結，結尾可含常見標點（不納入 href） */
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;

/** @ 開頭的使用者提及，使用者名為字母、數字、底線 */
const MENTION_REGEX = /(@[a-zA-Z0-9_]+)/g;

function trimTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?)\]]+$/, '');
}

interface ContentWithLinksProps {
  content: string;
  className?: string;
}

/** 先依 URL 切開，再對非 URL 區塊依 @mention 切開，產出 (type, text) 陣列 */
function parseContent(content: string): { type: 'url' | 'mention' | 'text'; value: string }[] {
  const segments: { type: 'url' | 'mention' | 'text'; value: string }[] = [];
  const urlParts = content.split(URL_REGEX);

  for (let i = 0; i < urlParts.length; i++) {
    const part = urlParts[i];
    if (part.match(/^https?:\/\//)) {
      segments.push({ type: 'url', value: part });
      continue;
    }
    const mentionParts = part.split(MENTION_REGEX);
    for (let j = 0; j < mentionParts.length; j++) {
      const seg = mentionParts[j];
      if (seg.startsWith('@') && /^@[a-zA-Z0-9_]+$/.test(seg)) {
        segments.push({ type: 'mention', value: seg });
      } else if (seg) {
        segments.push({ type: 'text', value: seg });
      }
    }
  }
  return segments;
}

/**
 * 顯示文章內容：連結變色可點；@ 開頭的使用者提及變色並可點擊進入該使用者 Profile
 */
export default function ContentWithLinks({ content, className = '' }: ContentWithLinksProps) {
  const segments = parseContent(content);
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'url') {
          const href = trimTrailingPunctuation(seg.value);
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {seg.value}
            </a>
          );
        }
        if (seg.type === 'mention') {
          const handle = seg.value.slice(1);
          return (
            <Link
              key={i}
              href={`/profile/${encodeURIComponent(handle)}`}
              className="text-blue-500 hover:underline"
            >
              {seg.value}
            </Link>
          );
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </span>
  );
}
