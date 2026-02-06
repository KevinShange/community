'use client';

import { useState } from 'react';
import { usePostStore } from '@/store/usePostStore';
import { useUserStore } from '@/store/useUserStore';
import { getCountedLength, truncateToCounted, MAX_POST_LENGTH } from '@/lib/postUtils';
import HighlightedTextarea from './HighlightedTextarea';
import ComposerImageUpload from './ComposerImageUpload';

interface ReplyComposerProps {
  postId: string | number;
}

/**
 * Post 頁面專用：與主頁發文框類似的留言框，按 Reply 對此文章留言。
 */
export default function ReplyComposer({ postId }: ReplyComposerProps) {
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { addComment } = usePostStore();
  const { currentUser } = useUserStore();

  const counted = getCountedLength(content);
  const canSubmit = content.trim().length > 0 && counted <= MAX_POST_LENGTH;

  const handleChange = (value: string) => {
    setContent(truncateToCounted(value, MAX_POST_LENGTH));
  };

  const handleSubmitReply = () => {
    if (!content.trim() || counted > MAX_POST_LENGTH || !currentUser) return;
    addComment(postId, {
      author: currentUser,
      content: content.trim(),
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isLikedByMe: false,
    });
    setContent('');
    setImageUrls([]);
  };

  if (!currentUser) return null;

  return (
    <div className="px-4 pt-4 pb-5 border-b border-gray-800">
      <div className="flex gap-4">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
        />
        <div className="flex-1">
          <div className="mb-4">
            <HighlightedTextarea
              value={content}
              onChange={handleChange}
              placeholder="Post your reply"
              className="text-gray-100 placeholder:text-gray-500"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <ComposerImageUpload
                imageUrls={imageUrls}
                onChange={setImageUrls}
                label="新增圖片"
              />
              <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors" type="button" aria-label="GIF">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"/>
                </svg>
              </button>
              <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors" type="button" aria-label="投票">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </button>
              <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors" type="button" aria-label="表情">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="15.5" cy="9.5" r="1.5"/>
                  <circle cx="8.5" cy="9.5" r="1.5"/>
                  <path d="M12 18c2.28 0 4.22-1.66 5-4H7c.78 2.34 2.72 4 5 4z"/>
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {content.trim().length > 0 && (
                <span className="text-gray-500 text-sm tabular-nums">
                  {counted} / {MAX_POST_LENGTH}
                </span>
              )}
              <button
                type="button"
                onClick={handleSubmitReply}
                disabled={!canSubmit}
                className={`px-6 py-2 font-bold rounded-full transition-all ${
                  canSubmit
                    ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 text-white cursor-pointer'
                    : 'bg-blue-500/50 text-white/50 cursor-not-allowed'
                }`}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
