'use client';

import { UserProvider } from '@/contexts/UserContext';

export default function ClientProviders({ children }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}