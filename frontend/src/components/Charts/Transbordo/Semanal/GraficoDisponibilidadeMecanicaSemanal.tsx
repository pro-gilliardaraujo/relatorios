import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

// Interface para os dados recebidos pelo componente
interface DisponibilidadeMecanicaData {
  frota: string;
  disponibilidade: number;
}

interface GraficoDisponibilidadeMecanicaSemanalProps {
  data: DisponibilidadeMecanicaData[];
  meta?: number;
}

// Valores padrão para cores e tolerâncias
const DEFAULT_COLORS = {
  meta_atingida: '#48BB78',     // Verde
  proximo_meta: '#90EE90',      // Verde claro
  alerta: '#ECC94B',            // Amarelo
  critico: '#E53E3E',           // Vermelho
};

// Valores padrão para formatação
const DEFAULT_FORMATTING = {
  porcentagem: {
    casas: 1,
    separador: "."
  }
};

export const GraficoDisponibilidadeMecanicaSemanal: React.FC<GraficoDisponibilidadeMecanicaSemanalProps> = ({
  data = [],
  meta = configManager.getMetas('transbordo_semanal').disponibilidadeMecanica || 90
}) => {
  // Obter configurações com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;
  
  // Filtrar e processar os dados
  const filteredData = data.filter(item => item && item.frota && item.frota !== '0');
  
  // Calcula a média de disponibilidade
  const mediaDisponibilidade = filteredData.length > 0 
    ? filteredData.reduce((acc, item) => acc + item.disponibilidade, 0) / filteredData.length
    : 0;
  
  // Encontra o valor máximo para definir a escala
  const maxDisponibilidade = Math.max(...filteredData.map(item => item.disponibilidade || 0), meta);
  
  // Para "maior melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxDisponibilidade, 100); // Garante que a escala alcance 100%
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (disponibilidade: number) => Math.min((disponibilidade / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por disponibilidade (do maior para o menor)
  const sortedData = [...filteredData].sort((a, b) => b.disponibilidade - a.disponibilidade);
  
  // Define as cores com base no valor da disponibilidade (maior melhor)
  const getBarColor = (value: number) => {
    if (value >= meta) return cores.meta_atingida;
    if (value >= meta * 0.95) return cores.proximo_meta;
    if (value >= meta * 0.85) return cores.alerta;
    return cores.critico;
  };

  return (
    <Box h="100%" overflowY="auto">
      <VStack spacing={1} align="stretch">
        {sortedData.map((item, index) => {
          const barColor = getBarColor(item.disponibilidade);
          const displayName = `Frota ${item.frota}`;
          
          return (
            <Box 
              key={index}
              py={1}
              px={2}
              bg={index % 2 === 0 ? "gray.50" : "white"}
              borderRadius="md"
            >
              {/* Primeira linha: Nome da frota e valor */}
              <Flex justify="space-between" mb={1}>
                <Text fontSize="11px" fontWeight="bold" color="black">
                  {displayName}
                </Text>
                <Text fontSize="11px" fontWeight="bold" color={barColor}>
                  {item.disponibilidade?.toFixed(formatacao.porcentagem.casas) || "0.0"}%
                </Text>
              </Flex>
              
              {/* Segunda linha: Barra de progresso */}
              <Box position="relative" w="100%">
                {/* Barra de fundo */}
                <Flex w="100%" h="16px" bg="white" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                  <Box 
                    h="100%" 
                    w={`${scalePercentage(item.disponibilidade || 0)}%`} 
                    bg={barColor}
                    borderRadius="md 0 0 md"
                  />
                </Flex>
                
                {/* Linha vertical indicando a meta */}
                <Box 
                  position="absolute" 
                  top="0" 
                  left={`${metaScaled}%`} 
                  h="18px"
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

export default GraficoDisponibilidadeMecanicaSemanal; 