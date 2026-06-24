'use client';

import { useState } from 'react';
import { useDelivery } from '@/hooks/useDelivery';

//  Mapeamento de status 
const STATUS_MAP = {
  pending: 'Aguardando',
  preparing: 'Separando',
  out_for_delivery: 'Em Rota',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
};

// Configuração dos status
const getStatusConfig = (status) => {
  const configs = {
    pending: {
      label: 'Aguardando',
      icon: '⏰',
      cor: 'amber',
      bg: 'bg-amber-50',
      text: 'text-black',
      border: 'border-amber-200',
      acao: 'Iniciar Separação',
      proxStatus: 'preparing',
      descricao: 'Pedido aguardando separação'
    },
    preparing: {
      label: 'Separando',
      icon: '📦',
      cor: 'blue',
      bg: 'bg-blue-50',
      text: 'text-black',
      border: 'border-blue-200',
      acao: 'Sair para Entrega',
      proxStatus: 'out_for_delivery',
      descricao: 'Produtos sendo separados'
    },
    out_for_delivery: {
      label: 'Em Rota',
      icon: '🛵',
      cor: 'purple',
      bg: 'bg-purple-50',
      text: 'text-black',
      border: 'border-purple-200',
      acao: 'Finalizar Entrega',
      proxStatus: 'delivered',
      descricao: 'Entregador a caminho'
    },
    delivered: {
      label: 'Entregue',
      icon: '✅',
      cor: 'emerald',
      bg: 'bg-emerald-50',
      text: 'text-black',
      border: 'border-emerald-200',
      acao: null,
      proxStatus: null,
      descricao: 'Pedido finalizado'
    },
    cancelled: {
      label: 'Cancelado',
      icon: '❌',
      cor: 'red',
      bg: 'bg-red-50',
      text: 'text-black',
      border: 'border-red-200',
      acao: null,
      proxStatus: null,
      descricao: 'Pedido cancelado'
    }
  };
  return configs[status] || configs.pending;
};

