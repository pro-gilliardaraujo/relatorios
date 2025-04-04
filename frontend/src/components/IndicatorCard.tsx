import { Box, Text, Flex, VStack } from '@chakra-ui/react';

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
  // Determinar se está acima da meta
  const isAboveTarget = isInverted ? value <= meta : value >= meta;

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
          <Text fontSize="md" fontWeight="bold" color="green.500">{formatMeta(meta)}</Text>
          <Text fontSize="10px" color="gray.500">Meta</Text>
        </VStack>
        {metaText && (
          <Text 
            fontSize="xs" 
            color={isAboveTarget ? "green.500" : "red.500"} 
            textAlign="center"
            mx={2}
            flex={1}
          >
            {metaText}
          </Text>
        )}
        <VStack spacing={0} align="center">
          <Text fontSize="md" fontWeight="bold" color={isAboveTarget ? "green.500" : "red.500"}>{formatValue(value)}</Text>
          <Text fontSize="10px" color="gray.500">Média</Text>
        </VStack>
      </Flex>
    </Box>
  );
} 