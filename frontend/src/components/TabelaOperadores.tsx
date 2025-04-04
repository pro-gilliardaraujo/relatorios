import { Box } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface OperadorData {
  id: string;
  nome: string;
  eficiencia: number;
}

interface TabelaOperadoresProps {
  dados: {
    eficiencia_energetica: OperadorData[];
    motor_ocioso: Array<{ id: string; nome: string; percentual: number }>;
    falta_apontamento: Array<{ id: string; nome: string; percentual: number }>;
    uso_gps: Array<{ id: string; nome: string; porcentagem: number }>;
  };
  tipo?: string;
}

// Função para formatar percentagens com 2 casas sem arredondamento
const formatPercentage = (val: number): string => {
  // Log para debug
  console.log(`📊 Formatando percentagem na tabela: ${val}`);
  
  // Preservar o valor original sem causar arredondamento
  const valueStr = String(val);
  const decimalIndex = valueStr.indexOf('.');
  
  if (decimalIndex === -1) {
    // Sem casa decimal, adicionar .00%
    return `${valueStr}.00%`;
  } else {
    const integerPart = valueStr.substring(0, decimalIndex);
    const decimalPart = valueStr.substring(decimalIndex + 1);
    
    // Se tem mais que 2 casas decimais, truncar para 2 (sem arredondamento)
    if (decimalPart.length >= 2) {
      return `${integerPart}.${decimalPart.substring(0, 2)}%`;
    } 
    // Se tem menos que 2 casas, completar com zeros
    else {
      return `${integerPart}.${decimalPart}${'0'.repeat(2 - decimalPart.length)}%`;
    }
  }
};

// Função para formatar horas sem arredondamento
const formatHoras = (val: number): string => {
  // Log para debug
  console.log(`📊 Formatando horas na tabela: ${val}`);
  
  const hours = Math.floor(val);
  const minutesDecimal = (val - hours) * 60;
  // Evitar arredondamento dos minutos
  const minutes = Math.floor(minutesDecimal);
  
  return `${hours}h${minutes.toString().padStart(2, '0')}m`;
};

export default function TabelaOperadores({ dados, tipo = 'colheita_diario' }: TabelaOperadoresProps) {
  // Obter metas do configManager
  const metas = configManager.getMetas(tipo);
  const metaEficiencia = metas.eficienciaEnergetica || 60;
  const metaMotorOcioso = metas.motorOcioso || 25;
  const metaHorasElevador = metas.horaElevador || 5;
  const metaUsoGPS = metas.usoGPS || 90;

  // Valores intermediários (85% do valor meta)
  const metaEficienciaIntermediaria = metaEficiencia * 0.8;
  const metaMotorOciosoIntermediaria = metaMotorOcioso * 1.2;
  const metaHorasElevadorIntermediaria = metaHorasElevador * 0.8;
  const metaUsoGPSIntermediaria = metaUsoGPS * 0.85;

  return (
    <Box 
      w="100%" 
      border="1px solid" 
      borderColor="black" 
      borderRadius="md" 
      overflow="hidden"
      bg="white"
    >
      <Box as="table" w="100%" fontSize="11px" color="black">
        <Box as="thead">
          <Box as="tr" bg="gray.100">
            <Box as="th" p={2} textAlign="left" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
              Operador
            </Box>
            <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
              Eficiência
            </Box>
            <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
              Motor Ocioso
            </Box>
            <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
              Horas Elevador
            </Box>
            <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
              Uso GPS
            </Box>
          </Box>
        </Box>
        <Box as="tbody">
          {dados.eficiencia_energetica
            .filter((item: { nome: string }) => item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR')
            .map((item: { id: string; nome: string; eficiencia: number }, index: number) => {
              const motorOcioso = dados.motor_ocioso.find((m: { id: string }) => m.id === item.id)?.percentual || 0;
              const faltaApontamento = dados.falta_apontamento.find((f: { id: string }) => f.id === item.id)?.percentual || 0;
              const usoGPS = dados.uso_gps.find((g: { id: string }) => g.id === item.id)?.porcentagem || 0;

              return (
                <Box 
                  as="tr" 
                  key={index}
                  bg={index % 2 === 0 ? "white" : "gray.50"}
                >
                  <Box as="td" p={2} borderBottom="1px solid" borderColor="black" color="black" fontWeight="medium">
                    {item.nome}
                  </Box>
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={item.eficiencia >= metaEficiencia ? "green.600" : item.eficiencia >= metaEficienciaIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatPercentage(item.eficiencia)}
                  </Box>
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={motorOcioso <= metaMotorOcioso ? "green.600" : motorOcioso <= metaMotorOciosoIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatPercentage(motorOcioso)}
                  </Box>
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={faltaApontamento >= metaHorasElevador ? "green.600" : faltaApontamento >= metaHorasElevadorIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatHoras(faltaApontamento)}
                  </Box>
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={usoGPS >= metaUsoGPS ? "green.600" : usoGPS >= metaUsoGPSIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatPercentage(usoGPS)}
                  </Box>
                </Box>
              );
          })}
        </Box>
      </Box>
    </Box>
  );
} 