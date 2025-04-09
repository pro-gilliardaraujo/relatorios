import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { limparIdOperador, formatarExibicaoOperador } from '@/utils/formatters';

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
const META_USO_GPS = configManager.getMetas('colheita_diario').usoGPS;

export const GraficoUsoGPS: React.FC<GraficoUsoGPSProps> = ({ 
  data = [],
  meta = META_USO_GPS,
  exibirCards = false
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.porcentagem === 'number' && item.porcentagem >= 0);
  
  // Log para diagnóstico
  console.log('📊 GraficoUsoGPS recebeu dados:', 
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
  
  // Calcular a média de porcentagem
  const mediaPorcentagem = data.reduce((acc, item) => acc + (item?.porcentagem || 0), 0) / data.length;
  
  // Sempre usar 100 como base para escala máxima para manter a proporcionalidade
  const maxValueForScale = 100;
  
  // Calcula onde ficará a linha de meta na escala relativa (em porcentagem de maxValueForScale)
  const metaScaled = (meta / maxValueForScale) * 100;
  
  // Função de escala para garantir que valores não ultrapassem maxValueForScale
  const scalePercentage = (porcentagem: number) => {
    const scaledValue = (porcentagem / maxValueForScale) * 100;
    return Math.min(scaledValue, 100);
  };

  // Ordena por porcentagem (do maior para o menor)
  const sortedData = [...data].sort((a, b) => (b?.porcentagem || 0) - (a?.porcentagem || 0));
  
  // Define as cores com base no valor da porcentagem (maior melhor)
  const getBarColor = (value: number) => {
    if (value >= meta) return '#48BB78'; // verde para bom (acima ou igual à meta)
    if (value >= meta * 0.8) return '#ECC94B'; // amarelo para médio (até 20% abaixo da meta)
    return '#E53E3E'; // vermelho para ruim (abaixo de 80% da meta)
  };

  return (
    <Box h="100%">      
      {/* Container principal apenas para o gráfico */}
      <Box h="100%" overflowY="auto">
        <VStack spacing={0} align="stretch">
          {sortedData.map((item, index) => {
            // Limpar o ID do operador para remover numerações desnecessárias
            const idLimpo = limparIdOperador(item.id);
            
            // Formatar a exibição do operador baseado no ID limpo
            const operadorExibicao = formatarExibicaoOperador(idLimpo, item.nome);
            
            return (
              <Box 
                key={index}
                py={0.5}
                px={1}
                bg={index % 2 === 0 ? "gray.50" : "white"}
                borderRadius="sm"
              >
                {/* Primeira linha: Nome do operador (com ID apenas se for relevante) */}
                <Text 
                  fontSize="10px" 
                  fontWeight="medium" 
                  noOfLines={1} 
                  title={operadorExibicao} 
                  mb={0.5} 
                  color="black"
                >
                  {operadorExibicao}
                </Text>
                
                {/* Segunda linha: Barra de progresso e valor percentual */}
                <Flex direction="row" align="center">
                  <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 40px)" bg="gray.100">
                    {/* Barra de progresso */}
                    <Flex 
                      position="absolute" 
                      bg={getBarColor(item.porcentagem)} 
                      h="100%" 
                      w={`${scalePercentage(item.porcentagem)}%`}
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
                  <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={getBarColor(item.porcentagem)}>
                    {item.porcentagem !== undefined ? item.porcentagem.toFixed(1) : "0.0"}%
                  </Text>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}; 