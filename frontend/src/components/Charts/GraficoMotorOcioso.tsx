import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Line,
  Cell,
  Legend,
} from 'recharts';

// Tipo para posição dos labels
type LabelPosition = 'top' | 'bottom' | 'center' | 'inside' | 'outside' | 'insideTop' | 'insideBottom' | 'insideCenter';

/**
 * Estrutura dos dados para o gráfico de motor ocioso
 */
interface MotorOciosoData {
  /** Nome/ID da máquina */
  name: string;
  /** Tempo parado com motor ligado em formato decimal */
  horasParado: number;
  /** Tempo parado formatado em HH:MM:SS */
  tempoParadoString: string;
  /** Tempo total com motor ligado em formato decimal */
  horasLigado: number;
  /** Tempo total formatado em HH:MM:SS */
  tempoLigadoString: string;
  /** Porcentagem de tempo ocioso */
  porcentagemOcioso: number;
}

/**
 * Props do componente GraficoMotorOcioso
 */
interface GraficoMotorOciosoProps {
  /** Array com os dados das máquinas */
  data: MotorOciosoData[];
  
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
      fillParado?: string;
      fillLigado?: string;
      radius?: [number, number, number, number];
      maxBarSize?: number;
    };

    /**
     * Estilização da linha de porcentagem
     */
    lineStyle?: {
      stroke?: string;
      strokeWidth?: number;
      dotSize?: number;
      showDot?: boolean;
      dotStrokeWidth?: number;
      dotStrokeColor?: string;
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
     * Configurações do eixo Y secundário (porcentagem)
     */
    yAxisSecondary?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      width?: number;
      fill?: string;
    };
    
    /** 
     * Configurações dos labels de tempo
     * @position Posição do label (top, inside, bottom)
     * @fontSize Tamanho da fonte
     * @fontWeight Peso da fonte
     * @fill Cor do texto
     * @offset Distância do ponto de ancoragem
     */
    labels?: {
      position?: 'top' | 'bottom' | 'center' | 'inside' | 'outside' | 'insideTop' | 'insideBottom' | 'insideCenter';
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      fill?: string;
      offset?: number;
    };

    /**
     * Configurações da legenda
     * @fontSize Tamanho da fonte da legenda
     * @iconSize Tamanho do ícone da legenda
     * @iconType Tipo do ícone (circle, square, etc)
     * @verticalPosition Posição vertical da legenda em pixels do topo
     * @horizontalAlign Alinhamento horizontal da legenda (left, center, right)
     */
    legend?: {
      fontSize?: number;
      iconSize?: number;
      iconType?: 'circle' | 'square' | 'diamond' | 'triangle' | 'star' | 'wye';
      verticalPosition?: number;
      horizontalAlign?: 'left' | 'center' | 'right';
    };

    /**
     * Configurações dos labels de porcentagem
     * @fontSize Tamanho da fonte do label
     * @fontWeight Peso da fonte do label
     * @fill Cor do texto
     * @stroke Cor do contorno do texto
     * @strokeWidth Espessura do contorno
     * @offset Distância do ponto de ancoragem
     * @zIndex Ordem de empilhamento (maior número = mais acima)
     * @position Posição do label em relação à linha (top ou bottom)
     */
    percentageLabel?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      offset?: number;
      zIndex?: number;
      position?: 'top' | 'bottom';
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
     * @barCategoryGap Espaço entre grupos de barras (entre frotas diferentes)
     * @barGap Espaço entre barras do mesmo grupo (mesmo equipamento)
     * @dx Deslocamento horizontal das barras
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

// Helper function to calculate axis ticks with fixed intervals
const calculateAxisTicks = (maxValue: number) => {
  // Arredonda para o próximo múltiplo de 30 minutos
  const maxMinutes = Math.ceil(maxValue * 60);
  const roundedMaxMinutes = Math.ceil(maxMinutes / 30) * 30;
  const intervals = roundedMaxMinutes / 30;
  
  // Gera ticks a cada 30 minutos
  return Array.from({ length: intervals + 1 }, (_, i) => i * 0.5);
};

// Valores padrão para as opções - ajustados para o container A4
const defaultOptions = {
  width: 650,
  height: 210,
  marginTop: -15,
  margin: {
    top: 35,
    right: 0,
    left: -10,
    bottom: 15, // Aumentado para acomodar a legenda
  },
  barStyle: {
    fillParado: '#90EE90', // Verde claro para motor parado
    fillLigado: '#009900', // Verde escuro para motor ligado
    radius: [2, 2, 0, 0],
    maxBarSize: 60, // Aumentado para barras mais largas
  },
  lineStyle: {
    stroke: '#FF0000',
    strokeWidth: 1.5,
    dotSize: 2.5,
    showDot: true,
    dotStrokeWidth: 1,
    dotStrokeColor: '#000000',
  },
  xAxis: {
    fontSize: 8,
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
    width: 55,
    fill: '#000000',
  },
  yAxisSecondary: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 30,
    fill: '#FF0000',
  },
  labels: {
    position: 'top',
    fontSize: 10,
    fontWeight: 'bold',
    fill: '#000000',
    offset: 5,
  },
  percentageLabel: {
    fontSize: 9,
    fontWeight: 'normal',
    fill: '#FF0000',
    stroke: '#000000',
    strokeWidth: 0.2,
    offset: -15,
    zIndex: 999,
    position: 'top' as const,
  },
  grid: {
    horizontal: false,
    vertical: false,
    strokeDasharray: '3 3',
    stroke: '#E5E5E5',
  },
  chart: {
    barCategoryGap: 40, // Reduzido para aproximar os grupos
    barGap: 0, // Ajustado para manter as barras do mesmo equipamento juntas
    dx: 0,
  },
  legend: {
    fontSize: 8,
    iconSize: 8,
    iconTypes: {
      bar: "square" as const,
      line: "line" as const
    },
    verticalPosition: 175, // Posição padrão no topo
    horizontalAlign: 'center' as const,
  },
};

