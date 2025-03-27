import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { Box, Text, HStack, VStack, Flex, Square } from '@chakra-ui/react';

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
    /** Cor da operação */
    color: string;
  }[];
}

/**
 * Props do componente GraficoGrupoOperacao
 */
interface GrupoOperacaoProps {
  /** Array com os dados das frotas */
  data: GrupoOperacaoData[];
  
  /** Configurações de customização do gráfico */
  options?: {
    /** 
     * Dimensões e posicionamento do container principal
     */
    container?: {
      /** Altura do container em pixels */
      height?: number;
      /** Largura do container em pixels */
      width?: number;
      /** Padding interno do container */
      padding?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
    };

    /** 
     * Configurações do gráfico de pizza
     */
    pieStyle?: {
      /** Raio interno do gráfico em pixels (0 para pie, > 0 para donut) */
      innerRadius?: number;
      /** Raio externo do gráfico em pixels */
      outerRadius?: number;
      /** Ângulo inicial do gráfico em graus */
      startAngle?: number;
      /** Ângulo final do gráfico em graus */
      endAngle?: number;
      /** Espessura da borda das fatias */
      strokeWidth?: number;
      /** Cor da borda das fatias */
      strokeColor?: string;
    };

    /** 
     * Configurações do título (ID da frota)
     */
    title?: {
      /** Tamanho da fonte do título */
      fontSize?: number;
      /** Peso da fonte do título */
      fontWeight?: string;
      /** Cor do título */
      color?: string;
      /** Margem inferior do título */
      marginBottom?: number;
    };

    /** 
     * Configurações dos valores dentro das fatias
     */
    values?: {
      /** Se deve mostrar os valores */
      show?: boolean;
      /** Tamanho da fonte dos valores */
      fontSize?: number;
      /** Peso da fonte dos valores */
      fontWeight?: string;
      /** Cor dos valores */
      color?: string;
      /** Fator de distância do centro (0 a 1) */
      distanceFromCenter?: number;
      /** Número de casas decimais */
      decimalPlaces?: number;
    };

    /**
     * Configurações da legenda
     */
    legend?: {
      /** Tamanho da fonte da legenda */
      fontSize?: number;
      /** Peso da fonte da legenda */
      fontWeight?: string;
      /** Cor do texto da legenda */
      color?: string;
      /** Tamanho do quadrado de cor */
      squareSize?: number;
      /** Espaçamento entre itens */
      gap?: number;
    };
  };
}

// Valores padrão para as opções
const defaultOptions = {
  container: {
    height: 200,
    width: 900,
    padding: {
      top: 0,
      right: 20,
      bottom: 0,
      left: 20
    }
  },
  pieStyle: {
    innerRadius: 0,
    outerRadius: 60,
    startAngle: 90,
    endAngle: -270,
    strokeWidth: 1,
    strokeColor: '#FFFFFF'
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 0
  },
  values: {
    show: true,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    distanceFromCenter: 0.5,
    decimalPlaces: 2
  },
  legend: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#000000',
    squareSize: 10,
    gap: 20
  }
};

// Helper para formatar o valor com número específico de casas decimais
const formatValue = (value: number, decimalPlaces: number) => 
  value.toFixed(decimalPlaces);

// Helper para calcular a posição do texto dentro da fatia do pie
const calculateTextPosition = (
  value: number,
  total: number,
  radius: number,
  centerX: number,
  centerY: number,
  distanceFromCenter: number,
  startAngle: number,
  index: number,
  data: GrupoOperacaoData['operations']
) => {
  // Calcula o ângulo inicial da fatia atual somando os ângulos das fatias anteriores
  let currentStartAngle = startAngle;
  for (let i = 0; i < index; i++) {
    currentStartAngle -= (data[i].value / total) * 360;
  }

  // Calcula o ângulo da fatia atual
  const sliceAngle = (value / total) * 360;
  
  // Calcula o ângulo do meio da fatia
  const midAngle = ((currentStartAngle - (sliceAngle / 2)) * Math.PI) / 180;

  const x = centerX + Math.cos(midAngle) * (radius * distanceFromCenter);
  const y = centerY + Math.sin(midAngle) * (radius * distanceFromCenter);

  return { x, y };
};

// Helper para obter todas as operações únicas dos dados
const getUniqueOperations = (data: GrupoOperacaoData[]) => {
  const operations = new Map();
  
  data.forEach(frota => {
    frota.operations.forEach(op => {
      if (op.name !== 'null' && !operations.has(op.name)) {
        operations.set(op.name, op.color);
      }
    });
  });

  return Array.from(operations.entries()).map(([name, color]) => ({ name, color }));
};

