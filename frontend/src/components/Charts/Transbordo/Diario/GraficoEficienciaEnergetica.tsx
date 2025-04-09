'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { limparIdOperador, formatarExibicaoOperador } from '@/utils/formatters';

interface EficienciaData {
  id: string;
  nome: string;
  eficiencia: number;
}

interface EficienciaEnergeticaProps {
  data: EficienciaData[];
  meta?: number;
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

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: EficienciaData[] = [
  { id: '1', nome: 'SEM OPERADOR', eficiencia: 65.1 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', eficiencia: 72.1 },
  { id: '9999', nome: 'TROCA DE TURNO', eficiencia: 68.9 },
  { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', eficiencia: 75.0 },
  { id: '11', nome: 'NAO CADASTRADO', eficiencia: 67.4 },
  { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', eficiencia: 71.1 },
  { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', eficiencia: 69.5 },
  { id: '357887', nome: 'EVERTON TIAGO MARQUES', eficiencia: 73.0 },
  { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', eficiencia: 70.8 }
];

export const GraficoEficienciaEnergetica: React.FC<EficienciaEnergeticaProps> = ({ 
  data = defaultData,
  meta = configManager.getMetas('transbordo_diario').eficienciaEnergetica,
  exibirCards = false
}) => {
  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;

  // Calcula a média de eficiência
  const mediaEficiencia = data.reduce((acc, item) => acc + item.eficiencia, 0) / data.length;
  
  // Encontra o valor máximo para definir a escala
  const maxEficiencia = Math.max(...data.map(item => item.eficiencia));
  
  // Para "maior melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxEficiencia, meta * 1.2); // Garante que a meta fique visível
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (eficiencia: number) => Math.min((eficiencia / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por eficiência (do maior para o menor)
  const sortedData = [...data].sort((a, b) => b.eficiencia - a.eficiencia);
  
  // Define as cores com base no valor da eficiência (maior melhor)
  const getBarColor = (value: number) => {
    const diferenca = ((value - meta) / meta) * 100;

    if (value >= meta) return cores.meta_atingida;
    if (diferenca >= -tolerancias.proximo_meta) return cores.proximo_meta;
    if (diferenca >= -tolerancias.alerta) return cores.alerta;
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

  const metaCardColor = getCardBgColor(cores.meta_atingida);
  const mediaCardColor = getCardBgColor(getBarColor(mediaEficiencia));

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
                      bg={getBarColor(item.eficiencia)} 
                      h="100%" 
                      w={`${scalePercentage(item.eficiencia)}%`}
                      borderRadius="sm"
                      alignItems="center"
                    />
                    
                    {/* Linha vertical indicando a meta de eficiência energética (60%) */}
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
                  <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={getBarColor(item.eficiencia)}>
                    {item.eficiencia.toFixed(formatacao.porcentagem.casas)}%
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