'use client';

import { Box, Grid, GridItem, Heading, Text, Flex, Select, Input, Button, useToast, useDisclosure, Checkbox, CheckboxGroup } from '@chakra-ui/react';
import { FiEye, FiRefreshCw, FiLayers } from 'react-icons/fi';
import ExcelUpload, { ExcelPreview } from '@/components/FileUpload/ExcelUpload';
import ReportImageInputs from '@/components/FileUpload/ReportImageInputs';
import { useState, useEffect, useCallback } from 'react';
import { useReportStore } from '@/store/useReportStore';
import { useRouter } from 'next/navigation';
import { configManager } from '@/utils/config';
import { supabase } from '@/lib/supabase';

interface PreviewData {
  headers: string[];
  rows: string[][];
  processedData: { [key: string]: any[] };
  previewRows: number;
  rawFile?: File;
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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedFrente, setSelectedFrente] = useState<string>('');
  const [selectedFrentes, setSelectedFrentes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);
  const [isTeste, setIsTeste] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Carregar configurações
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        // Garantir que as configurações sejam carregadas
        if (!configManager.isLoaded()) {
          await configManager.reloadConfig();
        }
        setIsConfigLoaded(true);
        console.log('Configurações carregadas com sucesso');
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Usando configurações padrão",
          status: "warning",
          duration: 3000,
        });
        setIsConfigLoaded(true); // Continuar mesmo com erro
      }
    };
    
    loadConfigs();
  }, []);

  // Verificar se é um relatório semanal
  const isWeeklyReport = reportType ? reportType.includes('semanal') : false;
  
  // Verificar se é o tipo de relatório comparativo
  const isComparativoRelatorio = reportType === 'comparativo_unidades_diario';
  
  // Verificar se o upload de Excel está habilitado para este tipo de relatório
  const showExcelUpload = reportType ? 
    configManager.getTipoRelatorio(reportType)?.componentes?.mostrarExcelUpload !== false : 
    true;
  
  // Obter configurações apenas quando isConfigLoaded for true
  const tiposRelatorio = isConfigLoaded ? configManager.getTiposRelatorio() : [];
  const frentesDisponiveis = isConfigLoaded && reportType ? configManager.getFrentes(reportType) : [];
  const fontesExcel = isConfigLoaded ? configManager.getFontesExcel() : [];
  const fontesImagens = isConfigLoaded ? configManager.getFontesImagens() : [];

  // Verificar se a seleção de frentes usa checkboxes
  const useFrentesCheckbox = reportType ? 
    configManager.getTipoRelatorio(reportType)?.componentes?.usarFrentesCheckbox === true : 
    false;

  // Função para lidar com a seleção de múltiplas frentes usando checkboxes
  const handleFrentesCheckboxChange = (frenteId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedFrentes(prev => [...prev, frenteId]);
    } else {
      setSelectedFrentes(prev => prev.filter(id => id !== frenteId));
    }
  };

  // Função para forçar o recarregamento das configurações
  const handleReloadConfig = async () => {
    try {
      await configManager.reloadConfig();
      setIsConfigLoaded(true);
      toast({
        title: "Configurações recarregadas",
        description: "As configurações foram atualizadas com sucesso.",
        status: "success",
        duration: 3000,
      });
      // Forçar a atualização da página para aplicar as novas configurações
      window.location.reload();
    } catch (error) {
      console.error('Erro ao recarregar configurações:', error);
      toast({
        title: "Erro ao recarregar configurações",
        description: "Não foi possível atualizar as configurações.",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Configurando a data de ontem como padrão
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const defaultDate = yesterday.toISOString().split('T')[0];

  const [isReportReady, setIsReportReady] = useState(false);

  // Atualizar a variável isUploadEnabled para considerar relatórios semanais
  const isUploadEnabled = Boolean(
    reportType && 
    (isWeeklyReport ? (startDate && endDate) : selectedDate) && 
    (useFrentesCheckbox ? selectedFrentes.length > 0 : selectedFrente)
  );

  useEffect(() => {
    // Reseta o estado de geração do relatório quando qualquer dado muda
    setReportGenerated(false);
  }, [previewData, reportType, selectedDate, startDate, endDate, selectedFrente]);

  useEffect(() => {
    setIsReportReady(Boolean(
      (!showExcelUpload || previewData) && 
      reportType && 
      (isWeeklyReport ? (startDate && endDate) : selectedDate) && 
      (useFrentesCheckbox ? selectedFrentes.length > 0 : selectedFrente) && 
      (showExcelUpload ? excelFonte : true) && 
      imagemFonte
    ));
  }, [previewData, reportType, selectedDate, startDate, endDate, selectedFrente, selectedFrentes, excelFonte, imagemFonte, useFrentesCheckbox, showExcelUpload, isWeeklyReport]);

  // Função de manipulação do upload do Excel
  const handleExcelPreviewData = (data: PreviewData | null) => {
    console.log("📊 Excel Preview:", data);
    
    if (data) {
      setPreviewData(data);
      
      // Log detalhado dos dados organizados por planilha
      console.log("📋 DETALHES DOS DADOS EXCEL POR PLANILHA:");
      Object.keys(data.processedData).forEach(sheet => {
        const sheetData = data.processedData[sheet];
        console.log(`📄 ${sheet}: ${sheetData.length} registros`);
        if (sheetData.length > 0) {
          console.log(`  Exemplo: ${JSON.stringify(sheetData[0])}`);
          console.log(`  Colunas: ${Object.keys(sheetData[0]).join(', ')}`);
        }
      });
    } else {
      setPreviewData(null);
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (!reportType || 
         (isWeeklyReport ? (!startDate || !endDate) : !selectedDate) || 
         (!useFrentesCheckbox && !selectedFrente) || 
         (useFrentesCheckbox && selectedFrentes.length === 0)) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, selecione o tipo de relatório, data(s) e frente(s).",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Validar que a data de início é anterior à data de fim
      if (isWeeklyReport && startDate > endDate) {
        toast({
          title: "Datas inválidas",
          description: "A data de início deve ser anterior ou igual à data de fim.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setIsLoading(true);
      
      // Verificar dados do excel (apenas se o tipo de relatório requer Excel)
      if (showExcelUpload && !previewData) {
        toast({
          title: "Sem arquivo Excel",
          description: "Por favor, faça o upload de um arquivo Excel.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
      
      // Obter o arquivo para enviar ao backend (apenas se o tipo de relatório requer Excel)
      const rawFile = showExcelUpload ? (previewData as any)?.rawFile : null;
      if (showExcelUpload && !rawFile) {
        toast({
          title: "Arquivo inválido",
          description: "O arquivo Excel não foi carregado corretamente. Por favor, tente novamente.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
      
      // Log para debug
      console.log("📊 Gerando relatório", reportType);
      
      // Criar FormData para envio do arquivo
      const formData = new FormData();
      if (showExcelUpload && rawFile) {
        formData.append('file', rawFile);
      }
      formData.append('report_type', reportType);
      
      // Adicionar as datas apropriadas dependendo do tipo de relatório
      if (isWeeklyReport) {
        formData.append('start_date', startDate);
        formData.append('end_date', endDate);
      } else {
        formData.append('report_date', selectedDate);
      }
      
      // Adicionar frente(s) selecionada(s) dependendo do tipo de seleção
      if (useFrentesCheckbox) {
        // Para relatórios comparativos, enviar múltiplas frentes
        selectedFrentes.forEach((frenteId, index) => {
          formData.append(`frente_${index}`, frenteId);
        });
        formData.append('frentes_count', selectedFrentes.length.toString());
      } else {
        // Para relatórios regulares, enviar uma única frente
        formData.append('frente', selectedFrente);
      }
      
      formData.append('is_teste', isTeste.toString());
      
      // Enviar para o backend (via API route do Next.js)
      const response = await fetch(`/api/reports/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao processar o arquivo no backend');
      }
      
      const result = await response.json();
      
      if (!result || !result.data) {
        throw new Error('Resposta inválida do backend');
      }
      
      console.log("✅ Dados processados pelo backend:", result);
      
      // Criar objeto do relatório para salvar no Supabase
      const reportData = {
        tipo: reportType,
        ...(isWeeklyReport 
          ? { 
              data_inicio: startDate,
              data_fim: endDate 
            } 
          : { 
              data: selectedDate 
            }
        ),
        frente: useFrentesCheckbox ? selectedFrentes.join(',') : selectedFrente,
        dados: result.data,
        status: 'concluido',
        created_at: new Date().toISOString(),
        is_teste: isTeste
      };
      
      console.log("📤 Salvando relatório processado no Supabase");
      
      let { data: reportResult, error } = reportType.includes('semanal') 
        ? await supabase.from('relatorios_semanais').insert([reportData]).select().single()
        : await supabase.from('relatorios_diarios').insert([reportData]).select().single();
      
      if (error) {
        console.error("❌ Erro ao criar relatório:", error);
        toast({
          title: "Erro ao gerar relatório",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
      
      console.log("✅ Relatório criado com sucesso:", reportResult);
      
      toast({
        title: "Relatório gerado com sucesso",
        description: `Relatório de ID ${reportResult.id} criado.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Determinar URL com base no tipo de relatório
      let viewUrl = '';
      
      // Processar dados especializados com base no tipo de relatório
      let requiredSheets: string[] = [];
      let showFrentesChecks = false;
      
      if (reportType === 'colheita_diario') {
        // Requisitos especiais para relatório de colheita diário
        requiredSheets = ['disponibilidade_mecanica', 'eficiencia_energetica', 'motor_ocioso', 'hora_elevador', 'uso_gps'];
      } else if (reportType === 'colheita_semanal') {
        // Requisitos especiais para relatório de colheita semanal
        requiredSheets = ['disponibilidade_mecanica', 'eficiencia_energetica', 'motor_ocioso', 'hora_elevador', 'uso_gps', 'tdh', 'diesel', 'impureza_vegetal'];
      } else if (reportType === 'transbordo_diario') {
        // Requisitos especiais para relatório de transbordo diário
        requiredSheets = ['disponibilidade_mecanica', 'eficiencia_energetica', 'motor_ocioso', 'falta_apontamento', 'uso_gps'];
      } else if (reportType === 'transbordo_semanal') {
        // Requisitos especiais para relatório de transbordo semanal - usar as mesmas planilhas do transbordo diário
        requiredSheets = ['disponibilidade_mecanica', 'eficiencia_energetica', 'motor_ocioso', 'falta_apontamento', 'uso_gps'];
      } else if (reportType === 'comparativo_unidades_diario') {
        // Requisitos para relatório comparativo entre unidades
        showFrentesChecks = true;
        requiredSheets = ['disponibilidade_mecanica', 'eficiencia_energetica'];
      }
      
      // Determinar URL com base no tipo de relatório
      if (reportType === 'colheita_diario') {
        viewUrl = `/relatorios/visualizacao/a4/colheita?id=${reportResult.id}`;
      } else if (reportType === 'colheita_semanal') {
        viewUrl = `/relatorios/visualizacao/a4/colheita-semanal?id=${reportResult.id}`;
      } else if (reportType === 'transbordo_diario') {
        viewUrl = `/relatorios/visualizacao/a4/transbordo?id=${reportResult.id}`;
      } else if (reportType === 'transbordo_semanal') {
        viewUrl = `/relatorios/visualizacao/a4/transbordo-semanal?id=${reportResult.id}`;
      } else if (reportType === 'drones_diario' || reportType === 'drones_semanal') {
        viewUrl = `/relatorios/visualizacao/a4/drones?id=${reportResult.id}`;
      } else if (reportType === 'comparativo_unidades_diario') {
        viewUrl = `/relatorios/visualizacao/a4/comparativo-unidades?id=${reportResult.id}`;
      }
      
      // Abrir em nova aba em vez de redirecionar
      window.open(viewUrl, '_blank');
      
      setIsLoading(false);
      setReportGenerated(true);
    } catch (error) {
      console.error("❌ Erro ao gerar relatório:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const handleViewReport = () => {
    router.push('/relatorios/lista');
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
    <Box h="100vh" overflow="hidden">
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
                  placeholder={isConfigLoaded ? "Tipo de Relatório" : "Carregando..."}
                  size="md"
                  bg="white"
                  color="black"
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value);
                    setSelectedFrente('');
                  }}
                  borderColor="black"
                  _hover={{ borderColor: "black" }}
                  _focus={{ borderColor: "black", boxShadow: "none" }}
                  isDisabled={!isConfigLoaded}
                  sx={{
                    option: {
                      bg: 'white',
                      color: 'black'
                    }
                  }}
                >
                  {tiposRelatorio.map(tipo => {
                    const config = configManager.getTipoRelatorio(tipo);
                    return (
                      <option key={tipo} value={tipo} style={{ backgroundColor: "white", color: "black" }}>
                        {config?.nome || tipo}
                      </option>
                    );
                  })}
                </Select>
              </Box>
              <Button
                size="md"
                variant="outline"
                onClick={handleReloadConfig}
                borderColor="black"
                color="black"
                title="Recarregar configurações"
                leftIcon={<FiRefreshCw />}
                _hover={{ bg: 'gray.100' }}
              >
                Recarregar
              </Button>
              {/* SELETOR DE DATA */}
              {isWeeklyReport ? (
                <Flex direction={{ base: "column", sm: "row" }} gap={2}>
                  <Box w={{ base: "100%", sm: "auto" }}>
                    <Text fontWeight="bold" color="black" mb={1}>Período Semanal</Text>
                  </Box>
                  <Box w={{ base: "100%", sm: "200px" }}>
                    <Text mb={1} fontWeight="bold" color="black">Data Início</Text>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      size="md"
                      bg="white"
                      color="black"
                      borderColor="black"
                      _hover={{ borderColor: "black" }}
                      _focus={{ borderColor: "black", boxShadow: "none" }}
                      sx={{
                        '&::-webkit-calendar-picker-indicator': {
                          filter: 'invert(0) brightness(0) contrast(100%)',
                          opacity: '1',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '2px',
                          borderColor: 'black',
                          _hover: {
                            backgroundColor: 'gray.100'
                          }
                        },
                        '&': {
                          color: 'black !important'
                        },
                        '&::placeholder': {
                          color: 'black'
                        },
                        '&:focus': {
                          color: 'black !important'
                        }
                      }}
                    />
                  </Box>
                  <Box w={{ base: "100%", sm: "200px" }}>
                    <Text mb={1} fontWeight="bold" color="black">Data Fim</Text>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      size="md"
                      bg="white"
                      color="black"
                      borderColor="black"
                      _hover={{ borderColor: "black" }}
                      _focus={{ borderColor: "black", boxShadow: "none" }}
                      sx={{
                        '&::-webkit-calendar-picker-indicator': {
                          filter: 'invert(0) brightness(0) contrast(100%)',
                          opacity: '1',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '2px',
                          borderColor: 'black',
                          _hover: {
                            backgroundColor: 'gray.100'
                          }
                        },
                        '&': {
                          color: 'black !important'
                        },
                        '&::placeholder': {
                          color: 'black'
                        },
                        '&:focus': {
                          color: 'black !important'
                        }
                      }}
                    />
                  </Box>
                </Flex>
              ) : (
                <Box w={{ base: "100%", sm: "200px" }}>
                  <Text mb={1} fontWeight="bold" color="black">Data do Relatório</Text>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    size="md"
                    bg="white"
                    color="black"
                    borderColor="black"
                    _hover={{ borderColor: "black" }}
                    _focus={{ borderColor: "black", boxShadow: "none" }}
                    sx={{
                      '&::-webkit-calendar-picker-indicator': {
                        filter: 'invert(0) brightness(0) contrast(100%)',
                        opacity: '1',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '2px',
                        borderColor: 'black',
                        _hover: {
                          backgroundColor: 'gray.100'
                        }
                      },
                      '&': {
                        color: 'black !important'
                      },
                      '&::placeholder': {
                        color: 'black'
                      },
                      '&:focus': {
                        color: 'black !important'
                      }
                    }}
                  />
                </Box>
              )}
              <Box w={{ base: "100%", sm: "200px" }}>
                <Select 
                  placeholder={isConfigLoaded ? "Selecione a Frente" : "Carregando..."}
                  size="md"
                  bg="white"
                  color="black"
                  value={selectedFrente}
                  onChange={(e) => setSelectedFrente(e.target.value)}
                  borderColor="black"
                  _hover={{ borderColor: "black" }}
                  _focus={{ borderColor: "black", boxShadow: "none" }}
                  isDisabled={!reportType || !isConfigLoaded}
                  sx={{
                    option: {
                      bg: 'white',
                      color: 'black'
                    }
                  }}
                >
                  {frentesDisponiveis.map(frente => (
                    <option key={frente.id} value={frente.id} style={{ backgroundColor: "white", color: "black" }}>
                      {frente.nome}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box w={{ base: "100%", sm: "auto" }}>
                <ExcelUpload 
                  onPreviewData={handleExcelPreviewData} 
                  isEnabled={isUploadEnabled && isConfigLoaded}
                  selectedReportType={reportType}
                />
              </Box>
            </Flex>
            <Flex 
              gap={2} 
              direction={{ base: "column", sm: "row" }}
              w={{ base: "100%", md: "auto" }}
              align="center"
            >
              <Checkbox
                isChecked={isTeste}
                onChange={(e) => setIsTeste(e.target.checked)}
                colorScheme="gray"
                borderColor="black"
                iconColor="black"
                _hover={{ borderColor: "black" }}
              >
                <Text color="black" fontWeight="medium">Teste</Text>
              </Checkbox>
              <Button
                bg="black"
                color="white"
                size="md"
                onClick={handleGenerateReport}
                w={{ base: "100%", md: "auto" }}
                _hover={{ bg: 'gray.800' }}
              >
                Gerar Relatório
              </Button>
              <Button
                leftIcon={<FiEye />}
                variant="outline"
                size="md"
                onClick={handleViewReport}
                w={{ base: "100%", md: "auto" }}
                color="black"
                borderColor="black"
                bg="white"
                _hover={{ bg: 'gray.50' }}
              >
                Visualizar Relatórios
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* Área de Conteúdo */}
        <Box p={2} h="calc(100vh - 65px)" overflow="auto" bg="white">
          <Flex direction="column" gap={2} h="100%">
            {/* Seção Superior - Upload Excel */}
            {showExcelUpload && (
              <Box
                bg="white"
                borderRadius="md"
                border="1px"
                borderColor="black"
                h="220px"
                minH="220px"
                maxH="220px"
              >
                <Flex 
                  p={2}
                  borderBottom="1px" 
                  borderColor="black"
                  justify="space-between"
                  align="center"
                  bg="white"
                >
                  <Heading size="sm" color="black" textAlign="center" flex={1}>
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
                      borderColor="black"
                      _hover={{ borderColor: "black" }}
                      _focus={{ borderColor: "black", boxShadow: "none" }}
                      sx={{
                        option: {
                          bg: 'white',
                          color: 'black'
                        }
                      }}
                    >
                      <option value="" style={{ backgroundColor: "white", color: "black" }}>Não Informar</option>
                      {fontesExcel.map(fonte => (
                        <option key={fonte.id} value={fonte.id} style={{ backgroundColor: "white", color: "black" }}>
                          {fonte.nome}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </Flex>
                <Box p={2} h="calc(100% - 37px)" overflow="hidden">
                  <ExcelPreview preview={previewData} />
                </Box>
              </Box>
            )}

            {/* Seção Inferior - Imagens */}
            <Box
              bg="white"
              borderRadius="md"
              border="1px"
              borderColor="black"
              flex="1"
              overflow="auto"
            >
              <Flex 
                p={2}
                borderBottom="1px" 
                borderColor="black"
                justify="space-between"
                align="center"
                bg="white"
              >
                <Heading size="sm" color="black" textAlign="center" w="100%">
                  {`${reportType ? `Relatório de ${configManager.getTipoRelatorio(reportType)?.nome}` : 'Relatório'}${
                    useFrentesCheckbox 
                      ? ` - ${selectedFrentes.length} Unidades Selecionadas` 
                      : selectedFrente 
                        ? ` - ${frentesDisponiveis.find(f => f.id === selectedFrente)?.nome}` 
                        : ''
                  }${
                    isWeeklyReport && startDate && endDate
                      ? ` - ${startDate.split('-').reverse().join('/')} a ${endDate.split('-').reverse().join('/')}`
                      : selectedDate
                        ? ` - ${selectedDate.split('-').reverse().join('/')}`
                        : ''
                  }`}
                </Heading>
              </Flex>
              <Box p={2}>
                <ReportImageInputs 
                  reportType={reportType} 
                  frente={useFrentesCheckbox ? selectedFrentes.join(',') : selectedFrente}
                  fonte={imagemFonte}
                />
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
} 