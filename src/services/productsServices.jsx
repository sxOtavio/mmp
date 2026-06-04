const API_URL = "http://localhost:3000/api";

export async function fetchProducts() {
  try {
    const response = await fetch(
      `/api/products`
    );

    if (!response.ok) {
      throw new Error(
        "Erro ao buscar produtos"
      );
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error(error);

    return [];
  }
}

//--------------------------  Produtos em promoção ----------------------------------
export async function fetchPromoProducts() {
  try {
    const response = await fetch(
      `/api/promo`
    );

    if (!response.ok) {
      throw new Error(
        "Erro ao buscar produtos"
      );
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error(error);

    return [];
  }
}