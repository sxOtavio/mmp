import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; 

export async function GET() {
  const client = await pool.connect();
  try {
    // Buscamos a lista crua de códigos de barras ativos no PostgreSQL
    const result = await client.query(`
      SELECT gtin_code FROM products WHERE active = true;
    `);
    
    // Transforma as linhas do banco em um array simples de strings/números
    const listaGtins = result.rows.map(row => String(row.gtin_code).trim());

    return NextResponse.json({ listaGtins });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
/**Codigo pra auditoriai no devtools F12
 * ele compara os gtins unicos da planilha pra ter certeza que o banco recebeu 
 * todos os produtos unicos sem perder nenhum por causa das linhas duplicadas.
 

 (() => {
  if (!window.produtosPlanilhaDebug) {
    console.error("❌ ERRO: Selecione a planilha antes de rodar o script!");
    return;
  }

  // 1. Pega os GTINs da planilha e limpa os espaços
  const todosGtinsPlanilha = window.produtosPlanilhaDebug.map(p => String(p.gtin).trim());
  
  // O PULO DO GATO: O 'new Set()' elimina todas as 4.243 linhas duplicadas automaticamente!
  const gtinsUnicosPlanilha = [...new Set(todosGtinsPlanilha)];

  fetch("/api/compiler/auditoria")
    .then(res => res.json())
    .then(dadosBanco => {
      const gtinsBanco = dadosBanco.listaGtins || []; 
      
      // Encontra se de fato algum código único sumiu
      const faltaram = gtinsUnicosPlanilha.filter(gtin => !gtinsBanco.includes(gtin));
      
      console.clear();
      console.log("%c📊 RELATÓRIO DE AUDITORIA REAL (SEM DUPLICADAS)", "font-weight: bold; font-size: 14px; color: #eab308;");
      console.log(`📋 Linhas totais na Planilha: ${todosGtinsPlanilha.length}`);
      console.log(`📦 Produtos ÚNICOS reais na Planilha: ${gtinsUnicosPlanilha.length}`);
      console.log(`🗄️ Total gravado no Banco: ${gtinsBanco.length}`);
      console.log(`🔄 Linhas repetidas que o banco apenas atualizou (Upsert): ${todosGtinsPlanilha.length - gtinsUnicosPlanilha.length}`);
      
      if (gtinsUnicosPlanilha.length === gtinsBanco.length && faltaram.length === 0) {
        console.log("%c✓ CONFIRMADO! O banco de dados recebeu 100% dos produtos únicos. A sincronização foi perfeita! 🎉", "color: #22c55e; font-weight: bold;");
      } else {
        console.log(`%c✕ ERRO REAL: Faltaram ${faltaram.length} produtos únicos entrarem no banco!`, "color: #ef4444; font-weight: bold;");
        console.table(faltaram);
      }
    });
})();


 * 
 */