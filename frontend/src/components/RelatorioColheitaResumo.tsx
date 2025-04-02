import React from 'react';
import { Box, Text, Flex, Grid, GridItem, Table, Thead, Tbody, Tr, Th, Td, SimpleGrid, Card, CardBody, Heading, TableContainer } from '@chakra-ui/react';

interface DataItem {
  frota?: string;
  valor?: number;
  disponibilidade?: number;
  eficiencia?: number;
  percentual?: number;
  horas?: number;
  porcentagem?: number;
}

interface AcimaMeta {
  quantidade: number;
  total: number;
  percentual: number;
}

interface DataComMeta {
  data: DataItem[];
  meta: number;
  media: number;
  acimaMeta?: AcimaMeta;
}

interface ResumoData {
  tdh?: {
    data: DataItem[];
    meta: number;
  };
  diesel?: {
    data: DataItem[];
    meta: number;
  };
  impurezaVegetal?: {
    data: DataItem[];
    meta: number;
  };
  disponibilidadeMecanica: {
    data: DataItem[];
    meta: number;
    media: number;
    acimaMeta?: AcimaMeta;
  };
  eficienciaEnergetica: {
    data: DataItem[];
    meta: number;
    media: number;
    acimaMeta?: AcimaMeta;
  };
  motorOcioso: {
    data: DataItem[];
    meta: number;
    media: number;
    acimaMeta?: AcimaMeta;
  };
  horaElevador: {
    data: DataItem[];
    meta: number;
    media: number;
    acimaMeta?: AcimaMeta;
  };
  usoGPS: {
    data: DataItem[];
    meta: number;
    media: number;
    acimaMeta?: AcimaMeta;
  };
  operadores?: Array<{
    id: string;
    nome: string;
    eficiencia?: number;
    motorOcioso?: number;
    horaElevador?: number;
    usoGPS?: number;
  }>;
}

interface RelatorioColheitaResumoProps {
  resumoData: ResumoData;
  isPdfMode?: boolean;
}

