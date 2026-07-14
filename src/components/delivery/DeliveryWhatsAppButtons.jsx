// src/components/delivery/DeliveryWhatsAppButtons.jsx
const abrirWhatsApp = (telefone, mensagem) => {
  const telefoneLimpo = telefone.replace(/\D/g, '');
  const telefoneFormatado = `55${telefoneLimpo}`;
  const mensagemCodificada = encodeURIComponent(mensagem);
  const url = `https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`;
  
  const whatsappWindow = window.open('', 'whatsapp_window');
  if (whatsappWindow && !whatsappWindow.closed) {
    whatsappWindow.location.href = url;
    whatsappWindow.focus();
  } else {
    window.open(url, 'whatsapp_window');
  }
};

export function DeliveryWhatsAppButtons({ 
  pedido, 
  onRetificar, 
  onEnviarConfirmacao,
  onAvisarPeso,
  onFalarCliente,
  enviando,
  hasPesoReal 
}) {
  const hasWeightProducts = pedido.itens?.some(item => item.sold_by_weight === true);

  return (
    <div className="flex flex-wrap gap-3">
      {hasWeightProducts && (
        <>
          <button
            onClick={() => onAvisarPeso(pedido)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center gap-2 text-sm"
            disabled={enviando}
          >
            <span>📱</span>
            Avisar sobre peso
          </button>

          <button
            onClick={() => onRetificar(pedido)}
            disabled={enviando || hasPesoReal}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <span>✏️</span>
            {enviando ? 'Salvando...' : 'Retificar pesos'}
          </button>

          <button
            onClick={() => onEnviarConfirmacao(pedido)}
            disabled={enviando || !hasPesoReal}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <span>✅</span>
            {enviando ? 'Enviando...' : 'Enviar confirmação'}
          </button>
        </>
      )}
      
      <button
        onClick={() => onFalarCliente(pedido)}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2 text-sm"
        disabled={enviando}
      >
        <span>💬</span>
        Falar com cliente
      </button>
    </div>
  );
}