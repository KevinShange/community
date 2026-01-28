'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import type { Author } from '@/types/models';

interface UserStoreContextType {
  currentUser: Author | null;
  setCurrentUser: (user: Author | null) => void;
  isLoggedIn: boolean;
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(undefined);

export function UserStoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Author | null>(null);
  const isLoggedIn = currentUser !== null;

  return (
    <UserStoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn,
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
