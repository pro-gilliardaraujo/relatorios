import React from 'react';
import { GraficoIndicadorColheita } from './GraficoIndicadorColheita';

interface DataPoint {
  frota: string;
  tdh: number;
}

interface GraficoTDHProps {
  data: DataPoint[];
  meta: number;
  fonte: string;
  onFonteChange: (newFonte: string) => void;
}

export const GraficoTDH: React.FC<GraficoTDHProps> = ({ data, meta, fonte, onFonteChange }) => {
  const formattedData = data.map(item => ({
    frota: item.frota,
    valor: item.tdh
  }));

  return (
    <GraficoIndicadorColheita
      data={formattedData}
      meta={meta}
      title="TDH (Toneladas/Hora)"
      color="#2E7D32"
      unit=" t/h"
      fonte={fonte}
      onFonteChange={onFonteChange}
    />
  );
}; 