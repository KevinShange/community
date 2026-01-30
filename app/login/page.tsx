'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md flex justify-center items-center text-gray-400">
            載入中...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
