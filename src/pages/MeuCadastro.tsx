import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { getFuncionarios, getCertificados } from '@/lib/storage';
import { Funcionario, Certificado } from '@/types';
import { User, Calendar, Briefcase, Building2, Award, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MeuCadastro() {
  const currentUser = getCurrentUser();
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [certificados, setCertificados] = useState<Certificado[]>([]);

  useEffect(() => {
    if (currentUser?.funcionarioVinculadoId) {
      const funcionarios = getFuncionarios();
      const func = funcionarios.find(f => f.id === currentUser.funcionarioVinculadoId);
      setFuncionario(func || null);

      const certs = getCertificados();
      const meusCerts = certs.filter(c => c.funcionarioId === currentUser.funcionarioVinculadoId);
      setCertificados(meusCerts);
    }
  }, [currentUser]);

  if (!funcionario) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum cadastro vinculado a este usuário.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      case 'afastado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificadoStatusColor = (status: string) => {
    switch (status) {
      case 'valido':
        return 'bg-green-100 text-green-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'em_renovacao':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Cadastro</h1>
        <p className="text-gray-600 mt-1">Visualize suas informações pessoais e certificados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>Informações do seu cadastro no sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600">Nome Completo</Label>
              <p className="font-medium text-gray-900">{funcionario.nome}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">CPF</Label>
              <p className="font-medium text-gray-900">{funcionario.cpf}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">RG</Label>
              <p className="font-medium text-gray-900">{funcionario.rg}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Data de Nascimento</Label>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                {format(new Date(funcionario.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Cargo</Label>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                {funcionario.cargo}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Setor</Label>
              <p className="font-medium text-gray-900">{funcionario.setor}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Empresa</Label>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                {funcionario.empresa}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Data de Admissão</Label>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                {format(new Date(funcionario.dataAdmissao), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Status</Label>
              <div>
                <Badge className={getStatusColor(funcionario.status)}>
                  {funcionario.status.charAt(0).toUpperCase() + funcionario.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          {funcionario.observacoes && (
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-gray-600">Observações</Label>
              <p className="text-gray-900">{funcionario.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Meus Certificados
          </CardTitle>
          <CardDescription>Certificados e documentos vinculados ao seu cadastro</CardDescription>
        </CardHeader>
        <CardContent>
          {certificados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhum certificado cadastrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificados.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.tipo}</h3>
                      <p className="text-sm text-gray-600">Nº {cert.numero}</p>
                    </div>
                    <Badge className={getCertificadoStatusColor(cert.status)}>
                      {cert.status === 'valido' && 'Válido'}
                      {cert.status === 'vencido' && 'Vencido'}
                      {cert.status === 'em_renovacao' && 'Em Renovação'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Data de Emissão</Label>
                      <p className="text-gray-900">
                        {format(new Date(cert.dataEmissao), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Data de Validade</Label>
                      <p className="text-gray-900">
                        {format(new Date(cert.dataValidade), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-600">Órgão Emissor</Label>
                      <p className="text-gray-900">{cert.orgaoEmissor}</p>
                    </div>
                  </div>
                  {cert.observacoes && (
                    <div className="pt-2 border-t">
                      <Label className="text-gray-600">Observações</Label>
                      <p className="text-sm text-gray-900">{cert.observacoes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}