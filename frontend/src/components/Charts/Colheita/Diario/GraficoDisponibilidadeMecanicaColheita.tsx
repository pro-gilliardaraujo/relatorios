import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';

interface DisponibilidadeData {
  frota: string;
  disponibilidade: number;
}

interface DisponibilidadeMecanicaProps {
  data?: DisponibilidadeData[];
  meta?: number;
  exibirCards?: boolean;
}

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: DisponibilidadeData[] = [
  { frota: '7041', disponibilidade: 94.49 },
  { frota: '7042', disponibilidade: 92.82 }
];

export const GraficoDisponibilidadeMecanicaColheita: React.FC<DisponibilidadeMecanicaProps> = ({ 
  data = defaultData,
  meta = 0,
  exibirCards = false
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && typeof item.disponibilidade === 'number' && item.disponibilidade > 0);
  
  // Usar dados padrão se não houver dados válidos
  const dadosFinais = dadosValidos ? data : defaultData;
  
  // Calcula a média de disponibilidade
  const mediaDisponibilidade = dadosFinais.reduce((acc, item) => acc + (item?.disponibilidade || 0), 0) / dadosFinais.length;

  // Ordena os dados de disponibilidade (do maior para o menor)
  const sortedData = [...dadosFinais].sort((a, b) => (b?.disponibilidade || 0) - (a?.disponibilidade || 0));
  
  // Define as cores com base no valor da disponibilidade
  const getBarColor = (value: number) => {
    if (value >= meta) return '#48BB78'; // verde para acima da meta (90%)
    if (value >= 80) return '#9AE6B4'; // verde claro para valores entre 80% e meta
    
    // Gradiente de amarelo para vermelho para valores abaixo de 80%
    const percentage = Math.max(0, value) / 80; // 0 = vermelho, 1 = amarelo
    const r = 255;
    const g = Math.round(255 * percentage);
    const b = 0;
    
    return `rgb(${r}, ${g}, ${b})`;
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

  // Formata o valor de porcentagem com vírgula em vez de ponto (pt-BR)
  const formatarPorcentagem = (valor: number) => {
    if (valor === undefined || valor === null) {
      return '0,00%';
    }
    return valor.toFixed(2).replace('.', ',') + '%';
  };

  const metaCardColor = getCardBgColor('#48BB78'); // Verde com transparência
  const mediaCardColor = getCardBgColor(getBarColor(mediaDisponibilidade)); // Cor dinâmica com transparência

  return (
    <Box h="100%">
      <VStack spacing={1} align="stretch" h="100%" justify="center">
        {sortedData.map((item, index) => (
          <Box key={index} w="100%">
            <Flex justify="space-between" mb={1}>
              <Text fontSize="11px" fontWeight="bold" color="black">Frota {item?.frota || `-`}</Text>
              <Text fontSize="11px" fontWeight="bold" color={getBarColor(item?.disponibilidade || 0)}>
                {formatarPorcentagem(item?.disponibilidade || 0)}
              </Text>
            </Flex>
            <Box position="relative" w="100%">
              {/* Barra de fundo */}
              <Flex w="100%" h="20px" bg="gray.100" borderRadius="md" overflow="hidden">
                <Box 
                  h="100%" 
                  w={`${item?.disponibilidade || 0}%`} 
                  bg={getBarColor(item?.disponibilidade || 0)}
                  borderRadius="md 0 0 md"
                />
              </Flex>
              
              {/* Linha vertical indicando a meta de disponibilidade mecânica (90%) */}
              <Box 
                position="absolute" 
                top="0" 
                left={`${meta}%`} 
                h="23px"
                w="2px"
                bg="black"
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
        ))}
      </VStack>
    </Box>
  );
}; 