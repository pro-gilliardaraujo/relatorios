import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

// Valores padrão para cores e tolerâncias
const DEFAULT_COLORS = {
  meta_atingida: '#48BB78',
  proximo_meta: '#98FB98',
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

interface IndicatorCardProps {
  title: string;
  value: number;
  meta: number;
  isInverted?: boolean;
  unitType?: 'porcentagem' | 'decimal' | 'horas';
  acimaMeta?: {
    quantidade: number;
    total: number;
    percentual: number;
  };
}

export default function IndicatorCard({ 
  title, 
  value, 
  meta, 
  isInverted = false,
  unitType = 'porcentagem',
  acimaMeta
}: IndicatorCardProps) {
  // Obter configurações de cores e tolerâncias com fallback para valores padrão
  const cores = configManager.getConfig()?.graficos?.cores || DEFAULT_COLORS;
  const tolerancias = configManager.getConfig()?.graficos?.tolerancias || DEFAULT_TOLERANCES;
  const formatacao = configManager.getConfig()?.graficos?.formatacao || DEFAULT_FORMATTING;
  const diferencas = configManager.getConfig()?.graficos?.diferencas_meta || {
    normal: {
      meta_atingida: ">=",
      proximo_meta: -5,
      alerta: -15,
      critico: "<-15"
    },
    invertido: {
      meta_atingida: "<=",
      proximo_meta: 5,
      alerta: 15,
      critico: ">15"
    }
  };

  // Determinar se está dentro da meta
  const isWithinTarget = isInverted ? value <= meta : value >= meta;

  // Determinar a cor baseada na diferença percentual
  const getValueColor = () => {
    const diferenca = ((value - meta) / meta) * 100;
    const diferencaAbs = Math.abs(diferenca);
    const config = isInverted ? diferencas.invertido : diferencas.normal;

    if (isInverted) {
      if (value <= meta) return cores.meta_atingida;
      if (diferenca <= config.proximo_meta) return cores.proximo_meta;
      if (diferenca <= config.alerta) return cores.alerta;
      return cores.critico;
    } else {
      if (value >= meta) return cores.meta_atingida;
      if (diferencaAbs <= config.proximo_meta) return cores.proximo_meta;
      if (diferencaAbs <= config.alerta) return cores.alerta;
      return cores.critico;
    }
  };

  // Texto de atingimento da meta
  const metaText = acimaMeta ? 
    `${acimaMeta.quantidade} de ${acimaMeta.total} atingiram a meta (${acimaMeta.percentual.toFixed(1)}%)` : 
    null;

  // Formatar valor de acordo com o tipo de unidade (preservando precisão)
  const formatValue = (val: number): string => {
    // Log para debug
    console.log(`📊 Formatando valor (${unitType}): ${val}`);
    
    if (unitType === 'porcentagem') {
      // Formatação para porcentagem com 2 casas decimais sem arredondamento
      const valueStr = String(val);
      const decimalIndex = valueStr.indexOf('.');
      
      if (decimalIndex === -1) {
        // Sem casa decimal, adicionar .0%
        return `${valueStr}.0%`;
      } else {
        const integerPart = valueStr.substring(0, decimalIndex);
        const decimalPart = valueStr.substring(decimalIndex + 1);
        
        // Se tem mais que 2 casas decimais, truncar para 2 (sem arredondamento)
        if (decimalPart.length >= 2) {
          return `${integerPart}.${decimalPart.substring(0, 2)}%`;
        } 
        // Se tem menos que 2 casas, completar com zeros
        else {
          return `${integerPart}.${decimalPart}${'0'.repeat(2 - decimalPart.length)}%`;
        }
      }
    } else if (unitType === 'decimal') {
      // Formatação para decimal com 4 casas decimais sem arredondamento
      const valueStr = String(val);
      const decimalIndex = valueStr.indexOf('.');
      
      if (decimalIndex === -1) {
        // Sem casa decimal, adicionar .0000
        return `${valueStr}.0000`;
      } else {
        const integerPart = valueStr.substring(0, decimalIndex);
        const decimalPart = valueStr.substring(decimalIndex + 1);
        
        // Se tem mais que 4 casas decimais, truncar para 4 (sem arredondamento)
        if (decimalPart.length >= 4) {
          return `${integerPart}.${decimalPart.substring(0, 4)}`;
        } 
        // Se tem menos que 4 casas, completar com zeros
        else {
          return `${integerPart}.${decimalPart}${'0'.repeat(4 - decimalPart.length)}`;
        }
      }
    } else if (unitType === 'horas') {
      const hours = Math.floor(val);
      const minutes = Math.round((val - hours) * 60);
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return `${val}`;
  };

  // Formatar meta de acordo com o tipo de unidade (preservando precisão)
  const formatMeta = (val: number): string => {
    // Log para debug
    console.log(`📊 Formatando meta (${unitType}): ${val}`);
    
    if (unitType === 'porcentagem') {
      // Formatação para porcentagem com 2 casas decimais sem arredondamento
      const valueStr = String(val);
      const decimalIndex = valueStr.indexOf('.');
      
      if (decimalIndex === -1) {
        // Sem casa decimal, adicionar .0%
        return `${valueStr}.0%`;
      } else {
        const integerPart = valueStr.substring(0, decimalIndex);
        const decimalPart = valueStr.substring(decimalIndex + 1);
        
        // Se tem mais que 2 casas decimais, truncar para 2 (sem arredondamento)
        if (decimalPart.length >= 2) {
          return `${integerPart}.${decimalPart.substring(0, 2)}%`;
        } 
        // Se tem menos que 2 casas, completar com zeros
        else {
          return `${integerPart}.${decimalPart}${'0'.repeat(2 - decimalPart.length)}%`;
        }
      }
    } else if (unitType === 'decimal') {
      // Formatação para decimal com 4 casas decimais sem arredondamento
      const valueStr = String(val);
      const decimalIndex = valueStr.indexOf('.');
      
      if (decimalIndex === -1) {
        // Sem casa decimal, adicionar .0000
        return `${valueStr}.0000`;
      } else {
        const integerPart = valueStr.substring(0, decimalIndex);
        const decimalPart = valueStr.substring(decimalIndex + 1);
        
        // Se tem mais que 4 casas decimais, truncar para 4 (sem arredondamento)
        if (decimalPart.length >= 4) {
          return `${integerPart}.${decimalPart.substring(0, 4)}`;
        } 
        // Se tem menos que 4 casas, completar com zeros
        else {
          return `${integerPart}.${decimalPart}${'0'.repeat(4 - decimalPart.length)}`;
        }
      }
    } else if (unitType === 'horas') {
      const hours = Math.floor(val);
      const minutes = Math.round((val - hours) * 60);
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return `${val}`;
  };

  return (
    <Box borderWidth="1px" borderColor="black" borderRadius="md" p={3} bg="white">
      <Text fontSize="sm" fontWeight="bold" mb={1} color="black" textAlign="center" w="100%">{title}</Text>
      <Flex direction="row" align="center" justify="space-between">
        <VStack spacing={0} align="center">
          <Text fontSize="md" fontWeight="bold" color={cores.meta_atingida}>{formatValue(meta)}</Text>
          <Text fontSize="10px" color="gray.500">Meta</Text>
        </VStack>
        {metaText && (
          <Text 
            fontSize="xs" 
            color={isWithinTarget ? cores.meta_atingida : cores.critico} 
            textAlign="center"
            mx={2}
            flex={1}
          >
            {metaText}
          </Text>
        )}
        <VStack spacing={0} align="center">
          <Text fontSize="md" fontWeight="bold" color={getValueColor()}>{formatValue(value)}</Text>
          <Text fontSize="10px" color="gray.500">Média</Text>
        </VStack>
      </Flex>
    </Box>
  );
} 