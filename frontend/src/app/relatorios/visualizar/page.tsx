'use client';

import { Box, Heading, Flex, IconButton, Tooltip } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import RelatorioViewer from '@/components/RelatorioViewer';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function VisualizarRelatorio() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get('id');
  const isPdfMode = searchParams.get('format') === 'pdf';

  const handleBack = () => {
    router.push('/relatorios');
  };

  return (
    <Box mx="auto" px={4} py={4} h="100vh" maxW="1200px" display="flex" flexDirection="column">
      <Flex align="center" mb={4}>
        <Tooltip label="Voltar" hasArrow>
          <IconButton
            icon={<FiArrowLeft />}
            aria-label="Voltar"
            mr={4}
            onClick={handleBack}
            variant="ghost"
          />
        </Tooltip>
        <Heading size="lg">Visualização do Relatório</Heading>
      </Flex>
      
      <Box flex="1" overflow="auto">
        {reportId ? (
          <RelatorioViewer reportId={reportId} isPdfMode={isPdfMode} />
        ) : (
          <Box p={8} textAlign="center">
            ID do relatório não fornecido
          </Box>
        )}
      </Box>
    </Box>
  );
} 