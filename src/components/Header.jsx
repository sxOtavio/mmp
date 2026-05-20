"use client";
import { useRouter } from "next/navigation";



export default function Header() {
    const router = useRouter();
  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <img onClick={() => {router.push('/');}} src="/logoMercado.png" alt="Logo do Mercado" className="w-37 h-24 relative" />
      

      <input
        type="text"
        placeholder="Buscar produtos..."
        className="border rounded-lg px-4 py-2 w-1/2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      <button className="bg-red-600 text-white px-4 py-2 rounded-lg">
        Carrinho
      </button>
      <button onClick={() => {router.push('/loginPage');}} className="bg-red-600 text-white px-4 py-2 rounded-lg">
        Login
      </button>
    </header>
  );
}