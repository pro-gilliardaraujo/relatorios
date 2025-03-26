'use client';

import { Box, Grid, GridItem, Heading, Text, Flex, Select, Input, Button } from '@chakra-ui/react';
import { FiEye } from 'react-icons/fi';
import ExcelUpload, { ExcelPreview } from '@/components/FileUpload/ExcelUpload';
import ReportImageInputs from '@/components/FileUpload/ReportImageInputs';
import { useState, useEffect } from 'react';
import { useReportStore } from '@/store/useReportStore';
import { useRouter } from 'next/navigation';

interface PreviewData {
  headers: string[];
  rows: string[][];
}

export default function ReportsPage() {
  const router = useRouter();
  const { 
    isReportGenerated, 
    setReportGenerated, 
    images, 
    setChartFonte,
    chartFontes,
    updateImageFonte 
  } = useReportStore();
  const [excelFonte, setExcelFonte] = useState<string>('');
  const [imagemFonte, setImagemFonte] = useState<string>('');

  // Configurando a data de ontem como padrão
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const defaultDate = yesterday.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [reportType, setReportType] = useState<string>('');
  const [selectedFrente, setSelectedFrente] = useState<string>('');
  const [isReportReady, setIsReportReady] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const isUploadEnabled = Boolean(reportType && selectedDate && selectedFrente);

  useEffect(() => {
    // Reseta o estado de geração do relatório quando qualquer dado muda
    setReportGenerated(false);
  }, [previewData, reportType, selectedDate, selectedFrente]);

  useEffect(() => {
    setIsReportReady(Boolean(
      previewData && 
      reportType && 
      selectedDate && 
      selectedFrente && 
      excelFonte && 
      imagemFonte
    ));
  }, [previewData, reportType, selectedDate, selectedFrente, excelFonte, imagemFonte]);

  const handleGenerateReport = () => {
    console.log('=== Iniciando geração do relatório ===');
    console.log('Tipo de relatório:', reportType);
    console.log('Data selecionada:', selectedDate);
    console.log('Frente:', selectedFrente);
    console.log('Fonte Excel:', excelFonte);
    console.log('Fonte Imagens:', imagemFonte);
    console.log('Total de imagens:', images.length);
    console.log('Containers com fonte:', chartFontes.length);
    
    setReportGenerated(true);
    console.log('Relatório marcado como gerado');
  };

  const handleViewReport = () => {
    // Navegar para a página de visualização quando implementada
    router.push('/relatorios/visualizacao/a4/plantio');
  };

  const handleExcelFonteChange = (newFonte: string) => {
    setExcelFonte(newFonte);
    console.log('Atualizando fonte dos gráficos para:', newFonte);
    // Atualizar todos os containers de gráficos com a nova fonte
    [
      'topOfensores',
      'horasPlantadeira',
      'motorOcioso',
      'motorOciosoOperacao',
      'disponibilidadeMecanica',
      'utilizacaoRTK',
      'mediaVelocidade',
      'grupoOperacao',
      'utilizacaoMotor'
    ].forEach(containerId => {
      setChartFonte(containerId, newFonte);
    });
  };

  const handleImagemFonteChange = (newFonte: string) => {
    setImagemFonte(newFonte);
    console.log('Atualizando fonte das imagens para:', newFonte);
    // Atualizar todas as imagens existentes com a nova fonte
    images.forEach(img => {
      updateImageFonte(img.containerId, newFonte);
    });
  };

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
                  sx={{
                    option: {
                      bg: 'white',
                      color: 'black'
                    }
                  }}
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
                  sx={{
                    option: {
                      bg: 'white',
                      color: 'black'
                    }
                  }}
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
            <Flex 
              gap={2} 
              direction={{ base: "column", sm: "row" }}
              w={{ base: "100%", md: "auto" }}
            >
              <Button
                colorScheme="gray"
                bg="black"
                color="white"
                size="md"
                w={{ base: "100%", md: "auto" }}
                onClick={handleGenerateReport}
                _hover={{ bg: 'gray.800' }}
              >
                Gerar Relatório
              </Button>
              <Button
                leftIcon={<FiEye />}
                colorScheme="blue"
                variant="outline"
                size="md"
                isDisabled={!isReportGenerated}
                onClick={handleViewReport}
                w={{ base: "100%", md: "auto" }}
                title={!isReportGenerated ? "Aguardando geração do relatório pelo servidor" : "Visualizar relatório gerado"}
                color="black"
                _hover={{ bg: 'gray.50' }}
              >
                Visualizar Relatório
              </Button>
            </Flex>
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
              h="220px"
              minH="220px"
              maxH="220px"
            >
              <Flex 
                p={2}
                borderBottom="1px" 
                borderColor="gray.300"
                justify="space-between"
                align="center"
                bg="white"
              >
                <Heading size="sm" color="gray.700" textAlign="center" flex={1}>
                  Dados do Excel
                </Heading>
                <Box w="200px">
                  <Select
                    size="xs"
                    placeholder="Indique a fonte"
                    value={excelFonte}
                    onChange={(e) => handleExcelFonteChange(e.target.value)}
                    bg="white"
                    color="black"
                    borderColor="gray.300"
                    _hover={{ borderColor: "gray.400" }}
                    sx={{
                      option: {
                        bg: 'white',
                        color: 'black'
                      }
                    }}
                  >
                    <option value="">Não Informar</option>
                    <option value="SGPA - Solinftec">SGPA - Solinftec</option>
                    <option value="Operations Center - John Deere">Operations Center - John Deere</option>
                  </Select>
                </Box>
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
                justify="space-between"
                align="center"
                bg="white"
              >
                <Heading size="sm" color="gray.700" textAlign="center" w="100%">
                  {`Imagens do Relatório${reportType ? ` - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}` : ''}${selectedFrente ? ` - ${selectedFrente.charAt(0).toUpperCase() + selectedFrente.slice(1)}` : ''}`}
                </Heading>
              </Flex>
              <Box p={2}>
                <ReportImageInputs 
                  reportType={reportType} 
                  frente={selectedFrente}
                  fonte={imagemFonte}
                />
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
} 