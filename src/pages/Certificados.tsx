import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CertificadoForm from '@/components/CertificadoForm';
import { 
  getCertificados, 
  addCertificado, 
  updateCertificado, 
  deleteCertificado
} from '@/lib/storage';
import { Certificado, TipoCertificado } from '@/types';
import { toast } from 'sonner';
import { 
  FilePlus, 
  Search, 
  Edit, 
  Trash2,
  User,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Certificados() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [filteredCertificados, setFilteredCertificados] = useState<Certificado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCertificado, setSelectedCertificado] = useState<Certificado | null>(null);
  const [certificadoToDelete, setCertificadoToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCertificados();
  }, []);

  useEffect(() => {
    let filtered = [...certificados];

    if (searchTerm) {
      filtered = filtered.filter(c => 
        (c.funcionarioNome && c.funcionarioNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tipoFilter !== 'todos') {
      filtered = filtered.filter(c => c.tipo === tipoFilter);
    }

    if (statusFilter !== 'todos') {
      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(hoje.getDate() + 30);

      filtered = filtered.filter(c => {
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

    setFilteredCertificados(filtered);
  }, [certificados, searchTerm, tipoFilter, statusFilter]);

  // ATUALIZADO: Agora é async
  const loadCertificados = async () => {
    try {
      const data = await getCertificados();
      setCertificados(data);
    } catch (error) {
      toast.error('Erro ao carregar certificados');
    }
  };

  const filterCertificados = () => {
    let filtered = [...certificados];

    if (searchTerm) {
      filtered = filtered.filter(c => 
        (c.funcionarioNome && c.funcionarioNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tipoFilter !== 'todos') {
      filtered = filtered.filter(c => c.tipo === tipoFilter);
    }

    if (statusFilter !== 'todos') {
      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(hoje.getDate() + 30);

      filtered = filtered.filter(c => {
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

    setFilteredCertificados(filtered);
  };

  // ATUALIZADO: Agora é async
  const handleSave = async (data: Partial<Certificado>) => {
    try {
      if (selectedCertificado) {
        await updateCertificado(selectedCertificado.id, data);
        toast.success('Certificado atualizado com sucesso!');
      } else {
        await addCertificado(data as unknown as Partial<Certificado>);
        toast.success('Certificado cadastrado com sucesso!');
      }
      await loadCertificados(); // Recarrega a lista
      setSelectedCertificado(null);
    } catch (error) {
      toast.error('Erro ao salvar certificado');
    }
  };

  // ATUALIZADO: Agora é async
  const handleDelete = async () => {
    if (certificadoToDelete) {
      try {
        await deleteCertificado(certificadoToDelete);
        toast.success('Certificado excluído com sucesso!');
        await loadCertificados();
      } catch (error) {
        toast.error('Erro ao excluir certificado');
      }
      setCertificadoToDelete(null);
    }
  };

  const getCertificadoStatus = (dataValidade: string) => {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);

    if (validade < hoje) {
      const diasVencido = Math.ceil((hoje.getTime() - validade.getTime()) / (1000 * 60 * 60 * 24));
      return {
        label: `Vencido há ${diasVencido} ${diasVencido === 1 ? 'dia' : 'dias'}`,
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: AlertCircle,
      };
    } else if (validade <= em30Dias) {
      const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return {
        label: `Vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: Clock,
      };
    } else {
      return {
        label: 'Válido',
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: CheckCircle,
      };
    }
  };

  const TIPOS: TipoCertificado[] = [
    'ASO', 'NR-10', 'NR-35', 'NR-33', 'NR-12', 
    'NR-18', 'NR-20', 'CIPA', 'Integração', 'Outro',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Certificados</h2>
          <p className="text-gray-500 mt-1">Gerencie os certificados e documentos</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCertificado(null);
            setFormOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <FilePlus className="w-4 h-4 mr-2" />
          Novo Certificado
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por funcionário, número ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  {TIPOS.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="valido">Válidos</SelectItem>
                  <SelectItem value="vencendo">Vencendo (30 dias)</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredCertificados.length} de {certificados.length} certificados
      </div>

      {/* Certificados List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCertificados.map((certificado) => {
          const status = getCertificadoStatus(certificado.dataValidade);
          const StatusIcon = status.icon;
          
          return (
            <Card key={certificado.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="mb-2">
                      {certificado.tipo}
                    </Badge>
                    <CardTitle className="text-lg">{certificado.numero}</CardTitle>
                  </div>
                  <Badge variant="outline" className={status.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label.split(' ')[0]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{certificado.funcionarioNome || 'Não informado'}</span>
                  </div>
                  
                  {certificado.orgaoEmissor && (
                    <div className="text-gray-600">
                      <span className="text-xs">Emissor: </span>
                      <span className="text-xs font-medium">{certificado.orgaoEmissor}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Emissão</p>
                      <p className="text-sm font-medium">
                        {certificado.dataEmissao 
                          ? new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')
                          : '-'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Validade</p>
                      <p className="text-sm font-medium">
                        {new Date(certificado.dataValidade).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {certificado.observacoes && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">Observações</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{certificado.observacoes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCertificado(certificado);
                      setFormOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCertificadoToDelete(certificado.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCertificados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FilePlus className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600">Nenhum certificado encontrado</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm || tipoFilter !== 'todos' || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando um novo certificado'
              }
            </p>
          </CardContent>
        </Card>
      )}

      <CertificadoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        certificado={selectedCertificado}
        onSave={handleSave}
      />

      <AlertDialog open={!!certificadoToDelete} onOpenChange={() => setCertificadoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este certificado? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}