import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { limparIdOperador, formatarExibicaoOperador } from '@/utils/formatters';

interface MotorOciosoData {
  id: string;
  nome: string;
  percentual: number;
  tempoTotal?: number; // Tempo total em horas
  tempoOcioso?: number; // Tempo ocioso em horas
}

interface MotorOciosoSemanalProps {
  data: MotorOciosoData[];
  meta?: number;
}

// Valores padrão para cores e tolerâncias
const DEFAULT_COLORS = {
  meta_atingida: '#48BB78', // Verde
  proximo_meta: '#90EE90', // Verde claro
  alerta: '#ECC94B', // Amarelo
  critico: '#E53E3E' // Vermelho
};

const DEFAULT_TOLERANCES = {
  proximo_meta: 5,
  alerta: 15
};

// Valores padrão para formatação
const DEFAULT_FORMATTING = {
  decimal: {
    casas: 1,
    separador: "."
  },
  porcentagem: {
    casas: 1,
    separador: "."
  }
};

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: MotorOciosoData[] = [
  { id: '1', nome: 'SEM OPERADOR', percentual: 12.5, tempoTotal: 10, tempoOcioso: 1.25 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', percentual: 8.7, tempoTotal: 20, tempoOcioso: 1.74 }
];

export const GraficoMotorOciosoSemanal: React.FC<MotorOciosoSemanalProps> = ({ 
  data = [],
  meta = configManager.getMetas('colheita_semanal').motorOcioso
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.percentual === 'number');
  
  // Se não tiver dados válidos, usar dados padrão
  const dadosFinais = dadosValidos ? data : defaultData;

  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;

  // Calcular tempos faltantes se necessário
  const dadosProcessados = dadosFinais.map(item => {
    let tempoTotal = item.tempoTotal;
    let tempoOcioso = item.tempoOcioso;
    
    // Se tiver percentual mas não tiver algum dos tempos, calcular baseado no outro
    if (typeof tempoTotal === 'number' && typeof tempoOcioso !== 'number' && item.percentual) {
      tempoOcioso = tempoTotal * (item.percentual / 100);
    } else if (typeof tempoOcioso === 'number' && typeof tempoTotal !== 'number' && item.percentual) {
      tempoTotal = tempoOcioso / (item.percentual / 100);
    }
    
    return {
      ...item,
      tempoTotal: tempoTotal || 0,
      tempoOcioso: tempoOcioso || 0
    };
  });

  // Ordena por percentual (do menor para o maior, pois menor é melhor)
  const sortedData = [...dadosProcessados].sort((a, b) => a.percentual - b.percentual);
  
  // Define as cores com base no valor (menor melhor)
  const getBarColor = (value: number) => {
    if (value <= meta) return cores.meta_atingida;
    if (value <= meta * 1.5) return cores.proximo_meta;
    if (value <= meta * 2) return cores.alerta;
    return cores.critico;
  };

  // Formatar horas para exibição
  const formatHoras = (horas: number): string => {
    return horas.toFixed(1).replace('.', ',') + 'h';
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
      <Box h="100%" overflowY="auto">
        <VStack spacing={1} align="stretch">
          {sortedData.map((item, index) => {
            // Limpar e formattar nome do operador
            const idOperador = limparIdOperador(item.id);
            const nomeOperador = formatarExibicaoOperador(item.nome, idOperador);
            const percentual = item.percentual;
            const percentualFormatado = percentual.toFixed(formatacao.porcentagem.casas) + '%';
            
            // Calcular valor da meta em horas de forma segura
            const metaEmHoras = item.tempoTotal && meta ? (meta * item.tempoTotal / 100) : 0;
            const metaEmHorasFormatado = metaEmHoras ? metaEmHoras.toFixed(1) : '0.0';
            
            return (
              <Box 
                key={index}
                py={1}
                px={2}
                bg={index % 2 === 0 ? "gray.50" : "white"}
                borderRadius="sm"
              >
                {/* Primeira linha: Nome do operador */}
                <Text 
                  fontSize="10px" 
                  fontWeight="medium" 
                  noOfLines={1} 
                  title={nomeOperador} 
                  mb={1} 
                  color="black"
                >
                  {nomeOperador}
                </Text>
                
                {/* Segunda linha: Valores de tempo e barra empilhada */}
                <Flex direction="row" align="center" justify="space-between">
                  {/* Grupo de Tempo Ocioso à esquerda */}
                  <Flex direction="column" align="center" minW="55px">
                    <Text fontSize="9px" color={cores.critico} fontWeight="medium">
                      {formatHoras(item.tempoOcioso || 0)}
                    </Text>
                    <Text fontSize="8px" color={cores.critico}>Tempo Ocioso</Text>
                  </Flex>
                  
                  {/* Barra empilhada */}
                  <Box flex="1" h="16px" position="relative" mx={2}>
                    {/* Barra de fundo total (verde) */}
                    <Flex 
                      w="100%" 
                      h="100%" 
                      bg={cores.meta_atingida}
                      borderRadius="md"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      {/* Barra de tempo ocioso sobreposta (vermelha) */}
                      <Box 
                        h="100%" 
                        w={`${percentual}%`} 
                        bg={cores.critico}
                        borderRadius="md 0 0 md"
                      />
                    </Flex>
                    
                    {/* Linha vertical indicando a meta */}
                    <Box 
                      position="absolute" 
                      top="0" 
                      left={`${meta}%`} 
                      h="16px"
                      w="2px"
                      bg="rgba(0,0,0,0.7)"
                      zIndex="2"
                      title={`Meta: ${meta}% (${metaEmHorasFormatado}h)`}
                    />
                  </Box>
                  
                  {/* Grupo de Tempo Ligado à direita */}
                  <Flex direction="column" align="center" minW="55px">
                    <Text fontSize="9px" color={cores.meta_atingida} fontWeight="medium">
                      {formatHoras(item.tempoTotal || 0)}
                    </Text>
                    <Text fontSize="8px" color={cores.meta_atingida}>Tempo Ligado</Text>
                  </Flex>
                  
                  {/* Percentual */}
                  <Text 
                    fontSize="10px" 
                    fontWeight="bold" 
                    minW="35px" 
                    textAlign="right" 
                    color={getBarColor(percentual)}
                  >
                    {percentualFormatado}
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

export default GraficoMotorOciosoSemanal; 