import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface DataItem {
  frota?: string;
  valor?: number;
}

interface GraficoTDHProps {
  data: DataItem[];
  meta?: number;
}

// Obter a meta do configManager
const META_TDH = configManager.getMetas('colheita_semanal').tdh;

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: DataItem[] = [
  { frota: '7041', valor: 0.010 },
  { frota: '7042', valor: 0.014 }
];

export const GraficoTDH: React.FC<GraficoTDHProps> = ({ 
  data = defaultData,
  meta = META_TDH
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && typeof item.valor === 'number' && item.valor > 0);
  
  // Usar dados padrão se não houver dados válidos
  const dadosFinais = dadosValidos ? data : defaultData;
  
  // Calcula a média
  const media = dadosFinais.reduce((acc, item) => acc + (item?.valor || 0), 0) / dadosFinais.length;

  // Ordena os dados (do menor para o maior - melhor performance no topo)
  const sortedData = [...dadosFinais].sort((a, b) => (a?.valor || 0) - (b?.valor || 0));
  
  // Define as cores com base no valor (menor melhor)
  const getBarColor = (value: number) => {
    if (value <= meta) return '#48BB78'; // verde para bom (abaixo ou igual à meta)
    if (value <= meta * 1.2) return '#ECC94B'; // amarelo para médio (até 20% acima da meta)
    return '#E53E3E'; // vermelho para ruim (mais de 20% acima da meta)
  };

  // Formata o valor com quatro casas decimais
  const formatarValor = (valor: number) => {
    if (valor === undefined || valor === null) {
      return '0,0000';
    }
    return valor.toFixed(4).replace('.', ',');
  };

  // Encontra o maior valor para definir a escala
  const maxValue = Math.max(...sortedData.map(item => item?.valor || 0));
  const escala = Math.max(maxValue, meta * 1.2); // Garante que a meta fique visível

  return (
    <Box h="100%">
      <VStack spacing={1} align="stretch" h="100%" justify="center">
        {sortedData.map((item, index) => (
          <Box key={index} w="100%">
            <Flex justify="space-between" mb={1}>
              <Text fontSize="11px" fontWeight="bold" color="black">Frota {item?.frota || `-`}</Text>
              <Text fontSize="11px" fontWeight="bold" color={getBarColor(item?.valor || 0)}>
                {formatarValor(item?.valor || 0)} LT/TN
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
                bg="rgba(0,0,0,0.7)"
                zIndex="2"
              />
            </Box>
            <Flex mt={1} justify="space-between">
              <Text fontSize="9px" color="gray.500">0</Text>
              <Text fontSize="9px" color="gray.500">
                Meta: {formatarValor(meta)} LT/TN
              </Text>
              <Text fontSize="9px" color="gray.500">{formatarValor(escala)} LT/TN</Text>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}; 