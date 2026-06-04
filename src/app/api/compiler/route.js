import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request) {
  console.log("API /compiler recebeu uma requisição POST");
  try {
    const { produtos } = await request.json();
    console.log("Dados recebidos na API - quantidade:", produtos?.length);

    if (!produtos || produtos.length === 0) {
      console.warn("Lote vazio recebido. Ignorando requisição.");
      return NextResponse.json({ success: false, message: "Lote vazio recebido." }, { status: 400 });
    }

    console.log(`POST recebido na API. Processando lote de ${produtos.length} produtos.`);

    const client = await pool.connect();
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      const queryText = `
        INSERT INTO products (gtin_code, name, price, promotion_price, stock, category) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (gtin_code) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          promotion_price = EXCLUDED.promotion_price,
          stock = EXCLUDED.stock,
          category = EXCLUDED.category
      `;

      for (let index = 0; index < produtos.length; index++) {
        const item = produtos[index];
        
        try {
          // Validação antes de enviar ao banco
          if (!item.gtin || item.gtin === "") {
            errors.push(`[Linha ${index}] GTIN vazio ou nulo`);
            errorCount++;
            continue;
          }
          
          if (!item.nome || item.nome === "") {
            errors.push(`[Linha ${index}] Nome vazio: ${item.gtin}`);
            errorCount++;
            continue;
          }

          const values = [
            String(item.gtin).trim(),
            String(item.nome).trim(),
            Number(item.precoNormal) || 0,
            item.precoPromocional ? Number(item.precoPromocional) : null,
            Number(item.estoque) || 0,
            String(item.category || item.categoria || "SEM_CATEGORIA").trim()
          ];

          // Log detalhado só para os primeiros 3 produtos
          if (index < 3) {
            console.log(`[Produto ${index}] GTIN: ${values[0]}, Nome: ${values[1].substring(0, 40)}..., Normal: ${values[2]}, Promo: ${values[3]}, Estoque: ${values[4]}`);
          }

          await client.query(queryText, values);
          successCount++;
        } catch (itemError) {
          errorCount++;
          errors.push(`[Linha ${index}] ${item.gtin}: ${itemError.message}`);
          console.error(`Erro na linha ${index}:`, itemError.message);
        }
      }

      const message = `Lote processado: ${successCount} sucesso, ${errorCount} erro(s)`;
      console.log(`✅ ${message}`);
      
      if (errors.length > 0) {
        console.warn("Exemplos de erros:", errors.slice(0, 5));
      }

      return NextResponse.json({ 
        success: errorCount === 0, 
        message: message,
        successCount,
        errorCount,
        errors: errors.slice(0, 10)
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error("❌ Erro crítico ao popular o banco:", error);
    return NextResponse.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}