'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePostStore } from '@/store/usePostStore';
import { useUserStore } from '@/store/useUserStore';
import { getCountedLength, truncateToCounted, MAX_POST_LENGTH } from '@/lib/postUtils';
import ComposerImageUpload from './ComposerImageUpload';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DraftItem {
  id: string;
  content: string;
  createdAt: string;
}

function getDraftsHeaders(handle: string): HeadersInit {
  return { 'Content-Type': 'application/json', 'x-user-handle': handle };
}

export default function PostModal({ isOpen, onClose }: PostModalProps) {
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showDraftsView, setShowDraftsView] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const { addPost } = usePostStore();
  const { currentUser } = useUserStore();

  const fetchDrafts = useCallback(async () => {
    if (!currentUser?.handle) return;
    setLoadingDrafts(true);
    try {
      const res = await fetch('/api/drafts', {
        headers: getDraftsHeaders(currentUser.handle),
      });
      if (res.ok) {
        const list = (await res.json()) as DraftItem[];
        setDrafts(list);
      } else {
        setDrafts([]);
      }
    } catch {
      setDrafts([]);
    } finally {
      setLoadingDrafts(false);
    }
  }, [currentUser?.handle]);

  useEffect(() => {
    if (isOpen && showDraftsView && currentUser?.handle) {
      fetchDrafts();
    }
  }, [isOpen, showDraftsView, currentUser?.handle, fetchDrafts]);

  if (!isOpen) return null;
  if (!currentUser) return null;

  const counted = getCountedLength(content);
  const canSubmit = content.trim().length > 0 && counted <= MAX_POST_LENGTH;
  const hasContent = content.trim().length > 0 || imageUrls.length > 0;

  const handleContentChange = (value: string) => {
    setContent(truncateToCounted(value, MAX_POST_LENGTH));
  };

  const handleClose = () => {
    if (showDraftsView) {
      setShowDraftsView(false);
      return;
    }
    if (hasContent) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(false);
    setContent('');
    setImageUrls([]);
    onClose();
  };

  /** 儲存為草稿並關閉詢問小視窗與彈出視窗 */
  const handleSaveDraft = async () => {
    if (!content.trim() || !currentUser?.handle) return;
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: getDraftsHeaders(currentUser.handle),
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setShowDiscardConfirm(false);
        setContent('');
        setImageUrls([]);
        onClose();
      }
    } catch {
      setShowDiscardConfirm(false);
      setContent('');
      setImageUrls([]);
      onClose();
    }
  };

  const handleSubmitPost = () => {
    if (!content.trim() || counted > MAX_POST_LENGTH) return;
    addPost({
      author: currentUser,
      content: content.trim(),
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    });
    setContent('');
    setImageUrls([]);
    onClose();
  };

  const handleDeleteDraft = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.handle) return;
    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
        headers: getDraftsHeaders(currentUser.handle),
      });
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      }
    } catch {
      // 刪除失敗可再重試
    }
  };

  const handleSelectDraft = (draft: DraftItem) => {
    setContent(draft.content);
    setShowDraftsView(false);
  };

  const handleBackToPost = () => {
    setShowDraftsView(false);
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />
      {/* 彈出視窗：中上方 */}
      <div
        className="fixed left-1/2 top-[10%] -translate-x-1/2 w-full max-w-2xl z-50 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
      >
        {showDraftsView ? (
          /* 草稿列表視窗 */
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <button
                type="button"
                onClick={handleBackToPost}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-100"
                aria-label="返回發文"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
              <span id="post-modal-title" className="text-lg font-semibold text-gray-100">
                草稿
              </span>
              <div className="w-9" aria-hidden="true" />
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {loadingDrafts ? (
                <p className="text-gray-500 text-center py-8">載入中…</p>
              ) : drafts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">尚無草稿</p>
              ) : (
                <ul className="space-y-3">
                  {drafts.map((draft) => (
                    <li
                      key={draft.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectDraft(draft)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectDraft(draft);
                        }
                      }}
                      className="flex items-start gap-3 p-4 rounded-xl border border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                    >
                      <p className="flex-1 min-w-0 text-gray-100 text-[15px] leading-relaxed line-clamp-3 whitespace-pre-wrap break-words">
                        {draft.content}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDraft(draft.id, e)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                        aria-label="刪除草稿"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          /* 發文視窗 */
          <>
            {/* 標題列：左上 X、標題、右上草稿 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <button
                type="button"
                onClick={handleClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-100"
                aria-label="關閉"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
              <span id="post-modal-title" className="text-lg font-semibold text-gray-100">
                發文
              </span>
              <button
                type="button"
                onClick={() => setShowDraftsView(true)}
                className="px-3 py-2 rounded-full text-sm font-medium text-blue-500 hover:bg-blue-500/10 transition-colors"
              >
                草稿
              </button>
            </div>

            {/* 發文區（與主頁 PostComposer 類似） */}
            <div className="px-4 pt-4 pb-5">
              <div className="flex gap-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                />
                <div className="flex-1">
                  <div className="mb-4">
                    <textarea
                      value={content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="What's happening?"
                      className="w-full bg-transparent text-gray-100 placeholder:text-gray-500 text-xl resize-none focus:outline-none min-h-[80px] leading-relaxed"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ComposerImageUpload
                        imageUrls={imageUrls}
                        onChange={setImageUrls}
                        label="新增圖片"
                      />
                      <button
                        type="button"
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                        aria-hidden="true"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                        aria-hidden="true"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                        aria-hidden="true"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="15.5" cy="9.5" r="1.5" />
                          <circle cx="8.5" cy="9.5" r="1.5" />
                          <path d="M12 18c2.28 0 4.22-1.66 5-4H7c.78 2.34 2.72 4 5 4z" />
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
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
                        onClick={handleSubmitPost}
                        disabled={!canSubmit}
                        className={`px-6 py-2 font-bold rounded-full transition-all ${
                          canSubmit
                            ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 text-white cursor-pointer'
                            : 'bg-blue-500/50 text-white/50 cursor-not-allowed'
                        }`}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 關閉前有輸入文字時的詢問小視窗 */}
      {showDiscardConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={() => setShowDiscardConfirm(false)}
            aria-hidden="true"
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[320px] bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-4"
            role="alertdialog"
            aria-labelledby="discard-dialog-title"
          >
            <h2 id="discard-dialog-title" className="text-lg font-bold text-gray-100 mb-2">
              捨棄貼文？
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              您輸入的內容將會遺失。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-full font-bold bg-gray-700 hover:bg-gray-600 text-gray-100 transition-colors"
              >
                儲存
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="px-4 py-2 rounded-full font-bold bg-red-500/90 hover:bg-red-500 text-white transition-colors"
              >
                放棄
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
