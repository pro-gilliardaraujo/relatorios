'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface UsoGPSData {
  id: string;
  nome: string;
  porcentagem: number;
}

interface UsoGPSProps {
  data: UsoGPSData[];
  meta?: number;
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

export const GraficoUsoGPS: React.FC<UsoGPSProps> = ({ 
  data = [],
  meta = configManager.getMetas('transbordo_diario').usoGPS,
  exibirCards = false
}) => {
  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;

  // Calcula a média de uso do GPS
  const mediaUsoGPS = data.length > 0 
    ? data.reduce((acc, item) => acc + (item?.porcentagem || 0), 0) / data.length 
    : 0;
  
  // Encontra o valor máximo para definir a escala
  const maxPorcentagem = data.length > 0 
    ? Math.max(...data.map(item => item?.porcentagem || 0)) 
    : 0;
  
  // Para "maior melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxPorcentagem, meta * 1.2); // Garante que a meta fique visível
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (porcentagem: number) => Math.min((porcentagem / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por porcentagem (do maior para o menor) e filtra itens inválidos
  const sortedData = [...data]
    .filter(item => item && typeof item.porcentagem === 'number')
    .sort((a, b) => (b?.porcentagem || 0) - (a?.porcentagem || 0));
  
  // Define as cores com base no valor da porcentagem (maior melhor)
  const getBarColor = (value: number) => {
    if (typeof value !== 'number') return cores.critico;
    const diferenca = ((value - meta) / meta) * 100;

    if (value >= meta) return cores.meta_atingida;
    if (diferenca >= -tolerancias.proximo_meta) return cores.proximo_meta;
    if (diferenca >= -tolerancias.alerta) return cores.alerta;
    return cores.critico;
  };

  // Se não houver dados válidos, mostrar mensagem
  if (sortedData.length === 0) {
    return (
      <Box h="100%" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Sem dados disponíveis</Text>
      </Box>
    );
  }

  return (
    <Box h="100%">
      <Box h="100%" overflowY="auto">
        <VStack spacing={0} align="stretch">
          {sortedData.map((item, index) => {
            if (!item || typeof item.porcentagem !== 'number') return null;
            const barColor = getBarColor(item.porcentagem);
            const porcentagemFormatada = item.porcentagem.toFixed(formatacao.porcentagem.casas);
            
            return (
              <Box 
                key={index}
                py={0.5}
                px={1}
                bg={index % 2 === 0 ? "gray.50" : "white"}
                borderRadius="sm"
              >
                <Text fontSize="10px" fontWeight="medium" noOfLines={1} title={`${item.id || ''} - ${item.nome || ''}`} mb={0.5} color="black">
                  {item.id || ''} - {item.nome || ''}
                </Text>
                
                <Flex direction="row" align="center">
                  <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 40px)">
                    <Flex 
                      position="absolute" 
                      bg={barColor}
                      h="100%" 
                      w={`${scalePercentage(item.porcentagem)}%`}
                      borderRadius="sm"
                      alignItems="center"
                    />
                    
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
                    {porcentagemFormatada}%
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