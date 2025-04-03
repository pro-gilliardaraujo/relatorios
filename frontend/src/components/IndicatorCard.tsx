import { Box, Text, Flex, VStack } from '@chakra-ui/react';

interface IndicatorCardProps {
  title: string;
  value: number;
  meta: number;
  isInverted?: boolean;
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
  acimaMeta
}: IndicatorCardProps) {
  // Determinar se está acima da meta
  const isAboveTarget = isInverted ? value <= meta : value >= meta;

  // Texto de atingimento da meta
  const metaText = acimaMeta ? 
    `${acimaMeta.quantidade} de ${acimaMeta.total} atingiram a meta (${acimaMeta.percentual.toFixed(0)}%)` : 
    null;

  return (
    <Box borderWidth="1px" borderColor="black" borderRadius="md" p={3} bg="white">
      <Text fontSize="sm" fontWeight="bold" mb={1} color="black" textAlign="center" w="100%">{title}</Text>
      <Flex direction="row" align="center" justify="space-between">
        <VStack spacing={0} align="center">
          <Text fontSize="md" fontWeight="bold" color="green.500">{meta}%</Text>
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
          <Text fontSize="md" fontWeight="bold" color={isAboveTarget ? "green.500" : "red.500"}>{value.toFixed(1)}%</Text>
          <Text fontSize="10px" color="gray.500">Média</Text>
        </VStack>
      </Flex>
    </Box>
  );
} 