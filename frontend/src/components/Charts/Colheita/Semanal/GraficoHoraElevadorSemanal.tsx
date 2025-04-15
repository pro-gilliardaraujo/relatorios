import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { limparIdOperador, formatarExibicaoOperador } from '@/utils/formatters';

interface HoraElevadorData {
  id: string;
  nome: string;
  horas: number;
}

interface GraficoHoraElevadorSemanalProps {
  data: HoraElevadorData[];
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
    casas: 1,
    separador: "."
  },
  porcentagem: {
    casas: 1,
    separador: "."
  },
  horas: {
    formato: "Xh"
  }
};

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: HoraElevadorData[] = [
  { id: '1', nome: 'SEM OPERADOR', horas: 2.5 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', horas: 3.1 }
];

export const GraficoHoraElevadorSemanal: React.FC<GraficoHoraElevadorSemanalProps> = ({ 
  data = [],
  meta = configManager.getMetas('colheita_semanal').horaElevador
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.horas === 'number');
  
  // Se não tiver dados válidos, usar dados padrão
  const dadosFinais = dadosValidos ? data : defaultData;

  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;

  // Encontra o valor máximo para definir a escala
  const maxHoras = Math.max(...dadosFinais.map(item => item.horas));
  
  // Para "maior é melhor", usamos o maior valor como referência para a escala
  const valorReferencia = Math.max(maxHoras, meta * 2); // Garante que a meta fique visível
  
  // Função de escala que garante que nunca ultrapasse 100%
  const scalePercentage = (horas: number) => Math.min((horas / valorReferencia) * 100, 100);
  
  // Calcula onde ficará a linha de meta na escala relativa
  const metaScaled = (meta / valorReferencia) * 100;

  // Ordena por horas (do maior para o menor)
  const sortedData = [...dadosFinais].sort((a, b) => b.horas - a.horas);
  
  // Define as cores com base no valor (maior é melhor)
  const getBarColor = (value: number) => {
    if (value >= meta) return cores.meta_atingida;
    if (value >= meta * 0.8) return cores.proximo_meta;
    if (value >= meta * 0.6) return cores.alerta;
    return cores.critico;
  };

  // Formatar horas para exibição
  const formatHoras = (horas: number): string => {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    
    if (minutos > 0) {
      return `${horasInteiras}h${minutos.toString().padStart(2, '0')}m`;
    }
    return `${horasInteiras}h`;
  };

  // Se não tiver dados, mostrar mensagem
  if (!dadosValidos && data.length === 0) {
    return (
      <Center h="100%" flexDirection="column">
        <Text fontSize="14px" color="gray.500" fontWeight="medium">Sem dados disponíveis</Text>
        <Text fontSize="12px" color="gray.400">Verifique o relatório selecionado</Text>
      </Center>
    );
  }

  return (
    <Box h="100%">
      <Box h="100%" overflowY="auto">
        <VStack spacing={1} align="stretch">
          {sortedData.map((item, index) => {
            // Limpar e formattar nome do operador
            const idOperador = limparIdOperador(item.id);
            const nomeOperador = formatarExibicaoOperador(item.nome, idOperador);
            
            return (
              <Box 
                key={index}
                py={0.5}
                px={1}
                bg={index % 2 === 0 ? "gray.50" : "white"}
                borderRadius="sm"
              >
                {/* Primeira linha: Nome do operador */}
                <Text 
                  fontSize="10px" 
                  fontWeight="medium" 
                  noOfLines={1} 
                  title={nomeOperador} 
                  mb={0.5} 
                  color="black"
                >
                  {nomeOperador}
                </Text>
                
                {/* Segunda linha: Barra de progresso e valor de horas */}
                <Flex direction="row" align="center">
                  <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 45px)">
                    <Flex 
                      position="absolute" 
                      bg={getBarColor(item.horas)} 
                      h="100%" 
                      w={`${scalePercentage(item.horas)}%`}
                      borderRadius="sm"
                      alignItems="center"
                    />
                    
                    {/* Linha vertical indicando a meta de horas elevador */}
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
                  <Text fontSize="10px" fontWeight="bold" w="40px" textAlign="right" color={getBarColor(item.horas)}>
                    {formatHoras(item.horas)}
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

export default GraficoHoraElevadorSemanal; 