const categorias = [
  "Hortifruti",
  "Açougue",
  "Bebidas",
  "Limpeza",
  "Padaria",
];
function CategoriaCard({ nome }) {
if (nome === "Hortifruti") {
  return (
    <div className=" rounded-xl p-4 text-center ">
      <div className="text-2xl mb-2">🥦</div>
      <p className="font-medium text-gray-700">{nome}</p>
    </div>
  );
}
if (nome === "Açougue") {
  return (
    <div className=" rounded-xl p-4 text-center ">
      <div className="text-2xl mb-2">🥩</div>
      <p className="font-medium text-gray-700">{nome}</p>
    </div>
  );
}
if (nome === "Bebidas") {
  return (
    <div className=" rounded-xl p-4 text-center ">
      <div className="text-2xl mb-2">🥤</div>
      <p className="font-medium text-gray-700">{nome}</p>
    </div>
  );
}
if (nome === "Limpeza") {
  return (
    <div className=" rounded-xl p-4 text-center ">
      <div className="text-2xl mb-2">🧼</div>
      <p className="font-medium text-gray-700">{nome}</p>
    </div>
  );
}
if (nome === "Padaria") {
  return (
    <div className="rounded-xl p-4 text-center ">
      <div className="text-2xl mb-2">🍞</div>
      <p className="font-medium text-gray-700">{nome}</p>
    </div>
  );
}
return (
  <div className=" rounded-xl p-4 text-center ">
    <div className="text-2xl mb-2">📦</div>
    <p className="font-medium text-gray-700">{nome}</p>
  </div>
);
}
export default function Categorias() {
  return (
    <section className="px-6 py-10 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Categorias
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categorias.map((cat) => (
          <div
            key={cat}
            className="
              bg-white 
              border border-gray-200
              rounded-xl 
              p-1 
              text-center 
              cursor-pointer
              transition
              hover:border-red-500
              hover:shadow-md
              hover:-translate-y-1
            "
          >
            <div className="text-2xl mb-1">{CategoriaCard({ nome: cat })}</div>

      
          </div>
        ))}
      </div>
    </section>
  );
}