'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Importa o hook real
import { useUser as useUserHook } from '@/hooks/useUser';

const UserContext = createContext(null);

let globalUserState = null;
let listeners = [];

export function UserProvider({ children }) {
  const userData = useUserHook();
  
  useEffect(() => {
    globalUserState = userData;
    listeners.forEach(listener => listener(userData));
  }, [userData]);

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}