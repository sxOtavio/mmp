import { Suspense } from "react";
import UserPageClient from "@/components/UserPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <UserPageClient />
    </Suspense>
  );
}
