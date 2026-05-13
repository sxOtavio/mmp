import PanelToolbar from "./PanelToolbar";
export default function Panel() {
  return (
    <div className="bg-yellow-400 rounded-lg w-full px-6 py-3 column items-center justify-center ">
      <h3 className="text-1xl pl-5 font-bold text-black">Painel de Controle</h3>

      <PanelToolbar />
      <div className="bg-white p-3 m-3 rounded-lg shadow-md">
        <p className="firstUse text-gray-500">
          Aqui você pode gerenciar os produtos, editar arquivos, adicionar fotos
          e gerar panfletos para suas ofertas. Use as opções acima para começar!
        </p>
      </div>
    </div>
  );
}
