import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList
} from 'recharts';

// Tipo para posição dos labels
type LabelPosition = 'top' | 'bottom' | 'center' | 'inside' | 'outside' | 'insideTop' | 'insideBottom' | 'insideCenter' | undefined;

/**
 * Estrutura dos dados para o gráfico de motor ocioso por operação
 */
interface MotorOciosoPorOperacaoData {
  /** Nome da operação */
  name: string;
  /** Tempo em horas em formato decimal */
  hours: number;
  /** Tempo formatado em HH:MM:SS */
  timeString: string;
}

/**
 * Props do componente GraficoMotorOciosoPorOperacao
 */
interface GraficoMotorOciosoPorOperacaoProps {
  /** Array com os dados das operações */
  data: MotorOciosoPorOperacaoData[];
  
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
     * Estilização da área do gráfico
     */
    areaStyle?: {
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      fillOpacity?: number;
    };
    
    /** 
     * Configurações do eixo X (operações)
     */
    xAxis?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      angle?: number;
      textAnchor?: 'start' | 'middle' | 'end';
      height?: number;
      fill?: string;
      verticalOffset?: number;
      maxCharsPerLine?: number;
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
     * Configurações da grade de fundo
     */
    grid?: {
      horizontal?: boolean;
      vertical?: boolean;
      strokeDasharray?: string;
      stroke?: string;
    };
  };
}

// Helper function para formatar os ticks do eixo Y
const formatYAxisTick = (value: number) => {
  const hours = Math.floor(value);
  const minutes = Math.floor((value - hours) * 60);
  const seconds = Math.floor(((value - hours) * 60 - minutes) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Helper function para calcular os ticks do eixo Y
const calculateAxisTicks = (maxValue: number) => {
  const maxMinutes = Math.ceil(maxValue * 60);
  const roundedMaxMinutes = Math.ceil(maxMinutes / 30) * 30;
  const intervals = roundedMaxMinutes / 30;
  return Array.from({ length: intervals + 1 }, (_, i) => i * 0.5);
};

// Helper function para quebrar texto em linhas
const wrapText = (text: string, maxCharsPerLine: number = 20): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if (currentLine.length + word.length > maxCharsPerLine && currentLine.length > 0) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine.length === 0 ? '' : ' ') + word;
    }
  });
  
  if (currentLine.length > 0) {
    lines.push(currentLine.trim());
  }

  return lines;
};

// Tooltip customizado
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <p style={{ margin: 0 }}><strong>{label}</strong></p>
        <p style={{ margin: 0 }}>{payload[0].payload.timeString}</p>
      </div>
    );
  }
  return null;
};

// Valores padrão para as opções - ajustados para o container A4
const defaultOptions = {
  // Dimensões gerais do gráfico
  width: 900,                // Largura total do gráfico
  height: 230,              // Altura total do gráfico
  marginTop: -15,           // Ajuste da posição vertical do gráfico inteiro (negativo = sobe, positivo = desce)

  // Margens internas do gráfico
  margin: {
    top: 35,                // Espaço acima do gráfico
    right: 220,             // Espaço à direita do gráfico
    left: 10,               // Espaço à esquerda do gráfico
    bottom: 20              // Aumentado para acomodar texto em múltiplas linhas
  },

  // Estilo da área do gráfico
  areaStyle: {
    fill: '#FF0000',        // Cor do preenchimento da área
    stroke: '#990000',      // Cor da linha de contorno
    strokeWidth: 2,         // Espessura da linha de contorno
    fillOpacity: 0.9        // Opacidade do preenchimento (0 = transparente, 1 = sólido)
  },

  // Configurações do eixo X (nomes das operações)
  xAxis: {
    fontSize: 8,            // Tamanho da fonte dos nomes
    fontWeight: 'bold',     // Peso da fonte: 'normal', 'bold' ou 'lighter'
    angle: -90,            // Rotação para a esquerda
    textAnchor: 'end',     // Alinhamento à esquerda
    height: 90,            // Altura reservada para os nomes
    fill: '#000000',       // Cor dos textos
    verticalOffset: 10,    // Ajuste vertical dos textos
    maxCharsPerLine: 20    // Máximo de caracteres por linha
  },

  // Configurações do eixo Y (valores de tempo)
  yAxis: {
    fontSize: 8,            // Tamanho da fonte dos valores
    fontWeight: 'bold',     // Peso da fonte
    width: 70,              // Largura reservada para os valores
    fill: '#000000'         // Cor dos valores
  },

  // Configurações dos labels de tempo sobre a área
  labels: {
    position: 'top',        // Posição: 'top', 'center', 'bottom', etc
    fontSize: 10,           // Tamanho da fonte
    fontWeight: 'bold',     // Peso da fonte
    fill: '#000000',        // Cor do texto
    offset: 5              // Distância do ponto de dados
  },

  // Configurações da grade de fundo
  grid: {
    horizontal: true,       // Mostra linhas horizontais
    vertical: false,        // Mostra linhas verticais
    strokeDasharray: '3 3', // Padrão da linha pontilhada
    stroke: '#E5E5E5'      // Cor das linhas da grade
  }
};

