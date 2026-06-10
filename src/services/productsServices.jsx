

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
console.log("Produtos em promoçõa", data);
    return data;

  } catch (error) {
    console.error(error);

    return [];
  }
}

// ======================== TOKEN DE AUTENTICAÇÃO PARA AS FOTOS DOS PRODUTOS =========================

export async function fetchPhotoToken() {
  try {
    const response = await fetch(
      `/api/image/token`
    );

    if (!response.ok) {
      throw new Error(
        "Erro ao buscar token das fotos"
      );
    }
console.log("Token de fotos obtido com sucesso", data);

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("ERRO NO SERVICE!!",error);

    return [];
  }
}