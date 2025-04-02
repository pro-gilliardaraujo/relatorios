'use client';

import { Box, VStack, Heading, Image, Flex, Text, Grid, GridItem } from '@chakra-ui/react';
import A4_Plantio from '@/components/Layout/A4_Plantio';
import { useReportStore } from '@/store/useReportStore';
import { useEffect, useCallback, useState } from 'react';
import { GraficoTopOfensores } from '@/components/Charts/GraficoTopOfensores';
import { GraficoHorasTrabalhadas } from '@/components/Charts/GraficoHorasTrabalhadas';
import { GraficoMotorOcioso } from '@/components/Charts/GraficoMotorOcioso';
import { GraficoMotorOciosoPorOperacao } from '@/components/Charts/GraficoMotorOciosoPorOperacao';
import { GraficoDisponibilidadeMecanica } from '@/components/Charts/GraficoDisponibilidadeMecanica';
import { GraficoUtilizacaoRTK } from '@/components/Charts/GraficoUtilizacaoRTK';
import { GraficoMediaVelocidade } from '@/components/Charts/GraficoMediaVelocidade';
import { GraficoGrupoOperacao } from '@/components/Charts/GraficoGrupoOperacao';
import { GraficoUtilizacaoMotor } from '@/components/Charts/GraficoUtilizacaoMotor';
import { useSearchParams } from 'next/navigation';
import { configManager } from '@/utils/config';
import { supabase } from '@/lib/supabase';

interface PlantioA4Props {
  data?: any;
}

// Dados de exemplo para o gráfico
const sampleData = [
  {
    name: 'AGUARD LIBERACAO ATIVIDADE',
    hours: 17,
    timeString: '17:00:00',
    percentage: 31.6
  },
  {
    name: 'AGUARDANDO MUDA',
    hours: 15.22,
    timeString: '15:13:20',
    percentage: 28.3
  },
  {
    name: 'SEM OPERADOR',
    hours: 9.36,
    timeString: '9:21:25',
    percentage: 17.4
  },
  {
    name: 'TROCA DE TURNO',
    hours: 7.81,
    timeString: '7:48:26',
    percentage: 14.5
  },
  {
    name: 'CALIBRACAO DE PLANTADEIRA',
    hours: 4.46,
    timeString: '4:27:33',
    percentage: 8.3
  }
];

// Dados de exemplo para o gráfico de Motor Ocioso Por Operação
const sampleDataMotorOciosoPorOperacao = [
  {
    name: 'ABASTECIMENTO DE CANAL PARA MUDAS',
    hours: 2.5,
    timeString: '02:30:00'
  },
  {
    name: 'FALTA DE OPORTUNIDADE',
    hours: 0.85,
    timeString: '00:51:00'
  },
  {
    name: 'ABASTECIMENTO DE INSUMOS',
    hours: 0.47,
    timeString: '00:47:00'
  },
  {
    name: 'MANUTENÇÃO MECÂNICA',
    hours: 1,
    timeString: '01:00:10'
  },
  {
    name: 'TROCA DE TURNO',
    hours: 0.22,
    timeString: '00:22:57'
  },
  {
    name: 'EMBUCHAMENTO',
    hours: 0.13,
    timeString: '00:13:24'
  },
  {
    name: 'MANUTENÇÃO BASE',
    hours: 0.10,
    timeString: '00:10:16'
  },
  {
    name: 'AGUARDANDO MUDA',
    hours: 0.09,
    timeString: '00:09:56'
  },
  {
    name: 'DESLOCAMENTO',
    hours: 0.08,
    timeString: '00:08:33'
  },
  {
    name: 'FIM DE ATIVIDADE',
    hours: 0.02,
    timeString: '00:02:23'
  },
  {
    name: 'NÃO DE REPORTOU',
    hours: 0.01,
    timeString: '00:01:00'
  },
  {
    name: 'OUTROS',
    hours: 0.003,
    timeString: '00:00:31'
  }
];

