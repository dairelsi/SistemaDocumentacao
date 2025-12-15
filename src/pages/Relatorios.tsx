import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  getFuncionarios, 
  getCertificados, 
  getEmpresas,
  getCertificadosByFuncionario 
} from '@/lib/storage';
import { Funcionario, Certificado } from '@/types';
import { toast } from 'sonner';
import { 
  FileText, 
  Download,
  Users,
  FileCheck,
  AlertTriangle,
  Building2,
  FileDown,
  Eye,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

type RelatorioPreview = {
  tipo: string;
  dados: unknown;
};

export default function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState('funcionarios');
  const [empresaId, setEmpresaId] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [preview, setPreview] = useState<RelatorioPreview | null>(null);

  const [empresas, setEmpresas] = useState<{id: string; nome: string}[]>([]);

  useEffect(() => {
    const loadEmpresas = async () => {
      const e = await getEmpresas();
      setEmpresas(e);
    };
    loadEmpresas();
  }, []);

  const gerarRelatorioFuncionariosPorEmpresa = async () => {
    let funcionarios = await getFuncionarios();

    // Aplicar filtros
    if (empresaId !== 'todos') {
      funcionarios = funcionarios.filter(f => f.empresaId === empresaId);
    }

    if (statusFilter !== 'todos') {
      funcionarios = funcionarios.filter(f => f.status === statusFilter);
    }

    // Agrupar por empresa
    const funcionariosPorEmpresa = funcionarios.reduce((acc, f) => {
      const empresaNome = f.empresaNome || f.empresa || 'Sem Empresa';
      if (!acc[empresaNome]) {
        acc[empresaNome] = [];
      }
      acc[empresaNome].push(f);
      return acc;
    }, {} as Record<string, typeof funcionarios>);

    return funcionariosPorEmpresa;
  };

  const gerarRelatorioCertificadosFuncionario = async () => {
    const funcionarios = await getFuncionarios();
    const resultado = await Promise.all(funcionarios.map(async (f) => {
      const certificados = await getCertificadosByFuncionario(f.id);
      return {
        funcionario: f,
        certificados: certificados
      };
    }));

    // Filtrar apenas funcionários com certificados
    return resultado.filter(r => r.certificados.length > 0);
  };

  const aplicarFiltrosFuncionarios = async () => {
    let funcionarios = await getFuncionarios();

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

    return funcionarios;
  };

  const aplicarFiltrosCertificados = async () => {
    let certificados = await getCertificados();

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

    return certificados;
  };

  const aplicarFiltrosVencimentos = async () => {
    const certificados = await getCertificados();
    const hoje = new Date();
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);
    const em60Dias = new Date();
    em60Dias.setDate(hoje.getDate() + 60);

    return certificados.filter(c => {
      const validade = new Date(c.dataValidade);
      return validade < hoje || (validade >= hoje && validade <= em60Dias);
    }).map(c => {
      const validade = new Date(c.dataValidade);
      const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = '';
      if (validade < hoje) {
        status = 'Vencido';
      } else if (validade <= em30Dias) {
        status = 'Crítico (30 dias)';
      } else if (validade <= em60Dias) {
        status = 'Atenção (60 dias)';
      }

      return { ...c, diasRestantes, statusVencimento: status };
    });
  };

  const visualizarRelatorio = async () => {
    switch (tipoRelatorio) {
      case 'funcionarios_empresa':
        setPreview({
          tipo: 'funcionarios_empresa',
          dados: await gerarRelatorioFuncionariosPorEmpresa()
        });
        break;
      case 'certificados_funcionario':
        setPreview({
          tipo: 'certificados_funcionario',
          dados: await gerarRelatorioCertificadosFuncionario()
        });
        break;
      case 'funcionarios':
        setPreview({
          tipo: 'funcionarios',
          dados: await aplicarFiltrosFuncionarios()
        });
        break;
      case 'certificados':
        setPreview({
          tipo: 'certificados',
          dados: await aplicarFiltrosCertificados()
        });
        break;
      case 'vencimentos':
        setPreview({
          tipo: 'vencimentos',
          dados: await aplicarFiltrosVencimentos()
        });
        break;
      default:
        toast.error('Selecione um tipo de relatório');
    }
  };

  const gerarPDFFuncionariosPorEmpresa = () => {
    const funcionariosPorEmpresa = gerarRelatorioFuncionariosPorEmpresa();
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    doc.setFontSize(18);
    doc.text('Relatório de Funcionários por Empresa', 14, 20);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

    let yPosition = 35;

    Object.entries(funcionariosPorEmpresa).forEach(([empresaNome, funcionarios]) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Empresa: ${empresaNome}`, 14, yPosition);
      yPosition += 8;

      const tableData = funcionarios.map(f => [
        f.nome,
        f.cpf,
        f.cargo || '-',
        f.status,
        new Date(f.dataAdmissao).toLocaleDateString('pt-BR')
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nome', 'CPF', 'Cargo', 'Status', 'Data Admissão']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 9 },
        margin: { left: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    });

    doc.save('relatorio_funcionarios_por_empresa.pdf');
    toast.success('Relatório PDF gerado com sucesso!');
  };

  const gerarPDFCertificadosFuncionario = () => {
    const dados = gerarRelatorioCertificadosFuncionario();
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    doc.setFontSize(18);
    doc.text('Relatório de Certificados por Funcionário', 14, 20);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

    let yPosition = 35;

    dados.forEach(({ funcionario, certificados }) => {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Funcionário: ${funcionario.nome}`, 14, yPosition);
      yPosition += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`CPF: ${funcionario.cpf} | Empresa: ${funcionario.empresaNome || funcionario.empresa || '-'}`, 14, yPosition);
      yPosition += 8;

      const tableData = certificados.map(c => {
        const hoje = new Date();
        const validade = new Date(c.dataValidade);
        let statusCert = 'Válido';
        
        if (validade < hoje) {
          statusCert = 'Vencido';
        } else {
          const em30Dias = new Date();
          em30Dias.setDate(hoje.getDate() + 30);
          if (validade <= em30Dias) {
            statusCert = 'Vencendo';
          }
        }

        return [
          c.tipo,
          c.numero,
          new Date(c.dataEmissao).toLocaleDateString('pt-BR'),
          new Date(c.dataValidade).toLocaleDateString('pt-BR'),
          statusCert
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Tipo', 'Número', 'Emissão', 'Validade', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 8 },
        margin: { left: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 12;
    });

    doc.save('relatorio_certificados_por_funcionario.pdf');
    toast.success('Relatório PDF gerado com sucesso!');
  };

  const gerarRelatorioFuncionarios = () => {
    const funcionarios = aplicarFiltrosFuncionarios();

    // Gerar CSV
    let csv = 'Nome,CPF,Email,Telefone,Empresa,Cargo,Data Admissão,Status\n';
    
    funcionarios.forEach(f => {
      csv += `"${f.nome}","${f.cpf}","${f.email || ''}","${f.telefone || ''}","${f.empresaNome || f.empresa || ''}","${f.cargo || ''}","${f.dataAdmissao}","${f.status}"\n`;
    });

    downloadCSV(csv, 'relatorio_funcionarios.csv');
    toast.success('Relatório CSV gerado com sucesso!');
  };

  const gerarRelatorioCertificados = () => {
    const certificados = aplicarFiltrosCertificados();

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
    toast.success('Relatório CSV gerado com sucesso!');
  };

  const gerarRelatorioVencimentos = () => {
    const certificados = aplicarFiltrosVencimentos();

    // Gerar CSV
    let csv = 'Funcionário,Tipo,Número,Data Validade,Dias para Vencer,Status\n';
    
    certificados.forEach(c => {
      csv += `"${c.funcionarioNome}","${c.tipo}","${c.numero}","${c.dataValidade}","${c.diasRestantes}","${c.statusVencimento}"\n`;
    });

    downloadCSV(csv, 'relatorio_vencimentos.csv');
    toast.success('Relatório CSV gerado com sucesso!');
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

  const handleGerarRelatorio = (formato: 'csv' | 'pdf') => {
    if (formato === 'csv') {
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
        case 'funcionarios_empresa':
          gerarRelatorioFuncionarios();
          break;
        case 'certificados_funcionario':
          gerarRelatorioCertificados();
          break;
        default:
          toast.error('Selecione um tipo de relatório');
      }
    } else {
      // PDF
      switch (tipoRelatorio) {
        case 'funcionarios_empresa':
          gerarPDFFuncionariosPorEmpresa();
          break;
        case 'certificados_funcionario':
          gerarPDFCertificadosFuncionario();
          break;
        default:
          toast.info('Relatório PDF disponível apenas para "Funcionários por Empresa" e "Certificados por Funcionário"');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'ativo': { variant: 'default', label: 'Ativo' },
      'inativo': { variant: 'secondary', label: 'Inativo' },
      'afastado': { variant: 'outline', label: 'Afastado' },
    };
    
    const config = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCertificadoStatus = (dataValidade: string) => {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    
    if (validade < hoje) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);
    if (validade <= em30Dias) {
      return <Badge className="bg-orange-500">Vencendo</Badge>;
    }
    
    return <Badge className="bg-green-500">Válido</Badge>;
  };

  const relatorioOptions = [
    {
      value: 'funcionarios_empresa',
      label: 'Funcionários por Empresa',
      description: 'Funcionários agrupados por empresa',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
    },
    {
      value: 'certificados_funcionario',
      label: 'Certificados por Funcionário',
      description: 'Todos os certificados que cada funcionário possui',
      icon: FileCheck,
      color: 'from-green-500 to-green-600',
    },
    {
      value: 'funcionarios',
      label: 'Relatório de Funcionários',
      description: 'Lista completa de funcionários com suas informações',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      value: 'certificados',
      label: 'Relatório de Certificados',
      description: 'Lista de todos os certificados cadastrados',
      icon: FileText,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      value: 'vencimentos',
      label: 'Relatório de Vencimentos',
      description: 'Certificados vencidos e próximos do vencimento',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-600',
    },
  ];

  const podeGerarPDF = tipoRelatorio === 'funcionarios_empresa' || tipoRelatorio === 'certificados_funcionario';

  const renderPreview = () => {
    if (!preview) return null;

    return (
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Prévia do Relatório</CardTitle>
            <CardDescription>Visualize os dados antes de exportar</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-auto">
          {preview.tipo === 'funcionarios_empresa' && (
            <div className="space-y-6">
              {Object.entries(preview.dados as Record<string, Funcionario[]>).map(([empresaNome, funcionarios]) => (
                <div key={empresaNome}>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Empresa: {empresaNome}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Admissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {funcionarios.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">{f.nome}</TableCell>
                          <TableCell>{f.cpf}</TableCell>
                          <TableCell>{f.cargo || '-'}</TableCell>
                          <TableCell>{getStatusBadge(f.status)}</TableCell>
                          <TableCell>{new Date(f.dataAdmissao).toLocaleDateString('pt-BR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}

          {preview.tipo === 'certificados_funcionario' && (
            <div className="space-y-6">
              {(preview.dados as Array<{ funcionario: Funcionario; certificados: Certificado[] }>).map(({ funcionario, certificados }) => (
                <div key={funcionario.id}>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{funcionario.nome}</h3>
                    <p className="text-sm text-gray-600">CPF: {funcionario.cpf} | Empresa: {funcionario.empresaNome || funcionario.empresa || '-'}</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Emissão</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificados.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.tipo}</TableCell>
                          <TableCell>{c.numero}</TableCell>
                          <TableCell>{new Date(c.dataEmissao).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{new Date(c.dataValidade).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{getCertificadoStatus(c.dataValidade)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}

          {preview.tipo === 'funcionarios' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Admissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(preview.dados as Funcionario[]).map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.nome}</TableCell>
                    <TableCell>{f.cpf}</TableCell>
                    <TableCell>{f.email || '-'}</TableCell>
                    <TableCell>{f.empresaNome || f.empresa || '-'}</TableCell>
                    <TableCell>{f.cargo || '-'}</TableCell>
                    <TableCell>{getStatusBadge(f.status)}</TableCell>
                    <TableCell>{new Date(f.dataAdmissao).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {preview.tipo === 'certificados' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Emissão</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Órgão Emissor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(preview.dados as Certificado[]).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.funcionarioNome}</TableCell>
                    <TableCell>{c.tipo}</TableCell>
                    <TableCell>{c.numero}</TableCell>
                    <TableCell>{new Date(c.dataEmissao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(c.dataValidade).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{c.orgaoEmissor || '-'}</TableCell>
                    <TableCell>{getCertificadoStatus(c.dataValidade)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {preview.tipo === 'vencimentos' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Dias Restantes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(preview.dados as Array<Certificado & { diasRestantes: number; statusVencimento: string }>).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.funcionarioNome}</TableCell>
                    <TableCell>{c.tipo}</TableCell>
                    <TableCell>{c.numero}</TableCell>
                    <TableCell>{new Date(c.dataValidade).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{c.diasRestantes}</TableCell>
                    <TableCell>
                      <Badge variant={c.statusVencimento === 'Vencido' ? 'destructive' : 'outline'}>
                        {c.statusVencimento}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
        <p className="text-gray-500 mt-1">Gere relatórios personalizados do sistema em CSV ou PDF</p>
      </div>

      {/* Tipo de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatorioOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = tipoRelatorio === option.value;
          
          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-red-500 shadow-lg' : ''
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
            {(tipoRelatorio === 'funcionarios' || tipoRelatorio === 'funcionarios_empresa') && (
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

                {tipoRelatorio === 'funcionarios' && (
                  <>
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

            {(tipoRelatorio === 'funcionarios_empresa' || tipoRelatorio === 'certificados_funcionario') && (
              <div className="md:col-span-2">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileDown className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Relatório com PDF Disponível
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Este relatório pode ser exportado em formato PDF para melhor visualização e impressão.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t flex gap-3 flex-wrap">
            <Button
              onClick={visualizarRelatorio}
              variant="outline"
              className="flex-1 sm:flex-initial"
              size="lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
            <Button
              onClick={() => handleGerarRelatorio('csv')}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar CSV
            </Button>
            {podeGerarPDF && (
              <Button
                onClick={() => handleGerarRelatorio('pdf')}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                size="lg"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview do Relatório */}
      {renderPreview()}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Formato CSV</p>
                <p className="text-2xl font-bold text-blue-900">Todos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-xl">
                <FileDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-700 font-medium">Formato PDF</p>
                <p className="text-2xl font-bold text-red-900">Selecionados</p>
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
      </div>
    </div>
  );
}