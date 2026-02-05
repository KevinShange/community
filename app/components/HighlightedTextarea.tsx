'use client';

import { useRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;

interface HighlightedTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getHighlightedHtml(value: string): string {
  if (!value) return '';

  const parts = value.split(URL_REGEX);
  const pieces: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.match(/^https?:\/\//)) {
      // URL：顯示為不同顏色，但不加錨點
      pieces.push(`<span class="text-blue-400">${escapeHtml(part)}</span>`);
    } else if (part) {
      pieces.push(escapeHtml(part));
    }
  }

  return pieces.join('');
}

export default function HighlightedTextarea({
  value,
  onChange,
  className = '',
  placeholder,
  rows = 3,
  ...rest
}: HighlightedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const handleScroll: React.UIEventHandler<HTMLTextAreaElement> = (e) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
      overlayRef.current.scrollLeft = (e.target as HTMLTextAreaElement).scrollLeft;
    }
  };

  const highlightedHtml = getHighlightedHtml(value);

  return (
    <div className="relative w-full">
      {/* 背景高亮層：顯示文字與網址顏色 */}
      <div
        ref={overlayRef}
        className={`pointer-events-none absolute inset-0 whitespace-pre-wrap break-words text-xl leading-relaxed text-gray-100 ${
          value ? '' : 'text-gray-500'
        } ${className}`}
        aria-hidden="true"
      >
        {value ? (
          <span
            dangerouslySetInnerHTML={{
              __html: highlightedHtml,
            }}
          />
        ) : (
          // 以視覺方式呈現 placeholder；實際 placeholder 仍交由 textarea 處理
          placeholder ?? ''
        )}
      </div>

      {/* 真正可輸入的 textarea：文字設為透明，只顯示游標 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onScroll={handleScroll}
        className={`relative w-full bg-transparent text-transparent caret-white text-xl leading-relaxed resize-none focus:outline-none min-h-[80px] ${className}`}
        {...rest}
      />
    </div>
  );
}

