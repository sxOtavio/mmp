import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import jwt from "jsonwebtoken";

const processarItensParaPagBank = (items) => {
  const pagbankItems = [];

  for (const item of items) {
    const isSoldByWeight = item.sold_by_weight === true;
    const precoUnitario =
      Number(item.precoPromocional) || Number(item.precoNormal) || 0;
    const quantidade = Number(item.quantity || 1);
    const pesoEspecifico = Number(item.peso_especifico || 0);

    if (isSoldByWeight && pesoEspecifico > 0) {
      const valorTotal = precoUnitario * pesoEspecifico;
      pagbankItems.push({
        reference_id: String(item.gtin),
        name: `${item.nome} (${pesoEspecifico.toFixed(2)}kg)`,
        quantity: 1,
        unit_amount: Math.round(valorTotal * 100),
      });
      console.log(
        `✅ Item por peso: ${item.nome} - ${pesoEspecifico.toFixed(2)}kg = R$ ${valorTotal.toFixed(2)}`,
      );
    } else {
      const valorUnitario = precoUnitario;
      const qtdInteira = Math.round(quantidade);
      pagbankItems.push({
        reference_id: String(item.gtin),
        name: item.nome,
        quantity: qtdInteira,
        unit_amount: Math.round(valorUnitario * 100),
      });
      console.log(
        `✅ Item por unidade: ${item.nome} x${qtdInteira} = R$ ${(valorUnitario * qtdInteira).toFixed(2)}`,
      );
    }
  }

  return pagbankItems;
};

export async function POST(request) {
  let client;

  try {
    client = await pool.connect();
    const body = await request.json();
    const { customer, items, total } = body;
    console.log("📦 Dados Recebidos do pedido:", body);

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Token não enviado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await client.query(
      `SELECT cpf FROM users WHERE id = $1`,
      [decoded.userId],
    );

    if (userResult.rows.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const user = userResult.rows[0];

    await client.query("BEGIN");

    const precoFrete =
      Number(customer.price) || Number(customer.preco_frete) || 0;
    const totalComFrete = Number(total) + precoFrete;

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
        "pending",
        totalComFrete,
        precoFrete,
        customer.endereco || "",
        customer.numero || "",
        customer.complemento || "",
        customer.bairro || "",
        customer.cidade || "",
        "DF",
        customer.cep || "",
        customer.bairro || "",
        customer.nome || "",
        customer.telefone || "",
        customer.cpf || "",
      ],
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const unitPrice =
        Number(item.precoPromocional) || Number(item.precoNormal);
      const isSoldByWeight = item.sold_by_weight === true;

      await client.query(
        `
    INSERT INTO order_items (
      order_id, 
      product_id, 
      quantity, 
      unit_price, 
      product_name,
      sold_by_weight
  
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
        [
          order.id,
          item.gtin,
          item.quantity,
          unitPrice,
          item.nome,
          isSoldByWeight,
        ],
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      orderId: order.id,
      requires_separator_confirmation: true,
      message:
        "Pedido criado com sucesso. O pagamento será gerado quando o separador confirmar o pedido.",
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
      { status: statusCode },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
