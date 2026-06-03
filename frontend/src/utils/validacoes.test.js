import { describe, expect, it } from 'vitest';
import { validarEmail, validarSenha, validarTransacao } from './validacoes';

describe('validações de formulário', () => {
  it('valida senha com mínimo de 8 caracteres', () => {
    expect(validarSenha('1234567')).toBe(false);
    expect(validarSenha('senha123')).toBe(true);
    expect(validarSenha('senha123forte')).toBe(true);
  });

  it('valida formato de e-mail', () => {
    expect(validarEmail('usuario@email.com')).toBe(true);
    expect(validarEmail('usuario-email.com')).toBe(false);
  });

  it('valida uma transação financeira manual', () => {
    expect(
      validarTransacao({
        type: 'expense',
        description: 'Mercado',
        category: 'Alimentação',
        amount: 230,
        transactionDate: '2026-06-03',
      }),
    ).toBe(true);

    expect(
      validarTransacao({
        type: 'expense',
        description: 'M',
        category: 'Alimentação',
        amount: 0,
        transactionDate: '03/06/2026',
      }),
    ).toBe(false);
  });
});
