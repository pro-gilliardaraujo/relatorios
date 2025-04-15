'use client';

import React from 'react';
import { Box, Text, Flex, VStack, HStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

// Interface para os dados recebidos pelo componente
interface DisponibilidadeMecanicaData {
  frota: string;
  disponibilidade: number;
}

interface GraficoDisponibilidadeMecanicaTransbordoProps {
  data: DisponibilidadeMecanicaData[];
  meta?: number;
  title?: string;
  height?: number;
  exibirCards?: boolean;
}

// Valores padrão para cores e tolerâncias
const DEFAULT_COLORS = {
  meta_atingida: '#48BB78',     // Verde
  proximo_meta: '#90EE90',      // Verde claro
  alerta: '#ECC94B',            // Amarelo
  critico: '#E53E3E',           // Vermelho
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

export const GraficoDisponibilidadeMecanicaTransbordo: React.FC<GraficoDisponibilidadeMecanicaTransbordoProps> = ({
  data = [],
  meta = configManager.getMetas('transbordo_diario').disponibilidadeMecanica || 95,
  title = 'Disponibilidade Mecânica por Transbordo',
  height = 400,
  exibirCards = false
}) => {
  // Obter configurações com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;
  
  // Filtrar e processar os dados
  const filteredData = data.filter(item => item && item.frota && item.frota !== '0');
  
  // Calcula a média de disponibilidade
  const mediaDisponibilidade = filteredData.length > 0 
    ? filteredData.reduce((acc, item) => acc + item.disponibilidade, 0) / filteredData.length
    : 0;
  
  // Encontra o valor máximo para definir a escala
  const maxDisponibilidade = Math.max(...filteredData.map(item => item.disponibilidade), meta);
  
  // Para "maior melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxDisponibilidade, meta * 1.2); // Garante que a meta fique visível
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (disponibilidade: number) => Math.min((disponibilidade / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por disponibilidade (do maior para o menor)
  const sortedData = [...filteredData].sort((a, b) => b.disponibilidade - a.disponibilidade);
  
  // Divide os dados em 3 colunas
  const distributeInColumns = (data: DisponibilidadeMecanicaData[]) => {
    const column1: DisponibilidadeMecanicaData[] = [];
    const column2: DisponibilidadeMecanicaData[] = [];
    const column3: DisponibilidadeMecanicaData[] = [];
    
    data.forEach((item, index) => {
      const columnIndex = index % 3;
      if (columnIndex === 0) column1.push(item);
      else if (columnIndex === 1) column2.push(item);
      else column3.push(item);
    });
    
    return [column1, column2, column3];
  };
  
  const [column1Data, column2Data, column3Data] = distributeInColumns(sortedData);
  
  // Define as cores com base no valor da disponibilidade (maior melhor)
  const getBarColor = (value: number) => {
    const diferenca = ((value - meta) / meta) * 100;

    if (value >= meta) return cores.meta_atingida;
    if (diferenca >= -tolerancias.proximo_meta) return cores.proximo_meta;
    if (diferenca >= -tolerancias.alerta) return cores.alerta;
    return cores.critico;
  };

  // Componente para renderizar uma coluna
  const ColumnComponent = ({ columnData }: { columnData: DisponibilidadeMecanicaData[] }) => (
    <VStack spacing={0} align="stretch" flex="1">
      {columnData.map((item, index) => {
        const barColor = getBarColor(item.disponibilidade);
        const displayName = `Frota ${item.frota}`;
        
        return (
          <Box 
            key={index}
            py={0.5}
            px={1}
            bg={index % 2 === 0 ? "gray.50" : "white"}
            borderRadius="sm"
          >
            {/* Primeira linha: Nome da frota */}
            <Text 
              fontSize="10px" 
              fontWeight="medium" 
              noOfLines={1} 
              title={displayName} 
              mb={0.5} 
              color="black"
            >
              {displayName}
            </Text>
            
            {/* Segunda linha: Barra de progresso e valor percentual */}
            <Flex direction="row" align="center">
              <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 40px)">
                <Flex 
                  position="absolute" 
                  bg={barColor} 
                  h="100%" 
                  w={`${scalePercentage(item.disponibilidade)}%`}
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
              <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={barColor}>
                {item.disponibilidade.toFixed(formatacao.porcentagem.casas)}%
              </Text>
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );

  return (
    <Box h="100%">      
      {/* Container principal para o gráfico */}
      <Box h="100%" overflowY="auto">
        <HStack spacing={2} align="start">
          <ColumnComponent columnData={column1Data} />
          <ColumnComponent columnData={column2Data} />
          <ColumnComponent columnData={column3Data} />
        </HStack>
      </Box>
    </Box>
  );
}; 