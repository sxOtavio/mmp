// app/layout.js
'use client';

import { UserProvider } from '@/contexts/UserContext';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Supermercado Preferido</title>
        <meta name="description" content="Ofertas imperdíveis e produtos de qualidade no Supermercado Preferido" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon tradicional */}
        <link rel="icon" href="/favicon.png" sizes="any" />
        
      </head>
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}