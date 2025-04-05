import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

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

// Obter a meta do configManager
const META_EFICIENCIA_ENERGETICA = configManager.getMetas('colheita_diario').eficienciaEnergetica;

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
  meta = META_EFICIENCIA_ENERGETICA,
  exibirCards = false
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.eficiencia === 'number' && item.eficiencia > 0);
  
  // Log para diagnóstico
  console.log('📊 GraficoEficienciaEnergetica recebeu dados:', 
    Array.isArray(data) ? `${data.length} itens` : 'não é array',
    dadosValidos ? 'válidos' : 'inválidos');
  
  if (Array.isArray(data) && data.length > 0) {
    console.log('📊 Amostra de dados:', data.slice(0, 2));
  }
  
  // Usar dados padrão se não houver dados válidos
  const dadosFinais = dadosValidos ? data : defaultData;
  
  // Calcula a média de eficiência
  const mediaEficiencia = dadosFinais.reduce((acc, item) => acc + (item?.eficiencia || 0), 0) / dadosFinais.length;
  
  // Encontra o valor máximo para definir a escala
  const maxEficiencia = Math.max(...dadosFinais.map(item => item?.eficiencia || 0));
  
  // Para "maior melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxEficiencia, meta * 1.2); // Garante que a meta fique visível
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (eficiencia: number) => Math.min((eficiencia / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por eficiência (do maior para o menor)
  const sortedData = [...dadosFinais].sort((a, b) => b.eficiencia - a.eficiencia);
  
  // Define as cores com base no valor da eficiência (maior melhor)
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

  const metaCardColor = getCardBgColor('#48BB78'); // Verde com transparência
  const mediaCardColor = getCardBgColor(getBarColor(mediaEficiencia));

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
                <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={getBarColor(item.eficiencia)}>
                  {item.eficiencia !== undefined ? item.eficiencia.toFixed(1) : "0.0"}%
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}; 