'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, HStack, useToast, Spinner, Flex, Text } from '@chakra-ui/react';
import { FaFilePdf, FaPrint, FaDownload, FaEye } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface RelatorioViewerProps {
  children?: React.ReactNode;
  reportId?: string | null | undefined;
  onPrint?: () => void;
  isPdfMode?: boolean;
}

const RelatorioViewer: React.FC<RelatorioViewerProps> = ({
  children,
  reportId,
  onPrint,
  isPdfMode = false
}) => {
  const toast = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportStatus, setReportStatus] = useState<string>('');

  // Verificar status do relatório e URL do PDF
  useEffect(() => {
    if (reportId) {
      const checkReportStatus = async () => {
        setIsLoading(true);
        try {
          const { data: report, error } = await supabase
            .from('relatorios_diarios')
            .select('pdf_url, status')
            .eq('id', reportId)
            .single();
          
          if (error) throw error;
          
          if (report) {
            setReportStatus(report.status);
            if (report.pdf_url) {
              setPdfUrl(report.pdf_url);
            } else if (report.status === 'processando') {
              // Se o relatório ainda está processando, verificar novamente em 5 segundos
              const timer = setTimeout(() => checkReportStatus(), 5000);
              return () => clearTimeout(timer);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar status do relatório:', error);
          toast({
            title: "Erro ao verificar relatório",
            description: "Não foi possível obter o status atual do relatório",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      checkReportStatus();
    }
  }, [reportId, toast]);

  // Função para imprimir
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Função para baixar PDF
  const handleDownloadPDF = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else if (reportId) {
      setIsLoading(true);
      try {
        const { data: report } = await supabase
          .from('relatorios_diarios')
          .select('pdf_url')
          .eq('id', reportId)
          .single();

        if (report?.pdf_url) {
          setPdfUrl(report.pdf_url);
          window.open(report.pdf_url, '_blank');
        } else {
          toast({
            title: "PDF não encontrado",
            description: "O PDF deste relatório ainda não foi gerado",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao baixar PDF",
          description: "Não foi possível baixar o PDF do relatório",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Erro",
        description: "ID do relatório não fornecido",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Se estiver no modo PDF e tiver uma URL, mostrar o PDF incorporado
  if (isPdfMode && pdfUrl) {
    return (
      <Box position="relative" height="100%">
        <HStack spacing={4} justify="flex-end" mb={4}>
          <Button
            leftIcon={<FaEye />}
            onClick={() => window.open(pdfUrl, '_blank')}
            colorScheme="blue"
          >
            Abrir em Nova Aba
          </Button>
          <Button
            leftIcon={<FaDownload />}
            onClick={handleDownloadPDF}
            colorScheme="green"
          >
            Baixar PDF
          </Button>
        </HStack>
        <Box height="calc(100% - 50px)" width="100%">
          <iframe 
            src={pdfUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Visualização do relatório em PDF"
          />
        </Box>
      </Box>
    );
  }

  // Se estiver carregando
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100%" direction="column" gap={4}>
        <Spinner size="xl" color="blue.500" />
        <Text>Carregando relatório...</Text>
      </Flex>
    );
  }

  return (
    <Box position="relative" sx={{ '@media print': { m: '0 !important', p: '0 !important' } }}>
      {/* Barra de ações */}
      <Box
        position="sticky"
        top={0}
        bg="white"
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        zIndex={1000}
        className="no-print"
        sx={{
          '@media print': {
            display: 'none !important',
            height: '0 !important',
            position: 'absolute !important',
            width: '0 !important',
            overflow: 'hidden !important',
            margin: '0 !important',
            padding: '0 !important'
          }
        }}
      >
        <HStack spacing={4} justify="flex-end">
          <Button
            leftIcon={<FaPrint />}
            onClick={handlePrint}
            colorScheme="blue"
          >
            Imprimir
          </Button>
          <Button
            leftIcon={<FaDownload />}
            onClick={handleDownloadPDF}
            colorScheme="green"
            isDisabled={!reportId && !pdfUrl}
          >
            Baixar PDF
          </Button>
          {reportId && (
            <Button
              leftIcon={<FaEye />}
              onClick={() => {
                const url = window.location.href;
                window.open(url, '_blank');
              }}
              colorScheme="teal"
            >
              Abrir em Nova Aba
            </Button>
          )}
        </HStack>
      </Box>

      {/* Conteúdo do relatório */}
      <Box 
        className="report-content" 
        id="report-content"
        sx={{ 
          '@media print': { 
            m: '0 !important', 
            p: '0 !important',
            '& > *': {
              m: '0 !important',
              p: '0 !important'
            }
          } 
        }}
      >
        {children}
      </Box>

      {/* Estilos globais para impressão */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          .report-content {
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
            height: 0 !important;
            position: absolute !important;
            width: 0 !important;
            overflow: hidden !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </Box>
  );
};

export default RelatorioViewer; 