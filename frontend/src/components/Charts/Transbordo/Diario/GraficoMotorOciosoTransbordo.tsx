'use client';

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
  proximo_meta: '#98FB98',
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

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: MotorOciosoData[] = [
  { id: '1', nome: 'SEM OPERADOR', percentual: 28.1 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', percentual: 25.1 },
  { id: '9999', nome: 'TROCA DE TURNO', percentual: 29.9 },
  { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', percentual: 22.0 },
  { id: '11', nome: 'NAO CADASTRADO', percentual: 19.4 },
  { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', percentual: 40.1 },
  { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', percentual: 31.5 },
  { id: '357887', nome: 'EVERTON TIAGO MARQUES', percentual: 32.0 },
  { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', percentual: 36.8 }
];

export const GraficoMotorOciosoTransbordo: React.FC<MotorOciosoProps> = ({ 
  data = defaultData,
  meta = configManager.getMetas('transbordo_diario').motorOcioso,
  inverterMeta = true,
  exibirCards = false
}) => {
  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;
  const diferencas = configManager.getConfig()?.graficos?.diferencas_meta?.invertido || {
    meta_atingida: "<=",
    proximo_meta: 5,
    alerta: 15,
    critico: ">15"
  };

  // Calcula a média de percentual ocioso
  const mediaPercentual = data.reduce((acc, item) => acc + item.percentual, 0) / data.length;
  
  // Encontra o valor máximo para definir a escala
  const maxPercentual = Math.max(...data.map(item => item.percentual));
  
  // Para "menor melhor", usamos 100% como referência para a escala
  const valorReferencia = Math.max(maxPercentual, meta * 1.2); // Garante que a meta fique visível
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (percentual: number) => Math.min((percentual / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por percentual (do menor para o maior - melhor performance no topo)
  const sortedData = [...data].sort((a, b) => a.percentual - b.percentual);
  
  // Define as cores com base no valor do percentual (menor melhor)
  const getBarColor = (value: number) => {
    // Para "menor é melhor", a lógica é invertida
    const diferenca = ((value - meta) / meta) * 100;

    // Se está abaixo ou igual à meta, está ótimo (verde)
    if (value <= meta) return cores.meta_atingida;
    
    // Se está até 5% acima da meta, está próximo (verde claro)
    if (diferenca <= tolerancias.proximo_meta) return cores.proximo_meta;
    
    // Se está até 15% acima da meta, está em alerta (amarelo)
    if (diferenca <= tolerancias.alerta) return cores.alerta;
    
    // Se está mais que 15% acima da meta, está crítico (vermelho)
    return cores.critico;
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

  const metaCardColor = getCardBgColor('#48BB78'); // Verde com transparência
  const mediaCardColor = getCardBgColor(getBarColor(mediaPercentual));

  return (
    <Box h="100%">
      {/* Container principal apenas para o gráfico */}
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