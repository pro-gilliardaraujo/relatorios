import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
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
      strokeDasharray?: string;
      stroke?: string;
    };
  };
}

// Valores padrão para as opções
const defaultOptions = {
  width: 650,
  height: 450,
  marginTop: 0,
  margin: {
    top: 20,
    right: 30,
    left: 80,
    bottom: 20,
  },
  barStyle: {
    fillTrabalhando: '#00FF00',
    fillManobra: '#FFA500',
    fillDeslocamento: '#FFFF00',
    height: 25,
  },
  xAxis: {
    fontSize: 10,
    fontWeight: 'bold',
    fill: '#000000',
    tickCount: 6,
  },
  yAxis: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 60,
    fill: '#000000',
  },
  labels: {
    fontSize: 10,
    fontWeight: 'bold',
    fill: '#000000',
    position: 'right',
    offset: 5,
  },
  grid: {
    horizontal: false,
    vertical: true,
    strokeDasharray: '3 3',
    stroke: '#E5E5E5',
  }
};

// Formata o número para exibir com 2 casas decimais
const formatNumber = (value: number) => value.toFixed(2);

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
  };

  // Ordena os dados pelo número da máquina
  const sortedData = [...data].sort((a, b) => Number(a.name) - Number(b.name));

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
        data={sortedData}
        margin={opts.margin}
        barSize={opts.barStyle.height}
      >
        <CartesianGrid
          strokeDasharray={opts.grid.strokeDasharray}
          horizontal={opts.grid.horizontal}
          vertical={opts.grid.vertical}
          stroke={opts.grid.stroke}
        />
        <XAxis
          type="number"
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
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
          width={opts.yAxis.width}
        />
        <Bar
          dataKey="trabalhando"
          fill={opts.barStyle.fillTrabalhando}
          stackId="a"
          name="TRABALHANDO"
        >
          <LabelList
            dataKey="trabalhando"
            position={opts.labels.position as LabelPosition}
            formatter={formatNumber}
            style={{
              fontSize: opts.labels.fontSize,
              fontWeight: opts.labels.fontWeight,
              fill: opts.labels.fill,
            }}
            offset={opts.labels.offset}
          />
        </Bar>
        <Bar
          dataKey="manobra"
          fill={opts.barStyle.fillManobra}
          stackId="b"
          name="MANOBRA"
        >
          <LabelList
            dataKey="manobra"
            position={opts.labels.position as LabelPosition}
            formatter={formatNumber}
            style={{
              fontSize: opts.labels.fontSize,
              fontWeight: opts.labels.fontWeight,
              fill: opts.labels.fill,
            }}
            offset={opts.labels.offset}
          />
        </Bar>
        <Bar
          dataKey="deslocamento"
          fill={opts.barStyle.fillDeslocamento}
          stackId="c"
          name="DESLOCAMENTO"
        >
          <LabelList
            dataKey="deslocamento"
            position={opts.labels.position as LabelPosition}
            formatter={formatNumber}
            style={{
              fontSize: opts.labels.fontSize,
              fontWeight: opts.labels.fontWeight,
              fill: opts.labels.fill,
            }}
            offset={opts.labels.offset}
          />
        </Bar>
      </BarChart>
    </div>
  );
}; 