export default function DeliveryPage() {
  const {
    orders: pedidos,
    loading,
    error,
    stats,
    updateOrderStatus,
  } = useDelivery();

  const [filtro, setFiltro] = useState('todos');
  const [mostrarNotificacao, setMostrarNotificacao] = useState(false);
  const [mensagemNotificacao, setMensagemNotificacao] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [ordem, setOrdem] = useState('recente');


  const contarPorStatus = (pedidosList) => {
    const contagem = {
      total: pedidosList.length,
      pending: 0,
      preparing: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0
    };

    pedidosList.forEach(pedido => {
      const status = pedido.status_pedido || pedido.status;
      if (contagem.hasOwnProperty(status)) {
        contagem[status]++;
      }
    });

    return contagem;
  };

  const contagens = contarPorStatus(pedidos);

 
  const filtrarPedidos = (pedidosList, filtro) => {
    if (filtro === 'todos') {
      return pedidosList;
    }
    return pedidosList.filter(pedido => {
      const status = pedido.status_pedido || pedido.status;
      return status === filtro;
    });
  };

  const atualizarStatus = async (pedidoId, novoStatus) => {
    const result = await updateOrderStatus(pedidoId, novoStatus);
    
    if (result) {
      const mensagens = {
        preparing: 'Pedido encaminhado para separação',
        out_for_delivery: ' Pedido saiu para entrega',
        delivered: 'Pedido entregue com sucesso!'
      };
      
      setMensagemNotificacao(mensagens[novoStatus] || ' Status atualizado!');
      setMostrarNotificacao(true);
      setTimeout(() => setMostrarNotificacao(false), 3000);
      setPedidoSelecionado(null);
    } else {
      setMensagemNotificacao(' Erro ao atualizar status');
      setMostrarNotificacao(true);
      setTimeout(() => setMostrarNotificacao(false), 3000);
    }
  };

  const abrirDetalhes = (pedido) => {
    setPedidoSelecionado(pedido);
  };

  const ordenarPedidos = (pedidosList) => {
    const sorted = [...pedidosList];
    switch (ordem) {
      case 'recente':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'antigo':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'maior':
        return sorted.sort((a, b) => b.total - a.total);
      case 'menor':
        return sorted.sort((a, b) => a.total - b.total);
      default:
        return sorted;
    }
  };

  const pedidosFiltrados = ordenarPedidos(filtrarPedidos(pedidos, filtro));

  const formatarData = (dataISO) => {
    if (!dataISO) return 'Data não disponível';
    const data = new Date(dataISO);
    const agora = new Date();
    const diffMinutos = Math.abs(Math.floor((agora - data) / 60000));

    if (diffMinutos < 1) return 'Agora mesmo';
    if (diffMinutos < 60) return `${diffMinutos} min atrás`;
    if (diffMinutos < 120) return '1 hora atrás';
    if (diffMinutos < 1440) return `${Math.floor(diffMinutos / 60)} horas atrás`;
    return data.toLocaleDateString();
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
          <div className="text-6xl mb-4"></div>
          <h2 className="text-black text-xl font-bold mb-2">Erro ao carregar</h2>
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
            <span className="text-white font-medium">{mensagemNotificacao}</span>
          </div>
        </div>
      )}

      {/* Loading overlay para ações */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-black">Processando...</p>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">Pedido #{pedidoSelecionado.id}</h2>
              <button onClick={() => setPedidoSelecionado(null)} className="text-2xl text-black hover:text-gray-500">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Cliente */}
              <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-2 text-lg text-black">👤 Cliente</h3>
                <p className="text-black"><strong className="text-black">Nome:</strong> {pedidoSelecionado.cliente_nome || pedidoSelecionado.cliente?.nome || 'Não informado'}</p>
                <p className="text-black"><strong className="text-black">Telefone:</strong> {pedidoSelecionado.cliente_telefone || pedidoSelecionado.cliente?.telefone || 'Não informado'}</p>
                <p className="text-black"><strong className="text-black">Endereço:</strong> {pedidoSelecionado.cliente_endereco || pedidoSelecionado.cliente?.endereco || 'Não informado'}</p>
                <p className="text-black"><strong className="text-black">Cidade:</strong> {pedidoSelecionado.cliente_cidade || pedidoSelecionado.cliente?.cidade || 'Não informado'}</p>
              </div>

              {/* Itens */}
              <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-3 text-lg text-black">🛒 Itens do Pedido</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pedidoSelecionado.itens && pedidoSelecionado.itens.length > 0 ? (
                    pedidoSelecionado.itens.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                        <div>
                          <span className="font-medium text-black">{item.quantidade}x</span>
                          <span className="ml-2 text-black">{item.nome}</span>
                        </div>
                        <span className="font-semibold text-black">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-black text-center py-4">Nenhum item encontrado</p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-lg text-black">Total</span>
                  <span className="text-2xl font-bold text-emerald-600">R$ {(pedidoSelecionado.total || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-2 text-black"> Informações</h3>
                <p className="text-black"><strong className="text-black">Data do pedido:</strong> {pedidoSelecionado.created_at ? new Date(pedidoSelecionado.created_at).toLocaleString() : 'Não disponível'}</p>
                <p className="text-black"><strong className="text-black">Status:</strong> {getStatusConfig(pedidoSelecionado.status_pedido || pedidoSelecionado.status).label}</p>
                <p className="text-black"><strong className="text-black">Qtd. itens:</strong> {pedidoSelecionado.itens?.length || 0}</p>
              </div>
            </div>
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

        {/* Cards de métricas - USANDO OS STATUS EM INGLÊS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <MetricCard icon="📊" label="Total" value={pedidos.length} cor="gray" />
          <MetricCard icon="⏰" label="Aguardando" value={contagens.pending || 0} cor="amber" />
          <MetricCard icon="📦" label="Separando" value={contagens.preparing || 0} cor="blue" />
          <MetricCard icon="🛵" label="Em Rota" value={contagens.out_for_delivery || 0} cor="purple" />
          <MetricCard icon="✅" label="Entregues" value={contagens.delivered || 0} cor="emerald" />
        </div>

        {/* Barra de filtros e ordenação - FILTROS EM INGLÊS */}
        <div className="rounded-xl shadow-sm p-4 mb-6 bg-white">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'todos', label: 'Todos', icon: '📋' },
                { id: 'pending', label: 'Aguardando', icon: '⏰' },
                { id: 'preparing', label: 'Separando', icon: '📦' },
                { id: 'out_for_delivery', label: 'Em Rota', icon: '🛵' },
                { id: 'delivered', label: 'Entregues', icon: '✅' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-black ${
                    filtro === f.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    filtro === f.id ? 'bg-white text-blue-500' : 'bg-gray-300 text-black'
                  }`}>
                    {f.id === 'todos' ? pedidos.length : contagens[f.id] || 0}
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
              const statusPedido = pedido.status_pedido || pedido.status || 'pending';
              const statusConfig = getStatusConfig(statusPedido);
              const tempoPedido = formatarData(pedido.created_at || pedido.createdAt);

              return (
                <div
                  key={pedido.id}
                  className={`group rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer bg-white ${statusConfig.border} border`}
                  onClick={() => abrirDetalhes(pedido)}
                >
                  {/* Header */}
                  <div className={`${statusConfig.bg} px-4 py-3 border-b ${statusConfig.border}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{statusConfig.icon}</span>
                          <div>
                            <p className="text-xs text-black opacity-75">Pedido</p>
                            <h3 className="font-bold text-lg text-black">#{pedido.id}</h3>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} text-black border ${statusConfig.border}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-black">{pedido.cliente_nome || pedido.cliente?.nome || 'Cliente não informado'}</p>
                        <p className="text-sm text-black opacity-75">{pedido.cliente_telefone || pedido.cliente?.telefone || ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-black opacity-60">{tempoPedido}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <p className="text-sm text-black flex-1">
                        {pedido.cliente_cidade || pedido.cliente?.cidade || ''} {pedido.cliente_bairro || pedido.cliente?.bairro || ''} {pedido.cliente_endereco || pedido.cliente?.endereco || ''} {pedido.cliente_numero || pedido.cliente?.numero || ''}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="space-y-1">
                          {pedido.itens && pedido.itens.length > 0 ? (
                            <>
                              {pedido.itens.slice(0, 3).map((item, i) => (
                                <p key={i} className="text-sm text-black">
                                  {item.quantidade}x {item.nome}
                                </p>
                              ))}
                              {pedido.itens.length > 3 && (
                                <p className="text-xs text-black opacity-60">+{pedido.itens.length - 3} itens</p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-black opacity-60">Sem itens</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm text-black opacity-75">Total</span>
                      <span className="text-xl font-bold text-emerald-600">
                        R$ {(pedido.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {statusConfig.acao && (
                    <div className="p-4 pt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          atualizarStatus(pedido.id, statusConfig.proxStatus);
                        }}
                        className="w-full py-2.5 rounded-lg text-white font-medium transition-all transform hover:scale-105 shadow-md"
                        style={{
                          backgroundColor: statusConfig.cor === 'amber' ? '#f59e0b' :
                            statusConfig.cor === 'blue' ? '#3b82f6' :
                              statusConfig.cor === 'purple' ? '#a855f7' : '#10b981'
                        }}
                      >
                        {statusConfig.acao} →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Animações com Tailwind */}
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

// Componente MetricCard
function MetricCard({ icon, label, value, cor }) {
  const cores = {
    gray: 'from-gray-50 to-gray-100',
    amber: 'from-amber-50 to-amber-100',
    blue: 'from-blue-50 to-blue-100',
    purple: 'from-purple-50 to-purple-100',
    emerald: 'from-emerald-50 to-emerald-100',
    red: 'from-red-50 to-red-100'
  };

  const textos = {
    gray: 'text-black',
    amber: 'text-black',
    blue: 'text-black',
    purple: 'text-black',
    emerald: 'text-black',
    red: 'text-black'
  };

  return (
    <div className={`bg-gradient-to-br ${cores[cor]} rounded-xl p-4 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold ${textos[cor]}`}>{value || 0}</p>
          <p className={`text-xs font-medium ${textos[cor]}`}>{label}</p>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}