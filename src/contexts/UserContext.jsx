// contexts/UserContext.jsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser as useUserHook } from '@/hooks/useUser';

const UserContext = createContext(null);

const defaultUserData = {
  auth: { loading: false },
  cart: [],
  cartTotal: 0,
  cartVersion: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isInCart: () => false,
  getQuantity: () => 0,
  loadUser: () => {},
  registerUser: () => {},
};

export function UserProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState(defaultUserData);

  useEffect(() => {
    setMounted(true);
    // Só carrega o hook real no cliente
    const realUserData = useUserHook();
    setUserData(realUserData);
  }, []);

  if (!mounted) {
    return (
      <UserContext.Provider value={defaultUserData}>
        {children}
      </UserContext.Provider>
    );
  }

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
