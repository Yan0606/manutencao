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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Login do administrador
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  
  console.log('Tentativa de login:', email);

  try {
    const [admins] = await db.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      console.log('Admin não encontrado:', email);
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const admin = admins[0];
    
    // Comparação da senha usando bcrypt
    const senhaValida = await bcrypt.compare(senha, admin.senha);
    if (!senhaValida) {
      console.log('Senha inválida para:', email);
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    console.log('Login bem sucedido para:', email);
    
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        nome: admin.nome
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
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

    console.log('Tentativa de atualização do técnico:', { id, nome, telefone, email });

    const [result] = await db.execute(
      'UPDATE tecnicos SET nome = ?, telefone = ?, email = ? WHERE id = ?',
      [nome, telefone, email, id]
    );

    console.log('Resultado da atualização:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Técnico não encontrado' });
    }

    res.json({ message: 'Técnico atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar técnico:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar técnico',
      error: error.message 
    });
  }
});

// Excluir técnico
router.delete('/tecnicos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Tentativa de exclusão do técnico:', id);

    const [result] = await db.execute(
      'DELETE FROM tecnicos WHERE id = ?',
      [id]
    );

    console.log('Resultado da exclusão:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Técnico não encontrado' });
    }

    res.json({ message: 'Técnico excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir técnico:', error);
    res.status(500).json({ 
      message: 'Erro ao excluir técnico',
      error: error.message 
    });
  }
});

// Atualizar perfil do administrador
router.put('/perfil', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const adminId = req.adminId;

    // Verificar se o email já está em uso
    const [existingAdmin] = await db.execute(
      'SELECT id FROM admins WHERE email = ? AND id != ?',
      [email, adminId]
    );

    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }

    // Atualizar email
    await db.execute(
      'UPDATE admins SET email = ? WHERE id = ?',
      [email, adminId]
    );

    // Buscar dados atualizados
    const [admin] = await db.execute(
      'SELECT id, nome, email, data_criacao FROM admins WHERE id = ?',
      [adminId]
    );

    res.json(admin[0]);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

// Recuperar senha
router.post('/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se o email existe
    const [admin] = await db.execute(
      'SELECT id, nome FROM admins WHERE email = ?',
      [email]
    );

    if (admin.length === 0) {
      return res.status(404).json({ message: 'Email não encontrado' });
    }

    // Gerar token de recuperação
    const token = jwt.sign(
      { id: admin[0].id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Implementar envio de email com o token
    // Por enquanto, apenas retornamos o token
    res.json({ 
      message: 'Email de recuperação enviado com sucesso',
      token // Em produção, não retornar o token
    });
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    res.status(500).json({ message: 'Erro ao processar recuperação de senha' });
  }
});

// Redefinir senha
router.post('/redefinir-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ message: 'Token inválido' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(novaSenha, salt);

    // Atualizar senha
    await db.execute(
      'UPDATE admins SET senha = ? WHERE id = ?',
      [hashedPassword, decoded.id]
    );

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro ao redefinir senha' });
  }
});

module.exports = router; 