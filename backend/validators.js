const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

export function validateRegistration(input) {
  const errors = {};
  const name = String(input.name || input.nome || '').trim();
  const email = normalizeEmail(input.email);
  const password = String(input.password || input.senha || '');

  if (name.length < 2) errors.name = 'Informe um nome com pelo menos 2 caracteres.';
  if (!emailRegex.test(email)) errors.email = 'Informe um e-mail válido.';
  if (password.length < 8) errors.password = 'A senha deve ter pelo menos 8 caracteres.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { name, email, password },
  };
}

export function validateLogin(input) {
  const errors = {};
  const email = normalizeEmail(input.email);
  const password = String(input.password || input.senha || '');

  if (!emailRegex.test(email)) errors.email = 'Informe um e-mail válido.';
  if (!password) errors.password = 'Informe a senha.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { email, password },
  };
}

export function validateTransaction(input) {
  const errors = {};
  const type = String(input.type || '').trim();
  const description = String(input.description || input.descricao || '').trim();
  const category = String(input.category || input.categoria || '').trim();
  const amount = Number(input.amount || input.valor);
  const transactionDate = String(input.transactionDate || input.transaction_date || input.data || '').trim();
  const notes = String(input.notes || input.observacoes || '').trim();

  if (!['income', 'expense'].includes(type)) {
    errors.type = 'Tipo deve ser income ou expense.';
  }
  if (description.length < 2) {
    errors.description = 'Informe uma descrição.';
  }
  if (category.length < 2) {
    errors.category = 'Informe uma categoria.';
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Informe um valor maior que zero.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
    errors.transactionDate = 'Informe a data no formato YYYY-MM-DD.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { type, description, category, amount, transactionDate, notes },
  };
}
