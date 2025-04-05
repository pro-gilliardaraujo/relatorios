'use client';

import { Box, Grid, GridItem, Heading, Text, Flex, Select, Input, Button, useToast, useDisclosure, Checkbox } from '@chakra-ui/react';
import { FiEye } from 'react-icons/fi';
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
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isTeste, setIsTeste] = useState(false);

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

  // Obter configurações apenas quando isConfigLoaded for true
  const tiposRelatorio = isConfigLoaded ? configManager.getTiposRelatorio() : [];
  const frentesDisponiveis = isConfigLoaded && reportType ? configManager.getFrentes(reportType) : [];
  const fontesExcel = isConfigLoaded ? configManager.getFontesExcel() : [];
  const fontesImagens = isConfigLoaded ? configManager.getFontesImagens() : [];

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

  // Função de manipulação do upload do Excel
  const handleExcelPreviewData = (previewData: PreviewData | null) => {
    console.log("📊 Excel Preview:", previewData);
    
    if (previewData) {
      setPreviewData(previewData);
      
      // Log detalhado dos dados organizados por planilha
      console.log("📋 DETALHES DOS DADOS EXCEL POR PLANILHA:");
      Object.keys(previewData.processedData).forEach(sheet => {
        const data = previewData.processedData[sheet];
        console.log(`📄 ${sheet}: ${data.length} registros`);
        if (data.length > 0) {
          console.log(`  Exemplo: ${JSON.stringify(data[0])}`);
          console.log(`  Colunas: ${Object.keys(data[0]).join(', ')}`);
        }
      });
    } else {
      setPreviewData(null);
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (!reportType || !selectedDate || !selectedFrente) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, selecione o tipo de relatório, data e frente.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setIsLoading(true);
      
      // Verificar dados do excel
      if (!previewData || !previewData.processedData || Object.keys(previewData.processedData).length === 0) {
        toast({
          title: "Sem dados do Excel",
          description: "Por favor, faça o upload de um arquivo Excel.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
      
      // Log detalhado dos dados do Excel para debug
      console.log("📊 DADOS DO EXCEL PARA ENVIO:", previewData.processedData);
      
      // Dados que serão enviados ao backend
      let dadosParaEnvio = {...previewData.processedData};
      
      // Verificar se o tipo de relatório é transbordo e fazer verificações específicas
      if (reportType === 'transbordo_diario' || reportType === 'transbordo_semanal') {
        console.log("🔍 Verificando dados para relatório de transbordo");
        
        // Obter planilhas e colunas esperadas da configuração
        const config = configManager.getTipoRelatorio(reportType);
        if (!config) {
          throw new Error(`Configuração não encontrada para ${reportType}`);
        }
        
        console.log("📋 Planilhas esperadas:", config.planilhas_excel);
        console.log("📋 Colunas esperadas:", config.colunas_excel);
        
        const planilhasEncontradas = Object.keys(previewData.processedData);
        console.log("📋 Planilhas encontradas:", planilhasEncontradas);
        
        // Checar se temos pelo menos algumas das planilhas necessárias
        const planilhasEsperadas = config.planilhas_excel.map(p => p.toLowerCase());
        const planilhasEncontradasLower = Object.keys(previewData.processedData).map(p => p.toLowerCase());
        
        console.log("📋 Planilhas esperadas:", planilhasEsperadas);
        console.log("📋 Planilhas encontradas:", planilhasEncontradasLower);
        
        // Verificar correspondências aproximadas
        const correspondencias = planilhasEncontradasLower.map(encontrada => {
          const match = planilhasEsperadas.find(esperada => 
            encontrada.includes(esperada.replace(/[0-9_]/g, '')) || 
            esperada.includes(encontrada.replace(/[0-9_]/g, ''))
          );
          return {
            encontrada,
            correspondeA: match
          };
        });
        
        console.log("📋 Correspondências encontradas:", correspondencias);
        
        const temPlanilhasValidas = correspondencias.some(c => c.correspondeA);
        
        if (!temPlanilhasValidas) {
          console.error("❌ Nenhuma planilha esperada encontrada no Excel");
          toast({
            title: "Formato de Excel inválido",
            description: `Planilhas esperadas: ${config.planilhas_excel.join(', ')}\nPlanilhas encontradas: ${Object.keys(previewData.processedData).join(', ')}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setIsLoading(false);
          return;
        }
        
        // Preparar estrutura de dados para o relatório
        const dadosProcessados: Record<string, any[]> = {};
        
        // Criar um mapeamento entre os nomes das planilhas e os tipos de dados
        const planilhaParaTipo = config.planilhas_excel.reduce((acc, planilha, index) => {
          const tipo = Object.keys(config.colunas_excel)[index];
          acc[planilha.toLowerCase()] = tipo;
          return acc;
        }, {} as Record<string, string>);

        console.log("📋 Mapeamento planilha -> tipo:", planilhaParaTipo);

        // Para cada planilha encontrada, tentar processar os dados
        for (const planilhaOriginal of Object.keys(previewData.processedData)) {
          const planilhaLower = planilhaOriginal.toLowerCase();
          
          // Encontrar o tipo correspondente usando correspondência aproximada
          const tipoCorrespondente = Object.entries(planilhaParaTipo).find(([nomePlanilha, tipo]) => {
            const planilhaSemNumeros = nomePlanilha.replace(/[0-9_]/g, '').trim();
            const encontradaSemNumeros = planilhaLower.replace(/[0-9_]/g, '').trim();
            return planilhaSemNumeros.includes(encontradaSemNumeros) || 
                   encontradaSemNumeros.includes(planilhaSemNumeros);
          });

          if (tipoCorrespondente) {
            const [nomePlanilha, tipo] = tipoCorrespondente;
            console.log(`✅ Planilha "${planilhaOriginal}" corresponde ao tipo "${tipo}"`);
            
            const dadosPlanilha = previewData.processedData[planilhaOriginal];
            if (dadosPlanilha && Array.isArray(dadosPlanilha) && dadosPlanilha.length > 0) {
              // Processar os dados conforme as colunas esperadas
              const colunasEsperadas = config.colunas_excel[tipo];
              
              dadosProcessados[tipo] = dadosPlanilha.map(item => {
                // Encontrar a coluna correta para cada campo esperado
                const processedItem: any = {};
                
                // Processar colunas conforme o tipo
                if (tipo === 'disponibilidade_mecanica') {
                  const frotaCol = Object.keys(item).find(k => k.toLowerCase().includes('frota'));
                  const dispCol = Object.keys(item).find(k => k.toLowerCase().includes('disponibilidade'));
                  
                  if (frotaCol && dispCol) {
                    const valorDisp = item[dispCol];
                    let disponibilidade: number;

                    // Trata diferentes formatos de número
                    if (typeof valorDisp === 'number') {
                      disponibilidade = valorDisp <= 1 ? valorDisp * 100 : valorDisp;
                    } else {
                      // Remove % e converte para número
                      disponibilidade = Number(String(valorDisp).replace('%', ''));
                    }

                    processedItem.frota = String(item[frotaCol]);
                    processedItem.disponibilidade = disponibilidade;
                    console.log(`Processando disponibilidade: Original=${valorDisp}, Convertido=${disponibilidade}`);
                  }
                } else {
                  // Para outros tipos (eficiencia, motor_ocioso, etc)
                  const operadorCol = Object.keys(item).find(k => k.toLowerCase().includes('operador'));
                  const valorCol = Object.keys(item).find(k => 
                    k.toLowerCase().includes('eficiência') ||
                    k.toLowerCase().includes('porcentagem') ||
                    k.toLowerCase().includes('percentual') ||
                    k.toLowerCase().includes('uso') ||
                    k.toLowerCase().includes('ociosa')
                  );
                  
                  if (operadorCol && valorCol) {
                    const operador = String(item[operadorCol]);
                    // Trata diferentes formatos de operador (com ou sem ID)
                    let id, nome;
                    if (operador.includes('-')) {
                      [id, nome] = operador.split('-').map(s => s.trim());
                    } else {
                      id = operador;
                      nome = operador;
                    }
                    
                    processedItem.id = id;
                    processedItem.nome = nome;

                    const valorOriginal = item[valorCol];
                    let valorProcessado: number;

                    // Trata diferentes formatos de número
                    if (typeof valorOriginal === 'number') {
                      valorProcessado = valorOriginal <= 1 ? valorOriginal * 100 : valorOriginal;
                    } else {
                      // Remove % e converte para número
                      valorProcessado = Number(String(valorOriginal).replace('%', ''));
                    }
                    
                    if (tipo === 'eficiencia_energetica') {
                      processedItem.eficiencia = valorProcessado;
                    } else if (tipo === 'uso_gps') {
                      processedItem.porcentagem = valorProcessado;
                    } else {
                      processedItem.percentual = valorProcessado;
                    }

                    console.log(`Processando ${tipo}: Original=${valorOriginal}, Convertido=${valorProcessado}`);
                  }
                }
                
                return processedItem;
              }).filter(item => Object.keys(item).length > 0);
              
              console.log(`✅ Processados ${dadosProcessados[tipo].length} registros para ${tipo}`);
            }
          }
        }

        // Verificar se temos dados suficientes
        const tiposEncontrados = Object.keys(dadosProcessados).filter(tipo => 
          dadosProcessados[tipo] && dadosProcessados[tipo].length > 0
        );

        console.log("📊 Tipos de dados encontrados:", tiposEncontrados);
        
        if (tiposEncontrados.length === 0) {
          console.error("❌ Nenhum dado processado encontrado");
          toast({
            title: "Dados insuficientes",
            description: `Não foi possível encontrar nenhum dos tipos de dados esperados: ${Object.keys(config.colunas_excel).join(', ')}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setIsLoading(false);
          return;
        }
        
        console.log("📊 DADOS PROCESSADOS FINAL:", dadosProcessados);
        
        // Usar os dados processados para o relatório
        dadosParaEnvio = dadosProcessados;
      }
      
      // Criar objeto do relatório para enviar ao backend
      const reportData = {
        tipo: reportType,
        data: selectedDate,
        frente: selectedFrente,
        dados: dadosParaEnvio,
        status: 'rascunho',
        created_at: new Date().toISOString(),
        is_teste: isTeste
      };
      
      console.log("📤 Enviando dados do relatório para o Supabase:", reportData);
      
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
      
      // Redirecionar para visualização
      let viewUrl = '';
      
      // Determinar URL com base no tipo de relatório
      if (reportType === 'colheita_diario') {
        viewUrl = `/relatorios/visualizacao/a4/colheita?id=${reportResult.id}`;
      } else if (reportType === 'colheita_semanal') {
        viewUrl = `/relatorios/visualizacao/a4/colheita-semanal?id=${reportResult.id}`;
      } else if (reportType === 'transbordo_diario') {
        viewUrl = `/relatorios/visualizacao/a4/transbordo?id=${reportResult.id}`;
      } else if (reportType === 'transbordo_semanal') {
        viewUrl = `/relatorios/visualizacao/a4/transbordo-semanal?id=${reportResult.id}`;
      }
      
      router.push(viewUrl);
      
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
                    setSelectedFrente(''); // Resetar frente ao mudar tipo
                  }}
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
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
                      <option key={tipo} value={tipo}>
                        {config?.nome || tipo}
                      </option>
                    );
                  })}
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
                  sx={{
                    '&::-webkit-calendar-picker-indicator': {
                      filter: 'invert(1)'
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
                <Select 
                  placeholder={isConfigLoaded ? "Selecione a Frente" : "Carregando..."}
                  size="md"
                  bg="white"
                  color="black"
                  value={selectedFrente}
                  onChange={(e) => setSelectedFrente(e.target.value)}
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  isDisabled={!reportType || !isConfigLoaded}
                  sx={{
                    option: {
                      bg: 'white',
                      color: 'black'
                    }
                  }}
                >
                  {frentesDisponiveis.map(frente => (
                    <option key={frente.id} value={frente.id}>
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
              >
                Teste
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
                    {fontesExcel.map(fonte => (
                      <option key={fonte.id} value={fonte.id}>
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
                <Heading size="sm" color="black" textAlign="center" w="100%">
                  {`${reportType ? `Relatório de ${configManager.getTipoRelatorio(reportType)?.nome} Diário` : 'Relatório'}${selectedFrente ? ` - ${frentesDisponiveis.find(f => f.id === selectedFrente)?.nome}` : ''}`}
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
    </Box>
  );
} 