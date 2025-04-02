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
  Stack
} from '@chakra-ui/react';
import { FiEye } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ListaRelatorios() {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [frenteFiltro, setFrenteFiltro] = useState('todas');
  const [dataFiltro, setDataFiltro] = useState('');
  const router = useRouter();
  const toast = useToast();

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

  const limparFiltros = () => {
    setTipoFiltro('todos');
    setFrenteFiltro('todas');
    setDataFiltro('');
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Relatórios</Heading>
      </Flex>

      {/* Filtros */}
      <Stack spacing={4} mb={6} direction={{ base: "column", md: "row" }}>
        <Select
          w={{ base: "100%", md: "200px" }}
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
        >
          <option value="todos">Todos os tipos</option>
          <option value="plantio">Plantio</option>
          <option value="colheita">Colheita</option>
          <option value="cav">CAV</option>
        </Select>

        <Select
          w={{ base: "100%", md: "200px" }}
          value={frenteFiltro}
          onChange={(e) => setFrenteFiltro(e.target.value)}
        >
          <option value="todas">Todas as frentes</option>
          <option value="frente1">Frente 1</option>
          <option value="frente2">Frente 2</option>
          <option value="frente3">Frente 3</option>
        </Select>

        <Input
          type="date"
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
          w={{ base: "100%", md: "200px" }}
        />

        <Button
          colorScheme="gray"
          onClick={limparFiltros}
          w={{ base: "100%", md: "auto" }}
        >
          Limpar Filtros
        </Button>
      </Stack>

      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" />
        </Flex>
      ) : relatorios.length === 0 ? (
        <Text textAlign="center">Nenhum relatório encontrado</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Tipo</Th>
                <Th>Data</Th>
                <Th>Status</Th>
                <Th>Frente</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {relatorios.map((relatorio) => (
                <Tr key={relatorio.id}>
                  <Td>{relatorio.id.substring(0, 8)}</Td>
                  <Td textTransform="capitalize">{relatorio.tipo}</Td>
                  <Td>
                    {new Date(relatorio.data).toLocaleDateString('pt-BR')}
                  </Td>
                  <Td textTransform="capitalize">{relatorio.status}</Td>
                  <Td>{relatorio.frente || '-'}</Td>
                  <Td>
                    <Button
                      leftIcon={<FiEye />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => visualizarRelatorio(relatorio.id, relatorio.tipo)}
                    >
                      Visualizar
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
} 