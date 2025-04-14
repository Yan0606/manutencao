import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Configuração da API
const API_URL = 'http://172.16.100.98:3001';

export default function SolicitacaoManutencao() {
  const [formData, setFormData] = useState({
    nome_solicitante: '',
    setor: '',
    titulo: '',
    local: '',
    descricao: ''
  });

  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDeviceInfo = () => {
    const deviceInfo = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      touchPoints: navigator.maxTouchPoints,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        rtt: (navigator as any).connection.rtt,
        downlink: (navigator as any).connection.downlink
      } : null
    };
    return deviceInfo;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setMensagem(null);

    try {
      const deviceInfo = getDeviceInfo();
      const dataToSend = {
        ...formData,
        dispositivo_info: deviceInfo,
        user_agent: navigator.userAgent
      };

      await axios.post(`${API_URL}/api/solicitacoes`, dataToSend);
      setMensagem({
        tipo: 'sucesso',
        texto: 'Solicitação enviada com sucesso! Nossa equipe irá analisar seu pedido.'
      });
      setFormData({
        nome_solicitante: '',
        setor: '',
        titulo: '',
        local: '',
        descricao: ''
      });
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao enviar solicitação. Por favor, tente novamente.'
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo-anglo.jpg"
            alt="Logo Anglo"
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solicitar Manutenção
          </h1>
          <p className="text-lg text-gray-600">
            Preencha o formulário abaixo para solicitar um serviço de manutenção
          </p>
        </div>

        {/* Mensagem de Feedback */}
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

        {/* Formulário */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Nome do Solicitante */}
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="nome_solicitante" className="block text-sm font-medium text-gray-700">
                  Nome do Solicitante
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="nome_solicitante"
                    name="nome_solicitante"
                    required
                    value={formData.nome_solicitante}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* Setor */}
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="setor" className="block text-sm font-medium text-gray-700">
                  Setor
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="setor"
                    name="setor"
                    required
                    value={formData.setor}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Digite seu setor"
                  />
                </div>
              </div>

              {/* Título da Manutenção */}
              <div className="col-span-2">
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                  Título da Manutenção
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    required
                    value={formData.titulo}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Reparo no ar condicionado"
                  />
                </div>
              </div>

              {/* Local da Manutenção */}
              <div className="col-span-2">
                <label htmlFor="local" className="block text-sm font-medium text-gray-700">
                  Local da Manutenção
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="local"
                    name="local"
                    required
                    value={formData.local}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Sala dos professores"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="col-span-2">
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                  Descrição (opcional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="descricao"
                    name="descricao"
                    rows={4}
                    value={formData.descricao}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Descreva detalhes adicionais sobre o problema..."
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <Link
                to="/admin/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Entrar como administrador
              </Link>
              <button
                type="submit"
                disabled={enviando}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  enviando ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {enviando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Enviar Solicitação
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 