import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface A4LayoutProps {
  children: ReactNode;
}

export default function A4Layout({ children }: A4LayoutProps) {
  return (
    <Box
      w="210mm"
      h="297mm"
      mx="auto"
      my={0}
      bg="white"
      position="relative"
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      sx={{
        '@media print': {
          w: '210mm',
          h: '297mm',
          m: 0,
          p: 0,
          boxShadow: 'none',
          breakInside: 'avoid',
          '@page': {
            size: 'A4',
            margin: 0,
          },
        },
      }}
    >
      {/* Margem externa */}
      <Box
        position="absolute"
        top="5mm"
        left="5mm"
        right="5mm"
        bottom="5mm"
        border="1px solid black"
      />
      
      {/* Conteúdo com padding interno */}
      <Box
        position="relative"
        p="10mm"
        h="277mm"
        maxH="277mm"
        overflow="hidden"
        sx={{
          '@media print': {
            p: '10mm',
            h: '277mm',
            maxH: '277mm',
            overflow: 'hidden',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 