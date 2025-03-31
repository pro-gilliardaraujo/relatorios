import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';

interface GPSData {
  id: string;
  nome: string;
  porcentagem: number;
}

interface GraficoUsoGPSProps {
  data?: GPSData[];
  meta?: number;
  exibirCards?: boolean;
}

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: GPSData[] = [
  { id: '1', nome: 'SEM OPERADOR', porcentagem: 0.0 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', porcentagem: 0.0 },
  { id: '9999', nome: 'TROCA DE TURNO', porcentagem: 0.0 },
  { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', porcentagem: 0.0 },
  { id: '11', nome: 'NAO CADASTRADO', porcentagem: 0.0 },
  { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', porcentagem: 2.3 },
  { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', porcentagem: 1.7 },
  { id: '357887', nome: 'EVERTON TIAGO MARQUES', porcentagem: 0.0 },
  { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', porcentagem: 0.0 }
];

export const GraficoUsoGPS: React.FC<GraficoUsoGPSProps> = ({ 
  data = defaultData,
  // CONFIGURAÇÃO DE META: Percentual alvo de uso do GPS (valores mais altos são melhores)
  meta = 90,
  exibirCards = false
}) => {
  // Calcula a média de uso do GPS
  const mediaUsoGPS = data.reduce((acc, item) => acc + item.porcentagem, 0) / data.length;
  
  // Ordena os dados por porcentagem (do maior para o menor)
  const sortedData = [...data].sort((a, b) => b.porcentagem - a.porcentagem);
  
  // Define as cores com base na porcentagem
  const getColor = (porcentagem: number) => {
    if (porcentagem >= meta) return '#48BB78'; // verde para acima da meta
    if (porcentagem >= meta * 0.8) return '#ECC94B'; // amarelo para próximo da meta
    return '#E53E3E'; // vermelho para abaixo da meta
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
                    bg={getColor(item.porcentagem)}
                    h="100%"
                    w={`${Math.min(item.porcentagem, 100)}%`}
                    borderRadius="sm"
                    alignItems="center"
                  />
                  
                  {/* Linha vertical indicando a meta de uso do GPS (90%) */}
                  <Box 
                    position="absolute" 
                    top="0" 
                    left={`${Math.min(meta, 100)}%`} 
                    h="13px"
                    w="2px"
                    bg="rgba(0,0,0,0.7)"
                    zIndex="2"
                  />
                </Box>
                <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color="black">
                  {item.porcentagem.toFixed(1)}%
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}; 