"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
export default function Register() {
  const router = useRouter();
  const { registerUser } = useUser("");
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zip_code, setZip_code] = useState("");
    const [cpf, setCpf] = useState("");

     const handleRegister = () => {
    if (!user || !password || !confirmPassword || !name || !birthDate || !phone || !address || !city || !state || !zip_code || !cpf) {
      alert("Preencha todos os campos!");
      return;
    }
    registerUser(user, password, confirmPassword, name, birthDate, phone, address, city, state, zip_code, cpf);
  };
    
  return (
    <section className="bg-yellow-400 px-6 rounded  flex items-center justify-center gap-15">
      <div className="bg-yellow-400  text-black p-10px flex flex-col gap-10px">
        <div className="bg-yellow-400 text-black p-10px gap-10px">  
          <h1>Faça o registro </h1>
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setName(e.target.value)} value={name} type="text" name="name" id="name" placeholder="  Nome" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setPhone(e.target.value)} value={phone} type="text" name="phone" id="phone" placeholder="  (DDD) + Telefone" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setBirthDate(e.target.value)} value={birthDate} type="date" name="birthDate" id="birthDate" placeholder="  Data de Nascimento" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setUser(e.target.value)} value={user} type="text" name="user" id="user" placeholder="  Email" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setPassword(e.target.value)} value={password} type="password" name="password" id="password" placeholder="  Senha" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} type="password" name="confirmPassword" id="confirmPassword" placeholder="  Confirmar Senha" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setAddress(e.target.value)} value={address} type="text" name="address" id="address" placeholder="  Endereço" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setCity(e.target.value)} value={city} type="text" name="city" id="city" placeholder="  Cidade" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setState(e.target.value)} value={state} type="text" name="state" id="state" placeholder="  Estado" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setZip_code(e.target.value)} value={zip_code} type="text" name="zip_code" id="zip_code" placeholder="  CEP" />
          <input className=" bg-white text-black pb-3 m-1 rounded-lg border border-gray-300" onChange={(e) => setCpf(e.target.value)} value={cpf} type="text" name="cpf" id="cpf" placeholder="  CPF" />
        </div> 
      </div>
        <button onClick={() => {handleRegister();}} className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg">
            Registrar
        </button>

      <img
        src="/logoMercado.png"
        className="w-[300px] "
      />
    </section>
  );
}