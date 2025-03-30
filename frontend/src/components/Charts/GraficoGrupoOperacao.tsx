import React from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { Box, Text, Flex } from '@chakra-ui/react';

/**
 * Estrutura dos dados para o gráfico de grupo de operação
 */
interface GrupoOperacaoData {
  /** ID da frota */
  id: string;
  /** Array de operações */
  operations: {
    /** Nome da operação */
    name: string;
    /** Valor da operação */
    value: number;
  }[];
}

/**
 * Props do componente GraficoGrupoOperacao
 */
interface GrupoOperacaoProps {
  /** Array com os dados das frotas */
  data: GrupoOperacaoData[];
  options?: Partial<typeof defaultOptions>;
}

type LabelPosition = 'inside' | 'outside';
type IconShape = 'square' | 'circle' | 'rect';

// Valores padrão para as opções - ajustados para o container A4
const defaultOptions = {
  container: {
    width: 710,
    height: 200,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  },
  pieChart: {
    width: 230,
    height: 230,
    spacing: 'space-between' as const, // ou 'space-around', 'space-evenly'
  },
  pie: {
    innerRadius: 0,
    outerRadius: 90,
    startAngle: 90,
    endAngle: -270,
    stroke: {
      color: '#FFFFFF',
      width: 1
    },
    animation: {
      enabled: false,
      duration: 800
    }
  },
  text: {
    title: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 2,
      show: true
    },
    value: {
      show: true,
      position: 'outside' as LabelPosition,
      fontSize: 9,
      fontWeight: 'bold',
      color: '#000000',
      format: (value: number) => value.toFixed(1),
      minAngleToShow: 3,
      labelDistance: {
        offset: 1,
        lineLength: 4,
        connectorPadding: 3
      },
      style: {
        textAnchor: 'middle' as const,
        dominantBaseline: 'middle' as const
      }
    }
  },
  legend: {
    show: true,
    position: 'bottom' as const,
    fontSize: 10,
    fontWeight: 'normal',
    color: '#000000',
    iconSize: 2,
    iconShape: 'square' as IconShape,
    marginTop: 14,
    marginLeft: 40,
    spacing: 3,
    columns: 'auto' as const,
    maxWidth: 630,
    align: 'center' as const
  },
  colors: {
    'Automação': '#8B0000', // Vermelho escuro
    'Auxiliar': '#FFA500', // Laranja
    'Clima': '#FFE4B5', // Amarelo claro
    'Improdutiva': '#FFD700', // Amarelo
    'Inaptidão': '#87CEEB', // Azul claro
    'Manutenção': '#FF0000', // Vermelho
    'Perdida': '#DDA0DD', // Rosa/Roxo
    'Produtiva': '#228B22', // Verde
    'Usina': '#808080' // Cinza
  }
};

type OperationType = 'Automação' | 'Auxiliar' | 'Clima' | 'Improdutiva' | 'Inaptidão' | 'Manutenção' | 'Perdida' | 'Produtiva' | 'Usina';

// Definição de todas as operações possíveis e suas cores na ordem correta da imagem
const ALL_OPERATIONS = [
  { name: 'Automação', color: '#0000FF' },  // Azul
  { name: 'Auxiliar', color: '#FFD700' },   // Amarelo
  { name: 'Clima', color: '#808080' },      // Cinza
  { name: 'Improdutiva', color: '#FFFF00' }, // Amarelo claro
  { name: 'Inaptidão', color: '#87CEEB' },  // Azul claro
  { name: 'Manutenção', color: '#FF0000' }, // Vermelho
  { name: 'Perdida', color: '#FFA500' },    // Laranja
  { name: 'Produtiva', color: '#00FF00' },  // Verde
  { name: 'Usina', color: '#8B4513' }       // Marrom
];

// Cores para o gráfico
const COLORS: Record<OperationType, string> = {
  'Automação': '#0000FF',
  'Auxiliar': '#FFD700',
  'Clima': '#808080',
  'Improdutiva': '#FFFF00',
  'Inaptidão': '#87CEEB',
  'Manutenção': '#FF0000',
  'Perdida': '#FFA500',
  'Produtiva': '#00FF00',
  'Usina': '#8B4513'
};

