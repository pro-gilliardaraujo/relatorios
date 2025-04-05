import React, { useEffect } from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

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

export const GraficoUsoGPS: React.FC<GraficoUsoGPSProps> = ({ 
  data,
  meta = configManager.getMetas('colheita_diario').usoGPS,
  exibirCards = false
}) => {
  // Log ao montar o componente
  useEffect(() => {
    console.log('🔍 GraficoUsoGPS montado com:');
    console.log('- 📊 data:', Array.isArray(data) ? `Array com ${data.length} itens` : 'Não é um array');
    console.log('- 🎯 meta:', meta);
    console.log('- 🎯 meta default do config:', configManager.getMetas('colheita_diario').usoGPS);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('- 📋 Primeiro item:', data[0]);
    }
  }, [data, meta]);
  
  // Verificar se há dados válidos e filtrar dados inválidos
  const dadosValidos = Array.isArray(data) ? data.filter(item => 
    item && 
    item.nome && 
    typeof item.porcentagem === 'number' && 
    !isNaN(item.porcentagem)
  ) : [];
  
  // Log para diagnóstico
  console.log('📊 GraficoUsoGPS dados válidos:', dadosValidos.length);
  console.log('📊 Meta passada para o gráfico:', meta);
  
  if (dadosValidos.length > 0) {
    console.log('📊 Amostra de dados válidos:', dadosValidos.slice(0, 2));
  }
  
  // Processar valores de porcentagem: se for entre 0 e 1, converter para porcentagem (multiplicar por 100)
  const processedData = dadosValidos.map(item => {
    const porcentagem = item.porcentagem;
    // Se o valor for menor que 1 e maior que 0, provavelmente é um decimal que representa porcentagem
    if (porcentagem > 0 && porcentagem < 1) {
      return {
        ...item,
        porcentagem: porcentagem * 100
      };
    }
    return item;
  });
  
  // Se não houver dados válidos, retornar mensagem
  if (processedData.length === 0) {
    console.log('❌ Sem dados válidos para o gráfico UsoGPS');
    return (
      <Box h="100%" display="flex" alignItems="center" justifyContent="center">
        <Text>Sem dados de uso GPS disponíveis</Text>
      </Box>
    );
  }
  
  // Calcular a média de porcentagem
  const mediaPorcentagem = processedData.reduce((acc, item) => acc + item.porcentagem, 0) / processedData.length;
  
  // Sempre usar 100 como base para escala máxima para manter a proporcionalidade
  const maxValueForScale = 100;
  
  // Calcula onde ficará a linha de meta na escala relativa (em porcentagem de maxValueForScale)
  const metaScaled = (meta / maxValueForScale) * 100;
  console.log('📊 Meta escalada para o gráfico:', metaScaled, '% (meta original:', meta, ')');
  
  // Função de escala para garantir que valores não ultrapassem maxValueForScale
  const scalePercentage = (porcentagem: number) => {
    const scaledValue = (porcentagem / maxValueForScale) * 100;
    return Math.min(scaledValue, 100);
  };

  // Ordena por porcentagem (do maior para o menor)
  const sortedData = [...processedData].sort((a, b) => b.porcentagem - a.porcentagem);
  
  // Define as cores com base no valor da porcentagem (maior melhor)
  const getBarColor = (value: number) => {
    if (value >= meta) return '#48BB78'; // verde para bom (acima ou igual à meta)
    if (value >= meta * 0.8) return '#ECC94B'; // amarelo para médio (até 20% abaixo da meta)
    return '#E53E3E'; // vermelho para ruim (abaixo de 80% da meta)
  };

  // Define cores dos cards com transparência (0.3 para 30% de opacidade)
  const getCardBgColor = (color: string) => {
    if (color.startsWith('#')) {
      // Conversão simplificada de hex para rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    } else if (color.startsWith('rgb')) {
      // Se já for rgb, apenas adiciona alpha
      return color.replace('rgb', 'rgba').replace(')', ', 0.3)');
    }
    return color;
  };

  // Usar as cores do configManager se disponíveis
  const cores = configManager.getGraficosConfig()?.cores || {
    meta_atingida: '#48BB78',
    proximo_meta: '#90EE90',
    alerta: '#ECC94B',
    critico: '#E53E3E'
  };
  
  console.log('📊 Cores usadas no gráfico:', cores);

  const metaCardColor = getCardBgColor(cores.meta_atingida); // Verde com transparência
  const mediaCardColor = getCardBgColor(getBarColor(mediaPorcentagem));

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
              <Text fontSize="10px" fontWeight="medium" noOfLines={1} title={item.nome} mb={0.5} color="black">
                {item.id} - {item.nome}
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
                  {item.porcentagem.toFixed(2)}%
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}; 