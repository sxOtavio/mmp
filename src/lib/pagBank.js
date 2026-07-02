// --- Configurações Base --- OLHAR O .env para produção e sandbox
// --- Função para criar um CHECKOUT HOSPEDADO  ---
export async function criarCheckout(dadosCheckout, accessToken) {
  if (!accessToken) {
    throw new Error('Access Token é obrigatório para criar um checkout.');
  }

  const url = `${process.env.API_BASE_URL}/checkouts`;
  console.log(`Chamando PagBank Checkout API: ${url}`);

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-idempotency-key': dadosCheckout.reference_id || `checkout-${Date.now()}`,
    },
    body: JSON.stringify(dadosCheckout),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`Status da resposta: ${response.status}`);

    if (!response.ok) {
      console.error('❌ Resposta de erro do PagBank Checkout:');
      console.error('Status:', response.status);
      console.error('Body:', JSON.stringify(data, null, 2));
      
      let errorMessage = 'Erro desconhecido';
      if (data.error_messages && data.error_messages.length > 0) {
        errorMessage = data.error_messages.map(e => `${e.code}: ${e.description}`).join('; ');
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else {
        errorMessage = JSON.stringify(data);
      }
      
      throw new Error(`Erro ${response.status}: ${errorMessage}`);
    }

    console.log('Checkout criado com sucesso!');
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar checkout:', error.message);
    throw error;
  }
}
