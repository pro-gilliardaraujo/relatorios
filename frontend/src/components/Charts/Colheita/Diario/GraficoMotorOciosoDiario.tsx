'use client';

import React from 'react';
import { Box, Text, Flex, Center } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { limparIdOperador, formatarExibicaoOperador } from '@/utils/formatters';

interface MotorOciosoData {
  id: string;
  nome: string;
  percentual: number;
  horasOcioso?: number;
  horasTotal?: number;
}

interface MotorOciosoProps {
  data: MotorOciosoData[];
  meta?: number;
}

// Dados padrão para render sem dados
const defaultData = [
  { id: '123', nome: 'Exemplo 1', percentual: 4.5, horasOcioso: 0.5, horasTotal: 3.1 },
  { id: '456', nome: 'Exemplo 2', percentual: 3.2, horasOcioso: 0.7, horasTotal: 3.7 },
];

export const GraficoMotorOciosoDiario: React.FC<MotorOciosoProps> = ({ 
  data = defaultData,
  meta = 5
}) => {
  // Ordena os dados por percentual (do menor para o maior - melhor performance no topo)
  const sortedData = [...data]
    .filter(item => item && item.nome && !['TROCA DE TURNO', 'SEM OPERADOR'].includes(item.nome))
    .sort((a, b) => b.percentual - a.percentual) // Ordenar do maior para o menor
    .map(item => {
      // Limpar o ID do operador e formatar nome para exibição
      const idLimpo = limparIdOperador(item.id);
      const nomeOperador = formatarExibicaoOperador(idLimpo, item.nome);
      
      const horasTotal = item.horasTotal || 24;
      const horasOcioso = item.horasOcioso || (item.percentual / 100) * horasTotal;
      const horasLigado = horasTotal - horasOcioso;
      
      return {
        name: nomeOperador,
        tempoOcioso: Number(horasOcioso.toFixed(1)),
        tempoLigado: Number(horasLigado.toFixed(1)),
        percentual: Number(item.percentual.toFixed(1))
      };
    });

  // Formatar o tooltip
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box bg="white" p={2} borderWidth={1} borderRadius="md" shadow="md">
          <Text fontWeight="bold">{data.name}</Text>
          <Text>Tempo Ocioso: {data.tempoOcioso}h</Text>
          <Text>Tempo Ligado: {data.tempoLigado}h</Text>
          <Text>Percentual: {data.percentual}%</Text>
        </Box>
      );
    }
    return null;
  };

  // Formatar o tick do eixo Y
  const formatYAxis = (value: number) => {
    return `${value}h`;
  };

  return (
    <Box>
      <Flex direction="column" w="100%" h="100%">
        {/* Gráfico */}
        <Center w="100%" h="100%">
          {sortedData.length > 0 ? (
            <BarChart
              width={700}
              height={300}
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              barSize={25}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis 
                type="number"
                tickFormatter={formatYAxis}
                domain={[0, 'auto']}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={renderTooltip} />
              <Bar dataKey="tempoOcioso" stackId="a" fill="#F56565" name="Tempo Ocioso" />
              <Bar dataKey="tempoLigado" stackId="a" fill="#48BB78" name="Tempo Ligado" />
            </BarChart>
          ) : (
            <Text>Sem dados disponíveis</Text>
          )}
        </Center>
      </Flex>
    </Box>
  );
}; 