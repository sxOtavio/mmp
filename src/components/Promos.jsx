const produtos = [
  {
    nome: "Arroz 5kg",
    preco: 25.9,
    promo: 19.9,
  },
  {
    nome: "Feijão",
    preco: 8.5,
    promo: 6.9,
  },
];

export default function Promocoes() {
  return (
    <section className="px-6 py-8 bg-gray-50">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        🔥 Ofertas da Semana
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {produtos.map((p, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow-md"
          >
            <h3 className="font-bold">{p.nome}</h3>

            <p className="line-through text-gray-400">
              R$ {p.preco}
            </p>

            <p className="text-red-600 font-bold text-lg">
              R$ {p.promo}
            </p>

            <button className="mt-2 w-full bg-yellow-400 py-2 rounded-lg">
              Comprar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}