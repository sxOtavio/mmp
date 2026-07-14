// src/app/api/orders/[id]/realPeso/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request, { params }) {
  const { id: orderId } = await params;
  let client;

  try {
    client = await pool.connect();
    const body = await request.json();

    const items = body.items || body.itens || [];

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item para atualizar" },
        { status: 400 },
      );
    }

    console.log("📦 Atualizando pesos para ordem:", orderId);
    console.log("📦 Itens:", items);

    await client.query("BEGIN");

    for (const item of items) {
      const itemId =
        item.id || item.item_id || item.order_item_id || item.product_id;
      const pesoValue = Number(
        item.actual_weight ?? item.peso_real ?? item.real_weight ?? item.weight,
      );

      if (!itemId) {
        console.warn("⚠️ Item sem ID:", item);
        continue;
      }

      if (!Number.isFinite(pesoValue) || pesoValue <= 0) {
        console.warn("⚠️ Peso inválido para o item:", itemId, item);
        continue;
      }

      await client.query(
        `
        UPDATE order_items 
        SET 
          actual_weight = $1,
          weight_adjusted = true,
          weight_adjusted_at = NOW()
        WHERE id = $2 AND order_id = $3
        `,
        [pesoValue, itemId, orderId],
      );
    }

    // RECALCULA O TOTAL
    const totalResult = await client.query(
      `
      SELECT 
        SUM(oi.unit_price * COALESCE(oi.actual_weight, oi.quantity)) as new_total
      FROM order_items oi
      WHERE oi.order_id = $1
      `,
      [orderId],
    );

    const newTotal = Number(totalResult.rows[0].new_total || 0);

    // 🔥 REMOVIDO 'weight_adjusted_at' da tabela orders (coluna não existe)
    await client.query(
      `
      UPDATE orders 
      SET 
        total = $1,
        status = 'weight_revised',
        updated_at = NOW()
      WHERE id = $2
      `,
      [newTotal, orderId],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      newTotal,
      message: "Pesos atualizados com sucesso",
    });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("❌ Erro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
