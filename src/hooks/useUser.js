import { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { fetchUsers, fetchRegisterUsers } from "../services/userSevices";
import { 
  verifyToken, 
  refreshToken, 
  decodeToken, 
  isTokenExpired, 
  getTokenRemainingTime, getCurrentUser
} from "../services/userSevices";

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
    userRole: null,
    tokenInfo: null,      
    loading: false,    
  });

  // ============ VERIFICAR TOKEN AO INICIAR ============
  useEffect(() => {
    const savedToken = localStorage.getItem('@token');
    const savedUser = localStorage.getItem('@user');
    
    if (savedToken && !isTokenExpired(savedToken)) {
      const tokenInfo = decodeToken(savedToken);
      const userData = savedUser ? JSON.parse(savedUser) : null;
      const userRole = tokenInfo?.role || userData?.user?.role || userData?.role;
      
      setAuth({
        loginData: userData,
        token: savedToken,
        userRole: userRole,
        tokenInfo: tokenInfo,
        loading: false,
      });
      
      console.log(" Token recuperado do localStorage, role:", userRole);
    } else if (savedToken && isTokenExpired(savedToken)) {
      console.log(" Token expirado, limpando...");
      localStorage.removeItem('@token');
      localStorage.removeItem('@user');
    }
  }, []);

  // ============ PARTE 2: CARRINHO DE COMPRAS ============
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartVersion, setCartVersion] = useState(0);

  // Carregar carrinho do localStorage ao iniciar
  useEffect(() => {
    console.log(' useUser - Carregando carrinho do localStorage');
    const savedCart = localStorage.getItem('@cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      console.log(' Carrinho carregado:', parsedCart.length, 'itens');
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
    console.log('addToCart CHAMADO! Produto:', produto.nome);
    
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
      
      console.log('Carrinho agora tem:', newCart.length, 'itens');
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

  // ============ FUNÇÕES DE LOGIN/REGISTRO ============
  const loadUser = async (user, password) => {
    setAuth((prev) => ({ ...prev, loading: true }));

    try {
      const userData = await fetchUsers(user, password);
      
      console.log("userData.user:", userData?.user);
      console.log("userData.token:", userData?.token);
      
      const token = userData?.token || null;
      const userRole = userData?.user?.role || null;
    
      if (token) {
        localStorage.setItem('@token', token);
      }
      if (userData?.user) {
        localStorage.setItem('@user', JSON.stringify(userData.user));
      }
      
      setAuth({
        loginData: userData,
        token: token,
        userRole: userRole,
        tokenInfo: token ? decodeToken(token) : null,
        loading: false,
      });

      console.log("LOGIN BEM SUCEDIDO!");
      console.log("👤 Role:", userRole);
 
      if(userRole === "admin") {
        router.push("/infoPanelPage");
      } 

      if(userRole === "delivery"){
        router.push("/deliveryPage");
      }

      if(userRole === "user"){
        router.push("/userPage");
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setAuth((prev) => ({ ...prev, loading: false }));
    }
  };
// ----------- REGISTRO ------------------------
  const registerUser = async (user, password, confirmPassword, name, birthDate, phone, address ,complement ,number ,region , city, state, zip_code, cpf) => {
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
      const userData = await fetchRegisterUsers(user, password, name, birthDate, phone, address ,complement ,number ,region,  city, state, zip_code, cpf);
      router.push("/loginPage");
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      setAuth((prev) => ({ ...prev, loading: false }));
    }
  };

  // ============ LOGOUT ============
  const logout = useCallback(() => {
    console.log("🚪 Fazendo logout...");
    localStorage.removeItem('@token');
    localStorage.removeItem('@user');
    setAuth({
      loginData: null,
      token: null,
      userRole: null,
      tokenInfo: null,
      loading: false,
    });
    router.push('/loginPage');
  }, [router]);

  // ============ FUNÇÕES DE VERIFICAÇÃO ============
  const isAuthenticated = useCallback(() => {
    const token = auth.token || localStorage.getItem('@token');
    
    if (!token) return false;
    if (isTokenExpired(token)) return false;
    
    return true;
  }, [auth.token]);

  const hasRole = useCallback((requiredRole) => {
    const userRole = auth.userRole;
    
    if (!requiredRole) return true;
    if (!userRole) return false;
    
    return userRole === requiredRole;
  }, [auth.userRole]);

  const requireAuth = useCallback(async (redirectTo = '/loginPage') => {
    if (!isAuthenticated()) {
      await logout();
      router.push(redirectTo);
      return false;
    }
    return true;
  }, [isAuthenticated, logout, router]);

  const requireRole = useCallback((requiredRole, redirectTo = '/userPage') => {
    if (!hasRole(requiredRole)) {
      router.push(redirectTo);
      return false;
    }
    return true;
  }, [hasRole, router]);

  // ============ VALIDAÇÃO DE TOKEN ============
  const validateToken = useCallback(async () => {
    const token = auth.token || localStorage.getItem('@token');
    
    if (!token) {
      console.log("❌ validateToken: Nenhum token encontrado");
      return { valid: false, error: "Token não encontrado" };
    }
    
    if (isTokenExpired(token)) {
      console.log("❌ validateToken: Token expirado localmente");
      await logout();
      return { valid: false, error: "Token expirado" };
    }
    
    try {
      const result = await verifyToken(token);
      
      if (result.valid) {
        console.log("✅ validateToken: Token válido");
        const tokenInfo = decodeToken(token);

        console.log("TOKEN RECUPERADO", token);
        
        console.log("USUARIO RECUPERADO", tokenInfo);
        setAuth(prev => ({
          ...prev,
          tokenInfo: tokenInfo,
          userRole: tokenInfo?.role || prev.userRole,
        }));
        
        return { valid: true, decoded: result.decoded };
      } else {
        console.log("❌ validateToken: Token inválido no backend");
        await logout();
        return { valid: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ validateToken: Erro na verificação", error);
      return { valid: false, error: error.message };
    }
  }, [auth.token, logout]);

  const checkTokenAndRedirect = useCallback(async (redirectTo = '/loginPage') => {
    const result = await validateToken();
    
    if (!result.valid) {
      console.log("🔒 checkTokenAndRedirect: Token inválido, redirecionando");
      router.push(redirectTo);
      return false;
    }
    
    console.log("✅ checkTokenAndRedirect: Token válido");
    return true;
  }, [validateToken, router]);

  const isTokenExpiringSoon = useCallback(() => {
    const token = auth.token || localStorage.getItem('@token');
    const remainingTime = getTokenRemainingTime(token);
    
    if (remainingTime <= 0) return false;
    return remainingTime <= 5;
  }, [auth.token]);

  const autoRefreshToken = useCallback(async () => {
    const token = auth.token || localStorage.getItem('@token');
    
    if (!token) return false;
    if (!isTokenExpiringSoon()) return false;
    
    console.log("🔄 autoRefreshToken: Renovando token...");
    
    try {
      const result = await refreshToken();
      
      if (result.token) {
        localStorage.setItem('@token', result.token);
        setAuth(prev => ({
          ...prev,
          token: result.token,
          tokenInfo: decodeToken(result.token),
        }));
        console.log("✅ autoRefreshToken: Token renovado com sucesso");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ autoRefreshToken: Erro ao renovar", error);
      return false;
    }
  }, [auth.token, isTokenExpiringSoon]);

  const setupTokenValidation = useCallback(() => {
    const interval = setInterval(async () => {
      const isValid = await validateToken();
      
      if (!isValid.valid) {
        console.log("⚠️ Token inválido detectado na verificação periódica");
        clearInterval(interval);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [validateToken]);

  useEffect(() => {
    if (auth.token) {
      const cleanup = setupTokenValidation();
      return cleanup;
    }
  }, [auth.token, setupTokenValidation]);

  //================ para obter dados dos usuarios no checkout ===============
  const loadCurrentUser = async () => {
  try {
    const user = await getCurrentUser(auth.token);

    setAuth(prev => ({
      ...prev,
      currentUser: user,
    }));

    return user;
  } catch (error) {
    console.error(error);
  }
};

  return {
    //====== AUTH/USUÁRIO ============
    auth,
    loadUser,
    registerUser,
    logout,
    isAuthenticated,
    hasRole,
    requireAuth,
    requireRole,
    validateToken,
    checkTokenAndRedirect,
    isTokenExpiringSoon,
    autoRefreshToken,
    loadCurrentUser,
    
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