"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const slides = [
    {
      title: "Aqui o seu dinheiro",
      highlight: "vale mais!",
      highlightColor: "text-red-500",
      description: "Ofertas incríveis todos os dias",
      descriptionColor: "text-black",
      image: "/cesto.png",
      // Se for cor, passamos a classe normal do Tailwind
      isImage: true,
      backgound: "/bgYellow.png",
      isHiden: "hidden",
    },
    {
      title: "Promoção",
      highlight: "Terça e quarta verde!",
      highlightColor: "text-white",
      description: "Descontos novos toda semana",
      descriptionColor: "text-white",
      // Se for foto, avisamos o componente e passamos o caminho do arquivo
      isImage: true,
      backgound: "/bgQuartaVerde.png", // Nome da sua foto na pasta public
    
    },
    {
      title: "Promoção ",
      highlight: "Quinta da Carne!",
      highlightColor: "text-white",
      description: "Economize nas compras de carnes",
      descriptionColor: "text-white",
      image: "/cesto.png",
      isImage: true,
      backgound: "/bgQuintaDaCarne.png",

    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Identifica se o slide atual usa foto ou cor de fundo
  const slideAtual = slides[current];

  return (
    <section 
      className={`px-6 py-12 flex items-center justify-center relative overflow-hidden transition-all duration-500 min-h-[400px] ${
        slideAtual.isImage ? "bg-cover bg-center" : slideAtual.backgound
      }`}
      // Se for imagem, injeta pelo atributo style nativo. O Next.js não vai quebrar!
      style={slideAtual.isImage ? { backgroundImage: `url(${slideAtual.backgound})` } : {}}
    >
      
      <div className='flex items-center justify-between w-full max-w-6xl z-10'>
        <div className = {` backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl p-8 shadow-lg ${slideAtual.isHiden}`}>
          <h2 className={`text-4xl font-bold ${slideAtual.highlightColor}`}>
            {slideAtual.title}
            <br />
            <span className={`font-bold ${slideAtual.highlightColor}`}>
              {slideAtual.highlight}
            </span>
          </h2>

          <p className={`mt-2 ${slideAtual.descriptionColor}`}>
            {slideAtual.description}
          </p>

          <button className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition">
            Aproveitar ofertas
          </button>
        </div>

      </div>

      {/* Navegação */}
      <div className="absolute bottom-4 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              current === index ? "bg-red-600" : "bg-white/80 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}