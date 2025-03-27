import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Cell,
} from 'recharts';

/**
 * Estrutura dos dados para o gráfico de tempo parado
 */
interface TempoParadoData {
  /** Nome/ID da máquina */
  name: string;
  /** Quantidade de horas em formato decimal */
  hours: number;
  /** Tempo formatado em HH:MM:SS */
  timeString: string;
  /** Nome da operação */
  operacao: string;
  /** Grupo da operação */
  grupo: string;
}

/**
 * Props do componente GraficoTempoParado
 */
interface GraficoTempoParadoProps {
  /** Array com os dados das máquinas */
  data: TempoParadoData[];
  
  /** Configurações de customização do gráfico */
  options?: {
    /** 
     * Dimensões e posicionamento do gráfico
     */
    width?: number;
    height?: number;
    marginTop?: number;
    
    /** 
     * Margens internas do gráfico
     */
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    
    /** 
     * Estilização das barras do gráfico
     */
    barStyle?: {
      fill?: string;
      radius?: [number, number, number, number];
      maxBarSize?: number;
    };
    
    /** 
     * Configurações do eixo X (máquinas)
     */
    xAxis?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      angle?: number;
      textAnchor?: 'start' | 'middle' | 'end';
      height?: number;
      fill?: string;
      verticalOffset?: number;
    };
    
    /** 
     * Configurações do eixo Y (valores de tempo)
     */
    yAxis?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      width?: number;
      fill?: string;
    };
    
    /** 
     * Configurações dos labels de tempo
     */
    labels?: {
      position?: 'top' | 'center' | 'bottom';
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      fill?: string;
      offset?: number;
    };
    
    /** 
     * Configurações da grade de fundo
     */
    grid?: {
      horizontal?: boolean;
      vertical?: boolean;
      strokeDasharray?: string;
      stroke?: string;
    };

    /** 
     * Configurações do chart
     */
    chart?: {
      barCategoryGap?: number;
      barGap?: number;
      dx?: number;
    };
  };
}

// Helper function to format time axis ticks
const formatYAxisTick = (value: number) => {
  const hours = Math.floor(value);
  const minutes = Math.floor((value - hours) * 60);
  const seconds = Math.floor(((value - hours) * 60 - minutes) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Helper function to calculate axis ticks based on max value
const calculateAxisTicks = (maxValue: number) => {
  // Arredonda para a próxima hora completa
  const maxHour = Math.ceil(maxValue);
  // Gera ticks de hora em hora
  return Array.from({ length: maxHour + 1 }, (_, i) => i);
};

// Valores padrão para as opções - ajustados para o container A4
const defaultOptions = {
  width: 650,
  height: 190,
  marginTop: 0,
  margin: {
    top: 25,
    right: 0,
    left: -10,
    bottom: 35,
  },
  barStyle: {
    fill: '#FF0000', // Vermelho para indicar tempo parado
    radius: [2, 2, 0, 0],
    maxBarSize: 80,
  },
  xAxis: {
    fontSize: 8,
    fontWeight: 'bold',
    angle: 0,
    textAnchor: 'middle',
    height: 10,
    fill: '#666666',
    verticalOffset: 10,
  },
  yAxis: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 55,
    fill: '#666666',
  },
  labels: {
    position: 'top',
    fontSize: 10,
    fontWeight: 'bold',
    fill: '#000000',
    offset: 5,
  },
  grid: {
    horizontal: false,
    vertical: false,
    strokeDasharray: '3 3',
    stroke: '#E5E5E5',
  },
  chart: {
    barCategoryGap: 8,
    barGap: 4,
    dx: -20,
  },
};

export const GraficoTempoParado: React.FC<GraficoTempoParadoProps> = ({ 
  data, 
  options = {} 
}) => {
  // Ordena os dados pelo número da máquina
  const sortedData = [...data].sort((a, b) => Number(a.name) - Number(b.name));

  // Calcula o valor máximo do eixo Y baseado nos dados
  const maxHours = Math.max(...sortedData.map(d => d.hours));
  const yAxisTicks = calculateAxisTicks(maxHours);

  const opts = {
    ...defaultOptions,
    ...options,
    margin: { ...defaultOptions.margin, ...options.margin },
    barStyle: { ...defaultOptions.barStyle, ...options.barStyle },
    xAxis: { ...defaultOptions.xAxis, ...options.xAxis },
    yAxis: { ...defaultOptions.yAxis, ...options.yAxis },
    labels: { ...defaultOptions.labels, ...options.labels },
    grid: { ...defaultOptions.grid, ...options.grid },
    chart: { ...defaultOptions.chart, ...options.chart },
  };

  return (
    <div style={{ 
      width: opts.width, 
      height: opts.height,
      margin: '0 auto',
      position: 'relative',
      marginTop: opts.marginTop,
    }}>
      <BarChart
        width={opts.width}
        height={opts.height - 20}
        data={sortedData}
        margin={opts.margin}
        barCategoryGap={opts.chart.barCategoryGap}
        barGap={opts.chart.barGap}
        layout="horizontal"
      >
        <CartesianGrid 
          strokeDasharray={opts.grid.strokeDasharray}
          horizontal={opts.grid.horizontal}
          vertical={opts.grid.vertical}
          stroke={opts.grid.stroke}
        />
        <XAxis
          dataKey="name"
          tick={(props) => {
            const { x, y, payload } = props;
            return (
              <g transform={`translate(${x + opts.chart.dx},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={opts.xAxis.verticalOffset}
                  textAnchor={opts.xAxis.textAnchor}
                  fill={opts.xAxis.fill}
                  fontSize={opts.xAxis.fontSize}
                  fontWeight={opts.xAxis.fontWeight}
                  transform={`rotate(${opts.xAxis.angle})`}
                >
                  {payload.value}
                </text>
              </g>
            );
          }}
          height={opts.xAxis.height}
          interval={0}
          xAxisId={0}
          tickSize={0}
        />
        <YAxis
          tickFormatter={formatYAxisTick}
          tick={{ 
            fontSize: opts.yAxis.fontSize,
            fontWeight: opts.yAxis.fontWeight,
            fill: opts.yAxis.fill,
          }}
          width={opts.yAxis.width}
          ticks={yAxisTicks}
        />
        <Bar
          dataKey="hours"
          fill={opts.barStyle.fill}
          radius={opts.barStyle.radius as [number, number, number, number]}
          maxBarSize={opts.barStyle.maxBarSize}
          xAxisId={0}
        >
          {sortedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={opts.barStyle.fill}
              style={{
                transform: `translateX(${opts.chart.dx}px)`
              }}
            />
          ))}
          {/* Time labels */}
          <LabelList
            dataKey="timeString"
            position={opts.labels.position as any}
            style={{ 
              fontSize: opts.labels.fontSize,
              fontWeight: opts.labels.fontWeight,
              fill: opts.labels.fill,
              transform: `translateX(${opts.chart.dx}px)`
            }}
            offset={opts.labels.offset}
          />
        </Bar>
      </BarChart>
      {/* Labels como elementos HTML */}
      {sortedData.length > 0 && (
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '15px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div style={{
            fontSize: opts.xAxis.fontSize,
            fontWeight: opts.xAxis.fontWeight,
            color: opts.xAxis.fill,
          }}>
            {sortedData[0].operacao}
          </div>
          <div style={{
            fontSize: opts.xAxis.fontSize,
            fontWeight: opts.xAxis.fontWeight,
            color: opts.xAxis.fill,
          }}>
            {sortedData[0].grupo}
          </div>
        </div>
      )}
    </div>
  );
}; 