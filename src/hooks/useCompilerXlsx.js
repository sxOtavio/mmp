"use client";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { fetchPostXlsxFile } from "../services/compilerServices";
import * as XLSX from "xlsx";

export function useCompilerXlsx() {
  const router = useRouter();
  const [auth, setAuth] = useState({
    loginData: null,
    token: null,
    loading: false,
  });

  const [produtosJSON, setProdutosJSON] = useState([]);
  const [produtosPorCategoria, setProdutosPorCategoria] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  
  const [statsClassificacao, setStatsClassificacao] = useState({
    porPeso: 0,
    porUnidade: 0,
    naoClassificados: 0
  });

  // ------------------------------- CLASSIFICAÇÃO POR PESO ------------------------------------
  const classificarProdutoPorPeso = (nome, categoria) => {
    const upper = nome.toUpperCase();
    
    if (upper.includes(' KG ') || upper.includes(' KG')) {
      const temNumero = /\d\s*KG/.test(upper);
      if (!temNumero) {
        return { 
          sold_by_weight: true, 
          unit_type: 'peso', 
          weight_per_unit: 1.0,
          classificacao: 'por_peso_kg_sem_numero'
        };
      }
    }
    
    if (/\d+\s*KG/.test(upper) || /\d+,\d+\s*KG/.test(upper)) {
      const pesoMatch = upper.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*KG/i);
      let peso = 0.5;
      if (pesoMatch) {
        peso = parseFloat(pesoMatch[1].replace(',', '.'));
      }
      return { 
        sold_by_weight: false, 
        unit_type: 'unidade', 
        weight_per_unit: peso,
        classificacao: 'por_unidade_com_numero'
      };
    }
    
    return { 
      sold_by_weight: false, 
      unit_type: 'unidade', 
      weight_per_unit: 0.5,
      classificacao: 'por_unidade_padrao'
    };
  };

  // ------------------------------- IMPORTAÇÃO DO ARQUIVO XLSX ---------------------------------
  const handleFileChange = (fileObj) => {
    console.log("Arquivos recebidos no hook");
    console.log(
      "-> Hook guardou o arquivo:",
      fileObj ? fileObj.name : "Nenhum arquivo selecionado",
    );
    setFile(fileObj);
    console.log("Sucesso!! Arquivo pronto para o processamento");
  };

  // ------------------------------- TRATAMENTO DO ARQUIVO XLSX ---------------------------------
  const processFile = useCallback(() => {
    if (!file) return;

    console.log("-> Iniciando tratamento de planilha com colunas mescladas...");
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];

        // Pega a matriz crua com todas as células, incluindo vazias
        const matrix = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });
        console.log(`-> Linhas totais na matriz crua: ${matrix.length}`);

        // ============ MAPEAMENTO DINÂMICO DAS COLUNAS ============
        let headerRowIndex = -1;
        let precoPromocaoColIndex = -1;
        let precoAnteriorColIndex = -1;
        let precoAtualColIndex = -1;
        let estoqueColIndex = -1;
        let produtoColIndex = -1;

        console.log("🔍 BUSCANDO HEADERS NA PLANILHA...");

        for (let i = 0; i < Math.min(20, matrix.length); i++) {
          const row = matrix[i];
          if (!row || !Array.isArray(row)) continue;

          const rowContent = row
            .filter((c) => c !== "" && c !== undefined)
            .slice(0, 20);
          if (rowContent.length > 0) {
            console.log(
              `Linha ${i}: ${rowContent.map((c) => `"${c}"`).join(" | ")}`,
            );
          }

          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || "").trim();
            const cellLower = cell.toLowerCase();

            if (
              cellLower.includes("promo") &&
              (cellLower.includes("preço") || cellLower.includes("preco"))
            ) {
              headerRowIndex = i;
              precoPromocaoColIndex = j;
              console.log(
                `✓ Coluna Promoção encontrada: "${cell}" na posição ${j}`,
              );
            }
            if (
              cellLower.includes("atual") &&
              (cellLower.includes("preço") || cellLower.includes("preco"))
            ) {
              headerRowIndex = i;
              precoAtualColIndex = j;
              console.log(
                `✓ Coluna Preço Atual encontrada: "${cell}" na posição ${j}`,
              );
            }
            if (
              cellLower.includes("anterior") &&
              (cellLower.includes("preço") || cellLower.includes("preco"))
            ) {
              headerRowIndex = i;
              precoAnteriorColIndex = j;
              console.log(
                `✓ Coluna Preço Anterior encontrada: "${cell}" na posizione ${j}`,
              );
            }
            if (cellLower.includes("estoque")) {
              headerRowIndex = i;
              estoqueColIndex = j;
              console.log(`✓ Coluna Estoque encontrada: "${cell}" na posição ${j}`);
            }
            if (cellLower.includes("produto")) {
              headerRowIndex = i;
              produtoColIndex = j;
              console.log(`✓ Coluna Produto encontrada: "${cell}" na posição ${j}`);
            }
          }

          if (
            headerRowIndex !== -1 &&
            precoPromocaoColIndex !== -1 &&
            precoAtualColIndex !== -1
          ) {
            console.log("✓ Headers essenciais encontrados! Parando busca.");
            break;
          }
        }

        if (headerRowIndex === -1) {
          console.warn("Não encontrou linha de cabeçalho, usando índices fixos");
          headerRowIndex = 4;
        }

        const FIXED_GTIN_COL = 0;
        const FIXED_PRODUTO_COL = 3;
        const FIXED_ESTOQUE_COL = 8;
        const FIXED_PRECO_ANTERIOR_COL = 11;
        const FIXED_PRECO_PROMOCAO_COL = 13;
        const FIXED_PRECO_ATUAL_COL = 14;

        console.log(`Cabeçalho encontrado na linha ${headerRowIndex}`);

        const produtosTratados = [];
        const categoriasProdutos = {};
        let currentCategory = "SEM_CATEGORIA";

        const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 5;

        const CATEGORY_SKIP_KEYWORDS = [
          "codigo", "código", "produto", "produtos", "preço", "preco",
          "estoque", "empresa", "registro", "promoção", "promocao",
          "página", "pagina", "page", "total", "subtotal", "unidade",
          "valor", "marca"
        ];

        let stats = {
          totalProdutos: 0,
          comPromocao: 0,
          estoquePositivo: 0,
          porPeso: 0,
          porUnidade: 0
        };

        for (let i = startRow; i < matrix.length; i++) {
          const linha = matrix[i];

          if (!linha || !Array.isArray(linha) || linha.length === 0) continue;

          const gtinRaw = String(linha[FIXED_GTIN_COL] || "").trim();

          if (
            !gtinRaw ||
            gtinRaw === "" ||
            gtinRaw === "Empresa:" ||
            gtinRaw === "Registro(s):"
          ) continue;

          const isNumericGtin = /^\d+$/.test(gtinRaw);

          const rowTextLower = linha
            .map((cell) => String(cell || "").trim().toLowerCase())
            .filter(Boolean)
            .join(" ");

          const isHeaderLikeRow = CATEGORY_SKIP_KEYWORDS.some((keyword) =>
            rowTextLower.includes(keyword),
          );

          // Detecção de categoria
          if (!isNumericGtin) {
            if (isHeaderLikeRow) continue;
            currentCategory = gtinRaw;
            if (!categoriasProdutos[currentCategory]) {
              categoriasProdutos[currentCategory] = [];
            }
            console.log(`📂 Categoria detectada: ${currentCategory}`);
            continue;
          }

          if (!isNumericGtin) continue;

          // Nome do produto
          let nome = "";
          if (produtoColIndex !== -1 && linha[produtoColIndex]) {
            nome = String(linha[produtoColIndex]).trim();
          } else if (linha[FIXED_PRODUTO_COL]) {
            nome = String(linha[FIXED_PRODUTO_COL]).trim();
          }

          if (!nome) continue;

          // Estoque
          let estoque = 0;
          let estoqueRaw = "0";

          if (estoqueColIndex !== -1 && linha[estoqueColIndex] !== undefined) {
            estoqueRaw = String(linha[estoqueColIndex]).replace(",", ".");
          } else if (linha[FIXED_ESTOQUE_COL] !== undefined) {
            estoqueRaw = String(linha[FIXED_ESTOQUE_COL]).replace(",", ".");
          }

          estoque = Number(estoqueRaw);
          if (isNaN(estoque)) estoque = 0;
          if (estoque > 0) stats.estoquePositivo++;

          // Preço Anterior
          let precoAnterior = 0;
          let precoAnteriorRaw = "0";

          if (precoAnteriorColIndex !== -1 && linha[precoAnteriorColIndex] !== undefined) {
            precoAnteriorRaw = String(linha[precoAnteriorColIndex]).replace(",", ".");
          } else if (linha[FIXED_PRECO_ANTERIOR_COL] !== undefined) {
            precoAnteriorRaw = String(linha[FIXED_PRECO_ANTERIOR_COL]).replace(",", ".");
          }

          precoAnterior = Number(precoAnteriorRaw);
          if (isNaN(precoAnterior)) precoAnterior = 0;

          // Preço Atual
          let precoAtual = 0;
          let precoAtualRaw = "0";

          if (precoAtualColIndex !== -1 && linha[precoAtualColIndex] !== undefined) {
            precoAtualRaw = String(linha[precoAtualColIndex]).replace(",", ".");
          } else if (linha[FIXED_PRECO_ATUAL_COL] !== undefined) {
            precoAtualRaw = String(linha[FIXED_PRECO_ATUAL_COL]).replace(",", ".");
          }

          precoAtual = Number(precoAtualRaw);
          if (isNaN(precoAtual)) precoAtual = 0;

          // ============ LÓGICA DE PREÇO ============
          let precoPromocaoRaw = "";

          if (precoPromocaoColIndex !== -1 && linha[precoPromocaoColIndex] !== undefined) {
            precoPromocaoRaw = String(linha[precoPromocaoColIndex]).trim().replace(",", ".");
          } else if (linha[FIXED_PRECO_PROMOCAO_COL] !== undefined) {
            precoPromocaoRaw = String(linha[FIXED_PRECO_PROMOCAO_COL]).trim().replace(",", ".");
          }

          let precoNormal = 0;
          let precoPromocional = null;

          const isPromocaoValida = precoPromocaoRaw && 
                                    precoPromocaoRaw !== "" && 
                                    precoPromocaoRaw !== "0" &&
                                    !isNaN(Number(precoPromocaoRaw)) &&
                                    Number(precoPromocaoRaw) > 0 &&
                                    precoAnterior > 0 &&
                                    Number(precoPromocaoRaw) < precoAnterior;

          if (isPromocaoValida) {
            precoNormal = precoAnterior;
            precoPromocional = Number(precoPromocaoRaw);
            stats.comPromocao++;
            console.log(`🟢 PROMOÇÃO: ${nome.substring(0, 45)}... | Normal: R$ ${precoNormal.toFixed(2)} → Promo: R$ ${precoPromocional.toFixed(2)}`);
          } else {
            precoNormal = precoAtual > 0 ? precoAtual : 0;
            precoPromocional = null;
            
            if (precoPromocaoRaw && precoPromocaoRaw !== "" && precoPromocaoRaw !== "0") {
              console.log(`⚠️ PROMOÇÃO INVÁLIDA: ${nome.substring(0, 45)}... | Promo: R$ ${precoPromocaoRaw} | Anterior: R$ ${precoAnterior}`);
            }
          }

         const classificacao = classificarProdutoPorPeso(nome, currentCategory);
          
          if (classificacao.sold_by_weight) {
            stats.porPeso++;
          } else {
            stats.porUnidade++;
          }

          stats.totalProdutos++;

          const produto = {
            gtin: gtinRaw,
            nome: nome,
            precoNormal: precoNormal,
            precoPromocional: precoPromocional,
            precoAnterior: precoAnterior,
            precoAtual: precoAtual,
            estoque: estoque,
            categoria: currentCategory,
            category: currentCategory,
            sold_by_weight: classificacao.sold_by_weight,
            unit_type: classificacao.unit_type,
            weight_per_unit: classificacao.weight_per_unit,
            _classificacao: classificacao.classificacao // Para debug
          };

          produtosTratados.push(produto);

          if (!categoriasProdutos[currentCategory]) {
            categoriasProdutos[currentCategory] = [];
          }
          categoriasProdutos[currentCategory].push(produto);
        }

        setProdutosJSON(produtosTratados);
        setProdutosPorCategoria(categoriasProdutos);
        setStatsClassificacao({
          porPeso: stats.porPeso,
          porUnidade: stats.porUnidade,
          naoClassificados: 0
        });
        
        window.produtosPlanilhaDebug = produtosTratados;

        //RELATÓRIO FINAL
        console.log("=========================================");
        console.log("📊 RELATÓRIO DE PROCESSAMENTO");
        console.log("=========================================");
        console.log(`✅ Total de produtos processados: ${stats.totalProdutos}`);
        console.log(`📦 Produtos com estoque positivo: ${stats.estoquePositivo}`);
        console.log(`🏷️  Produtos em PROMOÇÃO: ${stats.comPromocao}`);
        console.log(`📂 Categorias encontradas: ${Object.keys(categoriasProdutos).length}`);
        console.log(`\n⚖️ CLASSIFICAÇÃO POR PESO:`);
        console.log(`   🟢 Por Peso: ${stats.porPeso} produtos`);
        console.log(`   🔵 Por Unidade: ${stats.porUnidade} produtos`);
        
        // MOSTRA EXEMPLOS DE PRODUTOS POR PESO
        const exemplosPeso = produtosTratados.filter(p => p.sold_by_weight).slice(0, 10);
        if (exemplosPeso.length > 0) {
          console.log("\n🟢 Exemplos de produtos vendidos por PESO:");
          exemplosPeso.forEach((p) => {
            console.log(`  - ${p.nome.substring(0, 50)} (${p._classificacao})`);
          });
        }
        
        Object.entries(categoriasProdutos).forEach(([cat, prods]) => {
          const promoCount = prods.filter((p) => p.precoPromocional).length;
          const pesoCount = prods.filter((p) => p.sold_by_weight).length;
          console.log(`   - ${cat}: ${prods.length} produtos (${promoCount} promoções, ${pesoCount} por peso)`);
        });
        
        const exemplosPromocao = produtosTratados.filter((p) => p.precoPromocional).slice(0, 10);
        if (exemplosPromocao.length > 0) {
          console.log("\n🎯 Exemplos de produtos em promoção:");
          exemplosPromocao.forEach((p) => {
            console.log(`  - ${p.nome.substring(0, 50)}: Normal R$ ${p.precoNormal.toFixed(2)} → Promo R$ ${p.precoPromocional.toFixed(2)}`);
          });
        }
        console.log("=========================================");
        
      } catch (error) {
        console.error("Erro ao ler dados da planilha:", error);
        alert("Erro crítico ao processar planilha com células mescladas.");
      }
    };

    reader.readAsBinaryString(file);
  }, [file]);

  // ------------------------------- IMPORTAÇÃO PARA O BANCO DE DADOS ---------------------------------
  const importProductsData = useCallback(async () => {
    if (produtosJSON.length === 0) {
      alert("⏳ Aguarde o processamento da planilha ou selecione um arquivo válido!");
      return;
    }

    const promocoesCount = produtosJSON.filter(p => p.precoPromocional).length;
    const pesoCount = produtosJSON.filter(p => p.sold_by_weight).length;
    
    console.log(`📦 Iniciando importação de ${produtosJSON.length} produtos...`);
    console.log(`🏷️ Produtos em promoção: ${promocoesCount}`);
    console.log(`⚖️ Produtos por peso: ${pesoCount}`);
    console.log(`📦 Produtos por unidade: ${produtosJSON.length - pesoCount}`);

    try {
      setLoading(true);
      const TAMANHO_LOTE = 500;

      for (let i = 0; i < produtosJSON.length; i += TAMANHO_LOTE) {
        const lote = produtosJSON.slice(i, i + TAMANHO_LOTE);
        console.log(`📤 Enviando lote ${Math.floor(i / TAMANHO_LOTE) + 1}/${Math.ceil(produtosJSON.length / TAMANHO_LOTE)} (${lote.length} produtos)...`);
        console.log(`   Promoções: ${lote.filter((p) => p.precoPromocional).length}`);
        console.log(`   Por peso: ${lote.filter((p) => p.sold_by_weight).length}`);

        await fetchPostXlsxFile(lote);
      }

      alert(`🎉 ${produtosJSON.length} produtos importados!\n📦 ${produtosJSON.length - pesoCount} por unidade\n⚖️ ${pesoCount} por peso\n🏷️ ${promocoesCount} em promoção`);
      console.log("✅ Importação finalizada!");
    } catch (error) {
      console.error("❌ Erro ao importar produtos:", error);
      alert("Ocorreu um erro no envio. Verifique o console.");
    } finally {
      setLoading(false);
    }
  }, [produtosJSON]);

  useEffect(() => {
    if (file) {
      processFile();
    }
  }, [file, processFile]);

  return {
    loading,
    produtosJSON,
    produtosPorCategoria,
    importProductsData,
    handleFileChange,
    statsClassificacao, 
  };
}