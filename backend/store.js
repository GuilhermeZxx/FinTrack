import { query } from './db.js';

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  };
}

function mapTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    category: row.category,
    amount: Number(row.amount),
    transactionDate: row.transaction_date,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const postgresStore = {
  async createUser({ name, email, passwordHash }) {
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash],
    );
    return mapUser(result.rows[0]);
  },

  async findUserByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    return user ? { ...mapUser(user), passwordHash: user.password_hash } : null;
  },

  async findUserById(id) {
    const result = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id],
    );
    return mapUser(result.rows[0]);
  },

  async listTransactions(userId, filters = {}) {
    const params = [userId];
    const clauses = ['user_id = $1'];

    if (filters.type) {
      params.push(filters.type);
      clauses.push(`type = $${params.length}`);
    }

    if (filters.category) {
      params.push(filters.category);
      clauses.push(`category = $${params.length}`);
    }

    if (filters.month) {
      params.push(`${filters.month}-01`);
      clauses.push(`transaction_date >= $${params.length}::date`);
      params.push(`${filters.month}-01`);
      clauses.push(`transaction_date < ($${params.length}::date + INTERVAL '1 month')`);
    }

    if (filters.search) {
      params.push(`%${filters.search}%`);
      clauses.push(`(description ILIKE $${params.length} OR category ILIKE $${params.length})`);
    }

    const result = await query(
      `SELECT *
       FROM transactions
       WHERE ${clauses.join(' AND ')}
       ORDER BY transaction_date DESC, id DESC`,
      params,
    );

    return result.rows.map(mapTransaction);
  },

  async createTransaction(userId, data) {
    const result = await query(
      `INSERT INTO transactions
        (user_id, type, description, category, amount, transaction_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        data.type,
        data.description,
        data.category,
        data.amount,
        data.transactionDate,
        data.notes,
      ],
    );
    return mapTransaction(result.rows[0]);
  },

  async updateTransaction(userId, id, data) {
    const result = await query(
      `UPDATE transactions
       SET type = $3,
           description = $4,
           category = $5,
           amount = $6,
           transaction_date = $7,
           notes = $8,
           updated_at = NOW()
       WHERE user_id = $1 AND id = $2
       RETURNING *`,
      [
        userId,
        id,
        data.type,
        data.description,
        data.category,
        data.amount,
        data.transactionDate,
        data.notes,
      ],
    );
    return result.rows[0] ? mapTransaction(result.rows[0]) : null;
  },

  async deleteTransaction(userId, id) {
    const result = await query(
      'DELETE FROM transactions WHERE user_id = $1 AND id = $2 RETURNING id',
      [userId, id],
    );
    return result.rowCount > 0;
  },

  async getSummary(userId) {
    const totalsResult = await query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       WHERE user_id = $1`,
      [userId],
    );

    const categoriesResult = await query(
      `SELECT category, type, COALESCE(SUM(amount), 0) AS total
       FROM transactions
       WHERE user_id = $1
       GROUP BY category, type
       ORDER BY total DESC`,
      [userId],
    );

    const trendResult = await query(
      `SELECT
        TO_CHAR(DATE_TRUNC('month', transaction_date), 'YYYY-MM') AS month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       WHERE user_id = $1
       GROUP BY DATE_TRUNC('month', transaction_date)
       ORDER BY month DESC
       LIMIT 6`,
      [userId],
    );

    const totals = totalsResult.rows[0];
    const income = Number(totals.income);
    const expense = Number(totals.expense);

    return {
      totals: {
        income,
        expense,
        balance: income - expense,
      },
      byCategory: categoriesResult.rows.map((row) => ({
        category: row.category,
        type: row.type,
        total: Number(row.total),
      })),
      monthlyTrend: trendResult.rows
        .map((row) => ({
          month: row.month,
          income: Number(row.income),
          expense: Number(row.expense),
          balance: Number(row.income) - Number(row.expense),
        }))
        .reverse(),
    };
  },
};
