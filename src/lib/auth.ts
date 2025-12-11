import { Usuario, NivelAcesso, PermissoesAcesso } from '@/types';

const STORAGE_KEY = 'usuarios';
const CURRENT_USER_KEY = 'currentUser';

export function initializeUsers(): void {
  const usuarios = getUsuarios();
  
  if (usuarios.length === 0) {
    const adminPadrao: Usuario = {
      id: '1',
      nome: 'Administrador',
      email: 'admin@sistema.com',
      senha: 'admin123',
      nivelAcesso: 'administrador',
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([adminPadrao]));
  }
}

export function getUsuarios(): Usuario[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function login(email: string, senha: string): Usuario | null {
  const usuarios = getUsuarios();
  const usuario = usuarios.find(
    (u) => u.email === email && u.senha === senha && u.ativo
  );

  if (usuario) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));
    return usuario;
  }

  return null;
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): Usuario | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function getPermissoes(nivelAcesso: NivelAcesso): PermissoesAcesso {
  switch (nivelAcesso) {
    case 'administrador':
      return {
        podeVisualizarTodos: true,
        podeEditar: true,
        podeCriar: true,
        podeExcluir: true,
        podeGerenciarUsuarios: true,
        apenasProprioRegistro: false,
      };
    case 'editor':
      return {
        podeVisualizarTodos: true,
        podeEditar: true,
        podeCriar: true,
        podeExcluir: false,
        podeGerenciarUsuarios: false,
        apenasProprioRegistro: false,
      };
    case 'terceiro':
      return {
        podeVisualizarTodos: false,
        podeEditar: false,
        podeCriar: false,
        podeExcluir: false,
        podeGerenciarUsuarios: false,
        apenasProprioRegistro: true,
      };
    default:
      return {
        podeVisualizarTodos: false,
        podeEditar: false,
        podeCriar: false,
        podeExcluir: false,
        podeGerenciarUsuarios: false,
        apenasProprioRegistro: false,
      };
  }
}