// src/app/deliveryPage/page.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useDelivery } from "@/hooks/useDelivery";
import { updateOrderRealWeight } from "@/services/deliveryServices";
import { DeliveryMetricCard } from "@/components/delivery/DeliveryMetricCard";
import { DeliveryOrderCard } from "@/components/delivery/DeliveryOrderCard";
import { DeliveryOrderModal } from "@/components/delivery/DeliveryOrderModal";
import {
  getStatusConfig,
  abrirWhatsApp,
  gerarMensagemAvisoPeso,
  gerarMensagemConfirmacao,
} from "@/lib/deliveryUtils";

export default function DeliveryPage() {
  const { orders: pedidos, loading, error, updateOrderStatus } = useDelivery();

  const [filtro, setFiltro] = useState("todos");
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [ordem, setOrdem] = useState("recente");
  const [pesosRetificados, setPesosRetificados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mostrarNotificacao, setMostrarNotificacao] = useState(false);
  const [mensagemNotificacao, setMensagemNotificacao] = useState("");
  const pedidosAnterioresRef = useRef([]);

  useEffect(() => {
    if (!pedidos?.length) {
      pedidosAnterioresRef.current = pedidos;
      return;
    }

    const pedidoConfirmado = pedidos.find((pedido) => {
      const pedidoAnterior = pedidosAnterioresRef.current.find(
        (anterior) => anterior.id === pedido.id,
      );

      if (!pedidoAnterior) return false;

      const statusAnterior =
        pedidoAnterior.status_pedido || pedidoAnterior.status;
      const statusAtual = pedido.status_pedido || pedido.status;

      return (
        statusAnterior === "waiting_confirmation" && statusAtual === "preparing"
      );
    });

    if (pedidoConfirmado) {
      setMensagemNotificacao(
        `� Pedido #${pedidoConfirmado.id} pago com sucesso! Agora siga para a separação.`,
      );
      setMostrarNotificacao(true);
      window.setTimeout(() => setMostrarNotificacao(false), 5000);
    }

    pedidosAnterioresRef.current = pedidos;
  }, [pedidos]);

  // CONTAR POR STATUS
  const contarPorStatus = (pedidosList) => {
    const contagem = {
      total: pedidosList.length,
      pending: 0,
      preparing: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      weight_revised: 0,
      waiting_confirmation: 0,
    };

    pedidosList.forEach((pedido) => {
      const status = pedido.status_pedido || pedido.status;
      if (contagem.hasOwnProperty(status)) {
        contagem[status]++;
      }
    });

    return contagem;
  };

  const contagens = contarPorStatus(pedidos);

  // 🔥 FILTRAR PEDIDOS
  const filtrarPedidos = (pedidosList, filtro) => {
    if (filtro === "todos") {
      return pedidosList;
    }
    return pedidosList.filter((pedido) => {
      const status = pedido.status_pedido || pedido.status;
      return status === filtro;
    });
  };

  // 🔥 ORDENAR PEDIDOS
  const ordenarPedidos = (pedidosList) => {
    const sorted = [...pedidosList];
    switch (ordem) {
      case "recente":
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
      case "antigo":
        return sorted.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );
      case "maior":
        return sorted.sort((a, b) => b.total - a.total);
      case "menor":
        return sorted.sort((a, b) => a.total - b.total);
      default:
        return sorted;
    }
  };

  const pedidosFiltrados = ordenarPedidos(filtrarPedidos(pedidos, filtro));

  // 🔥 FORMATAR DATA
  const formatarData = (dataISO) => {
    if (!dataISO) return "Data não disponível";
    const data = new Date(dataISO);
    const agora = new Date();
    const diffMinutos = Math.abs(Math.floor((agora - data) / 60000));

    if (diffMinutos < 1) return "Agora mesmo";
    if (diffMinutos < 60) return `${diffMinutos} min atrás`;
    if (diffMinutos < 120) return "1 hora atrás";
    if (diffMinutos < 1440)
      return `${Math.floor(diffMinutos / 60)} horas atrás`;
    return data.toLocaleDateString();
  };

  // 🔥 ATUALIZAR STATUS - FUNÇÃO QUE SERÁ PASSADA PARA O CARD
  const handleUpdateStatus = async (pedidoId, novoStatus) => {
    const result = await updateOrderStatus(pedidoId, novoStatus);

    if (result) {
      const mensagens = {
        preparing: "Pedido encaminhado para separação",
        out_for_delivery: "Pedido saiu para entrega",
        delivered: "Pedido entregue com sucesso!",
        waiting_confirmation: "Pedido confirmado e pagamento liberado!",
      };

      setMensagemNotificacao(mensagens[novoStatus] || "Status atualizado!");
      setMostrarNotificacao(true);
      setTimeout(() => setMostrarNotificacao(false), 3000);

      if (novoStatus === "waiting_confirmation" && result.payment_link) {
        window.open(result.payment_link, "_blank", "noopener,noreferrer");
      }

      setPedidoSelecionado(null);
    } else {
      setMensagemNotificacao("Erro ao atualizar status");
      setMostrarNotificacao(true);
      setTimeout(() => setMostrarNotificacao(false), 3000);
    }
  };

  // 🔥 ABRIR DETALHES
  const abrirDetalhes = (pedido) => {
    setPedidoSelecionado(pedido);
    setPesosRetificados({});
  };

  //  Usa itemKey como identificador único
  const handlePesoChange = (itemKey, novoPeso) => {
    console.log(`📝 handlePesoChange: ${itemKey} = ${novoPeso}`);
    setPesosRetificados((prev) => {
      const novoEstado = {
        ...prev,
        [itemKey]: novoPeso,
      };
      console.log("📊 Novo estado:", novoEstado);
      return novoEstado;
    });
  };

  // 🔥 BOTÃO 1: AVISAR SOBRE PESO
  const abrirWhatsAppAvisoPeso = (pedido) => {
    const itensPorPeso =
      pedido.itens?.filter((item) => item.sold_by_weight === true) || [];

    if (itensPorPeso.length === 0) {
      alert("⚠️ Este pedido não tem produtos por peso!");
      return;
    }

    if (!pedido.cliente_telefone) {
      alert("⚠️ Cliente não tem telefone cadastrado!");
      return;
    }

    const mensagem = gerarMensagemAvisoPeso(pedido, itensPorPeso);
    abrirWhatsApp(pedido.cliente_telefone, mensagem);
  };

  // 🔥 BOTÃO 2: FALAR COM CLIENTE
  const abrirWhatsAppCliente = (pedido) => {
    if (!pedido.cliente_telefone) {
      alert("⚠️ Cliente não tem telefone cadastrado!");
      return;
    }

    const mensagem = `Olá *${pedido.cliente_nome}*! 👋\n\nSeu pedido #${pedido.id} está sendo separado.`;
    abrirWhatsApp(pedido.cliente_telefone, mensagem);
  };

  // 🔥 BOTÃO 3: RETIFICAR PESOS - CORRIGIDO
  // src/app/deliveryPage/page.jsx

  const retificarPesos = async (order) => {
    const orderItems = order.itens || order.items || [];
    const weightItems =
      orderItems.filter((item) => item.sold_by_weight === true) || [];

    console.log("📦 Itens por peso:", weightItems);
    console.log("📊 Pesos retificados (estado):", pesosRetificados);

    if (weightItems.length === 0) {
      alert("⚠️ Este pedido não tem produtos por peso!");
      return;
    }

    const allFilled = weightItems.every((item) => {
      // 🔥 USA O ID DO ITEM (que agora vem da API)
      const itemKey = item.id || `item-${orderItems.indexOf(item)}`;
      const value = pesosRetificados[itemKey];
      return value !== undefined && value > 0;
    });

    if (!allFilled) {
      alert("⚠️ Preencha o peso real de todos os produtos por peso!");
      return;
    }

    setEnviando(true);

    try {
      const itemsWithWeight = weightItems.map((item) => {
        // 🔥 USA O ID DO ITEM (agora disponível)
        const itemKey = item.id || `item-${orderItems.indexOf(item)}`;
        return {
          id: item.id, // ← AGORA VAI TER UM ID VÁLIDO
          product_id: item.product_id || item.id,
          actual_weight: pesosRetificados[itemKey],
        };
      });

      console.log("📦 Enviando para API:", {
        orderId: order.id,
        items: itemsWithWeight,
      });

      const data = await updateOrderRealWeight(order.id, itemsWithWeight);

      if (data?.success) {
        setMensagemNotificacao("✅ Pesos retificados com sucesso!");
        setMostrarNotificacao(true);
        setTimeout(() => setMostrarNotificacao(false), 3000);

        await updateOrderStatus(order.id, "weight_revised");

        setTimeout(() => {
          window.location.reload();
        }, 1000);

        setPedidoSelecionado(null);
      } else {
        console.error("Erro da API:", data);
        throw new Error(data?.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao retificar pesos:", error);
      alert("❌ Erro ao salvar os novos pesos: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  // 🔥 BOTÃO 4: ENVIAR CONFIRMAÇÃO
  const enviarConfirmacao = async (pedido) => {
    const itensPorPeso =
      pedido.itens?.filter((item) => item.sold_by_weight === true) || [];

    if (itensPorPeso.length === 0) {
      alert("⚠️ Este pedido não tem produtos por peso!");
      return;
    }

    const todosRetificados = itensPorPeso.every(
      (item) =>
        item.peso_real !== undefined &&
        item.peso_real !== null &&
        item.peso_real > 0,
    );

    if (!todosRetificados) {
      alert("⚠️ Retifique os pesos antes de enviar a confirmação!");
      return;
    }

    setEnviando(true);

    try {
      const result = await updateOrderStatus(pedido.id, "waiting_confirmation");

      const mensagem = gerarMensagemConfirmacao(pedido, {
        paymentLink: result?.payment_link,
        totalFinal: result?.order?.total ?? pedido.total,
      });

      abrirWhatsApp(pedido.cliente_telefone, mensagem);

      setMensagemNotificacao("✅ Mensagem de confirmação enviada!");
      setMostrarNotificacao(true);
      setTimeout(() => setMostrarNotificacao(false), 3000);

      setPedidoSelecionado(null);
    } catch (error) {
      console.error("Erro ao enviar confirmação:", error);
      alert("❌ Erro ao enviar mensagem");
    } finally {
      setEnviando(false);
    }
  };

  // Mostrar loading
  if (loading && pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-black text-xl">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-black text-xl font-bold mb-2">
            Erro ao carregar
          </h2>
          <p className="text-black">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notificação Toast */}
      {mostrarNotificacao && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-white font-medium">
              {mensagemNotificacao}
            </span>
          </div>
        </div>
      )}

      {/* Loading overlay para ações */}
      {enviando && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-black">Processando...</p>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black">
              Painel do Entregador
            </h1>
            <p className="mt-1 text-black">
              Gerencie as entregas do supermercado
            </p>
            {pedidos.length > 0 && (
              <p className="text-sm text-black mt-1">
                {pedidos.length} pedidos no total
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <DeliveryMetricCard
            icon="📊"
            label="Total"
            value={pedidos.length}
            cor="gray"
          />
          <DeliveryMetricCard
            icon="⏰"
            label="Aguardando"
            value={contagens.pending || 0}
            cor="amber"
          />
          <DeliveryMetricCard
            icon="📦"
            label="Separando"
            value={contagens.preparing || 0}
            cor="blue"
          />
          <DeliveryMetricCard
            icon="🛵"
            label="Em Rota"
            value={contagens.out_for_delivery || 0}
            cor="purple"
          />
          <DeliveryMetricCard
            icon="✅"
            label="Entregues"
            value={contagens.delivered || 0}
            cor="emerald"
          />
        </div>

        {/* Barra de filtros e ordenação */}
        <div className="rounded-xl shadow-sm p-4 mb-6 bg-white">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "todos", label: "Todos", icon: "📋" },
                { id: "pending", label: "Aguardando", icon: "⏰" },
                { id: "preparing", label: "Separando", icon: "📦" },
                { id: "out_for_delivery", label: "Em Rota", icon: "🛵" },
                { id: "delivered", label: "Entregues", icon: "✅" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-black ${
                    filtro === f.id
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      filtro === f.id
                        ? "bg-white text-blue-500"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {f.id === "todos" ? pedidos.length : contagens[f.id] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Ordenação */}
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black"
            >
              <option value="recente">📅 Mais recentes</option>
              <option value="antigo">📅 Mais antigos</option>
              <option value="maior">💰 Maior valor</option>
              <option value="menor">💰 Menor valor</option>
            </select>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-20 rounded-xl bg-white">
            <div className="text-7xl mb-4">📭</div>
            <p className="text-xl text-black">Nenhum pedido encontrado</p>
            <p className="text-sm mt-2 text-black">Tente outro filtro</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pedidosFiltrados.map((pedido) => {
              const statusPedido =
                pedido.status_pedido || pedido.status || "pending";
              const statusConfig = getStatusConfig(statusPedido);
              const tempoPedido = formatarData(
                pedido.created_at || pedido.createdAt,
              );
              const hasWeightProducts = pedido.itens?.some(
                (item) => item.sold_by_weight === true,
              );
              const hasPesoReal = pedido.itens?.some((item) => item.peso_real);

              return (
                <DeliveryOrderCard
                  key={pedido.id}
                  pedido={pedido}
                  statusConfig={statusConfig}
                  tempoPedido={tempoPedido}
                  hasWeightProducts={hasWeightProducts}
                  hasPesoReal={hasPesoReal}
                  onClick={() => abrirDetalhes(pedido)}
                  onUpdateStatus={handleUpdateStatus} // 🔥 PASSANDO A FUNÇÃO
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {pedidoSelecionado && (
        <DeliveryOrderModal
          pedido={pedidoSelecionado}
          onClose={() => setPedidoSelecionado(null)}
          pesosRetificados={pesosRetificados}
          onPesoChange={handlePesoChange}
          onRetificar={retificarPesos}
          onEnviarConfirmacao={enviarConfirmacao}
          onAvisarPeso={abrirWhatsAppAvisoPeso}
          onFalarCliente={abrirWhatsAppCliente}
          enviando={enviando}
        />
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
