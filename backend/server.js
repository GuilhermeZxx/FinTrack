import dotenv from 'dotenv';
import { createApp } from './app.js';
import { initializeDatabase } from './db.js';

dotenv.config({ path: '../.env' });

const PORT = process.env.PORT || 3000;
const app = createApp();

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`FinTrack API rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  });
