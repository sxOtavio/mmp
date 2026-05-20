import { useState } from "react";
import { fetchProducts } from "@/services/productsServices";
export function useProducts() {
  const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState([]);
    const loadProductsData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksData, columnsData] = await Promise.all([
        fetchProducts(),
      ]);
      setProducts(products);

    } catch (error) {
      console.error("Erro ao carregar dados do board:", error);
    } finally {
      setLoading(false);
    }
  }, []);

    return{
        
    }
}