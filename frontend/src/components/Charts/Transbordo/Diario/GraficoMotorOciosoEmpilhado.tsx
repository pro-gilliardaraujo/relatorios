'use client';

import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { limparIdOperador, formatarExibicaoOperador, formatarHorasEmHorasMinutos } from '@/utils/formatters';

// Interface para os dados recebidos pelo componente
interface MotorOciosoData {
  id: string;
  nome: string;
  percentual: number;    // Percentual de tempo ocioso
  horasOcioso?: number;  // Opcional: horas ociosas
  horasTotal?: number;   // Opcional: horas totais
}

interface GraficoMotorOciosoEmpilhadoProps {
  data: MotorOciosoData[];
  meta?: number;
  title?: string;
  height?: number;       // Altura personalizada do gráfico
}

// Valores padrão para cores
const DEFAULT_COLORS = {
  ocioso: '#FF0000',        // Vermelho para motor ocioso
  produtivo: '#48BB78',     // Verde para motor produtivo
  meta: '#0000FF',          // Azul para linha de meta
};

export const GraficoMotorOciosoEmpilhado: React.FC<GraficoMotorOciosoEmpilhadoProps> = ({
  data = [],
  meta = configManager.getMetas('transbordo_diario').motorOcioso || 6,
  title = 'Motor Ocioso por Operador',
  height = 400
}) => {
  try {
    // Obter configurações com fallback para valores padrão
    const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
    
    console.log('GraficoMotorOciosoEmpilhado - Dados recebidos:', {
      totalItens: data.length,
      meta,
      primeiroItem: data[0]
    });
    
    // Processar os dados para o formato esperado pelo gráfico
    const chartData = data
      .filter(item => 
        item && item.nome && !['TROCA DE TURNO', '0', 'SEM OPERADOR'].includes(item.nome)
      )
      .map(item => {
        // Calcular horas ociosas e totais
        // Se não houver horas totais, não podemos calcular corretamente - usar valor padrão
        const horasTotal = item.horasTotal || 24;
        const horasOcioso = item.horasOcioso || (item.percentual / 100) * horasTotal;
        const horasProdutivo = horasTotal - horasOcioso;
        
        // Limpar o ID do operador e formatar nome para exibição
        const idLimpo = limparIdOperador(item.id);
        const nomeOperador = formatarExibicaoOperador(idLimpo, item.nome);
        
        // A meta já está em percentual, então não precisamos converter
        return {
          name: nomeOperador,
          percentual: Number(item.percentual.toFixed(2)),
          ocioso: Number(horasOcioso.toFixed(2)),
          produtivo: Number(horasProdutivo.toFixed(2)),
          total: Number(horasTotal.toFixed(2)),
          metaPosicao: meta   // Usar o valor da meta diretamente
        };
      })
      .filter(item => item !== null) // Filtrar itens nulos
      .sort((a, b) => b.percentual - a.percentual); // Ordenar por percentual (maior para menor)
    
    console.log('GraficoMotorOciosoEmpilhado - chartData processado:', {
      totalItens: chartData.length,
      primeiroItem: chartData[0]
    });
    
    // Definir cor da barra com base na comparação com a meta
    const getBarColor = (percentual: number): string => {
      if (percentual <= meta) {
        return '#48BB78'; // Verde se estiver dentro da meta
      } else if (percentual <= meta * 1.05) {
        return '#98FB98'; // Verde claro se estiver até 5% acima da meta
      } else if (percentual <= meta * 1.15) {
        return '#ECC94B'; // Amarelo se estiver até 15% acima da meta
      } else {
        return '#E53E3E'; // Vermelho se estiver mais de 15% acima da meta
      }
    };

    // Ajustar parâmetros de altura das barras e espaçamento
    const barHeight = 13; // Altura das barras igual aos outros gráficos
    const barSpacing = 0; // Sem espaçamento entre registros

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
      <Box h="100%" w="100%" py={0} px={1}>
        {/* Container para barras com uso máximo de espaço */}
        <Box 
          h="100%"
          w="100%"
          overflowY={chartData.length > 16 ? "auto" : "visible"}
        >
          <VStack spacing={barSpacing} align="stretch" w="100%">
            {chartData.map((item, index) => {
              const barColor = getBarColor(item.percentual);
              
              return (
                <Box 
                  key={index} 
                  position="relative"
                  bg={index % 2 === 0 ? "gray.50" : "white"} 
                  py={0.5}
                  px={1}
                  borderRadius="sm"
                >
                  {/* Nome do operador */}
                  <Text 
                    fontSize="10px" 
                    fontWeight="medium" 
                    noOfLines={1} 
                    title={item.name} 
                    color="black"
                    mb={0.5}
                  >
                    {item.name}
                  </Text>
                  
                  {/* Barra e percentual */}
                  <Flex align="center" width="100%">
                    {/* Container da barra */}
                    <Box position="relative" width="92%" height={`${barHeight}px`} bg="gray.200" borderRadius="sm" mr={1}>
                      {/* Barra de motor ocioso (à esquerda) */}
                      <Box
                        position="absolute"
                        left="0"
                        top="0"
                        height="100%"
                        width={`${item.percentual}%`}
                        bg={barColor}
                        borderRadius="sm 0 0 sm"
                        display="flex"
                        alignItems="center"
                      >
                        {/* Texto de horas ociosas - agora sempre visível */}
                        <Text
                          position="absolute"
                          left="2px"
                          top="50%"
                          transform="translateY(-50%)"
                          fontSize="8px"
                          fontWeight="bold"
                          color={barColor === '#E53E3E' ? "white" : "black"}
                          zIndex={3}
                        >
                          {formatarHorasEmHorasMinutos(item.ocioso)}
                        </Text>
                      </Box>
                      
                      {/* Barra de horas produtivas (à direita) */}
                      <Box
                        position="absolute"
                        left={`${item.percentual}%`}
                        top="0"
                        height="100%"
                        right="0"
                        bg="#c4e8d1" // Verde claro para área produtiva
                        borderRadius="0 sm sm 0"
                      >
                        {/* Texto de horas produtivas - sempre visível */}
                        <Text
                          position="absolute"
                          right="5px"
                          top="50%"
                          transform="translateY(-50%)"
                          fontSize="8px"
                          fontWeight="bold"
                          color="black"
                        >
                          {formatarHorasEmHorasMinutos(item.produtivo)}
                        </Text>
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
                      fontSize="10px"
                      fontWeight="bold"
                      color={barColor}
                      width="8%"
                      textAlign="right"
                    >
                      {item.percentual.toFixed(1)}%
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
    console.error('Erro ao renderizar GraficoMotorOciosoEmpilhado:', error);
    return (
      <Box h="100%" w="100%" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="14px" color="red.500">
          Erro ao carregar o gráfico. Tente recarregar a página.
        </Text>
      </Box>
    );
  }
}; 