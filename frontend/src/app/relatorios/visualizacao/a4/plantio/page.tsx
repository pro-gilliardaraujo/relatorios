'use client';

import { Box, VStack, Heading, Image, Flex, Text, Grid, GridItem } from '@chakra-ui/react';
import A4Layout from '@/components/Layout/A4Layout';

interface PlantioA4Props {
  data?: any; // Tipagem a ser definida com base nos dados do backend
}

export default function PlantioA4({ data }: PlantioA4Props) {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  // Constantes para as alturas dos containers da página 1
  const PAGE_1_HEIGHTS = {
    topOfensores: "180px",         // ~23.4% do espaço útil
    horasPlantadeira: "180px",     // ~23.4% do espaço útil
    motorOcioso: "180px",          // ~23.4% do espaço útil
    motorOciosoOperacao: "230px"   // ~29.8% do espaço útil
  };

  // Constantes para as alturas dos containers da página 2
  const PAGE_2_HEIGHTS = {
    disponibilidadeMecanica: "160px",    // ~20% do espaço útil
    utilizacaoRTK: "450px",              // ~35% do espaço útil
    mediaVelocidade: "450px",            // ~35% do espaço útil
    grupoOperacao: "185px"               // ~20% do espaço útil
  };

  // Constantes para as alturas dos containers da página 3
  const PAGE_3_HEIGHTS = {
    utilizacaoMotor: "200px",    // ~25% do espaço útil
    areaPlantio: "180px",        // ~25% do espaço útil
    mapaVelocidade: "180px",     // ~25% do espaço útil
    mapaRPM: "180px"            // ~25% do espaço útil
  };

  // Constantes para as alturas dos containers da página 4
  const PAGE_4_HEIGHTS = {
    consumoCombustivel: "200px",    // ~25% do espaço útil
    temperaturaMotor: "200px",      // ~25% do espaço útil
    areaTotal: "395px"             // ~50% do espaço útil
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
              TOP 5 Ofensores
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_1_HEIGHTS.topOfensores}
            />
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Horas Trabalhadas Plantadeira
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_1_HEIGHTS.horasPlantadeira}
            />
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Motor Ocioso
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_1_HEIGHTS.motorOcioso}
            />
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
          />
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
            />
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
              />
            </GridItem>

            <GridItem>
              <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
                Média de Velocidade
              </Heading>
              <Box
                border="1px solid black"
                borderRadius="md"
                h={PAGE_2_HEIGHTS.mediaVelocidade}
              />
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
            />
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
            />
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Área de Plantio
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_3_HEIGHTS.areaPlantio}
            />
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Mapa de Velocidade
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_3_HEIGHTS.mapaVelocidade}
            />
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Mapa de RPM
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_3_HEIGHTS.mapaRPM}
            />
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
            />
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Mapa Por Temperatura Motor
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_4_HEIGHTS.temperaturaMotor}
            />
          </Box>

          <Box w="100%">
            <Heading as="h2" size="sm" color="black" fontWeight="bold" mb={2} textAlign="center">
              Mapa Por Área Total
            </Heading>
            <Box
              border="1px solid black"
              borderRadius="md"
              h={PAGE_4_HEIGHTS.areaTotal}
            />
          </Box>
        </VStack>
      </A4Layout>
    </>
  );
} 