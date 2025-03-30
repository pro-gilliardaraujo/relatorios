import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { Box, Text, VStack, Flex } from '@chakra-ui/react';

/**
 * Estrutura dos dados para o gráfico de utilização RTK
 */
interface UtilizacaoRTKData {
  /** Nome/ID da máquina */
  name: string;
  /** Porcentagem de utilização do RTK */
  percentage: number;
}

/**
 * Props do componente GraficoUtilizacaoRTK
 */
interface GraficoUtilizacaoRTKProps {
  /** Array com os dados das máquinas */
  data: UtilizacaoRTKData[];
  
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
      /** Background do container para debug */
      debug?: boolean;
    };

    /** 
     * Configurações do item que contém o donut e o texto
     */
    item?: {
      /** Altura do item em pixels */
      height?: number;
      /** Largura do item em pixels */
      width?: number;
      /** Espaçamento entre os itens */
      gap?: number;
      /** Margens do item */
      margin?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
      /** Background do item para debug */
      debug?: boolean;
    };

    /** 
     * Estilização do gráfico de pizza
     */
    pieStyle?: {
      /** Raio interno do donut em pixels */
      innerRadius?: number;
      /** Raio externo do donut em pixels */
      outerRadius?: number;
      /** Cor para porcentagem de uso */
      fillUsage?: string;
      /** Cor para porcentagem de não uso */
      fillNonUsage?: string;
      /** Background do container do pie para debug */
      debug?: boolean;
    };
    
    /** 
     * Configurações dos textos
     */
    text?: {
      /** Configurações do texto da porcentagem */
      percentage?: {
        fontSize?: number;
        fontWeight?: string;
        color?: string;
        /** Ajuste vertical do texto da porcentagem */
        verticalOffset?: number;
      };
      /** Configurações do texto do nome */
      name?: {
        fontSize?: number;
        fontWeight?: string;
        color?: string;
        /** Posição do texto em relação ao donut */
        position?: 'bottom' | 'right';
        /** Distância do texto em relação ao donut */
        offset?: number;
        /** Alinhamento vertical do texto quando position é 'right' */
        verticalAlign?: 'top' | 'middle' | 'bottom';
      };
    };
  };
}

// Valores padrão para as opções
const defaultOptions = {
  container: {
    width: 180,
    height: 370,
    padding: {
      top: 0,
      right: 10,
      bottom: 10,
      left: 10
    }
  },
  item: {
    height: 90,
    width: 160,
    gap:2,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    debug: false
  },
  pieStyle: {
    innerRadius:32,
    outerRadius:48,
    fillUsage: '#009900',
    fillNonUsage: '#FF0000',
    debug: false
  },
  text: {
    percentage: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000000',
      verticalOffset: 0,
      textAlign: 'center'
    },
    name: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#000000',
      position: 'right',
      offset: 95,
      verticalAlign: 'middle'
    }
  }
};

export const GraficoUtilizacaoRTK: React.FC<GraficoUtilizacaoRTKProps> = ({
  data,
  options = {}
}) => {
  // Mescla as opções com os valores padrão
  const opts = {
    container: { ...defaultOptions.container, ...(options.container || {}) },
    item: { ...defaultOptions.item, ...(options.item || {}) },
    pieStyle: { ...defaultOptions.pieStyle, ...(options.pieStyle || {}) },
    text: {
      percentage: { ...defaultOptions.text.percentage, ...(options.text?.percentage || {}) },
      name: { ...defaultOptions.text.name, ...(options.text?.name || {}) }
    }
  };

  // Ordena os dados pelo número da máquina
  const sortedData = [...data].sort((a, b) => Number(a.name) - Number(b.name));

  // Calcula a altura disponível para cada item
  const totalItems = sortedData.length;
  const totalGapSpace = (totalItems - 1) * (opts.item.gap || 0);
  const containerPadding = {
    top: opts.container.padding?.top || 0,
    bottom: opts.container.padding?.bottom || 0
  };
  const availableHeight = (opts.container.height || 450) - containerPadding.top - containerPadding.bottom - totalGapSpace;
  const itemHeight = Math.floor(availableHeight / totalItems);

  // Helper para calcular o alinhamento vertical do texto
  const getVerticalAlignment = () => {
    switch(opts.text.name.verticalAlign) {
      case 'top': return '0%';
      case 'bottom': return '100%';
      default: return '50%';
    }
  };

  return (
    <Box 
      height={`${opts.container.height}px`}
      width={`${opts.container.width}px`}
      bg={opts.container.debug ? 'rgba(0, 0, 255, 0.1)' : 'transparent'}
      position="relative"
    >
      <Flex
        height="100%"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        py={0}
        mt={1}
      >
        {sortedData.map((item, index) => (
          <Box
            key={index}
            width="100%"
            display="flex"
            alignItems="center"
            bg={opts.item.debug ? 'rgba(255, 0, 0, 0.1)' : 'transparent'}
            position="relative"
          >
            <Box 
              position="relative"
              width={`${opts.pieStyle.outerRadius * 2 + 20}px`}
              height={`${opts.pieStyle.outerRadius * 2 + 20}px`}
              bg={opts.pieStyle.debug ? 'rgba(0, 255, 0, 0.1)' : 'transparent'}
              marginLeft="10px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <PieChart 
                width={opts.pieStyle.outerRadius * 2 + 20} 
                height={opts.pieStyle.outerRadius * 2 + 20}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              >
                <Pie
                  data={[
                    { name: 'usage', value: item.percentage },
                    { name: 'non-usage', value: 100 - item.percentage }
                  ]}
                  cx={(opts.pieStyle.outerRadius + 10)}
                  cy={(opts.pieStyle.outerRadius + 10)}
                  innerRadius={opts.pieStyle.innerRadius}
                  outerRadius={opts.pieStyle.outerRadius}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={1}
                  stroke="#FFFFFF"
                >
                  <Cell fill={opts.pieStyle.fillUsage} />
                  <Cell fill={opts.pieStyle.fillNonUsage} />
                </Pie>
              </PieChart>
              <Text
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize={opts.text.percentage.fontSize}
                fontWeight={opts.text.percentage.fontWeight}
                color={opts.text.percentage.color}
                textAlign="center"
                lineHeight="1"
                userSelect="none"
                zIndex="1"
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="100%"
                height="100%"
              >
                {item.percentage}%
              </Text>
            </Box>
            <Text
              position="absolute"
              left={`${opts.pieStyle.outerRadius * 2 + 25}px`}
              top={getVerticalAlignment()}
              transform={`translateY(-${opts.text.name.verticalAlign === 'middle' ? '50' : '0'}%)`}
              fontSize={opts.text.name.fontSize}
              fontWeight={opts.text.name.fontWeight}
              color={opts.text.name.color}
              whiteSpace="nowrap"
              userSelect="none"
              zIndex="1"
            >
              {item.name} - TP
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}; 