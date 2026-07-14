// src/components/delivery/DeliveryOrderCard.jsx
export function DeliveryOrderCard({ 
  pedido, 
  statusConfig, 
  tempoPedido, 
  hasWeightProducts,
  hasPesoReal,
  onClick,
  onUpdateStatus 
}) {
  return (
    <div
      className={`group rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer bg-white ${statusConfig.border} border`}
      onClick={onClick}
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
          <div className="flex flex-col items-end gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} text-black border ${statusConfig.border}`}>
              {statusConfig.label}
            </span>
            {hasWeightProducts && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">⚖️ Com peso</span>
            )}
            {hasPesoReal && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">✏️ Retificado</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="font-semibold text-black">{pedido.cliente_nome || 'Cliente não informado'}</p>
            <p className="text-sm text-black opacity-75">{pedido.cliente_telefone || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-black opacity-60">{tempoPedido}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <p className="text-sm text-black flex-1">
            {pedido.cliente_cidade || ''} 
            {pedido.cliente_bairro ? `, ${pedido.cliente_bairro}` : ''} 
            {pedido.cliente_endereco ? `, ${pedido.cliente_endereco}` : ''} 
            {pedido.cliente_numero ? `, ${pedido.cliente_numero}` : ''}
          </p>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="space-y-1">
              {pedido.itens && pedido.itens.length > 0 ? (
                <>
                  {pedido.itens.slice(0, 3).map((item, i) => (
                    <p key={i} className="text-sm text-black flex items-center gap-1">
                      {item.quantidade}x {item.nome}
                      {item.sold_by_weight && (
                        <span className="text-xs text-green-600">⚖️</span>
                      )}
                      {item.peso_real && (
                        <span className="text-xs text-purple-600">✏️</span>
                      )}
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

        {/* TOTAL COM FRETE */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-sm text-black opacity-75">Total com frete</span>
          <span className="text-xl font-bold text-emerald-600">
            R$ {(pedido.total || 0).toFixed(2)}
          </span>
        </div>

        {pedido.shipping_frete > 0 && (
          <div className="flex justify-end items-center text-xs text-black opacity-60">
            <span>Frete: R$ {pedido.shipping_frete.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/*  BOTÃO DE AÇÃo */}
      {statusConfig.acao && onUpdateStatus && (
        <div className="p-4 pt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(pedido.id, statusConfig.proxStatus);
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
}