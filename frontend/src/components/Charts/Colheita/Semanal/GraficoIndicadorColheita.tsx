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
}

export const GraficoIndicadorColheita: React.FC<GraficoIndicadorColheitaProps> = ({
  data,
  meta,
  title,
  color,
  unit,
  fonte,
  onFonteChange,
  formatValue = (value) => `${value.toFixed(2)}${unit}`
}) => {
  const chartData = data.map(item => ({
    frota: item.frota,
    valor: item.valor
  }));

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
        <ReferenceLine y={meta} stroke="red" strokeDasharray="3 3" />
        <Bar dataKey="valor" fill={color}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.valor >= meta ? "green.500" : entry.valor >= meta * 0.8 ? "yellow.500" : "red.500"}
            />
          ))}
          <LabelList 
            dataKey="valor" 
            position="top" 
            formatter={(value: number) => formatValue(value)}
            style={{ 
              fill: (value: number) => value >= meta ? "green.500" : value >= meta * 0.8 ? "yellow.500" : "red.500",
              fontSize: "10px",
              fontWeight: "bold"
            }}
          />
        </Bar>
      </BarChart>
    </Box>
  );
}; 