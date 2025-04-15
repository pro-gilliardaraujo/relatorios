import React from 'react';
import { Box, Text, Flex, VStack, Center } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { limparIdOperador, formatarExibicaoOperador } from '@/utils/formatters';

interface EficienciaData {
  id: string;
  nome: string;
  eficiencia: number;
}

interface EficienciaEnergeticaSemanalProps {
  data: EficienciaData[];
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

// Dados de exemplo para o caso de não serem fornecidos
const defaultData: EficienciaData[] = [
  { id: '1', nome: 'SEM OPERADOR', eficiencia: 65.1 },
  { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', eficiencia: 72.1 }
];

export const GraficoEficienciaEnergeticaSemanal: React.FC<EficienciaEnergeticaSemanalProps> = ({ 
  data = [],
  meta = configManager.getMetas('colheita_semanal').eficienciaEnergetica
}) => {
  // Verificar se há dados válidos
  const dadosValidos = Array.isArray(data) && data.length > 0 && 
    data.some(item => item && item.nome && typeof item.eficiencia === 'number');
  
  // Se não tiver dados válidos, usar dados padrão
  const dadosFinais = dadosValidos ? data : defaultData;

  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;

  // Calcula a média de eficiência
  const mediaEficiencia = dadosFinais.reduce((acc, item) => acc + item.eficiencia, 0) / dadosFinais.length;
  
  // Encontra o valor máximo para definir a escala
  const maxEficiencia = Math.max(...dadosFinais.map(item => item.eficiencia));
  
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
    const diferenca = ((value - meta) / meta) * 100;

    if (value >= meta) return cores.meta_atingida;
    if (diferenca >= -tolerancias.proximo_meta) return cores.proximo_meta;
    if (diferenca >= -tolerancias.alerta) return cores.alerta;
    return cores.critico;
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
                
                {/* Segunda linha: Barra de progresso e valor de eficiência */}
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
                    
                    {/* Linha vertical indicando a meta de eficiência energética */}
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

export default GraficoEficienciaEnergeticaSemanal; 