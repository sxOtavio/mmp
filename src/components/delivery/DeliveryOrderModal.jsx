// src/components/delivery/DeliveryOrderModal.jsx
import { useState } from "react";
import { DeliveryOrderItems } from "./DeliveryOrderItems";
import { DeliveryWhatsAppButtons } from "./DeliveryWhatsAppButtons";
import { getStatusConfig, abrirWhatsApp } from "@/lib/deliveryUtils";

export function DeliveryOrderModal({
  pedido,
  onClose,
  pesosRetificados,
  onPesoChange,
  onRetificar,
  onEnviarConfirmacao,
  onAvisarPeso,
  onFalarCliente,
  onRemoverItem,
  enviando,
  onAtualizar,
}) {
  const [itemRemovendo, setItemRemovendo] = useState(null);
  const [mensagemPeso, setMensagemPeso] = useState("");

  if (!pedido) return null;

  const hasPesoReal = pedido.itens?.some((item) => item.peso_real);
  const itensPorPeso =
    pedido.itens?.filter((item) => item.sold_by_weight === true) || [];

  // 🔥 CALCULA O PESO REAL MAIS PRÓXIMO
  const calcularPesoProximo = (item) => {
    const pesoOriginal = item.quantidade || 0;
    const variacao = 0.05; // 5% de variação
    const pesoMinimo = pesoOriginal * (1 - variacao);
    const pesoMaximo = pesoOriginal * (1 + variacao);

    const pesoReal = item.peso_real || pesoOriginal;

    let pesoProximo = pesoReal;
    if (pesoReal < pesoMinimo) {
      pesoProximo = pesoMinimo;
    } else if (pesoReal > pesoMaximo) {
      pesoProximo = pesoMaximo;
    }

    return {
      pesoProximo,
      diferenca: pesoReal - pesoProximo,
      dentroVariacao: pesoReal >= pesoMinimo && pesoReal <= pesoMaximo,
      pesoMinimo,
      pesoMaximo,
    };
  };

  // 🔥 ENVIA MENSAGEM SOBRE O PESO REAL MAIS PRÓXIMO
  const enviarAvisoPesoProximo = (item) => {
    const { pesoProximo, diferenca, dentroVariacao } =
      calcularPesoProximo(item);

    if (!dentroVariacao) {
      // 🔥 CORRIGIDO: Usando uma nova variável com let
      let mensagem = `⚠️ *Ajuste de Peso - Pedido #${pedido.id}*\n\n`;
      mensagem += `Olá *${pedido.cliente_nome}*,\n\n`;
      mensagem += `O produto *${item.nome}* foi pesado e o valor mais próximo que conseguimos foi:\n\n`;
      mensagem += `⚖️ *Peso disponível: ${pesoProximo.toFixed(2)}kg*\n`;
      mensagem += `📦 *Solicitado: ${item.quantidade.toFixed(2)}kg*\n`;
      mensagem += `📊 *Diferença: ${diferenca > 0 ? "+" : ""}${diferenca.toFixed(2)}kg*\n\n`;
      mensagem += `🔄 *Opções:*\n`;
      mensagem += `1️⃣ Aceitar o peso disponível\n`;
      mensagem += `2️⃣ Remover o item\n`;
      mensagem += `3️⃣ Aguardar reposição\n\n`;
      mensagem += `Responda com o número da opção (1, 2 ou 3).\n`;
      mensagem += `Agradecemos pela compreensão! 🙏`;

      abrirWhatsApp(pedido.cliente_telefone, mensagem);
      setMensagemPeso(`✅ Mensagem sobre ${item.nome} enviada!`);
      setTimeout(() => setMensagemPeso(""), 3000);
    } else {
      alert(
        `✅ O peso de ${item.nome} (${item.peso_real.toFixed(2)}kg) está dentro da variação permitida.`,
      );
    }
  };

  // 🔥 REMOVER ITEM (com confirmação)
  const confirmarRemocao = async (item) => {
    if (!confirm(`⚠️ Tem certeza que deseja remover "${item.nome}" do pedido?`))
      return;

    setItemRemovendo(item.id);

    try {
      const response = await fetch(`/api/pedido/${pedido.id}/remover-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: item.id }),
      });

      if (response.ok) {
        setMensagemPeso(`✅ "${item.nome}" removido com sucesso!`);
        setTimeout(() => setMensagemPeso(""), 3000);
        if (onAtualizar) onAtualizar();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error("Erro ao remover item");
      }
    } catch (error) {
      console.error("Erro ao remover item:", error);
      alert("❌ Erro ao remover item");
    } finally {
      setItemRemovendo(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">Pedido #{pedido.id}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-black hover:text-gray-500"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mensagem de status */}
          {mensagemPeso && (
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg">
              <p className="text-green-700">{mensagemPeso}</p>
            </div>
          )}

          {/* CLIENTE */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2 text-lg text-black">
              👤 Cliente
            </h3>
            <p className="text-black">
              <strong>Nome:</strong> {pedido.cliente_nome || "Não informado"}
            </p>
            <p className="text-black">
              <strong>Telefone:</strong>{" "}
              {pedido.cliente_telefone || "Não informado"}
            </p>
            <p className="text-black">
              <strong>Endereço:</strong> {pedido.cliente_endereco || ""}
              {pedido.cliente_numero ? `, ${pedido.cliente_numero}` : ""}
              {pedido.cliente_complemento
                ? ` - ${pedido.cliente_complemento}`
                : ""}
            </p>
            <p className="text-black">
              <strong>Bairro:</strong>{" "}
              {pedido.cliente_bairro || "Não informado"}
            </p>
            <p className="text-black">
              <strong>Cidade:</strong>{" "}
              {pedido.cliente_cidade || "Não informado"}
            </p>
            <p className="text-black">
              <strong>Frete:</strong> R${" "}
              {pedido.shipping_frete?.toFixed(2) || "0.00"}
            </p>
          </div>

          {/* ITENS */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-3 text-lg text-black">
              🛒 Itens do Pedido
            </h3>

            <DeliveryOrderItems
              itens={pedido.itens}
              pesosRetificados={pesosRetificados}
              onPesoChange={onPesoChange}
              onRemoverItem={confirmarRemocao}
              onAvisarPesoProximo={enviarAvisoPesoProximo}
              disabled={false}
              itemRemovendo={itemRemovendo}
            />
            {/* BOTÕES WHATSAPP */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <DeliveryWhatsAppButtons
                pedido={pedido}
                onRetificar={onRetificar}
                onEnviarConfirmacao={onEnviarConfirmacao}
                onAvisarPeso={onAvisarPeso}
                onFalarCliente={onFalarCliente}
                enviando={enviando}
                hasPesoReal={hasPesoReal}
              />
            </div>
            {/* TOTAIS */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-black">Subtotal</span>
                <span className="text-black">
                  R$ {(pedido.total - (pedido.shipping_frete || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-black">Frete</span>
                <span className="text-black">
                  R$ {pedido.shipping_frete?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                <span className="font-bold text-lg text-black">Total</span>
                <span className="text-2xl font-bold text-emerald-600">
                  R$ {(pedido.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* INFORMAÇÕES ADICIONAIS */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2 text-black">📋 Informações</h3>
            <p className="text-black">
              <strong>Data do pedido:</strong>{" "}
              {pedido.created_at
                ? new Date(pedido.created_at).toLocaleString()
                : "Não disponível"}
            </p>
            <p className="text-black">
              <strong>Status:</strong>{" "}
              {getStatusConfig(pedido.status_pedido || pedido.status).label}
            </p>
            <p className="text-black">
              <strong>Qtd. itens:</strong> {pedido.itens?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
