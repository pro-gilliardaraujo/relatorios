import { Box } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { useMemo } from 'react';

interface FrotaData {
  frota: string;
  disponibilidade?: number;
  tdh?: number;
  diesel?: number;
  impureza?: number;
  eficiencia?: number;
  motor_ocioso?: number;
  falta_apontamento?: number;
  uso_gps?: number;
}

interface DadosAdicionais {
  eficiencia_energetica?: Array<{ frota: string; valor: number; }>;
  motor_ocioso?: Array<{ frota: string; valor: number; }>;
  falta_apontamento?: Array<{ frota: string; valor: number; }>;
  uso_gps?: Array<{ frota: string; valor: number; }>;
}

interface TabelaFrotasProps {
  dados: FrotaData[];
  tipo?: string;
  dadosCompletos?: {
    tdh?: Array<{ frota: string; valor: number; }>;
    diesel?: Array<{ frota: string; valor: number; }>;
    impureza_vegetal?: Array<{ frota: string; valor: number; }>;
  };
  dadosAdicionais?: DadosAdicionais;
}

// Função para formatar valores decimais com 4 casas sem arredondamento
const formatDecimal = (val: number): string => {
  // Log para debug
  console.log(`📊 Formatando valor decimal: ${val}`);
  
  // Preservar o valor original sem causar arredondamento
  const valueStr = String(val);
  const decimalIndex = valueStr.indexOf('.');
  
  if (decimalIndex === -1) {
    // Sem casa decimal, adicionar .0000
    return `${valueStr}.0000`;
  } else {
    const integerPart = valueStr.substring(0, decimalIndex);
    const decimalPart = valueStr.substring(decimalIndex + 1);
    
    // Se tem mais que 4 casas decimais, truncar para 4 (sem arredondamento)
    if (decimalPart.length >= 4) {
      return `${integerPart}.${decimalPart.substring(0, 4)}`;
    } 
    // Se tem menos que 4 casas, completar com zeros
    else {
      return `${integerPart}.${decimalPart}${'0'.repeat(4 - decimalPart.length)}`;
    }
  }
};

