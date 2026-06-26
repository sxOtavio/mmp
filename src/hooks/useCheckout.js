import { fetchRegisterOrder } from "@/services/checkoutServices";

export function useDelivery() {
 
const loadDelivery = async (formData, cart, cartTotal) => {
  try {
    console.log(" Enviando pedido:", { formData, cart, cartTotal });

    const response = await fetchRegisterOrder({
      customer: formData,
      items: cart,
      total: cartTotal
    });

    console.log("Resposta COMPLETA da API:");
    console.log(JSON.stringify(response, null, 2));

    // Verifica se tem init_point
    const initPoint = response?.sandbox_init_point || response?.init_point;
    
    console.log(" Init Point encontrado:", initPoint);
    console.log(" Todas as chaves:", Object.keys(response));

    if (!initPoint) {
      console.error(" API não retornou init_point!", response);
      // Mostra mensagem de erro pro usuário
      throw new Error("Erro ao gerar pagamento: init_point não encontrado");
    }

    // Redireciona
    window.location.href = initPoint;

  } catch (error) {
    console.error(" Erro ao finalizar compra:", error);
    // Mostra toast/alert pro usuário
    alert(`Erro ao processar pagamento: ${error.message}`);
  }

};
  return {
    loadDelivery
  };
}