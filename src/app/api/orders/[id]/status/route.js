// app/api/orders/[id]/status/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { criarCheckout } from "@/lib/pagBank";

const processarItensParaPagBank = (items = []) => {
  const pagbankItems = [];

  items.forEach((item) => {
    const unitPrice = Number(item.unit_price || item.preco || 0);
    const quantity = Number(
      item.actual_weight ??
        item.peso_real ??
        item.quantity ??
        item.quantidade ??
        1,
    );
    const isSoldByWeight = item.sold_by_weight === true;

    if (isSoldByWeight) {
      const valorTotal = unitPrice * Math.max(quantity, 1);
      pagbankItems.push({
        reference_id: String(
          item.product_id || item.id || item.product_name || "item",
        ),
        name: `${item.product_name || item.nome} (${Number(quantity).toFixed(2)}kg)`,
        quantity: 1,
        unit_amount: Math.round(valorTotal * 100),
      });
    } else {
      pagbankItems.push({
        reference_id: String(
          item.product_id || item.id || item.product_name || "item",
        ),
        name: item.product_name || item.nome,
        quantity: Math.max(1, Math.round(quantity)),
        unit_amount: Math.round(unitPrice * 100),
      });
    }
  });

  return pagbankItems;
};

export async function PATCH(request, { params }) {
  let client;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    console.log(`🔄 Atualizando pedido ${id} para status: ${status}`);

    const statusValidos = [
      "pending",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "weight_revised",
      "waiting_confirmation",
    ];

    if (!statusValidos.includes(status)) {
      return NextResponse.json(
        { error: `Status inválido. Use: ${statusValidos.join(", ")}` },
        { status: 400 },
      );
    }

    client = await pool.connect();

    const checkResult = await client.query(
      "SELECT id FROM orders WHERE id = $1",
      [id],
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    let paymentLink = null;
    const currentOrderResult = await client.query(
      `SELECT id, status, total, created_at FROM orders WHERE id = $1`,
      [id],
    );
    const currentOrder = currentOrderResult.rows[0];

    if (status === "waiting_confirmation") {
      const orderResult = await client.query(
        `SELECT
          o.id,
          o.user_id,
          o.total,
          o.shipping_frete,
          o.cliente_nome,
          o.cliente_telefone,
          o.cliente_cpf,
          o.shipping_street,
          o.shipping_number,
          o.shipping_complement,
          o.shipping_district,
          o.shipping_city,
          o.shipping_state,
          o.shipping_zip,
          o.shipping_bairro
        FROM orders o
        WHERE o.id = $1`,
        [id],
      );

      const order = orderResult.rows[0];
      const userResult = await client.query(
        `SELECT email, cpf FROM users WHERE id = $1`,
        [order.user_id],
      );
      const user = userResult.rows[0] || {};
      const itemsResult = await client.query(
        `SELECT id, product_id, quantity, unit_price, product_name, sold_by_weight, actual_weight
         FROM order_items
         WHERE order_id = $1`,
        [id],
      );

      const cpfLimpo = (order.cliente_cpf || user.cpf || "").replace(/\D/g, "");
      let cpfFinal = cpfLimpo;

      if (cpfLimpo.length !== 11) {
        const isSandbox = process.env.PAGBANK_SANDBOX === "true";
        cpfFinal = isSandbox ? "12345678909" : "";

        if (!cpfFinal) {
          throw new Error("CPF inválido para geração do checkout.");
        }
      }

      const pagbankItems = processarItensParaPagBank(itemsResult.rows);
      const precoFrete = Number(order.shipping_frete || 0);

      if (precoFrete > 0) {
        pagbankItems.push({
          reference_id: "frete",
          name: `Frete - ${order.shipping_bairro || order.shipping_district || "Entrega"}`,
          quantity: 1,
          unit_amount: Math.round(precoFrete * 100),
        });
      }

      const dadosCheckout = {
        reference_id: `checkout-${order.id}`,
        customer: {
          name: order.cliente_nome || "Cliente",
          email: user.email || "cliente@mercadopreferido.com",
          tax_id: cpfFinal,
        },
        items: pagbankItems,
        payment_methods: [
          { type: "CREDIT_CARD" },
          { type: "BOLETO" },
          { type: "PIX" },
        ],
        redirect_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/pending`,
        },
        notification_urls: process.env.PAGBANK_WEBHOOK_URL
          ? [process.env.PAGBANK_WEBHOOK_URL]
          : undefined,
      };

      if (!dadosCheckout.notification_urls) {
        delete dadosCheckout.notification_urls;
      }

      const accessToken = process.env.PAGBANK_SANDBOX_TOKEN;
      if (!accessToken) {
        throw new Error("Token do PagBank não configurado no .env.local");
      }

      const respostaCheckout = await criarCheckout(dadosCheckout, accessToken);
      const payLink = respostaCheckout?.links?.find(
        (link) => link.rel === "PAY" || link.rel === "CHECKOUT",
      );
      paymentLink = payLink?.href || null;

      if (!paymentLink) {
        throw new Error("PagBank não retornou um link de checkout");
      }

      return NextResponse.json({
        success: true,
        message: "Link de pagamento gerado com sucesso",
        order: currentOrder,
        payment_link: paymentLink,
      });
    }

    const result = await client.query(
      `UPDATE orders 
       SET status = $1 
       WHERE id = $2 
       RETURNING id, status, total, created_at`,
      [status, id],
    );

    console.log(` Pedido ${id} atualizado para ${status}`);

    return NextResponse.json({
      success: true,
      message: `Status atualizado para ${status}`,
      order: result.rows[0],
      payment_link: paymentLink,
    });
  } catch (error) {
    console.error(" Erro ao atualizar status:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do pedido" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
}
