import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Cell,
  ReferenceLine
} from 'recharts';

/**
 * Estrutura dos dados para o gráfico de disponibilidade mecânica
 */
interface DisponibilidadeMecanicaData {
  /** Nome/ID da máquina */
  name: string;
  /** Porcentagem de disponibilidade */
  percentage: number;
}

/**
 * Props do componente GraficoDisponibilidadeMecanica
 */
interface GraficoDisponibilidadeMecanicaProps {
  /** Array com os dados das máquinas */
  data: DisponibilidadeMecanicaData[];
  
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
      fillAboveTarget?: string;
      fillBelowTarget?: string;
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
     * Configurações do eixo Y (valores em %)
     */
    yAxis?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      width?: number;
      fill?: string;
    };
    
    /** 
     * Configurações dos labels de porcentagem
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
      /** Se true, mostra as linhas horizontais */
      horizontal?: boolean;
      /** Se true, mostra as linhas verticais */
      vertical?: boolean;
      /** Se true, mostra apenas a linha de meta */
      showOnlyTarget?: boolean;
      /** Padrão da linha pontilhada */
      strokeDasharray?: string;
      /** Cor das linhas */
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

    /**
     * Configuração da linha de meta
     */
    targetLine?: {
      stroke?: string;
      strokeWidth?: number;
      strokeDasharray?: string;
    };
  };
}

// Constante para a meta de disponibilidade
const TARGET_PERCENTAGE = 90;

// Helper function para formatar os ticks do eixo Y
const formatYAxisTick = (value: number) => `${value}%`;

// Helper function para formatar os labels das barras
const formatBarLabel = (value: number) => `${value.toFixed(1)}%`;

// Valores padrão para as opções - ajustados para o container A4
const defaultOptions = {
  width: 650,
  height: 200,
  marginTop: 0,
  margin: {
    top: 25,
    right: 0,
    left: -10,
    bottom: 35,
  },
  barStyle: {
    fillAboveTarget: '#009900', // Verde para valores >= meta
    fillBelowTarget: '#FF0000', // Vermelho para valores < meta
    radius: [2, 2, 0, 0],
    maxBarSize: 80,
  },
  chart: {
    barCategoryGap: 8,
    barGap: 4,
    dx: -20,
  },
  xAxis: {
    fontSize: 10,
    fontWeight: 'bold',
    angle: 0,
    textAnchor: 'middle',
    height: 10,
    fill: '#000000',
    verticalOffset: 10,
  },
  yAxis: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 35,
    fill: '#000000',
  },
  labels: {
    position: 'top',
    fontSize: 10,
    fontWeight: 'bold',
    fill: '#000000',
    offset: 5,
  },
  grid: {
    horizontal: true,
    vertical: false,
    showOnlyTarget: false,
    strokeDasharray: '3 3',
    stroke: '#E5E5E5',
  },
  targetLine: {
    stroke: '#000000',
    strokeWidth: 1,
    strokeDasharray: '5 5',
  }
};

export const GraficoDisponibilidadeMecanica: React.FC<GraficoDisponibilidadeMecanicaProps> = ({ 
  data, 
  options = {} 
}) => {
  // Ordena os dados pelo número da máquina
  const sortedData = [...data].sort((a, b) => Number(a.name) - Number(b.name));

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
    targetLine: { ...defaultOptions.targetLine, ...options.targetLine },
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
        {!opts.grid.showOnlyTarget && (
          <CartesianGrid 
            strokeDasharray={opts.grid.strokeDasharray}
            horizontal={opts.grid.horizontal}
            vertical={opts.grid.vertical}
            stroke={opts.grid.stroke}
          />
        )}
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
          domain={[0, 100]}
          ticks={[0, 20, 40, 60, 80, 100]}
        />
        <ReferenceLine
          y={TARGET_PERCENTAGE}
          stroke={opts.targetLine.stroke}
          strokeWidth={opts.targetLine.strokeWidth}
          strokeDasharray={opts.targetLine.strokeDasharray}
        />
        <Bar
          dataKey="percentage"
          radius={opts.barStyle.radius as [number, number, number, number]}
          maxBarSize={opts.barStyle.maxBarSize}
          xAxisId={0}
        >
          {sortedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={entry.percentage >= TARGET_PERCENTAGE ? opts.barStyle.fillAboveTarget : opts.barStyle.fillBelowTarget}
              style={{
                transform: `translateX(${opts.chart.dx}px)`
              }}
            />
          ))}
          <LabelList
            dataKey="percentage"
            position={opts.labels.position as any}
            formatter={formatBarLabel}
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
    </div>
  );
}; 