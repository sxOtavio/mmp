import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request) {
  console.log(" API /compiler recebeu uma requisição POST");
  try {
    const { produtos } = await request.json();
    console.log(" Dados recebidos na API - quantidade:", produtos?.length);

    if (!produtos || produtos.length === 0) {
      console.warn(" Lote vazio recebido. Ignorando requisição.");
      return NextResponse.json({ 
        success: false, 
        message: "Lote vazio recebido." 
      }, { status: 400 });
    }

    console.log(` Processando lote de ${produtos.length} produtos.`);

    const client = await pool.connect();
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      const queryText = `
        INSERT INTO products (
          gtin_code, 
          name, 
          price, 
          promotion_price, 
          stock, 
          category,
          sold_by_weight,
          unit_type,
          weight_per_unit,
          updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (gtin_code) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          promotion_price = EXCLUDED.promotion_price,
          stock = EXCLUDED.stock,
          category = EXCLUDED.category,
          sold_by_weight = EXCLUDED.sold_by_weight,
          unit_type = EXCLUDED.unit_type,
          weight_per_unit = EXCLUDED.weight_per_unit,
          updated_at = NOW()
      `;

      // Estatísticas de classificação
      let stats = {
        porPeso: 0,
        porUnidade: 0,
        comPromocao: 0
      };

      for (let index = 0; index < produtos.length; index++) {
        const item = produtos[index];
        
        try {
          // Validação básica
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

          const soldByWeight = item.sold_by_weight !== undefined ? item.sold_by_weight : false;
          const unitType = item.unit_type || 'unidade';
          const weightPerUnit = item.weight_per_unit || 0.5;

          // Atualiza estatísticas
          if (soldByWeight) {
            stats.porPeso++;
          } else {
            stats.porUnidade++;
          }
          if (item.precoPromocional) {
            stats.comPromocao++;
          }

          const values = [
            String(item.gtin).trim(),
            String(item.nome).trim(),
            Number(item.precoNormal) || 0,
            item.precoPromocional ? Number(item.precoPromocional) : null,
            Number(item.estoque) || 0,
            String(item.category || item.categoria || "SEM_CATEGORIA").trim(),
            soldByWeight,                    // sold_by_weight
            unitType,                        // unit_type
            Number(weightPerUnit) || 0.5,   //  weight_per_unit
          ];

          // Log detalhado para os primeiros produtos
          if (index < 3) {
            console.log(`[Produto ${index}] GTIN: ${values[0]}, Nome: ${values[1].substring(0, 40)}...`);
            console.log(`   Classificação: ${soldByWeight ? '⚖️ Peso' : '📦 Unidade'} | Tipo: ${unitType} | Peso: ${weightPerUnit}kg`);
          }

          await client.query(queryText, values);
          successCount++;
          
        } catch (itemError) {
          errorCount++;
          errors.push(`[Linha ${index}] ${item.gtin}: ${itemError.message}`);
          console.error(`❌ Erro na linha ${index}:`, itemError.message);
        }
      }

      //  RELATÓRIO DE CLASSIFICAÇÃO
      console.log('\n📊 RELATÓRIO DE CLASSIFICAÇÃO:');
      console.log(`⚖️ Produtos por PESO: ${stats.porPeso}`);
      console.log(`📦 Produtos por UNIDADE: ${stats.porUnidade}`);
      console.log(`🏷️ Produtos em PROMOÇÃO: ${stats.comPromocao}`);
      console.log(`✅ Sucessos: ${successCount} | ❌ Erros: ${errorCount}`);

      const message = `Lote processado: ${successCount} sucesso, ${errorCount} erro(s)`;
      console.log(`✅ ${message}`);
      
      if (errors.length > 0) {
        console.warn("⚠️ Exemplos de erros:", errors.slice(0, 5));
      }

      return NextResponse.json({ 
        success: errorCount === 0, 
        message: message,
        successCount,
        errorCount,
        stats, //  Retorna estatísticas
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