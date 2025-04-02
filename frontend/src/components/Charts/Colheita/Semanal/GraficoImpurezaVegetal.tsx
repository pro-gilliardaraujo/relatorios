import React from 'react';
import { GraficoIndicadorColheita } from './GraficoIndicadorColheita';

interface DataPoint {
  frota: string;
  impureza: number;
}

interface GraficoImpurezaVegetalProps {
  data: DataPoint[];
  meta: number;
  fonte: string;
  onFonteChange: (newFonte: string) => void;
}

export const GraficoImpurezaVegetal: React.FC<GraficoImpurezaVegetalProps> = ({ data, meta, fonte, onFonteChange }) => {
  const formattedData = data.map(item => ({
    frota: item.frota,
    valor: item.impureza
  }));

  return (
    <GraficoIndicadorColheita
      data={formattedData}
      meta={meta}
      title="Impureza Vegetal (%)"
      color="#6A1B9A"
      unit="%"
      fonte={fonte}
      onFonteChange={onFonteChange}
    />
  );
}; 