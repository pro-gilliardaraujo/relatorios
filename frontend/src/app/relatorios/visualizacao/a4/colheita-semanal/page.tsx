'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid, Center, Spinner, Grid, GridItem, Card, CardBody } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';
import { GraficoDisponibilidadeMecanicaColheita } from '@/components/Charts/Colheita/Diario/GraficoDisponibilidadeMecanicaColheita';
import { GraficoEficienciaEnergetica } from '@/components/Charts/Colheita/Diario/GraficoEficienciaEnergetica';
import { GraficoHorasElevador } from '@/components/Charts/Colheita/Diario/GraficoHorasElevador';
import { GraficoMotorOciosoColheita } from '@/components/Charts/Colheita/Diario/GraficoMotorOciosoColheita';
import { GraficoUsoGPS } from '@/components/Charts/Colheita/Diario/GraficoUsoGPS';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { configManager } from '@/utils/config';
import { DateRangeDisplay } from '@/components/DateRangeDisplay';
import { useReportData } from '@/hooks/useReportData';
import RelatorioColheitaSemanalResumo, { ResumoData, MetricData, FrotaData, OperadorData } from '@/components/RelatorioColheitaSemanalResumo';
import TabelaOperadores from '@/components/TabelaOperadores';
import TabelaFrotas from '@/components/TabelaFrotas';
import IndicatorCard from '@/components/IndicatorCard';
import HorasPorFrotaFooter from '@/components/HorasPorFrotaFooter';
import { GraficoMotorOciosoSemanal } from '@/components/Charts/Colheita/Semanal/GraficoMotorOciosoSemanal';
import { GraficoHoraElevadorSemanal } from '@/components/Charts/Colheita/Semanal/GraficoHoraElevadorSemanal';
import { GraficoMediaVelocidadeSemanal } from '@/components/Charts/Colheita/Semanal/GraficoMediaVelocidadeSemanal';

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
  disponibilidadeMecanica: number;
  eficienciaEnergetica: number;
  horaElevador: number;
  motorOcioso: number;
  usoGPS: number;
}

// Função para calcular média - definida no escopo global do componente
const calcularMedia = (array: any[] | undefined, propriedade: string): number => {
  if (!array || array.length === 0) return 0;
  const valoresTotais = array.reduce((acc, item) => {
    if (item && typeof item[propriedade] === 'number') {
      return acc + item[propriedade];
    }
    return acc;
  }, 0);
  return valoresTotais / array.length;
};

// Função para contar itens acima/abaixo da meta - definida no escopo global do componente
const contarItensMeta = (array: any[] | undefined, propriedade: string, meta: number, maiorMelhor: boolean = true): number => {
  if (!array || array.length === 0) return 0;
  return array.filter(item => {
    if (!item || typeof item[propriedade] !== 'number') return false;
    return maiorMelhor ? item[propriedade] >= meta : item[propriedade] <= meta;
  }).length;
};

// Processamento dos dados para o resumo - MOVIDO PARA ANTES DO useMemo
const processarDadosResumo = (dados: any): ResumoData => {
  // Obter metas do relatório ou usar as metas padrão da configuração
  const metasConfig = configManager.getMetas('colheita_semanal');
  const metas: Metas = {
    disponibilidadeMecanica: metasConfig?.disponibilidadeMecanica ?? 90,
    eficienciaEnergetica: metasConfig?.eficienciaEnergetica ?? 70,
    horaElevador: metasConfig?.horaElevador ?? 5,
    motorOcioso: metasConfig?.motorOcioso ?? 4,
    usoGPS: metasConfig?.usoGPS ?? 90
  };

  // Se temos metas no relatório, usar elas
  if (dados?.metas) {
    console.log("📊 Usando metas do relatório:", dados.metas);
    Object.assign(metas, dados.metas);
  }
  
  // Se não temos dados, retornar uma estrutura vazia com metas
  if (!dados || Object.keys(dados).length === 0) {
    console.warn("📊 Sem dados para processar em processarDadosResumo");
    return {
      disponibilidadeMecanica: {
        data: [],
        meta: metas.disponibilidadeMecanica,
        media: 0,
        acimaMeta: { quantidade: 0, total: 0, percentual: 0 }
      },
      eficienciaEnergetica: {
        data: [],
        meta: metas.eficienciaEnergetica,
        media: 0,
        acimaMeta: { quantidade: 0, total: 0, percentual: 0 }
      },
      horaElevador: {
        data: [],
        meta: metas.horaElevador,
        media: 0,
        acimaMeta: { quantidade: 0, total: 0, percentual: 0 }
      },
      motorOcioso: {
        data: [],
        meta: metas.motorOcioso,
        media: 0,
        acimaMeta: { quantidade: 0, total: 0, percentual: 0 }
      },
      usoGPS: {
        data: [],
        meta: metas.usoGPS,
        media: 0,
        acimaMeta: { quantidade: 0, total: 0, percentual: 0 }
      },
      frotas: [],
      operadores: []
    };
  }

  console.log("📊 Processando dados em processarDadosResumo:", dados);
  
  return {
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
      return {
        id: frota.frota,
        disponibilidade: frota.disponibilidade
      };
    }),
    operadores: (dados.eficiencia_energetica || []).map((operador: any) => {
      const horasElevador = dados.hora_elevador?.find((item: any) => item.id === operador.id);
      const motorOcioso = dados.motor_ocioso?.find((item: any) => item.id === operador.id);
      const usoGPS = dados.uso_gps?.find((item: any) => item.id === operador.id);
      
      return {
        id: operador.nome || operador.id,
        eficiencia: operador.eficiencia,
        horasElevador: horasElevador?.horas ?? 0,
        motorOcioso: motorOcioso?.percentual ?? 0,
        usoGPS: usoGPS?.porcentagem ?? 0
      };
    })
  };
};

