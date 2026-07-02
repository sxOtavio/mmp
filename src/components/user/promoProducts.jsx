<<<<<<< Updated upstream:src/components/user/promoProducts.jsx

import { useEffect, useState, useRef } from "react";
import { useProducts } from "@/hooks/useProducts";
=======
'use client';

>>>>>>> Stashed changes:src/components/promoProducts.jsx
import { useUser } from '@/contexts/UserContext';

export default function Products({ products = [], loading = false }) {
  const { addToCart } = useUser();

  // Filtra produtos SEM promoção
  const normalProducts = products?.filter(p => {
    return !p.promotion_price || p.promotion_price === 0 || p.promotion_price >= p.price;
  }) || [];

  const handleAddToCart = (product) => {
    const produtoParaCarrinho = {
      gtin: product.gtin_code || product.id,
      nome: product.name,
      precoNormal: product.price,
      precoPromocional: product.promotion_price || null,
      estoque: product.stock || 999,
      categoria: product.category || "Produto",
    };
    
    addToCart(produtoParaCarrinho, 1);
    console.log(`✅ ${product.name} adicionado ao carrinho!`);
  };

  if (loading) {
    return (
      <section className="px-6 py-8 bg-gray-50 rounded text-center text-gray-500">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400"></div>
          <span>Carregando produtos...</span>
        </div>
      </section>
    );
  }

  if (normalProducts.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-8 bg-gray-50">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Produtos em Destaque
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {normalProducts.slice(0, 8).map((p, index) => (
          <div
            key={`${p.gtin_code || p.id || index}`}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
<<<<<<< Updated upstream:src/components/user/promoProducts.jsx
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Grid de produtos - 3 linhas x 4 colunas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentProducts.map((p, index) => (
            <div
              key={`${p.gtin_code || p.id || index}`}
              className={`bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow ${hideCard(p.price, p.promotion_price)}`}
            >
              {/* Imagem */}
              <div className="bg-gray-100 h-65 rounded mb-2 overflow-hidden flex items-center justify-center text-[10px] text-gray-400">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* Nome do produto - com limite de linhas */}
              <h3 className="font-bold text-sm text-black line-clamp-2 min-h-[40px]">
                {p.name}
              </h3>

              {/* Preço antigo */}
              <p className="line-through text-gray-400 text-sm mt-1">
                R$ {Number(p.price).toFixed(2)}
              </p>

              {/* Preço promocional */}
              <p className="text-red-600 font-bold text-lg">
                R$ {Number(p.promotion_price).toFixed(2)}
              </p>

              {/* Desconto percentual opcional */}
              {p.price && p.promotion_price && (
                <p className="text-green-600 text-xs font-semibold">
                  {Math.round(((p.price - p.promotion_price) / p.price) * 100)}% OFF
                </p>
=======
            {/* Imagem */}
            <div className="bg-gray-100 h-40 rounded mb-2 overflow-hidden flex items-center justify-center">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
              ) : (
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
>>>>>>> Stashed changes:src/components/promoProducts.jsx
              )}
            </div>

            {/* Nome */}
            <h3 className="font-bold text-sm line-clamp-2 min-h-[40px]">
              {p.name}
            </h3>

            {/* Preço */}
            <p className="text-black font-bold text-lg mt-1">
              R$ {Number(p.price).toFixed(2)}
            </p>

            {/* Botão */}
            <button
              onClick={() => handleAddToCart(p)}
              className="
                mt-2
                bg-yellow-400
                hover:bg-yellow-500
                transition-colors
                w-full
                py-1.5
                rounded-lg
                text-xs
                font-bold
                text-gray-800
                shadow-sm
                active:scale-95
              "
            >
              🛒 Carrinho
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}