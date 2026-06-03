import { Router } from 'express';
import { hashPassword, signJwt, verifyJwt, verifyPassword } from './auth.js';
import { postgresStore } from './store.js';
import { validateLogin, validateRegistration, validateTransaction } from './validators.js';

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function authMiddleware(store) {
  return async (req, res, next) => {
    try {
      const authorization = req.headers.authorization || '';
      const [, token] = authorization.split(' ');

      if (!token) {
        return res.status(401).json({ error: 'Token de autenticação ausente.' });
      }

      const payload = verifyJwt(token);
      const user = await store.findUserById(payload.sub);

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado.' });
      }

      req.user = user;
      return next();
    } catch {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
  };
}

export function createRoutes({ store = postgresStore } = {}) {
  const router = Router();
  const requireAuth = authMiddleware(store);

  router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'fintrack-api' });
  });

  router.post('/auth/register', async (req, res, next) => {
    try {
      const validation = validateRegistration(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Dados inválidos.', details: validation.errors });
      }

      const passwordHash = hashPassword(validation.data.password);
      const user = await store.createUser({ ...validation.data, passwordHash });
      const token = signJwt({ sub: user.id, email: user.email });

      return res.status(201).json({ user: publicUser(user), token });
    } catch (error) {
      if (error.code === '23505' || /e-mail/i.test(error.message)) {
        return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
      }
      return next(error);
    }
  });

  router.post('/auth/login', async (req, res, next) => {
    try {
      const validation = validateLogin(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Dados inválidos.', details: validation.errors });
      }

      const user = await store.findUserByEmail(validation.data.email);
      const passwordMatches = user && verifyPassword(validation.data.password, user.passwordHash);

      if (!passwordMatches) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const token = signJwt({ sub: user.id, email: user.email });
      return res.json({ user: publicUser(user), token });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/auth/me', requireAuth, (req, res) => {
    res.json({ user: publicUser(req.user) });
  });

  router.get('/transactions', requireAuth, async (req, res, next) => {
    try {
      const transactions = await store.listTransactions(req.user.id, {
        type: req.query.type,
        category: req.query.category,
        month: req.query.month,
        search: req.query.search,
      });

      return res.json({ transactions });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/transactions', requireAuth, async (req, res, next) => {
    try {
      const validation = validateTransaction(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Dados inválidos.', details: validation.errors });
      }

      const transaction = await store.createTransaction(req.user.id, validation.data);
      return res.status(201).json({ transaction });
    } catch (error) {
      return next(error);
    }
  });

  router.put('/transactions/:id', requireAuth, async (req, res, next) => {
    try {
      const validation = validateTransaction(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Dados inválidos.', details: validation.errors });
      }

      const transaction = await store.updateTransaction(
        req.user.id,
        Number(req.params.id),
        validation.data,
      );

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada.' });
      }

      return res.json({ transaction });
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/transactions/:id', requireAuth, async (req, res, next) => {
    try {
      const deleted = await store.deleteTransaction(req.user.id, Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: 'Transação não encontrada.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  router.get('/reports/summary', requireAuth, async (req, res, next) => {
    try {
      const summary = await store.getSummary(req.user.id);
      return res.json({ summary });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

export default createRoutes;
