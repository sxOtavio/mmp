"use client";
import { useRouter } from "next/navigation";
import { useState, useCallback , useEffect} from "react";
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

  // ------------------------------- IMPORTAÇÃO DO ARQUIVO XLSX --------------------------------------------------------------------------
  const handleFileChange = (fileObj) => {
    console.log("Arquivos recebidos no hook");
    console.log("-> Hook guardou o arquivo:", fileObj ? fileObj.name : "Nenhum arquivo selecionado");
    setFile(fileObj);
    console.log("Sucesso!! Arquivo pronto para o processamento");
  };

  // ------------------------------- TRATAMENTO DO ARQUIVO XLSX --------------------------------------------------------------------------
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
        const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        console.log(`-> Linhas totais na matriz crua: ${matrix.length}`);

        // ============ MAPEAMENTO DINÂMICO DAS COLUNAS ============
        let headerRowIndex = -1;
        let precoPromocaoColIndex = -1;
        let precoAnteriorColIndex = -1;
        let precoAtualColIndex = -1;
        let estoqueColIndex = -1;
        let produtoColIndex = -1;
        let gtinColIndex = 0; // GTIN geralmente na primeira coluna (índice 0)

        // Procura pela linha de cabeçalho
        for (let i = 0; i < matrix.length; i++) {
          const row = matrix[i];
          if (!row || !Array.isArray(row)) continue;
          
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || "").trim();
            
            if (cell === "Preço Promoção" || cell === "Preço Promoção") {
              headerRowIndex = i;
              precoPromocaoColIndex = j;
            }
            if (cell === "Preço Anterior") {
              headerRowIndex = i;
              precoAnteriorColIndex = j;
            }
            if (cell === "Preço Atual") {
              headerRowIndex = i;
              precoAtualColIndex = j;
            }
            if (cell === "Estoque") {
              headerRowIndex = i;
              estoqueColIndex = j;
            }
            if (cell === "Produto") {
              headerRowIndex = i;
              produtoColIndex = j;
            }
          }
          
          // Se já encontrou o cabeçalho, para a busca
          if (headerRowIndex !== -1 && precoPromocaoColIndex !== -1) {
            break;
          }
        }

        // Se não encontrou todas as colunas, usa os índices fixos como fallback
        if (headerRowIndex === -1) {
          console.warn("Não encontrou linha de cabeçalho, usando índices fixos");
          headerRowIndex = 4; // Linha típica onde começa os dados após os cabeçalhos da empresa
        }

        // Índices fixos com base na estrutura da sua planilha
        const FIXED_GTIN_COL = 0;
        const FIXED_PRODUTO_COL = 3;
        const FIXED_ESTOQUE_COL = 8;
        const FIXED_PRECO_ANTERIOR_COL = 11;
        const FIXED_PRECO_PROMOCAO_COL = 13;
        const FIXED_PRECO_ATUAL_COL = 14;

        console.log(`Cabeçalho encontrado na linha ${headerRowIndex}`);
        console.log(`Colunas mapeadas - Promoção:${precoPromocaoColIndex}, Anterior:${precoAnteriorColIndex}, Atual:${precoAtualColIndex}, Estoque:${estoqueColIndex}, Produto:${produtoColIndex}`);

       const produtosTratados = [];
       const categoriasProdutos = {}; // Organiza produtos por categoria
       let currentCategory = "SEM_CATEGORIA";

        // ============ PROCESSAMENTO DAS LINHAS ============
        // Começa da linha após o cabeçalho encontrado (ou linha 5 se não encontrou)
        const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 5;
        
        const CATEGORY_SKIP_KEYWORDS = [
          "codigo",
          "código",
          "produto",
          "produtos",
          "preço",
          "preco",
          "estoque",
          "empresa",
          "registro",
          "promoção",
          "promocao",
          "página",
          "pagina",
          "page",
          "total",
          "subtotal",
          "unidade",
          "valor",
          "marca"
        ];

        for (let i = startRow; i < matrix.length; i++) {
          const linha = matrix[i];
          
          // Validação da linha
          if (!linha || !Array.isArray(linha) || linha.length === 0) continue;
          
          // Pega o GTIN/Código (primeira coluna)
          const gtinRaw = String(linha[FIXED_GTIN_COL] || "").trim();
          
          // Filtra linhas que não são produtos (vazias, textos, etc)
          if (!gtinRaw || gtinRaw === "" || gtinRaw === "Empresa:" || gtinRaw === "Registro(s):") continue;
          
          // Valida se é um GTIN válido (apenas números, entre 8 e 14 dígitos)
          // Aceita também códigos internos como "177", "77", "11011", etc
          const isNumericGtin = /^\d+$/.test(gtinRaw);
          
          const rowTextLower = linha
            .map((cell) => String(cell || "").trim().toLowerCase())
            .filter(Boolean)
            .join(" ");

          const isHeaderLikeRow = CATEGORY_SKIP_KEYWORDS.some((keyword) => rowTextLower.includes(keyword));

          // ============ DETECÇÃO DE CATEGORIA ============
          // Se o GTIN não é numérico e a linha não parece ser um cabeçalho / quebra de página
          if (!isNumericGtin) {
            if (isHeaderLikeRow) {
              continue;
            }

            currentCategory = gtinRaw;
            if (!categoriasProdutos[currentCategory]) {
              categoriasProdutos[currentCategory] = [];
            }
            console.log(`📂 Categoria detectada: ${currentCategory}`);
            continue;
          }
          
          if (!isNumericGtin) continue;
          
          // ============ NOME DO PRODUTO ============
          let nome = "";
          if (produtoColIndex !== -1 && linha[produtoColIndex]) {
            nome = String(linha[produtoColIndex]).trim();
          } else if (linha[FIXED_PRODUTO_COL]) {
            nome = String(linha[FIXED_PRODUTO_COL]).trim();
          }
          
          if (!nome) continue; // Pula linhas sem nome de produto
          
          // ============ ESTOQUE ============
          let estoque = 0;
          let estoqueRaw = "0";
          
          if (estoqueColIndex !== -1 && linha[estoqueColIndex] !== undefined) {
            estoqueRaw = String(linha[estoqueColIndex]).replace(",", ".");
          } else if (linha[FIXED_ESTOQUE_COL] !== undefined) {
            estoqueRaw = String(linha[FIXED_ESTOQUE_COL]).replace(",", ".");
          }
          
          estoque = Number(estoqueRaw);
          if (isNaN(estoque)) estoque = 0;
          
          // ============ PREÇO ATUAL ============
          let precoAtual = 0;
          let precoAtualRaw = "0";
          
          if (precoAtualColIndex !== -1 && linha[precoAtualColIndex] !== undefined) {
            precoAtualRaw = String(linha[precoAtualColIndex]).replace(",", ".");
          } else if (linha[FIXED_PRECO_ATUAL_COL] !== undefined) {
            precoAtualRaw = String(linha[FIXED_PRECO_ATUAL_COL]).replace(",", ".");
          }
          
          precoAtual = Number(precoAtualRaw);
          if (isNaN(precoAtual)) precoAtual = 0;
          
          // ============ PREÇO ANTERIOR (NORMAL) ============
          let precoNormal = precoAtual; // Fallback para preço atual
          let precoAnteriorRaw = "";
          
          if (precoAnteriorColIndex !== -1 && linha[precoAnteriorColIndex] !== undefined) {
            precoAnteriorRaw = String(linha[precoAnteriorColIndex]).replace(",", ".");
          } else if (linha[FIXED_PRECO_ANTERIOR_COL] !== undefined) {
            precoAnteriorRaw = String(linha[FIXED_PRECO_ANTERIOR_COL]).replace(",", ".");
          }
          
          if (precoAnteriorRaw && precoAnteriorRaw !== "") {
            const parsed = Number(precoAnteriorRaw);
            if (!isNaN(parsed) && parsed > 0) {
              precoNormal = parsed;
            }
          }
          
          // ============ PREÇO PROMOÇÃO (CORREÇÃO PRINCIPAL) ============
          let precoPromocional = null;
          let precoPromocaoRaw = "";
          
          // Tenta pegar da coluna dinâmica primeiro
          if (precoPromocaoColIndex !== -1 && linha[precoPromocaoColIndex] !== undefined) {
            precoPromocaoRaw = String(linha[precoPromocaoColIndex]).trim().replace(",", ".");
          }
          
          // Se não encontrou, tenta o índice fixo
          if ((!precoPromocaoRaw || precoPromocaoRaw === "") && linha[FIXED_PRECO_PROMOCAO_COL] !== undefined) {
            precoPromocaoRaw = String(linha[FIXED_PRECO_PROMOCAO_COL]).trim().replace(",", ".");
          }
          
          // Processa o valor da promoção
          if (precoPromocaoRaw && precoPromocaoRaw !== "" && precoPromocaoRaw !== "0") {
            const valorPromocao = Number(precoPromocaoRaw);
            
            // Verifica se é um número válido
            if (!isNaN(valorPromocao) && valorPromocao > 0) {
              // Só considera como promoção se for DIFERENTE do preço normal E do preço atual
              // E se for menor que o preço normal (ou algum critério de negócio)
              const isDifferentFromNormal = Math.abs(valorPromocao - precoNormal) > 0.01;
              const isDifferentFromCurrent = Math.abs(valorPromocao - precoAtual) > 0.01;
              
              if (isDifferentFromNormal || isDifferentFromCurrent) {
                precoPromocional = valorPromocao;
              }
            }
          }
          
          // Log para debug (opcional - remover em produção)
          if (precoPromocional) {
            console.log(`[PROMOÇÃO] ${nome.substring(0, 40)}... | Normal: R$ ${precoNormal.toFixed(2)} | Promo: R$ ${precoPromocional.toFixed(2)} | Atual: R$ ${precoAtual.toFixed(2)}`);
          }
          
          // ============ CRIA OBJETO DO PRODUTO ============
          const produto = {
            gtin: gtinRaw,
            nome: nome,
            precoNormal: precoNormal > 0 ? precoNormal : precoAtual,
            precoPromocional: precoPromocional,
            estoque: estoque,
            categoria: currentCategory,
            category: currentCategory
          };
          
          // Adiciona o produto ao array final
          produtosTratados.push(produto);
          
          // Adiciona o produto ao array de sua categoria
          if (!categoriasProdutos[currentCategory]) {
            categoriasProdutos[currentCategory] = [];
          }
          categoriasProdutos[currentCategory].push(produto);
        }
        
        setProdutosJSON(produtosTratados);
        setProdutosPorCategoria(categoriasProdutos);

        // Debug - disponibiliza no console global
        window.produtosPlanilhaDebug = produtosTratados; 

        console.log("=========================================");
        console.log(`✅ Total de produtos processados: ${produtosTratados.length}`);
        console.log(`📦 Produtos com estoque positivo: ${produtosTratados.filter(p => p.estoque > 0).length}`);
        console.log(`🏷️  Produtos com preço promocional: ${produtosTratados.filter(p => p.precoPromocional).length}`);
        console.log(`📂 Categorias encontradas: ${Object.keys(categoriasProdutos).length}`);
        Object.entries(categoriasProdutos).forEach(([cat, prods]) => {
          const promoCount = prods.filter(p => p.precoPromocional).length;
          console.log(`   - ${cat}: ${prods.length} produtos (${promoCount} com promoção)`);
        });
        console.log("=========================================");
        
        // Mostra alguns exemplos de produtos com promoção
        const promosExemplo = produtosTratados.filter(p => p.precoPromocional).slice(0, 5);
        if (promosExemplo.length > 0) {
          console.log("Exemplos de produtos com promoção:");
          promosExemplo.forEach(p => {
            console.log(`  - ${p.nome.substring(0, 50)}: R$ ${p.precoPromocional}`);
          });
        }
        
      } catch (error) {
        console.error("Erro ao ler dados da planilha:", error);
        alert("Erro crítico ao processar planilha com células mescladas.");
      }
    };

    reader.readAsBinaryString(file);
  }, [file]);

  // ------------------------------- IMPORTAÇÃO DO ARQUIVO XLSX PARA O BANCO DE DADOS ----------------------------------------------------
  const importProductsData = useCallback(async () => {
    if (produtosJSON.length === 0) {
      alert("⚠️ Aguarde o processamento da planilha ou selecione um arquivo válido!");
      return;
    }

    console.log(`🚀 Iniciando importação de ${produtosJSON.length} produtos em lotes...`);
    console.log(`📊 Produtos com promoção a serem enviados: ${produtosJSON.filter(p => p.precoPromocional).length}`);
    
    try {
      setLoading(true);
      const TAMANHO_LOTE = 500;

      for (let i = 0; i < produtosJSON.length; i += TAMANHO_LOTE) {
        const lote = produtosJSON.slice(i, i + TAMANHO_LOTE);
        console.log(`📤 Enviando lote ${Math.floor(i / TAMANHO_LOTE) + 1}/${Math.ceil(produtosJSON.length / TAMANHO_LOTE)} (${lote.length} produtos)...`);
        console.log(`   Produtos com promoção neste lote: ${lote.filter(p => p.precoPromocional).length}`);
        
        await fetchPostXlsxFile(lote); 
      }

      alert(`🎉 ${produtosJSON.length} produtos foram importados com sucesso!`);
      console.log("✅ Importação finalizada com sucesso!");

    } catch (error) {
      console.error("❌ Erro ao importar produtos:", error);
      alert("Ocorreu um erro no envio dos lotes. Verifique o console para mais detalhes.");
    } finally {
      setLoading(false);
    }
  }, [produtosJSON]);

  // ------------------------ USE EFFECT PARA PROCESSAR OS ARQUIVOS -------------------
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
  };
}