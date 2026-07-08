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

  
  const handleAddToCart = (product) => {
    const isSoldByWeight = product.sold_by_weight === true;
    
    let quantity = 1;
    let pesoEspecifico = null;
    
    if (isSoldByWeight) {
      const pesoDesejado = prompt(
        `${product.name}\n\nDigite o peso desejado (em kg):`,
        '0.5'
      );
      
      if (pesoDesejado === null) return;
      
      const peso = parseFloat(pesoDesejado);
      if (isNaN(peso) || peso <= 0) {
        alert('⚠️ Peso inválido!');
        return;
      }
      
  
      quantity = peso;
      pesoEspecifico = peso;
    } else {
      const qtdDesejada = prompt(
        `📦 ${product.name}\n\nDigite a quantidade desejada:`,
        '1'
      );
      
      if (qtdDesejada === null) return;
      
      const qtd = parseInt(qtdDesejada);
      if (isNaN(qtd) || qtd <= 0) {
        alert('⚠️ Quantidade inválida!');
        return;
      }
      
      quantity = qtd;
    }
    
    const produtoParaCarrinho = {
      gtin: product.gtin_code || product.id,
      nome: product.name,
      precoNormal: product.price,
      precoPromocional: product.promotion_price || null,
      estoque: product.stock || 999,
      categoria: product.category || "Promoção",
      sold_by_weight: isSoldByWeight,
      unit_type: product.unit_type || 'unidade',
      weight_per_unit: product.weight_per_unit || 0.5,
      peso_especifico: pesoEspecifico,
    };
    
    addToCart(produtoParaCarrinho, quantity);
    
    const btn = document.activeElement;
    if (btn) {
      btn.innerHTML = isSoldByWeight ? `✓ ${quantity}kg` : "✓ Adicionado!";
      setTimeout(() => {
        btn.innerHTML = "🛒 Carrinho";
      }, 1500);
    }
  };

  if (loading || !products || products.length === 0) {
    return (
      <section className="px-6 py-8 bg-gray-50 rounded text-center text-gray-500">
        Carregando ofertas...
      </section>
    );
  }

  const produtosPromocionais = products
    .filter(
      (p) =>
        p.promotion_price &&
        Number(p.promotion_price) <= Number(p.price)
    )
    .slice(0, 30);

  const produtosCarrossel =
    produtosPromocionais.length > 0
      ? produtosPromocionais
      : products.slice(0, 30);

  const metade = Math.ceil(produtosCarrossel.length / 2);

  const linha1 = produtosCarrossel.slice(0, metade);
  const linha2 = produtosCarrossel.slice(metade);

  const priceCorrection = (p) => {
    const tipo = p.sold_by_weight ? '/kg' : '/un';
    
    if (p.promotion_price == null || p.promotion_price == 0) {
      return (
        <p className="text-black font-bold text-sm">
          R$ {Number(p.price).toFixed(2)}
          <span className="text-xs text-gray-400 font-normal ml-1">{tipo}</span>
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
            <span className="text-xs text-gray-400 font-normal ml-1">{tipo}</span>
          </p>
        </>
      );
    }

    return (
      <p className="font-bold text-sm">
        R$ {Number(p.price).toFixed(2)}
        <span className="text-xs text-gray-400 font-normal ml-1">{tipo}</span>
      </p>
    );
  };

  const renderizarLinhaCarrossel = (
    listaProdutos,
    tempoSegundos
  ) => {
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
                relative
              "
            >
              {/* BADGE DE CLASSIFICAÇÃO */}
              <div className="absolute top-2 right-2 z-10">
                <span className={`text-[8px] px-2 py-1 rounded-full font-medium ${
                  p.sold_by_weight 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {p.sold_by_weight ? 'Peso' : 'Unidade'}
                </span>
              </div>

              <div className="bg-gray-100 h-40 rounded mb-2 overflow-hidden flex items-center justify-center text-[10px] text-black">
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
                className="text-xs font-semibold text-black truncate mb-1"
                title={p.name}
              >
                {p.name}
              </h3>

              {p.sold_by_weight && (
                <p className="text-[8px] text-gray-500">
                   Vendido por peso
                </p>
              )}

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
                {p.sold_by_weight ? ' Peso' : ' Carrinho'}
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