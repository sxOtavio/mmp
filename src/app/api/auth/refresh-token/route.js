// app/api/auth/refresh-token/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    // Pega o token do header
    const authHeader = request.headers.get('authorization');
    const oldToken = authHeader?.split(' ')[1];
    
    if (!oldToken) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }
    
    // Verifica o token antigo
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
    
    // Gera um novo token
    const newToken = jwt.sign(
      { 
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    return NextResponse.json({
      token: newToken,
      expiresIn: "7d"
    });
    
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    
    return NextResponse.json(
      { error: "Token inválido ou expirado" },
      { status: 401 }
    );
  }
}