'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface MessagesUnreadContextType {
  hasUnread: boolean;
  setHasUnread: (value: boolean) => void;
}

const MessagesUnreadContext = createContext<MessagesUnreadContextType | undefined>(undefined);

export function MessagesUnreadProvider({ children }: { children: ReactNode }) {
  const [hasUnread, setHasUnreadState] = useState(false);
  const setHasUnread = useCallback((value: boolean) => setHasUnreadState(value), []);

  return (
    <MessagesUnreadContext.Provider value={{ hasUnread, setHasUnread }}>
      {children}
    </MessagesUnreadContext.Provider>
  );
}

export function useMessagesUnreadStore() {
  const context = useContext(MessagesUnreadContext);
  if (context === undefined) {
    throw new Error('useMessagesUnreadStore must be used within MessagesUnreadProvider');
  }
  return context;
}
