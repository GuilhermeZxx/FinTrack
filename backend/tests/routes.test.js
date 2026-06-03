import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createApp } from '../app.js';
import { createMemoryStore, withTestServer } from './helpers.js';

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  return { response, body };
}

describe('rotas da API', () => {
  it('cadastra, autentica e retorna o usuário atual', async () => {
    const store = createMemoryStore();
    const app = createApp({ store });

    await withTestServer(app, async (baseUrl) => {
      const register = await request(baseUrl, '/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Maria Souza',
          email: 'maria@email.com',
          password: 'senha123',
        }),
      });

      assert.equal(register.response.status, 201);
      assert.equal(register.body.user.email, 'maria@email.com');
      assert.ok(register.body.token);

      const me = await request(baseUrl, '/api/auth/me', {
        headers: { Authorization: `Bearer ${register.body.token}` },
      });

      assert.equal(me.response.status, 200);
      assert.equal(me.body.user.name, 'Maria Souza');
    });
  });

  it('faz login e protege credenciais inválidas', async () => {
    const store = createMemoryStore();
    store.seedUser();
    const app = createApp({ store });

    await withTestServer(app, async (baseUrl) => {
      const login = await request(baseUrl, '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'ana@email.com', password: 'senha123' }),
      });

      assert.equal(login.response.status, 200);
      assert.ok(login.body.token);

      const invalid = await request(baseUrl, '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'ana@email.com', password: 'errada123' }),
      });

      assert.equal(invalid.response.status, 401);
    });
  });

  it('cria, lista, edita, resume e remove transações do usuário autenticado', async () => {
    const store = createMemoryStore();
    store.seedUser();
    const app = createApp({ store });

    await withTestServer(app, async (baseUrl) => {
      const login = await request(baseUrl, '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'ana@email.com', password: 'senha123' }),
      });
      const auth = { Authorization: `Bearer ${login.body.token}` };

      const created = await request(baseUrl, '/api/transactions', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({
          type: 'expense',
          description: 'Mercado',
          category: 'Alimentação',
          amount: 250.75,
          transactionDate: '2026-06-03',
          notes: 'Compra semanal',
        }),
      });

      assert.equal(created.response.status, 201);
      assert.equal(created.body.transaction.amount, 250.75);

      const edited = await request(baseUrl, `/api/transactions/${created.body.transaction.id}`, {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({
          type: 'expense',
          description: 'Mercado atualizado',
          category: 'Alimentação',
          amount: 275,
          transactionDate: '2026-06-03',
          notes: '',
        }),
      });

      assert.equal(edited.response.status, 200);
      assert.equal(edited.body.transaction.description, 'Mercado atualizado');

      const list = await request(baseUrl, '/api/transactions?type=expense', { headers: auth });
      assert.equal(list.response.status, 200);
      assert.equal(list.body.transactions.length, 1);

      const summary = await request(baseUrl, '/api/reports/summary', { headers: auth });
      assert.equal(summary.response.status, 200);
      assert.equal(summary.body.summary.totals.expense, 275);
      assert.equal(summary.body.summary.totals.balance, -275);

      const deleted = await request(baseUrl, `/api/transactions/${created.body.transaction.id}`, {
        method: 'DELETE',
        headers: auth,
      });

      assert.equal(deleted.response.status, 204);
    });
  });
});
