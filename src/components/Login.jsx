"use client";
import { useState } from "react"; // 1. Importado para capturar os inputs
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { navigate } from "next/dist/client/components/segment-cache/navigation";

export default function Login() {
  const router = useRouter();
  
  // 2. Movido o hook para o topo do componente
  const { loadUser } = useUser(); 

  // 3. Criado estados para armazenar o email e a senha
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 4. Função isolada para tratar o clique de login
  const handleLogin = () => {
    if (!email || !password) {
      alert("Preencha todos os campos!");
      return;
    }
    loadUser(email, password);
  };

  return (
    <section className="bg-yellow-400 px-6 rounded flex items-center justify-center gap-15">
      <div className="bg-yellow-400 text-black p-10px flex flex-col gap-10px">
        <h1>Faça o login</h1>
        
        {/* 5. Vinculado o value e o onChange nos inputs */}
        <input 
          className="bg-white text-black pb-3 m-1 rounded-lg border border-gray-300"  
          type="email" 
          name="email" 
          id="email" 
          placeholder="  E-mail" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input 
          className="bg-white text-black pb-3 m-1 rounded-lg border border-gray-300"   
          type="password" 
          name="password" 
          id="password" 
          placeholder="  Senha" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* 6. Chamada da função corrigida no onClick */}
      <button onClick={handleLogin} className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg">
          Entrar
      </button>
      
      <button onClick={() => {router.push('/registerPage');}} className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg">
          Registrar
      </button>
      
      <img
        src="/logoMercado.png"
        className="w-[300px]"
        alt="Logo Mercado"
      />
    </section>
  );
}
