import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

// 💡 Adicionamos o 'request' aqui nos parênteses
export async function GET(request) {
  const client = await pool.connect();

  try {
    console.log("conexão estabelecida");

    const { origin } = new URL(request.url);

    const result = await client.query("SELECT * FROM products");

    console.log(`${result.rows.length} produtos carregados`);
    // tentando enganar o vercel para não bloquear a requisição de login da gtin to pictures api
    const user = process.env.GTIN_API_USER;
    const password = process.env.GTIN_API_PASSWORD;
    const response = await fetch(`${process.env.GTIN_API_URL}/login`, {
      // Ajuste a rota final de acordo com seu back
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Avisa o back que estamos enviando JSON
      },
      // 3. Transforma o objeto JavaScript com os dados em texto JSON para envio
      body: JSON.stringify({
        user: user, // Ajuste de chave (ex: email, username) conforme a api espera
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer login: " + response.statusText);
    }

    const tokenData = await response.json();

    const catalogResponse = await fetch(
      `${process.env.GTIN_API_URL}/api/catalog?token=${tokenData.token}`,
    );

    const catalog = await catalogResponse.json();

    console.log(`${Object.keys(catalog).length} imagens encontradas`);

    const products = result.rows.map((product) => ({
      ...product,
      image_url: catalog[product.gtin_code] || null,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao carregar produtos" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
