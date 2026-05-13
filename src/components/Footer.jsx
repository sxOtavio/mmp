export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10">
      <div className="px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <h2 className="text-red-500 font-bold">
            Mercado Preferido
          </h2>
          <p className="text-sm mt-2">
            Qualidade e economia todos os dias
          </p>
        </div>

        <div>
          <h3 className="text-white">Institucional</h3>
          <p className="text-sm mt-2">Sobre</p>
          <p className="text-sm">Contato</p>
        </div>

        <div>
          <h3 className="text-white">Ajuda</h3>
          <p className="text-sm mt-2">Como comprar</p>
        </div>

        <div>
          <h3 className="text-white">Contato</h3>
          <p className="text-sm mt-2">(61) 99999-9999</p>
        </div>
      </div>

      <div className="text-center py-4 border-t border-gray-700 text-sm">
        © 2026 Mercado Preferido
      </div>
    </footer>
  );
}