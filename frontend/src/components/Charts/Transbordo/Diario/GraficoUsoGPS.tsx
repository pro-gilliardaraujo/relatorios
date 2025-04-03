'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface GPSData {
  id: string;
  nome: string;
  porcentagem: number;
}

interface GraficoUsoGPSProps {
  data: GPSData[];
  meta?: number;
  exibirCards?: boolean;
}

// Obter a meta do configManager
const META_USO_GPS = configManager.getMetas('transbordo_diario').usoGPS;

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: GPSData[] = [
  { id: '1', nome: 'SEM OPERADOR', porcentagem: 85.1 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', porcentagem: 92.1 },
  { id: '9999', nome: 'TROCA DE TURNO', porcentagem: 88.9 },
  { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', porcentagem: 95.0 },
  { id: '11', nome: 'NAO CADASTRADO', porcentagem: 87.4 },
  { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', porcentagem: 91.1 },
  { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', porcentagem: 89.5 },
  { id: '357887', nome: 'EVERTON TIAGO MARQUES', porcentagem: 93.0 },
  { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', porcentagem: 90.8 }
];

export const GraficoUsoGPS: React.FC<GraficoUsoGPSProps> = ({ 
  data = defaultData,
  meta = META_USO_GPS,
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
                    w={`${item.porcentagem}%`}
                    borderRadius="sm"
                    alignItems="center"
                  />
                
                  {/* Linha vertical indicando a meta */}
                  <Box 
                    position="absolute" 
                    top="0" 
                    left={`${meta}%`} 
                    h="13px"
                    w="2px"
                    bg="rgba(0,0,0,0.7)"
                    zIndex="2"
                  />
                </Box>
                <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={getColor(item.porcentagem)}>
                  {item.porcentagem !== undefined ? item.porcentagem.toFixed(1) : "0.0"}%
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}; 