import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { formatarFrota } from '@/utils/formatters';

interface VelocidadeMediaData {
  id: string;
  nome: string;
  velocidade: number;
}

interface GraficoMediaVelocidadeSemanalProps {
  data: VelocidadeMediaData[];
  meta?: number;
  tipo?: 'colheita' | 'transbordo';
}

// Obter a meta do configManager com base no tipo
const getMeta = (tipo: 'colheita' | 'transbordo'): number => {
  return tipo === 'colheita' 
    ? configManager.getMetas('colheita_semanal').mediaVelocidade || 7
    : configManager.getMetas('transbordo_semanal').mediaVelocidade || 15;
};

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: VelocidadeMediaData[] = [
  { id: '7041', nome: 'Frota 7041', velocidade: 6.8 },
  { id: '7042', nome: 'Frota 7042', velocidade: 6.2 }
];

export const GraficoMediaVelocidadeSemanal: React.FC<GraficoMediaVelocidadeSemanalProps> = ({ 
  data = [],
  meta,
  tipo = 'colheita'
}) => {
  // Definir meta baseada no tipo se não for especificada
  const metaFinal = meta ?? getMeta(tipo);
  
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.velocidade === 'number' && item.velocidade > 0);
  
  // Log para diagnóstico
  console.log('📊 GraficoMediaVelocidadeSemanal recebeu dados:', 
    Array.isArray(data) ? `${data.length} itens` : 'não é array',
    dadosValidos ? 'válidos' : 'inválidos');
    
  if (Array.isArray(data) && data.length > 0) {
    console.log('📊 Amostra de dados:', data.slice(0, 2));
  }
  
  // Se não tiver dados válidos, mostrar mensagem ou usar dados padrão
  const dadosFinais = dadosValidos ? data : defaultData;
  
  // Calcula a média de velocidade
  const mediaVelocidade = dadosFinais.reduce((acc, item) => acc + (item?.velocidade || 0), 0) / dadosFinais.length;
  
  // Encontra o valor máximo para definir a escala
  const maxVelocidade = Math.max(...dadosFinais.map(item => item?.velocidade || 0), metaFinal * 1.2);
  
  // Velocidade é MENOR MELHOR
  // Escalar para garantir visualização adequada
  const scalePercentage = (velocidade: number) => Math.min((velocidade / maxVelocidade) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (metaFinal / maxVelocidade) * 100;

  // Ordena por velocidade (do menor para o maior, pois menor é melhor)
  const sortedData = [...dadosFinais].sort((a, b) => a.velocidade - b.velocidade);
  
  // Define as cores com base no valor (menor é melhor)
  const getBarColor = (value: number) => {
    if (value <= metaFinal) return '#48BB78'; // verde para bom (abaixo ou igual à meta)
    if (value <= metaFinal * 1.2) return '#ECC94B'; // amarelo para médio (até 20% acima da meta)
    return '#E53E3E'; // vermelho para ruim (mais de 20% acima da meta)
  };

  // Formata o valor com uma casa decimal
  const formatarValor = (valor: number) => {
    if (valor === undefined || valor === null) {
      return '0,0';
    }
    return valor.toFixed(2).replace('.', ',');
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
      <VStack spacing={1} align="stretch" h="100%" justify="center">
        {sortedData.map((item, index) => {
          // Formatar o código da frota
          const frotaFormatada = formatarFrota(item?.id || '');
          
          return (
            <Box key={index} w="100%">
              <Flex justify="space-between" mb={1}>
                <Text fontSize="11px" fontWeight="bold" color="black">Frota {frotaFormatada}</Text>
                <Text fontSize="11px" fontWeight="bold" color={getBarColor(item?.velocidade || 0)}>
                  {formatarValor(item?.velocidade || 0)} km/h
                </Text>
              </Flex>
              <Box position="relative" w="100%">
                {/* Barra de fundo */}
                <Flex w="100%" h="20px" bg="white" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                  <Box 
                    h="100%" 
                    w={`${scalePercentage(item?.velocidade || 0)}%`} 
                    bg={getBarColor(item?.velocidade || 0)}
                    borderRadius="md 0 0 md"
                  />
                </Flex>
                
                {/* Linha vertical indicando a meta */}
                <Box 
                  position="absolute" 
                  top="0" 
                  left={`${metaScaled}%`} 
                  h="23px"
                  w="2px"
                  bg="rgba(0,0,0,0.7)"
                  zIndex="2"
                />
              </Box>
              <Flex mt={1} justify="space-between">
                <Text fontSize="9px" color="gray.500">0</Text>
                <Text fontSize="9px" color="gray.500">
                  Meta: {formatarValor(metaFinal)} km/h
                </Text>
                <Text fontSize="9px" color="gray.500">{formatarValor(maxVelocidade)} km/h</Text>
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default GraficoMediaVelocidadeSemanal; 