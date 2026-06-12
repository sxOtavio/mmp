'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserProvider } from "@/contexts/UserContext"; 
import { CartDrawer } from "@/components/CartDrawer";


export default function CheckoutClient() {
  const { cart, cartTotal, clearCart } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: '',
    pagamento: 'credito',
    parcelas: '1'
  });
  
/*
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/');
    }
  }, [cart, router]);
*/
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.endereco || !formData.cidade || !formData.cep) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log('Pedido finalizado:', { ...formData, itens: cart, total: cartTotal });
      alert('✅ Pedido finalizado com sucesso!');
      clearCart();
      router.push('/pedido-confirmado');
    }, 1500);
  };

  const getValorParcela = () => {
    const parcelas = parseInt(formData.parcelas);
    if (parcelas === 1) return cartTotal;
    return (cartTotal / parcelas).toFixed(2);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md">
          <div className="text-8xl mb-6 animate-bounce">🛒</div>
          <p className="text-gray-500 text-lg mb-6">Seu carrinho está vazio</p>
          <Link href="/" className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-yellow-600 transition-transform hover:scale-105">
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
 <UserProvider>
   
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header com progresso */}
      <div className="bg-white border-b-2 border-yellow-300 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              Supermercado
            </Link>
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 px-4 py-2 rounded-full">
                <span className="text-sm text-gray-600">Itens: </span>
                <span className="font-semibold text-red-600">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="bg-green-100 px-4 py-2 rounded-full">
                <span className="text-sm text-gray-600">Total: </span>
                <span className="font-semibold text-green-600">R$ {cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Steps animados */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${step === 1 ? 'bg-yellow-500 text-white shadow-lg scale-110' : step > 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className={`text-xs mt-2 ${step === 1 ? 'text-yellow-600 font-medium' : 'text-gray-400'}`}>Endereço</span>
            </div>
            <div className={`w-12 md:w-24 h-0.5 rounded-full transition-all duration-300 ${step > 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${step === 2 ? 'bg-yellow-500 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-400'}`}>
                2
              </div>
              <span className={`text-xs mt-2 ${step === 2 ? 'text-yellow-600 font-medium' : 'text-gray-400'}`}>Pagamento</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário - Coluna Esquerda */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-yellow-100">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                    📦 Dados de Entrega
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Passo 1 de 2</span>
                  </h2>
                </div>
                
                <form onSubmit={handleNextStep} className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo *</label>
                      <input type="text" name="nome" required value={formData.nome} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all" placeholder="Digite seu nome" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all" placeholder="seu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                      <input type="tel" name="telefone" required value={formData.telefone} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all" placeholder="(99) 99999-9999" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
                      <input type="text" name="cep" required value={formData.cep} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all" placeholder="12345-678" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Endereço *</label>
                      <input type="text" name="endereco" required value={formData.endereco} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all" placeholder="Rua, Avenida..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
                      <input type="text" name="numero" required value={formData.numero} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all" placeholder="123" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                      <input type="text" name="complemento" value={formData.complemento} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all" placeholder="Apto, Bloco..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bairro *</label>
                      <input type="text" name="bairro" required value={formData.bairro} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all" placeholder="Bairro" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
                      <input type="text" name="cidade" required value={formData.cidade} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all" placeholder="Cidade" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-yellow-600 hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                      Continuar para Pagamento
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-yellow-100">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                    💳 Pagamento
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Passo 2 de 2</span>
                  </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'credito', label: 'Cartão de Crédito', icon: '💳', desc: 'Visa, Mastercard, Elo' },
                      { value: 'debito', label: 'Cartão de Débito', icon: '💳', desc: 'Débito em conta' },
                      { value: 'pix', label: 'PIX', icon: '⚡', desc: 'Pagamento instantâneo' },
                      { value: 'dinheiro', label: 'Dinheiro', icon: '💰', desc: 'Pagamento na entrega' }
                    ].map((option) => (
                      <label key={option.value} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-yellow-400 ${formData.pagamento === option.value ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}>
                        <input type="radio" name="pagamento" value={option.value} checked={formData.pagamento === option.value} onChange={handleInputChange} className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{option.icon}</span>
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {formData.pagamento === 'credito' && (
                    <div className="bg-yellow-50 rounded-xl p-5 space-y-4 animate-fadeIn">
                      <h3 className="font-medium text-gray-700">Dados do Cartão</h3>
                      <input type="text" placeholder="Número do cartão" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Validade (MM/AA)" className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400" />
                        <input type="text" placeholder="CVV" className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400" />
                      </div>
                      <input type="text" placeholder="Nome no cartão" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400" />
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <input type="checkbox" id="saveCard" className="w-4 h-4" />
                        <label htmlFor="saveCard">Salvar cartão para próximas compras</label>
                      </div>
                    </div>
                  )}

                  {formData.pagamento === 'credito' && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Parcelas:</span>
                      <select name="parcelas" value={formData.parcelas} onChange={handleInputChange} className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400">
                        <option value="1">1x de R$ {cartTotal.toFixed(2)}</option>
                        <option value="2">2x de R$ {getValorParcela()} sem juros</option>
                        <option value="3">3x de R$ {getValorParcela()} sem juros</option>
                        <option value="4">4x de R$ {getValorParcela()} sem juros</option>
                        <option value="5">5x de R$ {getValorParcela()} sem juros</option>
                        <option value="6">6x de R$ {getValorParcela()} sem juros</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2">
                      ← Voltar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          Confirmar Pedido
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Resumo do Pedido - Coluna Direita */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-yellow-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                  🛒 Seu Pedido
                </h2>
                <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">{cart.length} itens</span>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 mb-6 pr-2">
                {cart.map((item, idx) => {
                  const preco = item.precoPromocional || item.precoNormal;
                  const subtotal = Number(preco) * item.quantity;
                  return (
                    <div key={item.gtin || idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-yellow-50 transition">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-xl">
                        🛍️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.nome}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{item.quantity}x</span>
                          <span className="text-sm font-semibold text-red-600">R$ {subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-2xl text-red-600">R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span>🔒</span>
                  <span>Compra 100% segura</span>
                  <span>🛡️</span>
                </div>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="text-xs text-gray-400">Visa</span>
                  <span className="text-xs text-gray-400">Mastercard</span>
                  <span className="text-xs text-gray-400">Elo</span>
                  <span className="text-xs text-gray-400">PIX</span>
                </div>
              </div>

              {/* Cupom de desconto */}
              <div className="mt-4">
                <div className="flex gap-2">
                  <input type="text" placeholder="Cupom de desconto" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-yellow-400" />
                  <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-200 transition">Aplicar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <CartDrawer />
 </UserProvider>
  );
}