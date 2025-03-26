import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardBody, Box, Text } from '@chakra-ui/react';

interface OperationalMetricsProps {
  data: {
    state_times: Record<string, number>;
    speed_by_operation: Record<string, number>;
    idle_time: number;
  };
}

export const OperationalMetrics: React.FC<OperationalMetricsProps> = ({ data }) => {
  // Transformar dados para formato do Recharts
  const stateTimeData = Object.entries(data.state_times).map(([state, time]) => ({
    state,
    hours: time
  }));

  const speedData = Object.entries(data.speed_by_operation).map(([operation, speed]) => ({
    operation,
    speed
  }));

  return (
    <Box p={4}>
      {/* Gráfico de Tempo por Estado */}
      <Card mb={4}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">Tempo por Estado Operacional</Text>
        </CardHeader>
        <CardBody>
          <Box height="400px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#2E8B57" name="Horas" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>

      {/* Gráfico de Velocidade por Operação */}
      <Card mb={4}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">Velocidade Média por Operação</Text>
        </CardHeader>
        <CardBody>
          <Box height="400px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="operation" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="speed" fill="#4169E1" name="Velocidade (km/h)" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>

      {/* Indicador de Tempo Ocioso */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">Tempo Motor Ocioso</Text>
        </CardHeader>
        <CardBody>
          <Text fontSize="2xl" fontWeight="bold" color={data.idle_time > 2 ? "red.500" : "green.500"}>
            {data.idle_time.toFixed(2)} horas
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
};

export default OperationalMetrics; 