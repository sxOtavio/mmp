import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request, { params }) {
  let client;

  try {
    const { orderId } = await params;
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Informe o item a ser removido" },
        { status: 400 },
      );
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const deleteResult = await client.query(
      `DELETE FROM order_items WHERE id = $1 AND order_id = $2 RETURNING id`,
      [itemId, orderId],
    );

    if (deleteResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Item não encontrado no pedido" },
        { status: 404 },
      );
    }

    const totalResult = await client.query(
      `SELECT COALESCE(SUM(oi.unit_price * COALESCE(oi.actual_weight, oi.quantity)), 0) AS new_total
       FROM order_items oi
       WHERE oi.order_id = $1`,
      [orderId],
    );

    const newTotal = Number(totalResult.rows[0].new_total || 0);

    await client.query(
      `UPDATE orders SET total = $1, updated_at = NOW() WHERE id = $2`,
      [newTotal, orderId],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      newTotal,
      message: "Item removido com sucesso",
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Erro ao remover item:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao remover item" },
      { status: 500 },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
