import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { formatarFrota } from '@/utils/formatters';

interface DisponibilidadeData {
  frota: string;
  disponibilidade: number;
}

interface DisponibilidadeMecanicaProps {
  data?: DisponibilidadeData[];
  meta?: number;
  exibirCards?: boolean;
}

// Obter a meta do configManager
const META_DISPONIBILIDADE_MECANICA = configManager.getMetas('colheita_diario').disponibilidadeMecanica;

// Dados de exemplo removidos

export const GraficoDisponibilidadeMecanicaColheita: React.FC<DisponibilidadeMecanicaProps> = ({ 
  data = [],
  meta = META_DISPONIBILIDADE_MECANICA,
  exibirCards = false
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && typeof item.disponibilidade === 'number' && item.disponibilidade > 0);
  
  // Log para diagnóstico
  console.log('📊 GraficoDisponibilidadeMecanicaColheita recebeu dados:', 
    Array.isArray(data) ? `${data.length} itens` : 'não é array', 
    dadosValidos ? 'válidos' : 'inválidos');
  
  if (Array.isArray(data) && data.length > 0) {
    console.log('📊 Amostra de dados:', data.slice(0, 2));
  }
  
  // Caso não haja dados válidos, exibir mensagem
  if (!dadosValidos) {
    return (
      <Center h="100%" flexDirection="column">
        <Text fontSize="14px" color="gray.500" fontWeight="medium">Sem dados disponíveis</Text>
        <Text fontSize="12px" color="gray.400">Verifique o relatório selecionado</Text>
      </Center>
    );
  }
  
  // Calcula a média de disponibilidade
  const mediaDisponibilidade = data.reduce((acc, item) => acc + (item?.disponibilidade || 0), 0) / data.length;

  // Ordena os dados de disponibilidade (do maior para o menor)
  const sortedData = [...data].sort((a, b) => (b?.disponibilidade || 0) - (a?.disponibilidade || 0));
  
  // Define as cores com base no valor da disponibilidade
  const getBarColor = (value: number) => {
    if (value >= meta) return '#48BB78'; // verde para acima da meta
    if (value >= meta * 0.8) return '#ECC94B'; // amarelo para próximo da meta
    return '#E53E3E'; // vermelho para abaixo da meta
  };

  // Formata o valor de porcentagem com vírgula em vez de ponto (pt-BR)
  const formatarPorcentagem = (valor: number) => {
    if (valor === undefined || valor === null) {
      return '0,00%';
    }
    return valor.toFixed(2).replace('.', ',') + '%';
  };

  return (
    <Box h="100%">
      <VStack spacing={1} align="stretch" h="100%" justify="center">
        {sortedData.map((item, index) => {
          // Formatar o código da frota como texto, removendo prefixos desnecessários
          const frotaFormatada = formatarFrota(item?.frota || '');
          
          return (
            <Box key={index} w="100%">
              <Flex justify="space-between" mb={1}>
                <Text fontSize="11px" fontWeight="bold" color="black">{frotaFormatada}</Text>
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
                
                {/* Linha vertical indicando a meta */}
                <Box 
                  position="absolute" 
                  top="0" 
                  left={`${meta}%`} 
                  h="23px"
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