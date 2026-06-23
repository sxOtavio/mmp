import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET (request, { params }) {
  let client;

  try {
    const { id } = await params;
    console.log("params",id);
    client = await pool.connect();

    const result = await client.query(`
      SELECT
        o.id AS order_id,
        o.status,
        o.total,
        o.created_at,
        o.updated_at,

        u.id AS cliente_id,
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

      WHERE o.id = $1

      ORDER BY oi.id ASC
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    const pedido = {
      id: result.rows[0].order_id,
      status_pedido: result.rows[0].status,
      total: Number(result.rows[0].total),
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      cliente: {
        id: result.rows[0].cliente_id,
        nome: result.rows[0].cliente_nome,
        telefone: result.rows[0].phone,
        endereco: result.rows[0].address,
        numero: result.rows[0].number,
        bairro: result.rows[0].region,
        cidade: result.rows[0].city,
      },
      itens: result.rows.map(row => ({
        nome: row.product_name,
        quantidade: row.quantity,
        preco: Number(row.unit_price),
      }))
    };

    return NextResponse.json(pedido);

  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}