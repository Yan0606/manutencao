const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado!');
      return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o token não está expirado
    if (decoded.exp <= Date.now() / 1000) {
      return res.status(401).json({ message: 'Token expirado' });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    res.status(401).json({ message: 'Erro na autenticação' });
  }
};

// Validação de entrada para login
const validateLoginInput = (req, res, next) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }
  
  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email inválido' });
  }
  
  // Validação de senha
  if (senha.length < 6) {
    return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
  }
  
  next();
};

// Login do administrador
router.post('/login', validateLoginInput, async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Rate limiting por IP
    const clientIp = req.ip;
    const loginAttempts = await getLoginAttempts(clientIp);
    if (loginAttempts >= 5) {
      return res.status(429).json({ 
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' 
      });
    }

    const [admins] = await db.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      await incrementLoginAttempts(clientIp);
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const admin = admins[0];
    const senhaValida = await bcrypt.compare(senha, admin.senha);
    
    if (!senhaValida) {
      await incrementLoginAttempts(clientIp);
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Limpar tentativas de login após sucesso
    await clearLoginAttempts(clientIp);
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado!');
      return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email,
        type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { 
        id: admin.id, 
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Salvar refresh token no banco
    await db.execute(
      'UPDATE admins SET refresh_token = ? WHERE id = ?',
      [refreshToken, admin.id]
    );

    res.json({
      token,
      refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        nome: admin.nome
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Renovar token
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token não fornecido' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const [admins] = await db.execute(
      'SELECT * FROM admins WHERE id = ? AND refresh_token = ?',
      [decoded.id, refreshToken]
    );

    if (admins.length === 0) {
      return res.status(401).json({ message: 'Refresh token inválido' });
    }

    const admin = admins[0];

    const newToken = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email,
        type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expirado' });
    }
    res.status(401).json({ message: 'Refresh token inválido' });
  }
});

// Cadastrar novo técnico
router.post('/tecnicos', authMiddleware, async (req, res) => {
  try {
    const { nome, telefone, email } = req.body;
    const token = crypto.randomBytes(32).toString('hex');

    const [result] = await db.execute(
      'INSERT INTO tecnicos (nome, telefone, email, token) VALUES (?, ?, ?, ?)',
      [nome, telefone, email, token]
    );

    res.status(201).json({
      message: 'Técnico cadastrado com sucesso',
      tecnico: {
        id: result.insertId,
        nome,
        telefone,
        email,
        token,
        link_acesso: `/tecnico/acesso/${token}`
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao cadastrar técnico' });
  }
});

// Listar técnicos
router.get('/tecnicos', authMiddleware, async (req, res) => {
  try {
    const [tecnicos] = await db.execute('SELECT id, nome, telefone, email, token, ativo FROM tecnicos');
    res.json(tecnicos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar técnicos' });
  }
});

// Gerenciar solicitações (aprovar/reprovar)
router.patch('/solicitacoes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, prioridade } = req.body;

    await db.execute(
      'UPDATE solicitacoes SET status = ?, prioridade = ? WHERE id = ?',
      [status, prioridade, id]
    );

    res.json({ message: 'Solicitação atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar solicitação' });
  }
});

// Atualizar técnico
router.put('/tecnicos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email } = req.body;

    await db.execute(
      'UPDATE tecnicos SET nome = ?, telefone = ?, email = ? WHERE id = ?',
      [nome, telefone, email, id]
    );

    res.json({ message: 'Técnico atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar técnico:', error);
    res.status(500).json({ message: 'Erro ao atualizar técnico' });
  }
});

module.exports = router; 