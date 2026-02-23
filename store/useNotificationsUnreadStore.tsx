'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface NotificationsUnreadContextType {
  hasUnread: boolean;
  setHasUnread: (value: boolean) => void;
}

const NotificationsUnreadContext = createContext<NotificationsUnreadContextType | undefined>(undefined);

export function NotificationsUnreadProvider({ children }: { children: ReactNode }) {
  const [hasUnread, setHasUnreadState] = useState(false);
  const setHasUnread = useCallback((value: boolean) => setHasUnreadState(value), []);

  return (
    <NotificationsUnreadContext.Provider value={{ hasUnread, setHasUnread }}>
      {children}
    </NotificationsUnreadContext.Provider>
  );
}

export function useNotificationsUnreadStore() {
  const context = useContext(NotificationsUnreadContext);
  if (context === undefined) {
    throw new Error('useNotificationsUnreadStore must be used within NotificationsUnreadProvider');
  }
  return context;
}
