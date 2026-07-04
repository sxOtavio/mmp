// src/app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request, { params }) {
  let client;

  try {
    const { id } = await params;
    client = await pool.connect();

    const result = await client.query(`
      SELECT
        o.id AS order_id,
        o.status,
        o.total,
        o.created_at,
        o.updated_at,
        o.shipping_frete,
        
        o.cliente_nome,
        o.cliente_telefone,
        o.cliente_cpf,
        
        o.shipping_street AS endereco,
        o.shipping_number AS numero,
        o.shipping_complement AS complemento,
        o.shipping_district AS bairro,
        o.shipping_city AS cidade,
        o.shipping_state AS estado,
        o.shipping_zip AS cep,
        o.shipping_bairro,
        
        oi.product_name,
        oi.quantity,
        oi.unit_price

      FROM orders o
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

    const firstRow = result.rows[0];
    
    const pedido = {
      id: firstRow.order_id,
      status_pedido: firstRow.status,
      total: Number(firstRow.total),
      created_at: firstRow.created_at,
      updated_at: firstRow.updated_at,
      shipping_frete: Number(firstRow.shipping_frete) || 0,
      
      cliente_nome: firstRow.cliente_nome || 'Não informado',
      cliente_telefone: firstRow.cliente_telefone || '',
      cliente_cpf: firstRow.cliente_cpf || '',
      
      cliente_endereco: firstRow.endereco || '',
      cliente_numero: firstRow.numero || '',
      cliente_complemento: firstRow.complemento || '',
      cliente_bairro: firstRow.bairro || '',
      cliente_cidade: firstRow.cidade || '',
      cliente_estado: firstRow.estado || 'DF',
      cliente_cep: firstRow.cep || '',
      
      itens: result.rows.map(row => ({
        nome: row.product_name,
        quantidade: row.quantity,
        preco: Number(row.unit_price),
      }))
    };

    return NextResponse.json(pedido);

  } catch (error) {
    console.error("❌ Erro ao buscar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}