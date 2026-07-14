// services/deliveryServices.js

// Função auxiliar para pegar o token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("@token");
  }
  return null;
};

// Função auxiliar para headers
const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Buscar todos os pedidos para entrega
export async function fetchOrders() {
  try {
    const response = await fetch("/api/orders", {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar pedidos");
    }
    const data = await response.json();
    console.log("Pedidos recebidos no service:", data);
    return data;
  } catch (error) {
    console.error("Erro em fetchOrders:", error);
    throw error;
  }
}

// Buscar pedidos por status
export async function fetchOrdersByStatus(status) {
  try {
    const response = await fetch(`/api/orders/status/${status}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar pedidos com status ${status}`);
    }
    const data = await response.json();
    console.log(`Pedidos com status ${status} recebidos:`, data);
    return data;
  } catch (error) {
    console.error("Erro em fetchOrdersByStatus:", error);
    throw error;
  }
}

// Atualizar status do pedido
export async function updateOrderStatus(orderId, status) {
  try {
    console.log(`🔄 Atualizando pedido ${orderId} para status: ${status}`);

    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao atualizar status");
    }

    const data = await response.json();
    console.log(`Status do pedido ${orderId} atualizado:`, data);
    return data;
  } catch (error) {
    console.error(" Erro em updateOrderStatus:", error);
    throw error;
  }
}

// Retificar pesos dos itens do pedido
export async function updateOrderRealWeight(orderId, items) {
  try {
    console.log(`⚖️ Retificando pesos do pedido ${orderId}:`, items);

    const response = await fetch(`/api/orders/${orderId}/realPeso`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao retificar pesos");
    }

    console.log(`Pesos do pedido ${orderId} atualizados:`, data);
    return data;
  } catch (error) {
    console.error("Erro em updateOrderRealWeight:", error);
    throw error;
  }
}

// Buscar detalhes de um pedido específico
export async function fetchOrderDetails(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar detalhes do pedido");
    }
    const data = await response.json();
    console.log(`Detalhes do pedido ${orderId}:`, data);
    return data;
  } catch (error) {
    console.error("Erro em fetchOrderDetails:", error);
    throw error;
  }
}

// Atribuir entregador ao pedido
export async function assignDeliveryPerson(orderId, deliveryPersonId) {
  try {
    const response = await fetch(`/api/orders/${orderId}/assign`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        entregador_id: deliveryPersonId,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao atribuir entregador");
    }
    const data = await response.json();
    console.log(
      `Entregador ${deliveryPersonId} atribuído ao pedido ${orderId}:`,
      data,
    );
    return data;
  } catch (error) {
    console.error("Erro em assignDeliveryPerson:", error);
    throw error;
  }
}

// Buscar entregadores disponíveis
export async function fetchAvailableDeliveryPersons() {
  try {
    const response = await fetch("/api/delivery/persons/available", {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar entregadores disponíveis");
    }
    const data = await response.json();
    console.log("Entregadores disponíveis:", data);
    return data;
  } catch (error) {
    console.error("Erro em fetchAvailableDeliveryPersons:", error);
    throw error;
  }
}

// Registrar rota de entrega
export async function registerDeliveryRoute(orderId, routeData) {
  try {
    const response = await fetch(`/api/orders/${orderId}/route`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      throw new Error("Erro ao registrar rota de entrega");
    }
    const data = await response.json();
    console.log(`Rota registrada para o pedido ${orderId}:`, data);
    return data;
  } catch (error) {
    console.error("Erro em registerDeliveryRoute:", error);
    throw error;
  }
}

// Buscar histórico de entregas do entregador
export async function fetchDeliveryHistory(deliveryPersonId) {
  try {
    const response = await fetch(`/api/delivery/history/${deliveryPersonId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar histórico de entregas");
    }
    const data = await response.json();
    console.log(`Histórico do entregador ${deliveryPersonId}:`, data);
    return data;
  } catch (error) {
    console.error("Erro em fetchDeliveryHistory:", error);
    throw error;
  }
}

// Cancelar entrega
export async function cancelDelivery(orderId, motivo) {
  try {
    const response = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        motivo_cancelamento: motivo,
        cancelado_em: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao cancelar entrega");
    }
    const data = await response.json();
    console.log(`Pedido ${orderId} cancelado:`, data);
    return data;
  } catch (error) {
    console.error("Erro em cancelDelivery:", error);
    throw error;
  }
}

// Atualizar localização em tempo real
export async function updateDeliveryLocation(orderId, latitude, longitude) {
  try {
    const response = await fetch(`/api/orders/${orderId}/location`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        latitude,
        longitude,
        atualizado_em: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar localização");
    }
    const data = await response.json();
    console.log(`Localização do pedido ${orderId} atualizada:`, data);
    return data;
  } catch (error) {
    console.error("Erro em updateDeliveryLocation:", error);
    throw error;
  }
}

// Buscar estatísticas do entregador
export async function fetchDeliveryStats(deliveryPersonId) {
  try {
    const response = await fetch(`/api/delivery/stats/${deliveryPersonId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar estatísticas");
    }
    const data = await response.json();
    console.log(`Estatísticas do entregador ${deliveryPersonId}:`, data);
    return data;
  } catch (error) {
    console.error("Erro em fetchDeliveryStats:", error);
    throw error;
  }
}

// Buscar pedidos por entregador
export async function fetchOrdersByDeliveryPerson(deliveryPersonId) {
  try {
    const response = await fetch(`/api/orders/delivery/${deliveryPersonId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar pedidos do entregador");
    }
    const data = await response.json();
    console.log(`Pedidos do entregador ${deliveryPersonId}:`, data);
    return data;
  } catch (error) {
    console.error("Erro em fetchOrdersByDeliveryPerson:", error);
    throw error;
  }
}

// Confirmar entrega com foto/comprovante
export async function confirmDelivery(orderId, proofData) {
  try {
    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("comprovante", proofData.comprovante);
    formData.append("observacoes", proofData.observacoes || "");
    formData.append("data_entrega", new Date().toISOString());

    const token = getToken();
    const response = await fetch(`/api/orders/${orderId}/confirm`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erro ao confirmar entrega");
    }
    const data = await response.json();
    console.log(`Entrega do pedido ${orderId} confirmada:`, data);
    return data;
  } catch (error) {
    console.error("Erro em confirmDelivery:", error);
    throw error;
  }
}
