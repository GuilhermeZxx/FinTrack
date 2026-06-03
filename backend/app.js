import express from 'express';
import createRoutes from './routes.js';

export function createApp(options = {}) {
  const app = express();
  const allowedOrigin = process.env.CORS_ORIGIN || '*';

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  });

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', createRoutes(options));

  app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' });
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  });

  return app;
}

export default createApp;