const SinglePieChart: React.FC<{
  data: GrupoOperacaoData;
  options: typeof defaultOptions;
}> = ({ data, options: opts }) => {
  const filteredData = data.operations.filter(op => op.value > 0 && op.name !== 'null');
  const total = filteredData.reduce((sum, op) => sum + op.value, 0);

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, name } = props;
    const RADIAN = Math.PI / 180;
    const { offset, lineLength, connectorPadding } = opts.text.value.labelDistance;
    
    const radius = outerRadius + offset;
    const lineStart = {
      x: cx + outerRadius * Math.cos(-midAngle * RADIAN),
      y: cy + outerRadius * Math.sin(-midAngle * RADIAN)
    };
    const lineMiddle = {
      x: cx + (outerRadius + lineLength) * Math.cos(-midAngle * RADIAN),
      y: cy + (outerRadius + lineLength) * Math.sin(-midAngle * RADIAN)
    };
    const labelPoint = {
      x: cx + radius * Math.cos(-midAngle * RADIAN),
      y: cy + radius * Math.sin(-midAngle * RADIAN)
    };

    const angle = (value / total) * 360;
    if (angle < opts.text.value.minAngleToShow) return null;

    const textAnchor = midAngle < -90 || midAngle >= 90 ? 'end' : 'start';
    const labelX = labelPoint.x + (textAnchor === 'end' ? -connectorPadding : connectorPadding);

    return (
      <g>
        <path
          d={`
            M ${lineStart.x},${lineStart.y}
            L ${lineMiddle.x},${lineMiddle.y}
            L ${labelPoint.x},${labelPoint.y}
          `}
          stroke="#666666"
          fill="none"
          strokeWidth={0.5}
        />
        <text
          x={labelX}
          y={labelPoint.y}
          fill={opts.text.value.color}
          fontSize={opts.text.value.fontSize}
          fontWeight={opts.text.value.fontWeight}
          textAnchor={textAnchor}
          dominantBaseline="middle"
        >
          {opts.text.value.format(value)}
        </text>
      </g>
    );
  };

  return (
    <Box
      width={opts.pieChart.width}
      height={opts.pieChart.height}
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      {opts.text.title.show && (
        <Text
          fontSize={opts.text.title.fontSize}
          fontWeight={opts.text.title.fontWeight}
          color={opts.text.title.color}
          mb={opts.text.title.marginBottom}
        >
          {data.id}
        </Text>
      )}
      <PieChart 
        width={opts.pieChart.width} 
        height={opts.pieChart.height - (opts.text.title.show ? 20 : 0)}
      >
        <Pie
          data={filteredData}
          cx={opts.pieChart.width / 2}
          cy={(opts.pieChart.height - (opts.text.title.show ? 20 : 0)) / 2}
          innerRadius={opts.pie.innerRadius}
          outerRadius={opts.pie.outerRadius}
          startAngle={opts.pie.startAngle}
          endAngle={opts.pie.endAngle}
          dataKey="value"
          stroke={opts.pie.stroke.color}
          strokeWidth={opts.pie.stroke.width}
          isAnimationActive={opts.pie.animation.enabled}
          animationDuration={opts.pie.animation.duration}
          label={opts.text.value.show ? renderCustomizedLabel : false}
          labelLine={false}
        >
          {filteredData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={opts.colors[entry.name as keyof typeof opts.colors] || '#000000'}
            />
          ))}
        </Pie>
      </PieChart>
    </Box>
  );
};

// Helper para obter todas as operações únicas dos dados
const getUniqueOperations = (data: GrupoOperacaoData[]) => {
  const operations = new Set<string>();
  data.forEach(frota => {
    frota.operations.forEach(op => {
      if (op.name !== 'null') {
        operations.add(op.name);
      }
    });
  });
  return Array.from(operations);
};

export const GraficoGrupoOperacao: React.FC<GrupoOperacaoProps> = ({ data, options = {} }) => {
  // Mescla as opções padrão com as opções fornecidas
  const opts = {
    ...defaultOptions,
    ...options,
    container: { ...defaultOptions.container, ...options.container },
    pieChart: { ...defaultOptions.pieChart, ...options.pieChart },
    pie: { ...defaultOptions.pie, ...options.pie },
    text: {
      title: { ...defaultOptions.text.title, ...options.text?.title },
      value: { ...defaultOptions.text.value, ...options.text?.value }
    },
    legend: { ...defaultOptions.legend, ...options.legend },
    colors: COLORS
  };

  const uniqueOperations = getUniqueOperations(data);

  return (
    <Box 
      width={opts.container.width}
      height={opts.container.height}
      padding={`${opts.container.padding.top}px ${opts.container.padding.right}px ${opts.container.padding.bottom}px ${opts.container.padding.left}px`}
    >
      <Flex 
        justifyContent={opts.pieChart.spacing}
        alignItems="flex-start"
        width="100%"
        height="100%"
      >
        {data.map((frota, index) => (
          <SinglePieChart
            key={index}
            data={frota}
            options={opts}
          />
        ))}
      </Flex>

      {opts.legend.show && (
        <Flex 
          justifyContent={opts.legend.align}
          gap={opts.legend.spacing}
          mt={opts.legend.marginTop}
          flexWrap="wrap"
          maxWidth={opts.legend.maxWidth}
          mx="auto"
        >
          {ALL_OPERATIONS
            .filter(op => op.name !== 'null')
            .map((operation, index) => (
              <Flex key={index} alignItems="center" gap={2}>
                <Box 
                  width={opts.legend.iconSize} 
                  height={opts.legend.iconSize} 
                  backgroundColor={operation.color}
                  borderRadius={opts.legend.iconShape === 'circle' ? '50%' : undefined}
                />
                <Text
                  fontSize={opts.legend.fontSize}
                  fontWeight={opts.legend.fontWeight}
                  color={opts.legend.color}
                >
                  {operation.name}
                </Text>
              </Flex>
            ))}
        </Flex>
      )}
    </Box>
  );
}; 