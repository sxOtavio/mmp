import { Suspense } from "react";
import CheckoutClient from "@/components/clients/CheckoutPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}