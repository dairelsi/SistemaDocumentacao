import { supabase } from './supabase';
import { Usuario, NivelAcesso, PermissoesAcesso } from '@/types';

const CURRENT_USER_KEY = 'currentUser';

export async function login(email: string, senha: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('senha', senha) 
    .eq('ativo', true)
    .single();

  if (error || !data) return null;

  const usuario: Usuario = {
    ...data,
    nivelAcesso: data.nivel_acesso,
    funcionarioVinculadoId: data.funcionario_vinculado_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));
  return usuario;
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
    case 'administrador': return { podeVisualizarTodos: true, podeEditar: true, podeCriar: true, podeExcluir: true, podeGerenciarUsuarios: true, apenasProprioRegistro: false };
    case 'editor': return { podeVisualizarTodos: true, podeEditar: true, podeCriar: true, podeExcluir: false, podeGerenciarUsuarios: false, apenasProprioRegistro: false };
    case 'terceiro': return { podeVisualizarTodos: false, podeEditar: false, podeCriar: false, podeExcluir: false, podeGerenciarUsuarios: false, apenasProprioRegistro: true };
    default: return { podeVisualizarTodos: false, podeEditar: false, podeCriar: false, podeExcluir: false, podeGerenciarUsuarios: false, apenasProprioRegistro: false };
  }
}

export function initializeUsers() {}