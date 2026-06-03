const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'fintrack_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Não foi possível concluir a operação.');
    error.details = data.details;
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  async register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async me() {
    return request('/auth/me');
  },

  async listTransactions(filters = {}) {
    const search = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    const query = search.toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },

  async createTransaction(payload) {
    return request('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateTransaction(id, payload) {
    return request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteTransaction(id) {
    return request(`/transactions/${id}`, { method: 'DELETE' });
  },

  async getSummary() {
    return request('/reports/summary');
  },
};
