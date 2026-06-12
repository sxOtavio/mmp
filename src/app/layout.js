'use client'; // 👈 IMPORTANTE

import { UserProvider } from '@/contexts/UserContext';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
