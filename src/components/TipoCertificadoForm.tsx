import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TipoCertificadoBase } from '@/types';
import { toast } from 'sonner';

interface TipoCertificadoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoCertificado?: TipoCertificadoBase | null;
  onSave: (data: Partial<TipoCertificadoBase>) => void;
}

export default function TipoCertificadoForm({ 
  open, 
  onOpenChange, 
  tipoCertificado, 
  onSave 
}: TipoCertificadoFormProps) {
  const [formData, setFormData] = useState({
    tipo: '',
    observacoes: '',
  });

  useEffect(() => {
    if (tipoCertificado) {
      setFormData({
        tipo: tipoCertificado.tipo || '',
        observacoes: tipoCertificado.observacoes || '',
      });
    } else {
      setFormData({
        tipo: '',
        observacoes: '',
      });
    }
  }, [tipoCertificado, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo) {
      toast.error('Tipo de certificado é obrigatório');
      return;
    }

    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tipoCertificado ? 'Editar Tipo de Certificado' : 'Novo Tipo de Certificado'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Certificado *</Label>
            <Input
              id="tipo"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              placeholder="Ex: NR-100, ASO, NR-35..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              placeholder="Informações adicionais sobre este tipo de certificado..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
              {tipoCertificado ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}