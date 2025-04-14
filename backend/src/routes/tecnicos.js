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
    console.log('Buscando manutenções...');
    const [manutencoes] = await global.db.execute(
      `SELECT 
        id, titulo, descricao, local, setor, prioridade, status, 
        DATE_FORMAT(data_criacao, '%Y-%m-%dT%H:%i:%s.000Z') as data_criacao
       FROM solicitacoes 
       WHERE status IN ('aprovada', 'em_andamento', 'concluida')
       ORDER BY 
         CASE 
           WHEN prioridade = 'alta' THEN 1
           WHEN prioridade = 'media' THEN 2
           WHEN prioridade = 'baixa' THEN 3
           ELSE 4
         END,
         data_criacao DESC`
    );

    console.log('Manutenções encontradas:', manutencoes);

    // Agrupar manutenções por status
    const resultado = {
      a_fazer: manutencoes.filter(m => m.status === 'aprovada').map(m => ({
        ...m,
        status: 'a_fazer'
      })),
      em_andamento: manutencoes.filter(m => m.status === 'em_andamento'),
      concluida: manutencoes.filter(m => m.status === 'concluida')
    };

    console.log('Resultado agrupado:', resultado);

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

    console.log('Tentativa de atualização de status:', { id, status });

    // Verificar se a solicitação existe
    const [solicitacao] = await global.db.execute(
      'SELECT * FROM solicitacoes WHERE id = ?',
      [id]
    );

    console.log('Solicitação encontrada:', solicitacao[0]);

    if (solicitacao.length === 0) {
      console.log('Solicitação não encontrada:', id);
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    // Mapear status do frontend para o banco
    let statusBanco = 'aprovada';
    if (status === 'em_andamento') {
      statusBanco = 'em_andamento';
    } else if (status === 'concluida') {
      statusBanco = 'concluida';
    }
    
    console.log('Status mapeado:', { original: status, mapeado: statusBanco });

    // Atualizar o status
    console.log('Executando query de atualização...');
    const query = 'UPDATE solicitacoes SET status = ? WHERE id = ?';
    const values = [statusBanco, id];
    console.log('Query:', query);
    console.log('Values:', values);

    const [result] = await global.db.execute(query, values);
    console.log('Resultado da atualização:', result);

    if (result.affectedRows === 0) {
      console.log('Nenhuma linha afetada');
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    // Buscar a solicitação atualizada para confirmar
    const [solicitacaoAtualizada] = await global.db.execute(
      'SELECT * FROM solicitacoes WHERE id = ?',
      [id]
    );
    console.log('Solicitação após atualização:', solicitacaoAtualizada[0]);

    res.json({ 
      message: 'Status da manutenção atualizado com sucesso',
      solicitacao: solicitacaoAtualizada[0]
    });
  } catch (error) {
    console.error('Erro detalhado ao atualizar status:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Erro ao atualizar status da manutenção',
      error: error.message 
    });
  }
});

module.exports = router; 