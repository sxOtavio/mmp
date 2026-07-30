// src/lib/deliveryUtils.js

//  CONFIGURAÇÃO DOS STATUS
export const STATUS_CONFIG = {
  pending: {
    label: "Aguardando",
    icon: "⏰",
    cor: "amber",
    bg: "bg-amber-50",
    text: "text-black",
    border: "border-amber-200",
    acao: "Iniciar Separação",
    proxStatus: "preparing",
    descricao: "Pedido aguardando separação",
  },
  preparing: {
    label: "Separando",
    icon: "📦",
    cor: "blue",
    bg: "bg-blue-50",
    text: "text-black",
    border: "border-blue-200",
    acao: "Sair para Entrega",
    proxStatus: "out_for_delivery",
    descricao: "Produtos sendo separados",
  },
  out_for_delivery: {
    label: "Em Rota",
    icon: "🛵",
    cor: "purple",
    bg: "bg-purple-50",
    text: "text-black",
    border: "border-purple-200",
    acao: "Finalizar Entrega",
    proxStatus: "delivered",
    descricao: "Entregador a caminho",
  },
  delivered: {
    label: "Entregue",
    icon: "✅",
    cor: "emerald",
    bg: "bg-emerald-50",
    text: "text-black",
    border: "border-emerald-200",
    acao: null,
    proxStatus: null,
    descricao: "Pedido finalizado",
  },
  cancelled: {
    label: "Cancelado",
    icon: "❌",
    cor: "red",
    bg: "bg-red-50",
    text: "text-black",
    border: "border-red-200",
    acao: null,
    proxStatus: null,
    descricao: "Pedido cancelado",
  },
  weight_revised: {
    label: "Peso Retificado",
    icon: "✏️",
    cor: "purple",
    bg: "bg-purple-50",
    text: "text-black",
    border: "border-purple-200",
    acao: "Confirmar com Cliente",
    proxStatus: "waiting_confirmation",
    descricao: "Pesos ajustados pelo separador",
  },
  waiting_confirmation: {
    label: "Pago / Pronto para Separação",
    icon: "💳",
    cor: "emerald",
    bg: "bg-emerald-50",
    text: "text-black",
    border: "border-emerald-200",
    acao: "Iniciar Separação",
    proxStatus: "preparing",
    descricao: "Pagamento confirmado e pedido pronto para separação",
  },
};

//  FUNÇÃO PARA PEGAR CONFIGURAÇÃO DO STATUS
export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
};

//  FUNÇÃO PARA GERAR LINK DO WHATSAPP
export const gerarLinkWhatsApp = (telefone, mensagem) => {
  const telefoneLimpo = telefone.replace(/\D/g, "");
  const telefoneFormatado = `55${telefoneLimpo}`;
  const mensagemCodificada = encodeURIComponent(mensagem);
  return `https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`;
};

//  FUNÇÃO PARA ABRIR WHATSAPP (REUTILIZA A MESMA ABA)
export const abrirWhatsApp = (telefone, mensagem) => {
  const telefoneLimpo = telefone.replace(/\D/g, "");
  const telefoneFormatado = `55${telefoneLimpo}`;
  const mensagemCodificada = encodeURIComponent(mensagem);
  const url = `https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`;

  const whatsappWindow = window.open("", "whatsapp_window");
  if (whatsappWindow && !whatsappWindow.closed) {
    whatsappWindow.location.href = url;
    whatsappWindow.focus();
  } else {
    window.open(url, "whatsapp_window");
  }
};

//  MENSAGEM DE AVISO DE PESO
export const gerarMensagemAvisoPeso = (pedido, itensPorPeso) => {
  let mensagem = `🛒 *Pedido #${pedido.id} - Confirmação de Peso*\n\n`;
  mensagem += `Olá *${pedido.cliente_nome}*, seu pedido está sendo separado! 🙏\n\n`;
  mensagem += `📦 *Produtos que serão pesados:*\n`;
  itensPorPeso.forEach((item) => {
    const peso = item.quantidade || 0;
    mensagem += `\n⚖️ *${item.nome}*:\n`;
    mensagem += `   Peso solicitado: ${peso.toFixed(2)}kg\n`;
    mensagem += `   ⚠️ Pode sofrer variação de até ±5%\n`;
  });
  const totalEstimado = itensPorPeso.reduce((acc, item) => {
    return acc + item.preco * (item.quantidade || 0);
  }, 0);
  mensagem += `\n *Valor estimado:* R$ ${totalEstimado.toFixed(2)}\n`;
  mensagem += `\n *Observação:*\n`;
  mensagem += `Os produtos vendidos por peso são pesados no momento da separação.\n`;
  mensagem += `O valor final pode variar ligeiramente.\n\n`;
  mensagem += ` *Dúvidas?* Responda esta mensagem!\n`;
  mensagem += `Agradecemos pela compreensão! 🙏`;
  return mensagem;
};

//  MENSAGEM DE CONFIRMAÇÃO
export const gerarMensagemConfirmacao = (pedido, options = {}) => {
  const { paymentLink, totalFinal: totalInformado } = options;

  let mensagem = `✅ *Pedido #${pedido.id} CONFIRMADO!*\n\n`;
  mensagem += `Olá *${pedido.cliente_nome}*, seu pedido foi separado e confirmado! 🎉\n\n`;
  mensagem += `📦 *Produtos confirmados:*\n`;

  let totalCalculado = 0;

  pedido.itens.forEach((item) => {
    const isSoldByWeight = item.sold_by_weight === true;
    const quantidade =
      isSoldByWeight && item.peso_real ? item.peso_real : item.quantidade;
    const preco = item.preco;
    const subtotal = preco * quantidade;
    totalCalculado += subtotal;

    mensagem += `\n• *${item.nome}*`;
    if (isSoldByWeight) {
      mensagem += `: ${quantidade.toFixed(2)}kg`;
    } else {
      mensagem += `: ${quantidade}x`;
    }
    mensagem += ` = R$ ${subtotal.toFixed(2)}`;
  });

  if (pedido.shipping_frete > 0) {
    mensagem += `\n\n *Frete:* R$ ${pedido.shipping_frete.toFixed(2)}`;
    totalCalculado += pedido.shipping_frete;
  }

  const totalFinal = Number(
    totalInformado ?? pedido.total ?? totalCalculado ?? 0,
  );

  mensagem += `\n\n *Total final:* R$ ${totalFinal.toFixed(2)}`;
  mensagem += `\n\n *Agora é só pagar!*\n`;
  mensagem += `Acesse o link para finalizar:\n`;
  mensagem += `${paymentLink || `${window.location.origin}/pagamento/${pedido.id}`}`;
  mensagem += `\n\nObrigado por comprar conosco! 🙏`;

  return mensagem;
};
