import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface HorasElevadorData {
  id: string;
  nome: string;
  horas: number;
}

interface HorasElevadorProps {
  data: HorasElevadorData[];
  meta?: number;
  exibirCards?: boolean;
}

// Obter a meta do configManager
const META_HORAS_ELEVADOR = configManager.getMetas('colheita_diario').horaElevador;

// Dados de exemplo removidos

export const GraficoHorasElevador: React.FC<HorasElevadorProps> = ({ 
  data = [],
  meta = META_HORAS_ELEVADOR,
  exibirCards = false
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.horas === 'number' && item.horas > 0);
  
  // Log para diagnóstico
  console.log('📊 GraficoHorasElevador recebeu dados:', 
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
  
  // Calcula a média de horas
  const mediaHoras = data.reduce((acc, item) => acc + (item?.horas || 0), 0) / data.length;
  
  // Encontra o valor máximo para definir a escala
  const maxHoras = Math.max(...data.map(item => item?.horas || 0));
  
  // Para "maior melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxHoras, meta * 1.2); // Garante que a meta fique visível
  
  // Função de escala para garantir que a visualização fique adequada
  const scalePercentage = (horas: number) => Math.min((horas / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por horas (do maior para o menor)
  const sortedData = [...data].sort((a, b) => b.horas - a.horas);
  
  // Define as cores com base no valor das horas (maior melhor)
  const getBarColor = (value: number) => {
    if (value >= meta) return '#48BB78'; // verde para bom
    if (value >= meta * 0.8) return '#ECC94B'; // amarelo para médio
    return '#E53E3E'; // vermelho para ruim
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
                    bg={getBarColor(item.horas)} 
                    h="100%" 
                    w={`${scalePercentage(item.horas)}%`}
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
                <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={getBarColor(item.horas)}>
                  {item.horas !== undefined ? item.horas.toFixed(1) : "0.0"}h
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}; 