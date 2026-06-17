import { NextResponse } from "next/server";
import { pool } from "../../../lib/db"; // Ajuste os pontos (../) se o arquivo mudar de lugar
import bcrypt from "bcryptjs"; // Alterado para bcryptjs

// ROTA DE REGISTRO (POST)

export async function POST(request) {
  let client;
  
  try {
    client = await pool.connect();
    const body = await request.json();
    const { username, password, name, birthDate, phone, address, city, state, zip_code, cpf } = body;

    if (!username || !password || !name || !birthDate || !phone || !address || !city || !state || !zip_code || !cpf) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }
// faz o hash da senha antes de salvar no banco de dados
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // Insere o usuário no banco de dados
    const result = await client.query("INSERT INTO users (email, password_hash, name, phone, address, city, state, zip_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9) RETURNING *", [username, hashedPassword, name, phone, address, city, state, zip_code, cpf]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }
    // Remove dados sensíveis antes de responder ao frontend
    const { password_hash, ...dadosSeguros } = result.rows[0];

    console.log("Usuário registrado com sucesso:", dadosSeguros);

    return NextResponse.json(dadosSeguros);
  } catch (error) {
    console.error("Erro no servidor durante registro:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
