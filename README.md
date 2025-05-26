# Estaciona Fácil - Sistema de Estacionamento Rotativo Municipal

## Visão Geral

O Sistema de Estacionamento Rotativo Municipal "Estaciona Fácil" é uma solução digital projetada para modernizar e simplificar a gestão de vagas de estacionamento público em áreas urbanas. Ele permite aos cidadãos adquirirem permissões de estacionamento por períodos específicos de forma conveniente, facilita a fiscalização por parte dos agentes municipais, e oferece ferramentas robustas para a administração e otimização do uso dos espaços públicos de estacionamento. O objetivo principal é proporcionar transparência, eficiência e praticidade tanto para os usuários quanto para a administração municipal.

## Funcionalidades

O sistema oferece diversas funcionalidades adaptadas para cada perfil de usuário:

### Para Cidadãos
- **Compra de Permissão:** Adquira permissões de estacionamento de forma rápida, com ou sem cadastro no sistema.
- **Consulta de Tempo:** Verifique o tempo restante de uma permissão ativa.
- **Gestão de Veículos (Cadastrados):** Adicione, edite e remova veículos para agilizar compras futuras.
- **Histórico de Compras (Cadastrados):** Acesse o histórico de permissões adquiridas.
- **Alertas (Cadastrados):** Receba notificações via WhatsApp sobre a expiração do tempo de estacionamento.
- **Múltiplas Formas de Pagamento:** Pague com cartão de crédito, PIX, entre outros, através de integrações com gateways de pagamento (Asaas, Mercado Pago, Stripe).

### Para Fiscais
- **Verificação de Veículos:** Consulte a situação de estacionamento de um veículo via leitura de placa (OCR) ou inserção manual.
- **Modo Offline:** Realize verificações mesmo em áreas com conectividade limitada, com sincronização posterior.
- **Registro de Irregularidades:** Documente infrações com captura de fotos e geolocalização.

### Para Gerentes
- **Gestão de Tarifas:** Defina e ajuste os valores para os diferentes períodos e zonas de estacionamento.
- **Monitoramento em Tempo Real:** Acompanhe indicadores como permissões ativas, arrecadação e taxa de ocupação através de um dashboard.
- **Relatórios Gerenciais:** Exporte dados analíticos para auxiliar na tomada de decisões.

### Para Administradores
- **Gestão de Usuários:** Crie, edite e gerencie contas de todos os perfis de usuários (cidadãos, fiscais, gerentes).
- **Configurações do Sistema:** Ajuste parâmetros técnicos e regras de negócio.
- **Auditoria e Logs:** Acesse registros detalhados de todas as operações críticas no sistema.
- **Análise Avançada:** Obtenha insights sobre padrões de uso, horários de pico e receita por zona.

## Tecnologias Utilizadas

O projeto é construído utilizando uma stack moderna e robusta:

### Aplicação Cliente (Frontend)
- **Framework:** React (com Vite)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Roteamento:** Wouter
- **Gerenciamento de Estado/Cache de API:** TanStack Query
- **Formulários:** React Hook Form
- **Componentes UI:** Radix UI, Shadcn/ui
- **Reconhecimento Óptico de Caracteres (OCR):** Tesseract.js (para leitura de placas)

### Aplicação Servidora (Backend)
- **Ambiente de Execução:** Node.js
- **Framework:** Express.js
- **Linguagem:** TypeScript
- **Banco de Dados:** MongoDB (gerenciado com Mongoose ODM)
- **Autenticação:** Passport.js (com estratégias JWT)
- **Validação de Dados:** Zod
- **Conteinerização (Banco de Dados Local):** Docker

### Compartilhado
- **Esquemas e Tipos:** `shared/schema.ts` para consistência entre frontend e backend.

## Estrutura do Projeto

O código-fonte está organizado da seguinte maneira:

