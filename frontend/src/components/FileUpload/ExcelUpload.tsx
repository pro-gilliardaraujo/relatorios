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
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

interface PreviewData {
  headers: string[];
  rows: string[][];
}

interface ExcelUploadProps {
  onPreviewData?: (data: PreviewData | null) => void;
  isEnabled?: boolean;
}

export default function ExcelUpload({ onPreviewData, isEnabled = false }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!isEnabled) {
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
      
      // Pegar a primeira planilha
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Converter para array de arrays
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length > 0) {
        const headers = data[0] as string[];
        const rows = data.slice(1) as string[][];
        
        // Limitar a 5 linhas para a prévia
        const previewRows = rows.slice(0, 5);
        
        onPreviewData?.({
          headers,
          rows: previewRows
        });

        toast({
          title: "Arquivo carregado",
          description: `${rows.length} linhas encontradas (mostrando primeiras 5)`,
          status: "success",
          duration: 3000,
        });
      } else {
        throw new Error("Arquivo vazio");
      }
    } catch (error) {
      toast({
        title: "Erro ao ler arquivo",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        status: "error",
        duration: 3000,
      });
      setFile(null);
      onPreviewData?.(null);
    }
  }, [onPreviewData, toast, isEnabled]);

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
    <Box position="relative">
      <input
        type="file"
        accept=".xlsx,.csv"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        style={{ display: 'none' }}
        id="excel-upload"
      />
      <Button
        as="label"
        htmlFor="excel-upload"
        colorScheme="blue"
        variant="outline"
        size="md"
        cursor={isEnabled ? "pointer" : "not-allowed"}
        opacity={isEnabled ? 1 : 0.5}
        color="black"
        _hover={{ bg: 'gray.50' }}
        w={{ base: "100%", sm: "auto" }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <FiUpload />
        <Text ml={2}>Upload Excel</Text>
      </Button>
    </Box>
  );
}

// Componente separado para a prévia da tabela
export function ExcelPreview({ preview }: { preview: PreviewData | null }) {
  if (!preview) {
    return (
      <Box textAlign="center" py={4}>
        <Text color="gray.600">
          Selecione um arquivo Excel ou CSV para visualizar os dados
        </Text>
      </Box>
    );
  }

  // Limitar a 5 linhas
  const previewRows = preview.rows.slice(0, 5);

  return (
    <Box 
      w="100%" 
      h="100%"
      maxH="180px"
      position="relative"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        overflowX="auto"
        overflowY="auto"
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
        }}
      >
        <Box minWidth="max-content">
          <Table variant="simple" size="sm">
            <Thead position="sticky" top={0} zIndex={1} bg="white">
              <Tr>
                {preview.headers.map((header, index) => (
                  <Th 
                    key={index}
                    py={2}
                    px={3}
                    fontSize="xs"
                    color="gray.900"
                    whiteSpace="nowrap"
                    borderBottom="2px"
                    borderColor="gray.200"
                    minW="150px"
                  >
                    {header}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {previewRows.map((row, rowIndex) => (
                <Tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <Td 
                      key={cellIndex}
                      py={1}
                      px={3}
                      fontSize="xs"
                      color="gray.800"
                      whiteSpace="nowrap"
                      minW="150px"
                    >
                      {cell}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
} 