'use client';

import Header from "@/components/Header";
import Hero from "@/components/user/Hero";
import Categorias from "@/components/user/Categories";
import PromoProducts from "@/components/user/PProducts";
import Footer from "@/components/Footer";
import { CartDrawer } from "@/components/user/CartDrawer";
import { UserProvider } from "@/contexts/UserContext"; // 👈 Importa o Provider
export default function Home() {
  return (
    
    <main>
      <Header />
      <Hero />
      <Categorias />
      <PromoProducts />
      <Footer />
       <CartDrawer />
    </main>
    
  );
}