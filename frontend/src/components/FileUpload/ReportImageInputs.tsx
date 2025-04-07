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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  HStack,
  SimpleGrid,
  Icon,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { useReportStore } from '@/store/useReportStore';
import { configManager } from '@/utils/config';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiLayout } from 'react-icons/fi';

interface ImageSection {
  id: string;
  label: string;
  image: string | null;
  fonte: string;
}

// Interface para os layouts de relatório
interface LayoutOption {
  id: string;
  name: string;
  imagesPerPage: number;
  description: string;
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
  // Nova seção para drones - inicialmente vazia, será gerenciada dinamicamente
  drones: [],
  // Nova seção para relatório comparativo de unidades - inicialmente vazia, também gerenciada dinamicamente
  comparativo_unidades_diario: [
    { id: 'graficoDisponibilidadeColheita', label: 'Gráfico de Disponibilidade Mecânica (Colheita)', image: null, fonte: '' },
    { id: 'graficoEficienciaColheita', label: 'Gráfico de Eficiência Operacional (Colheita)', image: null, fonte: '' },
    { id: 'graficoMotorOciosoColheita', label: 'Gráfico de Motor Ocioso (Colheita)', image: null, fonte: '' },
    { id: 'graficoHorasElevadorColheita', label: 'Gráfico de Horas Elevador (Colheita)', image: null, fonte: '' },
    { id: 'graficoUsoGPSColheita', label: 'Gráfico de Uso GPS (Colheita)', image: null, fonte: '' },
    { id: 'graficoDisponibilidadeTransbordo', label: 'Gráfico de Disponibilidade Mecânica (Transbordo)', image: null, fonte: '' },
    { id: 'graficoEficienciaTransbordo', label: 'Gráfico de Eficiência Operacional (Transbordo)', image: null, fonte: '' },
    { id: 'graficoMotorOciosoTransbordo', label: 'Gráfico de Motor Ocioso (Transbordo)', image: null, fonte: '' },
    { id: 'graficoFaltaApontamentoTransbordo', label: 'Gráfico de Falta de Apontamento (Transbordo)', image: null, fonte: '' },
    { id: 'graficoUsoGPSTransbordo', label: 'Gráfico de Uso GPS (Transbordo)', image: null, fonte: '' },
  ],
};

// Layouts predefinidos para o relatório de drones
const droneLayouts: LayoutOption[] = [
  { id: 'single', name: 'Uma imagem', imagesPerPage: 1, description: 'Uma imagem grande por página' },
  { id: 'double', name: 'Duas imagens', imagesPerPage: 2, description: 'Duas imagens por página, lado a lado' },
  { id: 'triple', name: 'Três imagens', imagesPerPage: 3, description: 'Três imagens por página em layout otimizado' },
];

// Interface para configuração de layout por página
interface PageLayout {
  pageNumber: number;
  layoutType: string;
  imagesPerPage: number;
}

