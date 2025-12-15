import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Users, Award, LayoutDashboard, LogOut, UserCog, Shield, Eye, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { logout, getCurrentUser, getPermissoes } from '@/lib/auth';
import { toast } from 'sonner';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const permissoes = currentUser ? getPermissoes(currentUser.nivelAcesso) : null;

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const getNivelAcessoIcon = () => {
    if (!currentUser) return null;
    switch (currentUser.nivelAcesso) {
      case 'administrador':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'editor':
        return <UserCog className="h-4 w-4 text-blue-600" />;
      case 'terceiro':
        return <Eye className="h-4 w-4 text-purple-600" />;
    }
  };

  const getNivelAcessoLabel = () => {
    if (!currentUser) return '';
    switch (currentUser.nivelAcesso) {
      case 'administrador':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      case 'terceiro':
        return 'Parceiro';
    }
  };

  // Usuários terceiros também podem ver funcionários (da própria empresa)
  const podeVerFuncionarios = permissoes?.podeVisualizarTodos || permissoes?.apenasPropriaEmpresa;
  const podeVerCertificados = permissoes?.podeVisualizarTodos || permissoes?.apenasPropriaEmpresa;
  const podeVerRelatorios = permissoes?.podeVisualizarTodos || permissoes?.apenasPropriaEmpresa;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="bg-red-600 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Sistema de Controle
                </span>
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                {podeVerFuncionarios && (
                  <Link
                    to="/funcionarios"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/funcionarios')
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Funcionários</span>
                  </Link>
                )}
                {podeVerCertificados && (
                  <Link
                    to="/certificados"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/certificados')
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Award className="h-4 w-4" />
                    <span>Certificados</span>
                  </Link>
                )}
                {podeVerRelatorios && (
                  <Link
                    to="/relatorios"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/relatorios')
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Relatórios</span>
                  </Link>
                )}
                {permissoes?.podeGerenciarUsuarios && (
                  <Link
                    to="/usuarios"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/usuarios')
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <UserCog className="h-4 w-4" />
                    <span>Usuários</span>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                {getNivelAcessoIcon()}
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{currentUser?.nome}</div>
                  <div className="text-xs text-gray-600">{getNivelAcessoLabel()}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}