export const GraficoMotorOciosoPorOperacao: React.FC<GraficoMotorOciosoPorOperacaoProps> = ({
  data,
  options = {}
}) => {
  // Mescla as opções com os valores padrão, dando prioridade às opções passadas
  const opts = {
    ...defaultOptions,
    ...options,
    margin: { ...defaultOptions.margin, ...options.margin },
    areaStyle: { ...defaultOptions.areaStyle, ...options.areaStyle },
    xAxis: { ...defaultOptions.xAxis, ...options.xAxis },
    yAxis: { ...defaultOptions.yAxis, ...options.yAxis },
    labels: { ...defaultOptions.labels, ...options.labels },
    grid: { ...defaultOptions.grid, ...options.grid }
  };

  // Calcula o valor máximo do eixo Y
  const maxHours = Math.max(...data.map(d => d.hours));
  const yAxisTicks = calculateAxisTicks(maxHours);

  return (
    <div style={{ 
      width: opts.width, 
      height: opts.height,
      margin: '0 auto',
      position: 'relative',
      marginTop: opts.marginTop 
    }}>
      <AreaChart
        width={opts.width}
        height={opts.height}
        data={data}
        margin={opts.margin}
      >
        <CartesianGrid
          strokeDasharray={opts.grid.strokeDasharray}
          stroke={opts.grid.stroke}
          horizontal={opts.grid.horizontal}
          vertical={opts.grid.vertical}
        />
        <XAxis
          dataKey="name"
          tick={(props) => {
            const { x, y, payload } = props;
            const lines = wrapText(payload.value, opts.xAxis.maxCharsPerLine);
            
            return (
              <g transform={`translate(${x},${y})`}>
                {lines.map((line, i) => (
                  <text
                    key={i}
                    x={0}
                    y={i * 12} // Espaçamento entre linhas
                    dy={0}     // Removido o deslocamento inicial
                    textAnchor={opts.xAxis.textAnchor}
                    fill={opts.xAxis.fill}
                    fontSize={opts.xAxis.fontSize}
                    fontWeight={opts.xAxis.fontWeight}
                    transform={`rotate(${opts.xAxis.angle})`} // Aplica a rotação
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          }}
          height={opts.xAxis.height}
          interval={0}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYAxisTick}
          tick={{
            fontSize: opts.yAxis.fontSize,
            fontWeight: opts.yAxis.fontWeight,
            fill: opts.yAxis.fill
          }}
          width={opts.yAxis.width}
          ticks={yAxisTicks}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="linear"
          dataKey="hours"
          stroke={opts.areaStyle.stroke}
          fill={opts.areaStyle.fill}
          strokeWidth={opts.areaStyle.strokeWidth}
          fillOpacity={opts.areaStyle.fillOpacity}
        >
          <LabelList
            dataKey="timeString"
            position={opts.labels.position as LabelPosition}
            style={{
              fontSize: opts.labels.fontSize,
              fontWeight: opts.labels.fontWeight,
              fill: opts.labels.fill
            }}
            offset={opts.labels.offset}
          />
        </Area>
      </AreaChart>
    </div>
  );
}; 