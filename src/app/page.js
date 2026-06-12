'use client';

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categorias from "@/components/Categories";
import PromoProducts from "@/components/PProducts";
import Products from "@/components/promoProducts";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Categorias />
      <PromoProducts />
      <Footer />
    </main>
  );
}