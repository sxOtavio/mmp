import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import jwt from "jsonwebtoken";

export async function POST(request) {
  let client;

  try {
    client = await pool.connect();

    const body = await request.json();

    const {
      customer,
      items,
      total,
    } = body;

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Token não enviado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    await client.query("BEGIN");

    const orderResult = await client.query(
      `
      INSERT INTO orders
      (
        user_id,
        status,
        total
      )
      VALUES
      (
        $1,
        'pending',
        $2
      )
      RETURNING *
      `,
      [
        decoded.userId,
        total,
      ]
    );

    const order = orderResult.rows[0];
    for (const item of items) {
      const unitPrice =
        Number(item.precoPromocional) ||
        Number(item.precoNormal);

      await client.query(
        `
        INSERT INTO order_items
        (
          order_id,
          product_id,
          quantity,
          unit_price,
          product_name
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5
        )
        `,
        [
          order.id,
          item.id,
          item.quantity,
          unitPrice,
          item.nome,
        ]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });

  } catch (error) {

    if (client) {
      await client.query("ROLLBACK");
    }

    console.error(
      "Erro ao registrar pedido:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro interno no servidor",
      },
      {
        status: 500,
      }
    );

  } finally {
    if (client) {
      client.release();
    }
  }
}