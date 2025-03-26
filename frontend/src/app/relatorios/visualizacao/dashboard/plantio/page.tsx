'use client';

import { useState } from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Select, 
  Input, 
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Heading,
} from '@chakra-ui/react';
import DashboardLayout from '@/components/Layout/DashboardLayout';

export default function PlantioDashboard() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [selectedFrente, setSelectedFrente] = useState('');

  const FilterComponent = () => (
    <Flex gap={4} wrap="wrap">
      <Box minW="200px">
        <Input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          placeholder="Data Inicial"
        />
      </Box>
      <Box minW="200px">
        <Input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          placeholder="Data Final"
        />
      </Box>
      <Box minW="200px">
        <Select
          value={selectedFrente}
          onChange={(e) => setSelectedFrente(e.target.value)}
          placeholder="Selecione a Frente"
        >
          <option value="frente1">Frente 1</option>
          <option value="frente2">Frente 2</option>
          <option value="frente3">Frente 3</option>
        </Select>
      </Box>
    </Flex>
  );

  return (
    <DashboardLayout filters={<FilterComponent />}>
      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={6}
      >
        {/* Cards de Métricas */}
        <GridItem colSpan={1}>
          <Card>
            <CardHeader>
              <Heading size="sm">Área Total Plantada</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber>1,250 ha</StatNumber>
                <StatHelpText>↑ 23% em relação ao mês anterior</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={1}>
          <Card>
            <CardHeader>
              <Heading size="sm">Velocidade Média</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber>8.5 km/h</StatNumber>
                <StatHelpText>Meta: 8.0 km/h</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={1}>
          <Card>
            <CardHeader>
              <Heading size="sm">Eficiência Operacional</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber>85%</StatNumber>
                <StatHelpText>↑ 5% em relação à meta</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        {/* Gráficos e Mapas */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Card>
            <CardHeader>
              <Heading size="sm">Histórico de Plantio</Heading>
            </CardHeader>
            <CardBody>
              <Box h="300px" bg="gray.100" borderRadius="md">
                {/* Aqui entrará o gráfico de linha temporal */}
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={1}>
          <Card>
            <CardHeader>
              <Heading size="sm">Distribuição por Área</Heading>
            </CardHeader>
            <CardBody>
              <Box h="300px" bg="gray.100" borderRadius="md">
                {/* Aqui entrará o gráfico de pizza */}
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        {/* Mapa Interativo */}
        <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
          <Card>
            <CardHeader>
              <Heading size="sm">Mapa de Operações</Heading>
            </CardHeader>
            <CardBody>
              <Box h="400px" bg="gray.100" borderRadius="md">
                {/* Aqui entrará o mapa interativo */}
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </DashboardLayout>
  );
} 