-   `client/`: Contém todo o código da aplicação frontend (React). A `package.json` e configurações do Vite para o cliente encontram-se na raiz do projeto.
-   `server/`: Contém todo o código da aplicação backend (Node.js/Express API).
-   `shared/`: Contém definições (como esquemas Zod) que são compartilhadas entre o cliente e o servidor, garantindo consistência.
-   `attached_assets/`: Documentação e artefatos relacionados ao planejamento e requisitos do projeto.

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes softwares instalados em sua máquina:

-   **Node.js:** Versão `>=22.0.0` (conforme especificado em `server/package.json`). É recomendável usar um gerenciador de versões como [nvm](https://github.com/nvm-sh/nvm) ou [fnm](https://github.com/Schniz/fnm).
-   **pnpm:** O gerenciador de pacotes utilizado no projeto. Instruções de instalação podem ser encontradas [aqui](https://pnpm.io/installation).
-   **Docker e Docker Compose:** Para executar o banco de dados MongoDB em um contêiner localmente para o desenvolvimento do servidor. ([Instalação do Docker](https://docs.docker.com/get-docker/)).

## Configuração e Execução

Siga os passos abaixo para configurar e executar o projeto localmente.

### 1. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
```

### 2. Configurar e Executar o Backend (Servidor)

1.  **Navegue até a pasta do servidor:**
    ```bash
    cd server
    ```

2.  **Instale as dependências:**
    ```bash
    pnpm install
    ```

3.  **Crie o arquivo de variáveis de ambiente:**
    Crie um arquivo `.env` na pasta `server/` e adicione as seguintes variáveis. Substitua os valores de exemplo pelos seus.
    ```env
    NODE_ENV=dev
    MONGODB_URL=mongodb://localhost:27017/estaciona_facil_dev
    PORT=3001 # Ou outra porta de sua preferência para a API
    JWT_SECRET=seuSuperSegredoParaJWT
    JWT_ACCESS_EXPIRATION_MINUTES=30
    JWT_REFRESH_EXPIRATION_DAYS=30
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10
    FRONTEND_ORIGIN=http://localhost:3000 # Ou a URL onde o cliente estará rodando
    ```
    *Nota: Para produção, utilize valores mais seguros e apropriados.*

4.  **Inicie o banco de dados MongoDB com Docker Compose:**
    Na pasta `server/`, execute:
    ```bash
    docker-compose -f docker-compose-local.yml up -d
    ```
    Isso iniciará um contêiner MongoDB com os dados persistidos em um volume local.

5.  **Execute o servidor em modo de desenvolvimento:**
    ```bash
    pnpm dev
    ```
    O servidor backend estará em execução (por padrão, em `http://localhost:3001` ou a porta que você configurou).

### 3. Configurar e Executar o Frontend (Cliente)

1.  **Navegue até a pasta raiz do projeto** (se você estava na pasta `server/`, use `cd ..`):
    ```bash
    # Se estiver em server/, volte para a raiz:
    # cd ..
    ```

2.  **Instale as dependências do cliente:**
    (A `package.json` do cliente está na raiz do projeto)
    ```bash
    pnpm install
    ```

3.  **Configure as variáveis de ambiente do cliente:**
    O cliente utiliza um arquivo `.env` na pasta `client/`. Verifique o arquivo `client/.env` existente. Normalmente, você precisará configurar a URL base da API:
    ```env
    # Exemplo para client/.env
    VITE_API_BASE_URL=http://localhost:3001/v1 # Ou a URL/porta onde seu backend está rodando + /v1
    ```
    Certifique-se de que `VITE_API_BASE_URL` aponta para o endereço e porta corretos do seu servidor backend.

4.  **Execute o cliente em modo de desenvolvimento:**
    ```bash
    pnpm dev
    ```
    A aplicação cliente estará acessível em `http://localhost:3000` (ou outra porta, conforme indicado pelo Vite).

Agora você deve ter o ambiente de desenvolvimento completo do Estaciona Fácil rodando localmente!
