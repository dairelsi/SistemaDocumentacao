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
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = getCurrentUser();
        
        if (currentUser?.funcionarioVinculadoId) {
          const funcionarios = await getFuncionarios();
          const func = funcionarios.find(f => f.id === currentUser.funcionarioVinculadoId);
          
          if (func) {
            setFuncionario(func);
            
            const certs = await getCertificados();
            const meusCerts = certs.filter(c => c.funcionarioId === currentUser.funcionarioVinculadoId);
            setCertificados(meusCerts);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (!funcionario) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Cadastro</h1>
          <p className="text-gray-600 mt-1">Visualize suas informações pessoais e certificados</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg mb-2">Nenhum cadastro vinculado a este usuário.</p>
            <p className="text-gray-500 text-sm">
              Entre em contato com o administrador para vincular seu cadastro a um funcionário.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <Badge className={
                  funcionario.status === 'ativo' ? 'bg-green-100 text-green-800' :
                  funcionario.status === 'inativo' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
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
                    <Badge className={
                      cert.status === 'valido' ? 'bg-green-100 text-green-800' :
                      cert.status === 'vencido' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {cert.status === 'valido' ? 'Válido' : cert.status === 'vencido' ? 'Vencido' : 'Em Renovação'}
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