const SinglePieChart: React.FC<{
  data: GrupoOperacaoData['operations'];
  frotaId: string;
  options: typeof defaultOptions;
}> = ({ data, frotaId, options: opts }) => {
  // Filtra apenas operações com valor > 0 e calcula o total
  const filteredData = data.filter(op => op.value > 0 && op.name !== 'null');
  const total = filteredData.reduce((sum, op) => sum + op.value, 0);

  // Calcula as dimensões do centro do gráfico
  const centerX = opts.pieStyle.outerRadius;
  const centerY = opts.pieStyle.outerRadius;

  return (
    <Box
      position="relative"
      width={opts.pieStyle.outerRadius * 2 + 40}
      height={opts.pieStyle.outerRadius * 2 + 40}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      {/* Título (ID da Frota) */}
      <Text
        fontSize={opts.title.fontSize}
        fontWeight={opts.title.fontWeight}
        color={opts.title.color}
        marginBottom={opts.title.marginBottom}
        textAlign="center"
      >
        {frotaId}
      </Text>

      {/* Container do Gráfico */}
      <Box 
        position="relative"
        width={opts.pieStyle.outerRadius * 2 + 40}
        height={opts.pieStyle.outerRadius * 2 + 40}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {/* Gráfico de Pizza */}
        <PieChart 
          width={opts.pieStyle.outerRadius * 2 + 40} 
          height={opts.pieStyle.outerRadius * 2 + 40}
        >
          <Pie
            data={filteredData}
            dataKey="value"
            nameKey="name"
            cx={centerX + 20}
            cy={centerY + 20}
            innerRadius={opts.pieStyle.innerRadius}
            outerRadius={opts.pieStyle.outerRadius}
            startAngle={opts.pieStyle.startAngle}
            endAngle={opts.pieStyle.endAngle}
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={opts.pieStyle.strokeColor}
                strokeWidth={opts.pieStyle.strokeWidth}
              />
            ))}
          </Pie>
        </PieChart>

        {/* Valores */}
        {opts.values.show && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            {filteredData.map((op, index) => {
              const pos = calculateTextPosition(
                op.value,
                total,
                opts.pieStyle.outerRadius,
                centerX + 20,
                centerY + 20,
                opts.values.distanceFromCenter,
                opts.pieStyle.startAngle,
                index,
                filteredData
              );

              return (
                <text
                  key={index}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={opts.values.color}
                  fontSize={opts.values.fontSize}
                  fontWeight={opts.values.fontWeight}
                >
                  {formatValue(op.value, opts.values.decimalPlaces)}
                </text>
              );
            })}
          </svg>
        )}
      </Box>
    </Box>
  );
};

export const GraficoGrupoOperacao: React.FC<GrupoOperacaoProps> = ({
  data,
  options = {}
}) => {
  // Mescla as opções com os valores padrão
  const opts = {
    container: { ...defaultOptions.container, ...(options.container || {}) },
    pieStyle: { ...defaultOptions.pieStyle, ...(options.pieStyle || {}) },
    title: { ...defaultOptions.title, ...(options.title || {}) },
    values: { ...defaultOptions.values, ...(options.values || {}) },
    legend: { ...defaultOptions.legend, ...(options.legend || {}) }
  };

  // Obtém todas as operações únicas para a legenda
  const uniqueOperations = getUniqueOperations(data);

  return (
    <VStack 
      spacing={4} 
      width={opts.container.width}
      height={opts.container.height}
      padding={`${opts.container.padding.top}px ${opts.container.padding.right}px ${opts.container.padding.bottom}px ${opts.container.padding.left}px`}
    >
      {/* Container dos Gráficos */}
      <HStack spacing={16} width="100%" justifyContent="center" mb={2}>
        {data.map((frota, index) => (
          <SinglePieChart
            key={index}
            data={frota.operations}
            frotaId={frota.id}
            options={opts}
          />
        ))}
      </HStack>

      {/* Legenda */}
      <Flex 
        wrap="nowrap" 
        gap={opts.legend.gap} 
        justifyContent="center"
        width="100%"
        paddingX={4}
      >
        {uniqueOperations.map((op, index) => (
          <Flex key={index} alignItems="center" gap={2} minWidth="auto">
            <Square size={opts.legend.squareSize} bg={op.color} />
            <Text
              fontSize={opts.legend.fontSize}
              fontWeight={opts.legend.fontWeight}
              color={opts.legend.color}
              whiteSpace="nowrap"
            >
              {op.name}
            </Text>
          </Flex>
        ))}
      </Flex>
    </VStack>
  );
}; 