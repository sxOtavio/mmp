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

export default function UserPage() {
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
    <main>
      <Header />
      <Hero />
      <Categorias selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      <FiltredProducts selectedCategory={selectedCategory} searchTerm={searchTerm} />
      <Products />
      <PromoProducts />
      <Footer />
    </main>
  );
}