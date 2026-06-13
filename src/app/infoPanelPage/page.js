'use client';

import { UserProvider } from '@/contexts/UserContext';
import Header from "@/components/SlimHeader";
import Panel from "@/components/Panel";
import Produtos from "@/components/user/PProducts";
import Footer from "@/components/Footer";

export default function InfoPanel() {
  return (
    
      <main>
        <Header />
        <Panel />
        <Produtos />
        <Footer />
      </main>
    
  );
}