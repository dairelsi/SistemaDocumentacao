import { Usuario, NivelAcesso, Funcionario } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  getUsuarios, 
  criarUsuario, 
  atualizarUsuario, 
  excluirUsuario,
  getCurrentUser
} from '@/lib/auth';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2,
  Shield,
  UserCog,
  Eye,
  Building2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    nivelAcesso: 'editor' as NivelAcesso,
    empresaNome: '',
  });

  
  const loadUsuarios = useCallback(async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      toast.error('Erro ao carregar usuários');
    }
  }, []);

  const filterUsuarios = useCallback(() => {
    try {
      let filtered = [...usuarios];

      if (searchTerm) {
        filtered = filtered.filter(u => 
          u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.empresaNome && u.empresaNome.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredUsuarios(filtered);
    } catch (error) {
      console.error('Error filtering usuarios:', error);
    }
  }, [usuarios, searchTerm]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setLoading(true);
        await loadUsuarios();
        const f = await getFuncionarios();
        if (mounted) setFuncionarios(f);
      } catch (error) {
        console.error('Error in useEffect:', error);
        toast.error('Erro ao carregar página');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, [loadUsuarios]);

  useEffect(() => {
    filterUsuarios();
  }, [filterUsuarios]);

  const handleOpenForm = (usuario?: Usuario) => {
    try {
      if (usuario) {
        setSelectedUsuario(usuario);
        setFormData({
          nome: usuario.nome,
          email: usuario.email,
          senha: '',
          nivelAcesso: usuario.nivelAcesso,
          empresaNome: usuario.empresaNome || '',
        });
      } else {
        setSelectedUsuario(null);
        setFormData({
          nome: '',
          email: '',
          senha: '',
          nivelAcesso: 'editor',
          empresaNome: '',
        });
      }
      setFormOpen(true);
    } catch (error) {
      console.error('Error opening form:', error);
      toast.error('Erro ao abrir formulário');
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.nome || !formData.email) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      if (!selectedUsuario && !formData.senha) {
        toast.error('A senha é obrigatória para novos usuários');
        return;
      }

      if (formData.nivelAcesso === 'terceiro' && !formData.empresaNome) {
        toast.error('Nome da empresa é obrigatório para usuários terceiros');
        return;
      }

        if (selectedUsuario) {
        const updateData: Partial<Usuario> = {
          nome: formData.nome,
          email: formData.email,
          nivelAcesso: formData.nivelAcesso,
          empresaNome: formData.nivelAcesso === 'terceiro' ? formData.empresaNome : undefined,
          empresaId: formData.nivelAcesso === 'terceiro' ? selectedUsuario.empresaId : undefined,
        };
        
        if (formData.senha) {
          updateData.senha = formData.senha;
        }
        
        await atualizarUsuario(selectedUsuario.id, updateData as Partial<Usuario>);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        const empresaId = formData.nivelAcesso === 'terceiro' ? Date.now().toString() : undefined;
        await criarUsuario(
          formData.nome,
          formData.email,
          formData.senha,
          formData.nivelAcesso,
          empresaId,
          formData.nivelAcesso === 'terceiro' ? formData.empresaNome : undefined
        );
        toast.success('Usuário criado com sucesso!');
      }
      
      await loadUsuarios();
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar usuário';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (usuarioToDelete) {
      try {
        if (usuarioToDelete === currentUser?.id) {
          toast.error('Você não pode excluir seu próprio usuário');
          setUsuarioToDelete(null);
          return;
        }
        await excluirUsuario(usuarioToDelete);
        toast.success('Usuário excluído com sucesso!');
        await loadUsuarios();
      } catch (error) {
        console.error('Error deleting:', error);
        toast.error('Erro ao excluir usuário');
      }
      setUsuarioToDelete(null);
    }
  };

  const getNivelAcessoIcon = (nivel: NivelAcesso) => {
    switch (nivel) {
      case 'administrador':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'editor':
        return <UserCog className="w-4 h-4 text-blue-600" />;
      case 'terceiro':
        return <Eye className="w-4 h-4 text-purple-600" />;
    }
  };

  const getNivelAcessoLabel = (nivel: NivelAcesso) => {
    switch (nivel) {
      case 'administrador':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      case 'terceiro':
        return 'Parceiro';
    }
  };

  const getNivelAcessoColor = (nivel: NivelAcesso) => {
    switch (nivel) {
      case 'administrador':
        return 'bg-red-100 text-red-700';
      case 'editor':
        return 'bg-blue-100 text-blue-700';
      case 'terceiro':
        return 'bg-purple-100 text-purple-700';
    }
  };

  const currentUser = getCurrentUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Usuários</h2>
          <p className="text-gray-500 mt-1">Gerencie os usuários do sistema</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usuarios.filter(u => u.nivelAcesso === 'administrador').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCog className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Editores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usuarios.filter(u => u.nivelAcesso === 'editor').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Parceiros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usuarios.filter(u => u.nivelAcesso === 'terceiro').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-600">
        Mostrando {filteredUsuarios.length} de {usuarios.length} usuários
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsuarios.map((usuario) => (
          <Card key={usuario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{usuario.nome}</CardTitle>
                  <p className="text-sm text-gray-500">{usuario.email}</p>
                </div>
                <Badge className={getNivelAcessoColor(usuario.nivelAcesso)}>
                  <span className="flex items-center gap-1">
                    {getNivelAcessoIcon(usuario.nivelAcesso)}
                    {getNivelAcessoLabel(usuario.nivelAcesso)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={usuario.ativo ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                {usuario.empresaNome && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{usuario.empresaNome}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenForm(usuario)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setUsuarioToDelete(usuario.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={usuario.id === currentUser?.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsuarios.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <UserPlus className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600">Nenhum usuário encontrado</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando um novo usuário'
              }
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUsuario ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              {selectedUsuario 
                ? 'Atualize as informações do usuário. Deixe a senha em branco para mantê-la.'
                : 'Preencha os dados para criar um novo usuário.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">
                Senha {!selectedUsuario && '*'}
              </Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder={selectedUsuario ? 'Deixe em branco para manter' : 'Senha'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nivelAcesso">Nível de Acesso *</Label>
              <Select
                value={formData.nivelAcesso}
                onValueChange={(value: NivelAcesso) => setFormData({ ...formData, nivelAcesso: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      Administrador - Acesso total
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-blue-600" />
                      Editor - Pode criar e editar
                    </div>
                  </SelectItem>
                  <SelectItem value="terceiro">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-600" />
                      Parceiro - Gerencia própria empresa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.nivelAcesso === 'terceiro' && (
              <div className="space-y-2">
                <Label htmlFor="empresaNome">Nome da Empresa *</Label>
                <Input
                  id="empresaNome"
                  value={formData.empresaNome}
                  onChange={(e) => setFormData({ ...formData, empresaNome: e.target.value })}
                  placeholder="Nome da empresa parceira"
                />
                <p className="text-xs text-gray-500">
                  Usuário parceiro poderá criar e gerenciar funcionários apenas da própria empresa
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
              {selectedUsuario ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!usuarioToDelete} onOpenChange={() => setUsuarioToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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