import React from 'react';
import { Box, Text, Flex, Grid, GridItem, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

interface ResumoData {
  disponibilidadeMecanica: {
    meta: number;
    media: number;
    acimaMeta?: {
      quantidade: number;
      total: number;
      percentual: number;
    };
  };
  eficienciaEnergetica: {
    meta: number;
    media: number;
    acimaMeta?: {
      quantidade: number;
      total: number;
      percentual: number;
    };
  };
  motorOcioso: {
    meta: number;
    media: number;
    acimaMeta?: {
      quantidade: number;
      total: number;
      percentual: number;
    };
  };
  horasElevador: {
    total: number;
    media: number;
    meta?: number;
    acimaMeta?: {
      quantidade: number;
      total: number;
      percentual: number;
    };
  };
  usoGPS: {
    meta: number;
    media: number;
    acimaMeta: {
      quantidade: number;
      total: number;
      percentual: number;
    };
  };
  operadores?: Array<{
    id: string;
    nome: string;
    eficiencia: number;
    motorOcioso: number;
    horasElevador: number;
    usoGPS: number;
  }>;
}

interface RelatorioColheitaResumoProps {
  data?: ResumoData;
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
  horasElevador: {
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
  const horasInteiras = Math.floor(horas);
  const minutos = Math.round((horas - horasInteiras) * 60);
  return `${horasInteiras}h${minutos > 0 ? ` ${minutos}m` : ''}`;
};

// Função para formatar percentuais com vírgula
const formatarPorcentagem = (valor: number, casasDecimais: number = 1) => {
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

export const RelatorioColheitaResumo: React.FC<RelatorioColheitaResumoProps> = ({ 
  data = defaultData 
}) => {
  // Ordenar operadores por nome (ordem crescente)
  const operadoresOrdenados = React.useMemo(() => {
    if (!data.operadores) return [];
    return [...data.operadores].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [data.operadores]);

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" textAlign="center" mb={4}>
        Resumo do Relatório de Colheita
      </Text>
      
      {/* Cards Simplificados */}
      <Grid 
        templateColumns="repeat(3, 1fr)" 
        gap={4}
        mb={6}
      >
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
                  <Text fontWeight="bold" color="green.500">{formatarPorcentagem(data.disponibilidadeMecanica.meta, 0)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(data.disponibilidadeMecanica.media, data.disponibilidadeMecanica.meta)}
                  >
                    {formatarPorcentagem(data.disponibilidadeMecanica.media, 1)}
                  </Text>
                </Box>
              </Flex>
              {data.disponibilidadeMecanica.acimaMeta && (
                <Text 
                  fontSize="xs" 
                  textAlign="center" 
                  color={getPercentualColor(data.disponibilidadeMecanica.acimaMeta.percentual)}
                >
                  {data.disponibilidadeMecanica.acimaMeta.quantidade} de {data.disponibilidadeMecanica.acimaMeta.total} 
                  {" "}atingiram a meta ({formatarPorcentagem(data.disponibilidadeMecanica.acimaMeta.percentual, 0)})
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
                  <Text fontWeight="bold" color="green.500">{formatarPorcentagem(data.eficienciaEnergetica.meta, 0)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(data.eficienciaEnergetica.media, data.eficienciaEnergetica.meta)}
                  >
                    {formatarPorcentagem(data.eficienciaEnergetica.media, 0)}
                  </Text>
                </Box>
              </Flex>
              {data.eficienciaEnergetica.acimaMeta && (
                <Text 
                  fontSize="xs" 
                  textAlign="center" 
                  color={getPercentualColor(data.eficienciaEnergetica.acimaMeta.percentual)}
                >
                  {data.eficienciaEnergetica.acimaMeta.quantidade} de {data.eficienciaEnergetica.acimaMeta.total} 
                  {" "}atingiram a meta ({formatarPorcentagem(data.eficienciaEnergetica.acimaMeta.percentual, 0)})
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
                  <Text fontWeight="bold" color="green.500">{formatarPorcentagem(data.motorOcioso.meta, 0)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(data.motorOcioso.media, data.motorOcioso.meta, true)}
                  >
                    {formatarPorcentagem(data.motorOcioso.media, 1)}
                  </Text>
                </Box>
              </Flex>
              {data.motorOcioso.acimaMeta && (
                <Text 
                  fontSize="xs" 
                  textAlign="center" 
                  color={getPercentualColor(data.motorOcioso.acimaMeta.percentual)}
                >
                  {data.motorOcioso.acimaMeta.quantidade} de {data.motorOcioso.acimaMeta.total} 
                  {" "}atingiram a meta ({formatarPorcentagem(data.motorOcioso.acimaMeta.percentual, 0)})
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
                  <Text fontWeight="bold" color="green.500">{formatHoras(data.horasElevador.meta || 5)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(data.horasElevador.media, data.horasElevador.meta || 5)}
                  >
                    {formatHoras(data.horasElevador.media)}
                  </Text>
                </Box>
              </Flex>
              {data.horasElevador.acimaMeta && (
                <Text 
                  fontSize="xs" 
                  textAlign="center" 
                  color={getPercentualColor(data.horasElevador.acimaMeta.percentual)}
                >
                  {data.horasElevador.acimaMeta.quantidade} de {data.horasElevador.acimaMeta.total} 
                  {" "}atingiram a meta ({formatarPorcentagem(data.horasElevador.acimaMeta.percentual, 0)})
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
                  <Text fontWeight="bold" color="green.500">{formatarPorcentagem(data.usoGPS.meta, 0)}</Text>
                </Box>
                <Box>
                  <Text color="black" fontSize="sm">Média</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getStatusColor(data.usoGPS.media, data.usoGPS.meta)}
                  >
                    {formatarPorcentagem(data.usoGPS.media, 1)}
                  </Text>
                </Box>
              </Flex>
              <Text 
                fontSize="xs" 
                textAlign="center" 
                color={getPercentualColor(data.usoGPS.acimaMeta.percentual)}
              >
                {data.usoGPS.acimaMeta.quantidade} de {data.usoGPS.acimaMeta.total} 
                {" "}atingiram a meta ({formatarPorcentagem(data.usoGPS.acimaMeta.percentual, 0)})
              </Text>
            </Flex>
          </Box>
        </GridItem>
      </Grid>
      
      {/* Tabela com dados dos operadores */}
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
                  {operador.id}
                </Td>
                <Td fontWeight="medium" color="black" fontSize="10px" py={0.5}>
                  {operador.nome}
                </Td>
                <Td 
                  fontWeight="bold" 
                  color={getStatusColor(operador.eficiencia, data.eficienciaEnergetica.meta)}
                  fontSize="10px"
                  py={0.5}
                  textAlign="center"
                >
                  {formatarPorcentagem(operador.eficiencia, 0)}
                </Td>
                <Td 
                  fontWeight="bold" 
                  color={getStatusColor(operador.motorOcioso, data.motorOcioso.meta, true)}
                  fontSize="10px"
                  py={0.5}
                  textAlign="center"
                >
                  {formatarPorcentagem(operador.motorOcioso, 1)}
                </Td>
                <Td 
                  fontWeight="bold" 
                  color={getStatusColor(operador.horasElevador, data.horasElevador.meta || 5)}
                  fontSize="10px"
                  py={0.5}
                  textAlign="center"
                >
                  {formatHoras(operador.horasElevador)}
                </Td>
                <Td 
                  fontWeight="bold" 
                  color={getStatusColor(operador.usoGPS, data.usoGPS.meta)}
                  fontSize="10px"
                  py={0.5}
                  textAlign="center"
                >
                  {formatarPorcentagem(operador.usoGPS, 1)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}; 