export const GraficoMotorOcioso: React.FC<GraficoMotorOciosoProps> = ({ 
  data, 
  options = {} 
}) => {
  // Filtra e ordena apenas as máquinas desejadas
  const filteredData = data
    .filter(d => ['6126', '6128', '6129'].includes(d.name))
    .sort((a, b) => Number(a.name) - Number(b.name));

  const opts = {
    ...defaultOptions,
    ...options,
    margin: { ...defaultOptions.margin, ...options.margin },
    barStyle: { ...defaultOptions.barStyle, ...options.barStyle },
    lineStyle: { ...defaultOptions.lineStyle, ...options.lineStyle },
    xAxis: { ...defaultOptions.xAxis, ...options.xAxis },
    yAxis: { ...defaultOptions.yAxis, ...options.yAxis },
    yAxisSecondary: { ...defaultOptions.yAxisSecondary, ...options.yAxisSecondary },
    labels: { ...defaultOptions.labels, ...options.labels },
    percentageLabel: { ...defaultOptions.percentageLabel, ...options.percentageLabel },
    grid: { ...defaultOptions.grid, ...options.grid },
    chart: { ...defaultOptions.chart, ...options.chart },
    legend: { ...defaultOptions.legend, ...options.legend },
  };

  // Calcula o valor máximo do eixo Y baseado nos dados
  const maxHours = Math.max(...filteredData.map(d => Math.max(d.horasParado, d.horasLigado)));
  const yAxisTicks = calculateAxisTicks(maxHours);

  return (
    <div style={{ 
      width: opts.width, 
      height: opts.height,
      margin: '0 auto',
      position: 'relative',
      marginTop: opts.marginTop,
    }}>
      <ComposedChart
        width={opts.width}
        height={opts.height - 20}
        data={filteredData}
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
        <YAxis
          yAxisId="percentage"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          tick={{ 
            fontSize: opts.yAxisSecondary.fontSize,
            fontWeight: opts.yAxisSecondary.fontWeight,
            fill: opts.yAxisSecondary.fill,
          }}
          width={opts.yAxisSecondary.width}
        />
        <Bar
          name="Parado com Motor Ligado"
          dataKey="horasParado"
          fill={opts.barStyle.fillParado}
          radius={opts.barStyle.radius as [number, number, number, number]}
          maxBarSize={opts.barStyle.maxBarSize}
        >
          <LabelList
            dataKey="tempoParadoString"
            position={opts.labels.position || 'top'}
            style={{ 
              fontSize: opts.labels.fontSize,
              fontWeight: opts.labels.fontWeight,
              fill: opts.labels.fill,
            }}
            offset={opts.labels.offset}
          />
        </Bar>
        <Bar
          name="Motor Ligado Geral"
          dataKey="horasLigado"
          fill={opts.barStyle.fillLigado}
          radius={opts.barStyle.radius as [number, number, number, number]}
          maxBarSize={opts.barStyle.maxBarSize}
        >
          <LabelList
            dataKey="tempoLigadoString"
            position={opts.labels.position || 'top'}
            style={{ 
              fontSize: opts.labels.fontSize,
              fontWeight: opts.labels.fontWeight,
              fill: opts.labels.fill,
            }}
            offset={opts.labels.offset}
          />
        </Bar>
        <Line
          name="Motor Ocioso Total"
          type="linear"
          dataKey="porcentagemOcioso"
          stroke={opts.lineStyle.stroke}
          strokeWidth={opts.lineStyle.strokeWidth}
          yAxisId="percentage"
          dot={opts.lineStyle.showDot ? {
            r: opts.lineStyle.dotSize,
            fill: opts.lineStyle.stroke,
            stroke: opts.lineStyle.dotStrokeColor,
            strokeWidth: opts.lineStyle.dotStrokeWidth
          } : false}
        >
          <LabelList
            position={opts.percentageLabel.position}
            formatter={(value: number) => `${value.toFixed(1)}%`}
            style={{ 
              fontSize: opts.percentageLabel.fontSize,
              fontWeight: opts.percentageLabel.fontWeight,
              fill: opts.percentageLabel.fill,
              stroke: opts.percentageLabel.stroke,
              strokeWidth: opts.percentageLabel.strokeWidth,
              paintOrder: 'stroke',
              zIndex: opts.percentageLabel.zIndex,
            }}
            offset={opts.percentageLabel.offset}
          />
        </Line>
        <Legend
          wrapperStyle={{
            fontSize: opts.legend.fontSize,
            position: 'absolute',
            top: `${opts.legend.verticalPosition}px`,
            left: opts.legend.horizontalAlign === 'left' ? '0' : 'auto',
            right: opts.legend.horizontalAlign === 'right' ? '0' : 'auto',
            margin: '0 auto',
            width: opts.legend.horizontalAlign === 'center' ? '100%' : 'auto',
          }}
          iconSize={opts.legend.iconSize}
          iconType={opts.legend.iconType}
          align={opts.legend.horizontalAlign}
        />
      </ComposedChart>
    </div>
  );
}; 