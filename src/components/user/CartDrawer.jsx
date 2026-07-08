'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart, setCart } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localVersion, setLocalVersion] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkLocalStorage = () => {
      const savedCart = localStorage.getItem('@cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (JSON.stringify(parsedCart) !== JSON.stringify(cart)) {
          console.log('🔄 Sincronizando carrinho do localStorage');
          setCart?.(parsedCart);
          setLocalVersion(prev => prev + 1);
        }
      }
    };

    setMounted(true);
    checkLocalStorage();
    
    const interval = setInterval(checkLocalStorage, 500);
    return () => clearInterval(interval);
  }, [cart, setCart]);

  useEffect(() => {
    if (mounted) {
      console.log('🔄 Carrinho atualizado! Itens:', cart.length);
    }
  }, [cart, mounted]);

  
  const totalItens = cart.reduce((sum, item) => {
    if (item.sold_by_weight) {
      // Para produtos por peso, conta como 1 item (não o peso)
      return sum + 1;
    }
    return sum + item.quantity;
  }, 0);

  
  const pesoTotal = cart.reduce((total, item) => {
    if (item.sold_by_weight) {
      return total + (item.peso_especifico || item.quantity || 0.5);
    }
    const pesoUnitario = item.weight_per_unit || 0.5;
    return total + (pesoUnitario * item.quantity);
  }, 0);

  if (!mounted) return null;

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 hover:scale-105 transition-all z-[9999] flex items-center justify-center"
      >
        <span className="text-2xl">🛒</span>
        {totalItens > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
            {totalItens}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 w-full max-w-md h-screen bg-white z-[9999] shadow-lg transition-transform duration-300 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl text-black font-bold">Meu Carrinho ({totalItens})</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-2xl text-black hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">🛒</span>
              <p className="text-gray-500 mb-5">Seu carrinho está vazio</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item, idx) => {
                  const preco = item.precoPromocional || item.precoNormal;
                  const subtotal = Number(preco) * item.quantity;
                  const isSoldByWeight = item.sold_by_weight === true;
                  const peso = isSoldByWeight ? (item.peso_especifico || item.quantity || 0.5) : null;
                  
                  return (
                    <div key={item.gtin || idx} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-black">{item.nome}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isSoldByWeight 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isSoldByWeight ? ' Peso' : ' Unidade'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-black mb-2">
                        {isSoldByWeight ? (
                          
                          <>R$ {Number(preco).toFixed(2)}/kg × {peso.toFixed(2)}kg</>
                        ) : (
                          <>R$ {Number(preco).toFixed(2)} × {item.quantity}</>
                        )}
                      </div>
                      
                      {isSoldByWeight && peso && (
                        <div className="text-xs text-gray-500 mb-2">
                           {peso.toFixed(2)}kg selecionado
                        </div>
                      )}
                      
                      <div className="font-bold text-gray-800 mb-2">
                        Subtotal: R$ {subtotal.toFixed(2)}
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateQuantity(item.gtin, item.quantity - 1)}
                          className="px-3 py-1 text-black bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => updateQuantity(item.gtin, item.quantity + 1)}
                          className="px-3 py-1 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.gtin)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition ml-auto"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t">
               
                {cart.some(item => item.sold_by_weight) && (
                  <div className="text-sm text-gray-600 mb-2 flex justify-between">
                    <span> Peso total do pedido:</span>
                    <span className="font-medium">{pesoTotal.toFixed(2)} kg</span>
                  </div>
                )}
                
                <div className="flex justify-between text-black items-center text-lg font-bold mb-4">
                  <span>Total:</span>
                  <span className="text-red-600">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={clearCart}
                    className="flex-1 bg-gray-300 py-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    Limpar
                  </button>
                  <button onClick={()=> {router.push("/checkoutPage")}} className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition">
                    Finalizar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}