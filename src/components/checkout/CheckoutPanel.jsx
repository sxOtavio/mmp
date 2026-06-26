// src/components/clients/CheckoutPageClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useDelivery } from "@/hooks/useCheckout";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPanel() {
  const {loadCurrentUser, cart, cartTotal, clearCart, user } = useUser();
  const{loadDelivery}=useDelivery();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    cep: "",
    pagamento: "credito",
    parcelas: "1",
  });

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/");
    }
  }, [cart, router]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ========= lida com dados ja inseridos pelo usuario na criação da conta ==============


const handleUserData = async () => {
  const user = await loadCurrentUser();
console.log("DADOS DE USUARIO RECUPERADOS", user);
  setFormData(prev => ({
    ...prev,
    nome: user.name,
    email: user.email,
    telefone: user.phone,
    endereco: user.address,
    numero: user.number,
    complemento: user.complement,
    bairro: user.region,
    cidade: user.city,
    cep: user.zip_code
  }));
};
/*  
  faltou pensar se a pessoa nao tiver logada
  como ele responde

  faltou terminar o cpf na nota, ele ja recupera o cpf do banco

    */

  const handleNextStep = (e) => {
    e.preventDefault();
    if (
      !formData.nome ||
      !formData.endereco ||
      !formData.cidade ||
      !formData.cep
    ) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    setStep(2);
  };
// =========== AQUI ELE MANDA PRO USE DELIVERY E COMEÇA A TRATAR O PEDIDO ===============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Pedido finalizado:", {
        ...formData,
        itens: cart,
        total: cartTotal,
      });
  //----- chamando função de submit

      loadDelivery(formData,cart,cartTotal);

      alert("✅ Pedido finalizado com sucesso!");
     // clearCart();
      //router.push("/pedido-confirmado");
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
          <p className="text-black text-lg mb-6">Seu carrinho está vazio</p>
          <Link
            href="/"
            className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-yellow-600 transition-transform hover:scale-105"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 ">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${step === 1 ? "bg-yellow-500 text-white shadow-lg scale-110" : step > 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span
                className={`text-xs mt-2 ${step === 1 ? "text-yellow-600 font-medium" : "text-black"}`}
              >
                Endereço
              </span>
            </div>
            <div
              className={`w-12 md:w-24 h-0.5 rounded-full transition-all duration-300 ${step > 1 ? "bg-green-500" : "bg-gray-200"}`}
            ></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${step === 2 ? "bg-yellow-500 text-white shadow-lg scale-110" : "bg-gray-200 text-gray-400"}`}
              >
                2
              </div>
              <span
                className={`text-xs mt-2 ${step === 2 ? "text-yellow-600 font-medium" : "text-black"}`}
              >
                Pagamento
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-yellow-100">
                <div className="bg-yellow-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-white font-semibold text-lg">
                    Dados de Entrega
                  </h2>

                  <button
                    type="button"
                    onClick={handleUserData}
                    className="bg-white text-yellow-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-50 transition"
                  >
                    Usar dados da conta
                  </button>
                </div>
                <form onSubmit={handleNextStep} className="p-6 space-y-6">
                  <div className="grid text-black md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        name="nome"
                        required
                        value={formData.nome}
                        onChange={handleInputChange}
                        className="placeholder:text-gray-600 w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="placeholder:text-gray-600 w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        name="telefone"
                        required
                        value={formData.telefone}
                        onChange={handleInputChange}
                        className="placeholder:text-gray-600 w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        CEP *
                      </label>
                      <input
                        type="text"
                        name="cep"
                        required
                        value={formData.cep}
                        onChange={handleInputChange}
                        className="placeholder:text-gray-600 w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-2">
                        Endereço *
                      </label>
                      <input
                        type="text"
                        name="endereco"
                        required
                        value={formData.endereco}
                        onChange={handleInputChange}
                        className="placeholder:text-gray-600 w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Número *
                      </label>
                      <input
                        type="text"
                        name="numero"
                        required
                        value={formData.numero}
                        onChange={handleInputChange}
                        className="placeholder:text-gray-600 w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Complemento
                      </label>
                      <input
                        type="text"
                        name="complemento"
                        value={formData.complemento}
                        onChange={handleInputChange}
                        className="placeholder:text-black w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        name="bairro"
                        required
                        value={formData.bairro}
                        onChange={handleInputChange}
                        className="placeholder:text-gray-600 text-black w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        name="cidade"
                        required
                        value={formData.cidade}
                        onChange={handleInputChange}
                        className="placeholder:text-gray-600 w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                      />
                    </div>

                  </div>
                    <div className="grid lg:grid-cols-3 ">
                      <input type="checkbox" name="" id="" /><h2>Marque se desejar CPF na nota</h2>
                    </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-yellow-600 transition-all flex items-center gap-2"
                    >
                      Continuar →
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-yellow-100">
                <div className="bg-yellow-500 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg">
                    Forma de Pagamento
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        value: "credito",
                        label: "Cartão de Crédito",
                        icon: "💳",
                      },
                      {
                        value: "debito",
                        label: "Cartão de Débito",
                        icon: "💳",
                      },
                      { value: "pix", label: "PIX", icon: "⚡" },
                      { value: "dinheiro", label: "Dinheiro", icon: "💰" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer ${formData.pagamento === option.value ? "border-yellow-500 bg-yellow-50" : "border-gray-200"}`}
                      >
                        <input
                          type="radio"
                          name="pagamento"
                          value={option.value}
                          checked={formData.pagamento === option.value}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-yellow-500"
                        />
                        <span className="text-2xl">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>

                  {formData.pagamento === "dinheiro" && (
                    <div className="bg-yellow-50 text-black rounded-xl p-5 space-y-4">
                      <input
                        type="number"
                        placeholder="Troco para quanto?"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                      />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 py-3 rounded-xl"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700"
                    >
                      {isSubmitting ? "Processando..." : "Confirmar Pedido"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-red-600 mb-4">
                🛒 Seu Pedido
              </h2>
              <div className="space-y-3 text-black max-h-96 overflow-y-auto mb-4">
                {cart.map((item, idx) => {
                  const preco = item.precoPromocional || item.precoNormal;
                  const subtotal = Number(preco) * item.quantity;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between text-sm border-b pb-2"
                    >
                      <span>
                        {item.nome} x{item.quantity}
                      </span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-red-600">
                    R$ {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
