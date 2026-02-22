'use client';

import { useRef, useState } from 'react';

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export interface ComposerImageUploadProps {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  /** 按鈕的 aria-label */
  label?: string;
  /** Cloudinary 資料夾，預設 posts */
  folder?: string;
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  const res = await fetch('/api/upload/cloudinary', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

export default function ComposerImageUpload({
  imageUrls,
  onChange,
  disabled,
  label = '圖片',
  folder = 'posts',
}: ComposerImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || imageUrls.length >= MAX_IMAGES) return;
    if (file.size > MAX_FILE_SIZE) {
      setError('圖片最大 5MB');
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('僅支援 JPEG、PNG、GIF、WebP');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange([...imageUrls, url]);
    } catch {
      setError('上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const remove = (index: number) => {
    onChange(imageUrls.filter((_, i) => i !== index));
  };

  const canAdd = imageUrls.length < MAX_IMAGES && !disabled;

  return (
    <div className="flex flex-wrap gap-2">
      {imageUrls.map((url, index) => (
        <div key={url} className="relative group">
          <img
            src={url}
            alt=""
            className="w-16 h-16 rounded-xl object-cover border border-gray-700"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-900 border border-gray-600 text-gray-300 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
              aria-label="移除圖片"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </div>
      ))}
      {canAdd && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors disabled:opacity-60 cursor-pointer"
            aria-label={label}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
            </svg>
          </button>
        </>
      )}
      {error && <p className="text-red-400 text-xs w-full">{error}</p>}
    </div>
  );
}
