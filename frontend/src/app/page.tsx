'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { GraficoTopOfensores } from '@/components/Charts/GraficoTopOfensores';

const sampleData = [
  {
    name: 'AGUARD LIBERACAO ATIVIDADE',
    hours: 17,
    timeString: '17:00:00',
    percentage: 31.6
  },
  {
    name: 'AGUARDANDO MUDA',
    hours: 15.22,
    timeString: '15:13:20',
    percentage: 28.3
  },
  {
    name: 'SEM OPERADOR',
    hours: 9.36,
    timeString: '9:21:25',
    percentage: 17.4
  },
  {
    name: 'TROCA DE TURNO',
    hours: 7.81,
    timeString: '7:48:26',
    percentage: 14.5
  },
  {
    name: 'CALIBRACAO DE PLANTADEIRA',
    hours: 4.46,
    timeString: '4:27:33',
    percentage: 8.3
  }
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/relatorios');
  }, [router]);

  return (
    <Center h="100vh">
      <Box>
        <Spinner size="xl" />
      </Box>
    </Center>
  );
}

export function GraficoTopOfensoresComponent() {
  return (
    <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Top 5 Ofensores</h1>
      <GraficoTopOfensores data={sampleData} />
    </main>
  );
} 