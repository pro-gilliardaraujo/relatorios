import React from 'react';
import { Box, Text, Flex, Grid, GridItem, Table, Thead, Tbody, Tr, Th, Td, SimpleGrid, Card, CardBody, Heading, TableContainer, VStack } from '@chakra-ui/react';

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

export interface MetricData {
  data: any[];
  meta: number;
  media: number;
  acimaMeta?: {
    quantidade: number;
    total: number;
    percentual: number;
  };
}

export interface FrotaData {
  id: string;
  tdh: number;
  diesel: number;
  disponibilidade: number;
  impureza: number;
}

export interface OperadorData {
  id: string;
  eficiencia: number;
  horasElevador: number;
  motorOcioso: number;
  usoGPS: number;
}

export interface ResumoData {
  tdh?: MetricData;
  diesel?: MetricData;
  impurezaVegetal?: MetricData;
  disponibilidadeMecanica: MetricData;
  eficienciaEnergetica: MetricData;
  horaElevador: MetricData;
  motorOcioso: MetricData;
  usoGPS: MetricData;
  frotas: FrotaData[];
  operadores: OperadorData[];
}

interface RelatorioColheitaDiarioResumoProps {
  data: ResumoData;
  showFrotasOnly?: boolean;
  showOperadoresOnly?: boolean;
}

