'use client';

import { Box, VStack, Heading, Image, Flex, Text, Grid, GridItem, Center, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { useReportStore } from '@/store/useReportStore';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { configManager } from '@/utils/config';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import A4Colheita from '@/components/Layout/A4Colheita';

interface DronesA4Props {
  data?: any;
}

// Dados fictícios para o modo de pré-visualização
const mockFlightData = {
  daysWorked: 5,
  totalSprayedArea: "350.75",
  totalFlightDuration: "18.25",
  avgFlightDurationPerDay: "3.65",
  hectaresPerHour: "19.22",
  hectaresPerDay: "70.15"
};

const mockChartData = [
  { name: 'Hectares Aplicados', value: 350.75 },
  { name: 'Ha/Dia', value: 70.15 },
  { name: 'Ha/Hora', value: 19.22 },
  { name: 'Média Hora voo Dia', value: 3.65 },
  { name: 'Horas de voo', value: 18.25 }
];

// Mock de layouts para pré-visualização
const mockLayouts = [
  {
    pageNumber: 1,
    layoutType: 'single',
    imagesPerPage: 1,
    images: [
      { containerId: 'droneImage1', data: 'https://via.placeholder.com/800x600?text=Imagem+1', fonte: 'sgpa' }
    ]
  },
  {
    pageNumber: 2,
    layoutType: 'double',
    imagesPerPage: 2,
    images: [
      { containerId: 'droneImage2', data: 'https://via.placeholder.com/800x600?text=Imagem+2', fonte: 'jd' },
      { containerId: 'droneImage3', data: 'https://via.placeholder.com/800x600?text=Imagem+3', fonte: 'outro' }
    ]
  },
  {
    pageNumber: 3,
    layoutType: 'triple',
    imagesPerPage: 3,
    images: [
      { containerId: 'droneImage4', data: 'https://via.placeholder.com/800x600?text=Imagem+4', fonte: 'sgpa' },
      { containerId: 'droneImage5', data: 'https://via.placeholder.com/800x600?text=Imagem+5', fonte: 'jd' },
      { containerId: 'droneImage6', data: 'https://via.placeholder.com/800x600?text=Imagem+6', fonte: 'outro' }
    ]
  }
];

export default function DronesA4({ data }: DronesA4Props) {
  const { images, chartFontes } = useReportStore();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const format = searchParams.get('format');
  const isPdfMode = format === 'pdf';
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  // Carregar dados do relatório
  const [reportData, setReportData] = useState<any>(null);
  const [processedData, setProcessedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flightData, setFlightData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pageLayouts, setPageLayouts] = useState<any[]>([]);

  // Função para formatar a data no padrão brasileiro
  const formatarData = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const currentDate = formatarData(new Date().toISOString().split('T')[0]);
  
  // Forçar o uso da visualização prévia se não houver ID de relatório
  // Isso é importante para permitir a visualização sem depender da configuração
  const shouldUsePreview = !reportId || configManager.getVisualizacaoPrevia();
  
  // Log para depuração
  console.log('shouldUsePreview:', shouldUsePreview);
  console.log('configManager.getVisualizacaoPrevia():', configManager.getVisualizacaoPrevia());
  console.log('Config defaults:', configManager.getDefaults());
  
  // Inicializar com dados de pré-visualização se necessário
  useEffect(() => {
    if (shouldUsePreview) {
      console.log("Carregando dados de pré-visualização na inicialização...");
      setFlightData(mockFlightData);
      setChartData(mockChartData);
      setPageLayouts(mockLayouts);
      setLoading(false);
    } else {
      loadReportData();
    }
  }, [reportId]);
  
  // Função para carregar dados do relatório separada para melhor organização
  const loadReportData = async () => {
    try {
      setLoading(true);
      
      if (!reportId) {
        setError("Nenhum ID de relatório encontrado");
        return;
      }
      
      const { data: report, error } = await supabase
        .from('relatorios_diarios')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw new Error(error.message);
      
      if (report) {
        setReportData(report);
        processExcelData(report.dados);
      } else {
        throw new Error("Relatório não encontrado");
      }
    } catch (err: any) {
      console.error("Erro ao carregar relatório:", err);
      setError(err.message || "Erro desconhecido ao carregar dados");
      
      // Se houver erro, mas estamos em modo de visualização prévia, carregamos os dados de exemplo
      if (shouldUsePreview) {
        console.log("Usando dados de pré-visualização após erro de carregamento");
        setFlightData(mockFlightData);
        setChartData(mockChartData);
        setPageLayouts(mockLayouts);
      }
    } finally {
      setLoading(false);
    }
  };

  // Processar dados do Excel para exibição no relatório
  const processExcelData = (data: any) => {
    if (!data) {
      if (shouldUsePreview) {
        setFlightData(mockFlightData);
        setChartData(mockChartData);
      }
      return;
    }
    
    // Processar os dados específicos do arquivo da DJI
    let flightRecords = [];
    
    if (data.flight_record && Array.isArray(data.flight_record)) {
      flightRecords = data.flight_record;
    } else if (data["flight record"] && Array.isArray(data["flight record"])) {
      flightRecords = data["flight record"];
    }
    
    if (flightRecords.length === 0) {
      console.error("Nenhum dado de voo encontrado");
      
      // Se não houver dados de voo e devemos usar a visualização prévia
      if (shouldUsePreview) {
        setFlightData(mockFlightData);
        setChartData(mockChartData);
      }
      return;
    }
    
    // Calcular totais e médias
    let totalSprayedArea = 0;
    let totalFlightDuration = 0;
    let flightDays = new Set();
    
    flightRecords.forEach((record: any) => {
      if (record["Sprayed area"]) {
        totalSprayedArea += parseFloat(record["Sprayed area"]);
      } else if (record["Area"]) {
        totalSprayedArea += parseFloat(record["Area"]);
      }
      
      if (record["Flight Duration (Decimal)"]) {
        totalFlightDuration += parseFloat(record["Flight Duration (Decimal)"]);
      }
      
      if (record["Day"]) {
        flightDays.add(record["Day"]);
      } else if (record["Data"]) {
        flightDays.add(record["Data"]);
      }
    });
    
    const daysWorked = flightDays.size;
    const hectaresPerDay = daysWorked > 0 ? totalSprayedArea / daysWorked : 0;
    const hectaresPerHour = totalFlightDuration > 0 ? totalSprayedArea / totalFlightDuration : 0;
    
    // Preparar os dados para o relatório
    const summaryData = {
      daysWorked,
      totalSprayedArea: totalSprayedArea.toFixed(2),
      totalFlightDuration: totalFlightDuration.toFixed(2),
      avgFlightDurationPerDay: (totalFlightDuration / daysWorked).toFixed(2),
      hectaresPerHour: hectaresPerHour.toFixed(2),
      hectaresPerDay: hectaresPerDay.toFixed(2)
    };
    
    // Preparar dados para o gráfico
    const chartData = [
      {
        name: 'Hectares Aplicados',
        value: parseFloat(summaryData.totalSprayedArea)
      },
      {
        name: 'Ha/Dia',
        value: parseFloat(summaryData.hectaresPerDay)
      },
      {
        name: 'Ha/Hora',
        value: parseFloat(summaryData.hectaresPerHour)
      },
      {
        name: 'Média Hora voo Dia',
        value: parseFloat(summaryData.avgFlightDurationPerDay)
      },
      {
        name: 'Horas de voo',
        value: parseFloat(summaryData.totalFlightDuration)
      }
    ];
    
    setFlightData(summaryData);
    setChartData(chartData);
    setProcessedData(data);
  };

  // Organizar as imagens em páginas com base nos pageLayouts armazenados
  useEffect(() => {
    // Se estivermos usando visualização prévia, não reorganizamos as imagens
    // OU se não houver imagens, também não reorganizamos
    if ((shouldUsePreview && pageLayouts.length > 0) || images.length === 0) return;

    // Filtrar apenas as imagens para relatório de drones
    const droneImages = images.filter(img => 
      img.containerId.startsWith('droneImage')
    );

    if (droneImages.length === 0) return;

    // Organizar imagens na sequência correta (1, 2, 3, 4, 5, 6)
    const sortedImages = [...droneImages].sort((a, b) => {
      // Extrai o número do ID (droneImage1 -> 1, droneImage10 -> 10)
      const numA = parseInt(a.containerId.replace('droneImage', ''));
      const numB = parseInt(b.containerId.replace('droneImage', ''));
      return numA - numB;
    });

    // Configuração de layouts para cada página
    const layouts = [];
    
    // Determinar layout para página 1 (sempre 1 imagem)
    if (sortedImages.length > 0) {
      layouts.push({
        pageNumber: 1,
        layoutType: 'single',
        imagesPerPage: 1,
        images: [sortedImages[0]]
      });
    }

    // Determinar layout para página 2 (sempre 2 imagens, imagens 2 e 3)
    if (sortedImages.length > 1) {
      const page2Images = sortedImages.slice(1, 3);
      layouts.push({
        pageNumber: 2,
        layoutType: 'double',
        imagesPerPage: 2,
        images: page2Images
      });
    }

    // Determinar layout para página 3 (sempre 3 imagens, imagens 4, 5 e 6)
    if (sortedImages.length > 3) {
      const page3Images = sortedImages.slice(3, 6);
      layouts.push({
        pageNumber: 3,
        layoutType: 'triple',
        imagesPerPage: 3,
        images: page3Images
      });
    }

    setPageLayouts(layouts);
  }, [images, shouldUsePreview]);

  // Tipos de fonte
  type FonteType = 'excel' | 'image';

  // Renderizar a fonte (SGPA, JD, etc)
  const RenderFonte = ({ 
    type,
    fonte,
    position = 'bottom-right' 
  }: { 
    type: FonteType;
    fonte?: string;
    position?: 'bottom-right' | 'top-right';
  }) => {
    // Não exibir nenhuma fonte adicional no template
    return null;
  };

  // Renderizar uma imagem do relatório
  const RenderImage = ({ image, alt }: { image: any; alt: string }) => {
    if (!image) return null;
    
    return (
      <Box position="relative" w="100%" h="100%" overflow="hidden">
        <Image 
          src={image.data} 
          alt={alt}
          objectFit="contain"
          w="100%"
          h="100%"
        />
      </Box>
    );
  };

  // Cabeçalho da página
  const PageHeader = ({ showDate = true }: { showDate?: boolean }) => {
    // Encontrar o nome completo da frente no config
    const reportType = reportData?.type || 'drones_diario';
    const frenteConfig = configManager.getFrentes(reportType).find((f: { id: string }) => f.id === reportData?.frente);
    const nomeFrente = frenteConfig?.nome || reportData?.frente || 'Aplicação';
    
    // Determinar o título baseado no modo atual
    const titulo = shouldUsePreview && !reportData 
      ? 'Pré-visualização' 
      : nomeFrente;

    return (
      <Flex 
        justify="space-between" 
        align="center" 
        mb={4}
        sx={{
          '@media print': {
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: '16px',
            display: 'flex'
          }
        }}
      >
        <Image
          src={LOGO_URL}
          alt="Logo IB"
          h={LOGO_HEIGHT}
          objectFit="contain"
          sx={{
            '@media print': {
              h: LOGO_HEIGHT,
              objectFit: 'contain'
            }
          }}
        />
        <VStack 
          spacing={1}
          sx={{
            '@media print': {
              display: 'flex',
              flexDirection: 'column',
              spacing: '4px'
            }
          }}
        >
          <Heading 
            size="md" 
            color="black" 
            fontWeight="bold" 
            textAlign="center"
            sx={{
              '@media print': {
                color: 'black',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '18px'
              }
            }}
          >
            Relatório de Drones - {titulo}
          </Heading>
          {showDate && (
            <Text 
              color="black" 
              fontSize="sm"
              sx={{
                '@media print': {
                  color: 'black',
                  fontSize: '14px'
                }
              }}
            >
              {reportData?.data ? formatarData(reportData.data) : currentDate}
            </Text>
          )}
        </VStack>
        <Image 
          src={LOGO_URL} 
          alt="Logo IB"
          h={LOGO_HEIGHT}
          objectFit="contain"
          sx={{
            '@media print': {
              h: LOGO_HEIGHT,
              objectFit: 'contain'
            }
          }}
        />
      </Flex>
    );
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
      sx={{
        '@media print': {
          textAlign: centered ? 'center' : 'left',
          mb: '8px',
          fontSize: '15px',
          color: 'black',
          fontWeight: 'semibold'
        }
      }}
    >
      {title}
    </Heading>
  );

  // Renderizar tabela de dados do drone
  const RenderDroneTable = () => {
    if (!flightData) return null;

    return (
      <Box 
        w="100%" 
        mb={2}
        sx={{
          '@media print': {
            w: '100%',
            mb: '8px'
          }
        }}
      >
        <SectionTitle title="Hectares e Horas" centered={true} />
        
        {/* Contêiner Grid para tabela e gráfico lado a lado para impressão consistente */}
        <Grid 
          templateColumns={{ base: "1fr", md: "35% 63%" }}
          gap={2}
          justifyContent="space-between"
          sx={{
            '@media print': {
              display: 'grid',
              gridTemplateColumns: '35% 63%',
              gap: '8px',
              justifyContent: 'space-between'
            }
          }}
        >
          {/* Tabela utilizando o padrão dos outros relatórios */}
          <Box 
            border="1px solid" 
            borderColor="black" 
            borderRadius="md" 
            overflow="hidden"
            bg="white"
            h={{ base: "auto", md: "235px" }}
          >
            <Box as="table" w="100%" fontSize="11px" color="black">
              <Box as="thead">
                <Box as="tr" bg="gray.100">
                  <Box as="th" p={1.5} textAlign="left" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                    Drone
                  </Box>
                  <Box as="th" p={1.5} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                    S. Atual
                  </Box>
                </Box>
              </Box>
              <Box as="tbody">
                <Box as="tr" bg="white">
                  <Box as="td" p={1.5} borderBottom="1px solid" borderColor="black" color="black">
                    Dias Trabalhados
                  </Box>
                  <Box as="td" p={1.5} textAlign="right" borderBottom="1px solid" borderColor="black" color="black" fontWeight="medium">
                    {flightData.daysWorked}
                  </Box>
                </Box>
                <Box as="tr" bg="gray.50">
                  <Box as="td" p={1.5} borderBottom="1px solid" borderColor="black" color="black">
                    Hectares Aplicados
                  </Box>
                  <Box as="td" p={1.5} textAlign="right" borderBottom="1px solid" borderColor="black" color="black" fontWeight="medium">
                    {flightData.totalSprayedArea}
                  </Box>
                </Box>
                <Box as="tr" bg="white">
                  <Box as="td" p={1.5} borderBottom="1px solid" borderColor="black" color="black">
                    Horas de voo
                  </Box>
                  <Box as="td" p={1.5} textAlign="right" borderBottom="1px solid" borderColor="black" color="black" fontWeight="medium">
                    {flightData.totalFlightDuration}
                  </Box>
                </Box>
                <Box as="tr" bg="gray.50">
                  <Box as="td" p={1.5} borderBottom="1px solid" borderColor="black" color="black">
                    Média Hora voo Dia
                  </Box>
                  <Box as="td" p={1.5} textAlign="right" borderBottom="1px solid" borderColor="black" color="black" fontWeight="medium">
                    {flightData.avgFlightDurationPerDay}
                  </Box>
                </Box>
                <Box as="tr" bg="white">
                  <Box as="td" p={1.5} borderBottom="1px solid" borderColor="black" color="black">
                    Ha/Hora
                  </Box>
                  <Box as="td" p={1.5} textAlign="right" borderBottom="1px solid" borderColor="black" color="black" fontWeight="medium">
                    {flightData.hectaresPerHour}
                  </Box>
                </Box>
                <Box as="tr" bg="gray.50">
                  <Box as="td" p={1.5} borderBottom="1px solid" borderColor="black" color="black">
                    Ha/Dia
                  </Box>
                  <Box as="td" p={1.5} textAlign="right" borderBottom="1px solid" borderColor="black" color="black" fontWeight="medium">
                    {flightData.hectaresPerDay}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Gráfico no padrão dos outros relatórios */}
          <Box 
            h={{ base: "250px", md: "235px" }}
          >
            <Box 
              w="100%" 
              h="100%" 
              border="1px solid" 
              borderColor="black" 
              borderRadius="md" 
              p={2}
              bg="white"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 15, right: 40, left: -40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000000' }}
                    domain={[0, 'dataMax']}
                    tickCount={5}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={110}
                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000000' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value}`, '']} 
                    contentStyle={{ fontSize: '10px' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#48BB78" 
                    name="" 
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList 
                      dataKey="value" 
                      position="right" 
                      formatter={(value: any) => `${value}`}
                      style={{ 
                        fontSize: 10, 
                        fontWeight: 'bold',
                        fill: '#000000' 
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
        
        {/* Texto de fonte centralizado abaixo da tabela e gráfico */}
        <Box width="100%" textAlign="center" mt={1}>
          <Text fontSize="xs" color="black">Fonte: DJI SmartFarm.</Text>
        </Box>
      </Box>
    );
  };

  // Estado de carregamento
  if (loading) {
    return (
      <Center h="100vh">
        <Text>Carregando dados do relatório...</Text>
      </Center>
    );
  }

  // Se nenhum dado está disponível, mas estamos usando o modo de pré-visualização
  if (!flightData && shouldUsePreview) {
    console.error("Erro inesperado: pré-visualização ativada mas sem dados mockados");
    // Como uma última tentativa, tentamos atribuir os dados de pré-visualização aqui
    return (
      <Center h="100vh">
        <Text>Reconfigurando visualização prévia...</Text>
      </Center>
    );
  }

  // Se há um erro e não estamos usando pré-visualização
  if (error && !shouldUsePreview) {
    return (
      <Center h="100vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  // Se não há dados e não estamos usando pré-visualização
  if (!flightData && !shouldUsePreview) {
    return (
      <Center h="100vh">
        <Text>Nenhum dado disponível para esse relatório</Text>
      </Center>
    );
  }

  // Renderização normal do relatório
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
          pageOrientation: 'portrait !important',
          size: 'A4 !important',
          '& > *': {
            m: '0 !important',
            p: '0 !important'
          }
        } 
      }}
    >
      {/* Primeira página - Dados do voo e cabeçalho */}
      <A4Colheita>
        <Box 
          h="100%" 
          bg="white" 
          p={{ top: 4, left: 4, right: 4, bottom: 2 }}
          display="grid"
          gridTemplateRows="auto 1fr"
          sx={{ 
            '@media print': { 
              breakInside: 'avoid !important',
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
            } 
          }}
        >
          <PageHeader showDate={true} />
          
          <Grid 
            templateRows="auto 1fr"
            h="calc(100% - 70px)" 
            gap={2}
            sx={{
              '@media print': {
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                h: 'calc(100% - 70px)',
                gap: '8px'
              }
            }}
          >
            {/* Dados do drone */}
            <Box 
              w="100%"
              sx={{
                '@media print': {
                  w: '100%',
                  display: 'block'
                }
              }}
            >
              <RenderDroneTable />
            </Box>
            
            {/* Imagem principal na primeira página */}
            <Box
              w="100%"
              h="100%"
              sx={{
                '@media print': {
                  w: '100%',
                  h: '100%',
                  display: 'block'
                }
              }}
            >
              <SectionTitle title="Imagem de Aplicação" centered={true} />
              <Box 
                w="100%" 
                h="calc(100% - 25px)" 
                border="1px solid" 
                borderColor="black" 
                borderRadius="md" 
                overflow="hidden"
                bg="white"
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  '@media print': {
                    border: '1px solid black',
                    borderRadius: 'md',
                    h: 'calc(100% - 25px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                }}
              >
                {pageLayouts.length > 0 && pageLayouts[0]?.images?.length > 0 ? (
                  <Box 
                    position="relative" 
                    w="100%" 
                    h="100%" 
                    maxH="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      '@media print': {
                        w: '100%',
                        h: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Image 
                      src={pageLayouts[0].images[0].data} 
                      alt="Imagem Principal"
                      objectFit="contain"
                      maxW="100%"
                      maxH="100%"
                      sx={{
                        '@media print': {
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Center h="100%">
                    <Text color="gray.500">Nenhuma imagem disponível</Text>
                  </Center>
                )}
              </Box>
            </Box>
          </Grid>
        </Box>
      </A4Colheita>
      
      {/* Segunda página - Layout de uma coluna com duas imagens */}
      {pageLayouts.length > 1 && (
        <A4Colheita isLastPage={pageLayouts.length === 2}>
          <Box 
            h="100%" 
            bg="white" 
            p={{ top: 4, left: 4, right: 4, bottom: 2 }} 
            display="grid"
            gridTemplateRows="auto 1fr"
            sx={{ 
              '@media print': { 
                breakInside: 'avoid !important',
                display: 'grid',
                gridTemplateRows: 'auto 1fr'
              } 
            }}
          >
            <PageHeader showDate={false} />
            
            <Grid
              h="calc(100% - 70px)"
              templateRows="1fr 1fr"
              gap={2}
              sx={{
                '@media print': {
                  display: 'grid',
                  gridTemplateRows: '1fr 1fr',
                  h: 'calc(100% - 70px)',
                  gap: '8px'
                }
              }}
            >
              {/* Primeira imagem */}
              <Box 
                w="100%" 
                h="100%"
                border="1px solid" 
                borderColor="black" 
                borderRadius="md" 
                overflow="hidden"
                bg="white"
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  '@media print': {
                    border: '1px solid black',
                    h: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                }}
              >
                {pageLayouts[0]?.images?.length > 1 ? (
                  <Box 
                    position="relative" 
                    w="100%" 
                    h="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      '@media print': {
                        w: '100%',
                        h: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Image 
                      src={pageLayouts[0].images[1].data} 
                      alt="Imagem 2"
                      objectFit="contain"
                      maxW="100%"
                      maxH="100%"
                      sx={{
                        '@media print': {
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }
                      }}
                    />
                  </Box>
                ) : pageLayouts[1]?.images?.length > 0 ? (
                  <Box 
                    position="relative" 
                    w="100%" 
                    h="100%" 
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      '@media print': {
                        w: '100%',
                        h: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Image 
                      src={pageLayouts[1].images[0].data} 
                      alt="Imagem 2"
                      objectFit="contain"
                      maxW="100%"
                      maxH="100%"
                      sx={{
                        '@media print': {
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Center h="100%">
                    <Text color="gray.500">Imagem 1</Text>
                  </Center>
                )}
              </Box>

              {/* Segunda imagem */}
              <Box 
                w="100%" 
                h="100%"
                border="1px solid" 
                borderColor="black" 
                borderRadius="md" 
                overflow="hidden"
                bg="white"
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  '@media print': {
                    border: '1px solid black',
                    h: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                }}
              >
                {pageLayouts[0]?.images?.length > 2 ? (
                  <Box 
                    position="relative" 
                    w="100%" 
                    h="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      '@media print': {
                        w: '100%',
                        h: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Image 
                      src={pageLayouts[0].images[2].data} 
                      alt="Imagem 3"
                      objectFit="contain"
                      maxW="100%"
                      maxH="100%"
                      sx={{
                        '@media print': {
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }
                      }}
                    />
                  </Box>
                ) : pageLayouts[1]?.images?.length > 1 ? (
                  <Box 
                    position="relative" 
                    w="100%" 
                    h="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      '@media print': {
                        w: '100%',
                        h: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Image 
                      src={pageLayouts[1].images[1].data} 
                      alt="Imagem 3"
                      objectFit="contain"
                      maxW="100%"
                      maxH="100%"
                      sx={{
                        '@media print': {
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Center h="100%">
                    <Text color="gray.500">Imagem 2</Text>
                  </Center>
                )}
              </Box>
            </Grid>
          </Box>
        </A4Colheita>
      )}
      
      {/* Terceira página - Layout com 3 imagens uma acima da outra */}
      {pageLayouts.length > 0 && (
        <A4Colheita isLastPage={true}>
          <Box 
            h="100%" 
            bg="white" 
            p={{ top: 4, left: 4, right: 4, bottom: 2 }} 
            display="grid"
            gridTemplateRows="auto 1fr"
            sx={{ 
              '@media print': { 
                breakInside: 'avoid !important',
                display: 'grid',
                gridTemplateRows: 'auto 1fr'
              } 
            }}
          >
            <PageHeader showDate={false} />
            
            <Grid
              h="calc(100% - 70px)"
              templateRows="1fr 1fr 1fr"
              gap={2}
              sx={{
                '@media print': {
                  display: 'grid',
                  gridTemplateRows: '1fr 1fr 1fr',
                  h: 'calc(100% - 70px)',
                  gap: '8px'
                }
              }}
            >
              {/* Primeira imagem */}
              <Box 
                w="100%" 
                h="100%"
                border="1px solid" 
                borderColor="black" 
                borderRadius="md" 
                overflow="hidden"
                bg="white"
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  '@media print': {
                    border: '1px solid black',
                    h: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                }}
              >
                {pageLayouts[1]?.images?.length > 1 ? (
                  <Box 
                    position="relative" 
                    w="100%" 
                    h="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      '@media print': {
                        w: '100%',
                        h: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Image 
                      src={pageLayouts[1].images[1].data} 
                      alt="Imagem 4"
                      objectFit="contain"
                      maxW="100%"
                      maxH="100%"
                      sx={{
                        '@media print': {
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }
                      }}
                    />
                  </Box>
                ) : pageLayouts[2]?.images?.length > 0 ? (
                  <Box 
                    position="relative" 
                    w="100%" 
                    h="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      '@media print': {
                        w: '100%',
                        h: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Image 
                      src={pageLayouts[2].images[0].data} 
                      alt="Imagem 4"
                      objectFit="contain"
                      maxW="100%"
                      maxH="100%"
                      sx={{
                        '@media print': {
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Center h="100%">
                    <Text color="gray.500">Imagem 1</Text>
                  </Center>
                )}
              </Box>
              
              {/* Segunda imagem */}
              <Box 
                w="100%" 
                h="100%"
                border="1px solid" 
                borderColor="black" 
                borderRadius="md" 
                overflow="hidden"
                bg="white"
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  '@media print': {
                    border: '1px solid black',
                    h: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                }}
              >
                {pageLayouts[2]?.images?.length > 0 ? (
                  <Box 
                    position="relative" 
                    w="100%" 
                    h="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      '@media print': {
                        w: '100%',
                        h: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Image 
                      src={pageLayouts[2].images[0].data} 
                      alt="Imagem 5"
                      objectFit="contain"
                      maxW="100%"
                      maxH="100%"
                      sx={{
                        '@media print': {
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Center h="100%">
                    <Text color="gray.500">Imagem 2</Text>
                  </Center>
                )}
              </Box>
              
              {/* Terceira imagem */}
              <Box 
                w="100%" 
                h="100%"
                border="1px solid" 
                borderColor="black" 
                borderRadius="md" 
                overflow="hidden"
                bg="white"
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  '@media print': {
                    border: '1px solid black',
                    h: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                }}
              >
                {pageLayouts[2]?.images?.length > 1 ? (
                  <Box 
                    position="relative" 
                    w="100%" 
                    h="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      '@media print': {
                        w: '100%',
                        h: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Image 
                      src={pageLayouts[2].images[1].data} 
                      alt="Imagem 6"
                      objectFit="contain"
                      maxW="100%"
                      maxH="100%"
                      sx={{
                        '@media print': {
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Center h="100%">
                    <Text color="gray.500">Imagem 3</Text>
                  </Center>
                )}
              </Box>
            </Grid>
          </Box>
        </A4Colheita>
      )}
      
      {/* Mensagem se não houver imagens - só mostra se não estiver em pré-visualização */}
      {pageLayouts.length === 0 && !shouldUsePreview && (
        <Center h="300px" mt={8} border="1px" borderStyle="dashed" borderColor="gray.300" borderRadius="md">
          <Text color="gray.500">Nenhuma imagem adicionada ao relatório</Text>
        </Center>
      )}
    </Box>
  );
} 