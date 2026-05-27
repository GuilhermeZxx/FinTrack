import React, { useState } from 'react';
import './Login.css';

import { validarSenha } from './utils/validacoes';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    
    if (!validarSenha(senha)) {
      alert('A senha deve conter exatamente 8 caracteres.');
      return; 
    }

    
    console.log('Tentando logar com:', { email, senha });
    alert(`Login enviado!\nE-mail: ${email}`);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>FinTrack</h2>
        <p>Gerencie suas finanças de forma simples</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>

        <p className="login-footer">
          Não tem uma conta? <a href="#cadastro">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}

export default Login;