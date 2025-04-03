'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';

interface MotorOciosoData {
  id: string;
  nome: string;
  percentual: number;
}

interface MotorOciosoProps {
  data: MotorOciosoData[];
  meta?: number;
  inverterMeta?: boolean;
  exibirCards?: boolean;
}

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: MotorOciosoData[] = [
  { id: '1', nome: 'SEM OPERADOR', percentual: 28.1 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', percentual: 25.1 },
  { id: '9999', nome: 'TROCA DE TURNO', percentual: 29.9 },
  { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', percentual: 22.0 },
  { id: '11', nome: 'NAO CADASTRADO', percentual: 19.4 },
  { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', percentual: 40.1 },
  { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', percentual: 31.5 },
  { id: '357887', nome: 'EVERTON TIAGO MARQUES', percentual: 32.0 },
  { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', percentual: 36.8 }
];

export const GraficoMotorOciosoTransbordo: React.FC<MotorOciosoProps> = ({ 
  data = defaultData,
  meta = 6, // Meta padrão de 6%
  inverterMeta = false,
  exibirCards = false
}) => {
  // Calcula a média de percentual ocioso
  const mediaPercentual = data.reduce((acc, item) => acc + item.percentual, 0) / data.length;
  
  // Encontra o valor máximo para definir a escala
  const maxPercentual = Math.max(...data.map(item => item.percentual));
  
  // Para "menor melhor", usamos 100% como referência para a escala
  const valorReferencia = 100;
  
  // Função de escala que mantém a proporção real dos valores
  const scalePercentage = (percentual: number) => percentual;
  
  // A meta agora será posicionada no seu valor real
  const metaScaled = meta;

  // Ordena por percentual (do maior para o menor)
  const sortedData = [...data].sort((a, b) => b.percentual - a.percentual);
  
  // Define as cores com base no valor do percentual (menor melhor)
  const getBarColor = (value: number) => {
    if (value > meta * 1.2) return "red.500"; // vermelho para ruim (mais de 20% acima da meta)
    if (value > meta) return "yellow.500"; // amarelo para médio (até 20% acima da meta)
    return "green.500"; // verde para bom (abaixo ou igual à meta)
  };

  // Define cores dos cards com transparência (0.3 para 30% de opacidade)
  const getCardBgColor = (color: string) => {
    if (color.startsWith('#')) {
      // Conversão simplificada de hex para rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    } else if (color.startsWith('rgb')) {
      // Se já for rgb, apenas adiciona alpha
      return color.replace('rgb', 'rgba').replace(')', ', 0.3)');
    }
    return color;
  };

  const metaCardColor = getCardBgColor('#48BB78'); // Verde com transparência
  const mediaCardColor = getCardBgColor(getBarColor(mediaPercentual));

  return (
    <Box h="100%">
      {/* Container principal apenas para o gráfico */}
      <Box h="100%" overflowY="auto">
        <VStack spacing={0} align="stretch">
          {sortedData.map((item, index) => (
            <Box 
              key={index}
              py={0.5}
              px={1}
              bg={index % 2 === 0 ? "gray.50" : "white"}
              borderRadius="sm"
            >
              {/* Primeira linha: ID e nome do operador */}
              <Text fontSize="10px" fontWeight="medium" noOfLines={1} title={`${item.id} - ${item.nome}`} mb={0.5} color="black">
                {item.id} - {item.nome}
              </Text>
              
              {/* Segunda linha: Barra de progresso e valor percentual */}
              <Flex direction="row" align="center">
                <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 40px)">
                  <Flex 
                    position="absolute" 
                    bg={getBarColor(item.percentual)} 
                    h="100%" 
                    w={`${scalePercentage(item.percentual)}%`}
                    borderRadius="sm"
                    alignItems="center"
                  />
                  
                  {/* Linha vertical indicando a meta */}
                  <Box 
                    position="absolute" 
                    top="0" 
                    left={`${metaScaled}%`} 
                    h="13px"
                    w="2px"
                    bg="rgba(0,0,0,0.7)"
                    zIndex="2"
                  />
                </Box>
                <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={getBarColor(item.percentual)}>
                  {item.percentual !== undefined ? item.percentual.toFixed(1) : "0"}%
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}; 