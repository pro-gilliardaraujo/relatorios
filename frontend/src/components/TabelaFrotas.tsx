import { Box } from '@chakra-ui/react';
import { configManager } from '@/utils/config';
import { useMemo } from 'react';

interface FrotaData {
  frota: string;
  disponibilidade?: number;
  tdh?: number;
  diesel?: number;
  impureza?: number;
  isHeader?: boolean;
}

interface DadosAdicionais {
  tdh?: Array<{ frota: string; valor: number; }>;
  diesel?: Array<{ frota: string; valor: number; }>;
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
  const mostrarEficiencia = false;
  const mostrarMotorOcioso = false;
  const mostrarFaltaApontamento = false;
  const mostrarUsoGPS = false;

  // Função para combinar dados com os dados completos
  const dadosCombinados = useMemo(() => {
    let dadosFinal = [...dados];
    
    // Log para debug
    console.log("📊 Dados originais (Frotas):", JSON.stringify(dados));
    console.log("📊 Dados completos:", JSON.stringify(dadosCompletos));
    console.log("📊 Dados adicionais:", JSON.stringify(dadosAdicionais));

    // Adicionar dados de TDH, Diesel, Impureza de dadosCompletos se disponíveis
    if (dadosCompletos) {
      console.log("📊 Processando dados completos...");
      dadosFinal = dadosFinal.map(item => {
        // Buscar valores correspondentes nos dadosCompletos
        const tdh = dadosCompletos.tdh?.find(t => t.frota === item.frota)?.valor;
        const diesel = dadosCompletos.diesel?.find(d => d.frota === item.frota)?.valor;
        const impureza = dadosCompletos.impureza_vegetal?.find(i => i.frota === item.frota)?.valor;

        // Log detalhado para depuração
        console.log(`📊 Frotas: ${item.frota}, TDH (completos): ${tdh}, Diesel (completos): ${diesel}, Impureza: ${impureza}`);

        return {
          ...item,
          tdh: tdh !== undefined ? tdh : item.tdh,
          diesel: diesel !== undefined ? diesel : item.diesel,
          impureza: impureza !== undefined ? impureza : item.impureza
        };
      });
    }
    
    // Adicionar dados de TDH, Diesel de dadosAdicionais (segunda fonte)
    if (dadosAdicionais) {
      console.log("📊 Processando dados adicionais...");
      dadosFinal = dadosFinal.map(item => {
        // Buscar valores correspondentes nos dadosAdicionais
        const tdh = dadosAdicionais.tdh?.find(t => t.frota === item.frota)?.valor;
        const diesel = dadosAdicionais.diesel?.find(d => d.frota === item.frota)?.valor;

        // Log detalhado para depuração
        console.log(`📊 Frotas: ${item.frota}, TDH (adicionais): ${tdh}, Diesel (adicionais): ${diesel}`);

        return {
          ...item,
          tdh: tdh !== undefined ? tdh : item.tdh,
          diesel: diesel !== undefined ? diesel : item.diesel
        };
      });
    }
    
    // Log dos dados finais para debug
    console.log("📊 Dados combinados (finais):", JSON.stringify(dadosFinal));
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
            .sort((a, b) => {
              // Se ambos têm disponibilidade, ordenar por ela
              if (a.disponibilidade !== undefined && b.disponibilidade !== undefined) {
                return (b.disponibilidade || 0) - (a.disponibilidade || 0);
              }
              return 0;
            })
            .map((item, index) => (
              <Box 
                as="tr" 
                key={index}
                bg={index % 2 === 0 ? "white" : "gray.50"}
              >
                <Box 
                  as="td" 
                  p={2} 
                  borderBottom="1px solid" 
                  borderColor="black" 
                  color="black" 
                  fontWeight="medium"
                >
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