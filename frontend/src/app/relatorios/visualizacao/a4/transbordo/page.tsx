'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid, Center, Spinner, Button, Switch, FormControl, FormLabel } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';
import { GraficoDisponibilidadeMecanicaTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoDisponibilidadeMecanicaTransbordo';
import { GraficoEficienciaEnergetica } from '@/components/Charts/Transbordo/Diario/GraficoEficienciaEnergetica';
import { GraficoMotorOciosoTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoMotorOciosoTransbordo';
import { GraficoUsoGPS } from '@/components/Charts/Transbordo/Diario/GraficoUsoGPS';
import { GraficoFaltaApontamentoTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoFaltaApontamentoTransbordo';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaPrint } from 'react-icons/fa';
import { configManager } from '@/utils/config';
import RelatorioColheitaDiarioResumo from '@/components/RelatorioColheitaDiarioResumo';
import IndicatorCard from '@/components/IndicatorCard';
import TabelaOperadores from '@/components/TabelaOperadores';
import TabelaFrotas from '@/components/TabelaFrotas';

// Dados de exemplo para visualização offline
const dadosExemplo: DadosProcessados = {
  disponibilidade_mecanica: [
    { frota: '6031', disponibilidade: 89.00 },
    { frota: '6082', disponibilidade: 99.23 },
    { frota: '6087', disponibilidade: 98.61 },
    { frota: '6096', disponibilidade: 99.34 },
    { frota: '0', disponibilidade: 0.00 }
  ],
  eficiencia_energetica: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', eficiencia: 50.39 },
    { id: '2', nome: 'TROCA DE TURNO', eficiencia: 0.00 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', eficiencia: 56.66 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', eficiencia: 49.92 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', eficiencia: 64.13 },
    { id: '6', nome: 'JOSE HUMBERTO DE OLIVEIRA', eficiencia: 52.45 },
    { id: '7', nome: 'SEM OPERADOR', eficiencia: 9.25 },
    { id: '8', nome: 'VITOR SOARES FREITAS', eficiencia: 56.81 },
    { id: '9', nome: 'DANILO JESUS BRITO', eficiencia: 54.67 }
  ],
  motor_ocioso: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', percentual: 8.87 },
    { id: '2', nome: 'TROCA DE TURNO', percentual: 89.76 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', percentual: 25.30 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', percentual: 38.27 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', percentual: 20.85 },
    { id: '6', nome: 'JOSE HUMBERTO DE OLIVEIRA', percentual: 23.03 },
    { id: '7', nome: 'VITOR SOARES FREITAS', percentual: 13.96 },
    { id: '8', nome: 'DANILO JESUS BRITO', percentual: 17.89 }
  ],
  uso_gps: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', porcentagem: 0.0 },
    { id: '2', nome: 'TROCA DE TURNO', porcentagem: 0.0 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', porcentagem: 0.0 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', porcentagem: 0.0 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', porcentagem: 0.0 },
    { id: '6', nome: 'JOSE HUMBERTO DE OLIVEIRA', porcentagem: 0.0 },
    { id: '7', nome: 'VITOR SOARES FREITAS', porcentagem: 0.0 },
    { id: '8', nome: 'DANILO JESUS BRITO', porcentagem: 0.0 }
  ],
  falta_apontamento: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', percentual: 3.74 },
    { id: '2', nome: 'TROCA DE TURNO', percentual: 0.00 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', percentual: 8.82 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', percentual: 9.26 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', percentual: 0.04 },
    { id: '6', nome: 'JOSE HUMBERTO DE OLIVEIRA', percentual: 14.99 },
    { id: '7', nome: 'VITOR SOARES FREITAS', percentual: 5.30 },
    { id: '8', nome: 'DANILO JESUS BRITO', percentual: 1.02 }
  ]
};

interface TransbordoA4Props {
  data?: any;
}

interface DadosProcessados {
  disponibilidade_mecanica: Array<{
    frota: string;
    disponibilidade: number;
  }>;
  eficiencia_energetica: Array<{
    id: string;
    nome: string;
    eficiencia: number;
  }>;
  motor_ocioso: Array<{
    id: string;
    nome: string;
    percentual: number;
  }>;
  uso_gps: Array<{
    id: string;
    nome: string;
    porcentagem: number;
  }>;
  falta_apontamento: Array<{
    id: string;
    nome: string;
    percentual: number;
  }>;
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
  
  const temMotorOcioso = Array.isArray(dados.motor_ocioso) && 
    dados.motor_ocioso.length > 0 &&
    dados.motor_ocioso.some((item: any) => item && item.nome && item.percentual !== undefined);
  
  const temUsoGPS = Array.isArray(dados.uso_gps) && 
    dados.uso_gps.length > 0 &&
    dados.uso_gps.some((item: any) => item && item.nome && item.porcentagem !== undefined);
  
  // Verificar se pelo menos uma das seções tem dados
  return temDisponibilidade || temEficiencia || temMotorOcioso || temUsoGPS;
};

export default function TransbordoA4({ data }: TransbordoA4Props) {
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
    return `Relatório de Transbordo Diário - ${nomeFrente} - ${data}.pdf`;
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
                (payload) => {
                  console.log('🔄 Atualização em tempo real recebida:', payload);
                  if (payload.eventType === 'DELETE') {
                    setError('Este relatório foi excluído');
                    return;
                  }
                  setReportData(payload.new);
                }
              )
              .subscribe();

          } catch (error) {
            console.error('❌ Erro ao buscar dados:', error);
            setError(`Erro ao buscar dados: ${error}`);
            setLoading(false);
            setUseExampleData(true);
          }
        };

        await fetchReportData();

        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        };
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setError(`Erro ao carregar dados: ${error}`);
        setLoading(false);
        setUseExampleData(true);
      }
    };

    loadData();
  }, [reportId]);

  // Funções utilitárias para processamento de dados
      const processarOperador = (operador: any) => {
    if (!operador || !operador.nome) return 'Não informado';
    return operador.nome;
      };

      const converterNumero = (valor: any) => {
    if (valor === undefined || valor === null) return 0;
    const numero = Number(valor);
    return isNaN(numero) ? 0 : numero;
  };

      const processarPorcentagem = (valor: any) => {
        const numero = converterNumero(valor);
    return `${numero.toFixed(1)}%`;
  };

  // Função para imprimir o relatório
  const handlePrint = async () => {
      window.print();
  };

  // Funções para cálculos estatísticos
  const calcularMedia = (array: any[] | undefined, propriedade: string): number => {
    if (!array || array.length === 0) return 0;
    
    const valores = array
      .map(item => {
        const valor = item[propriedade];
        return typeof valor === 'number' ? valor : 0;
      })
      .filter(valor => !isNaN(valor));
    
    if (valores.length === 0) return 0;
    
    const soma = valores.reduce((acc, curr) => acc + curr, 0);
    return soma / valores.length;
  };

  const calcularTotal = (array: any[] | undefined, propriedade: string): number => {
    if (!array || array.length === 0) return 0;
    
    return array.reduce((acc, item) => {
      const valor = item[propriedade];
      return acc + (typeof valor === 'number' ? valor : 0);
    }, 0);
  };

  const contarItensMeta = (array: any[] | undefined, propriedade: string, meta: number, acima: boolean = true): number => {
    if (!array || array.length === 0) return 0;
    
    return array.reduce((count, item) => {
      const valor = item[propriedade];
      if (typeof valor !== 'number') return count;
      
      if (acima) {
        return valor >= meta ? count + 1 : count;
      } else {
        return valor < meta ? count + 1 : count;
      }
    }, 0);
  };

  // Componentes de layout
  const PageHeader = () => {
    // Encontrar o nome completo da frente no config
    const frenteConfig = configManager.getFrentes('transbordo_diario').find((f: { id: string }) => f.id === reportData?.frente);
    const nomeFrente = frenteConfig?.nome || reportData?.frente || 'Exemplo';

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
            {`Relatório de Transbordo Diário - ${nomeFrente}`}
          </Heading>
          <Text color="black" fontSize="sm">
            {reportData?.data ? formatarData(reportData.data) : currentDate}
          </Text>
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

  // Dados processados para os gráficos
  const dados = useMemo(() => {
    if (useExampleData) {
      console.log('📊 Usando dados de exemplo');
      return dadosExemplo;
    }

    if (!reportData?.dados || !verificarFormatoDados(reportData.dados)) {
      console.log('❌ Dados inválidos ou ausentes');
      return dadosExemplo;
    }

    console.log('📊 Usando dados do relatório');
    return reportData.dados;
  }, [reportData, useExampleData]);

  // Renderização condicional baseada no estado de carregamento
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error && !useExampleData) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Text color="red.500">{error}</Text>
          <Button
            onClick={() => setUseExampleData(true)}
            colorScheme="blue"
          >
            Usar Dados de Exemplo
          </Button>
        </VStack>
      </Center>
    );
  }
  
  // RENDERIZAÇÃO PRINCIPAL
  return (
    <Box 
      className="relatorio-container" 
      bg="white" 
      p={0}
      m={0}
      sx={{
        '@media print': {
          bg: 'white',
          m: '0 !important',
          p: '0 !important',
          '& > *': {
            m: '0 !important',
            p: '0 !important'
          }
        }
      }}
    >
      {/* Páginas do Relatório */}
      <VStack 
        spacing={0} 
        m={0}
        p={0}
        className="paginas"
        sx={{
          '@media screen': {
            '& > *:not(:last-child)': {
              mb: '2rem'
            }
          },
          '@media print': {
            m: '0 !important',
            p: '0 !important',
            '& > *': {
              m: '0 !important',
              p: '0 !important'
            }
          }
        }}
      >
        {/* Primeira Página */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader />
            <Box flex="1" display="flex" flexDirection="column">
              {/* Disponibilidade Mecânica */}
              <Box flex="1" mb={2}>
                <SectionTitle title="Disponibilidade Mecânica" />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100% - 30px)"
                  overflow="hidden"
                >
                  <GraficoDisponibilidadeMecanicaTransbordo
                    data={dados.disponibilidade_mecanica}
                    meta={configManager.getMetas('transbordo_diario').disponibilidadeMecanica}
                  />
                </Box>
              </Box>
              
              {/* Eficiência Energética */}
              <Box flex="1">
                <SectionTitle title="Eficiência Energética" />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100% - 30px)"
                  overflow="hidden"
                >
                  <GraficoEficienciaEnergetica 
                    data={dados.eficiencia_energetica}
                    meta={configManager.getMetas('transbordo_diario').eficienciaEnergetica}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
              
        {/* Segunda Página */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader />
            <Box flex="1" display="flex" flexDirection="column">
              {/* Motor Ocioso */}
              <Box flex="1" mb={2}>
                <SectionTitle title="Motor Ocioso" />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100% - 30px)"
                  overflow="hidden"
                >
                  <GraficoMotorOciosoTransbordo
                    data={dados.motor_ocioso}
                    meta={configManager.getMetas('transbordo_diario').motorOcioso}
                  />
                </Box>
              </Box>

              {/* Falta de Apontamento */}
              <Box flex="1">
                <SectionTitle title="Falta de Apontamento" />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100% - 30px)"
                  overflow="hidden"
                >
                  <GraficoFaltaApontamentoTransbordo
                    data={dados.falta_apontamento}
                    meta={configManager.getMetas('transbordo_diario').faltaApontamento}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
              
        {/* Terceira Página */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader />
            <Box flex="1" display="flex" flexDirection="column">
              {/* Uso GPS */}
              <Box flex="1">
                <SectionTitle title="Uso GPS" />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100% - 30px)"
                  overflow="hidden"
                >
                  <GraficoUsoGPS 
                    data={dados.uso_gps}
                    meta={configManager.getMetas('transbordo_diario').usoGPS}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
        
        {/* Quarta Página - Resumo */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader />
            <Box flex="1" display="flex" flexDirection="column" p={4}>
              <Heading
                as="h1"
                size="sm"
                textAlign="center"
                mb={4}
                color="black"
                fontWeight="bold"
                fontSize="15px"
              >
                Resumo do Relatório de Transbordo Diário
              </Heading>

              {/* Seção Frotas */}
              <Box mb={4}>
                <Text fontSize="13px" fontWeight="bold" color="black" mb={2} textAlign="center">
                  Frotas
                </Text>
                <SimpleGrid columns={2} spacing={4} w="100%" mb={4}>
                  <IndicatorCard
                    title="Disponibilidade Mecânica"
                    value={calcularMedia(dados.disponibilidade_mecanica, 'disponibilidade')}
                    meta={configManager.getMetas('transbordo_diario').disponibilidadeMecanica}
                    acimaMeta={{
                      quantidade: contarItensMeta(dados.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_diario').disponibilidadeMecanica),
                      total: dados.disponibilidade_mecanica.length,
                      percentual: (contarItensMeta(dados.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_diario').disponibilidadeMecanica) / dados.disponibilidade_mecanica.length) * 100
                    }}
                  />
                </SimpleGrid>
              </Box>

              {/* Seção Operadores */}
              <Box flex="1">
                <Text fontSize="13px" fontWeight="bold" color="black" mb={2} textAlign="center">
                  Operadores
                </Text>
                <SimpleGrid columns={2} spacing={4} w="100%" mb={4}>
                  <IndicatorCard
                    title="Eficiência Energética"
                    value={calcularMedia(dados.eficiencia_energetica.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'eficiencia')}
                    meta={configManager.getMetas('transbordo_diario').eficienciaEnergetica}
                    acimaMeta={{
                      quantidade: contarItensMeta(dados.eficiencia_energetica.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'eficiencia', configManager.getMetas('transbordo_diario').eficienciaEnergetica),
                      total: dados.eficiencia_energetica.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR').length,
                      percentual: (contarItensMeta(dados.eficiencia_energetica.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'eficiencia', configManager.getMetas('transbordo_diario').eficienciaEnergetica) / dados.eficiencia_energetica.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR').length) * 100
                    }}
                  />
                  <IndicatorCard
                    title="Motor Ocioso"
                    value={calcularMedia(dados.motor_ocioso.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'percentual')}
                    meta={configManager.getMetas('transbordo_diario').motorOcioso}
                    isInverted={true}
                    acimaMeta={{
                      quantidade: contarItensMeta(dados.motor_ocioso.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'percentual', configManager.getMetas('transbordo_diario').motorOcioso, false),
                      total: dados.motor_ocioso.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR').length,
                      percentual: (contarItensMeta(dados.motor_ocioso.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'percentual', configManager.getMetas('transbordo_diario').motorOcioso, false) / dados.motor_ocioso.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR').length) * 100
                    }}
                  />
                  <IndicatorCard
                    title="Falta de Apontamento"
                    value={calcularMedia(dados.falta_apontamento.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'percentual')}
                    meta={configManager.getMetas('transbordo_diario').faltaApontamento}
                    isInverted={true}
                    acimaMeta={{
                      quantidade: contarItensMeta(dados.falta_apontamento.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'percentual', configManager.getMetas('transbordo_diario').faltaApontamento, false),
                      total: dados.falta_apontamento.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR').length,
                      percentual: (contarItensMeta(dados.falta_apontamento.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'percentual', configManager.getMetas('transbordo_diario').faltaApontamento, false) / dados.falta_apontamento.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR').length) * 100
                    }}
                  />
                  <IndicatorCard
                    title="Uso GPS"
                    value={calcularMedia(dados.uso_gps.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'porcentagem')}
                    meta={configManager.getMetas('transbordo_diario').usoGPS}
                    acimaMeta={{
                      quantidade: contarItensMeta(dados.uso_gps.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'porcentagem', configManager.getMetas('transbordo_diario').usoGPS),
                      total: dados.uso_gps.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR').length,
                      percentual: (contarItensMeta(dados.uso_gps.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR'), 'porcentagem', configManager.getMetas('transbordo_diario').usoGPS) / dados.uso_gps.filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR').length) * 100
                    }}
                  />
                </SimpleGrid>

                {/* Tabela de Operadores */}
                <Box>
                  <TabelaOperadores dados={dados} />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
      </VStack>
    </Box>
  );
} 