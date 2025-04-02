'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid, Center, Spinner, Button, Switch, FormControl, FormLabel, Grid, GridItem, Card, CardBody } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';
import { GraficoDisponibilidadeMecanicaColheita } from '@/components/Charts/Colheita/Diario/GraficoDisponibilidadeMecanicaColheita';
import { GraficoEficienciaEnergetica } from '@/components/Charts/Colheita/Diario/GraficoEficienciaEnergetica';
import { GraficoHorasElevador } from '@/components/Charts/Colheita/Diario/GraficoHorasElevador';
import { GraficoMotorOciosoColheita } from '@/components/Charts/Colheita/Diario/GraficoMotorOciosoColheita';
import { GraficoUsoGPS } from '@/components/Charts/Colheita/Diario/GraficoUsoGPS';
import { RelatorioColheitaResumo, ResumoData, MetricData, FrotaData, OperadorData } from '@/components/RelatorioColheitaResumo';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaPrint } from 'react-icons/fa';
import { configManager } from '@/utils/config';
import { GraficoTDH } from '@/components/Charts/Colheita/Semanal/GraficoTDH';
import { GraficoDiesel } from '@/components/Charts/Colheita/Semanal/GraficoDiesel';
import { GraficoImpurezaVegetal } from '@/components/Charts/Colheita/Semanal/GraficoImpurezaVegetal';
import { DateRangeDisplay } from '@/components/DateRangeDisplay';
import { useReportData } from '@/hooks/useReportData';

