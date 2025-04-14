import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Solicitacao {
  id: number;
  nome_solicitante: string;
  setor: string;
  titulo: string;
  local: string;
  descricao: string;
  status: string;
  prioridade: string;
  data_criacao: string;
  data_conclusao?: string;
  dispositivo_info?: {
    platform: string;
    userAgent: string;
    language: string;
    screenWidth: number;
    screenHeight: number;
    devicePixelRatio: number;
    touchPoints: number;
    connection?: {
      effectiveType: string;
      rtt: number;
      downlink: number;
    };
  };
  user_agent?: string;
  ip_address?: string;
}

interface Tecnico {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  token: string;
  ativo: boolean;
}

// Configuração da API
const API_URL = 'http://172.16.100.98:3001';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [novoTecnico, setNovoTecnico] = useState({
    nome: '',
    telefone: '',
    email: ''
  });
  const [tecnicoEmEdicao, setTecnicoEmEdicao] = useState<Tecnico | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [prioridadeSelecionada, setPrioridadeSelecionada] = useState<{ [key: number]: string }>({});
  const [mostrarInfoDispositivo, setMostrarInfoDispositivo] = useState<number | null>(null);
  const [expandedDevices, setExpandedDevices] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    carregarDados();
  }, [navigate]);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [solicitacoesRes, tecnicosRes] = await Promise.all([
        axios.get(`${API_URL}/api/solicitacoes`, config),
        axios.get(`${API_URL}/api/admin/tecnicos`, config)
      ]);

      setSolicitacoes(solicitacoesRes.data);
      setTecnicos(tecnicosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleAprovarSolicitacao = async (id: number) => {
    if (!prioridadeSelecionada[id]) {
      setMensagem({ tipo: 'erro', texto: 'Selecione uma prioridade antes de aprovar' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/admin/solicitacoes/${id}`,
        { status: 'aprovada', prioridade: prioridadeSelecionada[id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMensagem({ tipo: 'sucesso', texto: 'Solicitação aprovada com sucesso!' });
      carregarDados();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao aprovar solicitação' });
    }
  };

  const handleReprovarSolicitacao = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensagem({ tipo: 'erro', texto: 'Token de autenticação não encontrado' });
        return;
      }

      console.log('Tentando reprovar solicitação:', id);

      const response = await axios.patch(
        `${API_URL}/api/admin/solicitacoes/${id}`,
        { status: 'reprovada' },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Resposta da reprovação:', response.data);
      
      setMensagem({ tipo: 'sucesso', texto: 'Solicitação reprovada' });
      carregarDados();
    } catch (error) {
      console.error('Erro ao reprovar solicitação:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Detalhes do erro:', error.response.data);
          setMensagem({ 
            tipo: 'erro', 
            texto: error.response.data.message || 'Erro ao reprovar solicitação' 
          });
        } else {
          setMensagem({ 
            tipo: 'erro', 
            texto: 'Erro de conexão com o servidor' 
          });
        }
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao reprovar solicitação' });
      }
    }
  };

  const handleCadastrarTecnico = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/admin/tecnicos`,
        novoTecnico,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensagem({
        tipo: 'sucesso',
        texto: `Técnico cadastrado com sucesso! Link de acesso: ${response.data.tecnico.link_acesso}`
      });
      setNovoTecnico({ nome: '', telefone: '', email: '' });
      carregarDados();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao cadastrar técnico' });
    }
  };

  const handleEditarTecnico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tecnicoEmEdicao) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/admin/tecnicos/${tecnicoEmEdicao.id}`,
        {
          nome: tecnicoEmEdicao.nome,
          telefone: tecnicoEmEdicao.telefone,
          email: tecnicoEmEdicao.email
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensagem({ tipo: 'sucesso', texto: 'Técnico atualizado com sucesso!' });
      setTecnicoEmEdicao(null);
      carregarDados();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao atualizar técnico' });
    }
  };

  const handleExcluirTecnico = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir o técnico? Esta ação é irreversível.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${API_URL}/api/admin/tecnicos/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMensagem({ tipo: 'sucesso', texto: 'Técnico excluído com sucesso!' });
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir técnico:', error);
        setMensagem({ tipo: 'erro', texto: 'Erro ao excluir técnico' });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Solicitações Pendentes</h3>
        <div className="text-3xl font-bold text-blue-600">
          {solicitacoes.filter(s => s.status === 'pendente').length}
        </div>
        <p className="text-sm text-gray-500 mt-2">Aguardando aprovação</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Aprovadas</h3>
        <div className="text-3xl font-bold text-indigo-600">
          {solicitacoes.filter(s => s.status === 'aprovada').length}
        </div>
        <p className="text-sm text-gray-500 mt-2">Aguardando início</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Em Andamento</h3>
        <div className="text-3xl font-bold text-yellow-600">
          {solicitacoes.filter(s => s.status === 'em_andamento').length}
        </div>
        <p className="text-sm text-gray-500 mt-2">Em execução</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Concluídas</h3>
        <div className="text-3xl font-bold text-green-600">
          {solicitacoes.filter(s => s.status === 'concluida').length}
        </div>
        <p className="text-sm text-gray-500 mt-2">Finalizadas</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Técnicos Ativos</h3>
        <div className="text-3xl font-bold text-purple-600">
          {tecnicos.filter(t => t.ativo).length}
        </div>
        <p className="text-sm text-gray-500 mt-2">Disponíveis</p>
      </div>
    </div>
  );

  const renderSolicitacoes = () => {
    const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'pendente');
    const solicitacoesEmAndamento = solicitacoes.filter(s => s.status === 'em_andamento');
    const solicitacoesConcluidas = solicitacoes.filter(s => s.status === 'concluida');

    const getPrioridadeDisplay = (prioridade: string | null) => {
      if (!prioridade) return 'Não definida';
      return prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
    };

    const renderInfoDispositivo = (solicitacao: Solicitacao) => {
      if (!solicitacao.dispositivo_info && !solicitacao.ip_address) return null;

      const isExpanded = expandedDevices[solicitacao.id] || false;
      const toggleExpand = () => {
        setExpandedDevices(prev => ({
          ...prev,
          [solicitacao.id]: !prev[solicitacao.id]
        }));
      };

      // Filtra apenas informações não vazias
      const getDeviceInfo = () => {
        const info: { label: string; value: string }[] = [];
        
        if (solicitacao.ip_address) {
          info.push({ label: 'IP', value: solicitacao.ip_address });
        }

        if (solicitacao.dispositivo_info) {
          const { platform, screenWidth, screenHeight, connection } = solicitacao.dispositivo_info;
          
          if (platform) {
            info.push({ label: 'Plataforma', value: platform });
          }
          if (screenWidth && screenHeight) {
            info.push({ label: 'Resolução', value: `${screenWidth}x${screenHeight}` });
          }
          if (connection?.effectiveType) {
            info.push({ label: 'Conexão', value: connection.effectiveType });
          }
        }

        return info;
      };

      const deviceInfo = getDeviceInfo();
      if (deviceInfo.length === 0) return null;

      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm text-gray-700">
              Informações do Dispositivo
            </h4>
            {deviceInfo.length > 1 && (
              <button
                onClick={toggleExpand}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600 space-y-1 mt-2">
            {/* Sempre mostra o IP */}
            {deviceInfo[0] && (
              <p>
                <span className="font-medium">{deviceInfo[0].label}:</span> {deviceInfo[0].value}
              </p>
            )}
            
            {/* Mostra informações adicionais quando expandido */}
            {isExpanded && deviceInfo.slice(1).map((info, index) => (
              <p key={index}>
                <span className="font-medium">{info.label}:</span> {info.value}
              </p>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solicitações Pendentes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-600 mb-4">
            Pendentes ({solicitacoesPendentes.length})
          </h2>
          <div className="space-y-4">
            {solicitacoesPendentes.map(solicitacao => (
              <div key={solicitacao.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{solicitacao.titulo}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(solicitacao.data_criacao).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{solicitacao.descricao}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {solicitacao.setor}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {solicitacao.local}
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={prioridadeSelecionada[solicitacao.id] || ''}
                    onChange={(e) => setPrioridadeSelecionada({
                      ...prioridadeSelecionada,
                      [solicitacao.id]: e.target.value
                    })}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Selecione a prioridade</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                  <button
                    onClick={() => handleAprovarSolicitacao(solicitacao.id)}
                    disabled={!prioridadeSelecionada[solicitacao.id]}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      prioridadeSelecionada[solicitacao.id]
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleReprovarSolicitacao(solicitacao.id)}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Reprovar
                  </button>
                </div>
                {renderInfoDispositivo(solicitacao)}
              </div>
            ))}
            {solicitacoesPendentes.length === 0 && (
              <p className="text-sm text-gray-500 text-center">Nenhuma solicitação pendente</p>
            )}
          </div>
        </div>

        {/* Solicitações Em Andamento */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-yellow-600 mb-4">
            Em Andamento ({solicitacoesEmAndamento.length})
          </h2>
          <div className="space-y-4">
            {solicitacoesEmAndamento.map(solicitacao => (
              <div key={solicitacao.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{solicitacao.titulo}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(solicitacao.data_criacao).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{solicitacao.descricao}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {solicitacao.setor}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {solicitacao.local}
                  </span>
                  {solicitacao.prioridade && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      solicitacao.prioridade === 'alta' 
                        ? 'bg-red-100 text-red-800' 
                        : solicitacao.prioridade === 'media'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      Prioridade {getPrioridadeDisplay(solicitacao.prioridade)}
                    </span>
                  )}
                </div>
                {renderInfoDispositivo(solicitacao)}
              </div>
            ))}
            {solicitacoesEmAndamento.length === 0 && (
              <p className="text-sm text-gray-500 text-center">Nenhuma solicitação em andamento</p>
            )}
          </div>
        </div>

        {/* Solicitações Concluídas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-green-600 mb-4">
            Concluídas ({solicitacoesConcluidas.length})
          </h2>
          <div className="space-y-4">
            {solicitacoesConcluidas.map(solicitacao => (
              <div key={solicitacao.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{solicitacao.titulo}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(solicitacao.data_criacao).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{solicitacao.descricao}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {solicitacao.setor}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {solicitacao.local}
                  </span>
                  {solicitacao.prioridade && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      solicitacao.prioridade === 'alta' 
                        ? 'bg-red-100 text-red-800' 
                        : solicitacao.prioridade === 'media'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      Prioridade {getPrioridadeDisplay(solicitacao.prioridade)}
                    </span>
                  )}
                </div>
                {renderInfoDispositivo(solicitacao)}
              </div>
            ))}
            {solicitacoesConcluidas.length === 0 && (
              <p className="text-sm text-gray-500 text-center">Nenhuma solicitação concluída</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTecnicos = () => (
    <div className="grid grid-cols-1 gap-6">
      {tecnicoEmEdicao && (
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <svg 
              className="w-6 h-6 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
            Editar Técnico
          </h2>
          <form onSubmit={handleEditarTecnico} className="space-y-4">
            <div>
              <label htmlFor="edit-nome" className="block text-sm font-medium text-blue-100">
                Nome
              </label>
              <input
                type="text"
                id="edit-nome"
                value={tecnicoEmEdicao.nome}
                onChange={(e) => setTecnicoEmEdicao({ ...tecnicoEmEdicao, nome: e.target.value })}
                className="mt-1 block w-full rounded-md bg-blue-700/50 border-blue-600 text-white placeholder-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-telefone" className="block text-sm font-medium text-blue-100">
                Telefone
              </label>
              <input
                type="tel"
                id="edit-telefone"
                value={tecnicoEmEdicao.telefone}
                onChange={(e) => setTecnicoEmEdicao({ ...tecnicoEmEdicao, telefone: e.target.value })}
                className="mt-1 block w-full rounded-md bg-blue-700/50 border-blue-600 text-white placeholder-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-blue-100">
                Email
              </label>
              <input
                type="email"
                id="edit-email"
                value={tecnicoEmEdicao.email}
                onChange={(e) => setTecnicoEmEdicao({ ...tecnicoEmEdicao, email: e.target.value })}
                className="mt-1 block w-full rounded-md bg-blue-700/50 border-blue-600 text-white placeholder-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-900 bg-blue-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-blue-100 transition-all duration-200"
              >
                Salvar Alterações
              </button>
              <button
                type="button"
                onClick={() => setTecnicoEmEdicao(null)}
                className="flex-1 py-2 px-4 border border-blue-100 rounded-md shadow-sm text-sm font-medium text-blue-100 bg-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-blue-100 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleExcluirTecnico(tecnicoEmEdicao.id)}
                className="flex-1 py-2 px-4 border border-red-100 rounded-md shadow-sm text-sm font-medium text-red-100 bg-transparent hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-red-100 transition-all duration-200"
              >
                <svg 
                  className="w-4 h-4 mr-1.5 inline-block" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
                Excluir Técnico
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg 
            className="w-6 h-6 mr-2 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
            />
          </svg>
          Cadastrar Novo Técnico
        </h2>
        <form onSubmit={handleCadastrarTecnico} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              value={novoTecnico.nome}
              onChange={(e) => setNovoTecnico({ ...novoTecnico, nome: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              value={novoTecnico.telefone}
              onChange={(e) => setNovoTecnico({ ...novoTecnico, telefone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={novoTecnico.email}
              onChange={(e) => setNovoTecnico({ ...novoTecnico, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            Cadastrar Técnico
          </button>
        </form>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg 
            className="w-6 h-6 mr-2 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          Técnicos Cadastrados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tecnicos.map(tecnico => (
            <div key={tecnico.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 hidden [@media(min-width:425px)]:block">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <svg 
                      className="w-8 h-8 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg text-gray-900">{tecnico.nome}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {tecnico.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {tecnico.telefone}
                  </p>
                  <div className="mt-2 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tecnico.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className={`w-2 h-2 mr-1 rounded-full ${
                        tecnico.ativo 
                          ? 'bg-green-400' 
                          : 'bg-gray-400'
                      }`}></span>
                      {tecnico.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex flex-col space-y-3">
                    <p className="text-sm text-gray-500">
                      Link de acesso:
                      <a 
                        href={`/tecnico/acesso/${tecnico.token}`} 
                        className="ml-1 text-blue-600 hover:text-blue-800 break-all hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {window.location.origin}/tecnico/acesso/{tecnico.token}
                      </a>
                    </p>
                    <button
                      onClick={() => setTecnicoEmEdicao(tecnico)}
                      className="inline-flex items-center justify-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <svg 
                        className="w-4 h-4 mr-1.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                        />
                      </svg>
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {tecnicos.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 italic">Nenhum técnico cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-blue-800 shadow-lg flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-blue-700 px-2 bg-blue-900">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo-anglo.jpg" 
              alt="Logo Anglo" 
              className="h-10 w-auto object-contain"
            />
            <h1 className="hidden md:block text-xl font-semibold text-white">Painel Admin</h1>
          </div>
        </div>
        <nav className="mt-6 flex-1">
          <div className="px-2 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-center md:justify-start space-x-2 px-4 py-3 text-sm rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-lg ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              <span className="hidden md:block">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('solicitacoes')}
              className={`w-full flex items-center justify-center md:justify-start space-x-2 px-4 py-3 text-sm rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-lg ${
                activeTab === 'solicitacoes' 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
                />
              </svg>
              <span className="hidden md:block">Solicitações</span>
            </button>
            <button
              onClick={() => setActiveTab('tecnicos')}
              className={`w-full flex items-center justify-center md:justify-start space-x-2 px-4 py-3 text-sm rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-lg ${
                activeTab === 'tecnicos' 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              <span className="hidden md:block">Técnicos</span>
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center md:justify-start space-x-2 px-4 py-2 text-sm text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            <span className="hidden md:block">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {mensagem && (
            <div className={`mb-4 rounded-md p-4 ${
              mensagem.tipo === 'sucesso' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <p className="text-sm">{mensagem.texto}</p>
            </div>
          )}

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'solicitacoes' && renderSolicitacoes()}
          {activeTab === 'tecnicos' && renderTecnicos()}
        </main>
      </div>
    </div>
  );
} 