// Função para formatar percentagens com 2 casas sem arredondamento
const formatPercentage = (val: number): string => {
  // Log para debug
  console.log(`📊 Formatando percentagem: ${val}`);
  
  // Preservar o valor original sem causar arredondamento
  const valueStr = String(val);
  const decimalIndex = valueStr.indexOf('.');
  
  if (decimalIndex === -1) {
    // Sem casa decimal, adicionar .0%
    return `${valueStr}.0%`;
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

export default function TabelaFrotas({ 
  dados, 
  tipo = 'colheita_diario', 
  dadosCompletos,
  dadosAdicionais
}: TabelaFrotasProps) {
  // Buscar metas do tipo de relatório
  const metas = configManager.getMetas(tipo);
  const metaDisponibilidade = metas.disponibilidadeMecanica || 90;
  const metaDisponibilidadeIntermediaria = metaDisponibilidade * 0.85;
  
  const metaTDH = metas.tdh || 0.0124;
  const metaTDHIntermediaria = metaTDH * 1.15; // Inverso porque menor é melhor
  
  const metaDiesel = metas.diesel || 0.718;
  const metaDieselIntermediaria = metaDiesel * 1.15; // Inverso porque menor é melhor
  
  const metaImpureza = metas.impureza_vegetal || 64;
  const metaImpurezaIntermediaria = metaImpureza * 1.15; // Inverso porque menor é melhor

  const metaEficiencia = metas.eficienciaEnergetica || 70;
  const metaEficienciaIntermediaria = metaEficiencia * 0.85;

  const metaMotorOcioso = metas.motorOcioso || 20;
  const metaMotorOciosoIntermediaria = metaMotorOcioso * 1.15; // Inverso porque menor é melhor

  const metaFaltaApontamento = metas.faltaApontamento || 10;
  const metaFaltaApontamentoIntermediaria = metaFaltaApontamento * 1.15; // Inverso porque menor é melhor

  const metaUsoGPS = metas.usoGPS || 95;
  const metaUsoGPSIntermediaria = metaUsoGPS * 0.85;

  // Determinar quais colunas mostrar com base no tipo de relatório
  const mostrarTDH = tipo.includes('semanal');
  const mostrarDiesel = tipo.includes('semanal');
  const mostrarImpureza = tipo === 'colheita_semanal';
  const mostrarDisponibilidade = true; // Sempre mostrar disponibilidade
  
  // Colunas específicas para transbordo
  const ehTransbordo = tipo.includes('transbordo');
  const mostrarEficiencia = ehTransbordo;
  const mostrarMotorOcioso = ehTransbordo;
  const mostrarFaltaApontamento = ehTransbordo;
  const mostrarUsoGPS = ehTransbordo;

  // Função para combinar dados com os dados completos
  const dadosCombinados = useMemo(() => {
    let dadosFinal = [...dados];

    // Adicionar dados de TDH, Diesel, Impureza se disponíveis
    if (dadosCompletos) {
      dadosFinal = dadosFinal.map(item => {
        const tdh = dadosCompletos.tdh?.find(t => t.frota === item.frota)?.valor;
        const diesel = dadosCompletos.diesel?.find(d => d.frota === item.frota)?.valor;
        const impureza = dadosCompletos.impureza_vegetal?.find(i => i.frota === item.frota)?.valor;

        return {
          ...item,
          tdh,
          diesel,
          impureza
        };
      });
    }

    // Adicionar dados de eficiência, motor ocioso, falta de apontamento e uso de GPS se disponíveis
    if (dadosAdicionais) {
      dadosFinal = dadosFinal.map(item => {
        const eficiencia = dadosAdicionais.eficiencia_energetica?.find(e => e.frota === item.frota)?.valor;
        const motor_ocioso = dadosAdicionais.motor_ocioso?.find(m => m.frota === item.frota)?.valor;
        const falta_apontamento = dadosAdicionais.falta_apontamento?.find(f => f.frota === item.frota)?.valor;
        const uso_gps = dadosAdicionais.uso_gps?.find(u => u.frota === item.frota)?.valor;

        return {
          ...item,
          eficiencia,
          motor_ocioso,
          falta_apontamento,
          uso_gps
        };
      });
    }

    return dadosFinal;
  }, [dados, dadosCompletos, dadosAdicionais]);

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
              Frota
            </Box>
            {mostrarDisponibilidade && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Disponibilidade
              </Box>
            )}
            {mostrarEficiencia && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Eficiência
              </Box>
            )}
            {mostrarMotorOcioso && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Motor Ocioso
              </Box>
            )}
            {mostrarFaltaApontamento && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Falta Apontamento
              </Box>
            )}
            {mostrarUsoGPS && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Uso GPS
              </Box>
            )}
            {mostrarTDH && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                TDH
              </Box>
            )}
            {mostrarDiesel && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Diesel
              </Box>
            )}
            {mostrarImpureza && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Impureza
              </Box>
            )}
          </Box>
        </Box>
        <Box as="tbody">
          {dadosCombinados
            .filter(item => item.frota !== '0')
            .sort((a, b) => (b.disponibilidade || 0) - (a.disponibilidade || 0))
            .map((item, index) => (
              <Box 
                as="tr" 
                key={index}
                bg={index % 2 === 0 ? "white" : "gray.50"}
              >
                <Box as="td" p={2} borderBottom="1px solid" borderColor="black" color="black" fontWeight="medium">
                  {item.frota}
                </Box>
                {mostrarDisponibilidade && (
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={(item.disponibilidade || 0) >= metaDisponibilidade ? "green.600" : (item.disponibilidade || 0) >= metaDisponibilidadeIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatPercentage(item.disponibilidade || 0)}
                  </Box>
                )}
                {mostrarEficiencia && (
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={(item.eficiencia || 0) >= metaEficiencia ? "green.600" : (item.eficiencia || 0) >= metaEficienciaIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatPercentage(item.eficiencia || 0)}
                  </Box>
                )}
                {mostrarMotorOcioso && (
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={(item.motor_ocioso || 0) <= metaMotorOcioso ? "green.600" : (item.motor_ocioso || 0) <= metaMotorOciosoIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatPercentage(item.motor_ocioso || 0)}
                  </Box>
                )}
                {mostrarFaltaApontamento && (
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={(item.falta_apontamento || 0) <= metaFaltaApontamento ? "green.600" : (item.falta_apontamento || 0) <= metaFaltaApontamentoIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatPercentage(item.falta_apontamento || 0)}
                  </Box>
                )}
                {mostrarUsoGPS && (
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={(item.uso_gps || 0) >= metaUsoGPS ? "green.600" : (item.uso_gps || 0) >= metaUsoGPSIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatPercentage(item.uso_gps || 0)}
                  </Box>
                )}
                {mostrarTDH && (
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={(item.tdh || 0) <= metaTDH ? "green.600" : (item.tdh || 0) <= metaTDHIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatDecimal(item.tdh || 0)}
                  </Box>
                )}
                {mostrarDiesel && (
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={(item.diesel || 0) <= metaDiesel ? "green.600" : (item.diesel || 0) <= metaDieselIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatDecimal(item.diesel || 0)}
                  </Box>
                )}
                {mostrarImpureza && (
                  <Box 
                    as="td" 
                    p={2} 
                    textAlign="center" 
                    borderBottom="1px solid" 
                    borderColor="black" 
                    color={(item.impureza || 0) <= metaImpureza ? "green.600" : (item.impureza || 0) <= metaImpurezaIntermediaria ? "orange.500" : "red.600"}
                    fontWeight="bold"
                  >
                    {formatPercentage(item.impureza || 0)}
                  </Box>
                )}
              </Box>
            ))}
        </Box>
      </Box>
    </Box>
  );
} 