require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const securityMiddleware = require('./middleware/security');

// Rotas
const solicitacoesRoutes = require('./routes/solicitacoes');
const adminRoutes = require('./routes/admin');
const tecnicosRoutes = require('./routes/tecnicos');

// Validação de variáveis de ambiente
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Erro: Variável de ambiente ${envVar} não definida`);
    process.exit(1);
  }
}

// Inicialização do Express
const app = express();

// Middlewares
app.use(cors());
app.use(securityMiddleware);
app.use(express.json({ limit: '1mb' }));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Erro de validação',
      errors: err.errors 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      message: 'Não autorizado' 
    });
  }
  
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 