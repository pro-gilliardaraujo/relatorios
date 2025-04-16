import React from 'react';
import { Box, Text, VStack, Flex } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface DadosVelocidade {
  operador: string;
  velocidade: number;
}

interface Props {
  dados: DadosVelocidade[];
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
    casas: 2,
    separador: "."
  },
  horas: {
    formato: "Xh00m"
  }
};

export const GraficoMediaVelocidadeSemanal: React.FC<Props> = ({ 
  dados = [],
  meta = configManager.getMetas('transbordo_semanal').mediaVelocidade
}) => {
  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;

  // Encontrar a maior velocidade para definir a escala
  const maxVelocidade = Math.max(...dados.map(d => d.velocidade), meta);
  const escalaMaxima = Math.max(60, maxVelocidade * 1.2); // Garante que a escala seja no mínimo 60 km/h

  // Ordenar dados por velocidade em ordem decrescente
  const dadosOrdenados = [...dados]
    .filter(item => item && typeof item.velocidade === 'number')
    .sort((a, b) => b.velocidade - a.velocidade);

  // Define as cores com base no valor da velocidade
  const getBarColor = (value: number) => {
    if (typeof value !== 'number') return cores.critico;
    const diferenca = ((value - meta) / meta) * 100;

    if (value >= meta * 1.2) return cores.critico;
    if (value >= meta * 0.8 && value <= meta * 1.2) return cores.meta_atingida;
    return cores.alerta;
  };

  // Se não houver dados válidos, mostrar mensagem
  if (dadosOrdenados.length === 0) {
    return (
      <Box h="100%" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Sem dados disponíveis</Text>
      </Box>
    );
  }

  return (
    <Box h="100%">
      <Box h="100%" overflowY="auto">
        <VStack spacing={0} align="stretch">
          {dadosOrdenados.map((item, index) => {
            if (!item || typeof item.velocidade !== 'number') return null;
            const barColor = getBarColor(item.velocidade);
            const velocidadeFormatada = `${item.velocidade.toFixed(2)} km/h`;
            const porcentagemBarra = (item.velocidade / escalaMaxima) * 100;
            const porcentagemMetaBarra = (meta / escalaMaxima) * 100;
            
            return (
              <Box 
                key={index}
                py={0.5}
                px={1}
                bg={index % 2 === 0 ? "gray.50" : "white"}
                borderRadius="sm"
              >
                <Text fontSize="10px" fontWeight="medium" noOfLines={1} title={item.operador} mb={0.5} color="black">
                  {item.operador}
                </Text>
                
                <Flex direction="row" align="center">
                  <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 65px)">
                    <Flex 
                      position="absolute" 
                      bg={barColor}
                      h="100%" 
                      w={`${porcentagemBarra}%`}
                      borderRadius="sm"
                      alignItems="center"
                    />
                    
                    <Box 
                      position="absolute" 
                      top="0" 
                      left={`${porcentagemMetaBarra}%`} 
                      h="13px"
                      w="2px"
                      bg="rgba(0,0,0,0.7)"
                      zIndex="2"
                    />
                  </Box>
                  <Text fontSize="10px" fontWeight="bold" w="60px" textAlign="right" color={barColor}>
                    {velocidadeFormatada}
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