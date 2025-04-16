import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { limparIdOperador, formatarExibicaoOperador, formatarHoras } from '@/utils/formatters';

interface DadosDisponibilidade {
  id: string;
  nome: string;
  horas: number;
  disponibilidade: number;
}

interface GraficoDisponibilidadeMecanicaProps {
  dados: DadosDisponibilidade[];
}

// Obter a meta do configManager
const META_DISPONIBILIDADE = configManager.getMetas('colheita_diario').disponibilidade;

export const GraficoDisponibilidadeMecanica: React.FC<GraficoDisponibilidadeMecanicaProps> = ({ dados }) => {
  if (!dados || dados.length === 0) {
    return (
      <Center h="100%">
        <Text>Nenhum dado disponível</Text>
      </Center>
    );
  }

  return (
    <VStack spacing={2} align="stretch" w="100%">
      {dados.map((item) => {
        const barColor = item.disponibilidade >= META_DISPONIBILIDADE ? '#48BB78' : '#E53E3E';
        
        return (
          <Box key={item.id} position="relative" h="20px">
            <Flex justify="space-between" align="center" h="100%">
              <Text fontSize="8px" w="100px" isTruncated>
                {formatarExibicaoOperador(item.id, item.nome)}
              </Text>
              
              <Box flex="1" h="100%" position="relative" ml={2}>
                <Box
                  h="100%"
                  w={`${Math.min(item.disponibilidade, 100)}%`}
                  bg={barColor}
                  position="absolute"
                  left="0"
                  transition="width 0.3s ease"
                />
                
                {/* Texto de horas - agora sempre visível */}
                <Text
                  position="absolute"
                  left="2px"
                  top="50%"
                  transform="translateY(-50%)"
                  fontSize="8px"
                  fontWeight="bold"
                  color={barColor === '#E53E3E' ? "white" : "black"}
                  zIndex={3}
                >
                  {formatarHoras(item.horas)}
                </Text>
              </Box>
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );
}; 