'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface DisponibilidadeData {
  frota: string;
  disponibilidade: number;
}

interface DisponibilidadeMecanicaProps {
  data?: DisponibilidadeData[];
  meta?: number;
  exibirCards?: boolean;
}

// Valores padrão para cores e tolerâncias
const DEFAULT_COLORS = {
  meta_atingida: '#48BB78',
  proximo_meta: '#98FB98',
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

export const GraficoDisponibilidadeMecanicaTransbordo: React.FC<DisponibilidadeMecanicaProps> = ({ 
  data = [],
  meta = configManager.getMetas('transbordo_diario').disponibilidadeMecanica,
  exibirCards = false
}) => {
  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;
  
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && typeof item.disponibilidade === 'number' && item.disponibilidade > 0);
  
  // Usar dados padrão se não houver dados válidos
  const dadosFinais = dadosValidos ? data : [];
  
  // Calcula a média de disponibilidade
  const mediaDisponibilidade = dadosFinais.reduce((acc, item) => acc + (item?.disponibilidade || 0), 0) / dadosFinais.length;

  // Ordena os dados de disponibilidade (do maior para o menor)
  const sortedData = [...dadosFinais].sort((a, b) => (b?.disponibilidade || 0) - (a?.disponibilidade || 0));
  
  // Define as cores com base no valor da disponibilidade
  const getBarColor = (value: number) => {
    const diferenca = ((value - meta) / meta) * 100;

    if (value >= meta) return cores.meta_atingida;
    if (diferenca >= -tolerancias.proximo_meta) return cores.proximo_meta;
    if (diferenca >= -tolerancias.alerta) return cores.alerta;
    return cores.critico;
  };

  // Formata o valor de porcentagem com vírgula em vez de ponto (pt-BR)
  const formatarPorcentagem = (valor: number) => {
    if (valor === undefined || valor === null) {
      return '0,00%';
    }
    return valor.toFixed(formatacao.porcentagem.casas).replace('.', ',') + '%';
  };

  return (
    <Box h="100%">
      <VStack spacing={1} align="stretch" h="100%" justify="center">
        {sortedData.map((item, index) => {
          const barColor = getBarColor(item?.disponibilidade || 0);
          return (
            <Box key={index} w="100%">
              <Flex justify="space-between" mb={1}>
                <Text fontSize="11px" fontWeight="bold" color="black">Frota {item?.frota || `-`}</Text>
                <Text fontSize="11px" fontWeight="bold" color={barColor}>
                  {formatarPorcentagem(item?.disponibilidade || 0)}
                </Text>
              </Flex>
              <Box position="relative" w="100%">
                {/* Barra de fundo */}
                <Flex w="100%" h="20px" bg="gray.100" borderRadius="md" overflow="hidden">
                  <Box
                    h="100%"
                    w={`${item?.disponibilidade || 0}%`} 
                    bg={barColor}
                    borderRadius="md 0 0 md"
                  />
                </Flex>
                
                {/* Linha vertical indicando a meta */}
                <Box 
                  position="absolute"
                  top="0" 
                  left={`${meta}%`} 
                  h="23px"
                  w="2px"
                  bg="rgba(0,0,0,0.7)"
                  zIndex="2"
                />
              </Box>
              <Flex mt={1} justify="space-between">
                <Text fontSize="9px" color="gray.500">0%</Text>
                <Text fontSize="9px" color="gray.500">
                  Meta: {meta}%
                </Text>
                <Text fontSize="9px" color="gray.500">100%</Text>
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}; 