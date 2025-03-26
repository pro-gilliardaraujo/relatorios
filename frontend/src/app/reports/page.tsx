'use client';

import { Box, Grid, GridItem, Heading, Text, Flex, Select, Input, Button } from '@chakra-ui/react';
import { FiEye } from 'react-icons/fi';
import ExcelUpload, { ExcelPreview } from '@/components/FileUpload/ExcelUpload';
import ReportImageInputs from '@/components/FileUpload/ReportImageInputs';
import { useState, useEffect } from 'react';

interface PreviewData {
  headers: string[];
  rows: string[][];
}

export default function ReportsPage() {
  // Configurando a data de ontem como padrão
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const defaultDate = yesterday.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [reportType, setReportType] = useState<string>('');
  const [selectedFrente, setSelectedFrente] = useState<string>('');
  const [isReportReady, setIsReportReady] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  const isUploadEnabled = Boolean(reportType && selectedDate && selectedFrente);

  useEffect(() => {
    // Reseta o estado de geração do relatório quando qualquer dado muda
    setIsReportGenerated(false);
  }, [previewData, reportType, selectedDate, selectedFrente]);

  useEffect(() => {
    setIsReportReady(Boolean(previewData && reportType && selectedDate && selectedFrente));
  }, [previewData, reportType, selectedDate, selectedFrente]);

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar */}
      <Box
        w="250px"
        bg="blue.500"
        display={{ base: 'none', lg: 'block' }}
      >
        <Text color="white" p={4} fontSize="sm">Menu</Text>
      </Box>

      {/* Conteúdo Principal */}
      <Box flex="1">
        {/* Header */}
        <Box px={6} py={4} borderBottom="1px" borderColor="gray.200" bg="white">
          <Flex 
            justify="space-between" 
            align="center"
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Flex 
              gap={4} 
              direction={{ base: "column", sm: "row" }}
              w={{ base: "100%", md: "auto" }}
            >
              <Box w={{ base: "100%", sm: "200px" }}>
                <Select 
                  placeholder="Tipo de Relatório"
                  size="md"
                  bg="white"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="plantio">Plantio</option>
                  <option value="colheita">Colheita</option>
                  <option value="cav">CAV</option>
                </Select>
              </Box>
              <Box w={{ base: "100%", sm: "200px" }}>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  size="md"
                  bg="white"
                />
              </Box>
              <Box w={{ base: "100%", sm: "200px" }}>
                <Select 
                  placeholder="Selecione a Frente"
                  size="md"
                  bg="white"
                  value={selectedFrente}
                  onChange={(e) => setSelectedFrente(e.target.value)}
                >
                  <option value="frente1">Frente 1</option>
                  <option value="frente2">Frente 2</option>
                  <option value="frente3">Frente 3</option>
                </Select>
              </Box>
              <Box w={{ base: "100%", sm: "auto" }}>
                <ExcelUpload 
                  onPreviewData={setPreviewData} 
                  isEnabled={isUploadEnabled}
                />
              </Box>
            </Flex>
            <Button
              leftIcon={<FiEye />}
              colorScheme="blue"
              size="md"
              isDisabled={!isReportGenerated}
              onClick={() => {/* Implementar visualização */}}
              w={{ base: "100%", md: "auto" }}
              title={!isReportGenerated ? "Aguardando geração do relatório pelo servidor" : "Visualizar relatório gerado"}
            >
              Visualizar Relatório
            </Button>
          </Flex>
        </Box>

        {/* Área de Conteúdo */}
        <Box p={2} h="calc(100vh - 82px)" overflow="auto">
          <Flex direction="column" gap={4} h="100%">
            {/* Seção Superior - Upload Excel */}
            <Box
              bg="white"
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor="gray.100"
              h="250px"
              minH="250px"
              maxH="250px"
            >
              <Flex 
                p={2}
                borderBottom="1px" 
                borderColor="gray.100"
                justify="space-between"
                align="center"
                direction={{ base: "column", sm: "row" }}
                gap={2}
              >
                <Box flex="1" textAlign="center">
                  <Heading size="sm" color="gray.700">
                    Dados do Excel
                  </Heading>
                </Box>
              </Flex>
              <Box p={2} h="calc(100% - 45px)" overflow="hidden">
                <ExcelPreview preview={previewData} />
              </Box>
            </Box>

            {/* Seção Inferior - Imagens */}
            <Box
              bg="white"
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor="gray.100"
              flex="1"
              minH="400px"
              overflow="auto"
            >
              <Flex 
                p={3}
                borderBottom="1px" 
                borderColor="gray.100"
                justify="center"
                align="center"
              >
                <Heading size="sm" color="gray.700">
                  {`Imagens do Relatório${reportType ? ` - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}` : ''}${selectedFrente ? ` - ${selectedFrente.charAt(0).toUpperCase() + selectedFrente.slice(1)}` : ''}`}
                </Heading>
              </Flex>
              <Box p={2} h="calc(100% - 45px)" overflow="auto">
                <ReportImageInputs 
                  reportType={reportType} 
                  frente={selectedFrente}
                />
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
} 