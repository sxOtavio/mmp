'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { pedidosSimulados, filtrarPedidos, contarPedidosPorStatus } from './pedidosSimulados';
import { useOrders } from '@/hooks/useDelivery';

export default function deliveryPage() {
  const { auth } = useUser();

  const {
  orders: pedidos,
  loading,
} = useOrders();

  const [filtro, setFiltro] = useState('todos');
  const [mostrarNotificacao, setMostrarNotificacao] = useState(false);
  const [mensagemNotificacao, setMensagemNotificacao] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [modoEscuro, setModoEscuro] = useState(false);
  const [ordem, setOrdem] = useState('recente'); // recente, antigo, maior, menor


  const getStatusConfig = (status) => {
    const configs = {
      pago: { 
        label: 'Aguardando', 
        icon: '⏰',
        cor: 'amber', 
        bg: 'bg-amber-50', 
        text: 'text-amber-700',
        border: 'border-amber-200',
        acao: 'Iniciar Separação',
        proxStatus: 'preparando',
        descricao: 'Pedido aguardando separação'
      },
      preparando: { 
        label: 'Separando', 
        icon: '📦',
        cor: 'blue', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        acao: 'Sair para Entrega',
        proxStatus: 'saiu_para_entrega',
        descricao: 'Produtos sendo separados'
      },
      saiu_para_entrega: { 
        label: 'Em Rota', 
        icon: '🛵',
        cor: 'purple', 
        bg: 'bg-purple-50', 
        text: 'text-purple-700',
        border: 'border-purple-200',
        acao: 'Finalizar Entrega',
        proxStatus: 'entregue',
        descricao: 'Entregador a caminho'
      },
      entregue: { 
        label: 'Entregue', 
        icon: '✅',
        cor: 'emerald', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        acao: null,
        proxStatus: null,
        descricao: 'Pedido finalizado'
      }
    };
    return configs[status] || configs.pago;
  };

  const atualizarStatus = (pedidoId, novoStatus) => {
    setPedidos(prevPedidos => 
      prevPedidos.map(pedido => 
        pedido.id === pedidoId 
          ? { ...pedido, status_pedido: novoStatus }
          : pedido
      )
    );
    
    const mensagens = {
      preparando: '📦 Pedido encaminhado para separação',
      saiu_para_entrega: '🛵 Pedido saiu para entrega',
      entregue: '✅ Pedido entregue com sucesso!'
    };
    
    setMensagemNotificacao(mensagens[novoStatus]);
    setMostrarNotificacao(true);
    setTimeout(() => setMostrarNotificacao(false), 3000);
    setPedidoSelecionado(null);
  };

  // Ordenar pedidos
  const ordenarPedidos = (pedidosList) => {
    const sorted = [...pedidosList];
    switch(ordem) {
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
  const contagens = contarPedidosPorStatus(pedidos);

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    const agora = new Date();
   const diffMinutos = Math.abs(Math.floor((agora - data) / 60000));
    
    if (diffMinutos < 1) return 'Agora mesmo';
    if (diffMinutos < 60) return `${diffMinutos} min atrás`;
    if (diffMinutos < 120) return '1 hora atrás';
    if (diffMinutos < 1440) return `${Math.floor(diffMinutos / 60)} horas atrás`;
    return data.toLocaleDateString();

  };
  

  return (
    <div className={`min-h-screen transition-colors ${modoEscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Notificação Toast */}
      {mostrarNotificacao && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <span>{mensagemNotificacao}</span>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full ${modoEscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${modoEscuro ? 'bg-gray-800' : 'bg-white'} border-b ${modoEscuro ? 'border-gray-700' : 'border-gray-200'} p-4 flex justify-between items-center`}>
              <h2 className="text-2xl font-bold">Pedido #{pedidoSelecionado.id}</h2>
              <button onClick={() => setPedidoSelecionado(null)} className="text-2xl hover:text-gray-500">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Cliente */}
              <div className={`p-4 rounded-lg ${modoEscuro ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2 text-lg">👤 Cliente</h3>
                <p><strong>Nome:</strong> {pedidoSelecionado.cliente_nome}</p>
                <p><strong>Telefone:</strong> {pedidoSelecionado.cliente_telefone}</p>
                <p><strong>Endereço:</strong> {pedidoSelecionado.cliente_endereco}</p>
                <p><strong>Cidade:</strong> {pedidoSelecionado.cliente_cidade}</p>
              </div>

              {/* Itens */}
              <div className={`p-4 rounded-lg ${modoEscuro ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-3 text-lg">🛒 Itens do Pedido</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pedidoSelecionado.itens.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium">{item.quantidade}x</span>
                        <span className="ml-2">{item.nome}</span>
                      </div>
                      <span className="font-semibold">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold text-emerald-600">R$ {pedidoSelecionado.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Informações adicionais */}
              <div className={`p-4 rounded-lg ${modoEscuro ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">📋 Informações</h3>
                <p><strong>Data do pedido:</strong> {new Date(pedidoSelecionado.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> {getStatusConfig(pedidoSelecionado.status_pedido).label}</p>
                <p><strong>Qtd. itens:</strong> {pedidoSelecionado.itens.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header com tema */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${modoEscuro ? 'text-white' : 'text-gray-800'}`}>
            Painel do Entregador
            </h1>
            <p className={`mt-1 ${modoEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
              Gerencie as entregas do supermercado
            </p>
          </div>
          
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <MetricCard 
            icon="📊" 
            label="Total" 
            value={pedidos.length} 
            cor="gray" 
            modoEscuro={modoEscuro} 
          />
          <MetricCard 
            icon="⏰" 
            label="Aguardando" 
            value={contagens.pago} 
            cor="amber" 
            modoEscuro={modoEscuro} 
          />
          <MetricCard 
            icon="📦" 
            label="Separando" 
            value={contagens.preparando} 
            cor="blue" 
            modoEscuro={modoEscuro} 
          />
          <MetricCard 
            icon="🛵" 
            label="Em Rota" 
            value={contagens.saiu_para_entrega} 
            cor="purple" 
            modoEscuro={modoEscuro} 
          />
          <MetricCard 
            icon="✅" 
            label="Entregues" 
            value={contagens.entregue} 
            cor="emerald" 
            modoEscuro={modoEscuro} 
          />
        </div>

        {/* Barra de filtros e ordenação */}
        <div className={`rounded-xl shadow-sm p-4 mb-6 ${modoEscuro ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'todos', label: 'Todos', icon: '📋' },
                { id: 'pago', label: 'Aguardando', icon: '⏰' },
                { id: 'preparando', label: 'Separando', icon: '📦' },
                { id: 'saiu_para_entrega', label: 'Em Rota', icon: '🛵' },
                { id: 'entregue', label: 'Entregues', icon: '✅' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    filtro === f.id 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : `${modoEscuro ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    filtro === f.id ? 'bg-white text-blue-500' : modoEscuro ? 'bg-gray-600' : 'bg-gray-300'
                  }`}>
                    {f.id === 'todos' ? pedidos.length : contagens[f.id]}
                  </span>
                </button>
              ))}
            </div>

            {/* Ordenação */}
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${modoEscuro ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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
          <div className={`text-center py-20 rounded-xl ${modoEscuro ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-7xl mb-4">📭</div>
            <p className={`text-xl ${modoEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum pedido encontrado</p>
            <p className={`text-sm mt-2 ${modoEscuro ? 'text-gray-500' : 'text-gray-400'}`}>Tente outro filtro</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pedidosFiltrados.map((pedido) => {
              const statusConfig = getStatusConfig(pedido.status);
              const tempoPedido = formatarData(pedido.createdAt);
              
              return (
                <div
                  key={pedido.id}
                  className={`group rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer ${modoEscuro ? 'bg-gray-800' : 'bg-white'} ${statusConfig.border} border`}
                  onClick={() => setPedidoSelecionado(pedido)}
                >
                  {/* Header */}
                  <div className={`${statusConfig.bg} px-4 py-3 border-b ${statusConfig.border}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{statusConfig.icon}</span>
                          <div>
                            <p className="text-xs opacity-75">Pedido</p>
                            <h3 className="font-bold text-lg">#{pedido.id}</h3>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">👤</span>
                      <div className="flex-1">
                        <p className="font-semibold">{pedido.cliente.nome}</p>
                        <p className="text-sm opacity-75">{pedido.cliente.telefone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-60">{tempoPedido}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-xl">📍</span>
                      <p className="text-sm flex-1">{` ${pedido.cliente.cidade}, ${pedido.cliente.bairro}, ${pedido.cliente.endereco}, ${pedido.cliente.numero}`}</p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-xl">🛒</span>
                      <div className="flex-1">
                        <div className="space-y-1">
                          {pedido.itens.slice(0, 3).map((item, i) => (
                            <p key={i} className="text-sm">
                              {item.quantidade}x {item.nome}
                            </p>
                          ))}
                          {pedido.itens.length > 3 && (
                            <p className="text-xs opacity-60">+{pedido.itens.length - 3} itens</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm opacity-75">Total</span>
                      <span className="text-xl font-bold text-emerald-600">
                        R$ {pedido.total.toFixed(2)}
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
                        className={`w-full py-2.5 rounded-lg text-white font-medium transition-all transform hover:scale-105 bg-${statusConfig.cor}-500 hover:bg-${statusConfig.cor}-600 shadow-md`}
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

      <style jsx>{`
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
function MetricCard({ icon, label, value, cor, modoEscuro }) {
  const cores = {
    gray: modoEscuro ? 'from-gray-700 to-gray-800' : 'from-gray-50 to-gray-100',
    amber: modoEscuro ? 'from-amber-900 to-amber-800' : 'from-amber-50 to-amber-100',
    blue: modoEscuro ? 'from-blue-900 to-blue-800' : 'from-blue-50 to-blue-100',
    purple: modoEscuro ? 'from-purple-900 to-purple-800' : 'from-purple-50 to-purple-100',
    emerald: modoEscuro ? 'from-emerald-900 to-emerald-800' : 'from-emerald-50 to-emerald-100'
  };

  const textos = {
    gray: modoEscuro ? 'text-gray-300' : 'text-gray-700',
    amber: modoEscuro ? 'text-amber-300' : 'text-amber-700',
    blue: modoEscuro ? 'text-blue-300' : 'text-blue-700',
    purple: modoEscuro ? 'text-purple-300' : 'text-purple-700',
    emerald: modoEscuro ? 'text-emerald-300' : 'text-emerald-700'
  };

  return (
    <div className={`bg-gradient-to-br ${cores[cor]} rounded-xl p-4 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold ${textos[cor]}`}>{value}</p>
          <p className={`text-xs opacity-70 ${textos[cor]}`}>{label}</p>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}