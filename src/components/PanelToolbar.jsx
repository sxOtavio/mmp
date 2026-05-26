"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompilerXlsx } from "@/hooks/useCompilerXlsx";

export default function PanelToolbar() {
  const { handleFileChange } = useCompilerXlsx(); 
  const [file, setFile] = useState(null);

  const onInputChange = (event) => {
    console.log("Evento de mudança de arquivo acionado");
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]); 
    }
  };

  const handleImport = () => {
    if (!file) {
      alert("Selecione um arquivo!");
      return;
    }
    console.log("Arquivo pronto enviado para o hook:", file);
    
    // CORREÇÃO: Enviamos o arquivo diretamente para o hook processar.
    // Para que isso funcione sem erros, precisamos ajustar a função dentro do hook.
    handleFileChange(file); 
  };

  return (
    <section className="bg-yellow-500 w-full rounded-lg px-4 py-1 m-1 flex justify-left gap-15">
      <div>
        <section className="flex items-center gap-2">
          {/* INPUT REAL (ESCONDIDO) */}
          <input 
            type="file" 
            name="file" 
            onChange={onInputChange} 
            id="inputProductsData" 
            className="hidden" 
          />
          
          {/* BOTÃO VISUAL DE SELEÇÃO */}
          <label 
            htmlFor="inputProductsData"
            className="bg-yellow-400 m-1 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded cursor-pointer inline-block"
          >
            {file ? `Selecionado: ${file.name}` : "Selecionar arquivo XLSX"}
          </label>

          {/* BOTÃO QUE REALMENTE EXECUTA A IMPORTAÇÃO */}
          <button 
            onClick={handleImport}  
            className="bg-green-500 m-1 hover:bg-green-600 hover:scale-105 transition-transform text-white font-bold py-1 px-4 rounded"
          >
            Importar produtos
          </button>
        </section>
        
        <button className="bg-yellow-400 m-1 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Gerenciar backups
        </button>
        <button className="bg-yellow-400 m-1 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Editar arquivos
        </button>
        <button className="bg-yellow-400 m-1 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Excluir produto
        </button>
        <button className="bg-yellow-400 m-1 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Adicionar foto
        </button>
        <button className="bg-yellow-400 m-1 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Gerar panfleto
        </button>
      </div>
    </section>
  );
}