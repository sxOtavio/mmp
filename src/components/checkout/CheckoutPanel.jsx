// src/components/clients/CheckoutPageClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useDelivery } from "@/hooks/useCheckout";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPanel() {
  const { loadCurrentUser, cart, cartTotal, clearCart, user } = useUser();
  const { loadDelivery, loadShipping } = useDelivery();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isCalculatingFrete, setIsCalculatingFrete] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "", 
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    cep: "",
    pagamento: "credito",
    parcelas: "1",
    cpfNaNota: false, 
  });

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/");
    }
  }, [cart, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ========= lida com dados ja inseridos pelo usuario na criação da conta ==============
  const handleUserData = async () => {
    const user = await loadCurrentUser();
    console.log("DADOS DE USUARIO RECUPERADOS", user);
    setFormData((prev) => ({
      ...prev,
      nome: user.name || "",
      email: user.email || "",
      telefone: user.phone || "",
      cpf: user.cpf || "", 
      endereco: user.address || "",
      numero: user.number || "",
      complemento: user.complement || "",
      bairro: user.region || "",
      cidade: user.city || "",
      cep: user.zip_code || "",
    }));
  };

 /* const handleNextStep = (e) => {
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
  };*/

  // =========== AQUI ELE MANDA PRO USE DELIVERY E COMEÇA A TRATAR O PEDIDO ===============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Valida CPF se marcado para CPF na nota
    if (formData.cpfNaNota && !formData.cpf) {
      alert("⚠️ Você marcou 'CPF na nota' mas não preencheu o CPF.");
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      console.log("Pedido finalizado:", {
        ...formData,
       
        itens: cart,
        total: cartTotal,
        shippingPrice: formData.price,
      });
      //----- chamando função de submit
      loadDelivery(formData, cart, cartTotal);
      alert("✅ Pedido finalizado com sucesso!");
      // clearCart();
    }, 1500);
  };
  const handleCalculateShipping = async () => {
  if (!formData.bairro) {
    alert("⚠️ Selecione um bairro para calcular o frete.");
    return;
  }

  setIsCalculatingFrete(true);
  try {
    const res = await loadShipping(formData);
    
    console.log("📦 Resposta recebida:", res);
    
    // Tenta extrair o preço de diferentes estruturas
    let precoFrete = null;
    let customerData = null;
    
    // Estrutura 1: { customer: { price: 12 } }
    if (res?.customer?.price !== undefined) {
      precoFrete = res.customer.price;
      customerData = res.customer;
    } 
    // Estrutura 2: { customer: { preco_frete: 12 } }
    else if (res?.customer?.preco_frete !== undefined) {
      precoFrete = res.customer.preco_frete;
      customerData = res.customer;
    }
    // Estrutura 3: { price: 12 } (direto)
    else if (res?.price !== undefined) {
      precoFrete = res.price;
      customerData = res;
    }
    // Estrutura 4: { preco_frete: 12 } (direto)
    else if (res?.preco_frete !== undefined) {
      precoFrete = res.preco_frete;
      customerData = res;
    }
    
    if (precoFrete !== null && !isNaN(precoFrete)) {
      setFormData(prev => ({
        ...prev,
        preco_frete: precoFrete,
        price: precoFrete,
        ...(customerData && {
          acepted: customerData.acepted || false
        })
      }));
      
      alert(`✅ Frete calculado: R$ ${precoFrete.toFixed(2)}`);
    } else {
      alert("⚠️ Não foi possível encontrar o valor do frete na resposta");
      console.error("Estrutura da resposta:", JSON.stringify(res, null, 2));
    }
    
  } catch (error) {
    console.error("❌ Erro detalhado:", error);
    alert(`❌ Erro ao calcular frete: ${error.message || "Tente novamente"}`);
  } finally {
    setIsCalculatingFrete(false);
  }
};

