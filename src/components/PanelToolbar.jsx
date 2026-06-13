"use client";
import React, { useState, useMemo } from "react";
import { useCompilerXlsx } from "@/hooks/useCompilerXlsx";

//tenho q cliar uma rota que altera a permissao dos usuarios para admin e motoboy

export default function PanelToolbar() {
  const { handleFileChange, importProductsData, loading, produtosJSON, produtosPorCategoria } = useCompilerXlsx();
  const [file, setFile] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterGtin, setFilterGtin] = useState("");

  const onInputChange = (event) => {
    console.log("Evento de mudança de arquivo acionado");
    if (event.target.files && event.target.files.length > 0) {
      const arquivoSelecionado = event.target.files[0];
      setFile(arquivoSelecionado);
      handleFileChange(arquivoSelecionado);
    }
  };

  const handleImport = () => {
    if (!file) {
      alert("Selecione um arquivo primeiro!");
      return;
    }
    console.log("Botão Importar clicado! Chamando gravação no banco...");
    importProductsData();
  };

  const categoriesList = useMemo(
    () => Object.keys(produtosPorCategoria).sort(),
    [produtosPorCategoria]
  );

  const filteredProducts = useMemo(() => {
    return produtosJSON.filter((produto) => {
      if (filterCategory && produto.categoria !== filterCategory) return false;
      if (filterName && !String(produto.nome || "").toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterGtin && !String(produto.gtin || "").includes(filterGtin)) return false;
      return true;
    });
  }, [produtosJSON, filterCategory, filterName, filterGtin]);

  return (
    <section className="w-full bg-gray-50 rounded-lg p-4 m-1">
      <div className="bg-yellow-500 rounded-lg px-4 py-2 flex items-center gap-2 flex-wrap">
        <input
          type="file"
          name="file"
          onChange={onInputChange}
          id="inputProductsData"
          className="hidden"
        />

        <label
          htmlFor="inputProductsData"
          className="bg-yellow-400 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded cursor-pointer inline-block"
        >
          {file ? `✓ ${file.name}` : "Selecionar XLSX"}
        </label>

        <button
          onClick={handleImport}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 hover:scale-105 transition-transform text-white font-bold py-1 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Importar"}
        </button>

        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="bg-blue-500 hover:bg-blue-600 hover:scale-105 transition-transform text-white font-bold py-1 px-4 rounded"
        >
          {showFilterPanel ? "Fechar Filtro" : "Filtrar Produtos"} ({filteredProducts.length})
        </button>

        <button className="bg-yellow-400 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Backups
        </button>
        <button className="bg-yellow-400 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Fotos
        </button>
        <button className="bg-yellow-400 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Panfleto
        </button>
        <button className="bg-yellow-400 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Fechar Loja
        </button>
      </div>

      {showFilterPanel && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-300">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Filtrar Produtos Importados</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">GTIN</label>
              <input
                type="text"
                value={filterGtin}
                onChange={(e) => setFilterGtin(e.target.value)}
                placeholder="Buscar por GTIN..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilterCategory("");
                setFilterName("");
                setFilterGtin("");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-4 rounded"
            >
              Limpar Filtros
            </button>
            <span className="text-gray-700 font-semibold py-1">Total: {filteredProducts.length} produtos</span>
          </div>

          {filteredProducts.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2 py-1 text-left">GTIN</th>
                    <th className="border px-2 py-1 text-left">Nome</th>
                    <th className="border px-2 py-1 text-left">Categoria</th>
                    <th className="border px-2 py-1 text-right">Preço</th>
                    <th className="border px-2 py-1 text-right">Promoção</th>
                    <th className="border px-2 py-1 text-right">Estoque</th>
                    <th className="border px-2 py-1 text-center">Foto</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.slice(0, 50).map((produto, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="border px-2 py-1 font-mono text-xs">{produto.gtin}</td>
                      <td className="border px-2 py-1">{produto.nome?.substring(0, 40)}...</td>
                      <td className="border px-2 py-1 text-xs">{produto.categoria}</td>
                      <td className="border px-2 py-1 text-right">R$ {Number(produto.precoNormal || 0).toFixed(2)}</td>
                      <td className="border px-2 py-1 text-right text-green-600 font-bold">
                        {produto.precoPromocional ? `R$ ${Number(produto.precoPromocional).toFixed(2)}` : "-"}
                      </td>
                      <td className="border px-2 py-1 text-right">{produto.estoque}</td>
                      <td className="border px-2 py-1 text-center">
                        <button className="bg-blue-400 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          ✏️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length > 50 && (
                <p className="text-gray-600 text-xs mt-2">Mostrando 50 de {filteredProducts.length} produtos</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
