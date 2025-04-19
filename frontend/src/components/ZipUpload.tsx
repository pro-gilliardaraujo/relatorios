'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function ZipUpload() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;

    // Validar se é um arquivo ZIP
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: 'Erro',
        description: 'Apenas arquivos ZIP são permitidos.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/integracao/upload-zip', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      const data = await response.json();

      toast({
        title: 'Sucesso!',
        description: 'Arquivo enviado com sucesso.',
      });

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao fazer upload do arquivo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
        </div>
      ) : uploadedFile ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium">{uploadedFile.name}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setUploadedFile(null);
            }}
          >
            Remover
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Solte o arquivo aqui'
              : 'Arraste e solte um arquivo ZIP ou clique para selecionar'}
          </p>
        </div>
      )}
    </div>
  );
} 