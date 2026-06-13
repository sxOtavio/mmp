"use client";

import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useUser } from '@/contexts/UserContext';


export default function Products() {
  const { products, loading, loadProductsData } = useProducts();
  const { addToCart } = useUser();

  useEffect(() => {
    loadProductsData();
  }, [loadProductsData]);

  // Função para adicionar ao carrinho
  const handleAddToCart = (product) => {
    const produtoParaCarrinho = {
      gtin: product.gtin_code || product.id,
      nome: product.name,
      precoNormal: product.price,
      precoPromocional: product.promotion_price || null,
      estoque: product.stock || 999,
      categoria: product.category || "Promoção",
    };
    
    addToCart(produtoParaCarrinho, 1);
    
    // Feedback visual no botão
    const btn = document.activeElement;
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = "✓ Adicionado!";
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 1000);
    }
  };

  if (loading || !products || products.length === 0) {
    return (
      <section className="px-6 py-8 bg-gray-50 rounded text-center text-gray-500">
        Carregando ofertas...
      </section>
    );
  }

  // PEGA SOMENTE PRODUTOS PROMOCIONAIS
  const produtosPromocionais = products
    .filter(
      (p) =>
        p.promotion_price &&
        Number(p.promotion_price) <= Number(p.price)
    )
    .slice(0, 30);

  // fallback caso não tenha promoções
  const produtosCarrossel =
    produtosPromocionais.length > 0
      ? produtosPromocionais
      : products.slice(0, 30);

  const metade = Math.ceil(produtosCarrossel.length / 2);

  const linha1 = produtosCarrossel.slice(0, metade);
  const linha2 = produtosCarrossel.slice(metade);

  const priceCorrection = (p) => {
    if (p.promotion_price == null || p.promotion_price == 0) {
      return (
        <p className="text-black font-bold text-sm">
          <br />
          R$ {Number(p.price).toFixed(2)}
        </p>
      );
    }

    if (Number(p.promotion_price) < Number(p.price)) {
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

  const renderizarLinhaCarrossel = (
    listaProdutos,
    tempoSegundos
  ) => {
    // DUPLICA APENAS UMA VEZ
    const listaMultiplicada = [
      ...listaProdutos,
      ...listaProdutos,
    ];

    return (
      <div className="w-full overflow-hidden relative py-2">
        <div
          className="flex w-max gap-4 hover:[animation-play-state:paused]"
          style={{
            animationName: "rolagemInfinitaLateral",
            animationDuration: tempoSegundos,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        >
          {listaMultiplicada.map((p, index) => (
            <div
              key={`${p.gtin_code || index}-${index}`}
              className="
                bg-white
                p-4
                rounded-xl
                shadow-sm
                w-52
                flex-shrink-0
                border
                border-gray-100
                select-none
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <div className="bg-gray-100 h-40 rounded mb-2 overflow-hidden flex items-center justify-center text-[10px] text-gray-400">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span>Sem Imagem</span>
                )}
              </div>

              <h3
                className="text-xs font-semibold text-gray-800 truncate mb-1"
                title={p.name}
              >
                {p.name}
              </h3>

              {priceCorrection(p)}

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
      </div>
    );
  };

  return (
    <section className="px-6 py-8 bg-gray-50 rounded group">
      <style>{`
        @keyframes rolagemInfinitaLateral {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>

      <h2 className="font-bold mb-6 text-gray-800 text-xl">
        Ofertas imperdíveis, só para você!
      </h2>

      <div className="flex flex-col gap-2">
        {renderizarLinhaCarrossel(linha1, "60s")}
        {renderizarLinhaCarrossel(linha2, "45s")}
      </div>
    </section>
  );
}