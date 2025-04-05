import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface MotorOciosoData {
  id: string;
  nome: string;
  percentual: number;
}

interface MotorOciosoProps {
  data: MotorOciosoData[];
  meta?: number;
  inverterMeta?: boolean;
  exibirCards?: boolean;
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
    casas: 2,
    separador: "."
  },
  horas: {
    formato: "Xh00m"
  }
};

export const GraficoMotorOciosoColheita: React.FC<MotorOciosoProps> = ({ 
  data = [],
  meta = configManager.getMetas('colheita_diario').motorOcioso,
  inverterMeta = true,
  exibirCards = false
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.percentual === 'number');
  
  // Log para diagnóstico detalhado
  console.log('📊 GraficoMotorOciosoColheita recebeu dados:', 
    Array.isArray(data) ? `${data.length} itens` : 'não é array',
    dadosValidos ? 'válidos' : 'inválidos');
  
  if (Array.isArray(data) && data.length > 0) {
    console.log('📊 Amostra de dados motor ocioso:', data.slice(0, 2));
  } else {
    console.log('📊 Dados motor ocioso vazios ou não são um array');
  }
  
  // Definir dados padrão para motor ocioso
  const defaultData: MotorOciosoData[] = [
    { id: '1', nome: 'SEM OPERADOR', percentual: 4.5 },
    { id: '2', nome: 'OPERADOR 2', percentual: 3.8 },
    { id: '3', nome: 'OPERADOR 3', percentual: 3.2 }
  ];
  
  // Usar dados padrão se não houver dados válidos
  const dadosFinais = dadosValidos ? data : defaultData;
  
  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;

  // Calcula a média de porcentagem
  const mediaPercentual = dadosFinais.reduce((acc, item) => acc + (item?.percentual || 0), 0) / dadosFinais.length;
  
  // Encontra o valor máximo para definir a escala (considerando o limite máximo de 100%)
  const maxPercentual = Math.min(Math.max(...dadosFinais.map(item => item?.percentual || 0), meta * 2), 100);
  
  // Para "menor melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxPercentual, meta * 2); // Aumentar para garantir visibilidade
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (percentual: number) => Math.min((percentual / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordenar corretamente dependendo se é menor melhor (ordenar do menor para o maior)
  // ou maior melhor (ordenar do maior para o menor)
  const sortedData = [...dadosFinais].sort((a, b) => 
    inverterMeta 
      ? (a.percentual || 0) - (b.percentual || 0)  // Menor melhor (motor ocioso)
      : (b.percentual || 0) - (a.percentual || 0)  // Maior melhor (outros casos)
  );
  
  // Define as cores com base no valor do percentual (menor melhor)
  const getBarColor = (value: number) => {
    if (inverterMeta) {
      // Menor melhor
      if (value <= meta) return cores.meta_atingida;
      if (value <= meta * 1.1) return cores.proximo_meta;
      if (value <= meta * 1.3) return cores.alerta;
      return cores.critico;
    } else {
      // Maior melhor
      if (value >= meta) return cores.meta_atingida;
      if (value >= meta * 0.9) return cores.proximo_meta;
      if (value >= meta * 0.7) return cores.alerta;
      return cores.critico;
    }
  };

  return (
    <Box h="100%">
      <Box h="100%" overflowY="auto">
        <VStack spacing={0} align="stretch">
          {sortedData.map((item, index) => {
            const barColor = getBarColor(item.percentual);
            return (
              <Box 
                key={index}
                py={0.5}
                px={1}
                bg={index % 2 === 0 ? "gray.50" : "white"}
                borderRadius="sm"
              >
                <Text fontSize="10px" fontWeight="medium" noOfLines={1} title={`${item.id} - ${item.nome}`} mb={0.5} color="black">
                  {item.id} - {item.nome}
                </Text>
                
                <Flex direction="row" align="center">
                  <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 40px)">
                    <Flex 
                      position="absolute" 
                      bg={barColor}
                      h="100%" 
                      w={`${scalePercentage(item.percentual)}%`}
                      borderRadius="sm"
                      alignItems="center"
                    />
                    
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
                  <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={barColor}>
                    {item.percentual.toFixed(formatacao.porcentagem.casas)}%
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