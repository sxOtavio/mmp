'use client';

import { UserProvider } from '@/contexts/UserContext';
import Header from "@/components/SlimHeader";
import Panel from "@/components/Panel";
import Produtos from "@/components/PProducts";
import Footer from "@/components/Footer";

export default function InfoPanel() {
  return (
    <UserProvider>
      <main>
        <Header />
        <Panel />
        <Produtos />
        <Footer />
      </main>
    </UserProvider>
  );
}