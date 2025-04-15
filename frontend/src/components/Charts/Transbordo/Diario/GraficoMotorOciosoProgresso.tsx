'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface OperadorData {
  id: string;
  nome: string;
  percentual: number;
  horasTotal?: number;  // Adicionando campo de horas totais
}

interface MotorOciosoProgressoProps {
  data: OperadorData[];
  meta?: number;
}

export const GraficoMotorOciosoProgresso: React.FC<MotorOciosoProgressoProps> = ({ 
  data,
  meta = 6 // Meta padrão de 6%
}) => {
  // Filtrar dados de operadores (remover TROCA DE TURNO)
  const operadores = data.filter(item => 
    item.nome && !['TROCA DE TURNO', '0', 'SEM OPERADOR'].includes(item.nome)
  );
  
  // Determinar a cor da barra de tempo ocioso com base na comparação com a meta
  const getBarColor = (percentual: number) => {
    if (percentual <= meta) {
      return '#48BB78'; // Verde se estiver dentro da meta
    } else if (percentual <= meta * 1.05) {
      return '#98FB98'; // Verde claro se estiver até 5% acima da meta
    } else if (percentual <= meta * 1.15) {
      return '#ECC94B'; // Amarelo se estiver até 15% acima da meta
    } else {
      return '#E53E3E'; // Vermelho se estiver mais de 15% acima da meta
    }
  };
  
  // Ordenar operadores pelo percentual (do maior para o menor)
  const operadoresOrdenados = [...operadores].sort((a, b) => b.percentual - a.percentual);
  
  return (
    <Box p={4} h="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <VStack spacing={5} w="100%" align="stretch">      
        {/* Barras individuais por operador */}
        {operadoresOrdenados.map((op, index) => {
          // A diferença é que agora calculamos a posição da meta com base nas horas totais
          // Se não houver horasTotal, continuamos usando a mesma lógica anterior
          
          // Meta de tempo ocioso em percentual (ainda é usada para a cor)
          const metaPercentual = meta;
          
          // Calculando a largura da área da meta - isso não muda pois a meta
          // é expressa em percentual do tempo total, não em horas absolutas
          const metaWidth = metaPercentual;
          
          return (
            <Box key={op.id || index} mb={3}>
              <Flex justify="space-between" mb={1}>
                <Text fontWeight="bold" fontSize="13px" noOfLines={1} title={op.nome} color="black">
                  {op.nome}
                </Text>
                <Text fontWeight="bold" fontSize="13px" color="black">
                  {op.percentual.toFixed(2)}%
                </Text>
              </Flex>
              
              <Box position="relative" height="30px">
                {/* Barra de fundo verde (100%) */}
                <Box 
                  position="absolute"
                  width="100%"
                  height="100%"
                  bg="#22C35E"
                  border="1px solid black"
                  borderRadius="sm"
                />
                
                {/* Barra central branca (área da meta) */}
                <Box 
                  position="absolute"
                  left="50%"
                  transform="translateX(-50%)"
                  width={`${metaWidth}%`}
                  height="100%"
                  bg="white"
                  zIndex={1}
                />
                
                {/* Barra de percentual ocioso */}
                <Box 
                  position="absolute"
                  width={`${op.percentual}%`}
                  height="100%"
                  bg={getBarColor(op.percentual)}
                  zIndex={2}
                  borderRight="1px solid rgba(0,0,0,0.5)"
                />
              </Box>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}; 