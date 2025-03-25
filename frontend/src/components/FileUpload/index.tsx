'use client'

import { Box, Text, useToast } from '@chakra-ui/react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ProcessedData } from '@/types'
import { processFile } from '@/services/api'

interface FileUploadProps {
  onDataProcessed: (data: ProcessedData) => void
}

export function FileUpload({ onDataProcessed }: FileUploadProps) {
  const toast = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0]
      if (!file) return

      const data = await processFile(file)
      onDataProcessed(data)
      
      toast({
        title: 'Arquivo processado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao processar arquivo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [onDataProcessed, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

  return (
    <Box
      {...getRootProps()}
      p={6}
      border="2px"
      borderStyle="dashed"
      borderColor={isDragActive ? 'blue.500' : 'gray.200'}
      borderRadius="md"
      bg={isDragActive ? 'blue.50' : 'gray.50'}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        borderColor: 'blue.500',
        bg: 'blue.50'
      }}
    >
      <input {...getInputProps()} />
      <Text textAlign="center" color="gray.600">
        {isDragActive
          ? 'Solte o arquivo aqui...'
          : 'Arraste e solte um arquivo Excel/CSV aqui, ou clique para selecionar'}
      </Text>
    </Box>
  )
} 