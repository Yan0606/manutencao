import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Manutencao {
  id: number;
  titulo: string;
  local: string;
  setor: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'a_fazer' | 'em_andamento' | 'concluida';
  data_criacao: string;
}

interface ManutencoesPorStatus {
  a_fazer: Manutencao[];
  em_andamento: Manutencao[];
  concluida: Manutencao[];
}

export default function TecnicoDashboard() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [tecnico, setTecnico] = useState<{ nome: string; email: string } | null>(null);
  const [manutencoes, setManutencoes] = useState<ManutencoesPorStatus>({
    a_fazer: [],
    em_andamento: [],
    concluida: []
  });
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const validarAcesso = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/tecnicos/acesso/${token}`);
        setTecnico(response.data);
        await carregarManutencoes();
      } catch (error) {
        navigate('/');
      }
    };

    validarAcesso();
  }, [token, navigate]);

  const carregarManutencoes = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/tecnicos/manutencoes/${token}`);
      console.log('Dados recebidos:', response.data);
      setManutencoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao carregar manutenções. Por favor, tente novamente.'
      });
    }
  };

  const handleAtualizarStatus = async (id: number, novoStatus: 'a_fazer' | 'em_andamento' | 'concluida') => {
    try {
      await axios.patch(`http://localhost:3001/api/tecnicos/manutencoes/${token}/${id}/status`, {
        status: novoStatus
      });
      
      setMensagem({ 
        tipo: 'sucesso', 
        texto: `Manutenção atualizada para ${
          novoStatus === 'a_fazer' ? 'A Fazer' : 
          novoStatus === 'em_andamento' ? 'Em Andamento' : 
          'Concluída'
        }!` 
      });
      
      await carregarManutencoes();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Erro ao atualizar status da manutenção' 
      });
    }
  };

  const renderManutencao = (manutencao: Manutencao) => {
    const getPrioridadeColor = (prioridade: string) => {
      switch (prioridade) {
        case 'alta':
          return 'text-red-600 bg-red-50 border-red-100';
        case 'media':
          return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        case 'baixa':
          return 'text-green-600 bg-green-50 border-green-100';
        default:
          return 'text-gray-600 bg-gray-50 border-gray-100';
      }
    };

    return (
      <div key={manutencao.id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{manutencao.titulo}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPrioridadeColor(manutencao.prioridade)}`}>
                  {manutencao.prioridade.charAt(0).toUpperCase() + manutencao.prioridade.slice(1)}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                  {manutencao.setor}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">
                {new Date(manutencao.data_criacao).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-600">{manutencao.local}</p>
            </div>
            {manutencao.descricao && (
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <p className="text-sm text-gray-600">{manutencao.descricao}</p>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {manutencao.status === 'a_fazer' && (
              <button
                onClick={() => handleAtualizarStatus(manutencao.id, 'em_andamento')}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Iniciar Manutenção
              </button>
            )}
            {manutencao.status === 'em_andamento' && (
              <>
                <button
                  onClick={() => handleAtualizarStatus(manutencao.id, 'concluida')}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Concluir Manutenção
                </button>
                <button
                  onClick={() => handleAtualizarStatus(manutencao.id, 'a_fazer')}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 border border-blue-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                  Voltar para "A Fazer"
                </button>
              </>
            )}
            {manutencao.status === 'concluida' && (
              <button
                onClick={() => handleAtualizarStatus(manutencao.id, 'em_andamento')}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 border border-green-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
                Voltar para "Em Andamento"
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!tecnico) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img 
                src="/logo-anglo.jpg" 
                alt="Logo Anglo" 
                className="h-8 w-auto mr-3"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Painel de Manutenção
              </h1>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Bem-vindo,</span>
                <span className="text-sm font-medium text-gray-900">{tecnico.nome}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 mr-1 bg-green-400 rounded-full"></span>
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Mensagem de feedback */}
        {mensagem && (
          <div className={`mb-6 rounded-lg border ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          } p-4`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {mensagem.tipo === 'sucesso' ? (
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{mensagem.texto}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
          {/* Card - A Fazer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">A Fazer</h2>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-sm font-medium text-gray-800">
                  {manutencoes.a_fazer.length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {manutencoes.a_fazer.map(renderManutencao)}
              {manutencoes.a_fazer.length === 0 && (
                <div className="text-center py-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Nenhuma manutenção pendente</p>
                </div>
              )}
            </div>
          </div>

          {/* Card - Em Andamento */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-blue-900">Em Andamento</h2>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-sm font-medium text-blue-800">
                  {manutencoes.em_andamento.length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {manutencoes.em_andamento.map(renderManutencao)}
              {manutencoes.em_andamento.length === 0 && (
                <div className="text-center py-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Nenhuma manutenção em andamento</p>
                </div>
              )}
            </div>
          </div>

          {/* Card - Concluídas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-green-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-green-900">Concluídas</h2>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-200 text-sm font-medium text-green-800">
                  {manutencoes.concluida.length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {manutencoes.concluida.map(renderManutencao)}
              {manutencoes.concluida.length === 0 && (
                <div className="text-center py-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Nenhuma manutenção concluída</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 