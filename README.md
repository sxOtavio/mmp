#  MMP - Sistema de Delivery e Gestão de Produtos

![GitHub repo size](https://img.shields.io/github/repo-size/sxOtavio/mmp)
![GitHub language count](https://img.shields.io/github/languages/count/sxOtavio/mmp)
![GitHub top language](https://img.shields.io/github/languages/top/sxOtavio/mmp)
![GitHub last commit](https://img.shields.io/github/last-commit/sxOtavio/mmp)

Sistema completo para gestão de delivery e produtos, desenvolvido com **Next.js** e focado em oferecer uma experiência dinâmica e personalizada para administradores e clientes finais.

## Visão Geral

O **MMP** (Meu Mercado Preferido) é uma plataforma de delivery inteligente que vai além do básico. O sistema combina:

-  **Catálogo Dinâmico** com gestão administrativa via painel
-  **Cálculo de Frete** em tempo real
-  **Página de Delivery** otimizada para pedidos
-  **API Inteligente** para filtragem e exibição de produtos
-  **Personalização Completa** da página principal pelo admin

##  Principais Funcionalidades

### 🔧 Painel Administrativo
- **Personalização da Página Principal**: O administrador pode alterar layout, conteúdos e destaques sem precisar de código
- **Gestão de Produtos**: Cadastro, edição e remoção de itens do cardápio
- **Controle de Estoque**: Atualização automática de disponibilidade
- **Gerenciamento de Pedidos**: Acompanhamento do status de cada entrega

###  Cálculo de Frete
- **Cálculo em Tempo Real**: Baseado em CEP, distância e peso dos produtos
- **Múltiplas Regras**: Diferentes taxas por região, faixa de valor ou tipo de entrega
- **Integração com APIs de Correios**: Ou serviço próprio de geolocalização
- **Simulação Transparente**: Exibição clara de valores para o cliente antes do fechamento do pedido

###  Página de Delivery
- **Interface Otimizada**: Foco na conversão e facilidade de uso
- **Carrinho Inteligente**: Atualização dinâmica de valores e fretes
- **Múltiplas Formas de Pagamento**: Integração com API de pagamentos (em desenvolvimento)
- **Histórico de Pedidos**: Para clientes acompanharem suas entregas

###  API Inteligente de Produtos
- **Filtragem Dinâmica**: Por categoria, preço, popularidade, avaliação
- **Ordenação Inteligente**: Produtos mais relevantes primeiro
- **Cache Otimizado**: Performance máxima no carregamento das imagens
- **Dados Enriquecidos**: Fotos de alta qualidade e informações detalhadas de cada produto

##  Tecnologias Utilizadas

- **Framework**: Next.js 15+ (App Router)
- **Linguagem**: JavaScript (99.8%) e CSS
- **Estilização**: CSS Modules + PostCSS
- **API**: Rotas da API do Next.js (API Routes)
- **Banco de Dados**: (A definir - PostgreSQL/MongoDB/Prisma)
- **Deploy**: Vercel (otimizado para Next.js)
- **Fontes**: Geist da Vercel para tipografia moderna

##  Como Executar o Projeto

### Pré-requisitos
- Node.js 18.x ou superior
- npm / yarn / pnpm / bun

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/sxOtavio/mmp.git
cd mmp
Instale as dependências

bash
npm install
# ou
yarn install
# ou
pnpm install
Configure as variáveis de ambiente
Crie um arquivo .env.local na raiz do projeto:

env
# Exemplo de variáveis necessárias
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=sua_url_do_banco
API_KEY_SUA_API_EXTERNA=sua_chave
Execute em modo desenvolvimento

bash
npm run dev
# ou
yarn dev
Acesse a aplicação
Abra http://localhost:3000 no navegador

 Estrutura do Projeto
text
mmp/
├── src/
│   ├── app/
│   │   ├── api/              # Rotas da API
│   │   │   ├── products/     # Endpoints para produtos
│   │   │   ├── delivery/     # Endpoints para cálculo de frete
│   │   │   └── payment/      # API de pagamentos (em desenvolvimento)
│   │   ├── admin/            # Painel administrativo
│   │   │   └── dashboard/    # Personalização da página principal
│   │   ├── delivery/         # Página de delivery
│   │   └── page.js           # Página principal (dinâmica)
│   ├── components/           # Componentes reutilizáveis
│   ├── lib/                  # Utilitários e funções auxiliares
│   └── styles/               # Estilos globais
├── public/                   # Arquivos estáticos
├── middleware.js             # Middleware para autenticação e rotas
├── next.config.mjs           # Configuração do Next.js
└── package.json              # Dependências e scripts
 Personalização Dinâmica da Página Principal
O sistema permite que o administrador modifique:

Banners e Destaques: Imagens, textos e links em destaque

Ordem dos Produtos: Produtos em evidência, lançamentos, promoções

Categorias Exibidas: Quais categorias aparecem na página inicial

Layout e Estilos: Cores, fontes e disposição dos elementos

Conteúdo Estático: Textos institucionais, sobre a empresa, etc.

Tudo isso através de um painel intuitivo, sem necessidade de conhecimento técnico.

 Fluxo de Funcionamento
Cliente acessa a página principal → Visualiza produtos em destaque

Navega pelo catálogo → Filtros e ordenação inteligente

Adiciona itens ao carrinho → Atualização em tempo real

Simula o frete → Cálculo baseado no CEP

Finaliza o pedido → Processamento via API de pagamento

Acompanha a entrega → Status atualizado em tempo real

 Status do Desenvolvimento
Funcionalidade	Status
API de Pagamentos	🟡 Em desenvolvimento
Cálculo de Frete	🟡 Em planejamento
Página de Delivery	🟢 Estrutura inicial pronta
Painel Administrativo	🟢 Estrutura inicial pronta
API de Produtos	🟢 Estrutura inicial pronta
Personalização Dinâmica	🟡 Em planejamento

👤 Autor
Otávio (sxOtavio)

GitHub: @sxOtavio

Projeto: mmp-navy.vercel.app
