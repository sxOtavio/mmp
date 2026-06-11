// app/page.js
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Carrega o UserPageClient apenas no cliente (sem SSR)
const UserPageClient = dynamic(
  () => import('@/components/UserPageClient'),
  { ssr: false }
);

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <UserPageClient />
    </Suspense>
  );
}
