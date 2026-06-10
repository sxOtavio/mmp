//
import { NextResponse } from "next/server";

export async function GET() {
const user = process.env.GTIN_API_USER;
const password = process.env.GTIN_API_PASSWORD;
  try {
    //  rota típica de login e configuramos o método POST
 //   console.log("Iniciando login na GtinToPictures API com usuário:", user,password);
    const response = await fetch(`${process.env.GTIN_API_URL}/login`, { // Ajuste a rota final de acordo com seu back
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Avisa o back que estamos enviando JSON
      },
      // 3. Transforma o objeto JavaScript com os dados em texto JSON para envio
      body: JSON.stringify({ 
        user: user, // Ajuste de chave (ex: email, username) conforme a api espera
        password: password 
      }),
    });

    if (!response.ok) {
      throw new Error(
        "Erro ao fazer login: " + response.statusText
      );
    }
//console.log("Login bem-sucedido na GtinToPictures API");

       const data = await response.json();
    return NextResponse.json(data); // Retorna o token vindos da gtin to fotos api

  } catch (error) {
    console.error("Erro na requisição de login:", error);
    
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  }
}