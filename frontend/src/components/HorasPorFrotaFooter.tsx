import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';

interface HorasPorFrota {
  frota: string;
  horasRegistradas: number;
  diferencaPara24h: number;
}

interface HorasPorFrotaFooterProps {
  dados: HorasPorFrota[];
}

/**
 * Componente para exibir o rodapé com informações da planilha "Horas por Frota"
 * na última linha da última página de cada relatório
 */
export default function HorasPorFrotaFooter({ dados }: HorasPorFrotaFooterProps) {
  // Calcular a média de horas registradas
  const mediaHorasRegistradas = dados.length > 0
    ? dados.reduce((sum, item) => sum + item.horasRegistradas, 0) / dados.length
    : 0;
  
  // Calcular a precisão média como porcentagem
  const precisaoMedia = dados.length > 0
    ? (mediaHorasRegistradas / 24) * 100
    : 0;

  // Função para formatar horas decimais para o formato XhYYmin (ex: 20h38min)
  const formatarHorasEmTexto = (horasDecimais: number): string => {
    const horas = Math.floor(horasDecimais);
    const minutos = Math.round((horasDecimais - horas) * 60);
    
    // Garantir que os minutos tenham dois dígitos (com zero à esquerda se necessário)
    const minutosFormatados = minutos < 10 ? `0${minutos}` : `${minutos}`;
    
    return `${horas}h${minutosFormatados}min`;
  };

  // Formatar os valores para exibição
  const mediaHorasFormatada = formatarHorasEmTexto(mediaHorasRegistradas);
  const precisaoFormatada = precisaoMedia.toFixed(2);

  return (
    <Box 
      className="horas-por-frota-footer"
      position="absolute"
      bottom="-13mm"
      left={0}
      right={0}
      width="100%"
      py={1.5}
      px="10mm"
    >
      <Flex justify="center">
        <Text fontSize="xs" color="black" textAlign="center">
          Total de horas de informação registradas: {mediaHorasFormatada} ; 
          Precisão das informações: {precisaoFormatada}% ; 
          Fonte SGPA Solinftec
        </Text>
      </Flex>
    </Box>
  );
} 