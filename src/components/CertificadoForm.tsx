import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Certificado } from '@/types';
import { getFuncionarios } from '@/lib/storage';
import { toast } from 'sonner';

interface CertificadoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificado?: Certificado | null;
  onSave: (data: Partial<Certificado>) => void;
  funcionarioId?: string;
}

export default function CertificadoForm({ 
  open, 
  onOpenChange, 
  certificado, 
  onSave,
  funcionarioId 
}: CertificadoFormProps) {
  const [formData, setFormData] = useState({
    tipo: '',
    numero: '',
    dataEmissao: '',
    dataValidade: '',
    orgaoEmissor: '',
    funcionarioId: '',
    observacoes: '',
  });
  const [vincularFuncionario, setVincularFuncionario] = useState(false);

  const [funcionarios, setFuncionarios] = useState([]);

  useEffect(() => {
    const load = async () => {
      const funcs = await getFuncionarios();
      setFuncionarios(funcs);
    };
    load();
  }, []);

  useEffect(() => {
    if (certificado) {
      setVincularFuncionario(!!certificado.funcionarioId);
      setFormData({
        tipo: certificado.tipo || '',
        numero: certificado.numero || '',
        dataEmissao: certificado.dataEmissao || '',
        dataValidade: certificado.dataValidade || '',
        orgaoEmissor: certificado.orgaoEmissor || '',
        funcionarioId: certificado.funcionarioId || '',
        observacoes: certificado.observacoes || '',
      });
    } else {
      setVincularFuncionario(!!funcionarioId);
      setFormData({
        tipo: '',
        numero: '',
        dataEmissao: new Date().toISOString().split('T')[0],
        dataValidade: '',
        orgaoEmissor: '',
        funcionarioId: funcionarioId || '',
        observacoes: '',
      });
    }
  }, [certificado, funcionarioId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo) {
      toast.error('Tipo de certificado é obrigatório');
      return;
    }

    // Remove funcionarioId se não estiver vinculando
    const dataToSave = {
      ...formData,
      funcionarioId: vincularFuncionario ? formData.funcionarioId : undefined,
    };

    onSave(dataToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {certificado ? 'Editar Certificado' : 'Novo Certificado'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Certificado *</Label>
              <Input
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                placeholder="Ex: NR-100, ASO, NR-35, CIPA..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero">Número do Certificado</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgaoEmissor">Órgão Emissor</Label>
              <Input
                id="orgaoEmissor"
                value={formData.orgaoEmissor}
                onChange={(e) => setFormData({ ...formData, orgaoEmissor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataEmissao">Data de Emissão</Label>
              <Input
                id="dataEmissao"
                type="date"
                value={formData.dataEmissao}
                onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataValidade">Data de Validade</Label>
              <Input
                id="dataValidade"
                type="date"
                value={formData.dataValidade}
                onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
              />
            </div>
          </div>

          {/* Seção opcional para vincular funcionário */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vincularFuncionario"
                checked={vincularFuncionario}
                onChange={(e) => {
                  setVincularFuncionario(e.target.checked);
                  if (!e.target.checked) {
                    setFormData({ ...formData, funcionarioId: '' });
                  }
                }}
                className="w-4 h-4"
                disabled={!!funcionarioId}
              />
              <Label htmlFor="vincularFuncionario" className="cursor-pointer">
                Vincular a um funcionário (opcional)
              </Label>
            </div>

            {vincularFuncionario && (
              <div className="space-y-2">
                <Label htmlFor="funcionario">Funcionário</Label>
                <Select
                  value={formData.funcionarioId}
                  onValueChange={(value) => setFormData({ ...formData, funcionarioId: value })}
                  disabled={!!funcionarioId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionarios.map((func) => (
                      <SelectItem key={func.id} value={func.id}>
                        {func.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              {certificado ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}