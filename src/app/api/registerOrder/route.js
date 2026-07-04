import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import jwt from "jsonwebtoken";
import { criarCheckout } from "@/lib/pagBank";

export async function POST(request) {
  let client;

  try {
    client = await pool.connect();
    const body = await request.json();
    const { customer, items, total } = body;
    console.log("📦 Dados Recebidos do pedido:", body);

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

    // 🔥 CALCULA O TOTAL COM FRETE
    const precoFrete = Number(customer.price) || Number(customer.preco_frete) || 0;
    const totalComFrete = Number(total) + precoFrete;

    console.log('💰 Total do carrinho:', total);
    console.log('💰 Frete:', precoFrete);
    console.log('💰 Total com frete:', totalComFrete);

    // 🔥 SALVA O PEDIDO
    const orderResult = await client.query(
      `
      INSERT INTO orders (
        user_id, 
        status, 
        total,
        shipping_frete,
        shipping_street,
        shipping_number,
        shipping_complement,
        shipping_district,
        shipping_city,
        shipping_state,
        shipping_zip,
        shipping_bairro,
        cliente_nome,
        cliente_telefone,
        cliente_cpf
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
      `,
      [
        decoded.userId,
        'pending',
        totalComFrete,
        precoFrete,
        customer.endereco || '',
        customer.numero || '',
        customer.complemento || '',
        customer.bairro || '',
        customer.cidade || '',
        'DF',
        customer.cep || '',
        customer.bairro || '',
        customer.nome || '',
        customer.telefone || '',
        customer.cpf || ''
      ]
    );

    const order = orderResult.rows[0];

    // 🔥 SALVA OS ITENS
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

    // 🔥 PREPARA DADOS PARA O PAGBANK
    const cpfLimpo = user.cpf ? user.cpf.replace(/\D/g, '') : '';
    const cepLimpo = customer.cep ? customer.cep.replace(/\D/g, '') : '';
    const cepFormatado = cepLimpo.padStart(8, '0');

    const pagbankItems = items.map((item) => ({
      reference_id: String(item.gtin),
      name: item.nome,
      quantity: Number(item.quantity),
      unit_amount: Math.round((Number(item.precoPromocional) || Number(item.precoNormal)) * 100),
    }));

    // 🔥 ADICIONA O FRETE COMO ITEM
    console.log('💰 Valor do frete recebido:', customer.price);
    console.log('💰 Frete convertido:', precoFrete);

    if (precoFrete > 0) {
      pagbankItems.push({
        reference_id: 'frete',
        name: `Frete - ${customer.bairro || 'Entrega'}`,
        quantity: 1,
        unit_amount: Math.round(precoFrete * 100),
      });
      console.log('✅ Frete adicionado ao checkout');
    } else {
      console.log('ℹ️ Frete não adicionado (valor 0 ou não informado)');
    }

    // 🔥 DADOS PARA O CHECKOUT
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
    };

    console.log("📤 Enviando para PagBank Checkout:", JSON.stringify(dadosCheckout, null, 2));

    const accessToken = process.env.PAGBANK_SANDBOX_TOKEN;
    if (!accessToken) {
      throw new Error("Token do PagBank não configurado no .env.local");
    }

    const respostaCheckout = await criarCheckout(dadosCheckout, accessToken);
    console.log("✅ Resposta Checkout:", JSON.stringify(respostaCheckout, null, 2));

    let paymentLink = null;
    if (respostaCheckout?.links) {
      const payLink = respostaCheckout.links.find(l => l.rel === "PAY" || l.rel === "CHECKOUT");
      paymentLink = payLink?.href;
    }

    if (!paymentLink) {
      console.error("❌ Nenhum link de checkout encontrado:", respostaCheckout);
      throw new Error("PagBank não retornou um link de checkout");
    }

    console.log("🔗 Link de checkout:", paymentLink);

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