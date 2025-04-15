import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { limparIdOperador, formatarExibicaoOperador } from '@/utils/formatters';

interface FaltaApontamentoData {
  id: string;
  nome: string;
  percentual: number;
}

interface FaltaApontamentoProps {
  data: FaltaApontamentoData[];
  meta?: number;
}

// Valores padrão para cores e tolerâncias
const DEFAULT_COLORS = {
  meta_atingida: '#48BB78',
  proximo_meta: '#90EE90',
  alerta: '#ECC94B',
  critico: '#E53E3E'
};

const DEFAULT_TOLERANCES = {
  proximo_meta: 5,
  alerta: 15
};

// Valores padrão para formatação
const DEFAULT_FORMATTING = {
  decimal: {
    casas: 4,
    separador: "."
  },
  porcentagem: {
    casas: 1,
    separador: "."
  },
  horas: {
    formato: "Xh00m"
  }
};

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: FaltaApontamentoData[] = [
  { id: '1', nome: 'Operador 1', percentual: 8.5 },
  { id: '2', nome: 'Operador 2', percentual: 9.2 },
  { id: '3', nome: 'Operador 3', percentual: 7.8 }
];

export const GraficoFaltaApontamentoSemanal: React.FC<FaltaApontamentoProps> = ({ 
  data = [],
  meta = configManager.getMetas('transbordo_semanal').faltaApontamento
}) => {
  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;
  
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.percentual === 'number' && item.percentual >= 0);
  
  // Log para diagnóstico
  console.log('📊 GraficoFaltaApontamentoSemanal recebeu dados:', 
    Array.isArray(data) ? `${data.length} itens` : 'não é array',
    dadosValidos ? 'válidos' : 'inválidos');
    
  if (Array.isArray(data) && data.length > 0) {
    console.log('📊 Amostra de dados:', data.slice(0, 2));
  }
  
  // Se não tiver dados válidos, mostrar mensagem ou usar dados padrão
  const dadosFinais = dadosValidos ? data : defaultData;
  
  // Calcula a média de percentual de falta de apontamento
  const mediaPercentual = dadosFinais.reduce((acc, item) => acc + (item?.percentual || 0), 0) / dadosFinais.length;
  
  // Encontra o valor máximo para definir a escala
  const maxPercentual = Math.max(...dadosFinais.map(item => item?.percentual || 0), meta * 1.2);
  
  // Falta de apontamento é MENOR MELHOR
  // Escalar para garantir visualização adequada
  const scalePercentage = (percentual: number) => Math.min((percentual / maxPercentual) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / maxPercentual) * 100;

  // Ordena por percentual (do menor para o maior, pois menor é melhor)
  const sortedData = [...dadosFinais].sort((a, b) => a.percentual - b.percentual);
  
  // Define as cores com base no valor do percentual (menor melhor - invertido)
  const getBarColor = (value: number) => {
    const diferenca = ((value - meta) / meta) * 100;

    // Para falta de apontamento, menor é melhor
    if (value <= meta) return cores.meta_atingida;
    if (diferenca <= tolerancias.proximo_meta) return cores.proximo_meta;
    if (diferenca <= tolerancias.alerta) return cores.alerta;
    return cores.critico;
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
                    {item.percentual !== undefined ? item.percentual.toFixed(formatacao.porcentagem.casas) : "0.0"}%
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

export default GraficoFaltaApontamentoSemanal; 