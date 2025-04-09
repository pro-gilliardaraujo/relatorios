'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { limparIdOperador, formatarExibicaoOperador } from '@/utils/formatters';

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

// Valores padrão para cores e tolerâncias
const DEFAULT_COLORS = {
  meta_atingida: '#48BB78',
  proximo_meta: '#90EE90',
  alerta: '#ECC94B',
  critico: '#E53E3E'
};

const DEFAULT_TOLERANCES = {
  proximo_meta: 5,
  alerta: 15
};

// Valores padrão para formatação
const DEFAULT_FORMATTING = {
  decimal: {
    casas: 4,
    separador: "."
  },
  porcentagem: {
    casas: 2,
    separador: "."
  },
  horas: {
    formato: "Xh00m"
  }
};

export const GraficoFaltaApontamentoTransbordo: React.FC<FaltaApontamentoProps> = ({ 
  data = [],
  meta = configManager.getMetas('transbordo_diario').faltaApontamento,
  inverterMeta = true,
  exibirCards = false
}) => {
  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;

  // Calcula a média de percentual
  const mediaPercentual = data.reduce((acc, item) => acc + item.percentual, 0) / data.length;
  
  // Encontra o valor máximo para definir a escala
  const maxPercentual = Math.max(...data.map(item => item.percentual));
  
  // Para "menor melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxPercentual, meta * 1.2); // Garante que a meta fique visível
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (percentual: number) => Math.min((percentual / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por percentual (do menor para o maior - melhor performance no topo)
  const sortedData = [...data].sort((a, b) => a.percentual - b.percentual);
  
  // Define as cores com base no valor do percentual (menor melhor)
  const getBarColor = (value: number) => {
    const diferenca = ((value - meta) / meta) * 100;

    if (value <= meta) return cores.meta_atingida;
    if (diferenca <= tolerancias.proximo_meta) return cores.proximo_meta;
    if (diferenca <= tolerancias.alerta) return cores.alerta;
    return cores.critico;
  };

  return (
    <Box h="100%">
      {/* Container principal apenas para o gráfico */}
      <Box h="100%" overflowY="auto">
        <VStack spacing={0} align="stretch">
          {sortedData.map((item, index) => {
            const barColor = getBarColor(item.percentual);
            // Limpar o ID do operador para remover numerações desnecessárias
            const idLimpo = limparIdOperador(item.id);
            
            // Formatar a exibição do operador baseado no ID limpo
            const operadorExibicao = formatarExibicaoOperador(idLimpo, item.nome);
            
            return (
              <Box 
                key={index}
                py={0.5}
                px={1}
                bg={index % 2 === 0 ? "gray.50" : "white"}
                borderRadius="sm"
              >
                {/* Primeira linha: Nome do operador (com ID apenas se for relevante) */}
                <Text 
                  fontSize="10px" 
                  fontWeight="medium" 
                  noOfLines={1} 
                  title={operadorExibicao} 
                  mb={0.5} 
                  color="black"
                >
                  {operadorExibicao}
                </Text>
                
                {/* Segunda linha: Barra de progresso e valor percentual */}
                <Flex direction="row" align="center">
                  <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 40px)">
                    <Flex 
                      position="absolute" 
                      bg={barColor}
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
                  <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={barColor}>
                    {item.percentual.toFixed(formatacao.porcentagem.casas)}%
                  </Text>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}; 