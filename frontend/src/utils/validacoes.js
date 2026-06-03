export const validarSenha = (senhaTexto = '') => senhaTexto.length >= 8;

export const validarEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validarTransacao = (transacao = {}) => {
  const amount = Number(transacao.amount);

  return Boolean(
    ['income', 'expense'].includes(transacao.type) &&
      transacao.description?.trim().length >= 2 &&
      transacao.category?.trim().length >= 2 &&
      Number.isFinite(amount) &&
      amount > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(transacao.transactionDate || ''),
  );
};
