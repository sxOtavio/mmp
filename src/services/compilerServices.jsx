const API_URL = "http://localhost:3000/api";

// No seu arquivo compilerServices.jsx, mude o parâmetro de produtosJSON para 'lote'
export async function fetchPostXlsxFile(lote) {
    console.log("Enviando lote para a API:", lote);
      console.log("Preco promocional tratado para cada produto:", lote.map(p => ({ precoPromocional: p.precoPromocional })));
        
  try {
    const response = await fetch(`${API_URL}/compiler`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ produtos: lote }), // <--- Envia o lote de 500 da vez
    });
    
    if (!response.ok) {
      throw new Error("Erro ao compilar: " + response.statusText);
    }
    return true;
  } catch (error) {
    console.error("Erro na requisição do compiler:", error);
    throw error; // Propaga o erro para o laço FOR interromper se necessário
  }
}
