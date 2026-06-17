//const API_URL = "http://localhost:3000/api";
// =============== LOGIN ==============================
export async function fetchUsers(user, password) {
  try {
    // rota de login método POST
    const response = await fetch(`/api/users`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
      },
     
      body: JSON.stringify({ 
        username: user, 
        password: password 
      }),
    });

    if (!response.ok) {
      throw new Error(
        "Erro ao fazer login: " + response.statusText
      );
    }

    const data = await response.json();
    return data; // Retorna os dados do usuário + token vindos do backend

  } catch (error) {
    console.error("Erro na requisição de login:", error);
    // 4. Retornamos null em vez de [] porque login espera um Objeto ou Erro, não uma lista
    return null; 
  }
}

//====================== REGISTRO ========================================

export async function fetchRegisterUsers(user, password, name, birthDate, phone, address, city, state, zip_code, cpf) {
  try {
    // 2. Mudamos para a rota típica de login e configuramos o método POST
    const response = await fetch(`/api/register`, { // Ajuste a rota final de acordo com seu back
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Avisa o back que estamos enviando JSON
      },
      // 3. Transforma o objeto JavaScript com os dados em texto JSON para envio
      body: JSON.stringify({ 
        username: user,
        password: password,
        name: name,
        birthDate: birthDate,
        phone: phone,
        address: address,
        city: city,
        state: state,
        zip_code: zip_code,
        cpf: cpf
      }),

    }
  );

    if (!response.ok) {
      throw new Error(
        "Erro ao fazer registro: " + response.statusText
      );
    }

    const data = await response.json();
    return data; // Retorna os dados do usuário + token vindos do backend

  } catch (error) {
    console.error("Erro na requisição de registro:", error);
    // 4. Retornamos null em vez de [] porque registro espera um Objeto ou Erro, não uma lista
    return null; 
  }
}

// ============ VALIDAÇÃO DE TOKEN ============

// Verificar token no backend
export async function verifyToken(token) {
  try {
    const response = await fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Token inválido');
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    throw error;
  }
}

// Decodificar token localmente (sem chamar API)
export function decodeToken(token) {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

// Verificar se token está expirado (local)
export function isTokenExpired(token) {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const expiracao = decoded.exp * 1000;
  const agora = Date.now();
  
  return agora >= expiracao;
}

// Obter tempo restante do token (em minutos)
export function getTokenRemainingTime(token) {
  if (!token) return 0;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  
  const expiracao = decoded.exp * 1000;
  const agora = Date.now();
  const restanteMs = expiracao - agora;
  
  if (restanteMs <= 0) return 0;
  
  return Math.floor(restanteMs / 1000 / 60);
}

// Renovar token
export async function refreshToken() {
  try {
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao renovar token');
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    throw error;
  }
}

// ====== Obter informações do usuário pelo token ================

export async function getCurrentUser(token) {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar usuário');
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw error;
  }
}

