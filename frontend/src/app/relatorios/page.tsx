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
        bg="#2B79C2"
        display={{ base: 'none', lg: 'block' }}
      >
        <Text color="white" p={2} fontSize="sm">Menu</Text>
      </Box>

      {/* Conteúdo Principal */}
      <Box flex="1" bg="white">
        {/* Header */}
        <Box p={2} borderBottom="1px" borderColor="gray.300" bg="white">
          <Flex 
            justify="space-between" 
            align="center"
            direction={{ base: "column", md: "row" }}
            gap={2}
          >
            <Flex 
              gap={2} 
              direction={{ base: "column", sm: "row" }}
              w={{ base: "100%", md: "auto" }}
            >
              <Box w={{ base: "100%", sm: "200px" }}>
                <Select 
                  placeholder="Tipo de Relatório"
                  size="md"
                  bg="white"
                  color="black"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                >
                  <option style={{ color: 'black' }} value="plantio">Plantio</option>
                  <option style={{ color: 'black' }} value="colheita">Colheita</option>
                  <option style={{ color: 'black' }} value="cav">CAV</option>
                </Select>
              </Box>
              <Box w={{ base: "100%", sm: "200px" }}>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  size="md"
                  bg="white"
                  color="black"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                />
              </Box>
              <Box w={{ base: "100%", sm: "200px" }}>
                <Select 
                  placeholder="Selecione a Frente"
                  size="md"
                  bg="white"
                  color="black"
                  value={selectedFrente}
                  onChange={(e) => setSelectedFrente(e.target.value)}
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                >
                  <option style={{ color: 'black' }} value="frente1">Frente 1</option>
                  <option style={{ color: 'black' }} value="frente2">Frente 2</option>
                  <option style={{ color: 'black' }} value="frente3">Frente 3</option>
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
              variant="outline"
              size="md"
              isDisabled={!isReportGenerated}
              onClick={() => {/* Implementar visualização */}}
              w={{ base: "100%", md: "auto" }}
              title={!isReportGenerated ? "Aguardando geração do relatório pelo servidor" : "Visualizar relatório gerado"}
              color="black"
              _hover={{ bg: 'gray.50' }}
            >
              Visualizar Relatório
            </Button>
          </Flex>
        </Box>

        {/* Área de Conteúdo */}
        <Box p={2} h="calc(100vh - 65px)" overflow="auto" bg="white">
          <Flex direction="column" gap={2} h="100%">
            {/* Seção Superior - Upload Excel */}
            <Box
              bg="white"
              borderRadius="md"
              border="1px"
              borderColor="gray.300"
              h="250px"
              minH="250px"
              maxH="250px"
            >
              <Flex 
                p={2}
                borderBottom="1px" 
                borderColor="gray.300"
                justify="center"
                align="center"
                bg="white"
              >
                <Heading size="sm" color="gray.700">
                  Dados do Excel
                </Heading>
              </Flex>
              <Box p={2} h="calc(100% - 37px)" overflow="hidden">
                <ExcelPreview preview={previewData} />
              </Box>
            </Box>

            {/* Seção Inferior - Imagens */}
            <Box
              bg="white"
              borderRadius="md"
              border="1px"
              borderColor="gray.300"
              flex="1"
              overflow="auto"
            >
              <Flex 
                p={2}
                borderBottom="1px" 
                borderColor="gray.300"
                justify="center"
                align="center"
                bg="white"
              >
                <Heading size="sm" color="gray.700">
                  {`Imagens do Relatório${reportType ? ` - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}` : ''}${selectedFrente ? ` - ${selectedFrente.charAt(0).toUpperCase() + selectedFrente.slice(1)}` : ''}`}
                </Heading>
              </Flex>
              <Box p={2}>
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