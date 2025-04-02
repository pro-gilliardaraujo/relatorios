import React from 'react';
import { GraficoIndicadorColheita } from './GraficoIndicadorColheita';

interface DataPoint {
  frota: string;
  diesel: number;
}

interface GraficoDieselProps {
  data: DataPoint[];
  meta: number;
  fonte: string;
  onFonteChange: (newFonte: string) => void;
}

export const GraficoDiesel: React.FC<GraficoDieselProps> = ({ data, meta, fonte, onFonteChange }) => {
  const formattedData = data.map(item => ({
    frota: item.frota,
    valor: item.diesel
  }));

  return (
    <GraficoIndicadorColheita
      data={formattedData}
      meta={meta}
      title="Consumo de Diesel (L/h)"
      color="#1565C0"
      unit=" L/h"
      fonte={fonte}
      onFonteChange={onFonteChange}
    />
  );
}; 