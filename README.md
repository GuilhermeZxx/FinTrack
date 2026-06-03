# FinTrack

Sistema completo de controle financeiro pessoal com frontend Vite/React, backend Node.js/Express, autenticação JWT e persistência em PostgreSQL.

## Funcionalidades

- Login e cadastro de usuário com senha protegida por PBKDF2.
- Autenticação via JWT em rotas privadas.
- Dashboard financeiro com receitas, despesas e saldo.
- Registro manual de transações para controle pessoal.
- Listagem, filtros, edição e exclusão de transações.
- Relatórios por categoria e saúde financeira.
- Layout responsivo para desktop e mobile.
- Testes unitários e de integração para backend e frontend.

## Stack

- Frontend: Vite, React e Vitest.
- Backend: Node.js, Express e `pg`.
- Banco: PostgreSQL.
- Testes backend: `node:test` com servidor HTTP real e store em memória.

## Configuração

1. Copie `.env.example` para `.env`.
2. Ajuste as credenciais do PostgreSQL e defina um `JWT_SECRET` forte.
3. Instale dependências quando necessário:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Execução local

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Docker Compose:

```bash
docker compose up --build
```

Ao iniciar, o backend cria automaticamente as tabelas `users` e `transactions` quando elas ainda não existem.

## Endpoints da API

Base URL local: `http://localhost:3000/api`

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/health` | Não | Status da API |
| POST | `/auth/register` | Não | Cadastro de usuário |
| POST | `/auth/login` | Não | Login e emissão de JWT |
| GET | `/auth/me` | Sim | Dados do usuário autenticado |
| GET | `/transactions` | Sim | Lista transações com filtros opcionais |
| POST | `/transactions` | Sim | Cria uma transação manual |
| PUT | `/transactions/:id` | Sim | Edita uma transação |
| DELETE | `/transactions/:id` | Sim | Remove uma transação |
| GET | `/reports/summary` | Sim | Totais, categorias e tendência mensal |

Filtros aceitos em `GET /transactions`:

- `type`: `income` ou `expense`
- `category`: categoria exata
- `month`: mês no formato `YYYY-MM`
- `search`: busca em descrição ou categoria

Exemplo de transação:

```json
{
  "type": "expense",
  "description": "Supermercado",
  "category": "Alimentação",
  "amount": 250.75,
  "transactionDate": "2026-06-03",
  "notes": "Compra semanal"
}
```

## Testes e qualidade

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test -- --run
npm run lint
npm run build
```

Cobertura implementada:

- Backend: hashing de senha, assinatura/verificação JWT, cadastro, login, autenticação, CRUD de transações e resumo financeiro.
- Frontend: validações de formulário, cálculo de saldo, agrupamento por categoria e formatação monetária.

## Observações de segurança

- Não versionar o arquivo `.env`.
- Trocar `JWT_SECRET` em produção.
- Usar HTTPS e restringir `CORS_ORIGIN` ao domínio real em produção.
