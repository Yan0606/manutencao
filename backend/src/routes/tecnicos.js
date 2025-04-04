const express = require('express');
const router = express.Router();

// Middleware para validar token do técnico
const validarTokenTecnico = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    const [tecnicos] = await global.db.execute(
      'SELECT * FROM tecnicos WHERE token = ? AND ativo = TRUE',
      [token]
    );

    if (tecnicos.length === 0) {
      return res.status(401).json({ message: 'Token inválido ou técnico inativo' });
    }

    req.tecnico = tecnicos[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Erro na validação do token' });
  }
};

// Validar acesso do técnico
router.get('/acesso/:token', validarTokenTecnico, async (req, res) => {
  const { id, nome, email } = req.tecnico;
  res.json({ id, nome, email });
});

// Listar manutenções do técnico
router.get('/manutencoes/:token', validarTokenTecnico, async (req, res) => {
  try {
    const [manutencoes] = await global.db.execute(
      `SELECT 
        id, titulo, descricao, local, setor, prioridade, status, 
        DATE_FORMAT(data_criacao, '%Y-%m-%dT%H:%i:%s.000Z') as data_criacao
       FROM solicitacoes 
       WHERE status IN ('aprovada', 'em_andamento', 'concluida')
       ORDER BY 
         CASE 
           WHEN status = 'aprovada' AND prioridade = 'alta' THEN 1
           WHEN status = 'aprovada' AND prioridade = 'media' THEN 2
           WHEN status = 'aprovada' AND prioridade = 'baixa' THEN 3
           WHEN status = 'em_andamento' THEN 4
           WHEN status = 'concluida' THEN 5
         END,
         data_criacao DESC`
    );

    // Converter o status 'aprovada' para 'a_fazer'
    const manutencoesMapeadas = manutencoes.map(m => ({
      id: m.id,
      titulo: m.titulo,
      descricao: m.descricao,
      local: m.local,
      setor: m.setor,
      prioridade: m.prioridade,
      status: m.status === 'aprovada' ? 'a_fazer' : m.status,
      data_criacao: m.data_criacao
    }));

    // Agrupar por status
    const resultado = {
      a_fazer: manutencoesMapeadas.filter(m => m.status === 'a_fazer') || [],
      em_andamento: manutencoesMapeadas.filter(m => m.status === 'em_andamento') || [],
      concluida: manutencoesMapeadas.filter(m => m.status === 'concluida') || []
    };

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar manutenções:', error);
    res.status(500).json({ message: 'Erro ao buscar manutenções' });
  }
});

// Atualizar status da manutenção
router.patch('/manutencoes/:token/:id/status', validarTokenTecnico, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Mapear status do frontend para o banco
    const statusBanco = status === 'a_fazer' ? 'aprovada' : status;

    await global.db.execute(
      'UPDATE solicitacoes SET status = ? WHERE id = ?',
      [statusBanco, id]
    );

    res.json({ message: 'Status da manutenção atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ message: 'Erro ao atualizar status da manutenção' });
  }
});

module.exports = router; 