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
      case 'colheita_diario':
        path += 'colheita';
        break;
      case 'cav':
        path += 'cav';
        break;
      case 'transbordo':
        path += 'transbordo';
        break;
      case 'colheita-semanal':
        path += 'colheita-semanal';
        break;
      default:
        path += tipo; // Usa o tipo diretamente se não for um dos casos acima
    }
    router.push(`${path}?id=${id}`);
  };

  const gerarPDF = async (id: string, tipo: string) => {
    try {
      onOpen();
      setProgress(10);

      let path = '/relatorios/visualizacao/a4/';
      switch (tipo) {
        case 'plantio':
          path += 'plantio';
          break;
        case 'colheita':
        case 'colheita_diario':
          path += 'colheita';
          break;
        case 'cav':
          path += 'cav';
          break;
        case 'transbordo':
          path += 'transbordo';
          break;
        case 'colheita-semanal':
          path += 'colheita-semanal';
          break;
        default:
          path += tipo;
      }

      const reportWindow = window.open(
        `${path}?id=${id}&format=pdf`,
        '_blank'
      );
      
      if (!reportWindow) {
        throw new Error('Por favor, permita popups para gerar o PDF');
      }

      setProgress(20);

      await new Promise<void>((resolve, reject) => {
        const checkLoaded = setInterval(() => {
          try {
            if (reportWindow.document.readyState === 'complete') {
              const content = reportWindow.document.querySelector('.report-content');
              if (content) {
                const style = reportWindow.document.createElement('style');
                style.textContent = `
                  @page { 
                    margin: 0;
                    size: A4 portrait;
                  }
                  * { 
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    box-sizing: border-box !important;
                  }
                  html, body { 
                    margin: 0 !important; 
                    padding: 0 !important;
                    width: 210mm !important;
                    height: 297mm !important;
                    background: white !important;
                  }
                  .report-content { 
                    width: 210mm !important;
                    min-height: 297mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                    display: flex !important;
                    flex-direction: column !important;
                  }
                  .report-content > * { 
                    width: 210mm !important;
                    min-height: 297mm !important;
                    padding: 15mm 20mm !important;
                    margin: 0 !important;
                    background: white !important;
                    page-break-after: always !important;
                    position: relative !important;
                  }
                  .chakra-progress {
                    height: 24px !important;
                    margin: 8px 0 !important;
                  }
                  .chakra-progress__track {
                    height: 24px !important;
                    background-color: #E2E8F0 !important;
                  }
                  .chakra-progress__filled-track {
                    height: 24px !important;
                    transition: none !important;
                  }
                  table { 
                    width: 100% !important;
                    border-collapse: collapse !important;
                    page-break-inside: avoid !important;
                  }
                  td, th {
                    padding: 8px !important;
                    border: 1px solid #E2E8F0 !important;
                  }
                  img, svg { 
                    max-width: 170mm !important;
                    height: auto !important;
                    display: block !important;
                    margin: 0 auto !important;
                  }
                  h1, h2, h3 {
                    margin: 16px 0 !important;
                    page-break-after: avoid !important;
                  }
                  .chakra-text {
                    margin: 4px 0 !important;
                  }
                `;
                reportWindow.document.head.appendChild(style);
                
                // Forçar recálculo do layout
                reportWindow.document.body.style.zoom = '1';
                
                setTimeout(() => {
                  clearInterval(checkLoaded);
                  resolve();
                }, 3000);
              }
            }
          } catch (e) {
            clearInterval(checkLoaded);
            reject(new Error('Erro ao carregar relatório'));
          }
        }, 500);

        setTimeout(() => {
          clearInterval(checkLoaded);
          reject(new Error('Tempo limite excedido ao carregar relatório'));
        }, 30000);
      });

      setProgress(40);

      const pages = Array.from(reportWindow.document.querySelectorAll('.report-content > *'));
      if (pages.length === 0) {
        throw new Error('Nenhum conteúdo encontrado para gerar o PDF');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        hotfixes: ['px_scaling']
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        setProgress(40 + Math.floor((i / pages.length) * 50));

        const canvas = await html2canvas(page as HTMLElement, {
          dpi: 300,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 793, // 210mm em pixels @ 96dpi
          height: 1122, // 297mm em pixels @ 96dpi
          windowWidth: 793,
          windowHeight: 1122,
          onclone: (clonedDoc: Document) => {
            Array.from(clonedDoc.getElementsByClassName('chakra-progress')).forEach((progress: Element) => {
              if (progress instanceof HTMLElement && progress.style) {
                progress.style.transform = 'none';
                progress.style.height = '24px';
              }
            });
          }
        });

        if (i > 0) {
          pdf.addPage();
        }

        // Calcular as dimensões corretas mantendo a proporção
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      setProgress(90);

      const fileName = `relatorio_${tipo}_${id}.pdf`;
      pdf.save(fileName);

      reportWindow.close();
      setProgress(100);
      onClose();

      toast({
        title: 'Sucesso',
        description: 'PDF gerado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      onClose();
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
                    {relatorio.data.split('-').reverse().join('/')}
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