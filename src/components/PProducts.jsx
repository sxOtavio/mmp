"use client";

import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";

export default function Products() {
  const { products, loading, loadProductsData } = useProducts();

  useEffect(() => {
    loadProductsData();
  }, [loadProductsData]);

  if (loading || !products || products.length === 0) {
    return (
      <section className="px-6 py-8 bg-gray-50 rounded text-center text-gray-500">
        Carregando ofertas...
      </section>
    );
  }

  // 1. DIVIDE OS PRODUTOS EM 3 FATIAS
  const terco = Math.ceil(products.length / 3);
  const linha1 = products.slice(0, terco);
  const linha2 = products.slice(terco, terco * 2);

const priceCorrection = (p) => {
  if (p.promotion_price == 0 || p.promotion_price == null) {
    return (
      
      <p className="text-black font-bold text-sm">
        <br />
        R$ {Number(p.price).toFixed(2)}
      </p>
    );
  }

  if (p.promotion_price && p.promotion_price < p.price) {
    return (
      <>
        <p className="line-through text-gray-400 text-[10px]">
          R$ {Number(p.price).toFixed(2)}
        </p>

        <p className="text-red-600 font-bold text-sm">
          R$ {Number(p.promotion_price).toFixed(2)}
        </p>
      </>
    );
  }

  return (
    <p className="font-bold text-sm">
      R$ {Number(p.price).toFixed(2)}
    </p>
  );
};

  const renderizarLinhaCarrossel = (listaProdutos, tempoSegundos) => {
    // Triplica a lista para garantir o preenchimento infinito na tela
    const listaMultiplicada = [...listaProdutos, ...listaProdutos, ...listaProdutos];

    return (
      <div className="w-full overflow-hidden relative py-2">
        {/* Usamos classes normais do flexbox e injetamos a animação via CSS nativo abaixo */}
        <div 
          className="flex w-max gap-4"
          style={{ 
            animationName: "rolagemInfinitaLateral",
            animationDuration: tempoSegundos,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite"
          }}
        >
          {listaMultiplicada.map((p, index) => (
            <div 
              key={`${p.gtin_code || index}-${index}`} 
              className="bg-white p-4 rounded-xl shadow-sm w-52 flex-shrink-0 border border-gray-100 select-none"
            >
              {/* Imagem */}
              <div className="bg-gray-100 h-28 rounded mb-2 overflow-hidden flex items-center justify-center text-[10px] text-gray-400">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span>Sem Imagem</span>
                )}
              </div>

              {/* Informações */}
              <h3 className="text-xs font-semibold text-gray-800 truncate mb-1" title={p.name}>
                {p.name}
              </h3>

              {priceCorrection(p)}
              
              <button className="mt-2 bg-yellow-400 hover:bg-yellow-500 transition-colors w-full py-1.5 rounded-lg text-xs font-bold text-gray-800 shadow-sm active:scale-95 transition-transform">
                Carrinho
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    <section className="px-6 py-8 bg-gray-50 rounded group">
      {/* 2. INJEÇÃO DE CSS NATIVO PURISTA PARA FORÇAR O MOVIMENTO SEM CONFIG DO TAILWIND */}
      <style>{`
        @keyframes rolagemInfinitaLateral {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.3333%); }
        }
      `}</style>

      <h2 className="font-bold mb-6 text-gray-800 text-xl">
        Ofertas imperdíveis, só para você! 
      </h2>
      
      <div className="flex flex-col gap-2">
        {/* Linha 1: Desliza em 70 segundos */}
        {renderizarLinhaCarrossel(linha1, "5000s")}
        
        {/* Linha 2: Desliza em 50 segundos (Um pouco mais rápida) */}
        {renderizarLinhaCarrossel(linha2, "6000s")}
      </div>
    </section>
  );
}
