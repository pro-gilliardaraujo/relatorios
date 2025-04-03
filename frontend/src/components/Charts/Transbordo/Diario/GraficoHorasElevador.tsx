'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Props {
  data: Array<{
    id: string;
    nome: string;
    horas: number;
  }>;
  meta?: number;
}

export function GraficoHorasElevador({ data, meta = 7 }: Props) {
  // Ordenar dados por horas (decrescente)
  const dadosOrdenados = [...data].sort((a, b) => b.horas - a.horas);

  // Preparar dados para o gráfico
  const nomes = dadosOrdenados.map(item => item.nome);
  const horas = dadosOrdenados.map(item => item.horas);

  // Configurar cores baseadas na meta
  const cores = horas.map(valor => valor >= meta ? '#2E7D32' : '#C62828');

  // Configurar o layout do gráfico
  const layout = {
    showlegend: false,
    margin: {
      l: 150,
      r: 20,
      t: 35,
      b: 50
    },
    height: 250,
    yaxis: {
      title: 'Operador',
      gridcolor: '#E0E0E0',
      zerolinecolor: '#E0E0E0'
    },
    xaxis: {
      title: 'Horas',
      tickformat: '.1f',
      gridcolor: '#E0E0E0',
      zerolinecolor: '#E0E0E0'
    },
    shapes: [
      {
        type: 'line',
        x0: meta,
        x1: meta,
        y0: -0.5,
        y1: nomes.length - 0.5,
        line: {
          color: '#FFA000',
          width: 2,
          dash: 'dash'
        }
      }
    ],
    annotations: [
      {
        x: meta,
        y: nomes.length - 0.5,
        xref: 'x',
        yref: 'y',
        text: `Meta: ${meta}h`,
        showarrow: false,
        font: {
          color: '#FFA000'
        },
        xanchor: 'left',
        yanchor: 'bottom',
        xshift: 5
      }
    ],
    plot_bgcolor: 'white',
    paper_bgcolor: 'white'
  };

  // Configurar dados do gráfico
  const plotData = [
    {
      type: 'bar',
      orientation: 'h',
      y: nomes,
      x: horas,
      marker: {
        color: cores
      },
      text: horas.map(valor => `${valor.toFixed(1)}h`),
      textposition: 'auto',
      hovertemplate: '<b>%{y}</b><br>Horas: %{x:.1f}h<extra></extra>'
    }
  ];

  return (
    <Box h="100%" w="100%">
      <Plot
        data={plotData as any}
        layout={layout as any}
        config={{
          displayModeBar: false,
          responsive: true
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
} 