"use client";
import PanelToolbar from "./PanelToolbar";
import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";


export default function Panel() {
      const { products, loading, loadProductsData } = useProducts();
  useEffect(() => {
    loadProductsData();
  }, [loadProductsData]);

  return (
    <div className="bg-yellow-400 rounded-lg w-full px-6 py-3 column items-center justify-center ">
      <h3 className="text-1xl pl-5 font-bold text-black">Painel de Controle</h3>

      <PanelToolbar />
      <div className="bg-white gap-4 p-1 m-3 rounded-lg shadow-md">
        <div className="bg-white flex gap-12 p-1 m-3 rounded-lg shadow-md">
          <h6>Código gtin</h6>
          <h6>Nome</h6>
          <h6>Marca</h6>
          <h6>Preço</h6>
          <h6>Preço Promocional</h6>
          <h6>Ativo</h6>
          <h6>Foto</h6>
          <h6>Data de Criação</h6>
          <h6>Data de Atualização</h6>
        </div>
    <div className="flex flex-col">
        {products.map((p, id) => (
          <div key={id} className="bg-white m-1 hover:bg-gray-100 p-4 flex rounded-xl shadow-sm">
            
            <input type="checkbox" name="selected" id="string" />

            <p className="text-md text-gray-800 p-6">{p.gtin_code}</p>
            
            <p className="text-sm text-gray-800 p-4">{p.name}</p>

            <p className="text-sm text-gray-800 p-4">{p.brand}</p>

            <p className=" p-4 font-bold text-sm">
              R$ {p.price}
            </p>

            <p className="text-red-600  p-4 font-bold">
              R$ {p.promotion_price}
            </p>

            <p className="text-red-600  p-4 font-bold">
              Promoção : {p.active? "Sim" : "Não"}
            </p>
            
            <p className=" p-4 ">
              Possui foto : {p.image_url? "Sim" : "Não"}
            </p>
  
            <p className="p-4 font-bold">
              Criado em : {p.created_at}
            </p>
          
           <p className="p-4 font-bold">
              Atualizado em : {p.updated_at}
            </p>

          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
