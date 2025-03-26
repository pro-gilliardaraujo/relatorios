'use client';

import { useState, useEffect } from 'react';
import {
  VStack,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Box,
  Text,
  Image,
  CloseButton,
  Flex,
} from '@chakra-ui/react';

interface ImageSection {
  id: string;
  label: string;
  image: string | null;
}

interface ReportImageInputsProps {
  reportType: string;
  frente: string;
}

// Definindo as seções de imagens para cada tipo de relatório
const reportSections: Record<string, ImageSection[]> = {
  plantio: [
    { id: 'areaPlantio', label: 'Área de Plantio', image: null },
    { id: 'mapaVelocidade', label: 'Mapa de Velocidade', image: null },
    { id: 'mapaRPM', label: 'Mapa de RPM', image: null },
    { id: 'consumoCombustivel', label: 'Consumo de Combustível', image: null },
    { id: 'mapaTemperaturaMotor', label: 'Mapa por Temperatura Motor', image: null },
    { id: 'mapaAreaTotal', label: 'Mapa por Área Total', image: null },
  ],
  colheita: [
    { id: 'areaColheita', label: 'Área de Colheita', image: null },
    { id: 'mapaProdutividade', label: 'Mapa de Produtividade', image: null },
    { id: 'mapaUmidade', label: 'Mapa de Umidade', image: null },
    { id: 'consumoCombustivel', label: 'Consumo de Combustível', image: null },
    { id: 'mapaTemperaturaMotor', label: 'Mapa por Temperatura Motor', image: null },
  ],
  cav: [
    { id: 'areaCobertura', label: 'Área de Cobertura', image: null },
    { id: 'mapaAplicacao', label: 'Mapa de Aplicação', image: null },
    { id: 'mapaVelocidade', label: 'Mapa de Velocidade', image: null },
    { id: 'consumoCombustivel', label: 'Consumo de Combustível', image: null },
  ],
};

export default function ReportImageInputs({ reportType, frente }: ReportImageInputsProps) {
  const [sections, setSections] = useState<ImageSection[]>([]);

  useEffect(() => {
    if (reportType) {
      setSections(reportSections[reportType] || []);
    }
  }, [reportType]);

  const handlePaste = (sectionId: string) => async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData?.items;

    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setSections(sections.map(section => 
              section.id === sectionId 
                ? { ...section, image: dataUrl }
                : section
            ));
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeImage = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, image: null }
        : section
    ));
  };

  if (!reportType) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">
          Selecione um tipo de relatório para visualizar as seções de imagens
        </Text>
      </Box>
    );
  }

  if (!frente) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">
          Selecione uma frente de serviço para continuar
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Grid 
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)"
        }} 
        gap={4}
      >
        {sections.map((section) => (
          <GridItem key={section.id}>
            <FormControl>
              <Grid templateColumns="1fr" gap={2} mb={2}>
                <FormLabel
                  m={0}
                  fontSize={{ base: "xs", md: "sm" }}
                  color="gray.700"
                  fontWeight="medium"
                  textAlign="center"
                  w="100%"
                >
                  {section.label}
                </FormLabel>
              </Grid>
              
              <Box 
                position="relative" 
                h={{ base: "165px", md: "185px", lg: "205px" }}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                overflow="hidden"
              >
                {section.image ? (
                  <>
                    <CloseButton
                      size="sm"
                      position="absolute"
                      right={1}
                      top={1}
                      bg="white"
                      onClick={() => removeImage(section.id)}
                      zIndex={1}
                    />
                    <Image
                      src={section.image}
                      alt={section.label}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  </>
                ) : (
                  <Box
                    as="div"
                    role="button"
                    tabIndex={0}
                    onPaste={handlePaste(section.id)}
                    onKeyDown={(e) => e.key === 'v' && e.ctrlKey && handlePaste(section.id)}
                    cursor="pointer"
                    w="100%"
                    h="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="gray.50"
                    _hover={{ bg: 'gray.100' }}
                    transition="all 0.2s"
                  >
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      gap={2}
                    >
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.400">
                        Aguardando imagem
                      </Text>
                      <Box
                        px={3}
                        py={1}
                        bg="white"
                        borderRadius="md"
                        border="2px"
                        borderStyle="dashed"
                        borderColor="gray.300"
                      >
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                          Ctrl+V
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                )}
              </Box>
            </FormControl>
          </GridItem>
        ))}
      </Grid>
    </VStack>
  );
} 