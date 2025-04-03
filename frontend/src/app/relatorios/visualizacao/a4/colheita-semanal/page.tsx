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
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaPrint } from 'react-icons/fa';
import { configManager } from '@/utils/config';
import { GraficoTDH } from '@/components/Charts/Colheita/Semanal/GraficoTDH';
import { GraficoDiesel } from '@/components/Charts/Colheita/Semanal/GraficoDiesel';
import { GraficoImpurezaVegetal } from '@/components/Charts/Colheita/Semanal/GraficoImpurezaVegetal';
import { DateRangeDisplay } from '@/components/DateRangeDisplay';
import { useReportData } from '@/hooks/useReportData';
import RelatorioColheitaSemanalResumo, { ResumoData, MetricData, FrotaData, OperadorData } from '@/components/RelatorioColheitaSemanalResumo';

// Dados de exemplo para visualização offline
const dadosExemplo = {
  tdh: [
    { frota: '7041', valor: 0.010 },
    { frota: '7042', valor: 0.014 }
  ],
  diesel: [
    { frota: '7041', valor: 0.080 },
    { frota: '7042', valor: 0.497 }
  ],
  impureza_vegetal: [
    { frota: '7041', valor: 65.00 },
    { frota: '7042', valor: 65.74 }
  ],
  disponibilidade_mecanica: [
    { frota: '7041', disponibilidade: 94.49 },
    { frota: '7042', disponibilidade: 92.82 }
  ],
  eficiencia_energetica: [
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', eficiencia: 59 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', eficiencia: 60 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', eficiencia: 38 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', eficiencia: 38 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', eficiencia: 55 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', eficiencia: 31 }
  ],
  hora_elevador: [
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', horas: 7.42 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', horas: 6.33 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', horas: 4.54 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', horas: 4.62 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', horas: 5.10 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', horas: 0.42 }
  ],
  motor_ocioso: [
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', percentual: 25.1 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', percentual: 22.0 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', percentual: 40.1 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', percentual: 31.5 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', percentual: 32.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', percentual: 36.8 }
  ],
  uso_gps: [
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', porcentagem: 90.0 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', porcentagem: 85.0 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', porcentagem: 82.3 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', porcentagem: 81.7 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', porcentagem: 80.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', porcentagem: 80.0 }
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
const IndicatorCard = ({ title, value, meta, isInverted = false, acimaMeta }: { 
  title: string; 
  value: number; 
  meta: number; 
  isInverted?: boolean;
  acimaMeta?: { quantidade: number; total: number; }
}) => {
  const isAboveTarget = isInverted ? value <= meta : value >= meta;
  const metaText = acimaMeta ? `${acimaMeta.quantidade} de ${acimaMeta.total} atingiram a meta (${((acimaMeta.quantidade/acimaMeta.total) * 100).toFixed(0)}%)` : '';
  
  return (
    <Box borderWidth="1px" borderColor="black" borderRadius="md" p={3} bg="white">
      <Text fontSize="sm" fontWeight="bold" mb={1} color="black">{title}</Text>
      <Flex direction="row" align="center" justify="space-between">
        <Text fontSize="md" fontWeight="bold" color="green.500">{meta}%</Text>
        {metaText && (
          <Text 
            fontSize="xs" 
            color={isAboveTarget ? "green.500" : "red.500"} 
            textAlign="center"
            mx={2}
            flex={1}
          >
            {metaText}
          </Text>
        )}
        <Text fontSize="md" fontWeight="bold" color={isAboveTarget ? "green.500" : "red.500"}>{value.toFixed(1)}%</Text>
      </Flex>
    </Box>
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

interface Metas {
  tdh: number;
  diesel: number;
  impureza_vegetal: number;
  disponibilidadeMecanica: number;
  eficienciaEnergetica: number;
  horaElevador: number;
  motorOcioso: number;
  usoGPS: number;
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
      <Flex justify="space-between" align="center" mb={4}>
        <Image
          src={LOGO_URL}
          alt="Logo IB"
          h={LOGO_HEIGHT}
          objectFit="contain"
        />
        <VStack spacing={1}>
          <Heading size="md" color="black" fontWeight="bold" textAlign="center">
            {`Relatório Semanal de Colheita - ${frontName} `} 
          </Heading>
          {showDate && <DateRangeDisplay startDate={startDate} endDate={endDate} />}
        </VStack>
        <Image 
          src={LOGO_URL} 
          alt="Logo IB"
          h={LOGO_HEIGHT}
          objectFit="contain"
        />
      </Flex>
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

  // Processamento dos dados para o resumo
  const processarDadosResumo = (dados: any): ResumoData => {
    const metasConfig = configManager.getMetas('colheita_semanal');
    const metas: Metas = {
      tdh: metasConfig?.tdh ?? 0.0124,
      diesel: metasConfig?.diesel ?? 0.718,
      impureza_vegetal: metasConfig?.impureza_vegetal ?? 64,
      disponibilidadeMecanica: metasConfig?.disponibilidadeMecanica ?? 90,
      eficienciaEnergetica: metasConfig?.eficienciaEnergetica ?? 70,
      horaElevador: metasConfig?.horaElevador ?? 5,
      motorOcioso: metasConfig?.motorOcioso ?? 4,
      usoGPS: metasConfig?.usoGPS ?? 90
    };
    
    return {
      tdh: {
        data: dados.tdh || [],
        meta: metas.tdh,
        media: calcularMedia(dados.tdh, 'valor'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.tdh, 'valor', metas.tdh, false),
          total: (dados.tdh || []).length,
          percentual: ((contarItensMeta(dados.tdh, 'valor', metas.tdh, false) / (dados.tdh || []).length) * 100) || 0
        }
      },
      diesel: {
        data: dados.diesel || [],
        meta: metas.diesel,
        media: calcularMedia(dados.diesel, 'valor'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.diesel, 'valor', metas.diesel, false),
          total: (dados.diesel || []).length,
          percentual: ((contarItensMeta(dados.diesel, 'valor', metas.diesel, false) / (dados.diesel || []).length) * 100) || 0
        }
      },
      impurezaVegetal: {
        data: dados.impureza_vegetal || [],
        meta: metas.impureza_vegetal,
        media: calcularMedia(dados.impureza_vegetal, 'valor'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.impureza_vegetal, 'valor', metas.impureza_vegetal, false),
          total: (dados.impureza_vegetal || []).length,
          percentual: ((contarItensMeta(dados.impureza_vegetal, 'valor', metas.impureza_vegetal, false) / (dados.impureza_vegetal || []).length) * 100) || 0
        }
      },
      disponibilidadeMecanica: {
        data: dados.disponibilidade_mecanica || [],
        meta: metas.disponibilidadeMecanica,
        media: calcularMedia(dados.disponibilidade_mecanica, 'disponibilidade'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.disponibilidade_mecanica, 'disponibilidade', metas.disponibilidadeMecanica),
          total: (dados.disponibilidade_mecanica || []).length,
          percentual: ((contarItensMeta(dados.disponibilidade_mecanica, 'disponibilidade', metas.disponibilidadeMecanica) / (dados.disponibilidade_mecanica || []).length) * 100) || 0
        }
      },
      eficienciaEnergetica: {
        data: dados.eficiencia_energetica || [],
        meta: metas.eficienciaEnergetica,
        media: calcularMedia(dados.eficiencia_energetica, 'eficiencia'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.eficiencia_energetica, 'eficiencia', metas.eficienciaEnergetica),
          total: (dados.eficiencia_energetica || []).length,
          percentual: ((contarItensMeta(dados.eficiencia_energetica, 'eficiencia', metas.eficienciaEnergetica) / (dados.eficiencia_energetica || []).length) * 100) || 0
        }
      },
      horaElevador: {
        data: dados.hora_elevador || [],
        meta: metas.horaElevador,
        media: calcularMedia(dados.hora_elevador, 'horas'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.hora_elevador, 'horas', metas.horaElevador),
          total: (dados.hora_elevador || []).length,
          percentual: ((contarItensMeta(dados.hora_elevador, 'horas', metas.horaElevador) / (dados.hora_elevador || []).length) * 100) || 0
        }
      },
      motorOcioso: {
        data: dados.motor_ocioso || [],
        meta: metas.motorOcioso,
        media: calcularMedia(dados.motor_ocioso, 'percentual'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.motor_ocioso, 'percentual', metas.motorOcioso, false),
          total: (dados.motor_ocioso || []).length,
          percentual: ((contarItensMeta(dados.motor_ocioso, 'percentual', metas.motorOcioso, false) / (dados.motor_ocioso || []).length) * 100) || 0
        }
      },
      usoGPS: {
        data: dados.uso_gps || [],
        meta: metas.usoGPS,
        media: calcularMedia(dados.uso_gps, 'porcentagem'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.uso_gps, 'porcentagem', metas.usoGPS),
          total: (dados.uso_gps || []).length,
          percentual: ((contarItensMeta(dados.uso_gps, 'porcentagem', metas.usoGPS) / (dados.uso_gps || []).length) * 100) || 0
        }
      },
      frotas: (dados.disponibilidade_mecanica || []).map((frota: any) => {
        const tdh = dados.tdh?.find((item: any) => item.frota === frota.frota);
        const diesel = dados.diesel?.find((item: any) => item.frota === frota.frota);
        const impureza = dados.impureza_vegetal?.find((item: any) => item.frota === frota.frota);
        
        return {
          id: frota.frota,
          tdh: tdh?.valor ?? 0,
          diesel: diesel?.valor ?? 0,
          disponibilidade: frota.disponibilidade,
          impureza: impureza?.valor ?? 0
        };
      }),
      operadores: (dados.eficiencia_energetica || []).map((operador: any) => {
        const horasElevador = dados.hora_elevador?.find((item: any) => item.id === operador.id);
        const motorOcioso = dados.motor_ocioso?.find((item: any) => item.id === operador.id);
        const usoGPS = dados.uso_gps?.find((item: any) => item.id === operador.id);
        
        return {
          id: operador.nome,
          eficiencia: operador.eficiencia,
          horasElevador: horasElevador?.horas ?? 0,
          motorOcioso: motorOcioso?.percentual ?? 0,
          usoGPS: usoGPS?.porcentagem ?? 0
        };
      })
    };
  };

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
    <Box>
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
                  p={2}
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
              <Box flex="1" mb={6}>
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
              <Box flex="1" mb={6}>
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
        
        {/* Página 4 - Resumo */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader showDate={false} />
            
            <Box flex="1" p={4}>
              {/* Título Principal do Resumo */}
              <Heading
                as="h1"
                size="md"
                textAlign="center"
                mb={6}
                color="black"
                fontWeight="bold"
              >
                Resumo do Relatório de Colheita Semanal
              </Heading>

              {/* Seção Frotas */}
              <Box mb={6}>
                <SectionTitle title="Frotas" centered={true} />
                
                {/* Cards de indicadores de frotas */}
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <IndicatorCard 
                    title="Consumo de TDH"
                    value={processarDadosResumo(reportData || dadosExemplo).tdh.media || 0}
                    meta={processarDadosResumo(reportData || dadosExemplo).tdh.meta || 0}
                    isInverted={true}
                  />
                  <IndicatorCard 
                    title="Consumo de Diesel"
                    value={processarDadosResumo(reportData || dadosExemplo).diesel.media || 0}
                    meta={processarDadosResumo(reportData || dadosExemplo).diesel.meta || 0}
                    isInverted={true}
                  />
                  <IndicatorCard 
                    title="Disponibilidade Mecânica"
                    value={processarDadosResumo(reportData || dadosExemplo).disponibilidadeMecanica.media || 0}
                    meta={processarDadosResumo(reportData || dadosExemplo).disponibilidadeMecanica.meta || 0}
                    acimaMeta={processarDadosResumo(reportData || dadosExemplo).disponibilidadeMecanica.acimaMeta}
                  />
                  <IndicatorCard 
                    title="Impureza Vegetal"
                    value={processarDadosResumo(reportData || dadosExemplo).impurezaVegetal.media || 0}
                    meta={processarDadosResumo(reportData || dadosExemplo).impurezaVegetal.meta || 0}
                    isInverted={true}
                  />
                </SimpleGrid>

                {/* Tabela de frotas */}
                <RelatorioColheitaSemanalResumo data={processarDadosResumo(reportData || dadosExemplo)} showFrotasOnly={true} />
              </Box>

              {/* Seção Operadores */}
              <Box>
                <SectionTitle title="Operadores" centered={true} />
                
                {/* Cards de indicadores de operadores */}
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <IndicatorCard 
                    title="Eficiência Energética"
                    value={processarDadosResumo(reportData || dadosExemplo).eficienciaEnergetica.media || 0}
                    meta={processarDadosResumo(reportData || dadosExemplo).eficienciaEnergetica.meta || 0}
                    acimaMeta={processarDadosResumo(reportData || dadosExemplo).eficienciaEnergetica.acimaMeta}
                  />
                  <IndicatorCard 
                    title="Horas Elevador"
                    value={processarDadosResumo(reportData || dadosExemplo).horaElevador.media || 0}
                    meta={processarDadosResumo(reportData || dadosExemplo).horaElevador.meta || 0}
                    acimaMeta={processarDadosResumo(reportData || dadosExemplo).horaElevador.acimaMeta}
                  />
                  <IndicatorCard 
                    title="Motor Ocioso"
                    value={processarDadosResumo(reportData || dadosExemplo).motorOcioso.media || 0}
                    meta={processarDadosResumo(reportData || dadosExemplo).motorOcioso.meta || 0}
                    isInverted={true}
                    acimaMeta={processarDadosResumo(reportData || dadosExemplo).motorOcioso.acimaMeta}
                  />
                  <IndicatorCard 
                    title="Uso GPS"
                    value={processarDadosResumo(reportData || dadosExemplo).usoGPS.media || 0}
                    meta={processarDadosResumo(reportData || dadosExemplo).usoGPS.meta || 0}
                    acimaMeta={processarDadosResumo(reportData || dadosExemplo).usoGPS.acimaMeta}
                  />
                </SimpleGrid>

                {/* Tabela de operadores */}
                <RelatorioColheitaSemanalResumo data={processarDadosResumo(reportData || dadosExemplo)} showOperadoresOnly={true} />
              </Box>
            </Box>
          </Box>
        </A4Colheita>
      </Box>
    </Box>
  );
} 