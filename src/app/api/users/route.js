import { NextResponse } from "next/server";
import { pool } from "../../../lib/db"; // Ajuste os pontos (../) se o arquivo mudar de lugar
import bcrypt from "bcryptjs"; // Alterado para bcryptjs

// ROTA DE LOGIN (POST)

export async function POST(request) {
  let client;
  
  try {
    client = await pool.connect();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    // Busca o usuário pelo e-mail
    const result = await client.query("SELECT * FROM users WHERE email = $1", [username]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const usuarioEncontrado = result.rows[0];
    console.log("Usuário encontrado:", usuarioEncontrado);
    // Compara a senha digitada com o hash do banco de dados
    const validation = await bcrypt.compare(password, usuarioEncontrado.password_hash);

    if (!validation) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Remove dados sensíveis antes de responder ao frontend
    const { password_hash, ...dadosSeguros } = usuarioEncontrado;
console.log("dados recuperados",dadosSeguros)
    return NextResponse.json(dadosSeguros);

  } catch (error) {
    console.error("Erro no servidor durante login:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
