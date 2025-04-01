'use client';

import { Box, Grid, GridItem, Heading, Text, Flex, Select, Input, Button, useToast, useDisclosure } from '@chakra-ui/react';
import { FiEye } from 'react-icons/fi';
import ExcelUpload, { ExcelPreview } from '@/components/FileUpload/ExcelUpload';
import ReportImageInputs from '@/components/FileUpload/ReportImageInputs';
import { useState, useEffect, useCallback } from 'react';
import { useReportStore } from '@/store/useReportStore';
import { useRouter } from 'next/navigation';

interface PreviewData {
  headers: string[];
  rows: string[][];
  processedData: { [key: string]: any[] };
  previewRows: number;
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
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [reportType, setReportType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedFrente, setSelectedFrente] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Configurando a data de ontem como padrão
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const defaultDate = yesterday.toISOString().split('T')[0];

  const [isReportReady, setIsReportReady] = useState(false);

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

  const handleGenerateReport = async () => {
    // Verificar se os campos obrigatórios estão preenchidos
    if (!reportType || !selectedDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione o tipo de relatório e a data",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (reportType.includes('colheita') && !selectedFrente) {
      toast({
        title: "Campo obrigatório",
        description: "Selecione a frente para relatório de colheita",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    // Verificar se há dados suficientes para o tipo de relatório selecionado
    if (reportType.includes('colheita') && (!previewData || !previewData.processedData)) {
      toast({
        title: "Dados insuficientes",
        description: "Faça o upload da planilha com os dados de colheita",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    // Mostrar toast de processamento
    toast({
      title: "Processando",
      description: "Salvando dados do relatório...",
      status: "info",
      duration: 3000,
    });

    setIsLoading(true);
    console.log("Iniciando salvamento de dados de relatório...");

    try {
      // Estruturar os dados processados de acordo com o tipo de relatório
      let processedData = {};

      if (reportType.includes('colheita')) {
        // Estruturar dados para relatório de colheita
        processedData = {
          disponibilidade_mecanica: previewData?.processedData['1_Disponibilidade Mecânica'] || [],
          eficiencia_energetica: previewData?.processedData['2_Eficiência Energética'] || [],
          hora_elevador: previewData?.processedData['3_Hora Elevador'] || [],
          motor_ocioso: previewData?.processedData['4_Motor Ocioso'] || [],
          uso_gps: previewData?.processedData['5_Uso GPS'] || []
        };
      } else if (reportType.includes('plantio')) {
        // Estruturar dados para relatório de plantio
        processedData = {
          // Adicionar estrutura específica para plantio quando necessário
        };
      } else if (reportType.includes('cav')) {
        // Estruturar dados para relatório de CAV
        processedData = {
          // Adicionar estrutura específica para CAV quando necessário
        };
      }

      // Enviar dados para a API
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: reportType,
          data: selectedDate,
          frente: selectedFrente,
          dados: processedData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Dados salvos com sucesso no Supabase:", result);
        setReportGenerated(true);

        // Mostrar toast de sucesso
        toast({
          title: "Sucesso!",
          description: "O relatório está sendo aberto em nova guia",
          status: "success",
          duration: 5000,
        });

        // Construir o caminho do relatório
        let reportPath = '';
        if (reportType.includes('plantio')) {
          reportPath = `/relatorios/visualizacao/a4/plantio?id=${result.id}`;
        } else if (reportType.includes('colheita')) {
          reportPath = `/relatorios/visualizacao/a4/colheita?id=${result.id}`;
        } else if (reportType.includes('cav')) {
          reportPath = `/relatorios/visualizacao/a4/cav?id=${result.id}`;
        }

        // Abrir o relatório em uma nova guia
        if (reportPath) {
          window.open(reportPath, '_blank');
        }
      } else {
        console.error("❌ Erro ao salvar dados:", result);
        toast({
          title: "Erro",
          description: result.error || "Erro ao processar relatório",
          status: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("❌ Erro ao processar relatório:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o relatório",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
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
                isDisabled={!reportType}
                onClick={handleViewReport}
                w={{ base: "100%", md: "auto" }}
                title={!reportType ? "Selecione um tipo de relatório" : "Visualizar relatório"}
                color="black"
                borderColor="black"
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