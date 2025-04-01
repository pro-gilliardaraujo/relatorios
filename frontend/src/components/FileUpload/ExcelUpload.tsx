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

interface PreviewData {
  headers: string[];
  rows: string[][];
  processedData: { [key: string]: any[] };
  previewRows: number;
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
      
      // Log para debug - mostrar todas as planilhas encontradas
      console.log('\n=== Planilhas no arquivo ===');
      console.log(workbook.SheetNames);

      // Lista de planilhas necessárias para relatório de Colheita
      const requiredSheets = [
        '1_Disponibilidade Mecânica',
        '2_Eficiência Energética',
        '3_Hora Elevador',
        '4_Motor Ocioso',
        '5_Uso GPS'
      ];
      
      const foundSheets = workbook.SheetNames.filter(sheet => requiredSheets.includes(sheet));
      const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));

      // Log simplificado
      console.log('\n=== Análise do arquivo Excel ===');
      
      if (foundSheets.length > 0) {
        console.log('\n✓ Planilhas encontradas:', foundSheets.join(', '));
      }

      if (missingSheets.length > 0) {
        console.log('\n⚠ Planilhas não encontradas:', missingSheets.join(', '));
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

      // Criar preview da primeira planilha (Disponibilidade Mecânica)
      const previewSheet = processedData['1_Disponibilidade Mecânica'] || processedData[foundSheets[0]];
      if (previewSheet?.length > 0) {
        const headers = Object.keys(previewSheet[0] as object);
        // Ajusta o número de linhas baseado na quantidade de planilhas
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

  const { processedData, previewRows } = preview;
  const sheets = [
    '1_Disponibilidade Mecânica',
    '2_Eficiência Energética',
    '3_Hora Elevador',
    '4_Motor Ocioso',
    '5_Uso GPS'
  ];

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
      <Tabs size="sm" variant="enclosed" h="100%" colorScheme="blue">
        <TabList>
          {sheets.map(sheet => (
            processedData[sheet]?.length > 0 && (
              <Tab 
                key={sheet}
                fontSize="xs"
                py={1}
                px={2}
              >
                {sheet.replace(/^\d+_/, '')}
              </Tab>
            )
          ))}
        </TabList>
        <TabPanels h="calc(100% - 32px)" overflowY="auto">
          {sheets.map(sheet => (
            processedData[sheet]?.length > 0 && (
              <TabPanel key={sheet} p={0}>
                <Box 
                  overflowX="auto" 
                  overflowY="auto" 
                  h="100%"
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
                  <Table size="sm" variant="simple">
                    <Thead position="sticky" top={0} bg="white" zIndex={1}>
                      <Tr>
                        {processedData[sheet] && processedData[sheet].length > 0 
                          ? Object.keys(processedData[sheet][0]).map((key, i) => (
                              <Th key={i} fontSize="xs" p={1}>{key}</Th>
                            ))
                          : null
                        }
                      </Tr>
                    </Thead>
                    <Tbody>
                      {processedData[sheet]?.slice(0, 5).map((row: any, rowIdx: number) => (
                        <Tr key={rowIdx}>
                          {Object.values(row).map((cell: any, cellIdx: number) => (
                            <Td key={cellIdx} fontSize="xs" p={1}>{formatValue(cell)}</Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
            )
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
} 