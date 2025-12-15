export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  dataAdmissao: string;
  cargo: string;
  setor: string;
  empresa: string;
  empresaId: string; // ID da empresa (para usuários terceiros)
  empresaNome?: string;
  status: 'ativo' | 'inativo' | 'afastado';
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  email?: string;
  telefone?: string;
}

// Tipo base de certificado (cadastro na tela de Certificados)
export interface TipoCertificadoBase {
  id: string;
  tipo: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

// Certificado vinculado a funcionário
export interface Certificado {
  id: string;
  funcionarioId: string;
  funcionarioNome?: string;
  tipo: string;
  numero: string;
  dataEmissao: string;
  dataValidade: string;
  orgaoEmissor: string;
  status: 'valido' | 'vencido' | 'em_renovacao';
  arquivoUrl?: string;
  arquivoNome?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export type NivelAcesso = 'administrador' | 'editor' | 'terceiro';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  nivelAcesso: NivelAcesso;
  empresaId?: string; // ID da empresa para usuários terceiros
  empresaNome?: string; // Nome da empresa para usuários terceiros
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissoesAcesso {
  podeVisualizarTodos: boolean;
  podeEditar: boolean;
  podeCriar: boolean;
  podeExcluir: boolean;
  podeGerenciarUsuarios: boolean;
  apenasPropriaEmpresa: boolean;
}

export interface DashboardStats {
  totalFuncionarios: number;
  funcionariosAtivos: number;
  totalCertificados: number;
  certificadosValidos: number;
  certificadosVencendo: number;
  certificadosVencidos: number;
  funcionariosRecentes: Funcionario[];
  certificadosVencendoLista: Array<Certificado & { diasRestantes: number }>;
  certificadosVencidosLista: Array<Certificado & { diasVencido: number }>;
}

export type TipoCertificado = 
  | 'ASO'
  | 'NR-10'
  | 'NR-35'
  | 'NR-33'
  | 'NR-12'
  | 'NR-18'
  | 'NR-20'
  | 'CIPA'
  | 'Integração'
  | 'Outro';