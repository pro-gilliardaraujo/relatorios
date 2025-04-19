'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ZipUpload } from '@/components/ZipUpload';

export default function IntegracaoPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState('');
  const [frente, setFrente] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTeste, setIsTeste] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validações
      if (!reportType) {
        throw new Error('Selecione o tipo de relatório');
      }

      if (!frente) {
        throw new Error('Selecione a frente');
      }

      if (reportType.includes('semanal')) {
        if (!startDate || !endDate) {
          throw new Error('Preencha as datas inicial e final para relatório semanal');
        }
      } else {
        if (!reportDate) {
          throw new Error('Preencha a data do relatório');
        }
      }

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Sucesso!',
        description: 'Relatório processado com sucesso.',
      });

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar o relatório.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Integração de Relatórios</CardTitle>
          <CardDescription>
            Faça upload dos arquivos ZIP contendo os relatórios para processamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Relatório Diário</SelectItem>
                    <SelectItem value="semanal">Relatório Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frente">Frente</Label>
                <Select value={frente} onValueChange={setFrente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frente1">Frente 1</SelectItem>
                    <SelectItem value="frente2">Frente 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === 'diario' ? (
                <div>
                  <Label htmlFor="reportDate">Data do Relatório</Label>
                  <Input
                    type="date"
                    id="reportDate"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                  />
                </div>
              ) : reportType === 'semanal' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isTeste"
                  checked={isTeste}
                  onChange={(e) => setIsTeste(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isTeste">Modo de teste</Label>
              </div>

              <div>
                <Label>Upload de Arquivos</Label>
                <ZipUpload />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processando...' : 'Processar Relatório'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 