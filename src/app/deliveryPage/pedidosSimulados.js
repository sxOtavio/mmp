// data/pedidosSimulados.js

export const pedidosSimulados = [
  {
    id: 1001,
    cliente_nome: "João Silva",
    cliente_telefone: "(11) 99999-1111",
    cliente_endereco: "Rua das Flores, 123 - Jardim Primavera",
    cliente_cidade: "São Paulo - SP",
    status_pedido: "pago",
    total: 157.80,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    itens: [
      { nome: "Arroz 5kg", quantidade: 2, preco: 25.90 },
      { nome: "Feijão 1kg", quantidade: 3, preco: 8.50 },
      { nome: "Macarrão", quantidade: 2, preco: 4.50 },
      { nome: "Óleo de Soja", quantidade: 1, preco: 9.90 },
      { nome: "Leite 1L", quantidade: 6, preco: 5.20 }
    ]
  },
  {
    id: 1002,
    cliente_nome: "Maria Oliveira",
    cliente_telefone: "(11) 98888-2222",
    cliente_endereco: "Av. Paulista, 1000 - Bela Vista",
    cliente_cidade: "São Paulo - SP",
    status_pedido: "pago",
    total: 89.50,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    itens: [
      { nome: "Pão de Forma", quantidade: 3, preco: 8.90 },
      { nome: "Mortadela", quantidade: 1, preco: 15.90 },
      { nome: "Queijo Mussarela", quantidade: 1, preco: 22.90 },
      { nome: "Manteiga", quantidade: 2, preco: 12.00 },
      { nome: "Café 500g", quantidade: 1, preco: 18.90 }
    ]
  },
  {
    id: 1003,
    cliente_nome: "Carlos Santos",
    cliente_telefone: "(11) 97777-3333",
    cliente_endereco: "Rua Augusta, 500 - Consolação",
    cliente_cidade: "São Paulo - SP",
    status_pedido: "preparando",
    total: 234.30,
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    itens: [
      { nome: "Coca-Cola 2L", quantidade: 6, preco: 12.00 },
      { nome: "Fralda Pampers", quantidade: 2, preco: 45.90 },
      { nome: "Leite Ninho", quantidade: 3, preco: 28.90 },
      { nome: "Sabão em Pó", quantidade: 2, preco: 18.50 },
      { nome: "Detergente", quantidade: 5, preco: 2.50 }
    ]
  },
  {
    id: 1004,
    cliente_nome: "Ana Paula",
    cliente_telefone: "(11) 96666-4444",
    cliente_endereco: "Rua Oscar Freire, 2000 - Jardins",
    cliente_cidade: "São Paulo - SP",
    status_pedido: "preparando",
    total: 312.40,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    itens: [
      { nome: "Carvão", quantidade: 3, preco: 25.00 },
      { nome: "Carne Picanha", quantidade: 4, preco: 45.90 },
      { nome: "Linguiça", quantidade: 2, preco: 18.90 },
      { nome: "Cerveja Heineken", quantidade: 24, preco: 4.50 },
      { nome: "Gelo", quantidade: 4, preco: 8.00 }
    ]
  },
  {
    id: 1005,
    cliente_nome: "Roberto Lima",
    cliente_telefone: "(11) 95555-5555",
    cliente_endereco: "Alameda Santos, 1500 - Cerqueira César",
    cliente_cidade: "São Paulo - SP",
    status_pedido: "saiu_para_entrega",
    total: 67.80,
    created_at: new Date(Date.now() - 150 * 60000).toISOString(),
    itens: [
      { nome: "Sabonete", quantidade: 10, preco: 2.50 },
      { nome: "Shampoo", quantidade: 2, preco: 15.90 },
      { nome: "Condicionador", quantidade: 2, preco: 15.90 },
      { nome: "Creme Dental", quantidade: 4, preco: 3.50 }
    ]
  },
  {
    id: 1006,
    cliente_nome: "Fernanda Souza",
    cliente_telefone: "(11) 94444-6666",
    cliente_endereco: "Rua Haddock Lobo, 800 - Cerqueira César",
    cliente_cidade: "São Paulo - SP",
    status_pedido: "entregue",
    total: 145.20,
    created_at: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    itens: [
      { nome: "Frango Congelado", quantidade: 3, preco: 18.90 },
      { nome: "Batata Congelada", quantidade: 2, preco: 12.90 },
      { nome: "Legumes Congelados", quantidade: 4, preco: 9.90 },
      { nome: "Sorvete Kibon", quantidade: 3, preco: 15.90 }
    ]
  },
  {
    id: 1007,
    cliente_nome: "Ricardo Alves",
    cliente_telefone: "(11) 93333-7777",
    cliente_endereco: "Av. Faria Lima, 3000 - Itaim Bibi",
    cliente_cidade: "São Paulo - SP",
    status_pedido: "pago",
    total: 198.50,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    itens: [
      { nome: "Whisky Red Label", quantidade: 1, preco: 89.90 },
      { nome: "Energético", quantidade: 6, preco: 8.50 },
      { nome: "Amendoim", quantidade: 4, preco: 5.00 },
      { nome: "Gelo", quantidade: 3, preco: 8.00 },
      { nome: "Coca-Cola", quantidade: 6, preco: 12.00 }
    ]
  },
  {
    id: 1008,
    cliente_nome: "Patrícia Lima",
    cliente_telefone: "(11) 92222-8888",
    cliente_endereco: "Rua Funchal, 500 - Vila Olímpia",
    cliente_cidade: "São Paulo - SP",
    status_pedido: "preparando",
    total: 267.90,
    created_at: new Date(Date.now() - 75 * 60000).toISOString(),
    itens: [
      { nome: "Arroz 5kg", quantidade: 5, preco: 25.90 },
      { nome: "Feijão 1kg", quantidade: 4, preco: 8.50 },
      { nome: "Açúcar 5kg", quantidade: 2, preco: 15.90 },
      { nome: "Farinha", quantidade: 3, preco: 6.50 },
      { nome: "Óleo", quantidade: 4, preco: 9.90 }
    ]
  }
];

export function filtrarPedidos(pedidos, status) {
  if (status === 'todos') return pedidos;
  return pedidos.filter(p => p.status_pedido === status);
}

export function contarPedidosPorStatus(pedidos) {
  return {
    pago: pedidos.filter(p => p.status_pedido === 'pago').length,
    preparando: pedidos.filter(p => p.status_pedido === 'preparando').length,
    saiu_para_entrega: pedidos.filter(p => p.status_pedido === 'saiu_para_entrega').length,
    entregue: pedidos.filter(p => p.status_pedido === 'entregue').length
  };
}