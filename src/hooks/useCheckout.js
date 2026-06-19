import { useState, useCallback } from "react";
import { fetchProducts, fetchPromoProducts } from "@/services/productsServices";
import { uploadImage } from "@/services/productsEditService";
import { fetchRegisterOrder } from "@/services/checkoutServices";

export function useDelivery() {
 
    const loadDelivery = async (formData,cart,cartTotal) => {
/*   
formData
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    cep: "",
    pagamento: "credito",
    parcelas: "1",

cart


cartTotal
    
    
    */

    try {
      console.log("Dados cart", formData);
      fetchRegisterOrder( {
                      customer: formData,
                      items: cart,
                      total: cartTotal
    });
   
    } catch (error) {
      console.error("Erro ao carregar dados e finalizar a compra:", error);
    }
  };



        return{
  
        //Hooks exportados
        loadDelivery

    }
}


