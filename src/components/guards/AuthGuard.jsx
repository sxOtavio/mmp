'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

export function AuthGuard({ children, requiredRole = null }) {
  const router = useRouter();
  const { auth } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verify = () => {
      const token = auth.token || localStorage.getItem('@token');
      const userRole = auth.userRole;
      
      console.log("🔒 AuthGuard - Verificando:");
      console.log("  - token existe?", !!token);
      console.log("  - userRole:", userRole);
      console.log("  - requiredRole:", requiredRole);
      
      // Caso 1: Sem token
      if (!token) {
        console.log("❌ Sem token, redirecionando para login");
        router.replace('/loginPage');
        return;
      }
      
      // Caso 2: Role diferente da necessária
      if (requiredRole && userRole !== requiredRole) {
        console.log(`❌ Role ${userRole} não é ${requiredRole}, redirecionando`);
        router.replace('/userPage');
        return;
      }
      
      // Caso 3: Tudo certo
      console.log("✅ Acesso liberado!");
      setIsAuthorized(true);
      setIsVerifying(false);
    };
    
    // Só verifica se já temos o userRole ou se passou tempo suficiente
    if (auth.userRole !== null || auth.token !== null) {
      verify();
    } else {
      // Aguarda um pouco para o hook carregar
      const timer = setTimeout(verify, 500);
      return () => clearTimeout(timer);
    }
  }, [auth.token, auth.userRole, router, requiredRole]);

  // Enquanto verifica, mostra loading (sem HTML no console)
  if (isVerifying) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}