'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/user/Hero";
import Categorias from "@/components/user/Categories";
import PromoProducts from "@/components/user/PProducts";
import Products from "@/components/user/promoProducts";
import Footer from "@/components/Footer";
<<<<<<< Updated upstream:src/components/clients/UserPageClient.jsx
import FiltredProducts from "@/components/user/FiltredProducts";
import { CartDrawer } from "@/components/user/CartDrawer";
=======
import FiltredProducts from "@/components/FiltredProducts";
import { CartDrawer } from "@/components/CartDrawer";
import { UserProvider } from "@/contexts/UserContext"; // 👈 Importa o Provider
>>>>>>> Stashed changes:src/components/UserPageClient.jsx

export default function UserPageClient() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  return (
    <>
      <Header />
      <Hero />
      <Categorias 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />
      <FiltredProducts 
        products={products}
        loading={loading}
        selectedCategory={selectedCategory} 
        searchTerm={searchTerm} 
      />
      <Products 
        products={products}
        loading={loading}
      />
      <PromoProducts 
        promoProducts={promoProducts}
        loading={loading}
      />
      <Footer />
      <CartDrawer />
    </>
  );
}