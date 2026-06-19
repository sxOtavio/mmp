import { useState, useEffect, useCallback } from "react";
import { fetchOrders } from "@/services/deliveryServices";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchOrders();
console.log("arquivos recebidos no hook",data)
      setOrders(data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 15000);

    return () => clearInterval(interval);

  }, [loadOrders]);

  return {
    orders,
    loading,
    loadOrders,
  };
}