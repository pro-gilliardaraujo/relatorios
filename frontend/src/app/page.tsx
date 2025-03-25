'use client'

import { Box, Container, Heading } from '@chakra-ui/react'
import { FileUpload } from '@/components/FileUpload'
import { ImagePasteArea } from '@/components/ImagePasteArea'
import { DataDisplay } from '@/components/DataDisplay'
import { useState } from 'react'
import { ProcessedData } from '@/types'

export default function Home() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null)

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8}>Boletim Diário - Plantadeiras</Heading>
      
      <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Coluna da esquerda: Upload e visualização de dados */}
        <Box>
          <FileUpload onDataProcessed={setProcessedData} />
          {processedData && <DataDisplay data={processedData} />}
        </Box>

        {/* Coluna da direita: Áreas de imagem */}
        <Box>
          <Heading size="md" mb={4}>Mapas e Imagens</Heading>
          <ImagePasteArea />
        </Box>
      </Box>
    </Container>
  )
} 