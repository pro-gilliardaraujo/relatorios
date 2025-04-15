'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

// Interface para os dados recebidos pelo componente
export interface DisponibilidadeMecanicaData {
  maquina: string;
  disponibilidade: number;  // Percentual de disponibilidade
  horasDisponiveis?: number; // Opcional: horas disponíveis
  horasTotal?: number;      // Opcional: horas totais
}

export interface GraficoDisponibilidadeMecanicaProps {
  data: DisponibilidadeMecanicaData[];
  meta?: number;
  title?: string;
  height?: number;
  options?: Partial<typeof defaultOptions>;
}

// Função auxiliar para formatar o tempo em horas
const formatHours = (hours: number): string => {
  if (hours === undefined || hours === null) return '0h';
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h${m > 0 ? `${m.toString().padStart(2, '0')}m` : ''}`;
};

// Valores padrão para cores
const DEFAULT_COLORS = {
  disponivel: '#48BB78',     // Verde para máquina disponível
  indisponivel: '#E53E3E',   // Vermelho para máquina indisponível  
  meta: '#000000',           // Preto para linha de meta
};

// Opções padrão para personalização do gráfico
const defaultOptions = {
  chart: {
    height: 400,
    padding: 1,
  },
  barStyle: {
    height: 18,
    spacing: 0,
    borderRadius: 'sm',
  },
  labels: {
    fontSize: '10px',
    fontWeight: 'medium',
    colorAboveTarget: 'black',
    colorBelowTarget: 'white',
  },
};

export const GraficoDisponibilidadeMecanica: React.FC<GraficoDisponibilidadeMecanicaProps> = ({
  data = [],
  meta = configManager.getMetas('colheita_diario')?.disponibilidadeMecanica || 85,
  title = 'Disponibilidade Mecânica',
  height = 400,
  options = {}
}) => {
  try {
    // Mesclar opções padrão com opções personalizadas
    const opts = {
      ...defaultOptions,
      ...options,
    };
    
    // Obter configurações com fallback para valores padrão
    const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
    
    console.log('GraficoDisponibilidadeMecanica - Dados recebidos:', {
      totalItens: data.length,
      meta,
      primeiroItem: data[0]
    });
    
    // Processar e ordenar os dados para o formato esperado pelo gráfico
    const chartData = data
      .filter(item => item && item.maquina)
      .map(item => {
        // Calcular horas disponíveis e totais se não fornecidas
        const horasTotal = item.horasTotal || 24; // Assumir 24h se não for fornecido
        const horasDisponiveis = item.horasDisponiveis || (item.disponibilidade / 100) * horasTotal;
        const horasIndisponiveis = horasTotal - horasDisponiveis;
        
        // A meta já está em percentual, então usamos diretamente
        return {
          name: item.maquina,
          disponibilidade: Number(item.disponibilidade.toFixed(2)),
          horasDisponiveis: Number(horasDisponiveis.toFixed(2)),
          horasIndisponiveis: Number(horasIndisponiveis.toFixed(2)),
          total: Number(horasTotal.toFixed(2)),
          metaPosicao: meta // Usar o valor da meta diretamente
        };
      })
      .sort((a, b) => b.disponibilidade - a.disponibilidade); // Ordenar por disponibilidade (maior para menor)
    
    console.log('GraficoDisponibilidadeMecanica - chartData processado:', {
      totalItens: chartData.length,
      primeiroItem: chartData[0]
    });
    
    // Definir cor da barra com base na comparação com a meta
    const getBarColor = (disponibilidade: number): string => {
      if (disponibilidade >= meta) {
        return '#48BB78'; // Verde se estiver acima da meta
      } else if (disponibilidade >= meta * 0.95) {
        return '#ECC94B'; // Amarelo se estiver até 5% abaixo da meta
      } else if (disponibilidade >= meta * 0.85) {
        return '#ED8936'; // Laranja se estiver até 15% abaixo da meta
      } else {
        return '#E53E3E'; // Vermelho se estiver mais de 15% abaixo da meta
      }
    };

    // Se não houver dados processados, exibir mensagem
    if (chartData.length === 0) {
      return (
        <Box h="100%" w="100%" display="flex" alignItems="center" justifyContent="center">
          <Text fontSize="14px" color="gray.500">
            Sem dados disponíveis para exibição
          </Text>
        </Box>
      );
    }

    return (
      <Box h={height ? `${height}px` : "100%"} w="100%" py={0} px={1}>
        {/* Container para barras com uso máximo de espaço */}
        <Box 
          h="100%"
          w="100%"
          overflowY={chartData.length > 16 ? "auto" : "visible"}
        >
          <VStack spacing={opts.barStyle.spacing} align="stretch" w="100%">
            {chartData.map((item, index) => {
              const barColor = getBarColor(item.disponibilidade);
              
              return (
                <Box 
                  key={index} 
                  position="relative"
                  bg={index % 2 === 0 ? "transparent" : "gray.100"} 
                  p={0.5}
                  borderRadius={opts.barStyle.borderRadius}
                >
                  {/* Nome da máquina */}
                  <Text 
                    fontSize={opts.labels.fontSize} 
                    fontWeight={opts.labels.fontWeight}
                    noOfLines={1} 
                    title={item.name} 
                    color="black"
                    mb={0}
                  >
                    {item.name}
                  </Text>
                  
                  {/* Barra e percentual */}
                  <Flex align="center" width="100%">
                    {/* Container da barra */}
                    <Box position="relative" width="92%" height={`${opts.barStyle.height}px`} bg="gray.200" borderRadius={opts.barStyle.borderRadius} mr={1}>
                      {/* Barra de disponibilidade (à esquerda) */}
                      <Box
                        position="absolute"
                        left="0"
                        top="0"
                        height="100%"
                        width={`${item.disponibilidade}%`}
                        bg={barColor}
                        borderRadius={`${opts.barStyle.borderRadius} 0 0 ${opts.barStyle.borderRadius}`}
                        display="flex"
                        alignItems="center"
                      >
                        {/* Texto de horas disponíveis */}
                        {item.disponibilidade > 15 && (
                          <Text
                            position="absolute"
                            left="2px"
                            top="50%"
                            transform="translateY(-50%)"
                            fontSize="8px"
                            fontWeight="bold"
                            color={item.disponibilidade >= meta ? opts.labels.colorAboveTarget : opts.labels.colorBelowTarget}
                            zIndex={3}
                          >
                            {formatHours(item.horasDisponiveis)}
                          </Text>
                        )}
                      </Box>
                      
                      {/* Barra de horas indisponíveis (à direita) */}
                      <Box
                        position="absolute"
                        left={`${item.disponibilidade}%`}
                        top="0"
                        height="100%"
                        right="0"
                        bg="#f8d7da" // Vermelho claro para área indisponível
                        borderRadius={`0 ${opts.barStyle.borderRadius} ${opts.barStyle.borderRadius} 0`}
                      >
                        {/* Texto de horas indisponíveis */}
                        {(100 - item.disponibilidade) > 15 && (
                          <Text
                            position="absolute"
                            right="5px"
                            top="50%"
                            transform="translateY(-50%)"
                            fontSize="8px"
                            fontWeight="bold"
                            color="black"
                          >
                            {formatHours(item.horasIndisponiveis)}
                          </Text>
                        )}
                      </Box>
                      
                      {/* Linha de meta (individual para cada barra) */}
                      <Box
                        position="absolute"
                        left={`${item.metaPosicao}%`}
                        top="0"
                        height="100%"
                        width="2px"
                        bg="black"
                        zIndex={2}
                      />
                    </Box>
                    
                    {/* Percentual à direita da barra */}
                    <Text
                      fontSize={opts.labels.fontSize}
                      fontWeight="bold"
                      color={barColor}
                      width="8%"
                      textAlign="right"
                    >
                      {item.disponibilidade.toFixed(1)}%
                    </Text>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </Box>
    );
  } catch (error) {
    console.error('Erro ao renderizar GraficoDisponibilidadeMecanica:', error);
    return (
      <Box h="100%" w="100%" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="14px" color="red.500">
          Erro ao carregar o gráfico. Tente recarregar a página.
        </Text>
      </Box>
    );
  }
}; 