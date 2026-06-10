import { useState, useCallback } from "react";
import { fetchProducts, fetchPromoProducts } from "@/services/productsServices";
import { uploadImage } from "@/services/productsEditService";

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
        console.log("Produtos carregados:", productsData);
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

//onde as fotos vao ser mandadas pro back e atualizar o banco de fotos
    
  const setProductsPhotos = useCallback((selectedFiles, gtin) => {
   /*
    console.log("HOOK !! Atualizando fotos do produto com GTIN:", gtin);
    console.log("HOOK !!Atualizando fotos do produto com nome:", selectedFiles.name);
  //aqui ele vai chamar o back e o back vai mandar a foto pro GTIN TO PICTURES
  */
   if (!selectedFiles || selectedFiles.length === 0) {
    alert("Selecione uma imagem primeiro");
    return;
  }

    uploadImage(selectedFiles, gtin)

  });

    return{
        products,
        promoProducts,
        loading,

        //Hooks exportados
        
        loadProductsData,
        loadPromoProductsData,
        setProductsPhotos
    }
}