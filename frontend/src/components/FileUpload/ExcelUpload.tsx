'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { configManager } from '@/utils/config';

interface PreviewData {
  headers: string[];
  rows: any[][];
  processedData: { [key: string]: any[] };
  previewRows: number;
}

interface ExcelUploadProps {
  onPreviewData?: (data: PreviewData | null) => void;
  isEnabled?: boolean;
  selectedReportType?: string;
}

export default function ExcelUpload({ onPreviewData, isEnabled = false, selectedReportType }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!isEnabled || !selectedReportType) {
      toast({
        title: "Selecione os campos obrigatórios",
        description: "Preencha o tipo de relatório, data e frente antes de fazer o upload",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!file.name.match(/\.(xlsx|csv)$/)) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx) ou CSV",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setFile(file);
      
      // Ler o arquivo como ArrayBuffer
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      // Log para debug - mostrar todas as planilhas encontradas
      console.log('\n=== Planilhas no arquivo ===');
      console.log(workbook.SheetNames);

      // Obter a lista de planilhas necessárias do arquivo de configuração
      const tipoRelatorio = configManager.getTipoRelatorio(selectedReportType);
      if (!tipoRelatorio?.planilhas_excel) {
        throw new Error("Tipo de relatório não encontrado ou sem planilhas configuradas");
      }

      const requiredSheets = tipoRelatorio.planilhas_excel;
      console.log(`\n📋 Planilhas esperadas para ${selectedReportType} (${tipoRelatorio.nome}):`, requiredSheets);
      
      const foundSheets = workbook.SheetNames.filter(sheet => requiredSheets.includes(sheet));
      const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));

      // Log simplificado
      console.log('\n=== Análise do arquivo Excel ===');
      
      if (foundSheets.length > 0) {
        console.log('\n✓ Planilhas encontradas:', foundSheets.join(', '));
      }

      if (missingSheets.length > 0) {
        console.log('\n⚠ Planilhas não encontradas:', missingSheets.join(', '));
        // Mostrar aviso sobre planilhas ausentes
        toast({
          title: "Atenção",
          description: `Planilhas ausentes: ${missingSheets.join(', ')}`,
          status: "warning",
          duration: 5000,
        });
      }

      // Processar apenas as planilhas de interesse
      const processedData: { [key: string]: any[] } = {};
      let totalRecords = 0;

      foundSheets.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        processedData[sheetName] = jsonData;
        totalRecords += jsonData.length;

        // Log das colunas encontradas
        if (jsonData.length > 0) {
          console.log(`\n${sheetName}:`);
          console.log('Colunas:', Object.keys(jsonData[0] as object).join(', '));
        }
      });

      if (foundSheets.length === 0) {
        throw new Error("Nenhuma planilha de interesse encontrada");
      }

      // Criar preview da primeira planilha
      const firstSheet = foundSheets[0];
      const previewSheet = processedData[firstSheet];
      if (previewSheet?.length > 0) {
        const headers = Object.keys(previewSheet[0] as object);
        const previewRows = foundSheets.length > 1 ? 4 : 5;
        const rows = previewSheet.slice(0, previewRows).map(row => 
          headers.map(header => (row as any)[header])
        );

        onPreviewData?.({
          headers,
          rows,
          processedData,
          previewRows
        });

        toast({
          title: "Arquivo processado com sucesso",
          description: `${totalRecords} registros encontrados em ${foundSheets.length} planilhas`,
          status: "success",
          duration: 3000,
        });
      } else {
        throw new Error("Dados inválidos nas planilhas");
      }
    } catch (error) {
      console.error('Erro ao processar arquivo Excel:', error);
      toast({
        title: "Erro ao ler arquivo",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        status: "error",
        duration: 3000,
      });
      setFile(null);
      onPreviewData?.(null);
    }
  }, [onPreviewData, toast, isEnabled, selectedReportType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <Box
      border="2px dashed"
      borderColor={isDragging ? "blue.500" : "gray.300"}
      borderRadius="md"
      p={4}
      textAlign="center"
      bg={isDragging ? "blue.50" : "white"}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ borderColor: "blue.500", bg: "blue.50" }}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.csv';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      <Text color="gray.500">
        {file ? file.name : "Arraste um arquivo Excel ou clique para selecionar"}
      </Text>
    </Box>
  );
}

// Componente separado para a prévia da tabela
export function ExcelPreview({ preview }: { preview: PreviewData | null }) {
  if (!preview) {
    return (
      <Box textAlign="center" py={4}>
        <Text color="black">
          Selecione um arquivo Excel ou CSV para visualizar os dados
        </Text>
      </Box>
    );
  }

  const { processedData, previewRows } = preview;

  // Função para formatar valores numéricos
  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return String(value || '');
  };

  return (
    <Box 
      w="100%" 
      h="100%"
      maxH="180px"
      position="relative"
    >
      <Box 
        overflowY="auto" 
        h="100%"
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        <Table size="sm" variant="simple">
          <Thead position="sticky" top={0} bg="white" zIndex={1}>
            <Tr>
              {preview.headers.map((header, index) => (
                <Th key={index} color="black">{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {preview.rows.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <Td key={cellIndex} color="black">
                    {formatValue(cell)}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
} 