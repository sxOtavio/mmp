import { useState, useCallback } from "react";
import { fetchProducts, fetchPromoProducts } from "@/services/productsServices";

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [promoProducts, setPromoProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadProductsData = useCallback(async () => {
      console.log("Carregando dados dos produtos...");
      try {
        setLoading(true);
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Erro ao carregar dados dos produtos:", error);
      } finally {
        setLoading(false);
      }
    }, []);

    const loadPromoProductsData = useCallback(async () => {
      console.log("Carregando dados dos produtos em promoção...");
      try {
        setLoading(true);
        const promoProductsData = await fetchPromoProducts();
        setPromoProducts(promoProductsData);
      } catch (error) {
        console.error("Erro ao carregar dados dos produtos em promoção:", error);
      } finally {
        setLoading(false);
      }
    }, []);

    return{
        products,
        promoProducts,
        loading,

        //Hooks exportados
        
        loadProductsData,
        loadPromoProductsData
    }
}