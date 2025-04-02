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
  Select,
} from '@chakra-ui/react';
import { useReportStore } from '@/store/useReportStore';
import { configManager } from '@/utils/config';

interface ImageSection {
  id: string;
  label: string;
  image: string | null;
  fonte: string;
}

interface ReportImageInputsProps {
  reportType: string;
  frente: string;
  fonte: string;
}

// Definindo as seções de imagens para cada tipo de relatório
const reportSections: Record<string, ImageSection[]> = {
  plantio: [
    { id: 'areaPlantio', label: 'Área de Plantio', image: null, fonte: '' },
    { id: 'mapaVelocidade', label: 'Mapa de Velocidade', image: null, fonte: '' },
    { id: 'mapaRPM', label: 'Mapa de RPM', image: null, fonte: '' },
    { id: 'consumoCombustivel', label: 'Consumo de Combustível', image: null, fonte: '' },
    { id: 'mapaTemperaturaMotor', label: 'Mapa por Temperatura Motor', image: null, fonte: '' },
    { id: 'mapaAreaTotal', label: 'Mapa por Área Total', image: null, fonte: '' },
  ],
  colheita: [
    { id: 'areaColheita', label: 'Área de Colheita', image: null, fonte: '' },
    { id: 'mapaProdutividade', label: 'Mapa de Produtividade', image: null, fonte: '' },
    { id: 'mapaUmidade', label: 'Mapa de Umidade', image: null, fonte: '' },
    { id: 'consumoCombustivel', label: 'Consumo de Combustível', image: null, fonte: '' },
    { id: 'mapaTemperaturaMotor', label: 'Mapa por Temperatura Motor', image: null, fonte: '' },
  ],
  cav: [
    { id: 'areaCobertura', label: 'Área de Cobertura', image: null, fonte: '' },
    { id: 'mapaAplicacao', label: 'Mapa de Aplicação', image: null, fonte: '' },
    { id: 'mapaVelocidade', label: 'Mapa de Velocidade', image: null, fonte: '' },
    { id: 'consumoCombustivel', label: 'Consumo de Combustível', image: null, fonte: '' },
  ],
};

export default function ReportImageInputs({ reportType, frente, fonte }: ReportImageInputsProps) {
  const [sections, setSections] = useState<ImageSection[]>([]);
  const { addImage, removeImage, images, updateImageFonte } = useReportStore();
  const fontesImagens = configManager.getFontesImagens();

  useEffect(() => {
    if (reportType) {
      setSections(reportSections[reportType] || []);
    }
  }, [reportType]);

  useEffect(() => {
    if (fonte) {
      // Atualiza as seções locais
      setSections(prev => prev.map(section => ({
        ...section,
        fonte
      })));
      
      // Atualiza as fontes das imagens existentes no store
      images.forEach(image => {
        updateImageFonte(image.containerId, fonte);
      });
    }
  }, [fonte, updateImageFonte, images]);

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
            // Adicionar imagem ao store global com a fonte atual
            addImage({
              data: dataUrl,
              containerId: sectionId,
              fonte: fonte || ''
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleDrop = (sectionId: string) => async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSections(sections.map(section => 
          section.id === sectionId 
            ? { ...section, image: dataUrl }
            : section
        ));
        // Adicionar imagem ao store global com a fonte atual
        addImage({
          data: dataUrl,
          containerId: sectionId,
          fonte: fonte || ''
        });
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.style.backgroundColor = '#EDF2F7';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.style.backgroundColor = '#F7FAFC';
  };

  const handleRemoveImage = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, image: null }
        : section
    ));
    removeImage(sectionId);
  };

  const handleFonteChange = (sectionId: string, newFonte: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fonte: newFonte }
        : section
    ));
    // Atualizar a fonte no store global
    updateImageFonte(sectionId, newFonte);
  };

  if (!reportType) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="black">
          Selecione um tipo de relatório para visualizar as seções de imagens
        </Text>
      </Box>
    );
  }

  if (!frente) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="black">
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
              <FormLabel
                m={0}
                fontSize={{ base: "xs", md: "sm" }}
                color="black"
                fontWeight="medium"
                textAlign="center"
                w="100%"
              >
                {section.label}
              </FormLabel>
              <Box 
                position="relative" 
                h={{ base: "145px", md: "165px", lg: "180px" }}
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
                      onClick={() => handleRemoveImage(section.id)}
                      zIndex={2}
                      boxShadow="md"
                      borderRadius="full"
                      color="black"
                      _hover={{ bg: 'gray.100' }}
                    />
                    <Box
                      position="relative"
                      w="100%"
                      h="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      overflow="hidden"
                    >
                      <Image
                        src={section.image}
                        alt={section.label}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center'
                        }}
                      />
                      <Box
                        position="absolute"
                        bottom={2}
                        right={2}
                        display="flex"
                        alignItems="center"
                        gap={2}
                        bg="white"
                        px={2}
                        py={1}
                        borderRadius="sm"
                        boxShadow="sm"
                      >
                        <Text fontSize="xs" color="black">
                          Fonte:
                        </Text>
                        <Select
                          size="xs"
                          value={section.fonte}
                          onChange={(e) => handleFonteChange(section.id, e.target.value)}
                          bg="white"
                          color="black"
                          border="none"
                          _focus={{ border: "none" }}
                          w="auto"
                          pl={0}
                          sx={{
                            option: {
                              bg: 'white',
                              color: 'black'
                            }
                          }}
                        >
                          <option value="">Não Informar</option>
                          {fontesImagens.map(fonte => (
                            <option key={fonte.id} value={fonte.id}>
                              {fonte.nome}
                            </option>
                          ))}
                        </Select>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box
                    as="div"
                    role="button"
                    tabIndex={0}
                    onPaste={handlePaste(section.id)}
                    onDrop={handleDrop(section.id)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onKeyDown={(e) => {
                      if (e.key === 'v' && e.ctrlKey) {
                        handlePaste(section.id)(e as unknown as React.ClipboardEvent);
                      }
                    }}
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
                      <Text fontSize={{ base: "xs", md: "sm" }} color="black">
                        Arraste uma imagem ou use Ctrl+V
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
                        <Text fontSize={{ base: "xs", md: "sm" }} color="black">
                          Ctrl+V ou Arraste
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