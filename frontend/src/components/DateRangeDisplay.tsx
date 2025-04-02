import React from 'react';
import { Text } from '@chakra-ui/react';

interface DateRangeDisplayProps {
  startDate: Date;
  endDate: Date;
}

export const DateRangeDisplay: React.FC<DateRangeDisplayProps> = ({ startDate, endDate }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
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