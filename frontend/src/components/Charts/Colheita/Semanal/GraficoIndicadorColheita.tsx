import React from 'react';
import { Box } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, LabelList } from 'recharts';
import ChartTitle from '../../ChartTitle';

interface DataPoint {
  frota: string;
  valor: number;
}

interface GraficoIndicadorColheitaProps {
  data: DataPoint[];
  meta: number;
  title: string;
  color: string;
  unit: string;
  fonte: string;
  onFonteChange: (newFonte: string) => void;
  formatValue?: (value: number) => string;
  isInverted?: boolean;
}

export const GraficoIndicadorColheita: React.FC<GraficoIndicadorColheitaProps> = ({
  data,
  meta,
  title,
  color,
  unit,
  fonte,
  onFonteChange,
  formatValue = (value) => `${value.toFixed(2)}${unit}`,
  isInverted = false
}) => {
  const chartData = data.map(item => ({
    frota: item.frota,
    valor: item.valor
  }));

  // Define as cores com base no valor
  const getColor = (value: number) => {
    if (isInverted) {
      // Para métricas onde menor é melhor (TDH, Diesel, Impureza Vegetal)
      if (value <= meta) return '#48BB78'; // verde para abaixo da meta
      if (value <= meta * 1.2) return '#ECC94B'; // amarelo para próximo da meta
      return '#E53E3E'; // vermelho para acima da meta
    } else {
      // Para métricas onde maior é melhor (Disponibilidade, Eficiência, etc)
      if (value >= meta) return '#48BB78'; // verde para acima da meta
      if (value >= meta * 0.8) return '#ECC94B'; // amarelo para próximo da meta
      return '#E53E3E'; // vermelho para abaixo da meta
    }
  };

  return (
    <Box width="100%" height="100%" p={4}>
      <ChartTitle title={title} fonte={fonte} onFonteChange={onFonteChange} />
      <BarChart
        width={500}
        height={300}
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="frota" />
        <YAxis tickFormatter={(value) => formatValue(value)} />
        <Tooltip
          formatter={(value: number) => [formatValue(value), 'Valor']}
          labelFormatter={(label) => `Frota: ${label}`}
        />
        <ReferenceLine y={meta} stroke="rgba(0,0,0,0.7)" strokeDasharray="3 3" />
        <Bar dataKey="valor" fill={color}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColor(entry.valor)}
            />
          ))}
          <LabelList 
            dataKey="valor" 
            position="top" 
            formatter={(value: number) => formatValue(value)}
            style={{ 
              fill: "#000000",
              fontSize: "10px",
              fontWeight: "bold"
            }}
          />
        </Bar>
      </BarChart>
    </Box>
  );
}; 