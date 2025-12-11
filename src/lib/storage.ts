import { Funcionario, Certificado } from '@/types';

const FUNCIONARIOS_KEY = 'funcionarios';
const CERTIFICADOS_KEY = 'certificados';

// Funcionários
export function getFuncionarios(): Funcionario[] {
  const data = localStorage.getItem(FUNCIONARIOS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getFuncionarioById(id: string): Funcionario | undefined {
  const funcionarios = getFuncionarios();
  return funcionarios.find(f => f.id === id);
}

export function addFuncionario(funcionario: Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>): Funcionario {
  const funcionarios = getFuncionarios();
  const novoFuncionario: Funcionario = {
    ...funcionario,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  funcionarios.push(novoFuncionario);
  localStorage.setItem(FUNCIONARIOS_KEY, JSON.stringify(funcionarios));
  return novoFuncionario;
}

export function updateFuncionario(id: string, dados: Partial<Funcionario>): Funcionario | null {
  const funcionarios = getFuncionarios();
  const index = funcionarios.findIndex(f => f.id === id);
  
  if (index === -1) return null;
  
  funcionarios[index] = { 
    ...funcionarios[index], 
    ...dados,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(FUNCIONARIOS_KEY, JSON.stringify(funcionarios));
  return funcionarios[index];
}

export function deleteFuncionario(id: string): boolean {
  const funcionarios = getFuncionarios();
  const filtered = funcionarios.filter(f => f.id !== id);
  
  if (filtered.length === funcionarios.length) return false;
  
  localStorage.setItem(FUNCIONARIOS_KEY, JSON.stringify(filtered));
  
  // Remover certificados associados
  const certificados = getCertificados();
  const certFiltrados = certificados.filter(c => c.funcionarioId !== id);
  localStorage.setItem(CERTIFICADOS_KEY, JSON.stringify(certFiltrados));
  
  return true;
}

export function saveFuncionarios(funcionarios: Funcionario[]): void {
  localStorage.setItem(FUNCIONARIOS_KEY, JSON.stringify(funcionarios));
}

// Certificados
export function getCertificados(): Certificado[] {
  const data = localStorage.getItem(CERTIFICADOS_KEY);
  const certificados = data ? JSON.parse(data) : [];
  
  // Adicionar nome do funcionário
  return certificados.map((c: Certificado) => {
    const funcionario = getFuncionarioById(c.funcionarioId);
    return {
      ...c,
      funcionarioNome: funcionario?.nome || 'Desconhecido',
    };
  });
}

export function getCertificadosByFuncionario(funcionarioId: string): Certificado[] {
  const certificados = getCertificados();
  return certificados.filter(c => c.funcionarioId === funcionarioId);
}

export function addCertificado(certificado: Omit<Certificado, 'id' | 'createdAt' | 'updatedAt'>): Certificado {
  const certificados = localStorage.getItem(CERTIFICADOS_KEY);
  const lista = certificados ? JSON.parse(certificados) : [];
  
  const novoCertificado: Certificado = {
    ...certificado,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  lista.push(novoCertificado);
  localStorage.setItem(CERTIFICADOS_KEY, JSON.stringify(lista));
  return novoCertificado;
}

export function updateCertificado(id: string, dados: Partial<Certificado>): Certificado | null {
  const data = localStorage.getItem(CERTIFICADOS_KEY);
  const certificados = data ? JSON.parse(data) : [];
  const index = certificados.findIndex((c: Certificado) => c.id === id);
  
  if (index === -1) return null;
  
  certificados[index] = { 
    ...certificados[index], 
    ...dados,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CERTIFICADOS_KEY, JSON.stringify(certificados));
  return certificados[index];
}

export function deleteCertificado(id: string): boolean {
  const data = localStorage.getItem(CERTIFICADOS_KEY);
  const certificados = data ? JSON.parse(data) : [];
  const filtered = certificados.filter((c: Certificado) => c.id !== id);
  
  if (filtered.length === certificados.length) return false;
  
  localStorage.setItem(CERTIFICADOS_KEY, JSON.stringify(filtered));
  return true;
}

export function saveCertificados(certificados: Certificado[]): void {
  localStorage.setItem(CERTIFICADOS_KEY, JSON.stringify(certificados));
}

export function getCertificadoById(id: string): Certificado | undefined {
  const certificados = getCertificados();
  return certificados.find(c => c.id === id);
}

// Dashboard Stats
export function getDashboardStats() {
  const funcionarios = getFuncionarios();
  const certificados = getCertificados();
  const hoje = new Date();
  const em30Dias = new Date();
  em30Dias.setDate(hoje.getDate() + 30);

  const totalFuncionarios = funcionarios.length;
  const funcionariosAtivos = funcionarios.filter(f => f.status === 'ativo').length;
  const totalCertificados = certificados.length;

  const certificadosValidos = certificados.filter(c => new Date(c.dataValidade) >= hoje).length;
  
  const certificadosVencendo = certificados.filter(c => {
    const dataValidade = new Date(c.dataValidade);
    return dataValidade >= hoje && dataValidade <= em30Dias;
  }).length;

  const certificadosVencidos = certificados.filter(c => new Date(c.dataValidade) < hoje).length;

  const funcionariosRecentes = funcionarios
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(f => ({
      ...f,
      empresaNome: f.empresa
    }));

  const certificadosVencendoLista = certificados
    .filter(c => {
      const dataValidade = new Date(c.dataValidade);
      return dataValidade >= hoje && dataValidade <= em30Dias;
    })
    .map(c => ({
      ...c,
      diasRestantes: Math.ceil((new Date(c.dataValidade).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 5);

  const certificadosVencidosLista = certificados
    .filter(c => new Date(c.dataValidade) < hoje)
    .map(c => ({
      ...c,
      diasVencido: Math.ceil((hoje.getTime() - new Date(c.dataValidade).getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => b.diasVencido - a.diasVencido)
    .slice(0, 5);

  return {
    totalFuncionarios,
    funcionariosAtivos,
    totalCertificados,
    certificadosValidos,
    certificadosVencendo,
    certificadosVencidos,
    funcionariosRecentes,
    certificadosVencendoLista,
    certificadosVencidosLista,
  };
}

export function initializeDefaultData() {
  // Função vazia para compatibilidade
}