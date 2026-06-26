import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import { Preference } from "mercadopago";
import { client as mpClient } from "@/lib/mercadoPago";
import jwt from "jsonwebtoken";

export async function POST(request) {
  let client;

  try {
    client = await pool.connect();

    const body = await request.json();
    const { customer, items, total } = body;

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Token não enviado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await client.query("BEGIN");

    // Criar pedido
    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, status, total)
      VALUES ($1, 'pending', $2)
      RETURNING *
      `,
      [decoded.userId, total]
    );

    const order = orderResult.rows[0];

    // Inserir itens
    for (const item of items) {
      const unitPrice = Number(item.precoPromocional) || Number(item.precoNormal);

      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_name)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [order.id, item.gtin, item.quantity, unitPrice, item.nome]
      );
    }

    // PREFERÊNCIA NO MERCADO PAGO
    const preference = new Preference(mpClient);

    const preferenceResult = await preference.create({
      body: {
        items: items.map((item) => ({
          id: String(item.gtin),
          title: item.nome,
          description: item.nome,
          quantity: Number(item.quantity),
          currency_id: "BRL",
          unit_price: Number(item.precoPromocional) || Number(item.precoNormal),
        })),
        payer: {
          email: customer.email,
        },
        external_reference: String(order.id),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/pending`,
        },
        // auto_return: "approved", // Descomente em produção
      },
    });

    console.log(" Preference Result COMPLETO:");
    console.dir(preferenceResult, { depth: null });

    
    const initPoint = preferenceResult.body?.init_point || preferenceResult.init_point;
    const sandboxInitPoint = preferenceResult.body?.sandbox_init_point || preferenceResult.sandbox_init_point;

    console.log(" Init Point:", initPoint);
    console.log(" Sandbox Init Point:", sandboxInitPoint);

    if (!initPoint && !sandboxInitPoint) {
      console.error(" Nenhum init_point encontrado!");
      console.log("Objeto completo:", JSON.stringify(preferenceResult, null, 2));
      throw new Error("Mercado Pago não retornou init_point");
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      orderId: order.id,
      init_point: initPoint,
      sandbox_init_point: sandboxInitPoint,
      //retorne a preferência completa para debug
      preference: preferenceResult.body || preferenceResult,
    });

  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("❌ Erro na API:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.response?.data || error,
      },
      { status: error.status || 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}