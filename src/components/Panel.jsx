"use client";

import PanelToolbar from "./PanelToolbar";
import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useUser } from '@/hooks/useUser';

export default function Panel() {
  const { products, loading, loadProductsData , setProductsPhotos } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterGtin, setFilterGtin] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});
  const { validateToken, checkTokenAndRedirect, isTokenExpiringSoon } = useUser();
  

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    loadProductsData();
  }, [loadProductsData]);

  const filteredProducts = useMemo(() => {
    return products.filter((produto) => {
      if (filterCategory && produto.category !== filterCategory) return false;
      if (filterName && !String(produto.name || "").toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterGtin && !String(produto.gtin_code || "").includes(filterGtin)) return false;
      return true;
    });
  }, [products, filterCategory, filterName, filterGtin]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const categoriesList = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const handleResetFilters = () => {
    setFilterCategory("");
    setFilterName("");
    setFilterGtin("");
    setCurrentPage(1);
  };

  // Verificar token manualmente
  const handleCheckToken = async () => {
    const result = await validateToken();
    if (result.valid) {
      console.log("Token válido!", result.decoded);
    } else {
      console.log("Token inválido:", result.error);
    }
  };
  
  useEffect(() => {
    checkTokenAndRedirect('/loginPage');
  }, []);
  
  useEffect(() => {
    if (isTokenExpiringSoon()) {
      console.log("⚠️ Seu token vai expirar em breve!");
    }
  }, [isTokenExpiringSoon]);

  return (
    <div className="bg-yellow-400 rounded-2xl w-full p-6 shadow-xl">
      <h3 className="text-2xl font-bold text-black mb-6">
        Painel de Controle
      </h3>

      <PanelToolbar />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-4">
        {/* Botão Filtro */}
        <div className="flex items-center gap-2 bg-blue-500 text-white p-4 rounded-t-lg">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded transition"
          >
            {showFilterPanel ? "Fechar Filtro" : "Filtrar Produtos"} ({filteredProducts.length})
          </button>
        </div>

        {/* Painel de Filtro */}
        {showFilterPanel && (
          <div className="bg-gray-100 p-4 border-b border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Categoria</label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as categorias</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => {
                    setFilterName(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar por nome..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">GTIN</label>
                <input
                  type="text"
                  value={filterGtin}
                  onChange={(e) => {
                    setFilterGtin(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar por GTIN..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleResetFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-4 rounded"
              >
                Limpar Filtros
              </button>
              <span className="text-gray-700 font-semibold py-1">Total: {filteredProducts.length} produtos</span>
            </div>
          </div>
        )}

        {/* Header - COM COLUNA DE CLASSIFICAÇÃO */}
        <div className="grid grid-cols-12 gap-4 bg-yellow-500 text-black font-bold text-sm p-4">
          <p>Selecionar</p>
          <p>GTIN</p>
          <p>Nome</p>
          <p>Tipo</p> 
          <p>Preço</p>
          <p>Promoção</p>
          <p>Ativo</p>
          <p>Foto</p>
          <p>Imagem</p>
          <p>Criado</p>
          <p className="col-span-2">Ações</p>
        </div>

        {/* Produtos */}
        <div className="divide-y divide-gray-200">
          {currentProducts.map((p, id) => (
            <div
              key={id}
              className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-gray-50 transition"
            >
              <input type="checkbox" />

              <p className="text-sm text-black truncate">{p.gtin_code}</p>

              <p className="text-sm text-black font-medium truncate">
                {p.name}
              </p>

              
              <p className="text-sm">
                {p.sold_by_weight ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                     Peso
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                     Unidade
                  </span>
                )}
              </p>

              <p className="font-semibold text-black text-sm">
                R$ {Number(p.price).toFixed(2)}
              </p>

              <p className="text-red-600 text-black font-semibold text-sm">
                {p.promotion_price ? `R$ ${Number(p.promotion_price).toFixed(2)}` : "-"}
              </p>

              <p className={`text-sm font-bold ${p.active ? "text-green-600" : "text-red-500"}`}>
                {p.active ? "Sim" : "Não"}
              </p>

              <p className="text-sm">
                {p.image_url ? "Sim" : "Não"}
              </p>

              <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">sem foto</span>
                )}
              </div>

              <p className="text-xs text-black truncate">
                {p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : "-"}
              </p>

              
              <div className="flex flex-col gap-2 col-span-2">
                <input
                  type="file"
                  name="image"
                  id={`image-${id}`}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    setSelectedFiles((prev) => ({
                      ...prev,
                      [p.gtin_code]: e.target.files[0],
                    }));
                  }}
                />

                <label
                  htmlFor={`image-${id}`}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-2 rounded-lg transition cursor-pointer text-center text-xs"
                >
                  Selecionar
                </label>

                <button onClick={()=> {setProductsPhotos(selectedFiles[p.gtin_code], p.gtin_code)}} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded-lg transition text-xs">
                  Enviar
                </button>

                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-lg transition text-xs">
                  Editar
                </button>

                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-lg transition text-xs">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        <div className="flex justify-center items-center gap-4 p-6 bg-gray-50 rounded-b-lg">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="bg-yellow-400 text-black hover:bg-yellow-500 px-5 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="font-semibold">
            Página {currentPage} de {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="bg-yellow-400 text-black hover:bg-yellow-500 px-5 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}