import React from 'react';
import { Text } from '@chakra-ui/react';

interface DateRangeDisplayProps {
  startDate: Date;
  endDate: Date;
}

export const DateRangeDisplay: React.FC<DateRangeDisplayProps> = ({ startDate, endDate }) => {
  const formatDate = (date: Date) => {
    // Criar uma nova data para aplicar a correção de fuso horário
    const adjustedDate = new Date(date);
    
    // Adicionamos um dia para compensar a diferença de fuso horário
    // ou quando a data é serializada/deserializada entre JSON e Date
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    
    return adjustedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Text fontSize="sm" textAlign="center" color="black">
      {formatDate(startDate)} - {formatDate(endDate)}
    </Text>
  );
}; 