// Função para avançar (já com frete calculado)
const handleNextStep = (e) => {
  e.preventDefault();
  
  if (!formData.nome || !formData.endereco || !formData.cidade || !formData.cep) {
    alert("Preencha todos os campos obrigatórios");
    return;
  }

  if (!formData.bairro) {
    alert("⚠️ Selecione um bairro.");
    return;
  }

  if (!formData.preco_frete) {
    alert("⚠️ Calcule o frete antes de continuar.");
    return;
  }

  setStep(2);
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
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  step === 1
                    ? "bg-yellow-500 text-white shadow-lg scale-110"
                    : step > 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span
                className={`text-xs mt-2 ${
                  step === 1 ? "text-yellow-600 font-medium" : "text-black"
                }`}
              >
                Endereço
              </span>
            </div>
            <div
              className={`w-12 md:w-24 h-0.5 rounded-full transition-all duration-300 ${
                step > 1 ? "bg-green-500" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  step === 2
                    ? "bg-yellow-500 text-white shadow-lg scale-110"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs mt-2 ${
                  step === 2 ? "text-yellow-600 font-medium" : "text-black"
                }`}
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
                    {/* <-- CAMPO CPF ADICIONADO AQUI --> */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        CPF {formData.cpfNaNota && "*"}
                      </label>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        className={`placeholder:text-gray-600 w-full border-2 rounded-xl px-4 py-3 ${
                          formData.cpfNaNota && !formData.cpf
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-200 focus:border-yellow-400"
                        }`}
                      />
                      {formData.cpfNaNota && !formData.cpf && (
                        <p className="text-red-500 text-xs mt-1">
                          ⚠️ CPF é obrigatório para nota fiscal
                        </p>
                      )}
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
                      <label className="block text-sm font-medium text-black mb-2" htmlFor="bairro-df-busca">
                        Bairro / Região Administrativa:
                      </label>
                      
                      
                      <input 
                        list="bairros-df-lista" 
                        id="bairro-df-busca" 
                        onChange={handleInputChange}
                        name="bairro" 
                        value={formData.bairro}
                        placeholder="Digite para buscar..." 
                        className="placeholder:text-black w-full border-2 border-gray-200 rounded-xl px-4 py-3" 
                      />

                    
                      <datalist id="bairros-df-lista">
                        <option value="Águas Claras" />
                        <option value="Arapoanga" />
                        <option value="Brazlândia" />
                        <option value="Candangolândia" />
                        <option value="Ceilândia" />
                        <option value="Cruzeiro" />
                        <option value="Fercal" />
                        <option value="Gama" />
                        <option value="Guará" />
                        <option value="Itapoã" />
                        <option value="Jardim Botânico" />
                        <option value="Lago Norte" />
                        <option value="Lago Sul" />
                        <option value="Núcleo Bandeirante" />
                        <option value="Paranoá" />
                        <option value="Park Way" />
                        <option value="Planaltina" />
                        <option value="Plano Piloto (Asa Sul, Asa Norte, Centro)" />
                        <option value="Recanto das Emas" />
                        <option value="Riacho Fundo" />
                        <option value="Riacho Fundo II" />
                        <option value="Samambaia" />
                        <option value="Santa Maria" />
                        <option value="São Sebastião" />
                        <option value="SCIA / Estrutural" />
                        <option value="SIA" />
                        <option value="Sobradinho" />
                        <option value="Sobradinho II" />
                        <option value="Sol Nascente / Pôr do Sol" />
                        <option value="Sudoeste / Octogonal" />
                        <option value="Taguatinga" />
                        <option value="Varjão" />
                        <option value="Vicente Pires" />
                        <option value="Vila Estrutural" />
                        <option value="Vila Telebrasília" />
                      </datalist>
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

                    
                    <div className="md:col-span-2 flex items-center gap-3 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <input
                        type="checkbox"
                        name="cpfNaNota"
                        id="cpfNaNota"
                        checked={formData.cpfNaNota}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-yellow-500 rounded border-gray-300 focus:ring-yellow-400"
                      />
                      <label
                        htmlFor="cpfNaNota"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        📄 Desejo CPF na nota fiscal
                      </label>
                      {formData.cpfNaNota && (
                        <span className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                          Obrigatório preencher o CPF
                        </span>
                      )}
                    </div>
                  </div>
<div className="flex gap-3">
  <button
    type="button"
    onClick={handleCalculateShipping}
    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600"
  >
    Calcular Frete
  </button>
  <button
    type="submit"
    className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-yellow-600"
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
                      { value: "pagBank", label: "Pagar pelo PagBank", icon: "" },
                      { value: "dinheiro", label: "Dinheiro", icon: "💰" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer ${
                          formData.pagamento === option.value
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-gray-200"
                        }`}
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

                {/*Tratando do frete*/}

                    <div className="bg-yellow-50 text-black rounded-xl p-5 space-y-4">
                      <h3>O frete para o bairro / R.A. de {formData.bairro} endereço fica: R$ {formData.preco_frete?.toFixed(2)}</h3>
                      <h3>O valor total fica: R$  {(cartTotal + formData.preco_frete).toFixed(2)}</h3>
                    </div>

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
                <div className="flex justify-between text-black font-bold text-lg">
                  <span>Total do pedido:</span>
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