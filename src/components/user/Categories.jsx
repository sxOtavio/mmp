"use client";
// 1. Alterado: Importação correta para o Next.js
import { useRouter } from "next/navigation"; 

const categories = [
  { label: "Todos", emoji: "🛒" },
  { label: "Higiene pessoal", emoji: "🧴" },
  { label: "FLV", emoji: "🥦" },
  { label: "Bazar", emoji: "📦" },
  { label: "Bebidas", emoji: "🥤" },
  { label: "Cereais", emoji: "🌾" },
  { label: "Açougue", emoji: "🥩" },
  { label: "Matinais", emoji: "🥐" },
  { label: "Conservas", emoji: "🥫" },
  { label: "Frente de caixa", emoji: "💳" },
  { label: "Limpeza", emoji: "🧼" },
  { label: "Saudaveis", emoji: "🥗" }
];

function CategoryCard({ label, emoji }) {
  return (
    <div className="rounded-xl p-4 text-center">
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="font-medium text-gray-700">{label}</p>
    </div>
  );
}

export default function Categorias({ selectedCategory = "Todos", onCategoryChange }) {
  // 2. Alterado: Ativação do roteador do Next.js
  const router = useRouter(); 

  function navigaToUserPage() {
    let pagLocation = window.location.pathname;
    
    if (pagLocation !== "/userPage") {
      // 3. Alterado: No Next.js usamos router.push()
      router.push("/userPage"); 
    }
  }

  return (
    <section className="px-6 py-10 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Categorias</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map(({ label, emoji }) => {
          const isSelected = selectedCategory === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => { 
                navigaToUserPage(); 
                onCategoryChange?.(label); 
              }}
              className={`text-left bg-white border rounded-xl p-1 transition shadow-sm ${
                isSelected
                  ? "border-red-500 bg-red-50 shadow-md"
                  : "border-gray-200 hover:border-red-500 hover:shadow-md"
              }`}
            >
              <CategoryCard label={label} emoji={emoji} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
