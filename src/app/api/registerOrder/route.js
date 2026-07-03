import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import jwt from "jsonwebtoken";
import { criarCheckout } from "@/lib/pagBank";

export async function POST(request) {
  let client;

  try {
    client = await pool.connect();
    const body = await request.json();
    const { customer, items, total, pagamento, parcelas } = body;
    console.log(" Dados Recebidos do pedido:", body);

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token não enviado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await client.query(
      `SELECT cpf FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const user = userResult.rows[0];

    await client.query("BEGIN");

    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, status, total)
      VALUES ($1, 'pending', $2)
      RETURNING *
      `,
      [decoded.userId, total]
    );
    const order = orderResult.rows[0];

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

    const cpfLimpo = user.cpf ? user.cpf.replace(/\D/g, '') : '';
    const cepLimpo = customer.cep ? customer.cep.replace(/\D/g, '') : '';
    const cepFormatado = cepLimpo.padStart(8, '0');

    const pagbankItems = items.map((item) => ({
      reference_id: String(item.gtin),
      name: item.nome,
      quantity: Number(item.quantity),
      unit_amount: Math.round((Number(item.precoPromocional) || Number(item.precoNormal)) * 100),
    }));

    // Montando os dados para enviar ao PagBank Checkout
    const dadosCheckout = {
      reference_id: `checkout-${order.id}`,
      
      customer: {
        name: customer.nome,
        email: customer.email,
        tax_id: cpfLimpo,
      },
      
      items: pagbankItems,
      
      payment_methods: [
        { type: "CREDIT_CARD" },
        { type: "BOLETO" },
        { type: "PIX" }
      ],
      
      redirect_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pending`
      }
      
      // tenho q recolocar o  webhook notification_urls e mudar o status de pending para paid quando receber o webhook
      
    };

    console.log("Enviando para PagBank Checkout:", JSON.stringify(dadosCheckout, null, 2));

    const accessToken = process.env.PAGBANK_SANDBOX_TOKEN;
    if (!accessToken) {
      throw new Error("Token do PagBank não configurado no .env.local");
    }

    const respostaCheckout = await criarCheckout(dadosCheckout, accessToken);
    console.log(" Resposta Checkout:", JSON.stringify(respostaCheckout, null, 2));

    let paymentLink = null;
    if (respostaCheckout?.links) {
      const payLink = respostaCheckout.links.find(l => l.rel === "PAY" || l.rel === "CHECKOUT");
      paymentLink = payLink?.href;
    }

    if (!paymentLink) {
      console.error("❌ Nenhum link de checkout encontrado:", respostaCheckout);
      throw new Error("PagBank não retornou um link de checkout");
    }

    console.log(" Link de checkout:", paymentLink);

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      orderId: order.id,
      payment_link: paymentLink,
      pagbank_response: respostaCheckout,
    });

  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("❌ Erro na API de pedido:", error);

    let statusCode = 500;
    let errorMessage = error.message;

    if (error.message.includes("401")) {
      statusCode = 401;
      errorMessage = "Erro de autenticação com o PagBank. Verifique o token.";
      
    } else if (error.message.includes("400")) {
      statusCode = 400;
      errorMessage = `Dados inválidos para o PagBank: ${error.message}`;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.response?.data || error.toString(),
      },
      { status: statusCode }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}