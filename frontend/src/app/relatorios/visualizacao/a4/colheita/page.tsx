'use client';

import React from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';
import { GraficoDisponibilidadeMecanicaColheita } from '@/components/Charts/Colheita/Diario/GraficoDisponibilidadeMecanicaColheita';
import { GraficoEficienciaEnergetica } from '@/components/Charts/Colheita/Diario/GraficoEficienciaEnergetica';
import { GraficoHorasElevador } from '@/components/Charts/Colheita/Diario/GraficoHorasElevador';
import { GraficoMotorOciosoColheita } from '@/components/Charts/Colheita/Diario/GraficoMotorOciosoColheita';
import { GraficoUsoGPS } from '@/components/Charts/Colheita/Diario/GraficoUsoGPS';
import { RelatorioColheitaResumo } from '@/components/RelatorioColheitaResumo';

interface ColheitaA4Props {
  data?: any;
}

export default function ColheitaA4({ data }: ColheitaA4Props) {
  const { images } = useReportStore();
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  // Dados de exemplo para disponibilidade mecânica
  const dataDisponibilidade = [
    { frota: '7041', disponibilidade: 94.49 },
    { frota: '7042', disponibilidade: 92.82 }
  ];

  // Dados de exemplo para eficiência energética
  const dataEficiencia = [
    { id: '1', nome: 'SEM OPERADOR', eficiencia: 39 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', eficiencia: 59 },
    { id: '9999', nome: 'TROCA DE TURNO', eficiencia: 53 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', eficiencia: 60 },
    { id: '11', nome: 'NAO CADASTRADO', eficiencia: 62 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', eficiencia: 38 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', eficiencia: 38 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', eficiencia: 55 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', eficiencia: 31 }
  ];

  // Dados de exemplo para horas de elevador
  const dataHorasElevador = [
    { id: '1', nome: 'SEM OPERADOR', horas: 2.42 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', horas: 7.42 },
    { id: '9999', nome: 'TROCA DE TURNO', horas: 7.59 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', horas: 6.33 },
    { id: '11', nome: 'NAO CADASTRADO', horas: 6.26 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', horas: 4.54 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', horas: 4.62 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', horas: 5.10 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', horas: 0.42 }
  ];

  // Dados de exemplo para motor ocioso
  const dataMotorOcioso = [
    { id: '1', nome: 'SEM OPERADOR', percentual: 28.1 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', percentual: 25.1 },
    { id: '9999', nome: 'TROCA DE TURNO', percentual: 29.9 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', percentual: 22.0 },
    { id: '11', nome: 'NAO CADASTRADO', percentual: 19.4 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', percentual: 40.1 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', percentual: 31.5 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', percentual: 32.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', percentual: 36.8 }
  ];

  // Dados de exemplo para uso GPS
  const dataUsoGPS = [
    { id: '1', nome: 'SEM OPERADOR', porcentagem: 0.0 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', porcentagem: 0.0 },
    { id: '9999', nome: 'TROCA DE TURNO', porcentagem: 0.0 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', porcentagem: 0.0 },
    { id: '11', nome: 'NAO CADASTRADO', porcentagem: 0.0 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', porcentagem: 2.3 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', porcentagem: 1.7 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', porcentagem: 0.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', porcentagem: 0.0 }
  ];

  // Calcular médias para os cards de resumo
  const mediaDisponibilidade = dataDisponibilidade.reduce((acc, item) => acc + item.disponibilidade, 0) / dataDisponibilidade.length;
  const mediaEficiencia = dataEficiencia.reduce((acc, item) => acc + item.eficiencia, 0) / dataEficiencia.length;
  const mediaMotorOcioso = dataMotorOcioso.reduce((acc, item) => acc + item.percentual, 0) / dataMotorOcioso.length;
  const mediaHorasElevador = dataHorasElevador.reduce((acc, item) => acc + item.horas, 0) / dataHorasElevador.length;
  const totalHorasElevador = dataHorasElevador.reduce((acc, item) => acc + item.horas, 0);

  // Componente para o cabeçalho da página
  const PageHeader = () => (
    <Flex justify="space-between" align="center" mb={4}>
      <Image
        src={LOGO_URL}
        alt="Logo IB"
        h={LOGO_HEIGHT}
        objectFit="contain"
      />
      <VStack spacing={1}>
        <Heading size="md" color="black" fontWeight="bold" textAlign="center">
          Relatório de Colheita - Diário
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

  // Dados para o resumo geral
  const resumoData = {
    disponibilidadeMecanica: {
      meta: 90,
      media: dataDisponibilidade.reduce((acc, item) => acc + item.disponibilidade, 0) / dataDisponibilidade.length,
      acimaMeta: {
        quantidade: dataDisponibilidade.filter(item => item.disponibilidade >= 90).length,
        total: dataDisponibilidade.length,
        percentual: Math.round((dataDisponibilidade.filter(item => item.disponibilidade >= 90).length / dataDisponibilidade.length) * 100)
      }
    },
    eficienciaEnergetica: {
      meta: 70,
      media: dataEficiencia.reduce((acc, item) => acc + item.eficiencia, 0) / dataEficiencia.length,
      acimaMeta: {
        quantidade: dataEficiencia.filter(item => item.eficiencia >= 70).length,
        total: dataEficiencia.length,
        percentual: Math.round((dataEficiencia.filter(item => item.eficiencia >= 70).length / dataEficiencia.length) * 100)
      }
    },
    motorOcioso: {
      meta: 10,
      media: dataMotorOcioso.reduce((acc, item) => acc + item.percentual, 0) / dataMotorOcioso.length,
      acimaMeta: {
        quantidade: dataMotorOcioso.filter(item => item.percentual <= 10).length,
        total: dataMotorOcioso.length,
        percentual: Math.round((dataMotorOcioso.filter(item => item.percentual <= 10).length / dataMotorOcioso.length) * 100)
      }
    },
    horasElevador: {
      meta: 5,
      total: dataHorasElevador.reduce((acc, item) => acc + item.horas, 0),
      media: dataHorasElevador.reduce((acc, item) => acc + item.horas, 0) / dataHorasElevador.length,
      acimaMeta: {
        quantidade: dataHorasElevador.filter(item => item.horas >= 5).length,
        total: dataHorasElevador.length,
        percentual: Math.round((dataHorasElevador.filter(item => item.horas >= 5).length / dataHorasElevador.length) * 100)
      }
    },
    usoGPS: {
      meta: 90,
      media: dataUsoGPS.reduce((acc, item) => acc + item.porcentagem, 0) / dataUsoGPS.length,
      acimaMeta: {
        quantidade: dataUsoGPS.filter(item => item.porcentagem >= 90).length,
        total: dataUsoGPS.length,
        percentual: Math.round((dataUsoGPS.filter(item => item.porcentagem >= 90).length / dataUsoGPS.length) * 100)
      }
    }
  };

  return (
    <>
      {/* Página 1 - Disponibilidade, Eficiência e Motor Ocioso */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column">
          <PageHeader />
          
          <Flex flex="1" direction="column" justify="space-between">
            {/* Disponibilidade Mecânica - Ocupa 20% do espaço restante */}
            <Box h="20%" mb={3}>
              <SectionTitle title="Disponibilidade Mecânica" centered={true} />
              <Box 
                border="1px solid"
                borderColor="black"
                borderRadius="md"
                p={3}
                h="calc(100% - 25px)"
              >
                <GraficoDisponibilidadeMecanicaColheita data={dataDisponibilidade} meta={90} />
              </Box>
            </Box>
            
            {/* Eficiência Energética - Ocupa 50% do espaço restante */}
            <Box h="50%" mb={3}>
              <SectionTitle title="Eficiência Energética" centered={true} />
              <Box 
                border="1px solid"
                borderColor="black"
                borderRadius="md"
                p={2}
                h="calc(100% - 25px)"
                maxH="100%"
                overflowY="auto"
              >
                <GraficoEficienciaEnergetica data={dataEficiencia} meta={70} />
              </Box>
            </Box>
            
            {/* Motor Ocioso - Ocupa 50% do espaço restante */}
            <Box h="50%">
              <SectionTitle title="Motor Ocioso" centered={true} />
              <Box 
                border="1px solid"
                borderColor="black"
                borderRadius="md"
                p={3}
                h="calc(100% - 25px)"
                maxH="100%"
                overflowY="auto"
              >
                <GraficoMotorOciosoColheita data={dataMotorOcioso} meta={10} />
              </Box>
            </Box>
          </Flex>
        </Box>
      </A4Colheita>
      
      {/* Página 2 - Horas Elevador e Uso GPS */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column">
          <PageHeader />
          
          <Flex flex="1" direction="column" justify="space-between">
            {/* Horas Elevador - Ocupa 50% do espaço restante */}
            <Box h="50%" mb={3}>
              <SectionTitle title="Horas Elevador" centered={true} />
              <Box 
                border="1px solid"
                borderColor="black"
                borderRadius="md"
                p={2}
                h="calc(100% - 25px)"
                maxH="100%"
                overflowY="auto"
              >
                <GraficoHorasElevador data={dataHorasElevador} />
              </Box>
            </Box>
            
            {/* Uso GPS - Ocupa 50% do espaço restante */}
            <Box h="50%">
              <SectionTitle title="Uso GPS" centered={true} />
              <Box 
                border="1px solid"
                borderColor="black"
                borderRadius="md"
                p={2}
                h="calc(100% - 25px)"
                maxH="100%"
                overflowY="auto"
              >
                <GraficoUsoGPS data={dataUsoGPS} meta={90} />
              </Box>
            </Box>
          </Flex>
        </Box>
      </A4Colheita>

      {/* Página 3 - Resumo Geral */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column">
          <PageHeader />
          
          <Box flex="1" p={2} overflowY="auto">
            <RelatorioColheitaResumo data={{
              ...resumoData,
              operadores: dataEficiencia.map(item => {
                const motorOciosoItem = dataMotorOcioso.find(motor => motor.id === item.id);
                const horasElevadorItem = dataHorasElevador.find(horas => horas.id === item.id);
                const usoGPSItem = dataUsoGPS.find(gps => gps.id === item.id);
                
                return {
                  id: item.id,
                  nome: item.nome,
                  eficiencia: item.eficiencia,
                  motorOcioso: motorOciosoItem?.percentual || 0,
                  horasElevador: horasElevadorItem?.horas || 0,
                  usoGPS: usoGPSItem?.porcentagem || 0
                };
              })
            }} />
          </Box>
        </Box>
      </A4Colheita>
    </>
  );
} 