import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const adminData = localStorage.getItem('adminData');

  if (!token || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  // Verificar se o token expirou
  try {
    const admin = JSON.parse(adminData);
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const exp = tokenData.exp * 1000; // Converter para milissegundos

    if (Date.now() > exp) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('adminData');
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
} 