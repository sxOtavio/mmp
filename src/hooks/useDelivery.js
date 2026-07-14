// src/hooks/useDelivery.js
import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchOrders,
  fetchOrdersByStatus,
  updateOrderStatus as updateOrderStatusService,
  fetchOrderDetails,
  assignDeliveryPerson as assignDeliveryPersonService,
  fetchAvailableDeliveryPersons,
  updateDeliveryLocation,
  cancelDelivery as cancelDeliveryService,
  fetchDeliveryStats,
  fetchOrdersByDeliveryPerson,
  confirmDelivery,
} from "@/services/deliveryServices";

export function useDelivery() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    entregues: 0,
    pendentes: 0,
    emRota: 0,
    preparando: 0,
    aguardando: 0,
    peso_retificado: 0,
    aguardando_confirmacao: 0
  });

  // Ref para controle
  const isUpdating = useRef(false);
  const ordersRef = useRef(orders);

  // Manter ref atualizada
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Calcular estatísticas
  const calcularStats = useCallback((ordersList) => {
    if (!ordersList || ordersList.length === 0) {
      setStats({
        total: 0,
        entregues: 0,
        pendentes: 0,
        emRota: 0,
        preparando: 0,
        aguardando: 0,
        peso_retificado: 0,
        aguardando_confirmacao: 0
      });
      return;
    }

    setStats({
      total: ordersList.length,
      entregues: ordersList.filter(o => o.status_pedido === 'delivered' || o.status === 'delivered').length,
      pendentes: ordersList.filter(o => o.status_pedido === 'pending' || o.status === 'pending').length,
      emRota: ordersList.filter(o => o.status_pedido === 'out_for_delivery' || o.status === 'out_for_delivery').length,
      preparando: ordersList.filter(o => o.status_pedido === 'preparing' || o.status === 'preparing').length,
      aguardando: ordersList.filter(o => o.status_pedido === 'pending' || o.status === 'pending').length,
      peso_retificado: ordersList.filter(o => o.status_pedido === 'weight_revised' || o.status === 'weight_revised').length,
      aguardando_confirmacao: ordersList.filter(o => o.status_pedido === 'waiting_confirmation' || o.status === 'waiting_confirmation').length
    });
  }, []);

  // Buscar todos os pedidos
  const loadOrders = useCallback(async () => {
    if (isUpdating.current) {
      console.log("Já está carregando, ignorando...");
      return;
    }
    
    try {
      isUpdating.current = true;
      setLoading(true);
      setError(null);

      const data = await fetchOrders();
      console.log("HOOK Pedidos recebidos:", data?.length || 0);
      setOrders(data || []);
      calcularStats(data || []);

    } catch (error) {
      console.error("Erro em loadOrders:", error);
      setError(error.message || "Erro ao buscar pedidos");
    } finally {
      setLoading(false);
      isUpdating.current = false;
    }
  }, [calcularStats]);

  // Buscar pedidos por status
  const loadOrdersByStatus = useCallback(async (status) => {
    if (isUpdating.current) {
      console.log("Já está carregando, ignorando...");
      return;
    }
    
    try {
      isUpdating.current = true;
      setLoading(true);
      setError(null);

      const data = await fetchOrdersByStatus(status);
      console.log(`Pedidos com status ${status}:`, data?.length || 0);
      setOrders(data || []);
      calcularStats(data || []);

    } catch (error) {
      console.error(`Erro em loadOrdersByStatus (${status}):`, error);
      setError(error.message || "Erro ao buscar pedidos por status");
    } finally {
      setLoading(false);
      isUpdating.current = false;
    }
  }, [calcularStats]);

  // Atualizar status do pedido
  const updateOrderStatus = useCallback(async (orderId, status) => {
    if (isUpdating.current) {
      console.log("⏳ Já está atualizando, ignorando...");
      return null;
    }

    try {
      isUpdating.current = true;
      setLoading(true);
      setError(null);

      const data = await updateOrderStatusService(orderId, status);
      console.log(`Pedido ${orderId} atualizado para ${status}`);

      const currentOrders = ordersRef.current;
      const updatedOrders = currentOrders.map(order => {
        if (order.id === orderId) {
          return { 
            ...order, 
            status_pedido: status,
            status: status,
            atualizado_em: new Date().toISOString() 
          };
        }
        return order;
      });

      setOrders(updatedOrders);
      calcularStats(updatedOrders);

      return data;

    } catch (error) {
      console.error("Erro em updateOrderStatus:", error);
      setError(error.message || "Erro ao atualizar status");
      return null;
    } finally {
      setLoading(false);
      setTimeout(() => {
        isUpdating.current = false;
      }, 300);
    }
  }, [calcularStats]);

  // Buscar detalhes do pedido
  const loadOrderDetails = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchOrderDetails(orderId);
      console.log(`Detalhes do pedido ${orderId}:`, data);
      setCurrentOrder(data);
      return data;

    } catch (error) {
      console.error("Erro em loadOrderDetails:", error);
      setError(error.message || "Erro ao buscar detalhes do pedido");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atribuir entregador ao pedido
  const assignDeliveryPerson = useCallback(async (orderId, deliveryPersonId) => {
    if (isUpdating.current) return null;
    
    try {
      isUpdating.current = true;
      setLoading(true);
      setError(null);

      const data = await assignDeliveryPersonService(orderId, deliveryPersonId);
      console.log(`Entregador atribuído ao pedido ${orderId}`);

      const currentOrders = ordersRef.current;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId 
          ? { ...order, entregador_id: deliveryPersonId }
          : order
      );

      setOrders(updatedOrders);

      return data;

    } catch (error) {
      console.error("Erro em assignDeliveryPerson:", error);
      setError(error.message || "Erro ao atribuir entregador");
      return null;
    } finally {
      setLoading(false);
      setTimeout(() => {
        isUpdating.current = false;
      }, 300);
    }
  }, []);

  // Buscar entregadores disponíveis
  const loadAvailableDeliveryPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAvailableDeliveryPersons();
      console.log("Entregadores disponíveis:", data?.length || 0);
      return data || [];

    } catch (error) {
      console.error("Erro em loadAvailableDeliveryPersons:", error);
      setError(error.message || "Erro ao buscar entregadores");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar localização
  const updateLocation = useCallback(async (orderId, latitude, longitude) => {
    try {
      setError(null);

      const data = await updateDeliveryLocation(orderId, latitude, longitude);
      console.log(`Localização do pedido ${orderId} atualizada`);
      return data;

    } catch (error) {
      console.error("Erro em updateLocation:", error);
      setError(error.message || "Erro ao atualizar localização");
      return null;
    }
  }, []);

  // Cancelar entrega
  const cancelDelivery = useCallback(async (orderId, motivo) => {
    if (isUpdating.current) return null;
    
    try {
      isUpdating.current = true;
      setLoading(true);
      setError(null);

      const data = await cancelDeliveryService(orderId, motivo);
      console.log(`Pedido ${orderId} cancelado`);

      const currentOrders = ordersRef.current;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId 
          ? { ...order, status_pedido: 'cancelled', status: 'cancelled', motivo_cancelamento: motivo }
          : order
      );

      setOrders(updatedOrders);
      calcularStats(updatedOrders);

      return data;

    } catch (error) {
      console.error("Erro em cancelDelivery:", error);
      setError(error.message || "Erro ao cancelar entrega");
      return null;
    } finally {
      setLoading(false);
      setTimeout(() => {
        isUpdating.current = false;
      }, 300);
    }
  }, [calcularStats]);

  // Buscar estatísticas do entregador
  const loadDeliveryStats = useCallback(async (deliveryPersonId) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchDeliveryStats(deliveryPersonId);
      console.log(`Estatísticas do entregador:`, data);
      return data;

    } catch (error) {
      console.error("Erro em loadDeliveryStats:", error);
      setError(error.message || "Erro ao buscar estatísticas");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar pedidos do entregador
  const loadMyOrders = useCallback(async (deliveryPersonId) => {
    if (isUpdating.current) return;
    
    try {
      isUpdating.current = true;
      setLoading(true);
      setError(null);

      const data = await fetchOrdersByDeliveryPerson(deliveryPersonId);
      console.log(`Meus pedidos:`, data?.length || 0);
      setOrders(data || []);
      calcularStats(data || []);
      return data;

    } catch (error) {
      console.error("Erro em loadMyOrders:", error);
      setError(error.message || "Erro ao buscar seus pedidos");
    } finally {
      setLoading(false);
      setTimeout(() => {
        isUpdating.current = false;
      }, 300);
    }
  }, [calcularStats]);

  // Confirmar entrega com comprovante
  const confirmDeliveryWithProof = useCallback(async (orderId, proofData) => {
    if (isUpdating.current) return null;
    
    try {
      isUpdating.current = true;
      setLoading(true);
      setError(null);

      const data = await confirmDelivery(orderId, proofData);
      console.log(`Entrega do pedido ${orderId} confirmada`);

      const currentOrders = ordersRef.current;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId 
          ? { ...order, status_pedido: 'delivered', status: 'delivered' }
          : order
      );

      setOrders(updatedOrders);
      calcularStats(updatedOrders);

      return data;

    } catch (error) {
      console.error("Erro em confirmDeliveryWithProof:", error);
      setError(error.message || "Erro ao confirmar entrega");
      return null;
    } finally {
      setLoading(false);
      setTimeout(() => {
        isUpdating.current = false;
      }, 300);
    }
  }, [calcularStats]);

  // Limpar erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efeito para carregar pedidos automaticamente com intervalo
  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    const interval = window.setInterval(() => {
      if (!isUpdating.current) {
        void loadOrders();
      }
    }, 15000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [loadOrders]);

  return {
    // Estados
    orders,
    loading,
    error,
    stats,
    currentOrder,
    setCurrentOrder,

    // Funções principais
    loadOrders,
    loadOrdersByStatus, 
    loadOrderDetails,
    loadAvailableDeliveryPersons,
    loadDeliveryStats,
    loadMyOrders,

    // Funções de ação
    updateOrderStatus,
    assignDeliveryPerson,
    updateLocation,
    cancelDelivery,
    confirmDeliveryWithProof,
    clearError,

    // Funções auxiliares
    calcularStats
  };
}