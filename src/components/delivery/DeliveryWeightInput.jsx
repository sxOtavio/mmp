// src/components/delivery/DeliveryWeightInput.jsx
export function DeliveryWeightInput({ 
  item, 
  itemKey,
  pesoRetificado, 
  onPesoChange,
  disabled 
}) {
  const isSoldByWeight = item.sold_by_weight === true;
  const temPesoReal = item.peso_real !== undefined && item.peso_real !== null && item.peso_real > 0;

  if (!isSoldByWeight) return null;

  //  Usa o valor atualizado
  const valorAtual = pesoRetificado ?? item.quantidade ?? 0;

  return (
    <div className="mt-2 flex items-center gap-3 pl-4">
      <input 
        type="number" 
        step="0.01"
        min="0.01"
        value={valorAtual}
        onChange={(e) => {
          const novoValor = parseFloat(e.target.value) || 0;
            console.log(`🔄 Alterando peso do item ${item.nome}: ${novoValor}`);
          onPesoChange(itemKey, novoValor);
        }}
        placeholder="Peso real (kg)"
        className="w-28 px-2 py-1 border border-gray-300 rounded text-sm text-black focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        disabled={disabled || temPesoReal}
      />
      <span className="text-xs text-black">kg</span>
      <span className="text-xs text-black opacity-60">
        (original: {item.quantidade.toFixed(2)}kg)
      </span>
      {!temPesoReal && valorAtual !== item.quantidade && (
        <span className="text-xs text-blue-600 font-medium ml-auto">
          ⚡ {((valorAtual - item.quantidade) * item.preco).toFixed(2)}
        </span>
      )}
      {temPesoReal && (
        <span className="text-xs text-green-600 font-medium ml-auto">
          ✅ Retificado: {item.peso_real.toFixed(2)}kg
        </span>
      )}
    </div>
  );
}