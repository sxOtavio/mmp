import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  let client;

  try {
    client = await pool.connect();

    const result = await client.query(`
      SELECT
        o.id AS order_id,
        o.status,
        o.total,
        o.created_at,

        u.name AS cliente_nome,
        u.phone,
        u.address,
        u.number,
        u.region,
        u.city,

        oi.product_name,
        oi.quantity,
        oi.unit_price

      FROM orders o

      INNER JOIN users u
        ON u.id = o.user_id

      INNER JOIN order_items oi
        ON oi.order_id = o.id

      WHERE o.status = 'pending'

      ORDER BY o.created_at ASC
    `);

    const pedidosMap = {};

    result.rows.forEach((row) => {
      if (!pedidosMap[row.order_id]) {
        pedidosMap[row.order_id] = {
          id: row.order_id,
          status: row.status,
          total: Number(row.total),
          createdAt: row.created_at,

          cliente: {
            nome: row.cliente_nome,
            telefone: row.phone,
            endereco: row.address,
            numero: row.number,
            bairro: row.region,
            cidade: row.city,
          },

          itens: [],
        };
      }

      pedidosMap[row.order_id].itens.push({
        nome: row.product_name,
        quantidade: row.quantity,
        preco: Number(row.unit_price),
      });
    });

    return NextResponse.json(
      Object.values(pedidosMap)
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao buscar pedidos" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}