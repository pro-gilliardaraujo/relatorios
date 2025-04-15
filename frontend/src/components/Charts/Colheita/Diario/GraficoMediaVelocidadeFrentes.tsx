import React, { useState } from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';

const GraficoMediaVelocidadeFrentes: React.FC = () => {
  const [dadosValidos, setDadosValidos] = useState(true);
  const [data, setData] = useState([
    { frente: 'Frente 1', velocidade: 50 },
    { frente: 'Frente 2', velocidade: 60 },
    { frente: 'Frente 3', velocidade: 70 },
    { frente: 'Frente 4', velocidade: 80 },
    { frente: 'Frente 5', velocidade: 90 },
  ]);

  const metaFinal = 70;
  const metaScaled = 50;

  const scalePercentage = (velocidade: number) => {
    return ((velocidade - 50) / (90 - 50)) * 100;
  };

  const sortedData = [...data].sort((a, b) => a.velocidade - b.velocidade);

  // Define as cores com base no valor (menor é melhor)
  const getBarColor = (value: number) => {
    if (value <= metaFinal) return '#48BB78'; // verde para bom (abaixo ou igual à meta)
    return '#E53E3E'; // vermelho para ruim (acima da meta)
  };

  // Se não tiver dados, mostrar mensagem
  if (!dadosValidos && data.length === 0) {
    return (
      <Center h="100%" flexDirection="column">
        <Text fontSize="14px" color="gray.500" fontWeight="medium">Sem dados disponíveis</Text>
        <Text fontSize="12px" color="gray.400">Verifique o relatório selecionado</Text>
      </Center>
    );
  }

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
              {/* Primeira linha: Nome da frente */}
              <Text 
                fontSize="10px" 
                fontWeight="medium" 
                noOfLines={1} 
                title={item.frente} 
                mb={0.5} 
                color="black"
              >
                {item.frente}
              </Text>
              
              {/* Segunda linha: Barra de progresso e valor de velocidade */}
              <Flex direction="row" align="center">
                <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 50px)">
                  <Flex 
                    position="absolute" 
                    bg={getBarColor(item.velocidade)} 
                    h="100%" 
                    w={`${scalePercentage(item.velocidade)}%`}
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
                <Text 
                  fontSize="10px" 
                  fontWeight="bold" 
                  w="45px" 
                  textAlign="right" 
                  color={getBarColor(item.velocidade)}
                  whiteSpace="nowrap"
                  overflow="visible"
                  flexShrink={0}
                >
                  {item.velocidade.toFixed(2).replace('.', ',')} km/h
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default GraficoMediaVelocidadeFrentes; 