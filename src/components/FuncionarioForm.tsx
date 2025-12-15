import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Funcionario } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

interface FuncionarioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionario?: Funcionario | null;
  onSave: (data: Partial<Funcionario>) => void;
}

export default function FuncionarioForm({ open, onOpenChange, funcionario, onSave }: FuncionarioFormProps) {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isTerceiro = currentUser?.nivelAcesso === 'terceiro';
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    empresa: '',
    empresaId: '',
    cargo: '',
    setor: '',
    dataAdmissao: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'afastado',
    observacoes: '',
  });

  useEffect(() => {
    if (funcionario) {
      setFormData({
        nome: funcionario.nome || '',
        cpf: funcionario.cpf || '',
        rg: funcionario.rg || '',
        dataNascimento: funcionario.dataNascimento || '',
        email: funcionario.email || '',
        telefone: funcionario.telefone || '',
        empresa: funcionario.empresa || '',
        empresaId: funcionario.empresaId || '',
        cargo: funcionario.cargo || '',
        setor: funcionario.setor || '',
        dataAdmissao: funcionario.dataAdmissao || '',
        status: funcionario.status || 'ativo',
        observacoes: funcionario.observacoes || '',
      });
    } else {
      // Se for usuário terceiro, preencher automaticamente com dados da empresa
      const empresaNome = isTerceiro && currentUser?.empresaNome ? currentUser.empresaNome : '';
      const empresaId = isTerceiro && currentUser?.empresaId ? currentUser.empresaId : '';
      
      setFormData({
        nome: '',
        cpf: '',
        rg: '',
        dataNascimento: '',
        email: '',
        telefone: '',
        empresa: empresaNome,
        empresaId: empresaId,
        cargo: '',
        setor: '',
        dataAdmissao: new Date().toISOString().split('T')[0],
        status: 'ativo',
        observacoes: '',
      });
    }
  }, [funcionario, open, isTerceiro, currentUser?.empresaNome, currentUser?.empresaId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.cpf) {
      toast.error('Nome e CPF são obrigatórios');
      return;
    }

    // Se for usuário terceiro, garantir que empresaId está definido
    const dataToSave = {
      ...formData,
      empresaId: isTerceiro && currentUser?.empresaId ? currentUser.empresaId : formData.empresaId,
      empresa: isTerceiro && currentUser?.empresaNome ? currentUser.empresaNome : formData.empresa,
    };

    onSave(dataToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                placeholder="Digite o nome da empresa"
                disabled={isTerceiro}
              />
              {isTerceiro && (
                <p className="text-xs text-gray-500">
                  Empresa definida automaticamente: {currentUser?.empresaNome}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Input
                id="setor"
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataAdmissao">Data de Admissão</Label>
              <Input
                id="dataAdmissao"
                type="date"
                value={formData.dataAdmissao}
                onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'ativo' | 'inativo' | 'afastado') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
              {funcionario ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}