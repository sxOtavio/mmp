import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  
  // Rotas que não precisam de autenticação
  const publicPaths = ['/api/login', '/api/register'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Valida token
  if (!token) {
    return NextResponse.json(
      { error: 'Token não fornecido' },
      { status: 401 }
    );
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adiciona informações do usuário à requisição
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-email', decoded.email);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido ou expirado' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/:path*', // Protege todas as rotas API
};