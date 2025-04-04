const express = require('express');
const router = express.Router();

// Criar nova solicitação
router.post('/', async (req, res) => {
  try {
    const { nome_solicitante, setor, titulo, local, descricao } = req.body;
    
    const [result] = await global.db.execute(
      'INSERT INTO solicitacoes (nome_solicitante, setor, titulo, local, descricao) VALUES (?, ?, ?, ?, ?)',
      [nome_solicitante, setor, titulo, local, descricao]
    );

    res.status(201).json({
      message: 'Solicitação criada com sucesso',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar solicitação' });
  }
});

// Listar todas as solicitações (com filtros opcionais)
router.get('/', async (req, res) => {
  try {
    const { status, prioridade, setor } = req.query;
    let query = 'SELECT * FROM solicitacoes WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (prioridade) {
      query += ' AND prioridade = ?';
      params.push(prioridade);
    }
    if (setor) {
      query += ' AND setor = ?';
      params.push(setor);
    }

    query += ' ORDER BY data_criacao DESC';

    const [solicitacoes] = await global.db.execute(query, params);
    res.json(solicitacoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar solicitações' });
  }
});

// Atualizar status da solicitação
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, prioridade } = req.body;

    await global.db.execute(
      'UPDATE solicitacoes SET status = ?, prioridade = ? WHERE id = ?',
      [status, prioridade, id]
    );

    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
});

module.exports = router; 