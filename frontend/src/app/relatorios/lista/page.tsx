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
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { FiEye, FiFileText, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { configManager } from '@/utils/config';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import React from 'react';

export default function ListaRelatorios() {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [frenteFiltro, setFrenteFiltro] = useState('todas');
  const [dataFiltro, setDataFiltro] = useState('');
  const [relatorioParaExcluir, setRelatorioParaExcluir] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [progress, setProgress] = useState(0);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

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

  const excluirRelatorio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('relatorios_diarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Relatório excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      carregarRelatorios();
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o relatório',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} bg="white">
      <Stack spacing={6}>
        {/* Cabeçalho */}
        <Heading size="lg" mb={2} color="black">Lista de Relatórios</Heading>

        {/* Filtros */}
        <Flex gap={4} wrap="wrap">
          <Select
            placeholder="Tipo de Relatório"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            w={{ base: "100%", md: "200px" }}
            bg="white"
            color="black"
            borderColor="gray.300"
          >
            <option value="todos">Todos</option>
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
            placeholder="Frente"
            value={frenteFiltro}
            onChange={(e) => setFrenteFiltro(e.target.value)}
            w={{ base: "100%", md: "200px" }}
            bg="white"
            color="black"
            borderColor="gray.300"
          >
            <option value="todas">Todas</option>
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
          />

          <Button
            onClick={() => {
              setTipoFiltro('todos');
              setFrenteFiltro('todas');
              setDataFiltro('');
            }}
            variant="outline"
            color="black"
            borderColor="gray.300"
            w={{ base: "100%", md: "auto" }}
            _hover={{ bg: 'gray.50' }}
          >
            Limpar Filtros
          </Button>
        </Flex>

        {/* Tabela */}
        <Box overflowX="auto" borderRadius="lg" borderWidth="1px" borderColor="gray.300">
          <Table variant="simple">
            <Thead bg="white">
              <Tr>
                <Th py={4} color="black">Data</Th>
                <Th py={4} color="black">Tipo</Th>
                <Th py={4} color="black">Frente</Th>
                <Th py={4} color="black">Status</Th>
                <Th py={4} textAlign="right" color="black">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Spinner color="black" />
                  </Td>
                </Tr>
              ) : relatorios.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8} color="black">
                    Nenhum relatório encontrado
                  </Td>
                </Tr>
              ) : (
                relatorios.map((relatorio) => (
                  <Tr key={relatorio.id} _hover={{ bg: 'gray.50' }}>
                    <Td py={4} color="black">{new Date(relatorio.data).toLocaleDateString()}</Td>
                    <Td py={4} color="black">{configManager.getTipoRelatorio(relatorio.tipo)?.nome || relatorio.tipo}</Td>
                    <Td py={4} color="black">
                      {configManager.getFrentes(relatorio.tipo).find(f => f.id === relatorio.frente)?.nome || relatorio.frente}
                    </Td>
                    <Td py={4} color="black">{relatorio.status}</Td>
                    <Td py={4}>
                      <Flex justify="flex-end" gap={2}>
                        <IconButton
                          aria-label="Visualizar relatório"
                          icon={<FiEye />}
                          onClick={() => {
                            // Remover sufixo _diario do tipo
                            const tipoNormalizado = relatorio.tipo.replace('_diario', '');
                            const url = `/relatorios/visualizacao/a4/${tipoNormalizado}?id=${relatorio.id}`;
                            window.open(url, '_blank');
                          }}
                          variant="ghost"
                          color="gray.600"
                          _hover={{ bg: 'gray.50' }}
                        />
                        <IconButton
                          aria-label="Excluir relatório"
                          icon={<FiTrash2 />}
                          onClick={() => setRelatorioParaExcluir(relatorio.id)}
                          variant="ghost"
                          color="red.500"
                          _hover={{ bg: 'red.50' }}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Stack>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        isOpen={!!relatorioParaExcluir}
        leastDestructiveRef={cancelRef}
        onClose={() => setRelatorioParaExcluir(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="white">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="black">
              Excluir Relatório
            </AlertDialogHeader>

            <AlertDialogBody color="black">
              Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={() => setRelatorioParaExcluir(null)}
                variant="outline"
                color="black"
                borderColor="gray.300"
                _hover={{ bg: 'gray.50' }}
              >
                Cancelar
              </Button>
              <Button 
                colorScheme="red"
                onClick={() => {
                  if (relatorioParaExcluir) {
                    excluirRelatorio(relatorioParaExcluir);
                    setRelatorioParaExcluir(null);
                  }
                }} 
                ml={3}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal de Progresso */}
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalBody p={6}>
            <Text mb={4} textAlign="center" color="black">Gerando PDF...</Text>
            <Progress value={progress} size="sm" colorScheme="gray" borderRadius="full" />
            <Text mt={2} fontSize="sm" color="black" textAlign="center">
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