const defaultData: ResumoData = {
  disponibilidadeMecanica: {
    meta: 90,
    media: 85.3,
    acimaMeta: {
      quantidade: 1,
      total: 2,
      percentual: 50
    }
  },
  eficienciaEnergetica: {
    meta: 45,
    media: 51,
    acimaMeta: {
      quantidade: 5,
      total: 9,
      percentual: 56
    }
  },
  motorOcioso: {
    meta: 25,
    media: 29.4,
    acimaMeta: {
      quantidade: 3,
      total: 9,
      percentual: 33
    }
  },
  horaElevador: {
    total: 44.7,
    media: 4.97,
    meta: 5,
    acimaMeta: {
      quantidade: 4,
      total: 9,
      percentual: 44
    }
  },
  usoGPS: {
    meta: 90,
    media: 62.9,
    acimaMeta: {
      quantidade: 3,
      total: 9,
      percentual: 33
    }
  },
  operadores: [
    { id: '1', nome: 'SEM OPERADOR', eficiencia: 39, motorOcioso: 28.1, horasElevador: 2.42, usoGPS: 0.0 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', eficiencia: 59, motorOcioso: 25.1, horasElevador: 7.42, usoGPS: 0.0 },
    { id: '9999', nome: 'TROCA DE TURNO', eficiencia: 53, motorOcioso: 29.9, horasElevador: 7.59, usoGPS: 0.0 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', eficiencia: 60, motorOcioso: 22.0, horasElevador: 6.33, usoGPS: 0.0 },
    { id: '11', nome: 'NAO CADASTRADO', eficiencia: 62, motorOcioso: 19.4, horasElevador: 6.26, usoGPS: 0.0 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', eficiencia: 38, motorOcioso: 40.1, horasElevador: 4.54, usoGPS: 2.3 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', eficiencia: 38, motorOcioso: 31.5, horasElevador: 4.62, usoGPS: 1.7 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', eficiencia: 55, motorOcioso: 32.0, horasElevador: 5.10, usoGPS: 0.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', eficiencia: 31, motorOcioso: 36.8, horasElevador: 0.42, usoGPS: 0.0 }
  ]
};

// Função para formatar o valor de horas (Xh Ym)
const formatHoras = (horas: number) => {
  if (horas === undefined || horas === null) {
    return '0h';
  }
  const horasInteiras = Math.floor(horas);
  const minutos = Math.round((horas - horasInteiras) * 60);
  return `${horasInteiras}h${minutos > 0 ? ` ${minutos}m` : ''}`;
};

// Função para formatar percentuais com vírgula
const formatarPorcentagem = (valor: number, casasDecimais: number = 1) => {
  if (valor === undefined || valor === null) {
    return `0,${'0'.repeat(casasDecimais)}%`;
  }
  return valor.toFixed(casasDecimais).replace('.', ',') + '%';
};

// Função para determinar a cor com base no valor e na meta
const getStatusColor = (valor: number, meta: number, inverter: boolean = false) => {
  // Para métricas onde menor é melhor (ex: Motor Ocioso)
  if (inverter) {
    if (valor <= meta) return 'green.500';
    if (valor <= meta * 1.2) return 'yellow.500';
    if (valor <= meta * 1.5) return 'orange.500';
    return 'red.500';
  } 
  // Para métricas onde maior é melhor (ex: Disponibilidade)
  else {
    if (valor >= meta) return 'green.500';
    if (valor >= meta * 0.9) return 'yellow.500';
    if (valor >= meta * 0.8) return 'orange.500';
    return 'red.500';
  }
};

// Função para determinar a cor com base no percentual atingido
const getPercentualColor = (percentual: number) => {
  if (percentual >= 70) return 'green.500';
  if (percentual >= 50) return 'yellow.500';
  if (percentual >= 30) return 'orange.500';
  return 'red.500';
};

// Função para calcular a média dos valores de uma frota
const calcularMediaFrota = (data: DataItem[]) => {
  if (!data || data.length === 0) return 0;
  const valores = data.map(item => item.valor || item.disponibilidade || item.eficiencia || item.percentual || item.horas || item.porcentagem || 0);
  return valores.reduce((acc, val) => acc + val, 0) / valores.length;
};

// Função para obter todas as frotas únicas dos dados
const obterFrotas = (data: ResumoData) => {
  const frotas = new Set<string>();
  
  if (data.tdh?.data) {
    data.tdh.data.forEach(item => item.frota && frotas.add(item.frota));
  }
  if (data.diesel?.data) {
    data.diesel.data.forEach(item => item.frota && frotas.add(item.frota));
  }
  if (data.disponibilidadeMecanica?.data) {
    data.disponibilidadeMecanica.data.forEach(item => item.frota && frotas.add(item.frota));
  }
  if (data.impurezaVegetal?.data) {
    data.impurezaVegetal.data.forEach(item => item.frota && frotas.add(item.frota));
  }

  return Array.from(frotas).sort();
};

// Função para obter o valor de uma frota específica
const getValorFrota = (data: DataItem[], frota: string) => {
  const item = data.find(d => d.frota === frota);
  return item ? (item.valor || item.disponibilidade || item.eficiencia || item.percentual || item.horas || item.porcentagem || 0) : 0;
};

export const RelatorioColheitaResumo: React.FC<RelatorioColheitaResumoProps> = ({ 
  resumoData 
}) => {
  // Filtrar e ordenar operadores (remover vazios e ordenar por nome)
  const operadoresOrdenados = React.useMemo(() => {
    if (!resumoData.operadores) return [];
    
    // Filtrar apenas operadores com dados válidos
    const operadoresFiltrados = [...resumoData.operadores].filter(op => {
      // Verificar se o operador existe e tem dados válidos
      if (!op) return false;
      
      // Verificar se tem nome válido (não vazio)
      if (!op.nome || op.nome.trim() === '') return false;
      
      // Manter todos operadores com nome, independente dos valores
      return true;
    });
    
    // Ordenar os operadores filtrados por nome
    return operadoresFiltrados.sort((a, b) => {
      if (!a || !b) return 0;
      if (!a.nome) return 1;  // Coloca itens sem nome no final
      if (!b.nome) return -1; // Coloca itens sem nome no final
      return a.nome.localeCompare(b.nome);
    });
  }, [resumoData.operadores]);

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" textAlign="center" mb={4}>
        Resumo do Relatório de Colheita
      </Text>
      
      {/* Cards de Colhedoras */}
      <SimpleGrid columns={4} spacing={4} mb={4}>
        {resumoData.tdh && (
          <Card>
            <CardBody>
              <Text fontSize="sm" fontWeight="bold">TDH</Text>
              <Text fontSize="lg">{calcularMediaFrota(resumoData.tdh.data).toFixed(2)} t/h</Text>
              <Text fontSize="xs" color={calcularMediaFrota(resumoData.tdh.data) >= resumoData.tdh.meta ? "green.500" : "red.500"}>
                Meta: {resumoData.tdh.meta} t/h
              </Text>
            </CardBody>
          </Card>
        )}
        {resumoData.diesel && (
          <Card>
            <CardBody>
              <Text fontSize="sm" fontWeight="bold">Consumo de Diesel</Text>
              <Text fontSize="lg">{calcularMediaFrota(resumoData.diesel.data).toFixed(2)} L/h</Text>
              <Text fontSize="xs" color={calcularMediaFrota(resumoData.diesel.data) >= resumoData.diesel.meta ? "green.500" : "red.500"}>
                Meta: {resumoData.diesel.meta} L/h
              </Text>
            </CardBody>
          </Card>
        )}
        {resumoData.disponibilidadeMecanica && (
          <Card>
            <CardBody>
              <Text fontSize="sm" fontWeight="bold">Disponibilidade Mecânica</Text>
              <Text fontSize="lg">{calcularMediaFrota(resumoData.disponibilidadeMecanica.data).toFixed(2)}%</Text>
              <Text fontSize="xs" color={calcularMediaFrota(resumoData.disponibilidadeMecanica.data) >= resumoData.disponibilidadeMecanica.meta ? "green.500" : "red.500"}>
                Meta: {resumoData.disponibilidadeMecanica.meta}%
              </Text>
            </CardBody>
          </Card>
        )}
        {resumoData.impurezaVegetal && (
          <Card>
            <CardBody>
              <Text fontSize="sm" fontWeight="bold">Impureza Vegetal</Text>
              <Text fontSize="lg">{calcularMediaFrota(resumoData.impurezaVegetal.data).toFixed(2)}%</Text>
              <Text fontSize="xs" color={calcularMediaFrota(resumoData.impurezaVegetal.data) >= resumoData.impurezaVegetal.meta ? "green.500" : "red.500"}>
                Meta: {resumoData.impurezaVegetal.meta}%
              </Text>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>
      
      {/* Cards de Operadores */}
      <SimpleGrid columns={4} spacing={4} mb={4}>
        {/* Disponibilidade Mecânica */}
        <GridItem>
          <Box 
            bg="white" 
            p={3}
            border="1px solid black"
            borderRadius="md"
          >
            <Text fontSize="sm" fontWeight="bold" mb={2} color="black">Disponibilidade Mecânica</Text>
            <Flex direction="column" gap={1}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text color="black" fontSize="sm">Meta</Text>
                  <Text fontWeight="bold" color="green.500">{formatarPorcentagem(resumoData.disponibilidadeMecanica.meta, 0)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(resumoData.disponibilidadeMecanica.media, resumoData.disponibilidadeMecanica.meta)}
                  >
                    {formatarPorcentagem(resumoData.disponibilidadeMecanica.media, 1)}
                  </Text>
                </Box>
              </Flex>
              {resumoData.disponibilidadeMecanica.acimaMeta && (
                <Text 
                  fontSize="xs" 
                  textAlign="center" 
                  color={getPercentualColor(resumoData.disponibilidadeMecanica.acimaMeta.percentual)}
                >
                  {resumoData.disponibilidadeMecanica.acimaMeta.quantidade} de {resumoData.disponibilidadeMecanica.acimaMeta.total} 
                  {" "}atingiram a meta ({formatarPorcentagem(resumoData.disponibilidadeMecanica.acimaMeta.percentual, 0)})
                </Text>
              )}
            </Flex>
          </Box>
        </GridItem>
        
        {/* Eficiência Energética */}
        <GridItem>
          <Box 
            bg="white" 
            p={3}
            border="1px solid black"
            borderRadius="md"
          >
            <Text fontSize="sm" fontWeight="bold" mb={2} color="black">Eficiência Energética</Text>
            <Flex direction="column" gap={1}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text color="black" fontSize="sm">Meta</Text>
                  <Text fontWeight="bold" color="green.500">{formatarPorcentagem(resumoData.eficienciaEnergetica.meta, 0)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(resumoData.eficienciaEnergetica.media, resumoData.eficienciaEnergetica.meta)}
                  >
                    {formatarPorcentagem(resumoData.eficienciaEnergetica.media, 0)}
                  </Text>
                </Box>
              </Flex>
              {resumoData.eficienciaEnergetica.acimaMeta && (
                <Text 
                  fontSize="xs" 
                  textAlign="center" 
                  color={getPercentualColor(resumoData.eficienciaEnergetica.acimaMeta.percentual)}
                >
                  {resumoData.eficienciaEnergetica.acimaMeta.quantidade} de {resumoData.eficienciaEnergetica.acimaMeta.total} 
                  {" "}atingiram a meta ({formatarPorcentagem(resumoData.eficienciaEnergetica.acimaMeta.percentual, 0)})
                </Text>
              )}
            </Flex>
          </Box>
        </GridItem>
        
        {/* Motor Ocioso */}
        <GridItem>
          <Box 
            bg="white" 
            p={3}
            border="1px solid black"
            borderRadius="md"
          >
            <Text fontSize="sm" fontWeight="bold" mb={2} color="black">Motor Ocioso</Text>
            <Flex direction="column" gap={1}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text color="black" fontSize="sm">Meta</Text>
                  <Text fontWeight="bold" color="green.500">{formatarPorcentagem(resumoData.motorOcioso.meta, 0)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(resumoData.motorOcioso.media, resumoData.motorOcioso.meta, true)}
                  >
                    {formatarPorcentagem(resumoData.motorOcioso.media, 1)}
                  </Text>
                </Box>
              </Flex>
              {resumoData.motorOcioso.acimaMeta && (
                <Text 
                  fontSize="xs" 
                  textAlign="center" 
                  color={getPercentualColor(resumoData.motorOcioso.acimaMeta.percentual)}
                >
                  {resumoData.motorOcioso.acimaMeta.quantidade} de {resumoData.motorOcioso.acimaMeta.total} 
                  {" "}atingiram a meta ({formatarPorcentagem(resumoData.motorOcioso.acimaMeta.percentual, 0)})
                </Text>
              )}
            </Flex>
          </Box>
        </GridItem>
        
        {/* Horas Elevador */}
        <GridItem>
          <Box 
            bg="white" 
            p={3}
            border="1px solid black"
            borderRadius="md"
          >
            <Text fontSize="sm" fontWeight="bold" mb={2} color="black">Horas Elevador</Text>
            <Flex direction="column" gap={1}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text color="black" fontSize="sm">Meta</Text>
                  <Text fontWeight="bold" color="green.500">{formatHoras(resumoData.horaElevador.meta || 5)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(resumoData.horaElevador.media, resumoData.horaElevador.meta || 5)}
                  >
                    {formatHoras(resumoData.horaElevador.media)}
                  </Text>
                </Box>
              </Flex>
              {resumoData.horaElevador.acimaMeta && (
                <Text 
                  fontSize="xs" 
                  textAlign="center" 
                  color={getPercentualColor(resumoData.horaElevador.acimaMeta.percentual)}
                >
                  {resumoData.horaElevador.acimaMeta.quantidade} de {resumoData.horaElevador.acimaMeta.total} 
                  {" "}atingiram a meta ({formatarPorcentagem(resumoData.horaElevador.acimaMeta.percentual, 0)})
                </Text>
              )}
            </Flex>
          </Box>
        </GridItem>
        
        {/* Uso GPS */}
        <GridItem>
          <Box 
            bg="white" 
            p={3}
            border="1px solid black"
            borderRadius="md"
          >
            <Text fontSize="sm" fontWeight="bold" mb={2} color="black">Uso GPS</Text>
            <Flex direction="column" gap={1}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text color="black" fontSize="sm">Meta</Text>
                  <Text fontWeight="bold" color="green.500">{formatarPorcentagem(resumoData.usoGPS.meta, 0)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(resumoData.usoGPS.media, resumoData.usoGPS.meta)}
                  >
                    {formatarPorcentagem(resumoData.usoGPS.media, 1)}
                  </Text>
                </Box>
              </Flex>
              <Text 
                fontSize="xs" 
                textAlign="center" 
                color={getPercentualColor(resumoData.usoGPS.acimaMeta.percentual)}
              >
                {resumoData.usoGPS.acimaMeta.quantidade} de {resumoData.usoGPS.acimaMeta.total} 
                {" "}atingiram a meta ({formatarPorcentagem(resumoData.usoGPS.acimaMeta.percentual, 0)})
              </Text>
            </Flex>
          </Box>
        </GridItem>
      </SimpleGrid>
      
      {/* Tabela de Colhedoras */}
      {(resumoData.tdh || resumoData.diesel || resumoData.disponibilidadeMecanica || resumoData.impurezaVegetal) && (
        <Box mb={4}>
          <Heading size="sm" mb={2}>Resumo por Colhedora</Heading>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Frota</Th>
                  {resumoData.tdh && <Th>TDH (t/h)</Th>}
                  {resumoData.diesel && <Th>Diesel (L/h)</Th>}
                  {resumoData.disponibilidadeMecanica && <Th>Disp. Mec. (%)</Th>}
                  {resumoData.impurezaVegetal && <Th>Impureza (%)</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {obterFrotas(resumoData).map((frota) => (
                  <Tr key={frota}>
                    <Td>{frota}</Td>
                    {resumoData.tdh && (
                      <Td color={getValorFrota(resumoData.tdh.data, frota) >= resumoData.tdh.meta ? "green.500" : "red.500"}>
                        {getValorFrota(resumoData.tdh.data, frota).toFixed(2)}
                      </Td>
                    )}
                    {resumoData.diesel && (
                      <Td color={getValorFrota(resumoData.diesel.data, frota) >= resumoData.diesel.meta ? "green.500" : "red.500"}>
                        {getValorFrota(resumoData.diesel.data, frota).toFixed(2)}
                      </Td>
                    )}
                    {resumoData.disponibilidadeMecanica && (
                      <Td color={getValorFrota(resumoData.disponibilidadeMecanica.data, frota) >= resumoData.disponibilidadeMecanica.meta ? "green.500" : "red.500"}>
                        {getValorFrota(resumoData.disponibilidadeMecanica.data, frota).toFixed(2)}
                      </Td>
                    )}
                    {resumoData.impurezaVegetal && (
                      <Td color={getValorFrota(resumoData.impurezaVegetal.data, frota) >= resumoData.impurezaVegetal.meta ? "green.500" : "red.500"}>
                        {getValorFrota(resumoData.impurezaVegetal.data, frota).toFixed(2)}
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tabela de Operadores */}
      <Box 
        border="1px solid black"
        borderRadius="md"
        mb={4}
        overflowX="auto"
      >
        <Table size="xs" variant="simple">
          <Thead>
            <Tr bg="gray.50">
              <Th width="70px" color="black" fontSize="11px" py={1} textAlign="center">ID</Th>
              <Th color="black" fontSize="11px" py={1} textAlign="center">OPERADOR</Th>
              <Th color="black" fontSize="11px" py={1} textAlign="center">EFICIÊNCIA</Th>
              <Th color="black" fontSize="11px" py={1} textAlign="center">MOTOR OCIOSO</Th>
              <Th color="black" fontSize="11px" py={1} textAlign="center">HORAS ELEVADOR</Th>
              <Th color="black" fontSize="11px" py={1} textAlign="center">USO GPS</Th>
            </Tr>
          </Thead>
          <Tbody>
            {operadoresOrdenados.map((operador, index) => (
              <Tr key={index} bg={index % 2 === 0 ? "white" : "gray.50"}>
                <Td fontWeight="medium" color="black" fontSize="10px" py={0.5}>
                  {operador?.id || ""}
                </Td>
                <Td fontWeight="medium" color="black" fontSize="10px" py={0.5}>
                  {operador?.nome || ""}
                </Td>
                <Td 
                  fontWeight="bold" 
                  color={getStatusColor(operador?.eficiencia || 0, resumoData.eficienciaEnergetica.meta)}
                  fontSize="10px"
                  py={0.5}
                  textAlign="center"
                >
                  {formatarPorcentagem(operador?.eficiencia || 0, 0)}
                </Td>
                <Td 
                  fontWeight="bold" 
                  color={getStatusColor(operador?.motorOcioso || 0, resumoData.motorOcioso.meta, true)}
                  fontSize="10px"
                  py={0.5}
                  textAlign="center"
                >
                  {formatarPorcentagem(operador?.motorOcioso || 0, 1)}
                </Td>
                <Td 
                  fontWeight="bold" 
                  color={getStatusColor(operador?.horaElevador || 0, resumoData.horaElevador.meta || 5)}
                  fontSize="10px"
                  py={0.5}
                  textAlign="center"
                >
                  {formatHoras(operador?.horaElevador || 0)}
                </Td>
                <Td 
                  fontWeight="bold" 
                  color={getStatusColor(operador?.usoGPS || 0, resumoData.usoGPS.meta)}
                  fontSize="10px"
                  py={0.5}
                  textAlign="center"
                >
                  {formatarPorcentagem(operador?.usoGPS || 0, 1)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}; 