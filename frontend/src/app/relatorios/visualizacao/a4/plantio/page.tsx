'use client';

import { Box, VStack, Heading, Image, Flex, Text, Grid, GridItem } from '@chakra-ui/react';
import A4Layout from '@/components/Layout/A4Layout';
import { useReportStore } from '@/store/useReportStore';
import { useEffect, useCallback } from 'react';
import { TopOffendersChart } from '@/components/Charts/TopOffendersChart';

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

export default function PlantioA4({ data }: PlantioA4Props) {
  const { images, chartFontes } = useReportStore();
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

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
    topOfensores: "180px",
    horasPlantadeira: "180px",
    motorOcioso: "180px",
    motorOciosoOperacao: "230px"
  };

  // Constantes para as alturas dos containers da página 2
  const PAGE_2_HEIGHTS = {
    disponibilidadeMecanica: "160px",
    utilizacaoRTK: "450px",
    mediaVelocidade: "450px",
    grupoOperacao: "185px"
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

  const PageHeader = () => (
    <Flex justify="space-between" align="center" mb={8}>
      <Image
        src={LOGO_URL}
        alt="Logo IB"
        h={LOGO_HEIGHT}
        objectFit="contain"
      />
      <VStack spacing={1}>
        <Heading size="md" color="black" fontWeight="bold" textAlign="center">
          Relatório de Plantio
        </Heading>
        <Text color="black" fontSize="sm">
          {currentDate}
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

  return (
    <>
      {/* Página 1 - Visão Geral */}
      <A4Layout>
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
              <TopOffendersChart 
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
            h={PAGE_1_HEIGHTS.motorOciosoOperacao}
            position="relative"
          >
            <RenderFonte type="excel" fonte={getChartFonte('motorOciosoOperacao')} />
          </Box>
        </Box>
      </A4Layout>

      {/* Página 2 - Métricas Operacionais */}
      <A4Layout>
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
              <RenderFonte type="excel" fonte={getChartFonte('disponibilidadeMecanica')} />
            </Box>
          </Box>

          <Grid templateColumns="repeat(2, 1fr)" gap={6} w="100%">
            <GridItem>
              <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
                Utilização RTK
              </Heading>
              <Box
                border="1px solid black"
                borderRadius="md"
                h={PAGE_2_HEIGHTS.utilizacaoRTK}
                position="relative"
              >
                <RenderFonte type="excel" fonte={getChartFonte('utilizacaoRTK')} />
              </Box>
            </GridItem>

            <GridItem>
              <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
                Média de Velocidade
              </Heading>
              <Box
                border="1px solid black"
                borderRadius="md"
                h={PAGE_2_HEIGHTS.mediaVelocidade}
                position="relative"
              >
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
              <RenderFonte type="excel" fonte={getChartFonte('grupoOperacao')} />
            </Box>
          </Box>
        </VStack>
      </A4Layout>

      {/* Página 3 - Análise de Operação */}
      <A4Layout>
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
      </A4Layout>

      {/* Página 4 - Análise de Consumo e Área */}
      <A4Layout>
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
      </A4Layout>
    </>
  );
} 