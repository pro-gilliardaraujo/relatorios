import { Box } from '@chakra-ui/react';

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
}

export default function TabelaOperadores({ dados }: TabelaOperadoresProps) {
  return (
    <Box 
      w="100%" 
      border="1px solid" 
      borderColor="black" 
      borderRadius="md" 
      overflow="hidden"
    >
      <Box as="table" w="100%" fontSize="11px">
        <Box as="thead">
          <Box as="tr" bg="gray.50">
            <Box as="th" p={2} textAlign="left" borderBottom="1px solid" borderColor="black" color="black">
              Operador
            </Box>
            <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black">
              Eficiência
            </Box>
            <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black">
              Motor Ocioso
            </Box>
            <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black">
              Horas Elevador
            </Box>
            <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black">
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
                  <Box as="td" p={2} borderBottom="1px solid" borderColor="black" color="black">
                    {item.nome}
                  </Box>
                  <Box as="td" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color={item.eficiencia >= 60 ? "green.500" : item.eficiencia >= 48 ? "yellow.500" : "red.500"}>
                    {item.eficiencia.toFixed(0)}%
                  </Box>
                  <Box as="td" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color={motorOcioso <= 25 ? "green.500" : motorOcioso <= 30 ? "yellow.500" : "red.500"}>
                    {motorOcioso.toFixed(1)}%
                  </Box>
                  <Box as="td" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color={faltaApontamento <= 25 ? "green.500" : faltaApontamento <= 30 ? "yellow.500" : "red.500"}>
                    {`${Math.floor(faltaApontamento)}h ${Math.round((faltaApontamento % 1) * 60)}m`}
                  </Box>
                  <Box as="td" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color={usoGPS >= 95 ? "green.500" : usoGPS >= 76 ? "yellow.500" : "red.500"}>
                    {usoGPS.toFixed(1)}%
                  </Box>
                </Box>
              );
          })}
        </Box>
      </Box>
    </Box>
  );
} 