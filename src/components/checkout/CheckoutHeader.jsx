"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";


export default function Header() {
    const router = useRouter();
      const { cart, cartTotal, clearCart, user } = useUser();
  return (
    <header className="bg-white shadow-md px-3 rounded flex items-center justify-between">
      <img onClick={() => {router.push('/');}} src="/logoMercado.png" alt="Logo do Mercado" className="w-37 h-24 relative" />
           
    
  
          <div className="flex justify-between items-center">
            <div className="flex items-cente gap-4">
              <div className="bg-yellow-100 px-4 py-2 rounded-full">
                <span className="text-sm text-black">Itens: </span>
                <span className="font-semibold text-red-600">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <div className="bg-green-100 px-4 py-2 rounded-full">
                <span className="text-sm text-black">Total: </span>
                <span className="font-semibold text-green-600">
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        
      


      <button onClick={() => {router.push('/loginPage');}} className="bg-red-600 text-white px-4 py-2 rounded-lg">
        Login
      </button>
    </header>
  );
}