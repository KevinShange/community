'use client';

import { useState } from 'react';
import { usePostStore } from '@/store/usePostStore';
import { useUserStore } from '@/store/useUserStore';

interface CommentFormProps {
  postId: string | number;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState('');
  const { addComment } = usePostStore();
  const { currentUser } = useUserStore();

  /**
   * 處理留言提交
   */
  const handleSubmitComment = () => {
    // 檢查內容是否為空（去除空白後）
    if (!content.trim()) {
      return;
    }

    // 建立新留言
    addComment(postId, {
      author: currentUser,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isLikedByMe: false,
    });

    // 清空輸入框
    setContent('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-800">
      <div className="flex gap-3">
        {/* 使用者頭像 */}
        <img 
          src={currentUser.avatar} 
          alt={currentUser.name}
          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
        />
        
        <div className="flex-1">
          {/* 輸入框 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post your reply"
            className="w-full bg-transparent text-gray-100 placeholder:text-gray-500 text-[15px] resize-none focus:outline-none min-h-[60px] leading-relaxed border border-gray-800 rounded-lg px-3 py-2 focus:border-blue-500 transition-colors"
            rows={2}
          />
          
          {/* 提交按鈕 */}
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmitComment}
              disabled={!content.trim()}
              className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all ${
                content.trim()
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
  );
}
