import { supabase } from './supabase';
import { Funcionario, Certificado, DashboardStats } from '@/types';

// --- FUNCIONÁRIOS ---

export async function getFuncionarios() {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar funcionários:', error);
    return [];
  }
  
  return data.map((f: any) => ({
    ...f,
    dataNascimento: f.data_nascimento,
    dataAdmissao: f.data_admissao,
    createdAt: f.created_at,
    updatedAt: f.updated_at
  }));
}

export async function addFuncionario(dados: any) {
  const dbPayload = {
    nome: dados.nome,
    cpf: dados.cpf,
    rg: dados.rg,
    data_nascimento: dados.dataNascimento,
    data_admissao: dados.dataAdmissao,
    cargo: dados.cargo,
    setor: dados.setor,
    empresa: dados.empresa,
    status: dados.status,
    email: dados.email,
    telefone: dados.telefone,
    observacoes: dados.observacoes
  };

  const { error } = await supabase.from('funcionarios').insert([dbPayload]);
  if (error) throw error;
}

export async function updateFuncionario(id: string, dados: any) {
  const dbPayload: any = { ...dados };
  if (dados.dataNascimento) dbPayload.data_nascimento = dados.dataNascimento;
  if (dados.dataAdmissao) dbPayload.data_admissao = dados.dataAdmissao;
  delete dbPayload.id; 
  
  const { error } = await supabase.from('funcionarios').update(dbPayload).eq('id', id);
  if (error) throw error;
}

export async function deleteFuncionario(id: string) {
  const { error } = await supabase.from('funcionarios').delete().eq('id', id);
  if (error) throw error;
}

// --- CERTIFICADOS ---

export async function getCertificados() {
  const { data, error } = await supabase
    .from('certificados')
    .select('*, funcionarios(nome)');
    
  if (error) {
    console.error(error);
    return [];
  }

  return data.map((c: any) => ({
    ...c,
    funcionarioId: c.funcionario_id,
    funcionarioNome: c.funcionarios?.nome || 'Desconhecido',
    dataEmissao: c.data_emissao,
    dataValidade: c.data_validade,
    orgaoEmissor: c.orgao_emissor,
    createdAt: c.created_at
  }));
}

export async function addCertificado(dados: any) {
  const dbPayload = {
    funcionario_id: dados.funcionarioId,
    tipo: dados.tipo,
    numero: dados.numero,
    data_emissao: dados.dataEmissao,
    data_validade: dados.dataValidade,
    orgao_emissor: dados.orgaoEmissor,
    status: dados.status,
    observacoes: dados.observacoes
  };

  const { error } = await supabase.from('certificados').insert([dbPayload]);
  if (error) throw error;
}

export async function updateCertificado(id: string, dados: any) {
  const dbPayload: any = { ...dados };
  if (dados.funcionarioId) dbPayload.funcionario_id = dados.funcionarioId;
  if (dados.dataEmissao) dbPayload.data_emissao = dados.dataEmissao;
  if (dados.dataValidade) dbPayload.data_validade = dados.dataValidade;
  if (dados.orgaoEmissor) dbPayload.orgao_emissor = dados.orgaoEmissor;
  delete dbPayload.id;
  delete dbPayload.funcionarioNome;

  const { error } = await supabase.from('certificados').update(dbPayload).eq('id', id);
  if (error) throw error;
}

export async function deleteCertificado(id: string) {
  const { error } = await supabase.from('certificados').delete().eq('id', id);
  if (error) throw error;
}

// --- DASHBOARD ---

export async function getDashboardStats(): Promise<DashboardStats> {
  const funcionarios = await getFuncionarios();
  const certificados = await getCertificados();
  
  const hoje = new Date();
  const em30Dias = new Date();
  em30Dias.setDate(hoje.getDate() + 30);

  return {
    totalFuncionarios: funcionarios.length,
    funcionariosAtivos: funcionarios.filter((f: any) => f.status === 'ativo').length,
    totalCertificados: certificados.length,
    certificadosValidos: certificados.filter((c: any) => new Date(c.dataValidade) >= hoje).length,
    certificadosVencendo: certificados.filter((c: any) => {
      const dv = new Date(c.dataValidade);
      return dv >= hoje && dv <= em30Dias;
    }).length,
    certificadosVencidos: certificados.filter((c: any) => new Date(c.dataValidade) < hoje).length,
    
    funcionariosRecentes: funcionarios.slice(0, 5),
    
    certificadosVencendoLista: certificados
      .filter((c: any) => {
        const dv = new Date(c.dataValidade);
        return dv >= hoje && dv <= em30Dias;
      })
      .map((c: any) => ({
        ...c,
        diasRestantes: Math.ceil((new Date(c.dataValidade).getTime() - hoje.getTime()) / (86400000))
      }))
      .slice(0, 5),
      
    certificadosVencidosLista: certificados
      .filter((c: any) => new Date(c.dataValidade) < hoje)
      .map((c: any) => ({
        ...c,
        diasVencido: Math.ceil((hoje.getTime() - new Date(c.dataValidade).getTime()) / (86400000))
      }))
      .slice(0, 5)
  };
}

// Mantendo função vazia para não quebrar compatibilidade
export function initializeDefaultData() {}