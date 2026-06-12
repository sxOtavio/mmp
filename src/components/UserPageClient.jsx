// components/UserPageClient.jsx
'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categorias from "@/components/Categories";
import PromoProducts from "@/components/PProducts";
import Products from "@/components/promoProducts";
import Footer from "@/components/Footer";
import FiltredProducts from "@/components/FiltredProducts";
import { CartDrawer } from "@/components/CartDrawer";

export default function UserPageClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  if (!mounted) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <Hero />
      <Categorias 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />
      <FiltredProducts 
        selectedCategory={selectedCategory} 
        searchTerm={searchTerm} 
      />
      <Products />
      <PromoProducts />
      <Footer />
      <CartDrawer />
    </>
  );
}
