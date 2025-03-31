'use client';

import { Box, VStack, Heading, Image, Flex, Text } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';

interface ColheitaSemanalA4Props {
  data?: any;
}

export default function ColheitaSemanalA4({ data }: ColheitaSemanalA4Props) {
  const { images } = useReportStore();
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  // Função para obter o intervalo da semana passada
  const getWeekDateRange = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 é domingo, 1 é segunda, etc.
    
    // Data de fim (será o dia atual)
    const endDate = new Date(today);
    
    // Data de início (7 dias antes do fim)
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    
    // Formatar as datas no padrão brasileiro
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR');
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Componente para o cabeçalho da página
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
          Relatório de Colheita - Semanal
        </Heading>
        <Text color="black" fontSize="sm">
          {getWeekDateRange()}
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

  // Função para criar múltiplas páginas
  const renderPages = (numPages = 1) => {
    const pages = [];
    
    for (let i = 0; i < numPages; i++) {
      pages.push(
        <A4Colheita key={i}>
          <PageHeader />
          {/* Aqui você pode adicionar o conteúdo específico para cada página */}
          <Box 
            textAlign="center" 
            mt={10} 
            fontSize="md" 
            color="gray.500"
          >
            Página {i + 1} - Conteúdo a ser definido
          </Box>
        </A4Colheita>
      );
    }
    
    return pages;
  };

  return (
    <>
      {/* Renderiza uma página inicialmente, mas pode ser expandido conforme necessário */}
      {renderPages(1)}
    </>
  );
} 