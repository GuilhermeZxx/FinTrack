import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from './api';
import './App.css';
import { calculateSummary, formatCurrency, formatDate, getCurrentMonth, groupByCategory } from './utils/finance';
import { validarEmail, validarSenha, validarTransacao } from './utils/validacoes';

const emptyTransaction = {
  type: 'expense',
  description: '',
  category: '',
  amount: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (isRegister && form.name.trim().length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (!validarEmail(form.email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!validarSenha(form.password)) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const payload = isRegister
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const result = isRegister ? await api.register(payload) : await api.login(payload);
      setToken(result.token);
      onAuthenticated(result.user);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-label="Acesso ao FinTrack">
        <div className="brand-mark">FT</div>
        <div>
          <h1>FinTrack</h1>
          <p>Controle financeiro pessoal com lançamentos manuais, relatórios e saldo em tempo real.</p>
        </div>

        <div className="segmented" role="tablist" aria-label="Alternar entre login e cadastro">
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>
            Entrar
          </button>
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>
            Criar conta
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Nome
              <input
                autoComplete="name"
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Seu nome"
                value={form.name}
              />
            </label>
          )}

          <label>
            E-mail
            <input
              autoComplete="email"
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="voce@email.com"
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Senha
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Mínimo de 8 caracteres"
              type="password"
              value={form.password}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? 'Enviando...' : isRegister ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <article className={`stat-card ${tone || ''}`}>
      <span>{label}</span>
      <strong>{formatCurrency(value)}</strong>
    </article>
  );
}

function TransactionForm({ editing, onCancel, onSubmit }) {
  const [form, setForm] = useState(editing || emptyTransaction);
  const [error, setError] = useState('');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      amount: Number(form.amount),
    };

    if (!validarTransacao(payload)) {
      setError('Preencha tipo, descrição, categoria, valor e data corretamente.');
      return;
    }

    setError('');
    onSubmit(payload);
    if (!editing) setForm(emptyTransaction);
  }

  return (
    <section className="tool-panel" aria-labelledby="transaction-form-title">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Lançamento manual</span>
          <h2 id="transaction-form-title">{editing ? 'Editar transação' : 'Registrar transação'}</h2>
        </div>
        {editing && (
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="segmented compact">
          <button
            className={form.type === 'expense' ? 'active' : ''}
            type="button"
            onClick={() => updateField('type', 'expense')}
          >
            Despesa
          </button>
          <button
            className={form.type === 'income' ? 'active' : ''}
            type="button"
            onClick={() => updateField('type', 'income')}
          >
            Receita
          </button>
        </div>

        <label>
          Descrição
          <input
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Ex.: Supermercado"
            value={form.description}
          />
        </label>

        <div className="form-grid">
          <label>
            Categoria
            <input
              onChange={(event) => updateField('category', event.target.value)}
              placeholder="Ex.: Alimentação"
              value={form.category}
            />
          </label>

          <label>
            Valor
            <input
              min="0.01"
              onChange={(event) => updateField('amount', event.target.value)}
              placeholder="0,00"
              step="0.01"
              type="number"
              value={form.amount}
            />
          </label>
        </div>

        <label>
          Data
          <input
            onChange={(event) => updateField('transactionDate', event.target.value)}
            type="date"
            value={String(form.transactionDate || '').slice(0, 10)}
          />
        </label>

        <label>
          Observações
          <textarea
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Opcional"
            rows="3"
            value={form.notes || ''}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button" type="submit">
          {editing ? 'Salvar edição' : 'Adicionar'}
        </button>
      </form>
    </section>
  );
}

function TransactionsTable({ transactions, onDelete, onEdit }) {
  if (!transactions.length) {
    return (
      <section className="tool-panel empty-state">
        <h2>Nenhuma transação encontrada</h2>
        <p>Registre sua primeira receita ou despesa manual para começar o controle.</p>
      </section>
    );
  }

  return (
    <section className="tool-panel" aria-labelledby="transactions-title">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Histórico</span>
          <h2 id="transactions-title">Transações</h2>
        </div>
        <span className="counter-pill">{transactions.length}</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.transactionDate)}</td>
                <td>
                  <strong>{transaction.description}</strong>
                  {transaction.notes && <small>{transaction.notes}</small>}
                </td>
                <td>{transaction.category}</td>
                <td>
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className={transaction.type === 'income' ? 'money income' : 'money expense'}>
                  {formatCurrency(transaction.amount)}
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-button" type="button" onClick={() => onEdit(transaction)} title="Editar">
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => onDelete(transaction.id)}
                      title="Excluir"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Reports({ summary, transactions }) {
  const categoryData = summary?.byCategory?.length ? summary.byCategory : groupByCategory(transactions);
  const maxCategory = Math.max(...categoryData.map((item) => item.total), 1);
  const localSummary = summary?.totals || calculateSummary(transactions);

  return (
    <section className="reports-grid" aria-label="Relatórios financeiros">
      <div className="tool-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Relatórios</span>
            <h2>Resumo por categoria</h2>
          </div>
        </div>

        <div className="bar-list">
          {categoryData.length ? (
            categoryData.map((item) => (
              <div className="bar-row" key={`${item.type}-${item.category}`}>
                <div>
                  <strong>{item.category}</strong>
                  <span>{item.type === 'income' ? 'Receita' : 'Despesa'}</span>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <span style={{ width: `${Math.max((item.total / maxCategory) * 100, 6)}%` }} />
                </div>
                <strong>{formatCurrency(item.total)}</strong>
              </div>
            ))
          ) : (
            <p className="muted">Sem dados para exibir.</p>
          )}
        </div>
      </div>

      <div className="tool-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Saldo</span>
            <h2>Saúde financeira</h2>
          </div>
        </div>
        <div className="balance-ring">
          <strong>{formatCurrency(localSummary.balance)}</strong>
          <span>{localSummary.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}</span>
        </div>
        <p className="muted">
          Receitas representam {formatCurrency(localSummary.income)} e despesas somam{' '}
          {formatCurrency(localSummary.expense)} no período listado.
        </p>
      </div>
    </section>
  );
}

