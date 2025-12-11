import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats } from '@/lib/storage';
import { DashboardStats } from '@/types';
import { Users, FileText, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const data = getDashboardStats();
    setStats(data);
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Funcionários',
      value: stats.totalFuncionarios,
      subtitle: `${stats.funcionariosAtivos} ativos`,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Total de Certificados',
      value: stats.totalCertificados,
      subtitle: `${stats.certificadosValidos} válidos`,
      icon: FileText,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Certificados Vencendo',
      value: stats.certificadosVencendo,
      subtitle: 'Próximos 30 dias',
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-100',
    },
    {
      title: 'Certificados Vencidos',
      value: stats.certificadosVencidos,
      subtitle: 'Requer atenção',
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Visão geral do sistema de controle</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className={`p-6 bg-gradient-to-br ${card.bgGradient}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificados Vencendo */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Clock className="w-5 h-5" />
              Certificados Vencendo (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.certificadosVencendoLista.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Nenhum certificado vencendo</p>
              </div>
            ) : (
              <div className="divide-y">
                {stats.certificadosVencendoLista.map((cert) => (
                  <div key={cert.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{cert.funcionarioNome}</p>
                        <p className="text-sm text-gray-600">{cert.tipo} - {cert.numero}</p>
                        <p className="text-xs text-gray-500">
                          Validade: {new Date(cert.dataValidade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        {cert.diasRestantes} {cert.diasRestantes === 1 ? 'dia' : 'dias'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificados Vencidos */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Certificados Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.certificadosVencidosLista.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Nenhum certificado vencido</p>
              </div>
            ) : (
              <div className="divide-y">
                {stats.certificadosVencidosLista.map((cert) => (
                  <div key={cert.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{cert.funcionarioNome}</p>
                        <p className="text-sm text-gray-600">{cert.tipo} - {cert.numero}</p>
                        <p className="text-xs text-gray-500">
                          Venceu em: {new Date(cert.dataValidade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                        {cert.diasVencido} {cert.diasVencido === 1 ? 'dia' : 'dias'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funcionários Recentes */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <TrendingUp className="w-5 h-5" />
            Funcionários Adicionados Recentemente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats.funcionariosRecentes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhum funcionário cadastrado</p>
            </div>
          ) : (
            <div className="divide-y">
              {stats.funcionariosRecentes.map((func) => (
                <div key={func.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{func.nome}</p>
                      <p className="text-sm text-gray-600">{func.cargo || 'Cargo não informado'}</p>
                      <p className="text-xs text-gray-500">{func.empresa || 'Empresa não informada'}</p>
                    </div>
                    <Badge 
                      variant={func.status === 'ativo' ? 'default' : 'secondary'}
                      className={
                        func.status === 'ativo' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {func.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}