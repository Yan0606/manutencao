const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const initializeDatabase = require('./init-db');

// Rotas
const solicitacoesRoutes = require('./routes/solicitacoes');
const adminRoutes = require('./routes/admin');
const tecnicosRoutes = require('./routes/tecnicos');

dotenv.config();

// Inicialização do Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_manutencao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Disponibilizando a conexão globalmente
global.db = pool.promise();

// Rotas
app.use('/api/solicitacoes', solicitacoesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tecnicos', tecnicosRoutes);

const PORT = process.env.PORT || 3001;

// Inicializar o banco de dados antes de iniciar o servidor
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(error => {
  console.error('Falha ao inicializar o banco de dados:', error);
  process.exit(1);
}); 