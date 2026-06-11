import { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { fetchUsers } from "../services/userSevices"; 
import { fetchRegisterUsers } from "../services/userSevices";

// ================ VALIDADOR DE CPF ======================
export function validCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

//------------------------------------- HOOK PRINCIPAL --------------------------------------------------------------------------
export function useUser() {
  const router = useRouter();
  
  // ============ PARTE 1: AUTH (LOGIN/REGISTRO) ============
  const [auth, setAuth] = useState({
    loginData: null,   
    token: null, 
    userType: null,      
    loading: false,    
  });

  // ============ PARTE 2: CARRINHO DE COMPRAS ============
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartVersion, setCartVersion] = useState(0);

  // Carregar carrinho do localStorage ao iniciar
  useEffect(() => {
    console.log('🔁 useUser - Carregando carrinho do localStorage');
    const savedCart = localStorage.getItem('@cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      console.log('📦 Carrinho carregado:', parsedCart.length, 'itens');
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    console.log('💾 Salvando carrinho no localStorage:', cart.length, 'itens');
    localStorage.setItem('@cart', JSON.stringify(cart));
    calculateTotal();
    setCartVersion(prev => prev + 1);
  }, [cart]);

  // Calcular total do carrinho
  const calculateTotal = useCallback(() => {
    const total = cart.reduce((sum, item) => {
      const preco = item.precoPromocional || item.precoNormal;
      return sum + (Number(preco) * item.quantity);
    }, 0);
    setCartTotal(total);
  }, [cart]);

  // Adicionar produto ao carrinho
  const addToCart = useCallback((produto, quantity = 1) => {
    console.log('🔵 addToCart CHAMADO! Produto:', produto.nome);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.gtin === produto.gtin);
      
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.gtin === produto.gtin
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { 
          ...produto, 
          quantity: quantity,
        }];
      }
      
      console.log('📦 Carrinho agora tem:', newCart.length, 'itens');
      return newCart;
    });
  }, []);

  // Remover produto do carrinho
  const removeFromCart = useCallback((gtin) => {
    setCart(prevCart => prevCart.filter(item => item.gtin !== gtin));
  }, []);

  // Atualizar quantidade
  const updateQuantity = useCallback((gtin, quantity) => {
    if (quantity <= 0) {
      removeFromCart(gtin);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.gtin === gtin ? { ...item, quantity: quantity } : item
      )
    );
  }, [removeFromCart]);

  // Limpar carrinho
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Verificar se produto está no carrinho
  const isInCart = useCallback((gtin) => {
    return cart.some(item => item.gtin === gtin);
  }, [cart]);

  // Obter quantidade no carrinho
  const getQuantity = useCallback((gtin) => {
    const item = cart.find(item => item.gtin === gtin);
    return item?.quantity || 0;
  }, [cart]);

  // ============ PARTE 3: FUNÇÕES DE LOGIN/REGISTRO ============
  const loadUser = async (user, password) => {
    setAuth((prev) => ({ ...prev, loading: true }));

    try {
      const userData = await fetchUsers(user, password);
      setAuth({
        loginData: userData,
        token: userData?.token || null,
        userType: userData?.userType || null,
        loading: false,
      });
      
      console.log("LOGIN BEM SUCEDIDO, BEM VINDO!!", userData);
      
      if(userData?.role === "admin") {
        router.push("/infoPanelPage");
      } else { 
        router.push("/userPage");
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setAuth((prev) => ({ ...prev, loading: false }));
    }
  };

  const registerUser = async (user, password, confirmPassword, name, birthDate, phone, address, city, state, zip_code, cpf) => {
    setAuth((prev) => ({ ...prev, loading: true }));
    
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(cpf)) {
      setAuth((prev) => ({ ...prev, loading: false }));
      return alert("CPF inválido! Deve conter exatamente 11 dígitos numéricos.");
    }
    
    if (!validCPF(cpf)) {
      setAuth((prev) => ({ ...prev, loading: false }));
      return alert("CPF inválido! O número não é válido.");
    }
    
    const today = new Date();
    if (birthDate) {
      const birth = new Date(birthDate);
      const age = today.getFullYear() - birth.getFullYear();
      if (age < 18) {
        setAuth((prev) => ({ ...prev, loading: false }));
        return alert("Você deve ter pelo menos 18 anos para se registrar.");
      }
    }
    
    if (phone.length < 10 || phone.length > 11) {
      setAuth((prev) => ({ ...prev, loading: false }));
      return alert("Número de telefone inválido! Deve conter 10 ou 11 dígitos.");
    }
    
    if (password !== confirmPassword) {
      setAuth((prev) => ({ ...prev, loading: false }));
      return alert("As senhas não coincidem!");
    }
    
    try {
      const userData = await fetchRegisterUsers(user, password, name, birthDate, phone, address, city, state, zip_code, cpf);
      setAuth({
        loginData: userData,
        token: userData?.token || null, 
        loading: false,
      });
      router.push("/loginPage");
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      setAuth((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    //====== AUTH/USUÁRIO ============
    auth,
    loadUser,
    registerUser,
    //==== CARRINHO ============
    cart,
    cartTotal,
    cartVersion,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getQuantity,
  };
}