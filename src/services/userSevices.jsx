const API_URL = "http://localhost:3000/api";

// 1. Adicionado os parâmetros 'user' e 'password' na função
export async function fetchUsers(user, password) {
  try {
    // 2. Mudamos para a rota típica de login e configuramos o método POST
    const response = await fetch(`${API_URL}/users`, { // Ajuste a rota final de acordo com seu back
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Avisa o back que estamos enviando JSON
      },
      // 3. Transforma o objeto JavaScript com os dados em texto JSON para envio
      body: JSON.stringify({ 
        username: user, // Ajuste a chave (ex: email, username) conforme o backend espera
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
export async function fetchRegisterUsers(user, password, name, birthDate, phone, address, city, state, zip_code, cpf) {
  try {
    // 2. Mudamos para a rota típica de login e configuramos o método POST
    const response = await fetch(`${API_URL}/register`, { // Ajuste a rota final de acordo com seu back
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