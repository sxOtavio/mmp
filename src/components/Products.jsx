const produtos = [
  {
    nome: "Arroz 5kg",
    preco: 25.9,
    promo: 21.5,
  },
  {
    nome: "Feijão",
    preco: 8.5,
    promo: 7.19,
  },
];

export default function Produtos() {
  return (
    <section className="px-6 py-8 bg-gray-50 rounded">
      <h2 className="font-bold mb-6 text-gray-800">
        OFERTAS EM DESTAQUE
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {produtos.map((p, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="bg-gray-100 h-24 rounded mb-3"></div>

            <h3 className="text-sm text-gray-800">{p.nome}</h3>

            <p className="line-through text-gray-400 text-sm">
              R$ {p.preco}
            </p>

            <p className="text-red-600 font-bold">
              R$ {p.promo}
            </p>

            <button className="mt-2 bg-yellow-400 w-full py-2 rounded-lg">
              +
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}