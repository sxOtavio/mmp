import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

export function useCompilerXlsx() {
  const router = useRouter(); // ✨ No Next.js usamos router em vez de navigate
  const [auth, setAuth] = useState({
    loginData: null,   
    token: null,       
    loading: false,    
  });
//------------------------------- importação do arquivo xlsx --------------------------------------------------------------------------
    
const [file, setFile] = useState(null);

      const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    console.log("Arquivo selecionado:", file);
    }
    };
//------------------------------- tratamento do arquivo xlsx --------------------------------------------------------------------------

//------------------------------- importação do arquivo xlsx para o banco de dados ----------------------------------------------------

    const importProductsData = useCallback(async () => {
      console.log("importando dados dos produtos...");
    try {
       setLoading(true);
    

    } catch (error) {
      console.error("Erro ao importar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, []);
 
  

  return {
    
    //Variaves exportadas

    //Hooks exportados
    importProductsData,
    handleFileChange,
};
}