const defaultData: ResumoData = {
  tdh: {
    data: [],
    meta: 0.01,
    media: 0,
  },
  diesel: {
    data: [],
    meta: 0.08,
    media: 0,
  },
  impurezaVegetal: {
    data: [],
    meta: 65,
    media: 0,
  },
  disponibilidadeMecanica: {
    data: [],
    meta: 90,
    media: 85.3,
    acimaMeta: {
      quantidade: 1,
      total: 2,
      percentual: 50
    }
  },
  eficienciaEnergetica: {
    data: [],
    meta: 45,
    media: 51,
    acimaMeta: {
      quantidade: 5,
      total: 9,
      percentual: 56
    }
  },
  motorOcioso: {
    data: [],
    meta: 25,
    media: 29.4,
    acimaMeta: {
      quantidade: 3,
      total: 9,
      percentual: 33
    }
  },
  horaElevador: {
    data: [],
    meta: 5,
    media: 4.97,
    acimaMeta: {
      quantidade: 4,
      total: 9,
      percentual: 44
    }
  },
  usoGPS: {
    data: [],
    meta: 90,
    media: 62.9,
    acimaMeta: {
      quantidade: 3,
      total: 9,
      percentual: 33
    }
  },
  frotas: [],
  operadores: []
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

const TabelaOperadores = ({ data }: { data: ResumoData }) => {
  // Validação para garantir que data.operadores existe
  if (!data?.operadores || data.operadores.length === 0) {
    return (
      <Box borderWidth="1px" borderColor="black">
        <Table variant="unstyled" size="sm">
          <Thead>
            <Tr>
              <Th p={2} color="black" borderRightWidth="1px" borderBottomWidth="1px" borderColor="black">OPERADOR</Th>
              <Th p={2} color="black" borderRightWidth="1px" borderBottomWidth="1px" borderColor="black" textAlign="center">EFICIÊNCIA</Th>
              <Th p={2} color="black" borderRightWidth="1px" borderBottomWidth="1px" borderColor="black" textAlign="center">MOTOR OCIOSO</Th>
              <Th p={2} color="black" borderRightWidth="1px" borderBottomWidth="1px" borderColor="black" textAlign="center">HORAS ELEVADOR</Th>
              <Th p={2} color="black" borderBottomWidth="1px" borderColor="black" textAlign="center">USO GPS</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={5} textAlign="center" color="gray.500">Nenhum dado disponível</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    );
  }

  const getColorByMeta = (valor: number, meta: number, isMotorOcioso: boolean = false) => {
    // Para motor ocioso, menor é melhor (abaixo da meta é bom)
    if (isMotorOcioso) {
      return valor <= meta ? "green.500" : "red.500"; 
    }
    // Para os outros, maior é melhor (acima da meta é bom)
    return valor >= meta ? "green.500" : "red.500";
  };

  // Função especial para as horas do elevador
  const getHorasElevadorColor = (horas: number, meta: number) => {
    if (horas >= meta) return "green.500"; // Atingiu ou superou a meta
    
    // Calcula a diferença em minutos
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    const metaHorasInteiras = Math.floor(meta);
    const metaMinutos = Math.round((meta - metaHorasInteiras) * 60);
    
    const totalMinutosValor = horasInteiras * 60 + minutos;
    const totalMinutosMeta = metaHorasInteiras * 60 + metaMinutos;
    
    // Se estiver a menos de 30 minutos da meta
    if (totalMinutosMeta - totalMinutosValor <= 30) return "yellow.500";
    
    return "red.500"; // Mais de 30 minutos abaixo da meta
  };

  return (
    <Box borderWidth="1px" borderColor="black">
      <Table variant="unstyled" size="sm">
        <Thead>
          <Tr>
            <Th p={2} color="black" borderRightWidth="1px" borderBottomWidth="1px" borderColor="black" bg="gray.100">OPERADOR</Th>
            <Th p={2} color="black" borderRightWidth="1px" borderBottomWidth="1px" borderColor="black" textAlign="center" bg="gray.100">EFICIÊNCIA</Th>
            <Th p={2} color="black" borderRightWidth="1px" borderBottomWidth="1px" borderColor="black" textAlign="center" bg="gray.100">MOTOR OCIOSO</Th>
            <Th p={2} color="black" borderRightWidth="1px" borderBottomWidth="1px" borderColor="black" textAlign="center" bg="gray.100">HORAS ELEVADOR</Th>
            <Th p={2} color="black" borderBottomWidth="1px" borderColor="black" textAlign="center" bg="gray.100">USO GPS</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.operadores.map((operador, index) => (
            <Tr key={operador.id} bg={index % 2 === 0 ? "white" : "gray.50"}>
              <Td p={2} color="black" borderRightWidth="1px" borderBottomWidth={index === data.operadores.length - 1 ? "0" : "1px"} borderColor="black">
                {operador.id}
              </Td>
              <Td p={2} textAlign="center" borderRightWidth="1px" borderBottomWidth={index === data.operadores.length - 1 ? "0" : "1px"} borderColor="black"
                  color={getColorByMeta(operador.eficiencia, data.eficienciaEnergetica.meta)}>
                {operador.eficiencia.toFixed(0)}%
              </Td>
              <Td p={2} textAlign="center" borderRightWidth="1px" borderBottomWidth={index === data.operadores.length - 1 ? "0" : "1px"} borderColor="black"
                  color={getColorByMeta(operador.motorOcioso, data.motorOcioso.meta, true)}>
                {operador.motorOcioso.toFixed(1)}%
              </Td>
              <Td p={2} textAlign="center" borderRightWidth="1px" borderBottomWidth={index === data.operadores.length - 1 ? "0" : "1px"} borderColor="black"
                  color={getHorasElevadorColor(operador.horasElevador, data.horaElevador.meta)}>
                {formatHoras(operador.horasElevador)}
              </Td>
              <Td p={2} textAlign="center" borderBottomWidth={index === data.operadores.length - 1 ? "0" : "1px"} borderColor="black"
                  color={getColorByMeta(operador.usoGPS, data.usoGPS.meta)}>
                {operador.usoGPS.toFixed(1)}%
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

const MetricCard = ({ title, meta, media, acimaMeta }: { 
  title: string;
  meta: number;
  media: number;
  acimaMeta?: { quantidade: number; total: number; percentual: number };
}) => {
  // Determina se o valor está dentro da meta 
  const isWithinMeta = title === "Motor Ocioso" ? media <= meta : media >= meta;
  const mediaColor = isWithinMeta ? "green.500" : "red.500";
  
  return (
    <Card variant="outline" borderWidth="1px" borderColor="black" bg="white">
      <CardBody p={3}>
        <VStack spacing={1} align="stretch">
          <Heading size="xs" color="black" mb={1}>{title}</Heading>
          <Flex justify="space-between" mb={1}>
            <Box>
              <Text fontSize="xs" color="black">Meta</Text>
              <Text fontSize="md" color="green.500" fontWeight="bold">{meta}%</Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="xs" color="black">Média</Text>
              <Text fontSize="md" color={mediaColor} fontWeight="bold">
                {media.toFixed(1)}%
              </Text>
            </Box>
          </Flex>
          {acimaMeta && (
            <Text fontSize="xs" color={acimaMeta.percentual > 0 ? "green.500" : "red.500"} textAlign="center" noOfLines={1}>
              {acimaMeta.quantidade} de {acimaMeta.total} atingiram a meta ({acimaMeta.percentual.toFixed(0)}%)
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const HorasElevadorCard = ({ title, meta, media, acimaMeta }: {
  title: string;
  meta: number;
  media: number;
  acimaMeta?: { quantidade: number; total: number; percentual: number };
}) => {
  // Determina a cor baseada na diferença de tempo
  let mediaColor = "red.500";
  if (media >= meta) {
    mediaColor = "green.500";  // Atingiu ou superou a meta
  } else {
    // Calcula a diferença em minutos
    const horasInteiras = Math.floor(media);
    const minutos = Math.round((media - horasInteiras) * 60);
    const metaHorasInteiras = Math.floor(meta);
    const metaMinutos = Math.round((meta - metaHorasInteiras) * 60);
    
    const totalMinutosValor = horasInteiras * 60 + minutos;
    const totalMinutosMeta = metaHorasInteiras * 60 + metaMinutos;
    
    // Se estiver a menos de 30 minutos da meta
    if (totalMinutosMeta - totalMinutosValor <= 30) {
      mediaColor = "yellow.500";
    }
  }
  
  return (
    <Card variant="outline" borderWidth="1px" borderColor="black" bg="white">
      <CardBody p={3}>
        <VStack spacing={1} align="stretch">
          <Heading size="xs" color="black" mb={1}>{title}</Heading>
          <Flex justify="space-between" mb={1}>
            <Box>
              <Text fontSize="xs" color="black">Meta</Text>
              <Text fontSize="md" color="green.500" fontWeight="bold">{meta}h</Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="xs" color="black">Média</Text>
              <Text fontSize="md" color={mediaColor} fontWeight="bold">
                {formatHoras(media)}
              </Text>
            </Box>
          </Flex>
          {acimaMeta && (
            <Text fontSize="xs" color={acimaMeta.percentual > 0 ? "green.500" : "red.500"} textAlign="center" noOfLines={1}>
              {acimaMeta.quantidade} de {acimaMeta.total} atingiram a meta ({acimaMeta.percentual.toFixed(0)}%)
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const RelatorioColheitaDiarioResumo: React.FC<RelatorioColheitaDiarioResumoProps> = ({ 
  data = defaultData,
  showFrotasOnly = false,
  showOperadoresOnly = false
}) => {
  // Validação adicional para garantir que data existe
  if (!data) {
    return <Box p={4}>Nenhum dado disponível para exibição</Box>;
  }

  return (
    <Box>
      <VStack spacing={3} align="stretch">
        {/* Se showOperadoresOnly=true, mostra apenas a tabela de operadores */}
        {showOperadoresOnly && (
          <TableContainer>
            <TabelaOperadores data={data} />
          </TableContainer>
        )}
        
        {/* Se nenhum dos dois, mostra tudo */}
        {!showFrotasOnly && !showOperadoresOnly && (
          <>
            {/* Cards de Métricas */}
            <SimpleGrid columns={[1, 2, 3]} spacing={3} mb={3}>
              <MetricCard
                title="Disponibilidade Mecânica"
                meta={data.disponibilidadeMecanica.meta}
                media={data.disponibilidadeMecanica.media}
                acimaMeta={data.disponibilidadeMecanica.acimaMeta}
              />
              <MetricCard
                title="Eficiência Energética"
                meta={data.eficienciaEnergetica.meta}
                media={data.eficienciaEnergetica.media}
                acimaMeta={data.eficienciaEnergetica.acimaMeta}
              />
              <MetricCard
                title="Motor Ocioso"
                meta={data.motorOcioso.meta}
                media={data.motorOcioso.media}
                acimaMeta={data.motorOcioso.acimaMeta}
              />
              <HorasElevadorCard
                title="Horas Elevador"
                meta={data.horaElevador.meta}
                media={data.horaElevador.media}
                acimaMeta={data.horaElevador.acimaMeta}
              />
              <MetricCard
                title="Uso GPS"
                meta={data.usoGPS.meta}
                media={data.usoGPS.media}
                acimaMeta={data.usoGPS.acimaMeta}
              />
            </SimpleGrid>
            
            <TableContainer>
              <TabelaOperadores data={data} />
            </TableContainer>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default RelatorioColheitaDiarioResumo; 