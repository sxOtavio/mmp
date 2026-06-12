'use client';

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categorias from "@/components/Categories";
import PromoProducts from "@/components/PProducts";
import Footer from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { UserProvider } from "@/contexts/UserContext"; // 👈 Importa o Provider
export default function Home() {
  return (
    <UserProvider>
    <main>
      <Header />
      <Hero />
      <Categorias />
      <PromoProducts />
      <Footer />
       <CartDrawer />
    </main>
    </UserProvider>
  );
}