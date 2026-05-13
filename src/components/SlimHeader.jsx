"use client";
import { useRouter } from "next/navigation";



export default function Header() {
    const router = useRouter();
  return (
    <header className="bg-white shadow-md px-3 rounded flex items-center justify-between">
      <img onClick={() => {router.push('/');}} src="/logoMercado.png" alt="Logo do Mercado" className="w-37 h-24 relative" />
      
      <button onClick={() => {router.push('/loginPage');}} className="bg-red-600 text-white px-4 py-2 rounded-lg">
        Login
      </button>
    </header>
  );
}