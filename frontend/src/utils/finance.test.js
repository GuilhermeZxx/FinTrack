import { describe, expect, it } from 'vitest';
import { calculateSummary, formatCurrency, groupByCategory } from './finance';

describe('utilitários financeiros', () => {
  it('calcula receitas, despesas e saldo', () => {
    const summary = calculateSummary([
      { type: 'income', amount: 5000 },
      { type: 'expense', amount: 1200 },
      { type: 'expense', amount: 300 },
    ]);

    expect(summary).toEqual({ income: 5000, expense: 1500, balance: 3500 });
  });

  it('agrupa valores por categoria e tipo', () => {
    const grouped = groupByCategory([
      { type: 'expense', category: 'Casa', amount: 100 },
      { type: 'expense', category: 'Casa', amount: 75 },
      { type: 'income', category: 'Salário', amount: 4000 },
    ]);

    expect(grouped[0]).toEqual({ type: 'income', category: 'Salário', total: 4000 });
    expect(grouped[1]).toEqual({ type: 'expense', category: 'Casa', total: 175 });
  });

  it('formata valores em reais', () => {
    expect(formatCurrency(10)).toContain('10,00');
  });
});