interface HorasPorFrota {
  frota: string;
  horasRegistradas: number;
  diferencaPara24h: number;
}

interface ResumoData {
  disponibilidade_mecanica: Array<any>;
  eficiencia_energetica: Array<any>;
  motor_ocioso: Array<any>;
  hora_elevador: Array<any>;
  uso_gps: Array<any>;
  exemplosOperadores: Array<any>;
  exemplosFrotas: Array<any>;
  media_velocidade: Array<{
    operador: string;
    velocidade: number;
  }>;
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
  const [nomeFrente, setNomeFrente] = useState<string>('');
  
  // Função para formatar a data no padrão brasileiro
  const formatarData = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const currentDate = formatarData(new Date().toISOString().split('T')[0]);
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  // Verificar configuração para mostrar ou esconder componentes
  const secoes = useMemo(() => {
    // Obter configurações de seções para o tipo de relatório
    const tipoRelatorio = reportData?.metadata?.type || 'colheita_semanal';
    const configSections = configManager.getTipoRelatorio(tipoRelatorio)?.secoes || {
      tdh: false,
      diesel: false,
      impurezaVegetal: false,
      mediaVelocidade: false,
      disponibilidadeMecanica: true,
      eficienciaEnergetica: true,
      motorOcioso: true,
      horaElevador: true,
      usoGPS: true
    };
    
    return configSections;
  }, [reportData?.metadata?.type]);

