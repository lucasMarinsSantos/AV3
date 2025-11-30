# Sistema Aerocode – AV3

Aplicação web para gestão da produção de aeronaves, com backend em Node/Express/Prisma/MySQL e frontend em React/TypeScript (Vite). Inclui autenticação JWT, CRUD completo das entidades e painel de métricas de desempenho.

## Stack

- Backend: Node.js 20, TypeScript, Express, Prisma, MySQL 8
- Frontend: React, TypeScript, Vite
- Autenticação: JWT

## Configuração do .env (backend)

No diretório `backend/`:

1. Copie o arquivo de exemplo:
- `cd backend`
- `cp .env.example .env`

2. Edite o `.env` e ajuste pelo menos:
- `DATABASE_URL` – URL de conexão do MySQL (usuário, senha, host, porta, banco).
- `JWT_SECRET` – chave usada para assinar os tokens JWT.


## Como rodar o projeto (modo simples)

Na **raiz** do projeto:
`node start-all.js`

Esse comando vai:
- Rodar `npm install` em `backend/` e `frontend/`.
- Aplicar as migrations (`npx prisma migrate dev`) e executar o seed (`npm run seed`) no backend.
- Subir `npm run dev` no backend (`http://localhost:3000`) e no frontend (`http://localhost:5173`).

## Como rodar manualmente (opcional):

### Backend

1. Entrar na pasta:
   - `cd backend`
2. Criar o arquivo de ambiente:
   - `cp .env.example .env`
   - Ajustar `DATABASE_URL` e, se quiser, `JWT_SECRET`.
3. Instalar dependências e preparar o banco:
   - `npm install`
   - `npx prisma migrate dev`
   - `npm run seed`
4. Iniciar:
   - `npm run dev`  
   - API em `http://localhost:3000`.

### Frontend

1. Entrar na pasta:
   - `cd frontend`
2. Instalar dependências:
   - `npm install`
3. Iniciar:
   - `npm run dev`  
   - SPA em `http://localhost:5173`.

## Login padrão

Usuário de teste para acessar o sistema:

- Usuário: `admin`
- Senha: `admin123`

Após login, o menu libera: Dashboard, Aeronaves, Peças, Etapas, Funcionários, Testes, Relatórios e Métricas.

## Métricas e relatório de qualidade

- Middleware de métricas em todas as rotas registra latência, tempo de processamento e tempo de resposta em ms na base MySQL.

- A tela **Métricas** mostra cards, tabela e 3 gráficos para cenários de 1, 5 e 10 usuários.
- Para gerar o relatório de métricas automaticamente:
- `cd backend`
- `npm run metrics:report`

- O arquivo será gerado/atualizado em: `docs/relatorio-qualidade.md`.