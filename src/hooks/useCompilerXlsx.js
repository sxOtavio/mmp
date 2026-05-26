import { useRouter } from "next/navigation";
import { useState, useCallback , useEffect} from "react";
import * as XLSX from "xlsx"; // Biblioteca para ler arquivos XLSX

export function useCompilerXlsx() {
  const router = useRouter(); // ✨ No Next.js usamos router em vez de navigate
  const [auth, setAuth] = useState({
    loginData: null,   
    token: null,       
    loading: false,    
  });
   const [produtosJSON, setProdutosJSON] = useState([]); 
//------------------------------- IMPORTAÇÃO DO ARQUIVO XLSX--------------------------------------------------------------------------
    const [file, setFile] = useState(null);
  const handleFileChange = (e) => {
    console.log("Arquivos recebidos no hook")
    // Verifica se o usuário realmente selecionou um arquivo
    console.log("-> Hook guardou o arquivo:", e || "Nenhum arquivo selecionado");
      setFile(e);
      // LOG CORRETO: Usando a variável local para não pegar o estado atrasado
      console.log("Sucesso!! Arquivo sendo processado");
    
  };
//------------------------------- TRATAMENTO DO ARQUIVO XLSX --------------------------------------------------------------------------

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

      // 1. Lê a planilha como matriz pura (Array de Arrays) para ignorar a mesclagem de cabeçalho
      const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      console.log(`-> Linhas totais na matriz crua: ${matrix.length}`);

      const produtosTratados = [];

      // 2. Varrer a planilha linha por linha
      matrix.forEach((linha, index) => {
        // Ignora linhas que não são arrays ou estão totalmente vazias
        if (!Array.isArray(linha) || linha.length === 0) return;

        // O GTIN/Código de barras costuma ser o primeiro item da linha com números longos
        const primeiraCelula = String(linha[0] || "").trim();

        // VALIDAÇÃO EXTREMA: Só processa a linha se a primeira célula for um GTIN válido 
        const ehGtinValido = /^\d{1,14}$/.test(primeiraCelula);

        if (ehGtinValido) {
          const gtin = primeiraCelula;
          // Contamos as posições (índices) das colunas da esquerda para a direita:
          // linha[1] = Código (GTIN)
          // linha[2] = Código de referência
          // linha[3] = Nome do Produto
          const nome = String(linha[3] || "").trim();
          // Busca inteligente  os preços são os últimos valores numéricos
          const valoresNumericos = linha.filter(celula => typeof celula === "number" || (!isNaN(Number(String(celula).replace(",", "."))) && String(celula).trim() !== ""));

          const estoqueRaw = String(linha[8] || linha[9] || "0").replace(",", ".");
          const estoque = Math.floor(Number(estoqueRaw)) || 0;

          // Preço Atual geralmente é o último valor da linha
          const precoAtualRaw = String(linha[linha.length - 1] || "0").replace(",", ".");
          const precoAtual = Number(precoAtualRaw) || 0;

          // Preço Anterior (Preço Normal)
          const precoAnteriorRaw = String(linha[linha.length - 3] || precoAtual).replace(",", ".");
          const precoNormal = Number(precoAnteriorRaw) || 0;

          // Preço Promoção
          const precoPromoRaw = String(linha[linha.length - 2] || "").replace(",", ".");
          const precoPromocional = precoPromoRaw && !isNaN(Number(precoPromoRaw)) && Number(precoPromoRaw) !== precoNormal && Number(precoPromoRaw) !== precoAtual ? Number(precoPromoRaw) : null;

          console.log(`[Produto Encontrado] GTIN: ${gtin} | ${nome} | Est: ${estoque} | Preço Normal: R$ ${precoNormal} |Preço Promocional: R$ ${precoPromocional} | Atual: R$ ${precoAtual}`);

          produtosTratados.push({
            gtin,
            nome,
            precoNormal: precoNormal > 0 ? precoNormal : precoAtual,
            precoPromocional,
            estoque
          });
        }
      });
      setProdutosJSON(produtosTratados);
      console.log("-> Mapeamento por Matriz concluído!", produtosTratados);

    } catch (error) {
      console.error("Erro ao ler dados da planilha:", error);
      alert("Erro crítico ao processar planilha com células mescladas.");
    }
  };

  reader.readAsBinaryString(file);
}, [file]);





//------------------------------- IMPORTAÇÃO DO ARQUIVO XLSX PARA O BANCO DE DADOS ----------------------------------------------------

    const importProductsData = useCallback(async () => {
      console.log("chamando a funcao de servicos API...");
    try {
       setLoading(true);
    

    } catch (error) {
      console.error("Erro ao importar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, []);
 //------------------------USE EFFECT PARA PROCESSAR OS ARQUIVOS-------------------

 useEffect(() => {
    if (file) {
      processFile();
    }
  }, [file, processFile]);
  

  return {
    
    //Variaves exportadas

    //Hooks exportados
    importProductsData,
    handleFileChange,
};
}