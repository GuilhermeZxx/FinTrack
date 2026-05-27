import { describe, it, expect } from 'vitest';
import { validarSenha } from './validacoes';

describe('Testes Unitários da Validação de Senha', () => {
  
  it('Deve retornar FALSE se a senha for menor que 8 caracteres', () => {
    // Testando com 5 caracteres 
    expect(validarSenha('12345')).toBe(false); 
  });

  it('Deve retornar FALSE se a senha for maior que 8 caracteres', () => {
    // Testando com 10 caracteres 
    expect(validarSenha('1234567890')).toBe(false); 
  });

  it('Deve retornar TRUE se a senha tiver EXATAMENTE 8 caracteres', () => {
    // Testando com 8 caracteres 
    expect(validarSenha('senha123')).toBe(true); 
  });

  it('Deve retornar FALSE se a senha for enviada vazia', () => {
    // Testando com 0 caracteres
    expect(validarSenha('')).toBe(false); 
  });

});