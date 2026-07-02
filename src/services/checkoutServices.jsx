export async function fetchRegisterOrder({
  customer,
  items,
  total,
}) {
  
  /*
formData
    bairro: "df"
    cep:"711100"
    cidade:"brasilia"
    complemento:"apartamento 109"
    email:"woodson@gmail.com"
    endereco:"rua"
    nome:"woodson"
    numero:"4"
    pagamento:"credito"
    parcelas:"1"
    telefone:"6199661721"

cart
    itens:Array(3)
    0:{gtin: '7', nome: 'CARNE MOIDA KG', precoNormal: '38.99', precoPromocional: null, estoque: 999, …}
    1:{gtin: '7898961490427', nome: 'NECTAR NUTRI NECTAR MORANGO 200 ML', precoNormal: '2.59', precoPromocional: '1.99', estoque: 29, …}
    2:{gtin: '7898961490472', nome: 'NECTAR NUTRI NECTAR PESSEGO 200 ML', precoNormal: '2.59', precoPromocional: '1.99', estoque: 57, …}
    length:3
    [[Prototype]]:Array(0)

cartTotal
    total:42.970000000000006
    */  
    
    
  try {
    
    const token = localStorage.getItem("@token");
    const payload = {
      customer,
      items,
      total,
      createdAt: new Date().toISOString(),
    };

    const response = await fetch("/api/registerOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(
        errorData.error || "Erro ao registrar pedido"
      );
    }

    return await response.json();

  } catch (error) {
    console.error("Erro na requisição:", error);
    throw error;
  }
}

//lidando com o shipping=====================================

export const fetchShippingPrice = async ({ customer }) => {
  try {
    // Substitua pela URL da sua rota do backend (ex: NodeJS, Python, etc)
    const API_URL = '/api/shipping/calculate'; 

    const response = await fetch('/api/shipping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
         body: JSON.stringify({ customer }), 
    });

    if (!response.ok) {
      throw new Error(` SERVICE Erro no servidor: ${response.status} - ${response.statusText}`);
    }

     const data = await response.json();
    return data;

  } catch (error) {
    console.error(" SERVICE Erro na requisição do Service fetchShippingPrice:", error);
    throw error; // Repassa o erro para o bloco catch do seu hook tratar
  }
};