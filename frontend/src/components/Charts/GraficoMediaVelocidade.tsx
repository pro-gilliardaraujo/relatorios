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

// Tipo para posição dos labels
type LabelPosition = 'insideRight' | 'insideLeft' | 'insideCenter' | 'outside' | 'right' | 'left' | 'center';

/**
 * Estrutura dos dados para o gráfico de média de velocidade
 */
interface MediaVelocidadeData {
  /** ID da máquina */
  name: string;
  /** Velocidade em TRABALHANDO */
  trabalhando: number;
  /** Velocidade em MANOBRA */
  manobra: number;
  /** Velocidade em DESLOCAMENTO */
  deslocamento: number;
}

/**
 * Props do componente GraficoMediaVelocidade
 */
interface GraficoMediaVelocidadeProps {
  /** Array com os dados das máquinas */
  data: MediaVelocidadeData[];
  
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
      fillTrabalhando?: string;
      fillManobra?: string;
      fillDeslocamento?: string;
      height?: number;
    };

    /**
     * Configurações de espaçamento dos textos
     */
    spacing?: {
      /** Distância do texto da frota até o início do gráfico */
      frotaFromLeft?: number;
      /** Distância do texto das operações até as barras */
      operationsFromBars?: number;
      /** Ajuste vertical do texto da frota */
      frotaVerticalOffset?: number;
      /** Espaço entre grupos de barras diferentes */
      barGroupGap?: number;
    };
    
    /** 
     * Configurações do eixo X (valores)
     */
    xAxis?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      fill?: string;
      tickCount?: number;
    };
    
    /** 
     * Configurações do eixo Y (máquinas)
     */
    yAxis?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      width?: number;
      fill?: string;
    };
    
    /** 
     * Configurações dos labels nas barras
     */
    labels?: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold' | 'lighter';
      fill?: string;
      position?: 'insideRight' | 'insideLeft' | 'insideCenter' | 'outside' | 'right' | 'left' | 'center';
      offset?: number;
    };
    
    /** 
     * Configurações da grade de fundo
     */
    grid?: {
      horizontal?: boolean;
      vertical?: boolean;
      /** Se true, remove todas as linhas de grade */
      showOnlyTarget?: boolean;
      strokeDasharray?: string;
      stroke?: string;
    };
  };
}

// Valores padrão para as opções
const defaultOptions = {
  width: 550,
  height: 450,
  marginTop: 0,
  margin: {
    top: 20,
    right: 130,
    left: 80,
    bottom: 10,
  },
  spacing: {
    frotaFromLeft: 120,
    operationsFromBars: 100,
    frotaVerticalOffset: 1.8,
    barGroupGap: 0,
  },
  barStyle: {
    fillTrabalhando: '#00CC00',
    fillManobra: '#FF8C00',
    fillDeslocamento: '#FFFF00',
    height: 32,
  },
  xAxis: {
    fontSize: 9,
    fontWeight: 'bold',
    fill: '#000000',
    tickCount: 6,
  },
  yAxis: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 100,
    fill: '#000000',
  },
  labels: {
    fontSize: 10,
    fontWeight: 'bold',
    fill: '#000000',
    position: 'right',
    offset: 10,
  },
  grid: {
    horizontal: false,
    vertical: false,
    showOnlyTarget: false,
    strokeDasharray: '3 3',
    stroke: '#E5E5E5',
  }
};

// Formata o número para exibir com 2 casas decimais
const formatNumber = (value: number) => value.toFixed(2);

// Helper para calcular o domínio do eixo X
const calculateDomain = (data: MediaVelocidadeData[]) => {
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.trabalhando, item.manobra, item.deslocamento))
  );
  return [0, Math.ceil(maxValue)];
};

// Helper para calcular a largura mínima necessária para o texto
const getMinBarWidth = (value: number, minWidth: number = 100) => {
  return Math.max(value * 55, minWidth);
};

