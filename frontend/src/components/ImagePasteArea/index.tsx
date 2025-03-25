'use client'

import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Image } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { IMAGE_TYPES, ImageType, ImageData } from '@/types'
import { uploadImage } from '@/services/api'

export function ImagePasteArea() {
  const [images, setImages] = useState<Record<ImageType, ImageData | null>>({
    area_plantio: null,
    mapa_velocidade: null,
    mapa_rpm: null,
    consumo_combustivel: null,
    temperatura_motor: null,
    area_total: null
  })

  const handlePaste = useCallback(async (e: ClipboardEvent, type: ImageType) => {
    e.preventDefault()
    
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (!file) continue

        try {
          const response = await uploadImage(file)
          setImages(prev => ({
            ...prev,
            [type]: {
              id: response.image_id,
              url: response.url,
              type
            }
          }))
        } catch (error) {
          console.error('Erro ao fazer upload da imagem:', error)
        }
      }
    }
  }, [])

  const handleDrop = useCallback(async (e: DragEvent, type: ImageType) => {
    e.preventDefault()
    
    const file = e.dataTransfer?.files[0]
    if (!file || !file.type.startsWith('image/')) return

    try {
      const response = await uploadImage(file)
      setImages(prev => ({
        ...prev,
        [type]: {
          id: response.image_id,
          url: response.url,
          type
        }
      }))
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
    }
  }, [])

  return (
    <Tabs>
      <TabList>
        {Object.entries(IMAGE_TYPES).map(([type, label]) => (
          <Tab key={type}>{label}</Tab>
        ))}
      </TabList>

      <TabPanels>
        {Object.entries(IMAGE_TYPES).map(([type, label]) => (
          <TabPanel key={type}>
            <Box
              p={4}
              border="2px"
              borderStyle="dashed"
              borderColor="gray.200"
              borderRadius="md"
              onPaste={(e: any) => handlePaste(e, type as ImageType)}
              onDrop={(e: any) => handleDrop(e, type as ImageType)}
              onDragOver={(e) => e.preventDefault()}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ borderColor: 'blue.500' }}
            >
              {images[type as ImageType] ? (
                <Image
                  src={images[type as ImageType]!.url}
                  alt={label}
                  maxH="300px"
                  mx="auto"
                />
              ) : (
                <Text textAlign="center" color="gray.600">
                  Cole uma imagem aqui (Ctrl+V) ou arraste e solte
                </Text>
              )}
            </Box>
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  )
} 