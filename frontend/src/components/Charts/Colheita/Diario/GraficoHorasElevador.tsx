import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';

interface HorasElevadorData {
  id: string;
  nome: string;
  horas: number;
}

interface HorasElevadorProps {
  data?: HorasElevadorData[];
  exibirCards?: boolean;
  meta?: number;
}

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: HorasElevadorData[] = [
  { id: '1', nome: 'SEM OPERADOR', horas: 2.42 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', horas: 7.42 },
  { id: '9999', nome: 'TROCA DE TURNO', horas: 7.59 },
  { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', horas: 6.33 },
  { id: '11', nome: 'NAO CADASTRADO', horas: 6.26 },
  { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', horas: 4.54 },
  { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', horas: 4.62 },
  { id: '357887', nome: 'EVERTON TIAGO MARQUES', horas: 5.10 },
  { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', horas: 0.42 }
];

export const GraficoHorasElevador: React.FC<HorasElevadorProps> = ({ 
  data = defaultData,
  exibirCards = false
}) => {
  // Calcula o total e a média de horas
  const totalHoras = data.reduce((acc, item) => acc + item.horas, 0);
  const mediaHoras = totalHoras / data.length;
  
  // Encontra o valor máximo para definir a escala
  const maxHoras = Math.max(...data.map(item => item.horas));
  
  // CONFIGURAÇÃO DE META: Horas alvo de elevador (valores mais altos são melhores)
  const metaHoras = 5;
  
  // Definir valor de referência para escala (o maior entre o valor máximo dos dados e a meta)
  const valorReferencia = Math.max(maxHoras, metaHoras);
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (horas: number) => Math.min((horas / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = Math.min((metaHoras / valorReferencia) * 100, 100);

  // Ordena por horas (do maior para o menor)
  const sortedData = [...data].sort((a, b) => b.horas - a.horas);
  
  // Define as cores com base no valor das horas
  const getBarColor = (value: number) => {
    if (value >= 6) return '#48BB78'; // verde para bom
    if (value >= 4) return '#4299E1'; // azul para médio
    return '#E53E3E'; // vermelho para ruim
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

  const totalCardColor = getCardBgColor('#4299E1'); // Azul com transparência
  const mediaCardColor = getCardBgColor('#48BB78'); // Verde com transparência

  // Formata o valor de horas para exibição (horas e minutos)
  const formatHoras = (horas: number) => {
    if (horas === undefined || horas === null) {
      return '0h';
    }
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    return `${horasInteiras}h${minutos > 0 ? ` ${minutos}m` : ''}`;
  };

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
              <Text fontSize="10px" fontWeight="medium" noOfLines={1} title={`${item.id} - ${item.nome}`} mb={0.5} color="black">
                {item.id} - {item.nome}
              </Text>
              
              {/* Segunda linha: Barra de progresso e valor de horas */}
              <Flex direction="row" align="center">
                <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 50px)">
                  <Flex 
                    position="absolute" 
                    bg={getBarColor(item.horas)} 
                    h="100%" 
                    w={`${scalePercentage(item.horas)}%`} 
                    borderRadius="sm"
                    alignItems="center"
                  />
                  
                  {/* Linha vertical indicando a meta de horas de elevador (6 horas) */}
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
                <Text fontSize="10px" fontWeight="bold" w="45px" textAlign="right" color="black">
                  {formatHoras(item.horas)}
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}; 