"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { loadUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Preencha todos os campos!");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      await loadUser(email, password);
    } catch (err) {
      setError("Email ou senha incorretos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 flex items-center justify-center p-4">
      {/* Card principal */}
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Lado Esquerdo - Branding */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-yellow-400 to-orange-500 p-8 lg:p-12 flex flex-col items-center justify-center min-h-[300px] lg:min-h-[600px]">
            <div className="text-center">
              <img
                src="/logoMercado.png"
                className="w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 h-auto mx-auto mb-6 drop-shadow-2xl"
                alt="Logo Mercado"
              />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Bem-vindo de volta!
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                Faça login para continuar suas compras
              </p>
            </div>
          </div>

          {/* Lado Direito - Formulário */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12">
            <div className="max-w-md mx-auto w-full">
              {/* Título */}
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Acessar conta
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">
                  Insira suas credenciais para continuar
                </p>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-gray-50 text-gray-800 px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-base placeholder-gray-400"
                      type="email" 
                      id="email" 
                      placeholder="seu@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      autoComplete="email"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      ✉️
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-gray-50 text-gray-800 px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-base placeholder-gray-400"
                      type={showPassword ? "text" : "password"} 
                      id="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Opções extras */}
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400" />
                  Lembrar-me
                </label>
                <button 
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botões */}
              <div className="space-y-3 mt-6">
                <button 
                  onClick={handleLogin} 
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold py-3.5 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-base ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    'Entrar'
                  )}
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/registerPage')} 
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-6 rounded-xl border-2 border-gray-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-base"
                >
                  Criar nova conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}