  useEffect(() => {
    console.log('📊 ReportID mudou para:', reportId);
    console.log('📊 ReportData:', reportData);
    
    if (reportId) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const { data: report, error } = await supabase
            .from('relatorios_semanais')
            .select('*')
            .eq('id', reportId)
            .single();

          if (error) {
            console.error('❌ Erro ao buscar relatório:', error);
            setLoading(false);
            setError('Ocorreu um erro ao carregar os dados do relatório.');
            return;
          }

          if (!report) {
            console.error('❌ Relatório não encontrado');
            setLoading(false);
            setError('Relatório não encontrado.');
            return;
          }

          console.log('📊 Relatório carregado:', report);
          setReportData(report);
          
          // Tentar obter o nome da frente a partir do arquivo de configuração
          try {
            const frentes = configManager.getFrentes('colheita_semanal');
            const frente = frentes.find(f => f.id === report.frente);
            if (frente) {
              setNomeFrente(frente.nome);
            } else {
              setNomeFrente(report.frente);
            }
          } catch (e) {
            console.error("Erro ao obter nome da frente:", e);
            setNomeFrente(report.frente);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('❌ Erro ao buscar dados:', error);
          setLoading(false);
          setError('Ocorreu um erro ao carregar os dados do relatório.');
        }
      };

      fetchData();
    }
  }, [reportId]);

  // Preparar dados para a renderização
  const finalData = useMemo(() => {
    console.log('📊 Recalculando finalData com reportData:', reportData);
    if (loading) return null;
    if (!reportData?.dados) {
      console.warn('📊 Não há dados disponíveis para processamento');
      return null;
    }
    
    return processarDadosResumo(reportData.dados);
  }, [reportData, loading]);

  // Preparar dados para o footer de HorasPorFrota
  const dadosHorasPorFrota = useMemo(() => {
    if (!reportData?.dados?.horas_por_frota) return [];
    
    return reportData.dados.horas_por_frota
      .filter((item: any) => item && item.frota && item.frota.trim() !== '')
      .map((item: any) => ({
        frota: item.frota,
        horasRegistradas: Number(item.horasRegistradas || 0),
        diferencaPara24h: Number(item.diferencaPara24h || 0)
      }));
  }, [reportData]);

  // Verificar se estamos no modo de visualização ou no modo de relatório específico
  const isModoTemplate = !reportId;

  // COMPONENTES
  // Componente para o cabeçalho da página
  const PageHeader = ({ showDate = false }: { showDate?: boolean }) => {
    const startDate = reportData?.data_inicio ? new Date(reportData.data_inicio) : new Date();
    const endDate = reportData?.data_fim ? new Date(reportData.data_fim) : new Date();
    const frontName = nomeFrente || 'Frente 01';

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
    <Box 
      className="report-content" 
      sx={{ 
        '@media print': { 
          m: '0 !important', 
          p: '0 !important',
          breakInside: 'avoid !important',
          breakBefore: 'avoid !important',
          breakAfter: 'avoid !important',
          pageBreakAfter: 'avoid !important',
          pageBreakBefore: 'avoid !important',
          '& > *': {
            m: '0 !important',
            p: '0 !important'
          }
        } 
      }}
    >
      {/* Página 1 - Disponibilidade Mecânica e Eficiência Energética com cards */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column" bg="white" sx={{ '@media print': { breakInside: 'avoid !important', m: '0 !important', p: '0 !important' } }}>
          <PageHeader showDate={true} />
          
          <Flex flex="1" direction="column" justify="space-between">
            {/* Disponibilidade Mecânica */}
            <Box flex="1" mb={4}>
              <SectionTitle title="Disponibilidade Mecânica" centered={true} />
              <Flex direction="column" h="calc(100% - 100px)">
                {/* Card de indicador */}
                <Box mb={3}>
                  <IndicatorCard 
                    title=""
                    value={finalData?.disponibilidadeMecanica?.media ?? 0}
                    meta={finalData?.disponibilidadeMecanica?.meta ?? 0}
                    unitType="porcentagem"
                    acimaMeta={finalData?.disponibilidadeMecanica?.acimaMeta}
                  />
                </Box>
                {/* Gráfico */}
                <Box 
                  flex="1"
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 100px)"
                >
                  <GraficoDisponibilidadeMecanicaColheita 
                    data={finalData?.disponibilidadeMecanica?.data || []} 
                    meta={finalData?.disponibilidadeMecanica?.meta || 0} 
                  />
                </Box>
              </Flex>
            </Box>

            {/* Eficiência Energética */}
            <Box flex="1">
              <SectionTitle title="Eficiência Energética" centered={true} />
              <Flex direction="column" h="calc(100% - 100px)">
                {/* Card de indicador */}
                <Box mb={3}>
                  <IndicatorCard 
                    title=""
                    value={finalData?.eficienciaEnergetica?.media ?? 0}
                    meta={finalData?.eficienciaEnergetica?.meta ?? 0}
                    unitType="porcentagem"
                    acimaMeta={finalData?.eficienciaEnergetica?.acimaMeta}
                  />
                </Box>
                {/* Gráfico */}
                <Box 
                  flex="1"
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 100px)"
                >
                  <GraficoEficienciaEnergetica 
                    data={finalData?.eficienciaEnergetica?.data || []} 
                    meta={finalData?.eficienciaEnergetica?.meta || 0} 
                  />
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </A4Colheita>

      {/* Página 2 - Hora Elevador com card */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column" bg="white" sx={{ '@media print': { breakInside: 'avoid !important', m: '0 !important', p: '0 !important' } }}>
          <PageHeader showDate={true} />
          
          <Flex flex="1" direction="column" justify="center">
            {/* Hora Elevador */}
            <Box>
              <SectionTitle title="Hora Elevador" centered={true} />
              <Flex direction="column" h="calc(100% - 100px)">
                {/* Card de indicador */}
                <Box mb={3}>
                  <IndicatorCard 
                    title=""
                    value={finalData?.horaElevador?.media ?? 0}
                    meta={finalData?.horaElevador?.meta ?? 0}
                    unitType="horas"
                    acimaMeta={finalData?.horaElevador?.acimaMeta}
                  />
                </Box>
                {/* Gráfico */}
                <Box 
                  flex="1"
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 100px)"
                >
                  <GraficoHorasElevador 
                    data={finalData?.horaElevador?.data || []} 
                    meta={finalData?.horaElevador?.meta || 0} 
                  />
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </A4Colheita>

      {/* Página 3 - Motor Ocioso com card */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column" bg="white" sx={{ '@media print': { breakInside: 'avoid !important', m: '0 !important', p: '0 !important' } }}>
          <PageHeader showDate={true} />
          
          <Flex flex="1" direction="column" justify="center">
            {/* Motor Ocioso */}
            <Box>
              <SectionTitle title="Motor Ocioso" centered={true} />
              <Flex direction="column" h="calc(100% - 100px)">
                {/* Card de indicador */}
                <Box mb={3}>
                  <IndicatorCard 
                    title=""
                    value={finalData?.motorOcioso?.media ?? 0}
                    meta={finalData?.motorOcioso?.meta ?? 0}
                    unitType="porcentagem"
                    acimaMeta={finalData?.motorOcioso?.acimaMeta}
                    isInverted
                  />
                </Box>
                {/* Gráfico */}
                <Box 
                  flex="1"
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 100px)"
                >
                  <GraficoMotorOciosoColheita 
                    data={finalData?.motorOcioso?.data || []} 
                    meta={finalData?.motorOcioso?.meta || 0} 
                  />
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </A4Colheita>
      
      {/* Página 4 - Uso GPS com card */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column" bg="white" sx={{ '@media print': { breakInside: 'avoid !important', m: '0 !important', p: '0 !important' } }}>
          <PageHeader showDate={true} />
          
          <Flex flex="1" direction="column" justify="center">
            {/* Uso GPS */}
            <Box>
              <SectionTitle title="Uso GPS" centered={true} />
              <Flex direction="column" h="calc(100% - 100px)">
                {/* Card de indicador */}
                <Box mb={3}>
                  <IndicatorCard 
                    title=""
                    value={finalData?.usoGPS?.media ?? 0}
                    meta={finalData?.usoGPS?.meta ?? 0}
                    unitType="porcentagem"
                    acimaMeta={finalData?.usoGPS?.acimaMeta}
                  />
                </Box>
                {/* Gráfico */}
                <Box 
                  flex="1"
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 100px)"
                >
                  <GraficoUsoGPS 
                    data={finalData?.usoGPS?.data || []} 
                    meta={finalData?.usoGPS?.meta || 0} 
                  />
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </A4Colheita>
      
      {/* Página 5 - Tabelas */}
      <A4Colheita 
        isLastPage={true}
        footer={
          dadosHorasPorFrota && dadosHorasPorFrota.length > 0 ? 
          <HorasPorFrotaFooter dados={dadosHorasPorFrota} /> : 
          null
        }
      >
        <Box h="100%" display="flex" flexDirection="column" bg="white">
          <PageHeader showDate={true} />
          
          <Box flex="1" p={4}>
            {/* Título Principal do Resumo */}
            <Heading
              as="h1"
              size="sm"
              textAlign="center"
              mb={4}
              color="black"
              fontWeight="bold"
              fontSize="15px"
            >
              Resumo do Relatório de Colheita Semanal
            </Heading>

            {/* Seção Frotas */}
            <Box mb={6}>
              <SectionTitle title="Frotas" centered={true} />
              
              {/* Tabela de frotas */}
              <TabelaFrotas 
                dados={finalData?.disponibilidadeMecanica?.data || []} 
                tipo="colheita_semanal" 
                dadosCompletos={{}}
              />
            </Box>

            {/* Seção Operadores */}
            <Box>
              <SectionTitle title="Operadores" centered={true} />
              
              {/* Tabela de operadores */}
              <TabelaOperadores dados={{
                eficiencia_energetica: finalData?.eficienciaEnergetica?.data || [],
                motor_ocioso: finalData?.motorOcioso?.data || [],
                hora_elevador: finalData?.horaElevador?.data || [],
                uso_gps: finalData?.usoGPS?.data || []
              }} tipo="colheita_semanal" />
            </Box>
          </Box>
        </Box>
      </A4Colheita>

      {/* Seção de Média de Velocidade */}
      <Box p={4} bg="white" borderRadius="md" boxShadow="sm" mb={4}>
        <SectionTitle title="Média de Velocidade" />
        <GraficoMediaVelocidadeSemanal 
          dados={finalData?.media_velocidade || []} 
          meta={configManager.getTipoRelatorio('colheita_semanal')?.metas?.mediaVelocidade || 7}
        />
      </Box>
    </Box>
  );
} 