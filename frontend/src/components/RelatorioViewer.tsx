import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Spinner, 
  Button, 
  useToast
} from '@chakra-ui/react';
import { FiRefreshCw, FiDownload } from 'react-icons/fi';

interface RelatorioViewerProps {
  reportId: string;
  isPdfMode?: boolean;
}

export const RelatorioViewer: React.FC<RelatorioViewerProps> = ({ 
  reportId,
  isPdfMode = false
}) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const toast = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/status?id=${reportId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar relatório');
      }

      if (data.success) {
        setReport(data.report);
        
        // Se estamos no modo PDF, continue verificando até o PDF estar pronto
        if (isPdfMode && (!data.report.pdf_url || data.report.status !== 'concluido')) {
          setCheckAttempts(prev => prev + 1);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar relatório');
      setLoading(false);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao carregar relatório',
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  // Verificar status a cada 3 segundos até o PDF estar pronto (limite de 20 tentativas)
  useEffect(() => {
    if (isPdfMode && report && !report.pdf_url && checkAttempts < 20) {
      const timer = setTimeout(() => {
        fetchReport();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [report, checkAttempts, isPdfMode]);

  const handleRefresh = () => {
    fetchReport();
  };

  const handleDownload = () => {
    if (report?.pdf_url) {
      window.open(report.pdf_url, '_blank');
    }
  };

  if (loading && (!report || (isPdfMode && !report.pdf_url))) {
    return (
      <Flex direction="column" align="center" justify="center" h="100%" id="report-content">
        <Spinner size="xl" color="blue.500" mb={4} />
        <Text fontSize="lg" mb={2}>
          {isPdfMode ? 'Gerando relatório em PDF' : 'Carregando relatório'}
        </Text>
        <Text color="gray.500" mb={6}>
          Este processo pode levar alguns instantes...
        </Text>
        {checkAttempts > 5 && (
          <Button 
            leftIcon={<FiRefreshCw />} 
            onClick={handleRefresh}
            isLoading={loading}
            size="md"
          >
            Verificar status
          </Button>
        )}
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex direction="column" align="center" justify="center" h="100%" id="report-content">
        <Text color="red.500" fontSize="lg" mb={4}>
          {error}
        </Text>
        <Button 
          onClick={handleRefresh}
          colorScheme="blue"
        >
          Tentar novamente
        </Button>
      </Flex>
    );
  }

  if (isPdfMode && report?.pdf_url) {
    return (
      <Box h="100%" id="report-content">
        <Flex justify="flex-end" mb={2}>
          <Button 
            leftIcon={<FiDownload />} 
            colorScheme="blue" 
            size="sm"
            onClick={handleDownload}
          >
            Baixar PDF
          </Button>
        </Flex>
        <Box h="calc(100% - 40px)" border="1px solid" borderColor="gray.200" borderRadius="md">
          <iframe 
            src={report.pdf_url} 
            width="100%" 
            height="100%" 
            style={{border: "none"}} 
            title="Relatório PDF"
          />
        </Box>
      </Box>
    );
  }

  // Aqui renderizamos o conteúdo do relatório (quando não estamos no modo PDF)
  return (
    <Box id="report-content" h="100%">
      {/* O conteúdo do relatório será inserido aqui quando não estamos no modo PDF */}
      <Text fontSize="lg">Relatório carregado com sucesso!</Text>
      {report?.pdf_url && (
        <Button 
          leftIcon={<FiDownload />} 
          colorScheme="blue" 
          mt={4}
          onClick={handleDownload}
        >
          Baixar PDF
        </Button>
      )}
    </Box>
  );
};

export default RelatorioViewer; 