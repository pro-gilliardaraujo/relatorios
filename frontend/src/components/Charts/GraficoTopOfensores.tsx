import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts';

/**
 * Tipos de posicionamento para labels de porcentagem
 */
type PercentageLabelPosition = 'start' | 'center' | 'end' | 'insideStart' | 'insideCenter' | 'insideEnd';

/**
 * Estrutura dos dados para o gráfico de ofensores
 */
interface OffenderData {
  /** Nome do ofensor/categoria */
  name: string;
  /** Quantidade de horas em formato decimal */
  hours: number;
  /** Porcentagem que representa do total */
  percentage: number;
  /** Tempo formatado em HH:MM:SS */
  timeString: string;
}

/**
 * Props do componente GraficoTopOfensores
 */
interface GraficoTopOfensoresProps {
  /** Array com os dados dos ofensores */
  data: OffenderData[];
  
  /** Configurações de customização do gráfico */
  options?: {
    /** 
     * Dimensões e posicionamento do gráfico
     * @width Largura total do gráfico em pixels
     * @height Altura total do gráfico em pixels
     * @marginTop Espaço adicional acima do gráfico (em pixels) para ajustar posição vertical
     * @example
     * {
     *   width: 650,     // Define a largura total do gráfico
     *   height: 200,    // Define a altura total do gráfico
     *   marginTop: 20,  // Adiciona 20px de espaço acima do gráfico
     * }
     */
    width?: number;
    height?: number;
    marginTop?: number;
    
    /** 
     * Margens internas do gráfico
     * Controla o espaçamento entre as bordas e o conteúdo do gráfico
     * Ajuste estas margens para:
     * - top: dar espaço para labels acima das barras
     * - right: espaço após a última barra
     * - bottom: espaço para os textos do eixo X (categorias)
     * - left: espaço para os valores do eixo Y (tempo)
     * @example
     * {
     *   top: 20,    // Espaço para labels de tempo acima das barras
     *   right: 0,   // Sem espaço adicional à direita
     *   left: 0,    // Sem espaço adicional à esquerda
     *   bottom: 35, // Espaço para textos das categorias (eixo X)
     * }
     */
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    
    /** 
     * Estilização das barras do gráfico
     * @fill Cor de preenchimento das barras (hex, rgb, rgba)
     * @radius Arredondamento dos cantos [topoEsquerdo, topoDireito, baseDireita, baseEsquerda]
     * @maxBarSize Largura máxima de cada barra em pixels (ajuste para controlar espaçamento)
     * @example
     * {
     *   fill: '#FF0000',       // Cor vermelha para as barras
     *   radius: [4, 4, 0, 0],  // Arredonda apenas os cantos superiores
     *   maxBarSize: 45,        // Barras com no máximo 45px de largura
     * }
     */
    barStyle?: {
      fill?: string;
      radius?: [number, number, number, number];
      maxBarSize?: number;
    };
    
    /** 
     * Configurações do eixo X (categorias)
     * Controla a aparência e posicionamento dos textos das categorias
     * @fontSize Tamanho da fonte em pixels
     * @fontWeight Peso da fonte (normal, bold, lighter)
     * @angle Rotação do texto (-90 a 90 graus)
     * @textAnchor Ponto de ancoragem do texto (start = esquerda, middle = centro, end = direita)
     * @height Altura reservada para os textos
     * @fill Cor do texto
     * @verticalOffset Distância vertical entre a linha base e o texto (em pixels)
     * @example
     * {
     *   fontSize: 8,           // Texto pequeno para caber
     *   fontWeight: 'bold',    // Texto em negrito
     *   angle: -25,           // Rotação para melhor legibilidade
     *   textAnchor: 'end',    // Alinha pela direita quando rotacionado
     *   height: 10,           // Reserva 10px de altura
     *   fill: '#000000',      // Cor cinza para o texto
     *   verticalOffset: 16,   // Distância do texto até a linha base
     * }
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
     * Controla a aparência dos valores de tempo no eixo vertical
     * @fontSize Tamanho da fonte em pixels
     * @fontWeight Peso da fonte (normal, bold, lighter)
     * @width Largura reservada para os valores
     * @fill Cor do texto
     * @example
     * {
     *   fontSize: 8,        // Texto pequeno e legível
     *   fontWeight: 'bold', // Destaque em negrito
     *   width: 55,         // Espaço para o formato HH:MM:SS
     *   fill: '#000000',   // Cor cinza para o texto
     * }
     */
    yAxis?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      width?: number;
      fill?: string;
    };
    
    /** 
     * Configurações dos labels de tempo
     * Controla a aparência e posição dos valores de tempo sobre as barras
     * @position Posição em relação à barra (top = acima, center = meio, bottom = abaixo)
     * @fontSize Tamanho da fonte em pixels
     * @fontWeight Peso da fonte (normal, bold, lighter)
     * @fill Cor do texto
     * @offset Distância do ponto de ancoragem em pixels
     * @example
     * {
     *   position: 'top',     // Mostra tempo acima da barra
     *   fontSize: 9,         // Tamanho legível
     *   fontWeight: 'bold',  // Destaque em negrito
     *   fill: '#000000',    // Texto preto
     *   offset: 5,          // 5px acima da barra
     * }
     */
    labels?: {
      position?: 'top' | 'center' | 'bottom';
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      fill?: string;
      offset?: number;
    };

