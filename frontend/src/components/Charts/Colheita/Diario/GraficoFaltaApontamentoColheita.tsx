'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface FaltaApontamentoData {
  id: string;
  nome: string;
  percentual: number;
}

interface FaltaApontamentoProps {
  data: FaltaApontamentoData[];
  meta?: number;
  inverterMeta?: boolean;
  exibirCards?: boolean;
}

// Obter a meta do configManager
const META_FALTA_APONTAMENTO = configManager.getMetas('colheita_diario').faltaApontamento;

export const GraficoFaltaApontamentoColheita: React.FC<FaltaApontamentoProps> = ({ 
  data = [],
  meta = META_FALTA_APONTAMENTO, // Usa a meta do arquivo de configuração
  inverterMeta = false,
  exibirCards = false
}) => {
  // Calcula a média de percentual
  const mediaPercentual = data.reduce((acc, item) => acc + item.percentual, 0) / data.length;
  
  // Encontra o valor máximo para definir a escala
  const maxPercentual = Math.max(...data.map(item => item.percentual));
  
  // Para "menor melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxPercentual, meta * 2); // Garante que a meta fique visível mesmo com valores baixos
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (percentual: number) => Math.min((percentual / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por percentual (do menor para o maior - melhor performance no topo)
  const sortedData = [...data].sort((a, b) => a.percentual - b.percentual);
  
  // Define as cores com base no valor do percentual (menor melhor)
  const getBarColor = (value: number) => {
    if (value <= meta) return "green.500"; // verde para bom (abaixo ou igual à meta)
    if (value <= meta * 1.2) return "yellow.500"; // amarelo para médio (até 20% acima da meta)
    return "red.500"; // vermelho para ruim (mais de 20% acima da meta)
  };

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