// src/components/delivery/DeliveryOrderItems.jsx
import { DeliveryWeightInput } from './DeliveryWeightInput';

export function DeliveryOrderItems({ 
  itens, 
  pesosRetificados, 
  onPesoChange,
  onRemoverItem,
  onAvisarPesoProximo,
  disabled,
  itemRemovendo
}) {
  if (!itens || itens.length === 0) {
    return <p className="text-black text-center py-4">Nenhum item encontrado</p>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {itens.map((item, idx) => {
        const isSoldByWeight = item.sold_by_weight === true;
        //  Usa um identificador único (item.id ou fallback para idx)
        const itemKey = item.id || `item-${idx}`;
        const pesoRetificado = pesosRetificados[itemKey] ?? item.quantidade ?? 0;
        const temPesoReal = item.peso_real !== undefined && item.peso_real !== null && item.peso_real > 0;
        const estaRemovendo = itemRemovendo === itemKey;
        
        return (
          <div key={itemKey} className="flex flex-col py-2 border-b border-gray-200 last:border-0">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-black">{item.quantidade}x</span>
                <span className="ml-2 text-black">{item.nome}</span>
                {isSoldByWeight && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    ⚖️ Por peso
                  </span>
                )}
                {temPesoReal && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    ✏️ {item.peso_real.toFixed(2)}kg
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-black">
                  R$ {(item.preco * (item.peso_real || item.quantidade)).toFixed(2)}
                </span>
                {/* BOTÃO REMOVER */}
                <button
                  onClick={() => onRemoverItem(item)}
                  disabled={estaRemovendo || disabled}
                  className="text-red-500 hover:text-red-700 transition text-xs font-medium disabled:opacity-50"
                >
                  {estaRemovendo ? '⏳' : '✕'}
                </button>
              </div>
            </div>
            
            <DeliveryWeightInput 
              item={item}
              itemKey={itemKey}
              pesoRetificado={pesoRetificado}
              onPesoChange={onPesoChange}
              disabled={disabled || temPesoReal}
            />
            
            {/* AVISO DE PESO PROXIMO + BOTÃO */}
            {isSoldByWeight && temPesoReal && (
              <div className="mt-1 flex items-center gap-2 pl-4">
                <span className="text-xs text-gray-500">
                  ⚖️ Peso real: {item.peso_real.toFixed(2)}kg
                </span>
                <button
                  onClick={() => onAvisarPesoProximo(item)}
                  className="text-xs text-blue-500 hover:text-blue-700 transition font-medium"
                >
                  📱 Avisar variação
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}