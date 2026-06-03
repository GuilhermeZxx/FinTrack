import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hashPassword, signJwt, verifyJwt, verifyPassword } from '../auth.js';

describe('autenticação', () => {
  it('gera hash de senha e valida somente a senha correta', () => {
    const hash = hashPassword('senha123');

    assert.notEqual(hash, 'senha123');
    assert.equal(verifyPassword('senha123', hash), true);
    assert.equal(verifyPassword('senhaErrada', hash), false);
  });

  it('assina e valida um JWT com o payload esperado', () => {
    const token = signJwt({ sub: 10, email: 'user@email.com' }, { expiresIn: '1h' });
    const payload = verifyJwt(token);

    assert.equal(payload.sub, 10);
    assert.equal(payload.email, 'user@email.com');
    assert.equal(typeof payload.exp, 'number');
  });

  it('rejeita token adulterado', () => {
    const token = signJwt({ sub: 10 });
    const tampered = token.replace(/.$/, 'x');

    assert.throws(() => verifyJwt(tampered), /Token inválido/);
  });
});
