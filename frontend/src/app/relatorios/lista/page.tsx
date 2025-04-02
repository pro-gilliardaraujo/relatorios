'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Select,
  Spinner,
  Text,
  useToast,
  Input,
  Stack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Progress,
} from '@chakra-ui/react';
import { FiEye, FiFileText } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { configManager } from '@/utils/config';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ListaRelatorios() {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [frenteFiltro, setFrenteFiltro] = useState('todas');
  const [dataFiltro, setDataFiltro] = useState('');
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [progress, setProgress] = useState(0);

  // Obter tipos de relatório e frentes das configurações
  const tiposRelatorio = configManager.getTiposRelatorio();
  const frentesDisponiveis = tipoFiltro !== 'todos' 
    ? configManager.getFrentes(tipoFiltro)
    : Object.values(configManager.getTiposRelatorio())
        .flatMap(tipo => configManager.getFrentes(tipo))
        .filter((frente, index, self) => 
          index === self.findIndex(f => f.id === frente.id)
        );

  useEffect(() => {
    carregarRelatorios();
  }, [tipoFiltro, frenteFiltro, dataFiltro]);

  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('relatorios_diarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (tipoFiltro !== 'todos') {
        query = query.eq('tipo', tipoFiltro);
      }

      if (frenteFiltro !== 'todas') {
        query = query.eq('frente', frenteFiltro);
      }

      if (dataFiltro) {
        query = query.eq('data', dataFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRelatorios(data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os relatórios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const visualizarRelatorio = (id: string, tipo: string) => {
    let path = '/relatorios/visualizacao/a4/';
    switch (tipo) {
      case 'plantio':
        path += 'plantio';
        break;
      case 'colheita':
        path += 'colheita';
        break;
      case 'cav':
        path += 'cav';
        break;
      default:
        path += 'plantio';
    }
    router.push(`${path}?id=${id}`);
  };

  const gerarPDF = async (id: string, tipo: string) => {
    try {
      // Abrir modal de progresso
      onOpen();
      setProgress(10);

      // 1. Abrir a página em uma nova janela maximizada
      let path = '/relatorios/visualizacao/a4/';
      switch (tipo) {
        case 'plantio':
          path += 'plantio';
          break;
        case 'colheita':
          path += 'colheita';
          break;
        case 'cav':
          path += 'cav';
          break;
        default:
          path += 'plantio';
      }

      const reportWindow = window.open(
        `${path}?id=${id}&format=pdf`,
        '_blank'
      );
      
      if (!reportWindow) {
        throw new Error('Por favor, permita popups para gerar o PDF');
      }

      // Maximizar a janela
      reportWindow.focus();

      setProgress(20);

      // 2. Esperar a página carregar completamente
      await new Promise<void>((resolve, reject) => {
        const checkLoaded = setInterval(() => {
          try {
            if (reportWindow.document.readyState === 'complete') {
              const content = reportWindow.document.querySelector('.report-content');
              if (content) {
                // Garantir que os estilos estejam aplicados
                const style = reportWindow.document.createElement('style');
                style.textContent = `
                  * { 
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  html, body { 
                    margin: 0 !important; 
                    padding: 0 !important;
                    overflow: hidden !important;
                    background: white !important;
                    width: 100% !important;
                    height: 100% !important;
                  }
                  .report-content { 
                    margin: 0 auto !important;
                    padding: 0 !important;
                    background: white !important;
                    width: 100% !important;
                    max-width: 1200px !important;
                  }
                  .report-content > * { 
                    margin: 0 auto !important;
                    padding: 40px !important;
                    box-sizing: border-box !important;
                    background: white !important;
                    position: relative !important;
                    page-break-after: always !important;
                    overflow: hidden !important;
                    width: 100% !important;
                    max-width: 1200px !important;
                  }
                  .chakra-container { 
                    margin: 0 auto !important; 
                    padding: 0 !important;
                    max-width: 1200px !important;
                    width: 100% !important;
                  }
                  svg { 
                    display: block !important;
                    margin: 0 auto !important;
                    max-width: 100% !important;
                    height: auto !important;
                  }
                  svg text { 
                    dominant-baseline: middle !important;
                  }
                  table { 
                    width: 100% !important;
                    margin: 0 auto !important;
                  }
                `;
                reportWindow.document.head.appendChild(style);
                
                // Dar tempo para os estilos serem aplicados
                setTimeout(() => {
                  clearInterval(checkLoaded);
                  resolve();
                }, 1000);
              }
            }
          } catch (e) {
            clearInterval(checkLoaded);
            reject(new Error('Erro ao carregar relatório'));
          }
        }, 500);

        // Timeout após 30 segundos
        setTimeout(() => {
          clearInterval(checkLoaded);
          reject(new Error('Tempo limite excedido ao carregar relatório'));
        }, 30000);
      });

      setProgress(30);

      // 3. Capturar cada página A4
      const pages = Array.from(reportWindow.document.querySelectorAll('.report-content > *'));
      if (pages.length === 0) {
        throw new Error('Nenhum conteúdo encontrado para gerar o PDF');
      }

      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Ajustar dimensões para melhor qualidade
      const scale = 2;
      const scaledWidth = pageWidth * scale;
      const scaledHeight = pageHeight * scale;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Atualizar progresso
        setProgress(30 + Math.floor((i / pages.length) * 60));

        // Capturar a página como imagem
        const canvas = await html2canvas(page, {
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: scaledWidth,
          height: scaledHeight,
          scale: scale,
          onclone: (clonedDoc) => {
            const content = clonedDoc.querySelector('.report-content');
            if (content instanceof HTMLElement) {
              content.style.margin = '0 auto';
              content.style.maxWidth = '1200px';
              content.style.width = '100%';
            }
            if (clonedDoc.body) {
              clonedDoc.body.style.margin = '0';
              clonedDoc.body.style.padding = '0';
              clonedDoc.body.style.width = '100%';
              clonedDoc.body.style.background = 'white';
            }
          }
        });

        // Adicionar ao PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, '', 'FAST');
      }

      setProgress(95);

      // 4. Salvar o PDF
      pdf.save(`relatorio_${id}.pdf`);

      // 5. Fechar a janela do relatório
      reportWindow.close();
      
      setProgress(100);
      
      setTimeout(() => {
        onClose();
        setProgress(0);
      }, 500);

      toast({
        title: 'PDF gerado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      onClose();
      setProgress(0);
      toast({
        title: 'Erro ao gerar PDF',
        description: error instanceof Error ? error.message : 'Não foi possível gerar o PDF do relatório',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const limparFiltros = () => {
    setTipoFiltro('todos');
    setFrenteFiltro('todas');
    setDataFiltro('');
  };

  return (
    <Box p={4} bg="white" minH="100vh">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="black">Relatórios</Heading>
      </Flex>

      {/* Filtros */}
      <Stack spacing={4} mb={6} direction={{ base: "column", md: "row" }}>
        <Select
          w={{ base: "100%", md: "200px" }}
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          bg="white"
          color="black"
          borderColor="gray.300"
          _hover={{ borderColor: "gray.400" }}
        >
          <option value="todos">Todos os tipos</option>
          {tiposRelatorio.map(tipo => {
            const config = configManager.getTipoRelatorio(tipo);
            return (
              <option key={tipo} value={tipo}>
                {config?.nome || tipo}
              </option>
            );
          })}
        </Select>

        <Select
          w={{ base: "100%", md: "200px" }}
          value={frenteFiltro}
          onChange={(e) => setFrenteFiltro(e.target.value)}
          bg="white"
          color="black"
          borderColor="gray.300"
          _hover={{ borderColor: "gray.400" }}
        >
          <option value="todas">Todas as frentes</option>
          {frentesDisponiveis.map(frente => (
            <option key={frente.id} value={frente.id}>
              {frente.nome}
            </option>
          ))}
        </Select>

        <Input
          type="date"
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
          w={{ base: "100%", md: "200px" }}
          bg="white"
          color="black"
          borderColor="gray.300"
          _hover={{ borderColor: "gray.400" }}
        />

        <Button
          onClick={limparFiltros}
          w={{ base: "100%", md: "auto" }}
          variant="outline"
          borderColor="gray.300"
          color="black"
          _hover={{ bg: 'gray.50' }}
        >
          Limpar Filtros
        </Button>
      </Stack>

      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color="black" />
        </Flex>
      ) : relatorios.length === 0 ? (
        <Text textAlign="center" color="black">Nenhum relatório encontrado</Text>
      ) : (
        <Box overflowX="auto" borderWidth="1px" borderColor="gray.200" borderRadius="md">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th color="black">ID</Th>
                <Th color="black">Tipo</Th>
                <Th color="black">Data</Th>
                <Th color="black">Status</Th>
                <Th color="black">Frente</Th>
                <Th color="black">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {relatorios.map((relatorio) => (
                <Tr key={relatorio.id} _hover={{ bg: 'gray.50' }}>
                  <Td color="black">{relatorio.id.substring(0, 8)}</Td>
                  <Td color="black" textTransform="capitalize">
                    {configManager.getTipoRelatorio(relatorio.tipo)?.nome || relatorio.tipo}
                  </Td>
                  <Td color="black">
                    {new Date(relatorio.data).toLocaleDateString('pt-BR')}
                  </Td>
                  <Td color="black" textTransform="capitalize">{relatorio.status}</Td>
                  <Td color="black">
                    {configManager.getFrentes(relatorio.tipo)
                      .find(f => f.id === relatorio.frente)?.nome || relatorio.frente || '-'}
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <Button
                        leftIcon={<FiEye />}
                        variant="outline"
                        colorScheme="gray"
                        size="sm"
                        onClick={() => visualizarRelatorio(relatorio.id, relatorio.tipo)}
                        color="black"
                        borderColor="gray.300"
                        _hover={{ bg: 'gray.50' }}
                      >
                        Visualizar
                      </Button>
                      <Button
                        leftIcon={<FiFileText />}
                        variant="outline"
                        colorScheme="gray"
                        size="sm"
                        onClick={() => gerarPDF(relatorio.id, relatorio.tipo)}
                        color="black"
                        borderColor="gray.300"
                        _hover={{ bg: 'gray.50' }}
                      >
                        PDF
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Modal de Progresso */}
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalBody p={6}>
            <Text mb={4} textAlign="center" color="black">Gerando PDF...</Text>
            <Progress value={progress} size="sm" colorScheme="gray" borderRadius="full" />
            <Text mt={2} fontSize="sm" color="gray.600" textAlign="center">
              {progress < 30 && "Preparando..."}
              {progress >= 30 && progress < 90 && "Processando páginas..."}
              {progress >= 90 && "Finalizando..."}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 