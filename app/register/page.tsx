'use client';

import { Suspense } from 'react';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
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
      <RegisterForm />
    </Suspense>
  );
}
