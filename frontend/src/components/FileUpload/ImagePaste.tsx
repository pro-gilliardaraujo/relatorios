import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  SimpleGrid,
  Image,
  IconButton,
  VStack,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { FiX, FiImage } from 'react-icons/fi';

interface ImagePasteProps {
  onImagesChange?: (images: string[]) => void;
}

export default function ImagePaste({ onImagesChange }: ImagePasteProps) {
  const [images, setImages] = useState<string[]>([]);
  const toast = useToast();

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData?.items;

    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          try {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string;
              setImages((prev) => [...prev, dataUrl]);
              toast({
                title: 'Imagem colada com sucesso',
                status: 'success',
                duration: 2000,
              });
            };
            reader.readAsDataURL(file);
          } catch (error) {
            toast({
              title: 'Erro ao colar imagem',
              status: 'error',
              duration: 3000,
            });
          }
        }
      }
    }
  }, [toast]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  useEffect(() => {
    onImagesChange?.(images);
  }, [images, onImagesChange]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Box
        p={6}
        border="2px dashed"
        borderColor="gray.200"
        borderRadius="lg"
        bg="white"
        position="relative"
        minH="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {images.length === 0 ? (
          <VStack spacing={2}>
            <FiImage size={32} color="gray" />
            <Text color="gray.500" textAlign="center">
              Cole uma imagem usando Ctrl+V
              <br />
              <Text as="span" fontSize="sm" color="gray.400">
                Suporta imagens da área de transferência
              </Text>
            </Text>
          </VStack>
        ) : (
          <SimpleGrid columns={[1, 2, 3]} spacing={4} w="100%">
            {images.map((src, index) => (
              <Box key={index} position="relative">
                <Image
                  src={src}
                  alt={`Imagem ${index + 1}`}
                  borderRadius="md"
                  objectFit="cover"
                  w="100%"
                  h="150px"
                />
                <IconButton
                  icon={<FiX />}
                  aria-label="Remover imagem"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="red"
                  onClick={() => removeImage(index)}
                />
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {images.length > 0 && (
        <Flex justify="space-between" align="center" px={2}>
          <Text color="gray.600" fontSize="sm">
            {images.length} {images.length === 1 ? 'imagem' : 'imagens'} colada{images.length === 1 ? '' : 's'}
          </Text>
          <Text color="gray.400" fontSize="sm">
            Ctrl+V para adicionar mais
          </Text>
        </Flex>
      )}
    </VStack>
  );
} 