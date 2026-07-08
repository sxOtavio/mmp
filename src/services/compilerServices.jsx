// src/services/compilerServices.js
const API_URL = "http://localhost:3000/api";

export async function fetchPostXlsxFile(lote) {
    console.log("📤 Enviando lote para a API:", lote.length, "produtos");
    
    //  LOG DOS PRODUTOS POR PESO NO LOTE
    const porPeso = lote.filter(p => p.sold_by_weight).length;
    const porUnidade = lote.filter(p => !p.sold_by_weight).length;
    console.log(`   ⚖️ Por peso: ${porPeso}`);
    console.log(`   📦 Por unidade: ${porUnidade}`);
    console.log("   Exemplo de classificação:", lote[0] ? {
        nome: lote[0].nome,
        sold_by_weight: lote[0].sold_by_weight,
        unit_type: lote[0].unit_type,
        weight_per_unit: lote[0].weight_per_unit
    } : 'Nenhum produto');
        
    try {
        const response = await fetch(`/api/compiler`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ produtos: lote }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao compilar: " + response.statusText);
        }
        
        const result = await response.json();
        console.log(`✅ Lote enviado com sucesso!`);
        return result;
        
    } catch (error) {
        console.error("❌ Erro na requisição do compiler:", error);
        throw error;
    }
}