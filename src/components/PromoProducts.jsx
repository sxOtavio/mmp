"use client";

import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";


export default function PromoProducts() {
    const { promoProducts, loading, loadPromoProductsData } = useProducts();

  useEffect(() => {
    loadPromoProductsData();
  }, [loadPromoProductsData]);



  
  return (
    <section className="px-6 py-8 bg-gray-50 rounded">
      <h2 className="font-bold mb-6 text-gray-800">
        Ofertas imperdíveis, só para você! 
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {promoProducts.map((p, id) => (
          <div key={id} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="bg-gray-100 h-24 rounded mb-3">{p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <span>Imagem não disponível</span>}</div>

            <h3 className="text-sm text-gray-800">{p.name}</h3>

            <p className="line-through text-gray-400 text-sm">
              R$ {p.price}
            </p>

            <p className="text-red-600 font-bold">
              R$ {p.promotion_price}
            </p>

            <button className="mt-2 bg-yellow-400 w-full py-2 rounded-lg">
              Colocar no carrinho
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}