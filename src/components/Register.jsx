"use client";
import { useRouter } from "next/navigation";
export default function Register() {
  const router = useRouter();
  
  return (
    <section className="bg-yellow-400 px-6 rounded  flex items-center justify-center gap-15">
      <div className="bg-yellow-400 text-black p-10px flex flex-col gap-10px">
        <h1>Faça o registro </h1>
        <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300"  type="text" name="name" id="name" placeholder="  Nome" />
        <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300"  type="date" name="birthDate" id="birthDate" placeholder="  Data de Nascimento" />
        <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300"  type="email" name="email" id="email" placeholder="  E-mail" />
        <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300"   type="password" name="password" id="password" placeholder="  Senha" />
        <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300"   type="password" name="confirmPassword" id="confirmPassword" placeholder="  Confirmar Senha" />

      </div>
        <button onClick={() => {router.push('/loginPage');}} className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg">
            Registrar
        </button>

      <img
        src="/logoMercado.png"
        className="w-[300px] "
      />
    </section>
  );
}