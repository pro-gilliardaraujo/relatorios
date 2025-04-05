import React, { useEffect } from 'react';
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

export const GraficoMotorOciosoColheita: React.FC<MotorOciosoProps> = ({ 
  data = [],
  meta = configManager.getMetas('colheita_diario').motorOcioso,
  inverterMeta = true,
  exibirCards = false
}) => {
  // Log ao montar o componente
  useEffect(() => {
    console.log('🔍 GraficoMotorOciosoColheita montado com:');
    console.log('- 📊 data:', Array.isArray(data) ? `Array com ${data.length} itens` : 'Não é um array');
    console.log('- 🎯 meta:', meta);
    console.log('- 🎯 meta default do config:', configManager.getMetas('colheita_diario').motorOcioso);
    console.log('- 🔄 inverterMeta:', inverterMeta);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('- 📋 Primeiro item:', data[0]);
    }
  }, [data, meta, inverterMeta]);
  
  // Verificar se há dados válidos e filtrar dados inválidos
  const dadosValidos = Array.isArray(data) ? data.filter(item => 
    item && 
    item.nome && 
    typeof item.percentual === 'number' && 
    !isNaN(item.percentual)
  ) : [];
  
  // Log para diagnóstico
  console.log('📊 GraficoMotorOciosoColheita dados válidos:', dadosValidos.length);
  console.log('📊 Meta passada para o gráfico:', meta);
  
  if (dadosValidos.length > 0) {
    console.log('📊 Amostra de dados válidos:', dadosValidos.slice(0, 2));
  }
  
  // Definir dados padrão para motor ocioso somente se não houver dados válidos
  const defaultData: MotorOciosoData[] = [
    { id: '1', nome: 'SEM OPERADOR', percentual: 4.5 },
    { id: '2', nome: 'OPERADOR 2', percentual: 3.8 },
    { id: '3', nome: 'OPERADOR 3', percentual: 3.2 }
  ];
  
  // Processar valores de percentual: se for entre 0 e 1, converter para porcentagem (multiplicar por 100)
  const processedData = dadosValidos.map(item => {
    const percentual = item.percentual;
    // Se o valor for menor que 1 e maior que 0, provavelmente é um decimal que representa porcentagem
    if (percentual > 0 && percentual < 1) {
      return {
        ...item,
        percentual: percentual * 100
      };
    }
    return item;
  });
  
  // Usar dados padrão SE e SOMENTE SE não houver dados válidos
  const dadosFinais = processedData.length > 0 ? processedData : defaultData;
  
  if (dadosValidos.length === 0 && Array.isArray(data) && data.length > 0) {
    console.log('⚠️ Dados recebidos mas todos foram filtrados como inválidos:', data);
  }
  
  // Obter configurações de cores do configManager
  const cores = configManager.getGraficosConfig()?.cores || {
    meta_atingida: '#48BB78',
    proximo_meta: '#90EE90',
    alerta: '#ECC94B',
    critico: '#E53E3E'
  };
  
  // Obter tolerâncias do configManager
  const tolerancias = configManager.getGraficosConfig()?.tolerancias || {
    proximo_meta: 7,
    alerta: 14,
    critico: 15
  };
  
  // Obter formatação do configManager
  const formatacao = configManager.getGraficosConfig()?.formatacao || {
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
  
  console.log('📊 Configurações do gráfico:', { cores, tolerancias, formatacao });

  // Calcula a média de porcentagem
  const mediaPercentual = dadosFinais.reduce((acc, item) => acc + (item?.percentual || 0), 0) / dadosFinais.length;
  
  // Sempre usar um valor máximo para escala em gráficos de motor ocioso (normalmente valores baixos)
  const maxValueForScale = 15;
  
  // Função de escala para garantir proporcionalidade
  const scalePercentage = (percentual: number) => {
    const scaledValue = (percentual / maxValueForScale) * 100;
    return Math.min(scaledValue, 100);
  };

  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / maxValueForScale) * 100;
  console.log('📊 Meta escalada para o gráfico:', metaScaled, '% (meta original:', meta, ')');

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
                <Text fontSize="10px" fontWeight="medium" noOfLines={1} title={item.nome} mb={0.5} color="black">
                  {item.id} - {item.nome}
                </Text>
                
                <Flex direction="row" align="center">
                  <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 40px)" bg="gray.100">
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
                    {item.percentual.toFixed(2)}%
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