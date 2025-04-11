import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminProfile() {
  const [admin, setAdmin] = useState({
    nome: '',
    email: '',
  });
  const [novoEmail, setNovoEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      const parsedData = JSON.parse(adminData);
      setAdmin(parsedData);
      setNovoEmail(parsedData.email);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setMensagem('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:3001/api/admin/perfil',
        { email: novoEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAdmin(response.data);
      localStorage.setItem('adminData', JSON.stringify(response.data));
      setMensagem('Email atualizado com sucesso!');
    } catch (error) {
      setErro('Erro ao atualizar email. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleRecuperarSenha = async () => {
    setCarregando(true);
    setErro('');
    setMensagem('');

    try {
      const response = await axios.post('http://localhost:3001/api/admin/recuperar-senha', {
        email: admin.email
      });

      setMensagem('Email de recuperação enviado com sucesso!');
    } catch (error) {
      setErro('Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Perfil do Administrador
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Gerencie suas informações pessoais
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Nome:</span> {admin.nome}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Email atual:</span> {admin.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Novo Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {mensagem && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{mensagem}</p>
                  </div>
                </div>
              </div>
            )}

            {erro && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{erro}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={carregando}
                className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {carregando ? 'Atualizando...' : 'Atualizar Email'}
              </button>

              <button
                type="button"
                onClick={handleRecuperarSenha}
                disabled={carregando}
                className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Recuperar Senha
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 