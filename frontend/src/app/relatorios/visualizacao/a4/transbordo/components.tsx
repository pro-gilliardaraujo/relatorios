import React from 'react';
import { Box, Flex, VStack, Heading, Text, Table, Tbody, Tr, Td } from '@chakra-ui/react';

// Componente de grid com layout básico
export const GridCardsContainer = ({ children, columns = 1 }: { children: React.ReactNode, columns?: number }) => {
  return (
    <VStack spacing={4} width="100%">
      {children}
    </VStack>
  );
};

// Componente de card para gráficos
export const CardContainer = ({ children, title }: { children: React.ReactNode, title: string }) => {
  return (
    <Box width="100%" mb={4}>
      <Heading 
        as="h3" 
        size="sm" 
        textAlign="center" 
        mb={2} 
        fontSize="15px"
        color="black"
      >
        {title}
      </Heading>
      <Box 
        border="1px solid"
        borderColor="black"
        borderRadius="md"
        p={4}
        bg="white"
        width="100%"
      >
        {children}
      </Box>
    </Box>
  );
};

// Componente para o cabeçalho da página
export const ReportHeader = ({ logo, title, subtitle }: { logo: string, title: string, subtitle: string }) => {
  return (
    <Flex justify="space-between" align="center" mb={4}>
      <Box width="50px">
        <img src={logo} alt="Logo" style={{ height: '50px', width: 'auto' }} />
      </Box>
      <VStack spacing={1}>
        <Heading size="md" color="black" fontWeight="bold" textAlign="center">
          {title}
        </Heading>
        <Text color="black" fontSize="sm">
          {subtitle}
        </Text>
      </VStack>
      <Box width="50px">
        <img src={logo} alt="Logo" style={{ height: '50px', width: 'auto' }} />
      </Box>
    </Flex>
  );
}; 