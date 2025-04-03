import { Box } from '@chakra-ui/react';

interface FrotaData {
  frota: string;
  disponibilidade: number;
}

interface TabelaFrotasProps {
  dados: FrotaData[];
}

export default function TabelaFrotas({ dados }: TabelaFrotasProps) {
  return (
    <Box 
      w="100%" 
      border="1px solid" 
      borderColor="black" 
      borderRadius="md" 
      overflow="hidden"
    >
      <Box as="table" w="100%" fontSize="11px">
        <Box as="thead">
          <Box as="tr" bg="gray.50">
            <Box as="th" p={2} textAlign="left" borderBottom="1px solid" borderColor="black" color="black">
              Frota
            </Box>
            <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black">
              Disponibilidade
            </Box>
          </Box>
        </Box>
        <Box as="tbody">
          {dados
            .filter(item => item.frota !== '0')
            .sort((a, b) => b.disponibilidade - a.disponibilidade)
            .map((item, index) => (
              <Box 
                as="tr" 
                key={index}
                bg={index % 2 === 0 ? "white" : "gray.50"}
              >
                <Box as="td" p={2} borderBottom="1px solid" borderColor="black" color="black">
                  {item.frota}
                </Box>
                <Box as="td" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color={item.disponibilidade >= 95 ? "green.500" : item.disponibilidade >= 76 ? "yellow.500" : "red.500"}>
                  {item.disponibilidade.toFixed(2)}%
                </Box>
              </Box>
            ))}
        </Box>
      </Box>
    </Box>
  );
} 