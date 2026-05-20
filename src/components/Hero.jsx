
export default function Hero() {
  return (
    <section className="bg-yellow-400 px-6 py-12 flex items-center justify-center gap-15">
      <div>
        <h2 className="text-4xl font-bold text-black">
          Aqui o seu dinheiro <br />
          <span className="text-red-600">vale mais!</span>
        </h2>

        <p className="mt-2 text-gray-800">
          Ofertas incríveis todos os dias
        </p>

        <button className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg">
          Aproveitar ofertas
        </button>
      </div>

      <img
        src="/cesto.png"
        className="w-[300px] "
      />
    </section>
  );
}