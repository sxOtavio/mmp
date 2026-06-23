"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";

export default function Register() {
  const router = useRouter();
  const { registerUser } = useUser("");
  
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip_code, setZip_code] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!user || !password || !confirmPassword || !name || !birthDate || !phone || !address || !city || !state || !zip_code || !cpf) {
      setError("Preencha todos os campos!");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await registerUser(user, password, confirmPassword, name, birthDate, phone, address, complement, number, region, city, state, zip_code, cpf);
    } catch (err) {
      setError("Erro ao registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Lado Esquerdo - Branding com Gradiente */}
          <div className="w-full lg:w-2/5 bg-gradient-to-br from-yellow-400 to-orange-500 p-8 lg:p-12 flex flex-col items-center justify-center min-h-[300px] lg:min-h-[800px]">
            <div className="text-center">
              <img
                src="/logoMercado.png"
                className="w-40 sm:w-48 md:w-56 lg:w-64 h-auto mx-auto mb-6 drop-shadow-2xl"
                alt="Logo Mercado"
              />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Bem-vindo! 
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                Crie sua conta e comece a economizar
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>

          {/* Lado Direito - Formulário */}
          <div className="w-full lg:w-3/5 p-6 sm:p-8 lg:p-10">
            <div className="max-w-lg mx-auto w-full">
              {/* Título Mobile */}
              <div className="lg:hidden mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Criar conta</h1>
                <p className="text-gray-500 text-sm">Preencha seus dados para se cadastrar</p>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Formulário - Grid 2 colunas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nome */}
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Nome completo
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="name" 
                    placeholder="Seu nome completo" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    E-mail
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="email" 
                    id="email" 
                    placeholder="seu@email.com" 
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Senha
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="password" 
                    id="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Confirmar senha
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="password" 
                    id="confirmPassword" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    CPF
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="cpf" 
                    placeholder="000.000.000-00" 
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Telefone
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="phone" 
                    placeholder="(00) 00000-0000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Data de Nascimento
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="date" 
                    id="birthDate" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* CEP */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    CEP
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="zip_code" 
                    placeholder="00000-000" 
                    value={zip_code}
                    onChange={(e) => setZip_code(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Endereço */}
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Endereço
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="address" 
                    placeholder="Rua, Avenida..." 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Número */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Número
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="number" 
                    placeholder="123" 
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Complemento */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Complemento
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="complement" 
                    placeholder="Apto, Casa..." 
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Bairro */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Bairro
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="region" 
                    placeholder="Seu bairro" 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Cidade
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="city" 
                    placeholder="Sua cidade" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    Estado
                  </label>
                  <input 
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    type="text" 
                    id="state" 
                    placeholder="SP, RJ, MG..." 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3 mt-6">
                <button 
                  onClick={handleRegister} 
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold py-3.5 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-base ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </span>
                  ) : (
                    'Criar conta'
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
                  onClick={() => router.push('/loginPage')} 
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-6 rounded-xl border-2 border-gray-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-base"
                >
                  Já tenho uma conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}