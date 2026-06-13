import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  let client;
  
  try {
    client = await pool.connect();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const result = await client.query("SELECT * FROM users WHERE email = $1", [username]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const usuarioEncontrado = result.rows[0];
    const validation = await bcrypt.compare(password, usuarioEncontrado.password_hash);

    if (!validation) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Gera o token COM o role
    const token = jwt.sign(
      { 
        userId: usuarioEncontrado.id,
        email: usuarioEncontrado.email,
        role: usuarioEncontrado.role  // 👈 IMPORTANTE
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password_hash, ...dadosSeguros } = usuarioEncontrado;

    return NextResponse.json({
      user: dadosSeguros,
      token: token,
    });

  } catch (error) {
    console.error("Erro no servidor durante login:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}