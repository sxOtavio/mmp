export default function PanelToolbar() {
  return (
    <section className="bg-yellow-500 w-full rounded-lg px-4 py-1 m-1 flex justify-left gap-15">
      <div>
        <input type="file" name="file" id="inputProductsData" className="bg-yellow-400 m-1 hover:bg-yellow-600  hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded" />

        <button className="bg-yellow-400 m-1 hover:bg-yellow-600  hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Gerenciar backups
        </button>
        <button className="bg-yellow-400 m-1 hover:bg-yellow-600 hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Editar arquivos
        </button>
                <button className="bg-yellow-400 m-1 hover:bg-yellow-600  hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Excluir produto
        </button>
                <button className="bg-yellow-400 m-1 hover:bg-yellow-600  hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Adicionar foto
        </button>
                <button className="bg-yellow-400 m-1 hover:bg-yellow-600  hover:scale-105 transition-transform text-black font-bold py-1 px-4 rounded">
          Gerar panfleto
        </button>
      </div>

     
    </section>
  );
}