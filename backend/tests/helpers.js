import { hashPassword } from '../auth.js';

export function createMemoryStore() {
  let userId = 1;
  let transactionId = 1;
  const users = [];
  const transactions = [];

  return {
    async createUser({ name, email, passwordHash }) {
      if (users.some((user) => user.email === email)) {
        const error = new Error('E-mail duplicado');
        error.code = '23505';
        throw error;
      }

      const user = {
        id: userId++,
        name,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    },

    async findUserByEmail(email) {
      return users.find((user) => user.email === email) || null;
    },

    async findUserById(id) {
      const user = users.find((item) => item.id === Number(id));
      return user
        ? { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
        : null;
    },

    async listTransactions(ownerId, filters = {}) {
      return transactions
        .filter((transaction) => transaction.userId === Number(ownerId))
        .filter((transaction) => !filters.type || transaction.type === filters.type)
        .filter((transaction) => !filters.category || transaction.category === filters.category)
        .filter((transaction) => !filters.month || transaction.transactionDate.startsWith(filters.month))
        .filter(
          (transaction) =>
            !filters.search ||
            transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            transaction.category.toLowerCase().includes(filters.search.toLowerCase()),
        )
        .map(({ userId: _userId, ...transaction }) => transaction)
        .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
    },

    async createTransaction(ownerId, data) {
      const transaction = {
        id: transactionId++,
        userId: Number(ownerId),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      transactions.push(transaction);
      const { userId: _userId, ...publicTransaction } = transaction;
      return publicTransaction;
    },

    async updateTransaction(ownerId, id, data) {
      const index = transactions.findIndex(
        (transaction) => transaction.userId === Number(ownerId) && transaction.id === Number(id),
      );
      if (index === -1) return null;

      transactions[index] = {
        ...transactions[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      const { userId: _userId, ...publicTransaction } = transactions[index];
      return publicTransaction;
    },

    async deleteTransaction(ownerId, id) {
      const index = transactions.findIndex(
        (transaction) => transaction.userId === Number(ownerId) && transaction.id === Number(id),
      );
      if (index === -1) return false;
      transactions.splice(index, 1);
      return true;
    },

    async getSummary(ownerId) {
      const ownTransactions = transactions.filter(
        (transaction) => transaction.userId === Number(ownerId),
      );
      const income = ownTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((total, transaction) => total + Number(transaction.amount), 0);
      const expense = ownTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

      const byCategory = Object.values(
        ownTransactions.reduce((acc, transaction) => {
          const key = `${transaction.type}:${transaction.category}`;
          acc[key] ||= {
            category: transaction.category,
            type: transaction.type,
            total: 0,
          };
          acc[key].total += Number(transaction.amount);
          return acc;
        }, {}),
      );

      return {
        totals: { income, expense, balance: income - expense },
        byCategory,
        monthlyTrend: [],
      };
    },

    seedUser({ name = 'Ana Silva', email = 'ana@email.com', password = 'senha123' } = {}) {
      users.push({
        id: userId++,
        name,
        email,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      });
    },
  };
}

export async function withTestServer(app, callback) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
