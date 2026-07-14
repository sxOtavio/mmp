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
        o.shipping_frete,
        
        --  DADOS DO CLIENTE (SALVOS NO PEDIDO)
        o.cliente_nome,
        o.cliente_telefone,
        o.cliente_cpf,
        
        --  ENDEREÇO DO PEDIDO
        o.shipping_street AS endereco,
        o.shipping_number AS numero,
        o.shipping_complement AS complemento,
        o.shipping_district AS bairro,
        o.shipping_city AS cidade,
        o.shipping_state AS estado,
        o.shipping_zip AS cep,
        o.shipping_bairro,
        
        --  ITENS
        oi.id AS item_id,
        oi.product_id,
        oi.product_name,
        oi.quantity,
        oi.unit_price,
        oi.actual_weight AS peso_real,
        oi.sold_by_weight 

      FROM orders o
      INNER JOIN order_items oi
        ON oi.order_id = o.id
      ORDER BY o.created_at DESC
    `);

    const pedidosMap = {};

    result.rows.forEach((row) => {
      if (!pedidosMap[row.order_id]) {
        pedidosMap[row.order_id] = {
          id: row.order_id,
          status_pedido: row.status,
          total: Number(row.total),
          created_at: row.created_at,
          shipping_frete: Number(row.shipping_frete) || 0,

          //  DADOS DO CLIENTE (DO PEDIDO)
          cliente_nome: row.cliente_nome || "Não informado",
          cliente_telefone: row.cliente_telefone || "",
          cliente_cpf: row.cliente_cpf || "",

          //  ENDEREÇO (DO PEDIDO)
          cliente_endereco: row.endereco || "",
          cliente_numero: row.numero || "",
          cliente_complemento: row.complemento || "",
          cliente_bairro: row.bairro || "",
          cliente_cidade: row.cidade || "",
          cliente_estado: row.estado || "DF",
          cliente_cep: row.cep || "",

          itens: [],
        };
      }

      pedidosMap[row.order_id].itens.push({
        id: row.item_id,
        product_id: row.product_id,
        nome: row.product_name,
        quantidade: Number(row.quantity) || 0,
        preco: Number(row.unit_price) || 0,
        peso_real: row.peso_real != null ? Number(row.peso_real) : null,
        sold_by_weight: row.sold_by_weight || false,
      });
    });

    return NextResponse.json(Object.values(pedidosMap));
  } catch (error) {
    console.error("❌ Erro ao buscar pedidos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedidos" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
}
