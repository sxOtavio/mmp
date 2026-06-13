"use client";
import { useEffect, useState, useRef } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useUser } from '@/contexts/UserContext';

function hideCard(price, promotion_price) {
  if (promotion_price && promotion_price > price) {
    return "hidden";
  }
  return "";
}

export default function PromoProducts() {
  const { promoProducts, loading, loadPromoProductsData } = useProducts();
  const { addToCart } = useUser(); 
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    loadPromoProductsData();
  }, [loadPromoProductsData]);

  // Configuração: 3 linhas com 4 colunas = 12 produtos por página
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil((promoProducts?.length || 0) / ITEMS_PER_PAGE) - 1;

  // Filtra produtos válidos (com promoção menor que o preço normal)
  const validProducts = promoProducts?.filter(
    (p) => p.promotion_price && p.promotion_price < p.price
  ) || [];

  // Produtos da página atual
  const currentProducts = validProducts.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Navegação
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Touch/swipe para mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextPage();
    }
    if (touchStart - touchEnd < -75) {
      prevPage();
    }
  };

  // 👈 Função para adicionar ao carrinho adaptando os campos
  const handleAddToCart = (product) => {
    const produtoParaCarrinho = {
      gtin: product.gtin_code || product.id,
      nome: product.name,
      precoNormal: product.price,
      precoPromocional: product.promotion_price,
      estoque: product.stock || 999, // se não tiver estoque, coloca um valor alto
      categoria: product.category || "Promoção",
    };
    
    addToCart(produtoParaCarrinho, 1);
    
    // Opcional: mostrar feedback visual
    // toast.success(`${product.name} adicionado ao carrinho!`);
  };

  if (loading) {
    return (
      <section className="px-6 py-8 bg-gray-50 rounded text-center text-gray-500">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400"></div>
          <span>Carregando ofertas em promoção...</span>
        </div>
      </section>
    );
  }

  if (!validProducts || validProducts.length === 0) {
    return (
      <section className="px-6 py-8 bg-gray-50 rounded text-center text-gray-500">
        🛒 Nenhum produto em promoção no momento.
      </section>
    );
  }

  return (
    <section className="px-6 py-8 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Preços promocionais atualizados, fique por dentro!
        </h2>
        
        {totalPages > 1 && (
          <span className="text-sm text-gray-500">
            Página {currentPage + 1} de {totalPages}
          </span>
        )}
      </div>

      {/* Carrossel com swipe support */}
      <div 
        ref={carouselRef}
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Botão anterior - desktop */}
        {totalPages > 1 && (
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed hidden md:block ${
              currentPage === 0 ? "opacity-0 pointer-events-none" : ""
            }`}
          >
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
              <div className="bg-gray-100 h-40 rounded mb-2 overflow-hidden flex items-center justify-center text-[10px] text-gray-400">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* Nome do produto */}
              <h3 className="font-bold text-sm line-clamp-2 min-h-[40px]">
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

              {/* Desconto percentual */}
              {p.price && p.promotion_price && (
                <p className="text-green-600 text-xs font-semibold">
                  {Math.round(((p.price - p.promotion_price) / p.price) * 100)}% OFF
                </p>
              )}

              {/* 👈 Botão de compra COM CARRINHO */}
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

        {/* Botão próximo - desktop */}
        {totalPages > 1 && (
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed hidden md:block ${
              currentPage === totalPages - 1 ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Indicadores de página (dots) */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`h-2 rounded-full transition-all ${
                currentPage === idx
                  ? "w-6 bg-yellow-400"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* Navegação mobile */}
      {totalPages > 1 && (
        <div className="flex justify-between gap-4 mt-4 md:hidden">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex-1 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="flex-1 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo →
          </button>
        </div>
      )}
    </section>
  );
}