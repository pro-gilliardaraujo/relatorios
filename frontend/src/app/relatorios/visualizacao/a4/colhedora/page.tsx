'use client';

import { Box, VStack, Heading, Image, Flex, Text } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';

interface ColheitaA4Props {
  data?: any;
}

export default function ColheitaA4({ data }: ColheitaA4Props) {
  const { images } = useReportStore();
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  // Componente para o cabeçalho da página
  const PageHeader = () => (
    <Box mb={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Image 
          src={LOGO_URL} 
          alt="IB Logo" 
          height={LOGO_HEIGHT}
          objectFit="contain"
        />
        <Text fontSize="sm" color="gray.600">Data: {currentDate}</Text>
      </Flex>
      <Heading as="h1" size="lg" textAlign="center">
        Relatório de Colheita
      </Heading>
      <Text fontSize="md" textAlign="center" color="gray.600" mt={1}>
        Visão Geral de Operações de Colheita
      </Text>
    </Box>
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