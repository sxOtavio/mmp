import { NextResponse } from 'next/server';
import pkg from 'pg';
const { Pool } = pkg;

// O Pool deve ser instanciado FORA da função da rota para ser reaproveitado entre as requisições
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, 
  idleTimeoutMillis: 30000, 
});

export async function POST(request) {
 let client;

  try {
    const { customer } = await request.json();

    if (!customer || !customer.bairro) {
      return NextResponse.json({ error: 'O campo bairro é obrigatório.' }, { status: 400 });
    }

    // Pega uma conexão disponível do pool
    client = await pool.connect();

    // 
    const queryText = 'SELECT price, acepted FROM shipping WHERE region = $1';
    const result = await client.query(queryText, [customer.bairro]);
    console.log(result.rows[0]);
    if (result.rows.length === 0) {
      return NextResponse.json({
        customer: { ...customer, acepted: false, preco_frete: 0 }
      });
    }

     const { price, acepted } = result.rows[0];
    
    // CORREÇÃO NO LOG: Usando 'customer.bairro' já que 'region' não foi selecionado no SELECT
    console.log(`Preço do frete para ${customer.bairro}: R$ ${price}, Aceito: ${acepted}`);

    return NextResponse.json({
      customer: {
        ...customer,
        acepted: acepted,
        price: parseFloat(price)
      }
    });
    

  } catch (error) {
    console.error('❌ Erro na rota de frete:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  } finally {
    // 4. O bloco FINALLY sempre roda, mesmo se der erro na query ou no JSON.
    // Isso garante que a conexão volte para o pool imediatamente!
    if (client) {
      client.release();
      console.log('🔄 Conexão do Postgres devolvida para o pool com sucesso.');
    }
  }
}