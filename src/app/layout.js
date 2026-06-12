import './globals.css';
import ClientProviders from '@/components/ClientProviders';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}