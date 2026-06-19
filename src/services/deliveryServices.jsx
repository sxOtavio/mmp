export async function fetchOrders() {
  try {
    const token = localStorage.getItem("@token");

    const response = await fetch("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar pedidos");
    }
    const data = await response.json();
console.log("arquivos recebidos no service",data);
    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}