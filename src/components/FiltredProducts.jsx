"use client";
import { useEffect, useState } from "react";
import { useProducts } from "@/hooks/useProducts";

const normalizeCategoryValue = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\.\-_/]/g, " ")
    .trim()
    .toLowerCase();

const CATEGORY_ALIASES = {
  "perfum": "Higiene pessoal",
  "perfumaria": "Higiene pessoal",
  "hig pessoal": "Higiene pessoal",
  "hig. pessoal": "Higiene pessoal",
  "higiene pessoal": "Higiene pessoal",
  "higienepessoal": "Higiene pessoal",
  "perfum hig pessoal": "Higiene pessoal",
  "perfum higienepessoal": "Higiene pessoal",
  "conserva": "Conservas",
  "conservas": "Conservas",
  "bebida": "Bebidas",
  "bebidas": "Bebidas",
  "refri": "Bebidas",
  "refrigerante": "Bebidas",
  "frente de caixa": "Frente de caixa",
  "frente caixa": "Frente de caixa",
  "frente cx": "Frente de caixa",
   "frente de cx": "Frente de caixa",
  "frentedecaixa": "Frente de caixa",
  "flv": "FLV",
  "acougue": "Açougue",
  "açougue": "Açougue"
};

function mapToCanonicalCategory(value) {
  const normalized = normalizeCategoryValue(value);
  return CATEGORY_ALIASES[normalized] || normalized;
}

function matchesCategory(product, selectedCategory) {
  if (!selectedCategory || selectedCategory === "Todos") return true;

  const selectedKey = mapToCanonicalCategory(selectedCategory);
  const productCategory = String(product.category || product.categoria || "");

  if (!productCategory.trim()) return false;

  const categories = productCategory
    .split(/[,;|/]+/)
    .map(mapToCanonicalCategory)
    .filter(Boolean);

  return categories.includes(selectedKey);
}

export default function FiltredProducts({ selectedCategory = "Todos", searchTerm = "" }) {
  const { products, loading, loadProductsData } = useProducts();
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    loadProductsData();
  }, [loadProductsData]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, searchTerm]);

  // Configuração: 3 linhas com 4 colunas = 12 produtos por página
  const ITEMS_PER_PAGE = 12; // 3 linhas x 4 colunas

  const validProducts =
    products?.filter((p) => {
      if (!p) return false;
      if (!matchesCategory(p, selectedCategory)) return false;

      if (searchTerm.trim()) {
        const searchLower = searchTerm.trim().toLowerCase();
        const productName = String(p.name || "").toLowerCase();
        const productDescription = String(p.description || "").toLowerCase();
        const productBrand = String(p.brand || "").toLowerCase();
        const productGtin = String(p.gtin_code || "");

        return (
          productName.includes(searchLower) ||
          productDescription.includes(searchLower) ||
          productBrand.includes(searchLower) ||
          productGtin.includes(searchLower)
        );
      }

      return true;
    }) || [];

  const totalPages = Math.ceil((validProducts?.length || 0) / ITEMS_PER_PAGE);

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

          <p className="text-green-600 text-xs font-semibold">
            {Math.round(((p.price - p.promotion_price) / p.price) * 100)}% OFF
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

  if (loading) {
    return (
      <section className="px-6 py-8 bg-gray-50 rounded text-center text-gray-500">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400"></div>
          <span>Carregando ofertas...</span>
        </div>
      </section>
    );
  }

  if (!validProducts || validProducts.length === 0) {
    return (
      <section className="px-6 py-8 bg-gray-50 rounded text-center text-gray-500">
        Nenhum produto encontrado para a categoria selecionada.
      </section>
    );
  }

  return (
    <section className="px-6 py-8 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-bold text-gray-800">
          {selectedCategory === "Todos" ? "Todos os produtos" : `Produtos de ${selectedCategory}`}
          {searchTerm && ` - Busca: "${searchTerm}"`}
        </h2>
        {totalPages > 1 && (
          <span className="text-sm text-gray-500">
            Página {currentPage + 1} de {totalPages}
          </span>
        )}
      </div>

      <div
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentProducts.map((p, index) => (
            <div
              key={`${p.gtin_code || p.id || index}`}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-100 h-28 rounded mb-2 overflow-hidden flex items-center justify-center text-[10px] text-gray-400">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              <h3 className="font-bold text-sm line-clamp-2 min-h-[40px]">{p.name}</h3>

              {priceCorrection(p)}

              <button className="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 transition-colors py-2 rounded-lg font-semibold text-sm">
                Colocar no carrinho
              </button>
            </div>
          ))}
        </div>

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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`h-2 rounded-full transition-all ${
                currentPage === idx ? "w-6 bg-yellow-400" : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

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