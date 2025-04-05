import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface HorasElevadorData {
  id: string;
  nome: string;
  horas: number;
}

interface HorasElevadorProps {
  data: HorasElevadorData[];
  meta?: number;
  exibirCards?: boolean;
}

// Obter a meta do configManager
const META_HORAS_ELEVADOR = configManager.getMetas('colheita_diario').horaElevador;

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: HorasElevadorData[] = [
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', horas: 5.75 },
  { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', horas: 5.50 },
  { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', horas: 5.25 },
  { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', horas: 5.15 },
  { id: '357887', nome: 'EVERTON TIAGO MARQUES', horas: 5.10 },
  { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', horas: 5.00 }
];

export const GraficoHorasElevador: React.FC<HorasElevadorProps> = ({ 
  data = defaultData,
  meta = META_HORAS_ELEVADOR,
  exibirCards = false
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.horas === 'number' && item.horas > 0);
  
  // Log para diagnóstico
  console.log('📊 GraficoHorasElevador recebeu dados:', 
    Array.isArray(data) ? `${data.length} itens` : 'não é array',
    dadosValidos ? 'válidos' : 'inválidos');
  
  if (Array.isArray(data) && data.length > 0) {
    console.log('📊 Amostra de dados:', data.slice(0, 2));
  }
  
  // Usar dados padrão se não houver dados válidos
  const dadosFinais = dadosValidos ? data : defaultData;
  
  // Calcular a média de horas de elevador
  const mediaHoras = dadosFinais.reduce((acc, item) => acc + (item?.horas || 0), 0) / dadosFinais.length;
  
  // Encontrar o valor máximo para definir a escala
  const maxHoras = Math.max(...dadosFinais.map(item => item?.horas || 0));
  
  // Para "maior melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxHoras, meta * 1.2); // Garante que a meta fique visível
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (horas: number) => Math.min((horas / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por horas (do maior para o menor)
  const sortedData = [...dadosFinais].sort((a, b) => b.horas - a.horas);
  
  // Define as cores com base no valor das horas (maior melhor)
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
  const mediaCardColor = getCardBgColor(getBarColor(mediaHoras));

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
                <Text fontSize="10px" fontWeight="bold" w="45px" textAlign="right" color={getBarColor(item.horas)}>
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