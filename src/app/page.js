import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categorias from "@/components/Categories";
import PromoProducts from "@/components/PromoProducts";
import Products from "@/components/Products";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Categorias />
      <PromoProducts />
      <Products />
      <Footer />
    </main>
  );
}