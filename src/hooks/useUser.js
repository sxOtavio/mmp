import { useState } from "react";
import { useRouter } from "next/navigation"; // ✨ Importação correta para Next.js (App Router)
import { fetchUsers } from "../services/userSevices"; 
import { fetchRegisterUsers } from "../services/userSevices"; 

export function validCPF(cpf) {
  // Remove tudo que não for número
  cpf = cpf.replace(/\D/g, "");
  // Verifica tamanho e CPFs inválidos conhecidos
  if (
    cpf.length !== 11 ||
    /^(\d)\1+$/.test(cpf)
  ) {
    return false;
  }
  // Validação do primeiro dígito
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== parseInt(cpf.charAt(9))) {
    return false;
  }
  // Validação do segundo dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== parseInt(cpf.charAt(10))) {
    return false;
  }
  return true;
}

//------------------------------------- LOGIN DE USUÁRIO --------------------------------------------------------------------------

export function useUser() {
  const router = useRouter(); // ✨ No Next.js usamos router em vez de navigate
  const [auth, setAuth] = useState({
    loginData: null,   
    token: null, 
    userType: null,      
    loading: false,    
  });

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
      
      console.log("LOGIN BEM SUCEDIDO, BEM VINDO!! Dados do usuário carregados:", userData);
      console.log("Tipo de usuario:", userData?.token);
      console.log("Token armazenado:", userData?.token);
      if(userData.role=="admin"){
      router.push("/infoPanelPage");
      }
      else{ router.push("/userPage");}
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setAuth((prev) => ({ ...prev, loading: false }));
    }
  };

  //------------------------------------- REGISTRO DE USUÁRIO --------------------------------------------------------------------------

    const registerUser = async (user, password, confirmPassword, name, birthDate, phone, address, city, state, zip_code, cpf) => {
    setAuth((prev) => ({ ...prev, loading: true }));
      //---------------------REGRA DO CPF VALIDO------------
      const cpfRegex = /^\d{11}$/;
      if (!cpfRegex.test(cpf)) {
        return alert("CPF inválido! Deve conter exatamente 11 dígitos numéricos.");
      }
      //---------------------CALCULO DO CPF VALIDO------------
       if (!validCPF(cpf)) {
        return alert("CPF inválido! O número não é válido.");
      }
      //---------------------REGRA DO CEP VALIDO------------
  
      
      //-------------------REGRA DA MAIOR IDADE-------------
        const today = new Date();
        if (birthDate) {
          const birth = new Date(birthDate);
          const age = today.getFullYear() - birth.getFullYear();
          if (age < 18) {
            return alert("Você deve ter pelo menos 18 anos para se registrar.");
          }
        }
      //-------------------REGRA DO TELEFONE VALIDO----------
        if(phone.length < 10 || phone.length > 11) {
      return alert("Número de telefone inválido! Deve conter 10 ou 11 dígitos.");
    }
      //-------------------REGRA DA SENHA EQUIVALENTE------
        if (password !== confirmPassword) {
      return alert("As senhas não coincidem!");
    }
    try {
      const userData = await fetchRegisterUsers(user, password , name, birthDate, phone, address, city, state, zip_code, cpf);

      setAuth({
        loginData: userData,
        token: userData?.token || null, 
        loading: false,
      });
      router.push("/loginPage");

    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setAuth((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    auth,
    loadUser,
    registerUser
  };
}