// Dados de exemplo para visualização offline
const dadosExemplo = {
  tdh: [
    { frota: '7041', valor: 45.2 },
    { frota: '7042', valor: 42.8 }
  ],
  diesel: [
    { frota: '7041', valor: 28.5 },
    { frota: '7042', valor: 30.2 }
  ],
  impureza_vegetal: [
    { frota: '7041', valor: 3.2 },
    { frota: '7042', valor: 3.8 }
  ],
  disponibilidade_mecanica: [
    { frota: '7041', disponibilidade: 94.49 },
    { frota: '7042', disponibilidade: 92.82 }
  ],
  eficiencia_energetica: [
    { id: '1', nome: 'SEM OPERADOR', eficiencia: 39 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', eficiencia: 59 },
    { id: '9999', nome: 'TROCA DE TURNO', eficiencia: 53 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', eficiencia: 60 },
    { id: '11', nome: 'NAO CADASTRADO', eficiencia: 62 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', eficiencia: 38 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', eficiencia: 38 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', eficiencia: 55 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', eficiencia: 31 }
  ],
  hora_elevador: [
    { id: '1', nome: 'SEM OPERADOR', horas: 2.42 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', horas: 7.42 },
    { id: '9999', nome: 'TROCA DE TURNO', horas: 7.59 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', horas: 6.33 },
    { id: '11', nome: 'NAO CADASTRADO', horas: 6.26 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', horas: 4.54 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', horas: 4.62 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', horas: 5.10 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', horas: 0.42 }
  ],
  motor_ocioso: [
    { id: '1', nome: 'SEM OPERADOR', percentual: 28.1 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', percentual: 25.1 },
    { id: '9999', nome: 'TROCA DE TURNO', percentual: 29.9 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', percentual: 22.0 },
    { id: '11', nome: 'NAO CADASTRADO', percentual: 19.4 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', percentual: 40.1 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', percentual: 31.5 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', percentual: 32.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', percentual: 36.8 }
  ],
  uso_gps: [
    { id: '1', nome: 'SEM OPERADOR', porcentagem: 0.0 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', porcentagem: 0.0 },
    { id: '9999', nome: 'TROCA DE TURNO', porcentagem: 0.0 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', porcentagem: 0.0 },
    { id: '11', nome: 'NAO CADASTRADO', porcentagem: 0.0 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', porcentagem: 2.3 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', porcentagem: 1.7 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', porcentagem: 0.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', porcentagem: 0.0 }
  ]
};

interface ColheitaA4Props {
  data?: any;
}

// Função utilitária para verificar formato de dados
const verificarFormatoDados = (dados: any) => {
  if (!dados) return false;
  
  const temDisponibilidade = Array.isArray(dados.disponibilidade_mecanica) && 
    dados.disponibilidade_mecanica.length > 0 &&
    dados.disponibilidade_mecanica.some((item: any) => item && item.frota && item.disponibilidade !== undefined);
  
  const temEficiencia = Array.isArray(dados.eficiencia_energetica) && 
    dados.eficiencia_energetica.length > 0 &&
    dados.eficiencia_energetica.some((item: any) => item && item.nome && item.eficiencia !== undefined);
  
  const temHorasElevador = Array.isArray(dados.hora_elevador) && 
    dados.hora_elevador.length > 0 &&
    dados.hora_elevador.some((item: any) => item && item.nome && item.horas !== undefined);
  
  const temMotorOcioso = Array.isArray(dados.motor_ocioso) && 
    dados.motor_ocioso.length > 0 &&
    dados.motor_ocioso.some((item: any) => item && item.nome && item.percentual !== undefined);
  
  const temUsoGPS = Array.isArray(dados.uso_gps) && 
    dados.uso_gps.length > 0 &&
    dados.uso_gps.some((item: any) => item && item.nome && item.porcentagem !== undefined);
  
  // Verificar se pelo menos uma das seções tem dados
  return temDisponibilidade || temEficiencia || temHorasElevador || temMotorOcioso || temUsoGPS;
};

// Componente para título de seção
const SectionTitle = ({ title, centered = true }: { title: string; centered?: boolean }) => (
  <Heading 
    as="h2" 
    size="sm" 
    textAlign={centered ? "center" : "left"} 
    mb={2} 
    fontSize="15px"
    color="black"
  >
    {title}
  </Heading>
);

// Componente para card de indicador
const IndicatorCard = ({ title, value, meta, isInverted = false }: { title: string; value: number; meta: number; isInverted?: boolean }) => {
  const isAboveTarget = isInverted ? value <= meta : value >= meta;
  
  return (
    <Card bg="white" boxShadow="sm" borderWidth="1px" borderColor="gray.200">
      <CardBody>
        <Text fontSize="sm" fontWeight="bold" color="black">{title}</Text>
        <Text fontSize="lg" color="black">{value.toFixed(2)}</Text>
        <Text fontSize="xs" color={isAboveTarget ? "green.500" : "red.500"}>
          Meta: {meta}
        </Text>
      </CardBody>
    </Card>
  );
};

interface DataItem {
  frota?: string;
  valor?: number;
  disponibilidade?: number;
  operador?: string;
  horas?: number;
  percentual?: number;
  porcentagem?: number;
}

interface AcimaMeta {
  quantidade: number;
  total: number;
  percentual: number;
}

export default function ColheitaA4({ data }: ColheitaA4Props) {
  // Hooks e estados
  const { images } = useReportStore();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const format = searchParams.get('format');
  const isPdfMode = format === 'pdf';
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useExampleData, setUseExampleData] = useState<boolean>(false);
  const [nomeFrente, setNomeFrente] = useState<string>('');
  
  // Função para formatar a data no padrão brasileiro
  const formatarData = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Função para gerar o nome do arquivo PDF
  const gerarNomeArquivo = () => {
    const data = reportData?.data ? formatarData(reportData.data).replace(/\//g, '-') : formatarData(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    return `Relatório de Colheita Diário - ${nomeFrente} - ${data}.pdf`;
  };

  const currentDate = formatarData(new Date().toISOString().split('T')[0]);
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  useEffect(() => {
    const loadData = async () => {
      try {
        // Recarrega as configurações antes de carregar os dados
        await configManager.reloadConfig();
        
        let subscription: any = null;

        const fetchReportData = async () => {
          // Se não tiver ID, apenas mostrar o layout com dados de exemplo
          if (!reportId) {
            console.log('📋 Modo de visualização offline - usando dados de exemplo');
            setLoading(false);
            setUseExampleData(true);
            return;
          }

          try {
            console.log(`📊 Buscando dados do relatório ID: ${reportId}`);
            const { data: report, error } = await supabase
              .from('relatorios_diarios')
              .select('*')
              .eq('id', reportId)
              .single();

            if (error) {
              console.error('❌ Erro ao buscar dados:', error);
              setError(`Erro ao buscar dados: ${error.message}`);
              setLoading(false);
              setUseExampleData(true);
              return;
            }

            if (!report) {
              console.error('❌ Relatório não encontrado');
              setError('Relatório não encontrado');
              setLoading(false);
              setUseExampleData(true);
              return;
            }

            console.log('✅ Dados carregados com sucesso:', {
              tipo: report.tipo,
              frente: report.frente,
              status: report.status,
              dados: report.dados ? 'Presentes' : 'Ausentes'
            });

            // Log detalhado dos dados
            if (report.dados) {
              console.log('📊 DADOS BRUTOS:', JSON.stringify(report.dados, null, 2));
            }

            setReportData(report);
            setNomeFrente(report.frente || ''); // Atualiza o nome da frente
            setLoading(false);
            setUseExampleData(false);

            // Configurar subscription para atualizações em tempo real
            subscription = supabase
              .channel('relatorios_changes')
              .on(
                'postgres_changes',
                {
                  event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
                  schema: 'public',
                  table: 'relatorios_diarios',
                  filter: `id=eq.${reportId}`
                },
                async (payload) => {
                  console.log('🔄 Atualização detectada:', payload);
                  
                  // Buscar dados atualizados
                  const { data: updatedReport, error: refreshError } = await supabase
                    .from('relatorios_diarios')
                    .select('*')
                    .eq('id', reportId)
                    .single();

                  if (refreshError) {
                    console.error('❌ Erro ao atualizar dados:', refreshError);
                    return;
                  }

                  if (updatedReport) {
                    console.log('✅ Dados atualizados com sucesso');
                    setReportData(updatedReport);
                    setNomeFrente(updatedReport.frente || ''); // Atualiza o nome da frente quando houver atualização
                  }
                }
              )
              .subscribe();

          } catch (error) {
            console.error('❌ Erro ao buscar dados do relatório:', error);
            setError(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            setLoading(false);
            setUseExampleData(true);
          }
        };

        fetchReportData();

        // Cleanup: remover subscription quando o componente for desmontado
        return () => {
          if (subscription) {
            supabase.removeChannel(subscription);
          }
        };
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, [searchParams?.get('id')]);

  // PREPARAÇÃO DE DADOS
  const finalData = useMemo(() => {
    if (!useExampleData && reportData?.dados) {
      console.log('📊 DADOS BRUTOS DO RELATÓRIO:', reportData);
      
      // Função auxiliar para processar operador no formato "ID - NOME"
      const processarOperador = (operador: any) => {
        if (!operador || operador === 0) return null;
        const match = String(operador).match(/^(\d+)\s*-\s*(.+)$/);
        return match ? { id: match[1], nome: match[2].trim() } : null;
      };

      // Função auxiliar para converter número
      const converterNumero = (valor: any) => {
        if (typeof valor === 'number') return Number(valor.toFixed(2));
        if (typeof valor === 'string') return Number(parseFloat(valor).toFixed(2));
        return 0;
      };

      // Função auxiliar para processar porcentagem
      const processarPorcentagem = (valor: any) => {
        const numero = converterNumero(valor);
        return Number((numero * 100).toFixed(2)); // Converter para porcentagem e fixar 2 casas decimais
      };

      // Garantir que os dados estejam no formato correto
      const dadosProcessados = {
        tdh: Array.isArray(reportData.dados.tdh) 
          ? reportData.dados.tdh
              .filter((item: any) => item && item.Frota && item.TDH !== undefined)
              .map((item: any) => ({
                frota: String(item.Frota),
                valor: converterNumero(item.TDH)
              }))
          : [],
        diesel: Array.isArray(reportData.dados.diesel) 
          ? reportData.dados.diesel
              .filter((item: any) => item && item.Frota && item.Consumo !== undefined)
              .map((item: any) => ({
                frota: String(item.Frota),
                valor: converterNumero(item.Consumo)
              }))
          : [],
        impureza_vegetal: Array.isArray(reportData.dados.impureza_vegetal) 
          ? reportData.dados.impureza_vegetal
              .filter((item: any) => item && item.Frota && item.Impureza !== undefined)
              .map((item: any) => ({
                frota: String(item.Frota),
                valor: converterNumero(item.Impureza)
              }))
          : [],
        disponibilidade_mecanica: Array.isArray(reportData.dados.disponibilidade_mecanica) 
          ? reportData.dados.disponibilidade_mecanica
              .filter((item: any) => item && item.Frota && item.Disponibilidade !== undefined)
              .map((item: any) => ({
                frota: String(item.Frota),
                disponibilidade: processarPorcentagem(item.Disponibilidade)
              }))
          : [],
        eficiencia_energetica: Array.isArray(reportData.dados.eficiencia_energetica)
          ? reportData.dados.eficiencia_energetica
              .filter((item: any) => item && item.Operador && item.Operador !== 0)
              .map((item: any) => {
                const operador = processarOperador(item.Operador);
                if (!operador) return null;
                return {
                  id: operador.id,
                  nome: operador.nome,
                  eficiencia: processarPorcentagem(item["Eficiência Energética"])
                };
              })
              .filter((item: any) => item !== null)
              .sort((a: any, b: any) => b.eficiencia - a.eficiencia)
          : [],
        hora_elevador: Array.isArray(reportData.dados.hora_elevador)
          ? reportData.dados.hora_elevador
              .filter((item: any) => item && item.Operador && item.Operador !== 0)
              .map((item: any) => {
                const operador = processarOperador(item.Operador);
                if (!operador) return null;
                return {
                  id: operador.id,
                  nome: operador.nome,
                  horas: converterNumero(item.Horas)
                };
              })
              .filter((item: any) => item !== null)
          : [],
        motor_ocioso: Array.isArray(reportData.dados.motor_ocioso)
          ? reportData.dados.motor_ocioso
              .filter((item: any) => item && item.Operador && item.Operador !== 0)
              .map((item: any) => {
                const operador = processarOperador(item.Operador);
                if (!operador) return null;
                return {
                  id: operador.id,
                  nome: operador.nome,
                  percentual: processarPorcentagem(item["Porcentagem Ociosa"])
                };
              })
              .filter((item: any) => item !== null)
          : [],
        uso_gps: Array.isArray(reportData.dados.uso_gps)
          ? reportData.dados.uso_gps
              .filter((item: any) => item && item.Operador && item.Operador !== 0)
              .map((item: any) => {
                const operador = processarOperador(item.Operador);
                if (!operador) return null;
                return {
                  id: operador.id,
                  nome: operador.nome,
                  porcentagem: processarPorcentagem(item["Porcentagem Uso"])
                };
              })
              .filter((item: any) => item !== null)
          : []
      };

      // Log detalhado após processamento
      console.log('📊 DADOS APÓS PROCESSAMENTO:', {
        tdh: dadosProcessados.tdh.map((d: { frota: string; valor: number }) => ({ 
          frota: d.frota, 
          valor: d.valor 
        })),
        diesel: dadosProcessados.diesel.map((d: { frota: string; valor: number }) => ({ 
          frota: d.frota, 
          valor: d.valor 
        })),
        impurezaVegetal: dadosProcessados.impureza_vegetal.map((d: { frota: string; valor: number }) => ({ 
          frota: d.frota, 
          valor: d.valor 
        })),
        disponibilidade: dadosProcessados.disponibilidade_mecanica.map((d: { frota: string; disponibilidade: number }) => ({ 
          frota: d.frota, 
          valor: d.disponibilidade 
        })),
        eficiencia: dadosProcessados.eficiencia_energetica.map((e: { nome: string; eficiencia: number }) => ({ 
          nome: e.nome, 
          valor: e.eficiencia 
        })),
        motorOcioso: dadosProcessados.motor_ocioso.map((m: { nome: string; percentual: number }) => ({ 
          nome: m.nome, 
          valor: m.percentual 
        })),
        horasElevador: dadosProcessados.hora_elevador.map((h: { nome: string; horas: number }) => ({ 
          nome: h.nome, 
          valor: h.horas 
        })),
        usoGPS: dadosProcessados.uso_gps.map((g: { nome: string; porcentagem: number }) => ({ 
          nome: g.nome, 
          valor: g.porcentagem 
        }))
      });

      return dadosProcessados;
    }

    console.log('📊 Usando dados de exemplo');
    return dadosExemplo;
  }, [useExampleData, reportData]);

  // Preparar os arrays de dados
  const finalDataDisponibilidade = useMemo(() => {
    const data = Array.isArray(finalData.disponibilidade_mecanica) ? finalData.disponibilidade_mecanica : [];
    console.log('📊 Dados de disponibilidade processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);
  
  const finalDataEficiencia = useMemo(() => {
    const data = Array.isArray(finalData.eficiencia_energetica) ? finalData.eficiencia_energetica : [];
    console.log('📊 Dados de eficiência processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);
  
  const finalDataHorasElevador = useMemo(() => {
    const data = Array.isArray(finalData.hora_elevador) ? finalData.hora_elevador : [];
    console.log('📊 Dados de horas elevador processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);
  
  const finalDataMotorOcioso = useMemo(() => {
    const data = Array.isArray(finalData.motor_ocioso) ? finalData.motor_ocioso : [];
    console.log('📊 Dados de motor ocioso processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);
  
  const finalDataUsoGPS = useMemo(() => {
    const data = Array.isArray(finalData.uso_gps) ? finalData.uso_gps : [];
    console.log('📊 Dados de uso GPS processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);

  // Verificar se estamos no modo de visualização ou no modo de relatório específico
  const isModoTemplate = !reportId;

  // Log para debug
  useEffect(() => {
    if (!loading) {
      console.log('===== DETALHES DO RELATÓRIO =====');
      console.log('📊 Modo:', isModoTemplate ? 'Template/Layout' : 'Relatório Específico');
      console.log('📊 ID do relatório:', reportId || 'Nenhum');
      console.log('📊 Usando dados de exemplo:', useExampleData);
      console.log('📊 Disponibilidade:', finalDataDisponibilidade.length, 'itens');
      console.log('📊 Eficiência:', finalDataEficiencia.length, 'itens');
      console.log('📊 Horas elevador:', finalDataHorasElevador.length, 'itens');
      console.log('📊 Motor ocioso:', finalDataMotorOcioso.length, 'itens');
      console.log('📊 Uso GPS:', finalDataUsoGPS.length, 'itens');
      
      // Verificar primeiro item de cada seção para depuração
      if (finalDataDisponibilidade.length > 0) {
        console.log('📊 Exemplo Disponibilidade:', finalDataDisponibilidade[0]);
      }
      if (finalDataEficiencia.length > 0) {
        console.log('📊 Exemplo Eficiência:', finalDataEficiencia[0]);
      }
    }
  }, [loading, isModoTemplate, reportId, useExampleData, finalDataDisponibilidade, finalDataEficiencia, finalDataHorasElevador, finalDataMotorOcioso, finalDataUsoGPS]);

  // FUNÇÕES
  // Função para imprimir o relatório
  const handlePrint = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pdf?id=${reportId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = gerarNomeArquivo(); // Define o nome do arquivo
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Erro ao gerar PDF. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular média
  const calcularMedia = (array: any[] | undefined, propriedade: string): number => {
    if (!array || array.length === 0) return 0;
    
    // Filtrar apenas itens que têm operador/frota preenchidos
    const itensFiltrados = array.filter(item => {
      if (!item) return false;
      
      // Para disponibilidade, verificar se tem frota
      if (propriedade === 'disponibilidade') {
        return item.frota && item.frota.trim() !== '';
      }
      
      // Para outros, verificar se tem nome de operador
      return item.nome && item.nome.trim() !== '';
    });
    
    // Se não há itens válidos, retorna zero
    if (itensFiltrados.length === 0) return 0;
    
    // Calcula a média apenas dos itens com operador/frota válidos
    return itensFiltrados.reduce((acc: number, item: any) => acc + Number(item[propriedade] || 0), 0) / itensFiltrados.length;
  };

  // Função para calcular total
  const calcularTotal = (array: any[] | undefined, propriedade: string): number => {
    if (!array || array.length === 0) return 0;
    
    // Filtrar apenas itens que têm operador preenchido
    const itensFiltrados = array.filter(item => 
      item && item.nome && item.nome.trim() !== ''
    );
    
    // Soma apenas os itens com operador válido
    return itensFiltrados.reduce((acc: number, item: any) => acc + Number(item[propriedade] || 0), 0);
  };

  // Função para contar itens que atendem à meta
  const contarItensMeta = (array: any[] | undefined, propriedade: string, meta: number, acima: boolean = true): number => {
    if (!array || array.length === 0) return 0;
    
    // Filtrar apenas itens que têm operador/frota preenchidos
    const itensFiltrados = array.filter(item => {
      if (!item) return false;
      
      // Para disponibilidade, verificar se tem frota
      if (propriedade === 'disponibilidade') {
        return item.frota && item.frota.trim() !== '';
      }
      
      // Para outros, verificar se tem nome de operador
      return item.nome && item.nome.trim() !== '';
    });
    
    // Conta itens que atendem à meta
    return itensFiltrados.filter(item => 
      acima ? (Number(item[propriedade] || 0) >= meta) : (Number(item[propriedade] || 0) <= meta)
    ).length;
  };

  // COMPONENTES
  // Componente para o cabeçalho da página
  const PageHeader = ({ showDate = false }: { showDate?: boolean }) => {
    const { reportData } = useReportData();
    const startDate = reportData?.startDate ? new Date(reportData.startDate) : new Date();
    const endDate = reportData?.endDate ? new Date(reportData.endDate) : new Date();
    const frontName = reportData?.frontName || 'Frente 01';

    return (
      <Box w="100%" bg="white" py={4}>
        <Center>
          <VStack spacing={2}>
            <Image src={LOGO_URL} alt="Logo" h={LOGO_HEIGHT} />
            <Heading size="md" textAlign="center" color="black">
              Relatório Semanal de Colheita - {frontName}
            </Heading>
            {showDate && <DateRangeDisplay startDate={startDate} endDate={endDate} />}
          </VStack>
        </Center>
      </Box>
    );
  };

  // Preparar dados para TDH
  const finalDataTDH = useMemo(() => {
    if (!reportData?.tdh) return [];
    return reportData.tdh
      .filter((item: any) => item && item.frota && item.frota.trim() !== '')
      .map((item: any) => ({
        frota: item.frota,
        valor: item.valor
      }));
  }, [reportData]);

  // Preparar dados para Diesel
  const finalDataDiesel = useMemo(() => {
    if (!reportData?.diesel) return [];
    return reportData.diesel
      .filter((item: any) => item && item.frota && item.frota.trim() !== '')
      .map((item: any) => ({
        frota: item.frota,
        valor: item.valor
      }));
  }, [reportData]);

  // Preparar dados para Impureza Vegetal
  const finalDataImpureza = useMemo(() => {
    if (!reportData?.impureza_vegetal) return [];
    return reportData.impureza_vegetal
      .filter((item: any) => item && item.frota && item.frota.trim() !== '')
      .map((item: any) => ({
        frota: item.frota,
        valor: item.valor
      }));
  }, [reportData]);

  // Preparar dados do resumo
  const resumoData = useMemo(() => {
    const tdh: MetricData = {
      data: finalDataTDH,
      meta: configManager.getMetas('colheita_semanal').tdh,
      media: calcularMedia(finalDataTDH, 'valor')
    };

    const diesel: MetricData = {
      data: finalDataDiesel,
      meta: configManager.getMetas('colheita_semanal').diesel,
      media: calcularMedia(finalDataDiesel, 'valor')
    };

    const impurezaVegetal: MetricData = {
      data: finalDataImpureza,
      meta: configManager.getMetas('colheita_semanal').impureza_vegetal,
      media: calcularMedia(finalDataImpureza, 'valor')
    };

    const disponibilidadeMecanica: MetricData = {
      data: finalDataDisponibilidade,
      meta: configManager.getMetas('colheita_semanal').disponibilidadeMecanica,
      media: calcularMedia(finalDataDisponibilidade, 'disponibilidade'),
      acimaMeta: {
        quantidade: contarItensMeta(finalDataDisponibilidade, 'disponibilidade', configManager.getMetas('colheita_semanal').disponibilidadeMecanica),
        total: finalDataDisponibilidade.length,
        percentual: (contarItensMeta(finalDataDisponibilidade, 'disponibilidade', configManager.getMetas('colheita_semanal').disponibilidadeMecanica) / finalDataDisponibilidade.length) * 100
      }
    };

    const eficienciaEnergetica: MetricData = {
      data: finalDataEficiencia,
      meta: configManager.getMetas('colheita_semanal').eficienciaEnergetica,
      media: calcularMedia(finalDataEficiencia, 'eficiencia'),
      acimaMeta: {
        quantidade: contarItensMeta(finalDataEficiencia, 'eficiencia', configManager.getMetas('colheita_semanal').eficienciaEnergetica),
        total: finalDataEficiencia.length,
        percentual: (contarItensMeta(finalDataEficiencia, 'eficiencia', configManager.getMetas('colheita_semanal').eficienciaEnergetica) / finalDataEficiencia.length) * 100
      }
    };

    const horaElevador: MetricData = {
      data: finalDataHorasElevador,
      meta: configManager.getMetas('colheita_semanal').horaElevador,
      media: calcularMedia(finalDataHorasElevador, 'horas'),
      acimaMeta: {
        quantidade: contarItensMeta(finalDataHorasElevador, 'horas', configManager.getMetas('colheita_semanal').horaElevador),
        total: finalDataHorasElevador.length,
        percentual: (contarItensMeta(finalDataHorasElevador, 'horas', configManager.getMetas('colheita_semanal').horaElevador) / finalDataHorasElevador.length) * 100
      }
    };

    const motorOcioso: MetricData = {
      data: finalDataMotorOcioso,
      meta: configManager.getMetas('colheita_semanal').motorOcioso,
      media: calcularMedia(finalDataMotorOcioso, 'percentual'),
      acimaMeta: {
        quantidade: contarItensMeta(finalDataMotorOcioso, 'percentual', configManager.getMetas('colheita_semanal').motorOcioso, false),
        total: finalDataMotorOcioso.length,
        percentual: (contarItensMeta(finalDataMotorOcioso, 'percentual', configManager.getMetas('colheita_semanal').motorOcioso, false) / finalDataMotorOcioso.length) * 100
      }
    };

    const usoGPS: MetricData = {
      data: finalDataUsoGPS,
      meta: configManager.getMetas('colheita_semanal').usoGPS,
      media: calcularMedia(finalDataUsoGPS, 'porcentagem'),
      acimaMeta: {
        quantidade: contarItensMeta(finalDataUsoGPS, 'porcentagem', configManager.getMetas('colheita_semanal').usoGPS),
        total: finalDataUsoGPS.length,
        percentual: (contarItensMeta(finalDataUsoGPS, 'porcentagem', configManager.getMetas('colheita_semanal').usoGPS) / finalDataUsoGPS.length) * 100
      }
    };

    const frotas: FrotaData[] = finalDataTDH.map((item: DataItem) => ({
      id: item.frota || '',
      tdh: item.valor || 0,
      diesel: finalDataDiesel.find((d: DataItem) => d.frota === item.frota)?.valor || 0,
      disponibilidade: finalDataDisponibilidade.find((d: DataItem) => d.frota === item.frota)?.disponibilidade || 0,
      impureza: finalDataImpureza.find((d: DataItem) => d.frota === item.frota)?.valor || 0
    }));

    const operadores: OperadorData[] = finalDataEficiencia.map((item: DataItem) => ({
      id: item.operador || '',
      eficiencia: item.valor || 0,
      horasElevador: finalDataHorasElevador.find((d: DataItem) => d.operador === item.operador)?.horas || 0,
      motorOcioso: finalDataMotorOcioso.find((d: DataItem) => d.operador === item.operador)?.percentual || 0,
      usoGPS: finalDataUsoGPS.find((d: DataItem) => d.operador === item.operador)?.porcentagem || 0
    }));

    const data: ResumoData = {
      tdh,
      diesel,
      impurezaVegetal,
      disponibilidadeMecanica,
      eficienciaEnergetica,
      horaElevador,
      motorOcioso,
      usoGPS,
      frotas,
      operadores
    };

    return data;
  }, [
    finalDataTDH,
    finalDataDiesel,
    finalDataImpureza,
    finalDataDisponibilidade,
    finalDataEficiencia,
    finalDataHorasElevador,
    finalDataMotorOcioso,
    finalDataUsoGPS
  ]);

  // RENDERIZAÇÃO CONDICIONAL
  // Se estiver carregando, mostrar indicador de loading
  if (loading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text>Carregando dados do relatório...</Text>
        </VStack>
      </Center>
    );
  }
  
  // RENDERIZAÇÃO PRINCIPAL
  return (
    <Box position="relative">
      {/* Barra de ações */}
      <Box
        position="sticky"
        top={0}
        bg="white"
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        zIndex={1000}
        className="no-print"
      >
        <Flex justify="space-between" align="center">
          {/* Mostrar o switch apenas no modo template */}
          {!reportId && (
            <FormControl display="flex" alignItems="center" w="auto">
              <FormLabel htmlFor="dados-exemplo" mb="0" fontSize="sm" mr={2} color="black">
                {useExampleData ? 'Usando dados de exemplo' : 'Usando dados reais'}
              </FormLabel>
              <Switch 
                id="dados-exemplo" 
                isChecked={useExampleData}
                onChange={() => setUseExampleData(!useExampleData)}
                colorScheme="blue"
                borderWidth="1px"
                borderColor="black"
                borderRadius="md"
                p="1px"
              />
            </FormControl>
          )}
          
          <Flex>
            {reportId && (
              <Text fontSize="sm" color="gray.700" mr={4}>
                Relatório #{reportId.substring(0, 8)} 
                {reportData?.data && ` - ${formatarData(reportData.data)}`}
              </Text>
            )}
            
            {error && (
              <Text color="red.500" fontSize="sm" mr={4} fontWeight="bold">
                {error}
              </Text>
            )}
            
            <Button
              leftIcon={<FaPrint />}
              onClick={handlePrint}
              colorScheme="blue"
              color="white"
              _hover={{ bg: 'blue.600' }}
            >
              Imprimir
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Conteúdo do relatório */}
      <Box className="report-content">
        {/* Página 1 - TDH, Diesel, Disponibilidade e Impureza */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader showDate={true} />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* TDH */}
              <Box flex="1" mb={3}>
                <SectionTitle title="TDH" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoTDH 
                    data={finalDataTDH} 
                    meta={configManager.getMetas('colheita_semanal').tdh} 
                  />
                </Box>
              </Box>
              
              {/* Diesel */}
              <Box flex="1" mb={3}>
                <SectionTitle title="Consumo de Diesel" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoDiesel 
                    data={finalDataDiesel} 
                    meta={configManager.getMetas('colheita_semanal').diesel} 
                  />
                </Box>
              </Box>
              
              {/* Disponibilidade Mecânica */}
              <Box flex="1" mb={3}>
                <SectionTitle title="Disponibilidade Mecânica" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoDisponibilidadeMecanicaColheita 
                    data={finalDataDisponibilidade} 
                    meta={configManager.getMetas('colheita_semanal').disponibilidadeMecanica} 
                  />
                </Box>
              </Box>
              
              {/* Impureza Vegetal */}
              <Box flex="1">
                <SectionTitle title="Impureza Vegetal" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoImpurezaVegetal 
                    data={finalDataImpureza} 
                    meta={configManager.getMetas('colheita_semanal').impureza_vegetal} 
                  />
                </Box>
              </Box>
            </Flex>
          </Box>
        </A4Colheita>
        
        {/* Página 2 - Eficiência Energética e Horas Elevador */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader showDate={false} />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* Eficiência Energética */}
              <Box flex="1" mb={3}>
                <SectionTitle title="Eficiência Energética" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoEficienciaEnergetica 
                    data={finalDataEficiencia} 
                    meta={configManager.getMetas('colheita_semanal').eficienciaEnergetica} 
                  />
                </Box>
              </Box>
              
              {/* Horas Elevador */}
              <Box flex="1">
                <SectionTitle title="Horas Elevador" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoHorasElevador 
                    data={finalDataHorasElevador} 
                    meta={configManager.getMetas('colheita_semanal').horaElevador} 
                  />
                </Box>
              </Box>
            </Flex>
          </Box>
        </A4Colheita>
        
        {/* Página 3 - Motor Ocioso e Uso GPS */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader showDate={false} />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* Motor Ocioso */}
              <Box flex="1" mb={3}>
                <SectionTitle title="Motor Ocioso" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoMotorOciosoColheita 
                    data={finalDataMotorOcioso} 
                    meta={configManager.getMetas('colheita_semanal').motorOcioso} 
                  />
                </Box>
              </Box>
              
              {/* Uso GPS */}
              <Box flex="1">
                <SectionTitle title="Uso GPS" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoUsoGPS 
                    data={finalDataUsoGPS} 
                    meta={configManager.getMetas('colheita_semanal').usoGPS} 
                  />
                </Box>
              </Box>
            </Flex>
          </Box>
        </A4Colheita>
        
        {/* Página 4 - Resumo Frotas e Operadores */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader showDate={false} />
            
            <Box flex="1" p={4}>
              {/* Seção Frotas */}
              <Box mb={6}>
                <SectionTitle title="Frotas" centered={false} />
                
                {/* Cards de indicadores de frotas */}
                <SimpleGrid columns={4} spacing={4} mb={4}>
                  <IndicatorCard 
                    title="TDH"
                    value={resumoData.tdh.media}
                    meta={resumoData.tdh.meta}
                    isInverted={true}
                  />
                  <IndicatorCard 
                    title="Diesel"
                    value={resumoData.diesel.media}
                    meta={resumoData.diesel.meta}
                    isInverted={true}
                  />
                  <IndicatorCard 
                    title="Disponibilidade"
                    value={resumoData.disponibilidadeMecanica.media}
                    meta={resumoData.disponibilidadeMecanica.meta}
                  />
                  <IndicatorCard 
                    title="Impureza"
                    value={resumoData.impurezaVegetal.media}
                    meta={resumoData.impurezaVegetal.meta}
                    isInverted={true}
                  />
                </SimpleGrid>

                {/* Tabela de frotas */}
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  overflow="hidden"
                >
                  <RelatorioColheitaResumo data={resumoData} showFrotasOnly={true} />
                </Box>
              </Box>

              {/* Seção Operadores */}
              <Box>
                <SectionTitle title="Operadores" centered={false} />
                
                {/* Cards de indicadores de operadores */}
                <SimpleGrid columns={4} spacing={4} mb={4}>
                  <IndicatorCard 
                    title="Eficiência"
                    value={resumoData.eficienciaEnergetica.media}
                    meta={resumoData.eficienciaEnergetica.meta}
                  />
                  <IndicatorCard 
                    title="Horas Elevador"
                    value={resumoData.horaElevador.media}
                    meta={resumoData.horaElevador.meta}
                  />
                  <IndicatorCard 
                    title="Motor Ocioso"
                    value={resumoData.motorOcioso.media}
                    meta={resumoData.motorOcioso.meta}
                    isInverted={true}
                  />
                  <IndicatorCard 
                    title="Uso GPS"
                    value={resumoData.usoGPS.media}
                    meta={resumoData.usoGPS.meta}
                  />
                </SimpleGrid>

                {/* Tabela de operadores */}
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  overflow="hidden"
                >
                  <RelatorioColheitaResumo data={resumoData} showOperadoresOnly={true} />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
      </Box>

      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .report-content {
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
          }
        }
      `}</style>
    </Box>
  );
} 