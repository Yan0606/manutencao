import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SolicitacaoManutencao from './pages/SolicitacaoManutencao';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TecnicoDashboard from './pages/TecnicoDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SolicitacaoManutencao />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/tecnico/acesso/:token" element={<TecnicoDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 