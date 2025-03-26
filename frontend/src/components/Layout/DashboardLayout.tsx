import { Box, Grid, GridItem } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  filters?: ReactNode;
}

export default function DashboardLayout({ children, filters }: DashboardLayoutProps) {
  return (
    <Grid
      templateAreas={{
        base: `"filters"
               "main"`,
        md: `"filters filters"
             "main main"`,
      }}
      gridTemplateRows={'auto 1fr'}
      gap={4}
      p={4}
      h="100vh"
      overflow="hidden"
    >
      {filters && (
        <GridItem area="filters" bg="white" p={4} borderRadius="lg" boxShadow="sm">
          {filters}
        </GridItem>
      )}
      
      <GridItem 
        area="main" 
        bg="white" 
        p={4} 
        borderRadius="lg" 
        boxShadow="sm"
        overflow="auto"
      >
        {children}
      </GridItem>
    </Grid>
  );
} 