    /** 
     * Configurações dos labels de porcentagem
     * Controla a aparência e posição dos valores percentuais
     * @position Posição do texto (start = início, center = meio, end = fim, inside* = dentro da barra)
     * @fontSize Tamanho da fonte em pixels
     * @fontWeight Peso da fonte (normal, bold, lighter)
     * @fill Cor do texto
     * @offset Distância do ponto de ancoragem em pixels
     * @formatter Função para formatar o valor (ex: adicionar símbolo %)
     * @example
     * {
     *   position: 'insideCenter', // Centralizado dentro da barra
     *   fontSize: 9,              // Tamanho legível
     *   fontWeight: 'bold',       // Negrito para destaque
     *   fill: '#FFFFFF',         // Texto branco (para contraste)
     *   offset: 0,               // Sem deslocamento
     *   formatter: (v) => `${v}%` // Adiciona símbolo %
     * }
     */
    percentageLabel?: {
      position?: PercentageLabelPosition;
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      fill?: string;
      offset?: number;
      formatter?: (value: number) => string;
    };
    
    /** 
     * Configurações da grade de fundo
     * Controla a aparência das linhas de referência
     * @horizontal Exibe/oculta linhas horizontais
     * @vertical Exibe/oculta linhas verticais
     * @strokeDasharray Padrão da linha (ex: '3 3' para pontilhado)
     * @stroke Cor das linhas
     * @example
     * {
     *   horizontal: true,      // Mostra linhas horizontais
     *   vertical: false,       // Oculta linhas verticais
     *   strokeDasharray: '3 3' // Linha pontilhada
     *   stroke: '#E5E5E5'      // Cinza claro
     * }
     */
    grid?: {
      horizontal?: boolean;
      vertical?: boolean;
      strokeDasharray?: string;
      stroke?: string;
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

// Valores padrão para as opções - ajustados para o container A4
const defaultOptions = {
  width: 650,
  height: 200,
  marginTop: 0, // Novo: controle de margem superior do container
  margin: {
    top: 25,
    right: 0,
    left: -15,
    bottom: 25,
  },
  barStyle: {
    fill: '#FF0000',
    radius: [2, 2, 0, 0],
    maxBarSize: 45,
  },
  xAxis: {
    fontSize: 8,
    fontWeight: 'bold',
    angle: 0,
    textAnchor: 'middle',
    height: 10,
    fill: '#000000',
    verticalOffset: 6,
  },
  yAxis: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 55,
    fill: '#000000',
  },
  labels: {
    position: 'top',
    fontSize: 10,
    fontWeight: 'bold',
    fill: '#000000',
    offset: 5,
  },
  percentageLabel: {
    position: 'insideBottom',
    fontSize: 9,
    fontWeight: 'bold',
    fill: '#000000',
    offset: 6,
    formatter: (value: number) => `${value.toFixed(1)}%`,
  },
  grid: {
    horizontal: false,
    vertical: false,
    strokeDasharray: '3 3',
    stroke: '#E5E5E5',
  },
};

export const GraficoTopOfensores: React.FC<GraficoTopOfensoresProps> = ({ 
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
    percentageLabel: { ...defaultOptions.percentageLabel, ...options.percentageLabel },
    grid: { ...defaultOptions.grid, ...options.grid },
  };

  return (
    <div style={{ 
      width: opts.width, 
      height: opts.height,
      margin: '0 auto',
      position: 'relative',
      marginTop: opts.marginTop, // Novo: aplica margem superior
    }}>
      <BarChart
        width={opts.width}
        height={opts.height}
        data={data}
        margin={opts.margin}
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
              <g transform={`translate(${x},${y})`}>
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
        />
        <Bar
          dataKey="hours"
          fill={opts.barStyle.fill}
          radius={opts.barStyle.radius as [number, number, number, number]}
          maxBarSize={opts.barStyle.maxBarSize}
        >
          {/* Time labels */}
          <LabelList
            dataKey="timeString"
            position={opts.labels.position as any}
            style={{ 
              fontSize: opts.labels.fontSize,
              fontWeight: opts.labels.fontWeight,
              fill: opts.labels.fill,
            }}
            offset={opts.labels.offset}
          />
          
          {/* Percentage labels */}
          <LabelList
            dataKey="percentage"
            position={opts.percentageLabel.position as any}
            formatter={opts.percentageLabel.formatter}
            style={{ 
              fontSize: opts.percentageLabel.fontSize,
              fontWeight: opts.percentageLabel.fontWeight,
              fill: opts.percentageLabel.fill,
            }}
            offset={opts.percentageLabel.offset}
          />
        </Bar>
      </BarChart>
    </div>
  );
}; 