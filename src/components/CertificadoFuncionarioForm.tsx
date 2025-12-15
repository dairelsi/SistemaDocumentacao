import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Certificado, TipoCertificadoBase } from '@/types';
import { getTiposCertificado } from '@/lib/storage';
import { toast } from 'sonner';
import { Upload, X, FileText } from 'lucide-react';

interface CertificadoFuncionarioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificado?: Certificado | null;
  onSave: (data: Partial<Certificado>) => void;
  funcionarioId: string;
}

export default function CertificadoFuncionarioForm({ 
  open, 
  onOpenChange, 
  certificado, 
  onSave,
  funcionarioId 
}: CertificadoFuncionarioFormProps) {
  const [formData, setFormData] = useState({
    tipo: '',
    numero: '',
    dataEmissao: '',
    dataValidade: '',
    orgaoEmissor: '',
    funcionarioId: '',
    observacoes: '',
    arquivoUrl: '',
    arquivoNome: '',
  });
  const [arquivo, setArquivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tiposCertificado, setTiposCertificado] = useState<TipoCertificadoBase[]>([]);

  useEffect(() => {
    const loadTipos = async () => {
      const tipos = await getTiposCertificado();
      setTiposCertificado(tipos);
    };
    loadTipos();
  }, []);

  useEffect(() => {
    if (certificado) {
      setFormData({
        tipo: certificado.tipo || '',
        numero: certificado.numero || '',
        dataEmissao: certificado.dataEmissao || '',
        dataValidade: certificado.dataValidade || '',
        orgaoEmissor: certificado.orgaoEmissor || '',
        funcionarioId: certificado.funcionarioId || '',
        observacoes: certificado.observacoes || '',
        arquivoUrl: certificado.arquivoUrl || '',
        arquivoNome: certificado.arquivoNome || '',
      });
    } else {
      setFormData({
        tipo: '',
        numero: '',
        dataEmissao: new Date().toISOString().split('T')[0],
        dataValidade: '',
        orgaoEmissor: '',
        funcionarioId: funcionarioId || '',
        observacoes: '',
        arquivoUrl: '',
        arquivoNome: '',
      });
    }
    setArquivo(null);
  }, [certificado, funcionarioId, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos PDF, JPG ou PNG são permitidos');
        return;
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 5MB');
        return;
      }

      setArquivo(file);
      
      // Converter para base64 para armazenar no localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          arquivoUrl: reader.result as string,
          arquivoNome: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setArquivo(null);
    setFormData({
      ...formData,
      arquivoUrl: '',
      arquivoNome: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo || !formData.funcionarioId) {
      toast.error('Tipo e Funcionário são obrigatórios');
      return;
    }

    onSave(formData);
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
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposCertificado.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.tipo}>
                      {tipo.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {/* Upload de Arquivo */}
          <div className="space-y-2">
            <Label htmlFor="arquivo">Documento do Certificado</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {!arquivo && !formData.arquivoUrl ? (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Clique para fazer upload ou arraste o arquivo
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    PDF, JPG ou PNG (máx. 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="arquivo"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">
                      {arquivo?.name || formData.arquivoNome}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
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
              {certificado ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}