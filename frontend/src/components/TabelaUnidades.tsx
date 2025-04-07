import { Box } from '@chakra-ui/react';
import { configManager } from '@/utils/config';

interface UnidadeData {
  id: string;
  nome: string;
  valor: number;
}

interface TabelaUnidadesProps {
  dados: {
    colheita?: {
      disponibilidade_mecanica: UnidadeData[];
      eficiencia_energetica: UnidadeData[];
      motor_ocioso: UnidadeData[];
      hora_elevador: UnidadeData[];
      uso_gps: UnidadeData[];
    };
    transbordo?: {
      disponibilidade_mecanica: UnidadeData[];
      eficiencia_energetica: UnidadeData[];
      motor_ocioso: UnidadeData[];
      falta_apontamento: UnidadeData[];
      uso_gps: UnidadeData[];
    };
  };
  tipo: 'colheita' | 'transbordo';
}

// Função para formatar percentagens com 2 casas sem arredondamento
const formatPercentage = (val: number): string => {
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
  const hours = Math.floor(val);
  const minutesDecimal = (val - hours) * 60;
  // Evitar arredondamento dos minutos
  const minutes = Math.floor(minutesDecimal);
  
  return `${hours}h${minutes.toString().padStart(2, '0')}m`;
};

export default function TabelaUnidades({ dados, tipo }: TabelaUnidadesProps) {
  // Verificar se temos dados para o tipo selecionado
  const tipoSelecionado = dados[tipo];
  
  if (!tipoSelecionado) {
    return (
      <Box p={4} textAlign="center" fontSize="sm" color="gray.500">
        Sem dados disponíveis
      </Box>
    );
  }

  // Definir quais colunas mostrar baseado no tipo
  const mostrarColunas = {
    disponibilidade: true, // Mostrar em todos os tipos
    eficiencia: true, // Mostrar em todos os tipos
    motorOcioso: true, // Mostrar em todos os tipos
    horaElevador: tipo === 'colheita', // Apenas para colheita
    usoGPS: true, // Mostrar em todos os tipos
    faltaApontamento: tipo === 'transbordo' // Apenas para transbordo
  };
  
  // Verificar se os dados necessários existem
  const temDados = 
    (Array.isArray(tipoSelecionado.disponibilidade_mecanica) && tipoSelecionado.disponibilidade_mecanica.length > 0) ||
    (Array.isArray(tipoSelecionado.eficiencia_energetica) && tipoSelecionado.eficiencia_energetica.length > 0) ||
    (Array.isArray(tipoSelecionado.motor_ocioso) && tipoSelecionado.motor_ocioso.length > 0);
  
  if (!temDados) {
    return (
      <Box p={4} textAlign="center" fontSize="sm" color="gray.500">
        Sem dados de unidades disponíveis
      </Box>
    );
  }

  // Se pelo menos uma das seções tem dados, vamos mostrar a tabela
  const unidadesVistas = new Set<string>();
  const todasUnidades: Array<{id: string, nome: string}> = [];
  
  // Coletar todas as unidades únicas de todas as seções
  [
    ...(Array.isArray(tipoSelecionado.disponibilidade_mecanica) ? tipoSelecionado.disponibilidade_mecanica : []),
    ...(Array.isArray(tipoSelecionado.eficiencia_energetica) ? tipoSelecionado.eficiencia_energetica : []),
    ...(Array.isArray(tipoSelecionado.motor_ocioso) ? tipoSelecionado.motor_ocioso : [])
  ].forEach(item => {
    if (item && item.nome && !unidadesVistas.has(item.nome)) {
      unidadesVistas.add(item.nome);
      todasUnidades.push({
        id: item.id || '',
        nome: item.nome
      });
    }
  });
  
  // Se não encontramos unidades válidas, mostrar mensagem
  if (todasUnidades.length === 0) {
    return (
      <Box p={4} textAlign="center" fontSize="sm" color="gray.500">
        Sem dados de unidades disponíveis
      </Box>
    );
  }
  
  // Obter metas do configManager para o tipo correspondente
  const metaConfig = tipo === 'colheita' ? 'comparativo_unidades_diario' : 'comparativo_unidades_diario';
  const metas = configManager.getMetas(metaConfig);
  
  // Ajustar os nomes das metas para o tipo correto
  let metaDisponibilidade = 90; 
  let metaEficiencia = 70;
  let metaMotorOcioso = 4;
  let metaHorasElevador = 0;
  let metaUsoGPS = 90;
  let metaFaltaApontamento = 0;
  
  if (tipo === 'colheita') {
    metaDisponibilidade = metas.disponibilidadeMecanicaColheita || 90;
    metaEficiencia = metas.eficienciaColheita || 70;
    metaMotorOcioso = metas.motorOciosoColheita || 4;
    metaHorasElevador = metas.horaElevadorColheita || 5;
    metaUsoGPS = metas.usoGPSColheita || 90;
  } else {
    metaDisponibilidade = metas.disponibilidadeMecanicaTransbordo || 90;
    metaEficiencia = metas.eficienciaTransbordo || 65;
    metaMotorOcioso = metas.motorOciosoTransbordo || 6;
    metaFaltaApontamento = metas.faltaApontamentoTransbordo || 10;
    metaUsoGPS = metas.usoGPSTransbordo || 90;
  }

  // Valores intermediários (85% do valor meta)
  const metaDisponibilidadeIntermediaria = metaDisponibilidade * 0.85;
  const metaEficienciaIntermediaria = metaEficiencia * 0.85;
  const metaMotorOciosoIntermediaria = metaMotorOcioso * 1.15;
  const metaHorasElevadorIntermediaria = metaHorasElevador ? metaHorasElevador * 0.85 : 0;
  const metaUsoGPSIntermediaria = metaUsoGPS * 0.85;
  const metaFaltaApontamentoIntermediaria = metaFaltaApontamento ? metaFaltaApontamento * 1.15 : 0;

  // Função auxiliar para encontrar valor da unidade
  const encontrarValorUnidade = (
    array: Array<UnidadeData> | undefined, 
    unidadeId: string, 
    unidadeNome: string
  ) => {
    if (!array) return 0;
    
    // Tentar encontrar pelo ID exato
    const itemPorId = array?.find((m) => m.id === unidadeId);
    if (itemPorId) {
      return itemPorId.valor || 0;
    }
    
    // Tentar encontrar pelo nome
    const itemPorNome = array?.find((m) => m.nome === unidadeNome);
    if (itemPorNome) {
      return itemPorNome.valor || 0;
    }
    
    // Se não encontrar, retorna 0
    return 0;
  };

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
              Unidade
            </Box>
            {mostrarColunas.disponibilidade && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Disponibilidade
              </Box>
            )}
            {mostrarColunas.eficiencia && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Eficiência
              </Box>
            )}
            {mostrarColunas.motorOcioso && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Motor Ocioso
              </Box>
            )}
            {mostrarColunas.horaElevador && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Horas Elevador
              </Box>
            )}
            {mostrarColunas.faltaApontamento && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Falta Apontamento
              </Box>
            )}
            {mostrarColunas.usoGPS && (
              <Box as="th" p={2} textAlign="center" borderBottom="1px solid" borderColor="black" color="black" fontWeight="bold">
                Uso GPS
              </Box>
            )}
          </Box>
        </Box>
        <Box as="tbody">
          {todasUnidades.map((item, index) => {
              // Usar nossa função auxiliar para encontrar os valores
              const disponibilidade = encontrarValorUnidade(
                tipoSelecionado.disponibilidade_mecanica,
                item.id,
                item.nome
              );
              
              const eficiencia = encontrarValorUnidade(
                tipoSelecionado.eficiencia_energetica,
                item.id,
                item.nome
              );
              
              const motorOcioso = encontrarValorUnidade(
                tipoSelecionado.motor_ocioso,
                item.id,
                item.nome
              );
              
              const horasElevador = tipo === 'colheita' && 
                tipoSelecionado && 
                'hora_elevador' in tipoSelecionado && 
                tipoSelecionado.hora_elevador ? 
                  encontrarValorUnidade(
                    tipoSelecionado.hora_elevador as UnidadeData[],
                    item.id,
                    item.nome
                  ) : 0;
              
              const faltaApontamento = tipo === 'transbordo' && 
                tipoSelecionado && 
                'falta_apontamento' in tipoSelecionado && 
                tipoSelecionado.falta_apontamento ? 
                  encontrarValorUnidade(
                    tipoSelecionado.falta_apontamento as UnidadeData[],
                    item.id,
                    item.nome
                  ) : 0;
              
              const usoGPS = encontrarValorUnidade(
                tipoSelecionado.uso_gps,
                item.id,
                item.nome
              );

              return (
                <Box 
                  as="tr" 
                  key={index}
                  bg={index % 2 === 0 ? "white" : "gray.50"}
                >
                  <Box as="td" p={2} borderBottom="1px solid" borderColor="black" color="black" fontWeight="medium">
                    {item.nome}
                  </Box>
                  
                  {mostrarColunas.disponibilidade && (
                    <Box 
                      as="td" 
                      p={2} 
                      textAlign="center" 
                      borderBottom="1px solid" 
                      borderColor="black" 
                      color={disponibilidade >= metaDisponibilidade ? "green.600" : disponibilidade >= metaDisponibilidadeIntermediaria ? "orange.500" : "red.600"}
                      fontWeight="bold"
                    >
                      {formatPercentage(disponibilidade)}
                    </Box>
                  )}
                  
                  {mostrarColunas.eficiencia && (
                    <Box 
                      as="td" 
                      p={2} 
                      textAlign="center" 
                      borderBottom="1px solid" 
                      borderColor="black" 
                      color={eficiencia >= metaEficiencia ? "green.600" : eficiencia >= metaEficienciaIntermediaria ? "orange.500" : "red.600"}
                      fontWeight="bold"
                    >
                      {formatPercentage(eficiencia)}
                    </Box>
                  )}
                  
                  {mostrarColunas.motorOcioso && (
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
                  )}
                  
                  {mostrarColunas.horaElevador && (
                    <Box 
                      as="td" 
                      p={2} 
                      textAlign="center" 
                      borderBottom="1px solid" 
                      borderColor="black" 
                      color={horasElevador >= metaHorasElevador ? "green.600" : horasElevador >= metaHorasElevadorIntermediaria ? "orange.500" : "red.600"}
                      fontWeight="bold"
                    >
                      {formatHoras(horasElevador)}
                    </Box>
                  )}
                  
                  {mostrarColunas.faltaApontamento && (
                    <Box 
                      as="td" 
                      p={2} 
                      textAlign="center" 
                      borderBottom="1px solid" 
                      borderColor="black" 
                      color={faltaApontamento <= metaFaltaApontamento ? "green.600" : faltaApontamento <= metaFaltaApontamentoIntermediaria ? "orange.500" : "red.600"}
                      fontWeight="bold"
                    >
                      {formatPercentage(faltaApontamento)}
                    </Box>
                  )}
                  
                  {mostrarColunas.usoGPS && (
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
                  )}
                </Box>
              );
            })}
        </Box>
      </Box>
    </Box>
  );
} 