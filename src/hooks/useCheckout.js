import { fetchRegisterOrder, fetchShippingPrice } from "@/services/checkoutServices";

export function useDelivery() {
 
const loadDelivery = async (formData, cart, cartTotal) => {
  try {
    console.log("📦 Enviando pedido:", { formData, cart, cartTotal });

    const response = await fetchRegisterOrder({
      customer: formData,
      items: cart,
      total: cartTotal
    });

    console.log("✅ Resposta COMPLETA da API:");
    console.log(JSON.stringify(response, null, 2));

    // 🔧 CORREÇÃO: Usa payment_link em vez de init_point
    // O PagBank retorna payment_link, não init_point (isso é do Mercado Pago)
    const checkoutUrl = response?.payment_link;
    
    console.log("🔗 Link de pagamento encontrado:", checkoutUrl);
    console.log("📋 Todas as chaves:", Object.keys(response));

    if (!checkoutUrl) {
      console.error("❌ API não retornou payment_link!", response);
      throw new Error("Erro ao gerar pagamento: link de pagamento não encontrado");
    }

    // ✅ Redireciona o usuário para o checkout do PagBank
    window.location.href = checkoutUrl;

  } catch (error) {
    console.error("❌ Erro ao finalizar compra:", error);
    alert(`Erro ao processar pagamento: ${error.message}`);
  }
};

//Lidando com o calculo do frete

const loadShipping = async (formData) => {
  try {
    console.log("Buscando valor de frete para:", formData.bairro );

    const response = await fetchShippingPrice({customer: formData });

    console.log("HOOK Resposta COMPLETA da API:");
    console.log(JSON.stringify(response, null, 2));

    if (response.customer.acepted==false) {
      console.error("HOOK Região não aceita!", response);
      throw new Error("Erro ao gerar pagamento: link de pagamento não encontrado");
    }
  
  return response; 
  } catch (error) {
    console.error("❌ HOOK Erro ao finalizar consulta de frete:", error);
    alert(`Erro ao processar pagamento: ${error.message}`);
  }

};

  return {
    loadDelivery,
    loadShipping
  };
}