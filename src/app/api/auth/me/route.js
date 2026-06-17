import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Token não enviado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

  //  console.log("TOKEN RECEBIDO", token)

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
//  console.log("TOKEN decoded ", decoded)

    const result = await pool.query(
      `
      SELECT
        id,
        email,
        name,
        cpf,
        phone,
        address,
        city,
        zip_code
      FROM users
      WHERE id = $1
      `,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}