export default function ReportImageInputs({ reportType, frente, fonte }: ReportImageInputsProps) {
  const [sections, setSections] = useState<ImageSection[]>([]);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const { addImage, removeImage, images, updateImageFonte } = useReportStore();
  const fontesImagens = configManager.getFontesImagens();
  const toast = useToast();
  
  // Estados para o relatório de drones
  const [totalImages, setTotalImages] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [dynamicSections, setDynamicSections] = useState<ImageSection[]>([]);
  const [pageLayouts, setPageLayouts] = useState<PageLayout[]>([
    { pageNumber: 1, layoutType: 'single', imagesPerPage: 1 }
  ]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        if (!configManager.isLoaded()) {
          await configManager.reloadConfig();
        }
        setIsConfigLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        // Mesmo com erro, vamos usar as configurações padrão
        setIsConfigLoaded(true);
      }
    };
    
    loadConfig();
  }, []);

  useEffect(() => {
    if (reportType) {
      if (reportType === 'drones' || reportType === 'drones_diario' || reportType === 'drones_semanal') {
        // Para drones, não carregamos seções fixas, elas serão dinâmicas
        setSections([]);
        // Inicializa com layout padrão de uma imagem
        handleTotalImagesChange(1);
      } else {
        // Para outros tipos de relatório, carregamos as seções predefinidas
        setSections(reportSections[reportType] || []);
        setDynamicSections([]);
      }
    }
  }, [reportType]);

  useEffect(() => {
    if (fonte) {
      // Atualiza as seções locais
      setSections(prev => prev.map(section => ({
        ...section,
        fonte
      })));
      
      // Atualiza as seções dinâmicas (para drones)
      setDynamicSections(prev => prev.map(section => ({
        ...section,
        fonte
      })));
      
      // Atualiza as fontes das imagens existentes no store
      images.forEach(image => {
        updateImageFonte(image.containerId, fonte);
      });
    }
  }, [fonte, updateImageFonte, images]);

  // Função para lidar com a mudança no número total de imagens
  const handleTotalImagesChange = (value: number) => {
    // Se estamos diminuindo o número de imagens
    if (value < totalImages) {
      // Verificar se as configurações atuais ainda são válidas
      let totalImagesUsed = 0;
      const validLayouts = [];
      
      // Verificar página por página
      for (let i = 0; i < pageLayouts.length; i++) {
        const layout = pageLayouts[i];
        
        // Verificar se ainda temos imagens suficientes para este layout
        if (totalImagesUsed + layout.imagesPerPage <= value) {
          // Este layout ainda é válido
          validLayouts.push(layout);
          totalImagesUsed += layout.imagesPerPage;
        } else if (totalImagesUsed < value) {
          // Podemos usar algumas imagens neste layout
          const availableImages = value - totalImagesUsed;
          
          // Determinar o layout correto
          let layoutType = 'single';
          if (availableImages === 2) layoutType = 'double';
          else if (availableImages === 3) layoutType = 'triple';
          
          validLayouts.push({
            ...layout,
            imagesPerPage: availableImages,
            layoutType
          });
          
          totalImagesUsed += availableImages;
        }
        // Se não há mais imagens disponíveis, não adicionar esse layout
      }
      
      // Atualizar layouts válidos
      setPageLayouts(validLayouts);
      
      // Atualizar número de páginas
      if (validLayouts.length < totalPages) {
        setTotalPages(validLayouts.length || 1);
        
        // Ajustar a página atual se necessário
        if (currentPage > validLayouts.length) {
          setCurrentPage(validLayouts.length || 1);
        }
      }
    }
    
    // Atualizar o número total de imagens
    setTotalImages(value);
    
    // Criar seções dinâmicas com base no número total de imagens
    generateDynamicSections(value);
    
    // Se estamos aumentando o número de imagens
    if (value > totalImages) {
      // Calcular quantas imagens já estão distribuídas
      const assignedImages = pageLayouts.reduce((sum, layout) => sum + layout.imagesPerPage, 0);
      
      // Se temos imagens não distribuídas, adicionar uma nova página ou redistribuir
      if (value > assignedImages) {
        const imagesToAdd = value - assignedImages;
        
        // Verificar se a última página atual tem espaço
        const lastPageIndex = pageLayouts.length - 1;
        if (lastPageIndex >= 0) {
          const lastPage = pageLayouts[lastPageIndex];
          const availableSpace = 3 - lastPage.imagesPerPage;
          
          if (availableSpace > 0) {
            // Podemos adicionar imagens à última página existente
            const canAdd = Math.min(availableSpace, imagesToAdd);
            
            // Determinar o novo layout
            let newLayoutType = lastPage.layoutType;
            if (lastPage.imagesPerPage + canAdd === 1) newLayoutType = 'single';
            else if (lastPage.imagesPerPage + canAdd === 2) newLayoutType = 'double';
            else if (lastPage.imagesPerPage + canAdd === 3) newLayoutType = 'triple';
            
            const updatedLayouts = [...pageLayouts];
            updatedLayouts[lastPageIndex] = {
              ...lastPage,
              imagesPerPage: lastPage.imagesPerPage + canAdd,
              layoutType: newLayoutType
            };
            
            // Se ainda temos imagens para adicionar, criar novas páginas
            let remainingImages = imagesToAdd - canAdd;
            if (remainingImages > 0) {
              let pageIndex = updatedLayouts.length + 1;
              
              while (remainingImages > 0) {
                // Determinar quantas imagens colocar nesta página
                const imagesForThisPage = Math.min(3, remainingImages);
                
                // Determinar o layout com base no número de imagens
                let layoutType = 'single';
                if (imagesForThisPage === 2) layoutType = 'double';
                else if (imagesForThisPage === 3) layoutType = 'triple';
                
                updatedLayouts.push({
                  pageNumber: pageIndex,
                  layoutType,
                  imagesPerPage: imagesForThisPage
                });
                
                remainingImages -= imagesForThisPage;
                pageIndex++;
              }
            }
            
            setPageLayouts(updatedLayouts);
            
            // Ajustar o número total de páginas se necessário
            if (updatedLayouts.length > totalPages) {
              setTotalPages(updatedLayouts.length);
            }
          } else {
            // Precisamos adicionar uma nova página
            // Determinar quantas imagens colocar nesta página
            const imagesForThisPage = Math.min(3, imagesToAdd);
            
            // Determinar o layout com base no número de imagens
            let layoutType = 'single';
            if (imagesForThisPage === 2) layoutType = 'double';
            else if (imagesForThisPage === 3) layoutType = 'triple';
            
            const updatedLayouts = [...pageLayouts, {
              pageNumber: pageLayouts.length + 1,
              layoutType,
              imagesPerPage: imagesForThisPage
            }];
            
            setPageLayouts(updatedLayouts);
            setTotalPages(updatedLayouts.length);
            
            // Se ainda temos imagens para adicionar, criar mais páginas
            let remainingImages = imagesToAdd - imagesForThisPage;
            if (remainingImages > 0) {
              let pageIndex = updatedLayouts.length + 1;
              
              while (remainingImages > 0) {
                // Determinar quantas imagens colocar nesta página
                const imagesForNextPage = Math.min(3, remainingImages);
                
                // Determinar o layout com base no número de imagens
                let nextLayoutType = 'single';
                if (imagesForNextPage === 2) nextLayoutType = 'double';
                else if (imagesForNextPage === 3) nextLayoutType = 'triple';
                
                updatedLayouts.push({
                  pageNumber: pageIndex,
                  layoutType: nextLayoutType,
                  imagesPerPage: imagesForNextPage
                });
                
                remainingImages -= imagesForNextPage;
                pageIndex++;
              }
              
              setPageLayouts(updatedLayouts);
              setTotalPages(updatedLayouts.length);
            }
          }
        } else {
          // Não temos páginas existentes, criar uma nova página
          const imagesForThisPage = Math.min(3, value);
          
          // Determinar o layout com base no número de imagens
          let layoutType = 'single';
          if (imagesForThisPage === 2) layoutType = 'double';
          else if (imagesForThisPage === 3) layoutType = 'triple';
          
          const newLayouts = [{
            pageNumber: 1,
            layoutType,
            imagesPerPage: imagesForThisPage
          }];
          
          // Se ainda temos imagens para adicionar, criar mais páginas
          let remainingImages = value - imagesForThisPage;
          if (remainingImages > 0) {
            let pageIndex = 2;
            
            while (remainingImages > 0) {
              // Determinar quantas imagens colocar nesta página
              const imagesForNextPage = Math.min(3, remainingImages);
              
              // Determinar o layout com base no número de imagens
              let nextLayoutType = 'single';
              if (imagesForNextPage === 2) nextLayoutType = 'double';
              else if (imagesForNextPage === 3) nextLayoutType = 'triple';
              
              newLayouts.push({
                pageNumber: pageIndex,
                layoutType: nextLayoutType,
                imagesPerPage: imagesForNextPage
              });
              
              remainingImages -= imagesForNextPage;
              pageIndex++;
            }
          }
          
          setPageLayouts(newLayouts);
          setTotalPages(newLayouts.length);
        }
      }
    }
  };
  
  // Função para lidar com a mudança no número total de páginas
  const handleTotalPagesChange = (value: number) => {
    // Calcular o número mínimo de páginas necessárias para mostrar todas as imagens
    const minPagesNeeded = Math.ceil(totalImages / 3);
    
    // Garantir que não podemos ter menos páginas do que o mínimo necessário
    const newTotalPages = Math.max(minPagesNeeded, Math.max(1, value));
    
    // Limitar o valor máximo de páginas com base no total de imagens
    // Cada página precisa ter pelo menos 1 imagem
    const maxPossiblePages = totalImages;
    const clampedTotalPages = Math.min(newTotalPages, maxPossiblePages);
    
    setTotalPages(clampedTotalPages);
    
    // Ajustar layouts de página existentes
    let newPageLayouts = [...pageLayouts];
    
    // Se estamos aumentando o número de páginas
    if (clampedTotalPages > pageLayouts.length) {
      // Adicionar novas páginas vazias
      for (let i = pageLayouts.length; i < clampedTotalPages; i++) {
        newPageLayouts.push({
          pageNumber: i + 1,
          layoutType: 'single',
          imagesPerPage: 0
        });
      }
    } 
    // Se estamos diminuindo o número de páginas
    else if (clampedTotalPages < pageLayouts.length) {
      // Remover páginas extras
      newPageLayouts = newPageLayouts.slice(0, clampedTotalPages);
    }
    
    // Atualizar os layouts
    setPageLayouts(newPageLayouts);
    
    // Ajustar página atual se necessário
    if (currentPage > clampedTotalPages) {
      setCurrentPage(clampedTotalPages);
    }
    
    // Redistribuir imagens entre as páginas disponíveis
    redistributeImages(totalImages, newPageLayouts);
  };
  
  // Redistribuir imagens entre as páginas
  const redistributeImages = (totalImgs: number, layouts: PageLayout[]) => {
    // Calcular quantas imagens já estão distribuídas
    const assignedImages = layouts.reduce((sum, layout) => sum + layout.imagesPerPage, 0);
    
    // Se todas as imagens já estão atribuídas, não faça nada
    if (assignedImages === totalImgs) {
      return;
    }
    
    // Se temos mais imagens atribuídas do que o total, precisamos remover algumas
    if (assignedImages > totalImgs) {
      // Primeiro, tentar diminuir imagens das páginas de trás para a frente
      let imagesToRemove = assignedImages - totalImgs;
      const newLayouts = [...layouts];
      
      // Começar da última página e ir removendo
      for (let i = newLayouts.length - 1; i >= 0 && imagesToRemove > 0; i--) {
        const currentLayout = newLayouts[i];
        const canRemove = Math.min(currentLayout.imagesPerPage, imagesToRemove);
        
        if (canRemove > 0) {
          // Ajustar o layout com base no novo número de imagens
          let newLayoutType = currentLayout.layoutType;
          if (currentLayout.imagesPerPage - canRemove === 1) newLayoutType = 'single';
          else if (currentLayout.imagesPerPage - canRemove === 2) newLayoutType = 'double';
          else if (currentLayout.imagesPerPage - canRemove === 3) newLayoutType = 'triple';
          
          newLayouts[i] = {
            ...currentLayout,
            imagesPerPage: currentLayout.imagesPerPage - canRemove,
            layoutType: newLayoutType
          };
          
          imagesToRemove -= canRemove;
        }
      }
      
      setPageLayouts(newLayouts);
      return;
    }
    
    // Se temos menos imagens atribuídas do que o total, precisamos adicionar algumas
    if (assignedImages < totalImgs) {
      let imagesToAdd = totalImgs - assignedImages;
      const newLayouts = [...layouts];
      
      // Começar da primeira página e ir adicionando
      for (let i = 0; i < newLayouts.length && imagesToAdd > 0; i++) {
        const currentLayout = newLayouts[i];
        
        // Verificar quantas imagens podemos adicionar a esta página (máximo 3)
        const canAdd = Math.min(3 - currentLayout.imagesPerPage, imagesToAdd);
        
        if (canAdd > 0) {
          // Ajustar o layout com base no novo número de imagens
          let newLayoutType = currentLayout.layoutType;
          if (currentLayout.imagesPerPage + canAdd === 1) newLayoutType = 'single';
          else if (currentLayout.imagesPerPage + canAdd === 2) newLayoutType = 'double';
          else if (currentLayout.imagesPerPage + canAdd === 3) newLayoutType = 'triple';
          
          newLayouts[i] = {
            ...currentLayout,
            imagesPerPage: currentLayout.imagesPerPage + canAdd,
            layoutType: newLayoutType
          };
          
          imagesToAdd -= canAdd;
        }
      }
      
      // Se ainda temos imagens para adicionar, criar novas páginas
      if (imagesToAdd > 0) {
        let pageIndex = newLayouts.length + 1;
        
        while (imagesToAdd > 0) {
          // Determinar quantas imagens colocar nesta página
          const imagesForThisPage = Math.min(3, imagesToAdd);
          
          // Determinar o layout com base no número de imagens
          let layoutType = 'single';
          if (imagesForThisPage === 2) layoutType = 'double';
          else if (imagesForThisPage === 3) layoutType = 'triple';
          
          newLayouts.push({
            pageNumber: pageIndex,
            layoutType,
            imagesPerPage: imagesForThisPage
          });
          
          imagesToAdd -= imagesForThisPage;
          pageIndex++;
        }
      }
      
      setPageLayouts(newLayouts);
      
      // Ajustar o número total de páginas se necessário
      if (newLayouts.length > totalPages) {
        setTotalPages(newLayouts.length);
      }
    }
  };
  
  // Função para mudar o layout de uma página específica
  const handlePageLayoutChange = (pageNumber: number, layoutType: string) => {
    // Determinar o número de imagens com base no layout
    let imagesPerPage = 1;
    if (layoutType === 'double') imagesPerPage = 2;
    else if (layoutType === 'triple') imagesPerPage = 3;
    
    // Calcular quantas imagens já estão distribuídas em outras páginas
    const imagesInOtherPages = pageLayouts.reduce((sum, pl) => 
      pl.pageNumber !== pageNumber ? sum + pl.imagesPerPage : sum, 0);
    
    // Garantir que não estamos tentando mostrar mais imagens do que temos
    const availableImages = totalImages - imagesInOtherPages;
    
    // Verificar se temos imagens suficientes
    if (imagesPerPage > availableImages) {
      // Mostrar alerta e ajustar para as imagens disponíveis
      alert(`Você tem apenas ${availableImages} imagem(ns) disponível(is) para esta página.`);
      
      // Se não tiver nenhuma imagem disponível, não permitir a mudança
      if (availableImages <= 0) {
        return;
      }
      
      imagesPerPage = availableImages;
    }
    
    // Atualizar o layout da página atual sem recalcular as outras
    const updatedLayouts = pageLayouts.map(pl => {
      if (pl.pageNumber === pageNumber) {
        return { 
          ...pl, 
          layoutType, 
          imagesPerPage 
        };
      }
      return pl;
    });
    
    // Contabilizar o total de imagens usado
    const totalImagesUsed = updatedLayouts.reduce((sum, layout) => sum + layout.imagesPerPage, 0);
    
    // Verificar se precisamos de mais páginas
    if (totalImagesUsed < totalImages) {
      // Ainda temos imagens para adicionar, precisamos de mais páginas
      const imagesToAdd = totalImages - totalImagesUsed;
      
      // Se estamos na última página, criar uma nova página após esta
      if (pageNumber === updatedLayouts.length) {
        const imagesForNextPage = Math.min(3, imagesToAdd);
        let nextLayoutType = 'single';
        if (imagesForNextPage === 2) nextLayoutType = 'double';
        else if (imagesForNextPage === 3) nextLayoutType = 'triple';
        
        updatedLayouts.push({
          pageNumber: pageNumber + 1,
          layoutType: nextLayoutType,
          imagesPerPage: imagesForNextPage
        });
      }
    } else if (totalImagesUsed === totalImages) {
      // Todas imagens foram distribuídas, remover páginas vazias
      const nonEmptyPages = updatedLayouts.filter(layout => layout.imagesPerPage > 0);
      
      // Caso tenha havido mudança de layout, atualizar
      if (nonEmptyPages.length !== updatedLayouts.length) {
        // Reindexar os números de página
        const reindexedLayouts = nonEmptyPages.map((layout, idx) => ({
          ...layout,
          pageNumber: idx + 1
        }));
        
        setPageLayouts(reindexedLayouts);
        setTotalPages(reindexedLayouts.length);
        
        // Ajustar a página atual se necessário
        if (currentPage > reindexedLayouts.length) {
          setCurrentPage(reindexedLayouts.length);
        }
        return;
      }
    }
    
    setPageLayouts(updatedLayouts);
    
    // Calcular o número correto de páginas com base nos layouts ativos
    const newTotalPages = Math.max(updatedLayouts.length, Math.ceil(totalImages / 3));
    setTotalPages(newTotalPages);
  };

  // Função para adicionar uma nova seção de imagem dinamicamente
  const addImageSection = () => {
    const newSectionId = `droneImage${dynamicSections.length + 1}`;
    const newSection: ImageSection = {
      id: newSectionId,
      label: `Imagem ${dynamicSections.length + 1}`,
      image: null,
      fonte: fonte || ''
    };
    
    setDynamicSections([...dynamicSections, newSection]);
  };

  // Função para gerar seções dinâmicas baseadas no layout selecionado
  const generateDynamicSections = (count: number) => {
    const newSections: ImageSection[] = [];
    
    for (let i = 0; i < count; i++) {
      // Mantém a imagem existente se houver
      const existingSection = dynamicSections[i];
      newSections.push({
        id: existingSection?.id || `droneImage${i + 1}`,
        label: existingSection?.label || `Imagem ${i + 1}`,
        image: existingSection?.image || null,
        fonte: existingSection?.fonte || fonte || ''
      });
    }
    
    setDynamicSections(newSections);
  };

  const handlePaste = (sectionId: string) => async (e: React.ClipboardEvent) => {
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
              
              // Atualizar a seção correta dependendo se é drone ou outro tipo
              if (reportType === 'drones' || reportType === 'drones_diario' || reportType === 'drones_semanal') {
                setDynamicSections(dynamicSections.map(section => 
                  section.id === sectionId 
                    ? { ...section, image: dataUrl }
                    : section
                ));
              } else {
                setSections(sections.map(section => 
                  section.id === sectionId 
                    ? { ...section, image: dataUrl }
                    : section
                ));
              }
              
              // Adicionar imagem ao store global com a fonte atual
              addImage({
                data: dataUrl,
                containerId: sectionId,
                fonte: fonte || ''
              });
              
              // Exibir toast de sucesso
              toast({
                title: "Imagem colada com sucesso",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right"
              });
            };
            reader.readAsDataURL(file);
          } catch (error) {
            console.error("Erro ao colar imagem:", error);
            toast({
              title: "Erro ao colar imagem",
              description: "Não foi possível processar a imagem da área de transferência.",
              status: "error",
              duration: 3000,
              isClosable: true,
              position: "top-right"
            });
          }
        }
      } else if (i === items.length - 1) {
        // Se chegou ao último item e nenhum era imagem
        toast({
          title: "Nenhuma imagem encontrada",
          description: "Não foi encontrada nenhuma imagem na área de transferência.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
      }
    }
  };

  const handleDrop = (sectionId: string) => async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          
          // Atualizar a seção correta dependendo se é drone ou outro tipo
          if (reportType === 'drones' || reportType === 'drones_diario' || reportType === 'drones_semanal') {
            setDynamicSections(dynamicSections.map(section => 
              section.id === sectionId 
                ? { ...section, image: dataUrl }
                : section
            ));
          } else {
            setSections(sections.map(section => 
              section.id === sectionId 
                ? { ...section, image: dataUrl }
                : section
            ));
          }
          
          // Adicionar imagem ao store global com a fonte atual
          addImage({
            data: dataUrl,
            containerId: sectionId,
            fonte: fonte || ''
          });
          
          // Exibir toast de sucesso
          toast({
            title: "Imagem adicionada com sucesso",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right"
          });
        };
        reader.readAsDataURL(imageFile);
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        toast({
          title: "Erro ao adicionar imagem",
          description: "Não foi possível processar a imagem arrastada.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
      }
    } else {
      toast({
        title: "Arquivo não suportado",
        description: "Arraste apenas arquivos de imagem.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
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
    // Remover de seções dinâmicas (drones) ou seções fixas
    if (reportType === 'drones' || reportType === 'drones_diario' || reportType === 'drones_semanal') {
      setDynamicSections(dynamicSections.map(section =>
        section.id === sectionId
          ? { ...section, image: null }
          : section
      ));
    } else {
      setSections(sections.map(section =>
        section.id === sectionId
          ? { ...section, image: null }
          : section
      ));
    }
    
    removeImage(sectionId);
  };

  const handleFonteChange = (sectionId: string, newFonte: string) => {
    // Atualizar fonte em seções dinâmicas (drones) ou seções fixas
    if (reportType === 'drones') {
      setDynamicSections(dynamicSections.map(section =>
        section.id === sectionId
          ? { ...section, fonte: newFonte }
          : section
      ));
    } else {
      setSections(sections.map(section =>
        section.id === sectionId
          ? { ...section, fonte: newFonte }
          : section
      ));
    }
    
    // Atualizar a fonte no store global
    updateImageFonte(sectionId, newFonte);
  };

  // Renderiza um componente de imagem para qualquer tipo de relatório
  const renderImageSection = (section: ImageSection) => (
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
  );

  // Renderiza o seletor de layout para relatórios de drone
  const renderDroneLayoutSelector = () => (
    <Box p={4} bg="white" borderRadius="md" boxShadow="sm" maxW="300px">
      <VStack align="start" spacing={4}>
        <Text fontSize="md" fontWeight="bold" color="black">
          Configuração do Layout
        </Text>
      
        <Box w="100%">
          <Text fontSize="sm" color="black" mb={2}>
            Número total de imagens:
          </Text>
          <NumberInput
            min={1}
            max={15}
            value={totalImages}
            onChange={(valueString, valueNumber) => handleTotalImagesChange(valueNumber)}
            size="sm"
          >
            <NumberInputField borderColor="black" color="black" />
            <NumberInputStepper>
              <NumberIncrementStepper 
                borderColor="black" 
                color="black" 
                bg="white"
                _active={{ bg: 'gray.200' }}
              />
              <NumberDecrementStepper 
                borderColor="black" 
                color="black" 
                bg="white"
                _active={{ bg: 'gray.200' }}
              />
            </NumberInputStepper>
          </NumberInput>
        </Box>
        
        <Box w="100%">
          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Text fontSize="sm" color="black">
              Página {currentPage} de {totalPages}
            </Text>
            <HStack>
              <Button 
                size="xs" 
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} 
                isDisabled={currentPage === 1}
                colorScheme="gray"
                borderColor="black"
                borderWidth="1px"
                color="black"
                bg="white"
                _hover={{ bg: 'gray.100' }}
              >
                Anterior
              </Button>
              <Button 
                size="xs" 
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} 
                isDisabled={currentPage === totalPages}
                colorScheme="gray"
                borderColor="black"
                borderWidth="1px"
                color="black"
                bg="white"
                _hover={{ bg: 'gray.100' }}
              >
                Próxima
              </Button>
            </HStack>
          </Flex>
          
          <Text fontSize="sm" color="black" mb={2}>
            Layout da página atual:
          </Text>
          <VStack spacing={2} align="stretch">
            {droneLayouts.map(layout => (
              <Button 
                key={layout.id}
                size="sm"
                variant={pageLayouts.find(pl => pl.pageNumber === currentPage)?.layoutType === layout.id ? "solid" : "outline"}
                onClick={() => handlePageLayoutChange(currentPage, layout.id)}
                leftIcon={<Icon as={FiLayout} />}
                justifyContent="flex-start"
                colorScheme={pageLayouts.find(pl => pl.pageNumber === currentPage)?.layoutType === layout.id ? "black" : "gray"}
                bg={pageLayouts.find(pl => pl.pageNumber === currentPage)?.layoutType === layout.id ? "black" : "white"}
                color={pageLayouts.find(pl => pl.pageNumber === currentPage)?.layoutType === layout.id ? "white" : "black"}
                _hover={{
                  bg: pageLayouts.find(pl => pl.pageNumber === currentPage)?.layoutType === layout.id ? "gray.800" : "gray.100"
                }}
                borderColor="black"
              >
                {layout.name}
              </Button>
            ))}
          </VStack>
        </Box>
        
        <Text fontSize="sm" color="black">
          Imagens nesta página: {
            pageLayouts.find(pl => pl.pageNumber === currentPage)?.imagesPerPage || 1
          }
        </Text>
        
        {currentPage < totalPages ? (
          <Text fontSize="xs" color="gray.500">
            Configure cada página usando os botões de navegação
          </Text>
        ) : totalImages > pageLayouts.reduce((sum, layout) => sum + layout.imagesPerPage, 0) ? (
          <Text fontSize="xs" color="gray.500">
            Há imagens não distribuídas. Configure mais páginas para mostrar todas as imagens.
          </Text>
        ) : null}
      </VStack>
    </Box>
  );

  // Calcular quais imagens mostrar na página atual
  const getCurrentPageImages = (): ImageSection[] => {
    let startIndex = 0;
    
    // Calcular o índice inicial para a página atual
    for (let i = 0; i < currentPage - 1; i++) {
      startIndex += pageLayouts[i]?.imagesPerPage || 0;
    }
    
    const currentPageLayout = pageLayouts.find(pl => pl.pageNumber === currentPage);
    const endIndex = startIndex + (currentPageLayout?.imagesPerPage || 0);
    
    return dynamicSections.slice(startIndex, endIndex);
  };

  if (!isConfigLoaded) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="black">
          Carregando configurações...
        </Text>
      </Box>
    );
  }

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

  // Renderiza layout específico para relatório de drones
  if (reportType === 'drones' || reportType === 'drones_diario' || reportType === 'drones_semanal') {
    const currentPageImages = getCurrentPageImages();
    const currentPageLayout = pageLayouts.find(pl => pl.pageNumber === currentPage);
    
    // Função para gerar ID para a imagem com base na posição e página atual
    const getImageId = (position: number): string => {
      // Calcular o índice inicial para a página atual
      let startIndex = 0;
      for (let i = 0; i < currentPage - 1; i++) {
        startIndex += pageLayouts[i]?.imagesPerPage || 0;
      }
      return `droneImage${startIndex + position}`;
    };
    
    return (
      <Flex direction={{ base: "column", md: "row" }} w="100%" h="100%">
        {/* Área de seleção de layout - 20% da largura */}
        <Box w={{ base: "100%", md: "20%" }} h={{ base: "auto", md: "100%" }} pr={4}>
          {renderDroneLayoutSelector()}
        </Box>
        
        {/* Área de visualização de imagens - 80% da largura */}
        <Box w={{ base: "100%", md: "80%" }} h="100%" p={4}>
          <Box 
            p={4} 
            bg="white" 
            borderRadius="md" 
            boxShadow="sm"
            position="relative"
          >
            <Text 
              fontSize="md" 
              fontWeight="bold" 
              color="black" 
              mb={4}
            >
              {currentPage === 1 ? "Página 1 - Cabeçalho com Tabela e Gráfico" : `Página ${currentPage} - Apenas Imagens`}
            </Text>
            
            {currentPage === 1 && (
              <Box 
                mb={4} 
                p={2} 
                bg="gray.100" 
                borderRadius="md"
                height="100px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="gray.500">
                  Cabeçalho, Tabela e Gráfico (incluídos automaticamente)
                </Text>
              </Box>
            )}
            
            {/* Renderiza o layout baseado no tipo selecionado */}
            {currentPageLayout?.layoutType === 'single' && (
              <Box h="250px" position="relative">
                {currentPageImages[0] ? (
                  renderImageSection(currentPageImages[0])
                ) : (
                  <Box
                    h="100%"
                    border="1px"
                    borderStyle="dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    _hover={{ bg: "gray.50" }}
                    tabIndex={0}
                    role="button"
                    onPaste={handlePaste(getImageId(1))}
                    onDrop={handleDrop(getImageId(1))}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onKeyDown={(e) => {
                      if (e.key === 'v' && e.ctrlKey) {
                        handlePaste(getImageId(1))(e as unknown as React.ClipboardEvent);
                      }
                    }}
                    cursor="pointer"
                  >
                    <VStack spacing={2}>
                      <Icon as={AiOutlinePlus} boxSize={6} color="gray.500" />
                      <Text fontSize="sm" color="gray.500">Arraste uma imagem ou use Ctrl+V</Text>
                    </VStack>
                    <Text position="absolute" bottom={2} right={2} fontSize="xs" color="gray.500">
                      Ctrl+V ou Arraste
                    </Text>
                  </Box>
                )}
              </Box>
            )}
            
            {currentPageLayout?.layoutType === 'double' && (
              <Grid templateColumns="repeat(2, 1fr)" gap={4} h="250px">
                {[0, 1].map((index) => (
                  <GridItem key={`img-${index}`} h="100%">
                    {currentPageImages[index] ? (
                      renderImageSection(currentPageImages[index])
                    ) : (
                      <Box
                        h="100%"
                        border="1px"
                        borderStyle="dashed"
                        borderColor="gray.300"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        _hover={{ bg: "gray.50" }}
                        tabIndex={0}
                        role="button"
                        onPaste={handlePaste(getImageId(index + 1))}
                        onDrop={handleDrop(getImageId(index + 1))}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onKeyDown={(e) => {
                          if (e.key === 'v' && e.ctrlKey) {
                            handlePaste(getImageId(index + 1))(e as unknown as React.ClipboardEvent);
                          }
                        }}
                        cursor="pointer"
                      >
                        <VStack spacing={2}>
                          <Icon as={AiOutlinePlus} boxSize={6} color="gray.500" />
                          <Text fontSize="sm" color="gray.500">Arraste uma imagem ou use Ctrl+V</Text>
                        </VStack>
                        <Text position="absolute" bottom={2} right={2} fontSize="xs" color="gray.500">
                          Ctrl+V ou Arraste
                        </Text>
                      </Box>
                    )}
                  </GridItem>
                ))}
              </Grid>
            )}
            
            {currentPageLayout?.layoutType === 'triple' && (
              <Box h="350px">
                <Grid templateRows="1fr 1fr" gap={4} h="100%">
                  <Grid templateColumns="repeat(2, 1fr)" gap={4} h="100%">
                    {[0, 1].map((index) => (
                      <GridItem key={`img-${index}`} h="100%">
                        {currentPageImages[index] ? (
                          renderImageSection(currentPageImages[index])
                        ) : (
                          <Box
                            h="100%"
                            border="1px"
                            borderStyle="dashed"
                            borderColor="gray.300"
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            _hover={{ bg: "gray.50" }}
                            tabIndex={0}
                            role="button"
                            onPaste={handlePaste(getImageId(index + 1))}
                            onDrop={handleDrop(getImageId(index + 1))}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onKeyDown={(e) => {
                              if (e.key === 'v' && e.ctrlKey) {
                                handlePaste(getImageId(index + 1))(e as unknown as React.ClipboardEvent);
                              }
                            }}
                            cursor="pointer"
                          >
                            <VStack spacing={2}>
                              <Icon as={AiOutlinePlus} boxSize={6} color="gray.500" />
                              <Text fontSize="sm" color="gray.500">Arraste uma imagem ou use Ctrl+V</Text>
                            </VStack>
                            <Text position="absolute" bottom={2} right={2} fontSize="xs" color="gray.500">
                              Ctrl+V ou Arraste
                            </Text>
                          </Box>
                        )}
                      </GridItem>
                    ))}
                  </Grid>
                  <GridItem h="100%">
                    {currentPageImages[2] ? (
                      renderImageSection(currentPageImages[2])
                    ) : (
                      <Box
                        h="100%"
                        border="1px"
                        borderStyle="dashed"
                        borderColor="gray.300"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        _hover={{ bg: "gray.50" }}
                        tabIndex={0}
                        role="button"
                        onPaste={handlePaste(getImageId(3))}
                        onDrop={handleDrop(getImageId(3))}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onKeyDown={(e) => {
                          if (e.key === 'v' && e.ctrlKey) {
                            handlePaste(getImageId(3))(e as unknown as React.ClipboardEvent);
                          }
                        }}
                        cursor="pointer"
                      >
                        <VStack spacing={2}>
                          <Icon as={AiOutlinePlus} boxSize={6} color="gray.500" />
                          <Text fontSize="sm" color="gray.500">Arraste uma imagem ou use Ctrl+V</Text>
                        </VStack>
                        <Text position="absolute" bottom={2} right={2} fontSize="xs" color="gray.500">
                          Ctrl+V ou Arraste
                        </Text>
                      </Box>
                    )}
                  </GridItem>
                </Grid>
              </Box>
            )}
          </Box>
        </Box>
      </Flex>
    );
  }

  // Para outros tipos de relatório, mantém o comportamento original
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
        {sections.map(section => renderImageSection(section))}
      </Grid>
    </VStack>
  );
} 