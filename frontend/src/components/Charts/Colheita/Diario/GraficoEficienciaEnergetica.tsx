import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';

interface EficienciaData {
  id: string;
  nome: string;
  eficiencia: number;
}

interface EficienciaEnergeticaProps {
  data?: EficienciaData[];
  meta?: number;
  exibirCards?: boolean;
}

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: EficienciaData[] = [
  { id: '1', nome: 'SEM OPERADOR', eficiencia: 39 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', eficiencia: 59 },
  { id: '9999', nome: 'TROCA DE TURNO', eficiencia: 53 },
  { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', eficiencia: 60 },
  { id: '11', nome: 'NAO CADASTRADO', eficiencia: 62 },
  { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', eficiencia: 38 },
  { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', eficiencia: 38 },
  { id: '357887', nome: 'EVERTON TIAGO MARQUES', eficiencia: 55 },
  { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', eficiencia: 31 }
];

export const GraficoEficienciaEnergetica: React.FC<EficienciaEnergeticaProps> = ({ 
  data = defaultData,
  // CONFIGURAÇÃO DE META: Percentual alvo de eficiência energética (valores mais altos são melhores)
  meta = 70,
  exibirCards = false
}) => {
  // Calcula a média de eficiência
  const mediaEficiencia = data.reduce((acc, item) => acc + item.eficiencia, 0) / data.length;
  
  // Encontra o valor máximo para definir a escala
  const maxEficiencia = Math.max(...data.map(item => item.eficiencia));
  
  // Definir valor de referência para escala (o maior entre o valor máximo dos dados e a meta)
  const valorReferencia = Math.max(maxEficiencia, meta);
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (eficiencia: number) => Math.min((eficiencia / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = Math.min((meta / valorReferencia) * 100, 100);

  // Ordena por eficiência (do maior para o menor)
  const sortedData = [...data].sort((a, b) => b.eficiencia - a.eficiencia);
  
  // Define as cores com base no valor de eficiência
  const getBarColor = (value: number) => {
    if (value >= meta) return '#48BB78'; // verde para bom (acima da meta)
    if (value >= meta * 0.8) return '#ECC94B'; // amarelo para médio (até 20% abaixo da meta)
    return '#E53E3E'; // vermelho para ruim (mais de 20% abaixo da meta)
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
  const mediaCardColor = getCardBgColor(getBarColor(mediaEficiencia)); // Cor dinâmica com transparência

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
                <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color="black">
                  {item.eficiencia !== undefined ? item.eficiencia : "0"}%
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}; 