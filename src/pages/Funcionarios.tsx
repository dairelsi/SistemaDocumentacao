import { useState, useEffect, useCallback } from 'react';
import FuncionarioForm from '@/components/FuncionarioForm';
import CertificadoFuncionarioForm from '@/components/CertificadoFuncionarioForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  getFuncionarios, 
  addFuncionario, 
  updateFuncionario, 
  deleteFuncionario,
  getCertificados,
  addCertificado
} from '@/lib/storage';
import { Funcionario, Certificado } from '@/types';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  Building2,
  Phone,
  Mail,
  Calendar,
  Plus
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

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState<Funcionario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [certFormOpen, setCertFormOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<string | null>(null);
  const [selectedFuncionarioForCert, setSelectedFuncionarioForCert] = useState<string>('');
  const [certificados, setCertificados] = useState<Certificado[]>([]);

  useEffect(() => {
    loadFuncionarios();
  }, []);

  const filterFuncionarios = useCallback(() => {
    let filtered = [...funcionarios];

    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cpf.includes(searchTerm) ||
        (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (f.cargo && f.cargo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    setFilteredFuncionarios(filtered);
  }, [funcionarios, searchTerm, statusFilter]);

  useEffect(() => {
    filterFuncionarios();
  }, [filterFuncionarios]);

  const loadFuncionarios = async () => {
    const data = await getFuncionarios();
    setFuncionarios(data);
    const certs = await getCertificados();
    setCertificados(certs);
  };

  

  const handleSave = async (data: Partial<Funcionario>) => {
    try {
      if (selectedFuncionario) {
        await updateFuncionario(selectedFuncionario.id, data);
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        await addFuncionario(data as Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Funcionário cadastrado com sucesso!');
      }
      await loadFuncionarios();
      setSelectedFuncionario(null);
    } catch (error) {
      toast.error('Erro ao salvar funcionário');
    }
  };

  const handleDelete = async () => {
    if (funcionarioToDelete) {
      try {
        await deleteFuncionario(funcionarioToDelete);
        toast.success('Funcionário excluído com sucesso!');
        await loadFuncionarios();
      } catch (error) {
        toast.error('Erro ao excluir funcionário');
      }
      setFuncionarioToDelete(null);
    }
  };

  const handleAddCertificado = (funcionarioId: string) => {
    setSelectedFuncionarioForCert(funcionarioId);
    setCertFormOpen(true);
  };

  const handleSaveCertificado = async (data: Partial<Certificado>) => {
    try {
      await addCertificado(data as Omit<Certificado, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success('Certificado adicionado com sucesso!');
      await loadFuncionarios();
    } catch (error) {
      toast.error('Erro ao adicionar certificado');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'inativo':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'afastado':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Funcionários</h2>
          <p className="text-gray-500 mt-1">Gerencie os funcionários cadastrados</p>
        </div>
        <Button
          onClick={() => {
            setSelectedFuncionario(null);
            setFormOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, CPF, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="afastado">Afastado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredFuncionarios.length} de {funcionarios.length} funcionários
      </div>

      {/* Funcionários List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredFuncionarios.map((funcionario) => {
          const certificadosByFuncionario = certificados.filter(c => c.funcionarioId === funcionario.id);
          
          return (
            <Card key={funcionario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{funcionario.nome}</CardTitle>
                    <p className="text-sm text-gray-500">{funcionario.cpf}</p>
                  </div>
                  <Badge className={getStatusColor(funcionario.status)}>
                    {funcionario.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {funcionario.cargo && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{funcionario.cargo}</span>
                    </div>
                  )}
                  {funcionario.empresa && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{funcionario.empresa}</span>
                    </div>
                  )}
                  {funcionario.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{funcionario.email}</span>
                    </div>
                  )}
                  {funcionario.telefone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{funcionario.telefone}</span>
                    </div>
                  )}
                  {funcionario.dataAdmissao && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Admissão: {new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                {/* Certificados Section */}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Certificados ({certificadosByFuncionario.length})
                    </span>
                  </div>
                  {certificadosByFuncionario.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {certificadosByFuncionario.map((cert) => (
                        <Badge 
                          key={cert.id} 
                          variant="outline" 
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {cert.tipo}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Nenhum certificado cadastrado</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedFuncionario(funcionario);
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
                    onClick={() => handleAddCertificado(funcionario.id)}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Certificado
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFuncionarioToDelete(funcionario.id)}
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

      {filteredFuncionarios.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <UserPlus className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600">Nenhum funcionário encontrado</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm || statusFilter !== 'todos' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando um novo funcionário'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Forms */}
      <FuncionarioForm
        open={formOpen}
        onOpenChange={setFormOpen}
        funcionario={selectedFuncionario}
        onSave={handleSave}
      />

      <CertificadoFuncionarioForm
        open={certFormOpen}
        onOpenChange={setCertFormOpen}
        funcionarioId={selectedFuncionarioForCert}
        onSave={handleSaveCertificado}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!funcionarioToDelete} onOpenChange={() => setFuncionarioToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita e todos os certificados associados também serão removidos.
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