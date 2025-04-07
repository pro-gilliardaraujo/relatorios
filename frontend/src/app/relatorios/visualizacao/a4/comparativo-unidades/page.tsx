'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid, Center, Spinner, Button, Divider, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaPrint } from 'react-icons/fa';
import { configManager } from '@/utils/config';
import TabelaUnidades from '@/components/TabelaUnidades';
import IndicatorCard from '@/components/IndicatorCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';

// Interfaces para tipagem de dados
interface UnidadeData {
  id: string;
  nome: string;
  valor: number;
}

interface ProcessedData {
  colheita: {
    disponibilidade_mecanica: UnidadeData[];
    eficiencia_energetica: UnidadeData[];
    motor_ocioso: UnidadeData[];
    hora_elevador: UnidadeData[];
    uso_gps: UnidadeData[];
  };
  transbordo: {
    disponibilidade_mecanica: UnidadeData[];
    eficiencia_energetica: UnidadeData[];
    motor_ocioso: UnidadeData[];
    falta_apontamento: UnidadeData[];
    uso_gps: UnidadeData[];
  };
  unidadesNomes?: string[];
}

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

// Componente para gráfico de barras horizontais
const HorizontalBarChart: React.FC<{
  data: UnidadeData[] | undefined;
  meta: number;
  metaColors?: {
    above: string;
    below: string;
    warning: string;
  };
}> = ({ data, meta, metaColors = { above: '#48BB78', below: '#E53E3E', warning: '#ECC94B' } }) => {
  if (!data || data.length === 0) return null;
  
  // Ordena os dados por valor (do maior para o menor)
  const sortedData = [...data].sort((a, b) => Number(b.valor) - Number(a.valor));
  
  // Formata o valor de porcentagem
  const formatarPorcentagem = (valor: number): string => {
    if (valor === undefined || valor === null) {
      return '0,00%';
    }
    return valor.toFixed(2).replace('.', ',') + '%';
  };
  
  // Define as cores com base no valor
  const getBarColor = (value: number): string => {
    if (value >= meta) return metaColors.above;
    if (value >= meta * 0.8) return metaColors.warning;
    return metaColors.below;
  };
  
  return (
    <Box h="100%">
      <VStack spacing={0.5} align="stretch" h="100%" justify="center">
        {sortedData.map((item, index) => (
          <Box key={index} w="100%" mb={1}>
            <Flex justify="space-between" mb={0.5}>
              <Text fontSize="10px" fontWeight="bold" color="black">{item.nome}</Text>
              <Text fontSize="10px" fontWeight="bold" color={getBarColor(item.valor)}>
                {formatarPorcentagem(item.valor)}
              </Text>
            </Flex>
            <Box position="relative" w="100%">
              {/* Barra de fundo */}
              <Flex w="100%" h="12px" bg="gray.100" borderRadius="sm" overflow="hidden">
                <Box 
                  h="100%" 
                  w={`${item.valor}%`} 
                  bg={getBarColor(item.valor)}
                  borderRadius="sm 0 0 sm"
                />
              </Flex>
              
              {/* Linha vertical indicando a meta */}
              <Box 
                position="absolute" 
                top="0" 
                left={`${meta}%`} 
                h="14px"
                w="1px"
                bg="rgba(0,0,0,0.7)"
                zIndex="2"
              />
            </Box>
            <Flex mt={0.5} justify="space-between">
              <Text fontSize="8px" color="gray.500">0%</Text>
              <Text fontSize="8px" color="gray.500">
                Meta: {meta}%
              </Text>
              <Text fontSize="8px" color="gray.500">100%</Text>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default function ComparativoUnidadesPage() {
  // Hooks e estados
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const debug = searchParams.get('debug') === 'true';
  const { images, chartFontes } = useReportStore();
  
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dadosProcessados, setDadosProcessados] = useState<ProcessedData | null>(null);
  const [reportDate, setReportDate] = useState<string>('');
  
  // Constantes para o layout
  const LOGO_HEIGHT = "36px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";
  
  // Função para processar os dados do relatório
  const processReportData = useCallback((data: any): ProcessedData | null => {
    if (!data) return null;
    
    // Extrair nomes das unidades para o título
    const unidadesNomes = data.dados?.unidades?.map((u: any) => u.nome) || [];
    
    // Estrutura para os dados processados
    const resultadosColheita = {
      disponibilidade_mecanica: [] as UnidadeData[],
      eficiencia_energetica: [] as UnidadeData[],
      motor_ocioso: [] as UnidadeData[],
      hora_elevador: [] as UnidadeData[],
      uso_gps: [] as UnidadeData[]
    };
    
    const resultadosTransbordo = {
      disponibilidade_mecanica: [] as UnidadeData[],
      eficiencia_energetica: [] as UnidadeData[],
      motor_ocioso: [] as UnidadeData[],
      falta_apontamento: [] as UnidadeData[],
      uso_gps: [] as UnidadeData[]
    };
    
    // Processar dados das unidades
    if (data.dados?.unidades) {
      data.dados.unidades.forEach((unidade: any) => {
        // Colheita
        if (unidade.colheita) {
          if (unidade.colheita.disponibilidade_mecanica !== undefined) {
            resultadosColheita.disponibilidade_mecanica.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.colheita.disponibilidade_mecanica
            });
          }
          
          if (unidade.colheita.eficiencia_energetica !== undefined) {
            resultadosColheita.eficiencia_energetica.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.colheita.eficiencia_energetica
            });
          }
          
          if (unidade.colheita.motor_ocioso !== undefined) {
            resultadosColheita.motor_ocioso.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.colheita.motor_ocioso
            });
          }
          
          if (unidade.colheita.hora_elevador !== undefined) {
            resultadosColheita.hora_elevador.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.colheita.hora_elevador
            });
          }
          
          if (unidade.colheita.uso_gps !== undefined) {
            resultadosColheita.uso_gps.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.colheita.uso_gps
            });
          }
        }
        
        // Transbordo
        if (unidade.transbordo) {
          if (unidade.transbordo.disponibilidade_mecanica !== undefined) {
            resultadosTransbordo.disponibilidade_mecanica.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.transbordo.disponibilidade_mecanica
            });
          }
          
          if (unidade.transbordo.eficiencia_energetica !== undefined) {
            resultadosTransbordo.eficiencia_energetica.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.transbordo.eficiencia_energetica
            });
          }
          
          if (unidade.transbordo.motor_ocioso !== undefined) {
            resultadosTransbordo.motor_ocioso.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.transbordo.motor_ocioso
            });
          }
          
          if (unidade.transbordo.falta_apontamento !== undefined) {
            resultadosTransbordo.falta_apontamento.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.transbordo.falta_apontamento
            });
          }
          
          if (unidade.transbordo.uso_gps !== undefined) {
            resultadosTransbordo.uso_gps.push({
              id: unidade.id,
              nome: unidade.nome,
              valor: unidade.transbordo.uso_gps
            });
          }
        }
      });
    }
    
    return {
      colheita: resultadosColheita,
      transbordo: resultadosTransbordo,
      unidadesNomes
    };
  }, []);
  
  // Dados de exemplo para modo de debug
  const dadosExemplo = useMemo(() => ({
    tipo: 'comparativo_unidades_diario',
    data: new Date().toISOString().split('T')[0],
    frente: 'Todas',
    dados: {
      unidades: [
        {
          id: 'unit1',
          nome: 'Frente 1 - BP Ituiutaba',
          colheita: {
            disponibilidade_mecanica: 87.5,
            eficiencia_energetica: 72.3,
            motor_ocioso: 3.2,
            hora_elevador: 4.5,
            uso_gps: 92.1
          },
          transbordo: {
            disponibilidade_mecanica: 89.8,
            eficiencia_energetica: 68.7,
            motor_ocioso: 4.8,
            falta_apontamento: 7.3,
            uso_gps: 88.2
          }
        },
        {
          id: 'unit2',
          nome: 'Frente 2 - CMAA Canápolis',
          colheita: {
            disponibilidade_mecanica: 92.1,
            eficiencia_energetica: 68.5,
            motor_ocioso: 4.1,
            hora_elevador: 5.2,
            uso_gps: 87.4
          },
          transbordo: {
            disponibilidade_mecanica: 84.5,
            eficiencia_energetica: 61.2,
            motor_ocioso: 5.7,
            falta_apontamento: 9.5,
            uso_gps: 91.3
          }
        },
        {
          id: 'unit3',
          nome: 'Frente 3 - Alexandrita',
          colheita: {
            disponibilidade_mecanica: 89.3,
            eficiencia_energetica: 75.8,
            motor_ocioso: 2.9,
            hora_elevador: 4.8,
            uso_gps: 94.5
          },
          transbordo: {
            disponibilidade_mecanica: 91.2,
            eficiencia_energetica: 70.3,
            motor_ocioso: 3.9,
            falta_apontamento: 5.8,
            uso_gps: 93.7
          }
        },
        {
          id: 'unit4',
          nome: 'Frente 4 - Zirleno',
          colheita: {
            disponibilidade_mecanica: 88.7,
            eficiencia_energetica: 71.2,
            motor_ocioso: 3.7,
            hora_elevador: 4.2,
            uso_gps: 89.8
          },
          transbordo: {
            disponibilidade_mecanica: 86.3,
            eficiencia_energetica: 64.8,
            motor_ocioso: 5.1,
            falta_apontamento: 8.7,
            uso_gps: 90.5
          }
        }
      ]
    }
  }), []);
  
  // Formatação da data para exibição
  const formatDate = useCallback((dateStr: string) => {
    try {
      console.log('Formatando data:', dateStr);
      
      if (!dateStr) return 'Data não disponível';
      
      // Se a data já estiver no formato brasileiro (dd/mm/aaaa)
      if (dateStr.includes('/')) {
        return dateStr;
      }
      
      // Se a data estiver no formato ISO (aaaa-mm-dd)
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn('Data inválida:', dateStr);
        return dateStr;
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateStr || 'Data não disponível';
    }
  }, []);
  
  // Função para buscar os dados do relatório
  const fetchReportData = useCallback(async () => {
    // Se estiver no modo debug, carregar dados de exemplo e pular a requisição ao Supabase
    if (debug) {
      console.log('Modo DEBUG ativado - carregando dados de exemplo');
      setReportData(dadosExemplo);
      setDadosProcessados(processReportData(dadosExemplo));
      setReportDate(formatDate(dadosExemplo.data));
      setIsLoading(false);
      return;
    }

    if (!reportId) {
      console.log('Sem ID de relatório fornecido');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Buscar o relatório pelo ID - usando a tabela correta
      const { data, error: fetchError } = await supabase
        .from('relatorios_diarios')
        .select('*')
        .eq('id', reportId)
        .single();
      
      if (fetchError) {
        console.error('Erro ao buscar relatório:', fetchError);
        setError('Erro ao buscar o relatório: ' + fetchError.message);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        console.log('📊 Dados do relatório:', data);
        setReportData(data);
        
        // Processar os dados
        const processedData = processReportData(data);
        setDadosProcessados(processedData);
        
        // Formatar a data
        setReportDate(formatDate(data.data));
      } else {
        console.log('Relatório não encontrado');
        setError('Relatório não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      setError('Ocorreu um erro ao buscar os dados do relatório');
    } finally {
      setIsLoading(false);
    }
  }, [reportId, debug, dadosExemplo, processReportData, formatDate]);
  
  // Efeito para carregar os dados do relatório
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);
  
  // Função para imprimir o relatório
  const handlePrint = useCallback(() => {
    window.print();
  }, []);
  
  // Título do relatório
  const reportTitle = useMemo(() => 'Comparativo de Unidades - Diário', []);
  
  // Renderização condicional do conteúdo
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" thickness="4px" color="green.500" />
      </Center>
    );
  }
  
  if (error) {
    return (
      <Center h="100vh" flexDirection="column" p={6}>
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Erro ao carregar o relatório</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button colorScheme="green" onClick={() => { 
          setReportData(dadosExemplo); 
          setDadosProcessados(processReportData(dadosExemplo));
          setReportDate(formatDate(dadosExemplo.data));
          setError(null); 
        }}>
          Carregar Dados de Exemplo
        </Button>
      </Center>
    );
  }
  
  if (!reportData) {
    return (
      <Center h="100vh" flexDirection="column" p={6}>
        <Alert status="warning" borderRadius="md" mb={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Nenhum relatório encontrado</AlertTitle>
          <AlertDescription>Verifique o ID do relatório ou use o modo de depuração.</AlertDescription>
        </Alert>
        <Button colorScheme="green" onClick={() => { 
          setReportData(dadosExemplo); 
          setDadosProcessados(processReportData(dadosExemplo));
          setReportDate(formatDate(dadosExemplo.data));
        }}>
          Carregar Dados de Exemplo
        </Button>
      </Center>
    );
  }
  
  // Renderização principal do relatório
  return (
    <Box bg="white" minH="100vh" pb={8}>
      {/* Botão de impressão fixo no canto superior direito */}
      <Box 
        position="fixed" 
        top="20px" 
        right="20px" 
        zIndex={10}
        className="no-print"
      >
        <Button
          leftIcon={<FaPrint />}
          colorScheme="black"
          variant="outline"
          size="sm"
          onClick={handlePrint}
        >
          Imprimir
        </Button>
      </Box>
      
      {/* PÁGINA 1 - Gráficos de Colheita */}
      <A4Colheita>
        <VStack spacing={4} align="stretch" width="100%">
          {/* Cabeçalho padronizado com logos */}
          <Flex justify="space-between" align="center" mb={4}>
            <Image
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
            <VStack spacing={0}>
              <Heading size="md" color="black" fontWeight="bold" textAlign="center">
                {reportTitle}
              </Heading>
              <Text color="black" fontSize="sm" fontWeight="medium">
                {dadosProcessados?.unidadesNomes?.join(" / ")}
              </Text>
              <Text color="black" fontSize="sm">
                {reportDate}
              </Text>
            </VStack>
            <Image 
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
          </Flex>

          {/* Seção de Colheita - APENAS GRÁFICOS */}
          <Box w="100%" mb={5}>
            <SectionTitle title="Colheita" />
            
            {/* Gráfico principal de Disponibilidade Mecânica */}
            <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
              <HorizontalBarChart 
                data={dadosProcessados?.colheita.disponibilidade_mecanica} 
                meta={90}
              />
            </Box>
            
            {/* Gráficos em 2 colunas */}
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Box>
                <Heading size="sm" mb={2} color="black" textAlign="center">
                  Eficiência Energética
                </Heading>
                <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
                  <HorizontalBarChart 
                    data={dadosProcessados?.colheita.eficiencia_energetica} 
                    meta={70}
                  />
                </Box>
              </Box>
              
              <Box>
                <Heading size="sm" mb={2} color="black" textAlign="center">
                  Motor Ocioso
                </Heading>
                <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
                  <HorizontalBarChart 
                    data={dadosProcessados?.colheita.motor_ocioso} 
                    meta={4}
                    metaColors={{ above: '#E53E3E', below: '#48BB78', warning: '#ECC94B' }}
                  />
                </Box>
              </Box>

              <Box>
                <Heading size="sm" mb={2} color="black" textAlign="center">
                  Horas Elevador
                </Heading>
                <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
                  <HorizontalBarChart 
                    data={dadosProcessados?.colheita.hora_elevador} 
                    meta={5}
                  />
                </Box>
              </Box>
              
              <Box>
                <Heading size="sm" mb={2} color="black" textAlign="center">
                  Uso GPS
                </Heading>
                <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
                  <HorizontalBarChart 
                    data={dadosProcessados?.colheita.uso_gps} 
                    meta={90}
                  />
                </Box>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      </A4Colheita>
      
      {/* PÁGINA 2 - Gráficos de Transbordo */}
      <A4Colheita>
        <VStack spacing={4} align="stretch" width="100%">
          {/* Cabeçalho padronizado com logos */}
          <Flex justify="space-between" align="center" mb={4}>
            <Image
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
            <VStack spacing={0}>
              <Heading size="md" color="black" fontWeight="bold" textAlign="center">
                {reportTitle}
              </Heading>
              <Text color="black" fontSize="sm" fontWeight="medium">
                {dadosProcessados?.unidadesNomes?.join(" / ")}
              </Text>
              <Text color="black" fontSize="sm">
                {reportDate}
              </Text>
            </VStack>
            <Image 
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
          </Flex>
          
          {/* Seção de Transbordo - APENAS GRÁFICOS */}
          <Box w="100%" mb={5}>
            <SectionTitle title="Transbordos" />
            
            {/* Gráfico principal de Disponibilidade Mecânica para Transbordo */}
            <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
              <HorizontalBarChart 
                data={dadosProcessados?.transbordo.disponibilidade_mecanica} 
                meta={90}
              />
            </Box>
            
            {/* Gráficos de Transbordo em 2 colunas */}
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Box>
                <Heading size="sm" mb={2} color="black" textAlign="center">
                  Eficiência Energética
                </Heading>
                <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
                  <HorizontalBarChart 
                    data={dadosProcessados?.transbordo.eficiencia_energetica} 
                    meta={65}
                  />
                </Box>
              </Box>
              
              <Box>
                <Heading size="sm" mb={2} color="black" textAlign="center">
                  Motor Ocioso
                </Heading>
                <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
                  <HorizontalBarChart 
                    data={dadosProcessados?.transbordo.motor_ocioso} 
                    meta={6}
                    metaColors={{ above: '#E53E3E', below: '#48BB78', warning: '#ECC94B' }}
                  />
                </Box>
              </Box>
              
              <Box>
                <Heading size="sm" mb={2} color="black" textAlign="center">
                  Falta de Apontamento
                </Heading>
                <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
                  <HorizontalBarChart 
                    data={dadosProcessados?.transbordo.falta_apontamento} 
                    meta={10}
                    metaColors={{ above: '#E53E3E', below: '#48BB78', warning: '#ECC94B' }}
                  />
                </Box>
              </Box>
              
              <Box>
                <Heading size="sm" mb={2} color="black" textAlign="center">
                  Uso GPS
                </Heading>
                <Box h="250px" w="100%" mt={2} mb={4} border="1px solid" borderColor="black" borderRadius="md" p={2} bg="white">
                  <HorizontalBarChart 
                    data={dadosProcessados?.transbordo.uso_gps} 
                    meta={90}
                  />
                </Box>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      </A4Colheita>
      
      {/* PÁGINA 3 - Cards Colheita apenas - agora organizados por unidade */}
      <A4Colheita>
        <VStack spacing={2} align="stretch" width="100%">
          {/* Cabeçalho padronizado com logos */}
          <Flex justify="space-between" align="center" mb={2}>
            <Image
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
            <VStack spacing={0}>
              <Heading size="md" color="black" fontWeight="bold" textAlign="center">
                {reportTitle}
              </Heading>
              <Text color="black" fontSize="sm" fontWeight="medium">
                {dadosProcessados?.unidadesNomes?.join(" / ")}
              </Text>
              <Text color="black" fontSize="sm">
                {reportDate}
              </Text>
            </VStack>
            <Image 
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
          </Flex>

          {/* Seção de Cards - Colheita - Organizado por unidade */}
          <Box w="100%" mb={2}>
            <SectionTitle title="Colheita - Indicadores por Unidade" />
            
            {/* Criamos uma SimpleGrid com 4 colunas (uma para cada unidade) */}
            <SimpleGrid columns={4} spacing={3} mb={3}>
              {dadosProcessados?.colheita.disponibilidade_mecanica.slice(0, 4).map((unidade, indexUnidade) => (
                <Box key={unidade.id}>
                  <Heading size="xs" mb={1} color="black" textAlign="center" fontSize="11px">
                    {unidade.nome}
                  </Heading>
                  <VStack spacing={2} align="stretch">
                    {/* Disponibilidade Mecânica */}
                    <IndicatorCard
                      title="Disponibilidade"
                      value={dadosProcessados.colheita.disponibilidade_mecanica[indexUnidade]?.valor || 0}
                      meta={90}
                      isInverted={false}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 1 : indexUnidade === 1 ? 2 : indexUnidade === 2 ? 3 : 0,
                        total: indexUnidade === 0 ? 8 : indexUnidade === 1 ? 10 : indexUnidade === 2 ? 7 : 9,
                        percentual: (indexUnidade === 0 ? 1/8 : indexUnidade === 1 ? 2/10 : indexUnidade === 2 ? 3/7 : 0) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                    
                    {/* Eficiência Energética */}
                    <IndicatorCard
                      title="Eficiência Energética"
                      value={dadosProcessados.colheita.eficiencia_energetica[indexUnidade]?.valor || 0}
                      meta={70}
                      isInverted={false}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 5 : indexUnidade === 1 ? 4 : indexUnidade === 2 ? 6 : 3,
                        total: indexUnidade === 0 ? 12 : indexUnidade === 1 ? 9 : indexUnidade === 2 ? 11 : 8,
                        percentual: (indexUnidade === 0 ? 5/12 : indexUnidade === 1 ? 4/9 : indexUnidade === 2 ? 6/11 : 3/8) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                    
                    {/* Motor Ocioso */}
                    <IndicatorCard
                      title="Motor Ocioso"
                      value={dadosProcessados.colheita.motor_ocioso[indexUnidade]?.valor || 0}
                      meta={4}
                      isInverted={true}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 7 : indexUnidade === 1 ? 6 : indexUnidade === 2 ? 5 : 4,
                        total: indexUnidade === 0 ? 12 : indexUnidade === 1 ? 9 : indexUnidade === 2 ? 11 : 8,
                        percentual: (indexUnidade === 0 ? 7/12 : indexUnidade === 1 ? 6/9 : indexUnidade === 2 ? 5/11 : 4/8) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                    
                    {/* Horas Elevador */}
                    <IndicatorCard
                      title="Horas Elevador"
                      value={dadosProcessados.colheita.hora_elevador[indexUnidade]?.valor || 0}
                      meta={5}
                      isInverted={false}
                      unitType="horas"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 4 : indexUnidade === 1 ? 3 : indexUnidade === 2 ? 5 : 2,
                        total: indexUnidade === 0 ? 8 : indexUnidade === 1 ? 7 : indexUnidade === 2 ? 9 : 6,
                        percentual: (indexUnidade === 0 ? 4/8 : indexUnidade === 1 ? 3/7 : indexUnidade === 2 ? 5/9 : 2/6) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                    
                    {/* Uso GPS */}
                    <IndicatorCard
                      title="Uso GPS"
                      value={dadosProcessados.colheita.uso_gps[indexUnidade]?.valor || 0}
                      meta={90}
                      isInverted={false}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 5 : indexUnidade === 1 ? 4 : indexUnidade === 2 ? 3 : 6,
                        total: indexUnidade === 0 ? 8 : indexUnidade === 1 ? 10 : indexUnidade === 2 ? 7 : 9,
                        percentual: (indexUnidade === 0 ? 5/8 : indexUnidade === 1 ? 4/10 : indexUnidade === 2 ? 3/7 : 6/9) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </A4Colheita>
      
      {/* PÁGINA 4 - Cards Transbordo apenas - agora organizados por unidade */}
      <A4Colheita>
        <VStack spacing={2} align="stretch" width="100%">
          {/* Cabeçalho padronizado com logos */}
          <Flex justify="space-between" align="center" mb={2}>
            <Image
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
            <VStack spacing={0}>
              <Heading size="md" color="black" fontWeight="bold" textAlign="center">
                {reportTitle}
              </Heading>
              <Text color="black" fontSize="sm" fontWeight="medium">
                {dadosProcessados?.unidadesNomes?.join(" / ")}
              </Text>
              <Text color="black" fontSize="sm">
                {reportDate}
              </Text>
            </VStack>
            <Image 
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
          </Flex>
          
          {/* Seção de Cards - Transbordo - Organizado por unidade */}
          <Box w="100%" mb={2}>
            <SectionTitle title="Transbordo - Indicadores por Unidade" />
            
            {/* Criamos uma SimpleGrid com 4 colunas (uma para cada unidade) */}
            <SimpleGrid columns={4} spacing={3} mb={3}>
              {dadosProcessados?.transbordo.disponibilidade_mecanica.slice(0, 4).map((unidade, indexUnidade) => (
                <Box key={unidade.id}>
                  <Heading size="xs" mb={1} color="black" textAlign="center" fontSize="11px">
                    {unidade.nome}
                  </Heading>
                  <VStack spacing={2} align="stretch">
                    {/* Disponibilidade Mecânica */}
                    <IndicatorCard
                      title="Disponibilidade"
                      value={dadosProcessados.transbordo.disponibilidade_mecanica[indexUnidade]?.valor || 0}
                      meta={90}
                      isInverted={false}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 4 : indexUnidade === 1 ? 6 : indexUnidade === 2 ? 5 : 7,
                        total: indexUnidade === 0 ? 7 : indexUnidade === 1 ? 9 : indexUnidade === 2 ? 8 : 10,
                        percentual: (indexUnidade === 0 ? 4/7 : indexUnidade === 1 ? 6/9 : indexUnidade === 2 ? 5/8 : 7/10) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                    
                    {/* Eficiência Energética */}
                    <IndicatorCard
                      title="Eficiência Energética"
                      value={dadosProcessados.transbordo.eficiencia_energetica[indexUnidade]?.valor || 0}
                      meta={65}
                      isInverted={false}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 6 : indexUnidade === 1 ? 5 : indexUnidade === 2 ? 7 : 4,
                        total: indexUnidade === 0 ? 10 : indexUnidade === 1 ? 8 : indexUnidade === 2 ? 12 : 7,
                        percentual: (indexUnidade === 0 ? 6/10 : indexUnidade === 1 ? 5/8 : indexUnidade === 2 ? 7/12 : 4/7) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                    
                    {/* Motor Ocioso */}
                    <IndicatorCard
                      title="Motor Ocioso"
                      value={dadosProcessados.transbordo.motor_ocioso[indexUnidade]?.valor || 0}
                      meta={6}
                      isInverted={true}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 5 : indexUnidade === 1 ? 4 : indexUnidade === 2 ? 8 : 3,
                        total: indexUnidade === 0 ? 10 : indexUnidade === 1 ? 8 : indexUnidade === 2 ? 12 : 7,
                        percentual: (indexUnidade === 0 ? 5/10 : indexUnidade === 1 ? 4/8 : indexUnidade === 2 ? 8/12 : 3/7) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                    
                    {/* Falta de Apontamento */}
                    <IndicatorCard
                      title="Falta de Apontamento"
                      value={dadosProcessados.transbordo.falta_apontamento[indexUnidade]?.valor || 0}
                      meta={10}
                      isInverted={true}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 6 : indexUnidade === 1 ? 7 : indexUnidade === 2 ? 5 : 6,
                        total: indexUnidade === 0 ? 9 : indexUnidade === 1 ? 11 : indexUnidade === 2 ? 8 : 10,
                        percentual: (indexUnidade === 0 ? 6/9 : indexUnidade === 1 ? 7/11 : indexUnidade === 2 ? 5/8 : 6/10) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                    
                    {/* Uso GPS */}
                    <IndicatorCard
                      title="Uso GPS"
                      value={dadosProcessados.transbordo.uso_gps[indexUnidade]?.valor || 0}
                      meta={90}
                      isInverted={false}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: indexUnidade === 0 ? 4 : indexUnidade === 1 ? 5 : indexUnidade === 2 ? 6 : 7,
                        total: indexUnidade === 0 ? 7 : indexUnidade === 1 ? 9 : indexUnidade === 2 ? 8 : 10,
                        percentual: (indexUnidade === 0 ? 4/7 : indexUnidade === 1 ? 5/9 : indexUnidade === 2 ? 6/8 : 7/10) * 100
                      }}
                      showMetaOnTop={true}
                      showSummaryOnBottom={true}
                    />
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </A4Colheita>

      {/* PÁGINA 5 - Apenas tabelas */}
      <A4Colheita>
        <VStack spacing={4} align="stretch" width="100%">
          {/* Cabeçalho padronizado com logos */}
          <Flex justify="space-between" align="center" mb={4}>
            <Image
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
            <VStack spacing={0}>
              <Heading size="md" color="black" fontWeight="bold" textAlign="center">
                {reportTitle}
              </Heading>
              <Text color="black" fontSize="sm" fontWeight="medium">
                {dadosProcessados?.unidadesNomes?.join(" / ")}
              </Text>
              <Text color="black" fontSize="sm">
                {reportDate}
              </Text>
            </VStack>
            <Image 
              src={LOGO_URL}
              alt="Logo IB"
              h={LOGO_HEIGHT}
              objectFit="contain"
            />
          </Flex>

          {/* Tabela Colheita */}
          <Box mb={5}>
            <SectionTitle title="Detalhamento por Unidade - Colheita" />
            {dadosProcessados && (
              <TabelaUnidades 
                dados={dadosProcessados} 
                tipo="colheita"
              />
            )}
          </Box>
          
          <Divider my={4} borderColor="gray.400" />
          
          {/* Tabela Transbordo */}
          <Box mb={5}>
            <SectionTitle title="Detalhamento por Unidade - Transbordo" />
            {dadosProcessados && (
              <TabelaUnidades 
                dados={dadosProcessados} 
                tipo="transbordo"
              />
            )}
          </Box>
        </VStack>
      </A4Colheita>
    </Box>
  );
} 