// Dados de exemplo para o gráfico de Grupo de Operação
const sampleDataGrupoOperacao = [
  {
    id: '6126',
    operations: [
      { name: 'Produtiva', value: 42.3 },
      { name: 'Improdutiva', value: 31.6 },
      { name: 'Manutenção', value: 14.8 },
      { name: 'Perdida', value: 11.3 }
    ]
  },
  {
    id: '6128',
    operations: [
      { name: 'Produtiva', value: 38.9 },
      { name: 'Improdutiva', value: 28.3 },
      { name: 'Manutenção', value: 17.4 },
      { name: 'Perdida', value: 15.4 }
    ]
  },
  {
    id: '6129',
    operations: [
      { name: 'Produtiva', value: 45.2 },
      { name: 'Improdutiva', value: 25.7 },
      { name: 'Manutenção', value: 19.8 },
      { name: 'Perdida', value: 9.3 }
    ]
  }
];

// Dados de exemplo para o gráfico de utilização do motor
const sampleDataUtilizacaoMotor = [
  {
    name: '6126',
    deslocParaDesc: 0.32,
    manobra: 0.38,
    deslocamento: 0.40,
    parada: 1.06,
    trabalhando: 1.40,
    tempoDeslocParaDesc: '00:19:45',
    tempoManobra: '00:38:45',
    tempoDeslocamento: '00:40:35',
    tempoParada: '01:06:29',
    tempoTrabalhando: '01:40:50',
  },
  {
    name: '6128',
    deslocParaDesc: 0.08,
    manobra: 0.30,
    deslocamento: 1.04,
    parada: 0.39,
    trabalhando: 1.26,
    tempoDeslocParaDesc: '00:05:18',
    tempoManobra: '00:30:25',
    tempoDeslocamento: '01:04:00',
    tempoParada: '00:39:57',
    tempoTrabalhando: '01:26:26',
  },
  {
    name: '6129',
    deslocParaDesc: 0.05,
    manobra: 0.38,
    deslocamento: 0.40,
    parada: 0.06,
    trabalhando: 1.40,
    tempoDeslocParaDesc: '00:05:18',
    tempoManobra: '00:38:45',
    tempoDeslocamento: '00:40:35',
    tempoParada: '00:06:33',
    tempoTrabalhando: '01:40:50',
  }
];

