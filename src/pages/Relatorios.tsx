import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  getFuncionarios, 
  getCertificados, 
  getEmpresas 
} from '@/lib/storage';
import { toast } from 'sonner';
import { 
  FileText, 
  Download,
  Users,
  FileCheck,
  AlertTriangle,
  Building2
} from 'lucide-react';

export default function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState('funcionarios');
  const [empresaId, setEmpresaId] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const empresas = getEmpresas();

  const gerarRelatorioFuncionarios = () => {
    let funcionarios = getFuncionarios();

    // Aplicar filtros
    if (empresaId !== 'todos') {
      funcionarios = funcionarios.filter(f => f.empresaId === empresaId);
    }

    if (statusFilter !== 'todos') {
      funcionarios = funcionarios.filter(f => f.status === statusFilter);
    }

    if (dataInicio) {
      funcionarios = funcionarios.filter(f => 
        new Date(f.dataAdmissao) >= new Date(dataInicio)
      );
    }

    if (dataFim) {
      funcionarios = funcionarios.filter(f => 
        new Date(f.dataAdmissao) <= new Date(dataFim)
      );
    }

    // Gerar CSV
    let csv = 'Nome,CPF,Email,Telefone,Empresa,Cargo,Data Admissão,Status\n';
    
    funcionarios.forEach(f => {
      csv += `"${f.nome}","${f.cpf}","${f.email || ''}","${f.telefone || ''}","${f.empresaNome || ''}","${f.cargo || ''}","${f.dataAdmissao}","${f.status}"\n`;
    });

    downloadCSV(csv, 'relatorio_funcionarios.csv');
    toast.success('Relatório gerado com sucesso!');
  };

  const gerarRelatorioCertificados = () => {
    let certificados = getCertificados();

    // Aplicar filtros
    if (statusFilter !== 'todos') {
      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(hoje.getDate() + 30);

      certificados = certificados.filter(c => {
        const dataValidade = new Date(c.dataValidade);
        
        if (statusFilter === 'valido') {
          return dataValidade >= hoje;
        } else if (statusFilter === 'vencendo') {
          return dataValidade >= hoje && dataValidade <= em30Dias;
        } else if (statusFilter === 'vencido') {
          return dataValidade < hoje;
        }
        return true;
      });
    }

    if (dataInicio) {
      certificados = certificados.filter(c => 
        new Date(c.dataValidade) >= new Date(dataInicio)
      );
    }

    if (dataFim) {
      certificados = certificados.filter(c => 
        new Date(c.dataValidade) <= new Date(dataFim)
      );
    }

    // Gerar CSV
    let csv = 'Funcionário,Tipo,Número,Data Emissão,Data Validade,Órgão Emissor,Status\n';
    
    certificados.forEach(c => {
      const hoje = new Date();
      const validade = new Date(c.dataValidade);
      let status = 'Válido';
      
      if (validade < hoje) {
        status = 'Vencido';
      } else {
        const em30Dias = new Date();
        em30Dias.setDate(hoje.getDate() + 30);
        if (validade <= em30Dias) {
          status = 'Vencendo';
        }
      }

      csv += `"${c.funcionarioNome}","${c.tipo}","${c.numero}","${c.dataEmissao || ''}","${c.dataValidade}","${c.orgaoEmissor || ''}","${status}"\n`;
    });

    downloadCSV(csv, 'relatorio_certificados.csv');
    toast.success('Relatório gerado com sucesso!');
  };

  const gerarRelatorioVencimentos = () => {
    const certificados = getCertificados();
    const hoje = new Date();
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);
    const em60Dias = new Date();
    em60Dias.setDate(hoje.getDate() + 60);

    // Gerar CSV
    let csv = 'Funcionário,Tipo,Número,Data Validade,Dias para Vencer,Status\n';
    
    certificados.forEach(c => {
      const validade = new Date(c.dataValidade);
      const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = '';
      if (validade < hoje) {
        status = 'Vencido';
      } else if (validade <= em30Dias) {
        status = 'Crítico (30 dias)';
      } else if (validade <= em60Dias) {
        status = 'Atenção (60 dias)';
      } else {
        return; // Não incluir certificados com mais de 60 dias
      }

      csv += `"${c.funcionarioNome}","${c.tipo}","${c.numero}","${c.dataValidade}","${diasRestantes}","${status}"\n`;
    });

    downloadCSV(csv, 'relatorio_vencimentos.csv');
    toast.success('Relatório gerado com sucesso!');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGerarRelatorio = () => {
    switch (tipoRelatorio) {
      case 'funcionarios':
        gerarRelatorioFuncionarios();
        break;
      case 'certificados':
        gerarRelatorioCertificados();
        break;
      case 'vencimentos':
        gerarRelatorioVencimentos();
        break;
      default:
        toast.error('Selecione um tipo de relatório');
    }
  };

  const relatorioOptions = [
    {
      value: 'funcionarios',
      label: 'Relatório de Funcionários',
      description: 'Lista completa de funcionários com suas informações',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      value: 'certificados',
      label: 'Relatório de Certificados',
      description: 'Lista de todos os certificados cadastrados',
      icon: FileCheck,
      color: 'from-green-500 to-green-600',
    },
    {
      value: 'vencimentos',
      label: 'Relatório de Vencimentos',
      description: 'Certificados vencidos e próximos do vencimento',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-gray-500 mt-1">Gere relatórios personalizados do sistema</p>
        </div>

        {/* Tipo de Relatório */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relatorioOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = tipoRelatorio === option.value;
            
            return (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => setTipoRelatorio(option.value)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{option.label}</h3>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros do Relatório</CardTitle>
            <CardDescription>Configure os filtros para personalizar seu relatório</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipoRelatorio === 'funcionarios' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Select value={empresaId} onValueChange={setEmpresaId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as Empresas</SelectItem>
                        {empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="afastado">Afastado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data Admissão (Início)</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data Admissão (Fim)</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                </>
              )}

              {tipoRelatorio === 'certificados' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="valido">Válidos</SelectItem>
                        <SelectItem value="vencendo">Vencendo (30 dias)</SelectItem>
                        <SelectItem value="vencido">Vencidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data Validade (Início)</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data Validade (Fim)</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                </>
              )}

              {tipoRelatorio === 'vencimentos' && (
                <div className="md:col-span-2">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">
                          Relatório de Vencimentos
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Este relatório inclui automaticamente certificados vencidos e aqueles que vencerão nos próximos 60 dias.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleGerarRelatorio}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Gerar Relatório (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Formato</p>
                  <p className="text-2xl font-bold text-blue-900">CSV</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600 rounded-xl">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Download</p>
                  <p className="text-2xl font-bold text-green-900">Automático</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">Compatível</p>
                  <p className="text-2xl font-bold text-purple-900">Excel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}