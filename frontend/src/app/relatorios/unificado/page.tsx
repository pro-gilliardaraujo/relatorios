'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  Flex, 
  Button, 
  useToast, 
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  CheckboxGroup,
  Progress,
  Card,
  CardBody,
  Badge
} from '@chakra-ui/react';
import { FiUpload, FiList, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { configManager } from '@/utils/config';
import { useRouter } from 'next/navigation';

export default function RelatoriosUnificadosPage() {
  const router = useRouter();
  const toast = useToast();
  
  // Estados de arquivos
  const [colhedoraFile, setColhedoraFile] = useState<File | null>(null);
  const [transbordoFile, setTransbordoFile] = useState<File | null>(null);
  
  // Estados de seleção
  const [selectedFrentes, setSelectedFrentes] = useState<string[]>([]);
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  
  // Estados de processamento
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processedReports, setProcessedReports] = useState<string[]>([]);
  
  // Estados de configuração
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [frentesDisponiveis, setFrentesDisponiveis] = useState<any[]>([]);
  const [tiposRelatorioDisponiveis, setTiposRelatorioDisponiveis] = useState<any[]>([]);

  // Carregar configurações ao iniciar
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        if (!configManager.isLoaded()) {
          await configManager.reloadConfig();
        }
        setIsConfigLoaded(true);
        
        // Obter todas as frentes disponíveis (independente do tipo de relatório)
        const allFrentes = configManager.getAllFrentes();
        setFrentesDisponiveis(allFrentes);
        
        // Obter tipos de relatório suportados para processamento TXT
        // Por enquanto, vamos considerar apenas relatórios diários
        const allReportTypes = configManager.getTiposRelatorio();
        const supportedTypes = allReportTypes.filter(type => 
          type.id.includes('diario') && 
          (type.id.includes('colheita') || type.id.includes('transbordo'))
        );
        setTiposRelatorioDisponiveis(supportedTypes);
        
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as configurações necessárias.",
          status: "error",
          duration: 5000,
        });
      }
    };
    
    loadConfigs();
  }, []);

  // Manipuladores de arquivos
  const handleColhedoraFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.txt')) {
        setColhedoraFile(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo TXT para as colhedoras.",
          status: "error",
          duration: 3000,
        });
      }
    }
  };

  const handleTransbordoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.txt')) {
        setTransbordoFile(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo TXT para os transbordos.",
          status: "error",
          duration: 3000,
        });
      }
    }
  };

  // Manipuladores de seleção
  const handleFrenteChange = (frenteId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedFrentes(prev => [...prev, frenteId]);
    } else {
      setSelectedFrentes(prev => prev.filter(id => id !== frenteId));
    }
  };

  const handleReportTypeChange = (reportTypeId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedReportTypes(prev => [...prev, reportTypeId]);
    } else {
      setSelectedReportTypes(prev => prev.filter(id => id !== reportTypeId));
    }
  };

  // Função para processar os relatórios
  const handleProcessReports = async () => {
    // Verificar se temos pelo menos um arquivo, uma frente e um tipo de relatório
    if ((!colhedoraFile && !transbordoFile) || selectedFrentes.length === 0 || selectedReportTypes.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione pelo menos um arquivo, uma frente e um tipo de relatório.",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);
    setProcessProgress(0);
    setProcessedReports([]);

    try {
      // Calcular total de relatórios que serão gerados
      const totalReports = selectedFrentes.length * selectedReportTypes.length;
      let completedReports = 0;

      // Para cada combinação de frente e tipo de relatório
      for (const frente of selectedFrentes) {
        for (const reportType of selectedReportTypes) {
          // Determinar qual arquivo usar com base no tipo de relatório
          const useColhedora = reportType.includes('colheita');
          const useTransbordo = reportType.includes('transbordo');
          
          if ((useColhedora && !colhedoraFile) || (useTransbordo && !transbordoFile)) {
            // Pular se não temos o arquivo necessário para este tipo
            completedReports++;
            setProcessProgress(Math.round((completedReports / totalReports) * 100));
            continue;
          }
          
          // Construir nome do relatório que será gerado
          const reportName = `Relatório ${reportType.includes('colheita') ? 'Colheita' : 'Transbordo'} ${
            reportType.includes('diario') ? 'Diário' : ''} Frente ${frente}`;
          
          // Criar FormData para o upload
          const formData = new FormData();
          formData.append('report_type', reportType);
          formData.append('frente', frente);
          
          // Anexar o arquivo apropriado
          if (useColhedora && colhedoraFile) {
            formData.append('file', colhedoraFile);
          } else if (useTransbordo && transbordoFile) {
            formData.append('file', transbordoFile);
          }
          
          // Enviar para processamento
          // Aqui você chamaria seu endpoint de API, por enquanto simulamos:
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Adicionar à lista de relatórios processados
          setProcessedReports(prev => [...prev, reportName]);
          
          // Atualizar progresso
          completedReports++;
          setProcessProgress(Math.round((completedReports / totalReports) * 100));
        }
      }
      
      toast({
        title: "Processamento concluído",
        description: `${completedReports} relatórios foram gerados com sucesso!`,
        status: "success",
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Erro ao processar relatórios:', error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar os relatórios. Por favor, tente novamente.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box p={5}>
      <Heading mb={6}>Geração Unificada de Relatórios</Heading>
      <Text mb={4}>
        Faça upload dos arquivos TXT de colhedoras e transbordos para gerar múltiplos relatórios de uma só vez.
      </Text>
      
      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* Seção de Upload de Arquivos */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Card variant="outline" mb={4}>
            <CardBody>
              <Heading size="md" mb={4}>1. Upload de Arquivos TXT</Heading>
              
              <FormControl mb={4}>
                <FormLabel>Arquivo TXT de Colhedoras</FormLabel>
                <Input
                  type="file"
                  accept=".txt"
                  onChange={handleColhedoraFileChange}
                  p={1}
                  disabled={isProcessing}
                />
                {colhedoraFile && (
                  <Text fontSize="sm" mt={1} color="green.500">
                    <FiCheckCircle style={{ display: 'inline', marginRight: '5px' }} /> 
                    {colhedoraFile.name} ({(colhedoraFile.size / 1024).toFixed(2)} KB)
                  </Text>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel>Arquivo TXT de Transbordos</FormLabel>
                <Input
                  type="file"
                  accept=".txt"
                  onChange={handleTransbordoFileChange}
                  p={1}
                  disabled={isProcessing}
                />
                {transbordoFile && (
                  <Text fontSize="sm" mt={1} color="green.500">
                    <FiCheckCircle style={{ display: 'inline', marginRight: '5px' }} /> 
                    {transbordoFile.name} ({(transbordoFile.size / 1024).toFixed(2)} KB)
                  </Text>
                )}
              </FormControl>
            </CardBody>
          </Card>
          
          {/* Seção de Seleção de Relatórios */}
          <Card variant="outline" mb={4}>
            <CardBody>
              <Heading size="md" mb={4}>2. Selecione os Tipos de Relatórios</Heading>
              
              {isConfigLoaded ? (
                <VStack align="start" spacing={2}>
                  {tiposRelatorioDisponiveis.map(tipo => (
                    <Checkbox 
                      key={tipo.id}
                      isChecked={selectedReportTypes.includes(tipo.id)}
                      onChange={(e) => handleReportTypeChange(tipo.id, e.target.checked)}
                      disabled={isProcessing}
                    >
                      {tipo.nome}
                    </Checkbox>
                  ))}
                </VStack>
              ) : (
                <Text>Carregando tipos de relatório...</Text>
              )}
            </CardBody>
          </Card>
        </GridItem>
        
        {/* Seção de Seleção de Frentes */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Card variant="outline" mb={4}>
            <CardBody>
              <Heading size="md" mb={4}>3. Selecione as Frentes</Heading>
              
              {isConfigLoaded ? (
                <VStack align="start" spacing={2}>
                  {frentesDisponiveis.map(frente => (
                    <Checkbox 
                      key={frente.id}
                      isChecked={selectedFrentes.includes(frente.id)}
                      onChange={(e) => handleFrenteChange(frente.id, e.target.checked)}
                      disabled={isProcessing}
                    >
                      {frente.nome}
                    </Checkbox>
                  ))}
                </VStack>
              ) : (
                <Text>Carregando frentes...</Text>
              )}
            </CardBody>
          </Card>
          
          {/* Seção de Processamento e Status */}
          <Card variant="outline">
            <CardBody>
              <Heading size="md" mb={4}>4. Processamento</Heading>
              
              <Button
                colorScheme="blue"
                leftIcon={<FiUpload />}
                onClick={handleProcessReports}
                isLoading={isProcessing}
                loadingText="Processando..."
                mb={4}
                isDisabled={(!colhedoraFile && !transbordoFile) || 
                           selectedFrentes.length === 0 || 
                           selectedReportTypes.length === 0}
                width="100%"
              >
                Gerar Relatórios
              </Button>
              
              {isProcessing && (
                <VStack spacing={2} mt={4} align="start">
                  <Text>Progresso: {processProgress}%</Text>
                  <Progress value={processProgress} width="100%" colorScheme="blue" />
                </VStack>
              )}
              
              {processedReports.length > 0 && (
                <Box mt={4}>
                  <Text fontWeight="bold" mb={2}>
                    Relatórios Gerados ({processedReports.length}):
                  </Text>
                  <VStack align="start" spacing={1} maxH="200px" overflowY="auto">
                    {processedReports.map((report, index) => (
                      <HStack key={index}>
                        <FiFileText />
                        <Text>{report}</Text>
                        <Badge colorScheme="green">Concluído</Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      <Flex justify="space-between" mt={8}>
        <Button onClick={() => router.push('/relatorios')} leftIcon={<FiList />}>
          Voltar para Relatórios
        </Button>
      </Flex>
    </Box>
  );
} 