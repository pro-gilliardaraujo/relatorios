import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';

interface DataItem {
  frota?: string;
  valor?: number;
}

interface GraficoImpurezaVegetalProps {
  data: DataItem[];
  meta: number;
}

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: DataItem[] = [
  { frota: '7041', valor: 65.00 },
  { frota: '7042', valor: 65.74 }
];

export const GraficoImpurezaVegetal: React.FC<GraficoImpurezaVegetalProps> = ({ 
  data = defaultData,
  meta = 64.00
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && typeof item.valor === 'number' && item.valor > 0);
  
  // Usar dados padrão se não houver dados válidos
  const dadosFinais = dadosValidos ? data : defaultData;
  
  // Calcula a média
  const media = dadosFinais.reduce((acc, item) => acc + (item?.valor || 0), 0) / dadosFinais.length;

  // Ordena os dados (do maior para o menor)
  const sortedData = [...dadosFinais].sort((a, b) => (b?.valor || 0) - (a?.valor || 0));
  
  // Define as cores com base no valor (invertido, pois menor é melhor)
  const getBarColor = (value: number) => {
    if (value <= meta) return '#48BB78'; // verde para abaixo da meta
    if (value <= meta * 1.1) return '#9AE6B4'; // verde claro para valores próximos da meta
    
    // Gradiente de amarelo para vermelho para valores mais altos
    const percentage = 1 - Math.min(1, (value - meta * 1.1) / (meta * 0.5)); // 0 = vermelho, 1 = amarelo
    const r = 255;
    const g = Math.round(255 * percentage);
    const b = 0;
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Define cores dos cards com transparência
  const getCardBgColor = (color: string) => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    } else if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', ', 0.3)');
    }
    return color;
  };

  // Formata o valor com duas casas decimais
  const formatarValor = (valor: number) => {
    if (valor === undefined || valor === null) {
      return '0,00';
    }
    return valor.toFixed(2).replace('.', ',');
  };

  // Encontra o maior valor para definir a escala
  const maxValue = Math.max(...sortedData.map(item => item?.valor || 0), meta);
  const escala = Math.ceil(maxValue * 1.1); // 10% acima do maior valor

  return (
    <Box h="100%">
      <VStack spacing={1} align="stretch" h="100%" justify="center">
        {sortedData.map((item, index) => (
          <Box key={index} w="100%">
            <Flex justify="space-between" mb={1}>
              <Text fontSize="11px" fontWeight="bold" color="black">Frota {item?.frota || `-`}</Text>
              <Text fontSize="11px" fontWeight="bold" color={getBarColor(item?.valor || 0)}>
                {formatarValor(item?.valor || 0)} KG/TN
              </Text>
            </Flex>
            <Box position="relative" w="100%">
              {/* Barra de fundo */}
              <Flex w="100%" h="20px" bg="white" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                <Box 
                  h="100%" 
                  w={`${((item?.valor || 0) / escala) * 100}%`} 
                  bg={getBarColor(item?.valor || 0)}
                  borderRadius="md 0 0 md"
                />
              </Flex>
              
              {/* Linha vertical indicando a meta */}
              <Box 
                position="absolute" 
                top="0" 
                left={`${(meta / escala) * 100}%`} 
                h="23px"
                w="2px"
                bg="black"
                zIndex="2"
              />
            </Box>
            <Flex mt={1} justify="space-between">
              <Text fontSize="9px" color="gray.500">0</Text>
              <Text fontSize="9px" color="gray.500">
                Meta: {formatarValor(meta)} KG/TN
              </Text>
              <Text fontSize="9px" color="gray.500">{formatarValor(escala)} KG/TN</Text>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}; 