export default function PlantioA4({ data }: PlantioA4Props) {
  const { images, chartFontes } = useReportStore();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  // Carregar dados do relatório
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!reportId) return;

      const { data: report, error } = await supabase
        .from('relatorios_diarios')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!error && report) {
        setReportData(report);
      }
    };

    fetchReportData();
  }, [reportId]);

  // Tipos de fonte
  type FonteType = 'excel' | 'image';

  // Configurações de posicionamento do texto fonte
  const FONTE_POSITIONS = {
    overlayBottom: {
      position: "absolute" as const,
      bottom: "4px",
      right: "4px",
      margin: 0,
    }
  } as const;

  // Configuração do tamanho da fonte
  const FONTE_SIZE = "9px";

  // Configurações base do texto de fonte
  const BASE_FONTE_STYLE = {
    fontSize: FONTE_SIZE,
    bg: "white",
    px: 2,
    py: 1,
    zIndex: 2,
    minH: "18px",
    display: "flex",
    alignItems: "center",
    sx: {
      '@media print': {
        color: 'gray.600 !important',
        bg: 'white !important',
      }
    }
  };

  // Configurações específicas para fonte de Excel
  const EXCEL_FONTE_STYLE = {
    ...BASE_FONTE_STYLE,
    color: "orange.500",
  };

  // Configurações específicas para fonte de Imagem
  const IMAGE_FONTE_STYLE = {
    ...BASE_FONTE_STYLE,
    color: "blue.500",
  };

  // Função para renderizar o texto de fonte com posicionamento personalizado
  const RenderFonte = ({ 
    type,
    fonte 
  }: { 
    type: FonteType;
    fonte?: string;
  }) => {
    // Se não houver fonte ou a fonte for vazia, não renderiza nada
    if (!fonte || fonte === '') return null;

    const style = type === 'excel' ? EXCEL_FONTE_STYLE : IMAGE_FONTE_STYLE;
    
    return (
      <Text
        {...style}
        {...FONTE_POSITIONS.overlayBottom}
      >
        {`Fonte: ${fonte}`}
      </Text>
    );
  };

  useEffect(() => {
    console.log('=== Carregando template A4 ===');
    console.log('Total de imagens:', images.length);
    console.log('Total de fontes de gráficos:', chartFontes.length);
    console.log('IDs dos containers com imagens:', images.map(img => img.containerId).join(', '));
    console.log('IDs dos containers com fonte:', chartFontes.map(f => f.containerId).join(', '));
  }, [images.length, chartFontes.length]);

  const getImage = useCallback((containerId: string): string | undefined => {
    const image = images.find(img => img.containerId === containerId);
    if (image) {
      console.log(`Container ${containerId}: Imagem encontrada com fonte "${image.fonte}"`);
      return image.data;
    }
    console.log(`Container ${containerId}: Nenhuma imagem encontrada`);
    return undefined;
  }, [images]);

  const getChartFonte = useCallback((containerId: string): string | undefined => {
    const fonte = chartFontes.find(f => f.containerId === containerId);
    if (fonte) {
      console.log(`Container ${containerId}: Fonte definida como "${fonte.fonte}"`);
      return fonte.fonte;
    }
    console.log(`Container ${containerId}: Nenhuma fonte definida`);
    return undefined;
  }, [chartFontes]);

  // Constantes para as alturas dos containers da página 1
  const PAGE_1_HEIGHTS = {
    topOfensores: 180,
    horasPlantadeira: 180,
    motorOcioso: 180,
    motorOciosoOperacao: 230
  };

  // Constantes para as alturas dos containers da página 2
  const PAGE_2_HEIGHTS = {
    disponibilidadeMecanica: "160px",
    utilizacaoRTK: "350px",
    mediaVelocidade: "350px",
    grupoOperacao: "285px"
  };

  // Constantes para as alturas dos containers da página 3
  const PAGE_3_HEIGHTS = {
    utilizacaoMotor: "200px",
    areaPlantio: "180px",
    mapaVelocidade: "180px",
    mapaRPM: "180px"
  };

  // Constantes para as alturas dos containers da página 4
  const PAGE_4_HEIGHTS = {
    consumoCombustivel: "200px",
    temperaturaMotor: "200px",
    areaTotal: "395px"
  };

  const RenderImage = ({ containerId, alt }: { containerId: string; alt: string }) => {
    const imageData = getImage(containerId);
    const image = images.find(img => img.containerId === containerId);
    
    // Só renderiza se houver dados de imagem E fonte definida
    if (!imageData || !image?.fonte) return null;

    return (
      <Box position="relative" w="100%" h="100%">
        <RenderFonte type="image" fonte={image.fonte} />
        <Image
          src={imageData}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center'
          }}
        />
      </Box>
    );
  };

  const PageHeader = () => {
    // Encontrar o nome completo da frente no config
    const frenteConfig = configManager.getFrentes('plantio').find((f: { id: string }) => f.id === reportData?.frente);
    const nomeFrente = frenteConfig?.nome || reportData?.frente || 'Exemplo';

    return (
      <Flex justify="space-between" align="center" mb={8}>
        <Image
          src={LOGO_URL}
          alt="Logo IB"
          h={LOGO_HEIGHT}
          objectFit="contain"
        />
        <VStack spacing={1}>
          <Heading size="md" color="black" fontWeight="bold" textAlign="center">
            {`Relatório de Plantio Diário - ${nomeFrente}`}
          </Heading>
          <Text color="black" fontSize="sm">
            {reportData?.data ? new Date(reportData.data).toLocaleDateString('pt-BR') : currentDate}
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

  return (
    <>
      {/* Página 1 - Visão Geral */}
      <A4_Plantio>
        <PageHeader />
        <VStack spacing={4} mb={4}>
          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Top 5 Ofensores
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_1_HEIGHTS.topOfensores}
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={2}
            >
              <GraficoTopOfensores 
                data={sampleData} 
              />
              <RenderFonte type="excel" fonte={getChartFonte('topOfensores')} />
            </Box>
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Horas Trabalhadas Plantadeira
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_1_HEIGHTS.horasPlantadeira}
              position="relative"
            >
              <GraficoHorasTrabalhadas 
                data={[
                  {
                    name: '6126',
                    hours: 0.5,
                    timeString: '00:30:00',
                    operacao: 'PLANTIO DE MUDA',
                    grupo: 'TRABALHANDO'
                  },
                  {
                    name: '6128',
                    hours: 1.68,
                    timeString: '01:40:50',
                    operacao: 'PLANTIO DE MUDA',
                    grupo: 'TRABALHANDO'
                  },
                  {
                    name: '6129',
                    hours: 1.44,
                    timeString: '01:26:26',
                    operacao: 'PLANTIO DE MUDA',
                    grupo: 'TRABALHANDO'
                  }
                ]} 
              />
              <RenderFonte type="excel" fonte={getChartFonte('horasPlantadeira')} />
            </Box>
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Motor Ocioso
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_1_HEIGHTS.motorOcioso}
              position="relative"
            >
              <GraficoMotorOcioso 
                data={[
                  {
                    name: '6126',
                    horasParado: 0.5,
                    tempoParadoString: '00:30:00',
                    horasLigado: 1.2,
                    tempoLigadoString: '01:12:00',
                    porcentagemOcioso: 25.5
                  },
                  {
                    name: '6128',
                    horasParado: 0.8,
                    tempoParadoString: '00:48:00',
                    horasLigado: 1.68,
                    tempoLigadoString: '01:40:50',
                    porcentagemOcioso: 85.2
                  },
                  {
                    name: '6129',
                    horasParado: 0.6,
                    tempoParadoString: '00:36:00',
                    horasLigado: 1.44,
                    tempoLigadoString: '01:26:26',
                    porcentagemOcioso: 55.8
                  }
                ]} 
              />
              <RenderFonte type="excel" fonte={getChartFonte('motorOcioso')} />
            </Box>
          </Box>
        </VStack>

        <Box w="100%" mb={0}>
          <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
            Motor Ocioso Por Operação
          </Heading>
          <Box
            border="1px solid black"
            borderRadius="md"
            h={`${PAGE_1_HEIGHTS.motorOciosoOperacao}px`}
            position="relative"
          >
            <GraficoMotorOciosoPorOperacao 
              data={sampleDataMotorOciosoPorOperacao}
              options={{
                height: PAGE_1_HEIGHTS.motorOciosoOperacao
              }}
            />
            <RenderFonte type="excel" fonte={getChartFonte('motorOciosoOperacao')} />
          </Box>
        </Box>
      </A4_Plantio>

      {/* Página 2 - Métricas Operacionais */}
      <A4_Plantio>
        <PageHeader />
        <VStack spacing={6}>
          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Disponibilidade Mecânica
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_2_HEIGHTS.disponibilidadeMecanica}
              position="relative"
            >
              <GraficoDisponibilidadeMecanica 
                data={[
                  {
                    name: '6126',
                    percentage: 95.5
                  },
                  {
                    name: '6128',
                    percentage: 88.2
                  },
                  {
                    name: '6129',
                    percentage: 92.8
                  }
                ]}
                options={{
                  grid: {
                    showOnlyTarget: true
                  }
                }}
              />
              <RenderFonte type="excel" fonte={getChartFonte('disponibilidadeMecanica')} />
            </Box>
          </Box>

          <Grid templateColumns="35% 65%" gap={4} w="100%">
            <GridItem>
              <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
                Utilização RTK
              </Heading>
              <Box
                border="1px solid black"
                borderRadius="md"
                h={PAGE_2_HEIGHTS.utilizacaoRTK}
                position="relative"
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                pl={2}
              >
                <GraficoUtilizacaoRTK 
                  data={[
                    {
                      name: '6126',
                      percentage: 85
                    },
                    {
                      name: '6128',
                      percentage: 99
                    },
                    {
                      name: '6129',
                      percentage: 53
                    }
                  ]}
                />
                <RenderFonte type="excel" fonte={getChartFonte('utilizacaoRTK')} />
              </Box>
            </GridItem>

            <GridItem maxW="100%">
              <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
                Média de Velocidade
              </Heading>
              <Box
                border="1px solid black"
                borderRadius="md"
                h={PAGE_2_HEIGHTS.mediaVelocidade}
                position="relative"
                overflow="hidden"
                maxW="96.5%"
              >
                <GraficoMediaVelocidade 
                  data={[
                    {
                      name: '6126',
                      trabalhando: 5.29,
                      manobra: 1.74,
                      deslocamento: 3.91
                    },
                    {
                      name: '6129',
                      trabalhando: 3.90,
                      manobra: 1.91,
                      deslocamento: 8.44
                    },
                    {
                      name: '6128',
                      trabalhando: 4.37,
                      manobra: 1.67,
                      deslocamento: 3.81
                    }
                  ]}
                />
                <RenderFonte type="excel" fonte={getChartFonte('mediaVelocidade')} />
              </Box>
            </GridItem>
          </Grid>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Grupo de Operação
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_2_HEIGHTS.grupoOperacao}
              position="relative"
            >
              <GraficoGrupoOperacao 
                data={sampleDataGrupoOperacao}
              />
              <RenderFonte type="excel" fonte={getChartFonte('grupoOperacao')} />
            </Box>
          </Box>
        </VStack>
      </A4_Plantio>

      {/* Página 3 - Análise de Operação */}
      <A4_Plantio>
        <PageHeader />
        <VStack spacing={6}>
          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Utilização Motor Ligado
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_3_HEIGHTS.utilizacaoMotor}
              position="relative"
            >
              <GraficoUtilizacaoMotor data={sampleDataUtilizacaoMotor} />
              <RenderFonte type="excel" fonte={getChartFonte('utilizacaoMotor')} />
            </Box>
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Área de Plantio
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_3_HEIGHTS.areaPlantio}
              overflow="hidden"
              position="relative"
            >
              <RenderFonte type="image" fonte={getChartFonte('areaPlantio')} />
              <RenderImage containerId="areaPlantio" alt="Área de Plantio" />
            </Box>
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Mapa de Velocidade
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_3_HEIGHTS.mapaVelocidade}
              overflow="hidden"
              position="relative"
            >
              <RenderFonte type="image" fonte={getChartFonte('mapaVelocidade')} />
              <RenderImage containerId="mapaVelocidade" alt="Mapa de Velocidade" />
            </Box>
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Mapa de RPM
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_3_HEIGHTS.mapaRPM}
              overflow="hidden"
              position="relative"
            >
              <RenderFonte type="image" fonte={getChartFonte('mapaRPM')} />
              <RenderImage containerId="mapaRPM" alt="Mapa de RPM" />
            </Box>
          </Box>
        </VStack>
      </A4_Plantio>

      {/* Página 4 - Análise de Consumo e Área */}
      <A4_Plantio>
        <PageHeader />
        <VStack spacing={6}>
          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Consumo de Combustível
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_4_HEIGHTS.consumoCombustivel}
              overflow="hidden"
              position="relative"
            >
              <RenderFonte type="image" fonte={getChartFonte('consumoCombustivel')} />
              <RenderImage containerId="consumoCombustivel" alt="Consumo de Combustível" />
            </Box>
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Mapa Por Temperatura Motor
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_4_HEIGHTS.temperaturaMotor}
              overflow="hidden"
              position="relative"
            >
              <RenderFonte type="image" fonte={getChartFonte('temperaturaMotor')} />
              <RenderImage containerId="mapaTemperaturaMotor" alt="Mapa por Temperatura Motor" />
            </Box>
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Mapa Por Área Total
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_4_HEIGHTS.areaTotal}
              overflow="hidden"
              position="relative"
            >
              <RenderFonte type="image" fonte={getChartFonte('areaTotal')} />
              <RenderImage containerId="mapaAreaTotal" alt="Mapa por Área Total" />
            </Box>
          </Box>
        </VStack>
      </A4_Plantio>
    </>
  );
} 