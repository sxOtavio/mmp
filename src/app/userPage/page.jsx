"use client";

import { Suspense } from "react";
import UserPageClient from "@/components/clients/UserPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <UserPageClient />
    </Suspense>
  );
}
