import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Legend,
  Cell,
} from 'recharts';

type LabelPosition = 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'insideBottomLeft' | 'insideBottomRight' | 'insideTopLeft' | 'insideTopRight' | 'top' | 'bottom' | 'left' | 'right';
type HorizontalAlignmentType = 'left' | 'center' | 'right';
type VerticalAlignmentType = 'top' | 'middle' | 'bottom';

/**
 * Estrutura dos dados para o gráfico de utilização do motor
 */
interface UtilizacaoMotorData {
  /** Nome/ID da máquina */
  name: string;
  /** Tempo em DESLOC P/ DESC */
  deslocParaDesc: number;
  /** Tempo em MANOBRA */
  manobra: number;
  /** Tempo em DESLOCAMENTO */
  deslocamento: number;
  /** Tempo em PARADA */
  parada: number;
  /** Tempo em TRABALHANDO */
  trabalhando: number;
  /** String formatada do tempo para cada operação */
  tempoDeslocParaDesc: string;
  tempoManobra: string;
  tempoDeslocamento: string;
  tempoParada: string;
  tempoTrabalhando: string;
}

/**
 * Props do componente GraficoUtilizacaoMotor
 */
interface GraficoUtilizacaoMotorProps {
  /** Array com os dados das máquinas */
  data: UtilizacaoMotorData[];
  
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
      fillDeslocParaDesc?: string;
      fillManobra?: string;
      fillDeslocamento?: string;
      fillParada?: string;
      fillTrabalhando?: string;
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
      position?: LabelPosition;
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      fill?: string;
      offset?: number;
    };

    /** 
     * Configurações da legenda
     */
    legend?: {
      fontSize?: number;
      iconSize?: number;
      verticalAlign?: VerticalAlignmentType;
      align?: HorizontalAlignmentType;
      wrapperStyle?: React.CSSProperties;
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

interface TransformedData {
  category: string;
  color: string;
  [key: string]: string | number; // Para permitir propriedades dinâmicas
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
  height: 200,
  marginTop: 0,
  margin: {
    top: 15,
    right: 0,
    left: -15,
    bottom: 5,
  },
  barStyle: {
    fillDeslocParaDesc: '#90EE90',
    fillManobra: '#FFA500',
    fillDeslocamento: '#FFFF00',
    fillParada: '#FF0000',
    fillTrabalhando: '#008000',
    radius: [2, 2, 0, 0] as [number, number, number, number],
    maxBarSize: 22,
  },
  xAxis: {
    fontSize: 9,
    fontWeight: 'bold',
    angle: 0,
    textAnchor: 'middle',
    height: 50,
    fill: '#000000',
    verticalOffset: 16,
    fleetY: 10,
    categoryY: 30,
    fleetSpacing: 44,
    axisLine: false,
    tickLine: false,
  },
  yAxis: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 55,
    fill: '#000000',
  },
  labels: {
    position: 'top' as LabelPosition,
    fontSize: 8,
    fontWeight: 'bold',
    fill: '#000000',
    offset: 6,
  },
  grid: {
    horizontal: false,
    vertical: false,
    strokeDasharray: '3 3',
    stroke: '#E5E5E5',
  },
  chart: {
    barCategoryGap: 0,
    barGap: 0,
  },
};

export const GraficoUtilizacaoMotor: React.FC<GraficoUtilizacaoMotorProps> = ({
  data,
  options = {}
}) => {
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

  const getTempoKey = (key: string): keyof UtilizacaoMotorData => {
    const mapping: Record<string, keyof UtilizacaoMotorData> = {
      'deslocParaDesc': 'tempoDeslocParaDesc',
      'manobra': 'tempoManobra',
      'deslocamento': 'tempoDeslocamento',
      'parada': 'tempoParada',
      'trabalhando': 'tempoTrabalhando'
    };
    return mapping[key];
  };

  // Transformar os dados para o novo formato
  const categories = [
    { key: 'deslocParaDesc', name: 'DESLOC P/ DESC', color: opts.barStyle.fillDeslocParaDesc },
    { key: 'manobra', name: 'MANOBRA', color: opts.barStyle.fillManobra },
    { key: 'deslocamento', name: 'DESLOCAMENTO', color: opts.barStyle.fillDeslocamento },
    { key: 'parada', name: 'PARADA', color: opts.barStyle.fillParada },
    { key: 'trabalhando', name: 'TRABALHANDO', color: opts.barStyle.fillTrabalhando }
  ] as const;

  // Ordena os dados por frota
  const sortedData = [...data].sort((a, b) => Number(a.name) - Number(b.name));

  // Criar dados transformados agrupados por categoria
  const transformedData: TransformedData[] = categories.map(category => {
    const categoryData: TransformedData = {
      category: category.name,
      color: category.color,
      ...sortedData.reduce((acc, frota) => ({
        ...acc,
        [`${frota.name}`]: frota[category.key],
        [`tempo${frota.name}`]: frota[getTempoKey(category.key)],
      }), {})
    };
    return categoryData;
  });

  // Calcula o valor máximo do eixo Y
  const maxHours = Math.max(...transformedData.flatMap(d => 
    sortedData.map(frota => Number(d[frota.name]) || 0)
  ));
  const yAxisTicks = calculateAxisTicks(maxHours);

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
        height={opts.height}
        data={transformedData}
        margin={opts.margin}
        barCategoryGap={opts.chart.barCategoryGap}
        barGap={opts.chart.barGap}
      >
        <CartesianGrid 
          strokeDasharray={opts.grid.strokeDasharray}
          horizontal={opts.grid.horizontal}
          vertical={opts.grid.vertical}
          stroke={opts.grid.stroke}
        />
        <XAxis
          dataKey="category"
          axisLine={opts.xAxis.axisLine}
          tickLine={opts.xAxis.tickLine}
          height={opts.xAxis.height}
          tick={(props) => {
            const { x, y, payload } = props;
            const category = payload.value;
            const fleetY = y + opts.xAxis.fleetY;
            const categoryY = y + opts.xAxis.categoryY;

            return (
              <g>
                {sortedData.map((frota, index) => {
                  const fleetX = x - opts.xAxis.fleetSpacing + (index * opts.xAxis.fleetSpacing);
                  return (
                    <text
                      key={frota.name}
                      x={fleetX}
                      y={fleetY}
                      textAnchor={opts.xAxis.textAnchor}
                      fontSize={opts.xAxis.fontSize}
                      fontWeight={opts.xAxis.fontWeight}
                      fill={opts.xAxis.fill}
                    >
                      {frota.name}
                    </text>
                  );
                })}
                <text
                  x={x}
                  y={categoryY}
                  textAnchor={opts.xAxis.textAnchor}
                  fontSize={opts.xAxis.fontSize}
                  fontWeight={opts.xAxis.fontWeight}
                  fill={opts.xAxis.fill}
                >
                  {category}
                </text>
              </g>
            );
          }}
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
        {sortedData.map((frota) => (
          <Bar
            key={frota.name}
            dataKey={frota.name}
            fill={opts.barStyle.fillTrabalhando}
            maxBarSize={opts.barStyle.maxBarSize}
          >
            {transformedData.map((category, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={category.color}
              />
            ))}
            <LabelList
              dataKey={`tempo${frota.name}`}
              position={opts.labels.position}
              style={{
                fontSize: opts.labels.fontSize,
                fontWeight: opts.labels.fontWeight,
                fill: opts.labels.fill,
              }}
              offset={opts.labels.offset}
            />
          </Bar>
        ))}
      </BarChart>
    </div>
  );
};