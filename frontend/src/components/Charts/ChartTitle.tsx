import { Box, Flex, Heading, Select } from '@chakra-ui/react';

interface ChartTitleProps {
  title: string;
  fonte: string;
  onFonteChange: (newFonte: string) => void;
}

export default function ChartTitle({ title, fonte, onFonteChange }: ChartTitleProps) {
  return (
    <Flex direction="column" gap={2} mb={4}>
      <Heading size="sm" textAlign="center">
        {title}
      </Heading>
      <Box maxW="250px" mx="auto">
        <Select
          size="xs"
          bg="white"
          color="black"
          borderColor="gray.300"
          value={fonte}
          onChange={(e) => onFonteChange(e.target.value)}
          _hover={{ borderColor: "gray.400" }}
          sx={{
            option: {
              bg: 'white',
              color: 'black'
            }
          }}
        >
          <option value="SGPA - Solinftec">SGPA - Solinftec</option>
          <option value="Operations Center - John Deere">Operations Center - John Deere</option>
        </Select>
      </Box>
    </Flex>
  );
} 