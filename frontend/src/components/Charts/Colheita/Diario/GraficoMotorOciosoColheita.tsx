import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface MotorOciosoData {
  id: string;
  nome: string;
  percentual: number;
}

interface MotorOciosoProps {
  data: MotorOciosoData[];
  meta?: number;
}

// Obter a meta do configManager
const META_MOTOR_OCIOSO = configManager.getMetas('colheita_diario').motorOcioso;

// Dados de exemplo removidos

export const GraficoMotorOciosoColheita: React.FC<MotorOciosoProps> = ({ 
  data = [],
  meta = META_MOTOR_OCIOSO,
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.percentual === 'number' && item.percentual >= 0);
  
  // Log para diagnóstico
  console.log('📊 GraficoMotorOciosoColheita recebeu dados:', 
    Array.isArray(data) ? `${data.length} itens` : 'não é array',
    dadosValidos ? 'válidos' : 'inválidos');
    
  if (Array.isArray(data) && data.length > 0) {
    console.log('📊 Amostra de dados:', data.slice(0, 2));
  }
  
  // Se não tiver dados válidos, mostrar mensagem
  if (!dadosValidos) {
    return (
      <Center h="100%" flexDirection="column">
        <Text fontSize="14px" color="gray.500" fontWeight="medium">Sem dados disponíveis</Text>
        <Text fontSize="12px" color="gray.400">Verifique o relatório selecionado</Text>
      </Center>
    );
  }
  
  // Calcula a média de percentual de motor ocioso
  const mediaPercentual = data.reduce((acc, item) => acc + (item?.percentual || 0), 0) / data.length;
  
  // Encontra o valor máximo para definir a escala
  const maxPercentual = Math.max(...data.map(item => item?.percentual || 0), meta * 1.2);
  
  // Motor ocioso é MENOR MELHOR
  // Escalar para garantir visualização adequada
  const scalePercentage = (percentual: number) => Math.min((percentual / maxPercentual) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / maxPercentual) * 100;

  // Ordena por percentual (do menor para o maior, pois menor é melhor)
  const sortedData = [...data].sort((a, b) => a.percentual - b.percentual);
  
  // Define as cores com base no valor do percentual (menor melhor)
  const getBarColor = (value: number) => {
    if (value <= meta) return '#48BB78'; // verde para bom (abaixo ou igual à meta)
    if (value <= meta * 1.2) return '#ECC94B'; // amarelo para médio (até 20% acima da meta)
    return '#E53E3E'; // vermelho para ruim (acima de 120% da meta)
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
                  {item.percentual !== undefined ? item.percentual.toFixed(1) : "0.0"}%
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}; 