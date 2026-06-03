export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) return '';
  const [date] = String(value).split('T');
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
};

export function calculateSummary(transactions = []) {
  const totals = transactions.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount || 0);
      if (transaction.type === 'income') acc.income += amount;
      if (transaction.type === 'expense') acc.expense += amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );

  return {
    income: totals.income,
    expense: totals.expense,
    balance: totals.income - totals.expense,
  };
}

export function groupByCategory(transactions = []) {
  return Object.values(
    transactions.reduce((acc, transaction) => {
      const key = `${transaction.type}:${transaction.category}`;
      acc[key] ||= {
        category: transaction.category,
        type: transaction.type,
        total: 0,
      };
      acc[key].total += Number(transaction.amount || 0);
      return acc;
    }, {}),
  ).sort((a, b) => b.total - a.total);
}

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}