// Helper para obter a cor da barra baseado no tipo
const getBarColor = (tipo: string): string => {
  switch (tipo) {
    case 'trabalhando':
      return defaultOptions.barStyle.fillTrabalhando;
    case 'manobra':
      return defaultOptions.barStyle.fillManobra;
    case 'deslocamento':
      return defaultOptions.barStyle.fillDeslocamento;
    default:
      return '#000000';
  }
};

export const GraficoMediaVelocidade: React.FC<GraficoMediaVelocidadeProps> = ({
  data,
  options = {}
}) => {
  // Mescla as opções com os valores padrão
  const opts = {
    ...defaultOptions,
    ...options,
    margin: { ...defaultOptions.margin, ...options.margin },
    barStyle: { ...defaultOptions.barStyle, ...options.barStyle },
    xAxis: { ...defaultOptions.xAxis, ...options.xAxis },
    yAxis: { ...defaultOptions.yAxis, ...options.yAxis },
    labels: { ...defaultOptions.labels, ...options.labels },
    grid: { ...defaultOptions.grid, ...options.grid },
    spacing: { ...defaultOptions.spacing, ...options.spacing },
  };

  // Ordena os dados pelo número da máquina
  const sortedData = [...data].sort((a, b) => Number(a.name) - Number(b.name));

  // Calcular o domínio baseado nos dados
  const [minDomain, maxDomain] = calculateDomain(data);

  // Transformar os dados para agrupar por frota e manter as operações
  const transformedData = sortedData.flatMap(item => [
    {
      name: 'TRABALHANDO',
      value: item.trabalhando,
      frota: item.name,
      groupId: item.name
    },
    {
      name: 'MANOBRA',
      value: item.manobra,
      frota: item.name,
      groupId: item.name
    },
    {
      name: 'DESLOCAMENTO',
      value: item.deslocamento,
      frota: item.name,
      groupId: item.name
    }
  ]);

  return (
    <div style={{ 
      width: opts.width, 
      height: opts.height,
      margin: '0 auto',
      position: 'relative',
      marginTop: opts.marginTop 
    }}>
      <BarChart
        layout="vertical"
        width={opts.width}
        height={opts.height}
        data={transformedData}
        margin={opts.margin}
        barSize={opts.barStyle.height}
        barGap={-10}
        barCategoryGap={40}
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
          type="number"
          domain={[0, maxDomain]}
          ticks={Array.from({ length: maxDomain + 1 }, (_, i) => i)}
          tick={{
            fontSize: opts.xAxis.fontSize,
            fontWeight: opts.xAxis.fontWeight,
            fill: opts.xAxis.fill,
          }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{
            fontSize: opts.yAxis.fontSize,
            fontWeight: opts.yAxis.fontWeight,
            fill: opts.yAxis.fill,
          }}
          width={opts.spacing.operationsFromBars}
        />
        <Bar
          dataKey="value"
          name="Valor"
        >
          {transformedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={getBarColor(entry.name.toLowerCase())}
            />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            content={(props) => {
              const { x, y, width, height, value, index } = props;
              if (x === undefined || y === undefined || width === undefined || height === undefined || index === undefined) return null;
              
              const entry = transformedData[index];
              if (!entry) return null;
              
              const isFirstInGroup = index % 3 === 0;
              
              return (
                <g>
                  {isFirstInGroup && (
                    <text
                      x={Number(x) - opts.spacing.frotaFromLeft}
                      y={Number(y) + opts.barStyle.height * opts.spacing.frotaVerticalOffset}
                      fill="#000000"
                      fontSize={opts.labels.fontSize}
                      fontWeight={opts.labels.fontWeight}
                      textAnchor="end"
                      dominantBaseline="central"
                    >
                      {`${entry.frota} - TP`}
                    </text>
                  )}
                  <text
                    x={Number(x) + Number(width) + 8}
                    y={Number(y) + Number(height) / 2}
                    fill="#000000"
                    fontSize={opts.labels.fontSize}
                    fontWeight={opts.labels.fontWeight}
                    textAnchor="start"
                    dominantBaseline="central"
                  >
                    {formatNumber(value as number)}
                  </text>
                </g>
              );
            }}
          />
        </Bar>
      </BarChart>
    </div>
  );
}; 