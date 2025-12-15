import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Funcionarios from './pages/Funcionarios';
import Certificados from './pages/Certificados';
import Usuarios from './pages/Usuarios';
import MeuCadastro from './pages/MeuCadastro';
import Relatorios from './pages/Relatorios';
import { isAuthenticated } from './lib/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="funcionarios" element={<Funcionarios />} />
          <Route path="certificados" element={<Certificados />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="meu-cadastro" element={<MeuCadastro />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;