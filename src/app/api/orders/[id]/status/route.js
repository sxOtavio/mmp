// app/api/orders/[id]/status/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PATCH(request, { params }) {
  let client;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    console.log(`🔄 Atualizando pedido ${id} para status: ${status}`);

    
    const statusValidos = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!statusValidos.includes(status)) {
      return NextResponse.json(
        { error: `Status inválido. Use: ${statusValidos.join(', ')}` },
        { status: 400 }
      );
    }

    client = await pool.connect();

    const checkResult = await client.query(
      "SELECT id FROM orders WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    const result = await client.query(
      `UPDATE orders 
       SET status = $1 
       WHERE id = $2 
       RETURNING id, status, total, created_at`,
      [status, id]
    );

    console.log(` Pedido ${id} atualizado para ${status}`);

    return NextResponse.json({
      success: true,
      message: `Status atualizado para ${status}`,
      order: result.rows[0]
    });

  } catch (error) {
    console.error(" Erro ao atualizar status:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do pedido" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}