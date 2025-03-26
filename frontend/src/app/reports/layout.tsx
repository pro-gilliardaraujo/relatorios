'use client';

import { Box } from '@chakra-ui/react';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box h="100vh">
      {children}
    </Box>
  );
} 