function Dashboard({ onLogout, user }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ type: '', month: getCurrentMonth(), search: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const localSummary = useMemo(() => summary?.totals || calculateSummary(transactions), [summary, transactions]);
  const recentTransactions = transactions.slice(0, 5);

  const handleLogout = useCallback(() => {
    clearToken();
    onLogout();
  }, [onLogout]);

  const loadData = useCallback(async (nextFilters) => {
    setLoading(true);
    setError('');
    try {
      const [transactionsResult, summaryResult] = await Promise.all([
        api.listTransactions(nextFilters),
        api.getSummary(),
      ]);
      setTransactions(transactionsResult.transactions);
      setSummary(summaryResult.summary);
    } catch (apiError) {
      setError(apiError.message);
      if (apiError.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    loadData(filters);
  }, [filters, loadData]);

  async function saveTransaction(payload) {
    try {
      if (editing) {
        await api.updateTransaction(editing.id, payload);
      } else {
        await api.createTransaction(payload);
      }
      setEditing(null);
      await loadData(filters);
      setActiveView('transactions');
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function deleteTransaction(id) {
    try {
      await api.deleteTransaction(id);
      await loadData(filters);
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  function updateFilter(field, value) {
    const nextFilters = { ...filters, [field]: value };
    setFilters(nextFilters);
  }

  const navItems = [
    ['dashboard', 'Dashboard'],
    ['transactions', 'Transações'],
    ['reports', 'Relatórios'],
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">FT</div>
          <div>
            <strong>FinTrack</strong>
            <span>Controle pessoal</span>
          </div>
        </div>

        <nav aria-label="Navegação principal">
          {navItems.map(([key, label]) => (
            <button
              className={activeView === key ? 'active' : ''}
              key={key}
              onClick={() => setActiveView(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>

        <button className="ghost-button" type="button" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Olá, {user?.name || 'usuário'}</span>
            <h1>Seu painel financeiro</h1>
          </div>
          <div className="mobile-nav">
            {navItems.map(([key, label]) => (
              <button
                className={activeView === key ? 'active' : ''}
                key={key}
                onClick={() => setActiveView(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {error && <p className="app-alert">{error}</p>}

        <section className="stats-grid" aria-label="Indicadores financeiros">
          <StatCard label="Receitas" tone="income" value={localSummary.income} />
          <StatCard label="Despesas" tone="expense" value={localSummary.expense} />
          <StatCard label="Saldo" tone={localSummary.balance >= 0 ? 'income' : 'expense'} value={localSummary.balance} />
        </section>

        <section className="filters" aria-label="Filtros de transações">
          <label>
            Mês
            <input type="month" value={filters.month} onChange={(event) => updateFilter('month', event.target.value)} />
          </label>
          <label>
            Tipo
            <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
              <option value="">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </label>
          <label>
            Buscar
            <input
              placeholder="Descrição ou categoria"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
          </label>
        </section>

        {loading ? (
          <section className="tool-panel empty-state">
            <h2>Carregando dados</h2>
            <p>Buscando suas transações e relatórios.</p>
          </section>
        ) : (
          <div className="content-grid">
            {(activeView === 'dashboard' || activeView === 'transactions') && (
              <TransactionForm
                editing={editing}
                key={editing ? `edit-${editing.id}` : 'new-transaction'}
                onCancel={() => setEditing(null)}
                onSubmit={saveTransaction}
              />
            )}

            {activeView === 'dashboard' && (
              <TransactionsTable transactions={recentTransactions} onDelete={deleteTransaction} onEdit={setEditing} />
            )}

            {activeView === 'transactions' && (
              <TransactionsTable transactions={transactions} onDelete={deleteTransaction} onEdit={setEditing} />
            )}

            {activeView === 'reports' && <Reports summary={summary} transactions={transactions} />}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(getToken()));

  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) return;

      try {
        const result = await api.me();
        setUser(result.user);
      } catch {
        clearToken();
      } finally {
        setCheckingSession(false);
      }
    }

    restoreSession();
  }, []);

  if (checkingSession) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div className="brand-mark">FT</div>
          <h1>FinTrack</h1>
          <p>Restaurando sessão...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}

export default App;
