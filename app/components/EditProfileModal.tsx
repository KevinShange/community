'use client';

import { useState, useEffect } from 'react';

export interface EditProfileFormValues {
  name: string;
  bio: string;
  birthday: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: EditProfileFormValues;
  userHandle: string;
  onSuccess?: (updated: { name: string; bio: string; birthday: string | null }) => void;
}

function getProfileHeaders(handle: string): HeadersInit {
  return { 'Content-Type': 'application/json', 'x-user-handle': handle };
}

export default function EditProfileModal({
  isOpen,
  onClose,
  initialValues,
  userHandle,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialValues.name);
  const [bio, setBio] = useState(initialValues.bio);
  const [birthday, setBirthday] = useState(initialValues.birthday);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialValues.name);
      setBio(initialValues.bio);
      setBirthday(initialValues.birthday);
      setError(null);
    }
  }, [isOpen, initialValues.name, initialValues.bio, initialValues.birthday]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: getProfileHeaders(userHandle),
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim() || null,
          birthday: birthday.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data.error as string) || '更新失敗');
        return;
      }
      onSuccess?.({
        name: data.name ?? name.trim(),
        bio: data.bio ?? bio.trim(),
        birthday: data.birthday ?? (birthday.trim() || null),
      });
      onClose();
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-[10%] -translate-x-1/2 w-full max-w-xl max-h-[85vh] overflow-y-auto z-50 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-100"
            aria-label="關閉"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
          <span id="edit-profile-title" className="text-lg font-semibold text-gray-100">
            編輯個人檔案
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 font-bold rounded-full bg-gray-100 text-gray-950 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '儲存中…' : '儲存'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 預留：更換背景圖（之後實作） */}
          <div className="rounded-xl border border-dashed border-gray-700 p-6 text-center bg-gray-900/50">
            <p className="text-gray-500 text-sm">更換背景圖</p>
            <p className="text-gray-600 text-xs mt-1">（功能預留，之後實作）</p>
          </div>

          {/* 預留：更換大頭貼（之後實作） */}
          <div className="rounded-xl border border-dashed border-gray-700 p-6 text-center bg-gray-900/50">
            <p className="text-gray-500 text-sm">更換大頭貼</p>
            <p className="text-gray-600 text-xs mt-1">（功能預留，之後實作）</p>
          </div>

          <div>
            <label htmlFor="edit-profile-name" className="block text-sm font-medium text-gray-400 mb-1">
              顯示名稱
            </label>
            <input
              id="edit-profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="顯示名稱"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="edit-profile-bio" className="block text-sm font-medium text-gray-400 mb-1">
              經歷
            </label>
            <textarea
              id="edit-profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="簡短介紹你的經歷或興趣"
              rows={4}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={160}
            />
            <p className="text-gray-500 text-xs mt-1 text-right">{bio.length}/160</p>
          </div>

          <div>
            <label htmlFor="edit-profile-birthday" className="block text-sm font-medium text-gray-400 mb-1">
              生日
            </label>
            <input
              id="edit-profile-birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </>
  );
}
