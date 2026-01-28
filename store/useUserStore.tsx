'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import type { Author } from '@/types/models';

interface UserStoreContextType {
  currentUser: Author;
  setCurrentUser: (user: Author) => void;
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(undefined);

// 預設當前使用者資訊
const defaultCurrentUser: Author = {
  name: 'You',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
  handle: '@you',
};

export function UserStoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Author>(defaultCurrentUser);

  return (
    <UserStoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </UserStoreContext.Provider>
  );
}

/**
 * Hook 用於存取使用者狀態
 */
export function useUserStore() {
  const context = useContext(UserStoreContext);
  if (context === undefined) {
    throw new Error('useUserStore must be used within a UserStoreProvider');
  }
  return context;
}
