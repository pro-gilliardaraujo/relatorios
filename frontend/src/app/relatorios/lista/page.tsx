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
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Checkbox,
} from '@chakra-ui/react';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { configManager } from '@/utils/config';
import React from 'react';

export default function ListaRelatorios() {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [frenteFiltro, setFrenteFiltro] = useState('todas');
  const [dataFiltro, setDataFiltro] = useState('');
  const [filtrarTeste, setFiltrarTeste] = useState(false);
  const [relatorioParaExcluir, setRelatorioParaExcluir] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
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
  }, [tipoFiltro, frenteFiltro, dataFiltro, filtrarTeste]);

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

      if (filtrarTeste) {
        query = query.eq('is_teste', true);
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
      <Stack spacing={6} bg="white">
        {/* Cabeçalho */}
        <Box bg="white">
          <Heading size="lg" mb={2} color="black">Lista de Relatórios</Heading>
        </Box>

        {/* Filtros */}
        <Flex gap={4} wrap="wrap" bg="white">
          <Select
            placeholder="Tipo de Relatório"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            w={{ base: "100%", md: "200px" }}
            bg="white"
            color="black"
            borderColor="black"
            _hover={{ borderColor: "black" }}
            _focus={{ borderColor: "black", boxShadow: "none" }}
          >
            <option value="todos" style={{ backgroundColor: "white", color: "black" }}>Todos</option>
            {tiposRelatorio.map(tipo => {
              const config = configManager.getTipoRelatorio(tipo);
              return (
                <option key={tipo} value={tipo} style={{ backgroundColor: "white", color: "black" }}>
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
            borderColor="black"
            _hover={{ borderColor: "black" }}
            _focus={{ borderColor: "black", boxShadow: "none" }}
          >
            <option value="todas" style={{ backgroundColor: "white", color: "black" }}>Todas</option>
            {frentesDisponiveis.map(frente => (
              <option key={frente.id} value={frente.id} style={{ backgroundColor: "white", color: "black" }}>
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
            borderColor="black"
            _hover={{ borderColor: "black" }}
            _focus={{ borderColor: "black", boxShadow: "none" }}
          />

          <Checkbox
            isChecked={filtrarTeste}
            onChange={(e) => setFiltrarTeste(e.target.checked)}
            colorScheme="gray"
            borderColor="black"
            iconColor="black"
            color="black"
            _hover={{ borderColor: "black" }}
          >
            <Text color="black" fontWeight="medium">Apenas Testes</Text>
          </Checkbox>

          <Button
            onClick={() => {
              setTipoFiltro('todos');
              setFrenteFiltro('todas');
              setDataFiltro('');
              setFiltrarTeste(false);
            }}
            variant="outline"
            color="black"
            borderColor="black"
            bg="white"
            w={{ base: "100%", md: "auto" }}
            _hover={{ bg: 'gray.50' }}
          >
            Limpar Filtros
          </Button>
        </Flex>

        {/* Tabela */}
        <Box overflowX="auto" borderRadius="lg" borderWidth="1px" borderColor="black" bg="white">
          <Table variant="simple" bg="white">
            <Thead bg="white">
              <Tr bg="white">
                <Th py={4} color="black" bg="white" borderColor="black">Data</Th>
                <Th py={4} color="black" bg="white" borderColor="black">Tipo</Th>
                <Th py={4} color="black" bg="white" borderColor="black">Frente</Th>
                <Th py={4} color="black" bg="white" borderColor="black">Status</Th>
                <Th py={4} color="black" bg="white" borderColor="black">Teste</Th>
                <Th py={4} textAlign="right" color="black" bg="white" borderColor="black">Ações</Th>
              </Tr>
            </Thead>
            <Tbody bg="white">
              {loading ? (
                <Tr bg="white">
                  <Td colSpan={6} textAlign="center" py={8} bg="white" borderColor="black">
                    <Spinner color="black" />
                  </Td>
                </Tr>
              ) : relatorios.length === 0 ? (
                <Tr bg="white">
                  <Td colSpan={6} textAlign="center" py={8} color="black" bg="white" borderColor="black">
                    Nenhum relatório encontrado
                  </Td>
                </Tr>
              ) : (
                relatorios.map((relatorio) => (
                  <Tr key={relatorio.id} _hover={{ bg: 'gray.50' }} bg="white">
                    <Td py={4} color="black" bg="white" borderColor="black">{new Date(relatorio.data).toLocaleDateString()}</Td>
                    <Td py={4} color="black" bg="white" borderColor="black">{configManager.getTipoRelatorio(relatorio.tipo)?.nome || relatorio.tipo}</Td>
                    <Td py={4} color="black" bg="white" borderColor="black">
                      {configManager.getFrentes(relatorio.tipo).find(f => f.id === relatorio.frente)?.nome || relatorio.frente}
                    </Td>
                    <Td py={4} color="black" bg="white" borderColor="black">{relatorio.status}</Td>
                    <Td py={4} color="black" bg="white" borderColor="black">{relatorio.is_teste ? 'Sim' : 'Não'}</Td>
                    <Td py={4} bg="white" borderColor="black">
                      <Flex justify="flex-end" gap={2}>
                        <IconButton
                          aria-label="Visualizar relatório"
                          icon={<FiEye />}
                          onClick={() => {
                            const tipoNormalizado = relatorio.tipo.replace('_diario', '');
                            const url = `/relatorios/visualizacao/a4/${tipoNormalizado}?id=${relatorio.id}`;
                            window.open(url, '_blank');
                          }}
                          variant="outline"
                          color="black"
                          borderColor="black"
                          bg="white"
                          _hover={{ bg: 'gray.50' }}
                        />
                        <IconButton
                          aria-label="Excluir relatório"
                          icon={<FiTrash2 />}
                          onClick={() => setRelatorioParaExcluir(relatorio.id)}
                          variant="outline"
                          color="red.500"
                          borderColor="red.500"
                          bg="white"
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
                borderColor="black"
                bg="white"
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
    </Box>
  );
} 