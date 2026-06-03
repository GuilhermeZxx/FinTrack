import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '../.env' });

const { Pool } = pg;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  : {
      user: process.env.DB_USER || process.env.POSTGRES_USER,
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || process.env.POSTGRES_DB,
      password: String(process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || ''),
      port: Number(process.env.DB_PORT) || 5432,
    };

export const pool = new Pool(poolConfig);

export const query = (text, params) => pool.query(text, params);

export async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
      description VARCHAR(180) NOT NULL,
      category VARCHAR(80) NOT NULL,
      amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
      transaction_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON transactions (user_id, transaction_date DESC);
  `);
}

export async function closeDatabase() {
  await pool.end();
}
