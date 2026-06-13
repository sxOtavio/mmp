
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token não fornecido" }, 
        { status: 400 }
      );
    }
    
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return NextResponse.json({
      valid: true,
      decoded: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp,
        iat: decoded.iat
      }
    });
    
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    
    let errorMessage = "Token inválido";
    if (error.message === "jwt expired") {
      errorMessage = "Token expirado";
    } else if (error.message === "invalid signature") {
      errorMessage = "Assinatura inválida";
    }
    
    return NextResponse.json(
      { valid: false, error: errorMessage },
      { status: 401 }
    );
  }
}