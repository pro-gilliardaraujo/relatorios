import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface A4TransbordoProps {
  children: ReactNode;
  isLastPage?: boolean;
  footer?: ReactNode;
}

export default function A4Transbordo({ children, isLastPage = false, footer }: A4TransbordoProps) {
  return (
    <Box
      w="210mm"
      h="297mm"
      mx="auto"
      my={0}
      bg="white"
      position="relative"
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      className={isLastPage ? "last-page" : ""}
      sx={{
        '@media print': {
          w: '210mm !important',
          h: '297mm !important',
          m: '0 !important',
          p: '0 !important',
          boxShadow: 'none !important',
          breakInside: 'avoid !important',
          breakAfter: isLastPage ? 'avoid !important' : 'always !important',
          pageBreakAfter: isLastPage ? 'avoid !important' : 'always !important',
          '@page': {
            size: 'A4',
            margin: '0 !important'
          }
        }
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
        sx={{
          '@media print': {
            m: '0 !important',
            p: '0 !important',
            border: '1px solid black !important'
          }
        }}
      />
      
      {/* Conteúdo com padding interno */}
      <Box
        position="relative"
        p="10mm"
        h="287mm"
        maxH="287mm"
        sx={{
          '@media print': {
            p: '10mm !important',
            h: '287mm !important',
            maxH: '287mm !important',
            overflow: 'visible !important',
            breakInside: 'avoid !important',
            breakAfter: isLastPage ? 'avoid !important' : 'always !important',
            m: '0 !important',
            '& > *': {
              breakInside: 'avoid !important'
            }
          }
        }}
      >
        {children}
        
        {/* Footer opcional (normalmente usado na última página) */}
        {footer}
      </Box>
    </Box>
  );
} 