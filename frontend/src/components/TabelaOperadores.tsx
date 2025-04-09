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
    falta_apontamento?: Array<{ id: string; nome: string; percentual: number }>;
    uso_gps: Array<{ id: string; nome: string; porcentagem: number }>;
    hora_elevador?: Array<{ id: string; nome: string; horas: number }>;
  };
  tipo?: string;
  mostrarUsoGPS?: boolean;
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

// Função para limpar o ID do operador, removendo numerações como "1 - ", "2 - " antes do ID real
const limparIdOperador = (idCompleto: string): string => {
  // Se o ID contém um padrão como "123 - NOME", extrai apenas o número inicial
  if (idCompleto && typeof idCompleto === 'string' && idCompleto.includes(' - ')) {
    return idCompleto.split(' - ')[0].trim();
  }
  
  // Se o ID parece ser apenas um índice numérico (1, 2, 3, etc.), retorna vazio
  if (/^\d{1,2}$/.test(idCompleto)) {
    return '';
  }
  
  // Se não encontrou nenhum dos padrões, retorna o ID original
  return idCompleto;
};

export default function TabelaOperadores({ dados, tipo = 'colheita_diario', mostrarUsoGPS = true }: TabelaOperadoresProps) {
  // Log para depuração
  console.log('📊 TabelaOperadores recebeu dados:', {
    tipo: tipo,
    mostrarUsoGPS: mostrarUsoGPS,
    eficiencia_energetica: dados.eficiencia_energetica?.length || 0,
    motor_ocioso: dados.motor_ocioso?.length || 0,
    falta_apontamento: dados.falta_apontamento?.length || 0,
    uso_gps: dados.uso_gps?.length || 0,
    hora_elevador: dados.hora_elevador?.length || 0
  });
  
  // Definir quais colunas mostrar baseado no tipo de relatório
  const mostrarColunas = {
    eficiencia: true, // Mostrar em todos os tipos
    motorOcioso: true, // Mostrar em todos os tipos
    horaElevador: tipo.startsWith('colheita_'), // Apenas para relatórios de colheita
    usoGPS: mostrarUsoGPS, // Usar o valor da prop
    faltaApontamento: tipo.startsWith('transbordo_') // Apenas para relatórios de transbordo
  };
  
  console.log('📊 Configuração de colunas para tabela:', mostrarColunas);
  
  // Verificar se os dados necessários existem
  const temDados = 
    (Array.isArray(dados.eficiencia_energetica) && dados.eficiencia_energetica.length > 0) ||
    (Array.isArray(dados.motor_ocioso) && dados.motor_ocioso.length > 0) ||
    (Array.isArray(dados.falta_apontamento) && dados.falta_apontamento.length > 0) ||
    (Array.isArray(dados.uso_gps) && dados.uso_gps.length > 0) ||
    (Array.isArray(dados.hora_elevador) && dados.hora_elevador.length > 0);
  
  if (!temDados) {
    console.log('📊 Todos os dados de operadores estão ausentes ou vazios');
    return (
      <Box p={4} textAlign="center" fontSize="sm" color="gray.500">
        Sem dados de operadores disponíveis
      </Box>
    );
  }

  // Filtrar operadores inválidos
  const filtrarOperadoresValidos = (array: any[]): any[] => {
    return array?.filter(item => 
      item && 
      item.nome && 
      item.nome !== 'TROCA DE TURNO' && 
      item.nome !== 'SEM OPERADOR' &&
      // Remover valores com "TROCA DE TURNO" em qualquer parte do nome
      !item.nome.includes('TROCA DE TURNO')
    ) || [];
  };

  // Filtrar e limpar os arrays de dados
  const eficienciaFiltrada = filtrarOperadoresValidos(dados.eficiencia_energetica);
  const motorOciosoFiltrado = filtrarOperadoresValidos(dados.motor_ocioso);
  const faltaApontamentoFiltrado = filtrarOperadoresValidos(dados.falta_apontamento || []);
  const usoGPSFiltrado = filtrarOperadoresValidos(dados.uso_gps);
  const horaElevadorFiltrado = filtrarOperadoresValidos(dados.hora_elevador || []);

  // Se não encontramos operadores válidos após a filtragem, mostrar mensagem
  if (
    eficienciaFiltrada.length === 0 &&
    motorOciosoFiltrado.length === 0 &&
    faltaApontamentoFiltrado.length === 0 &&
    usoGPSFiltrado.length === 0 &&
    horaElevadorFiltrado.length === 0
  ) {
    console.log('📊 Nenhum operador válido encontrado após filtragem');
    return (
      <Box p={4} textAlign="center" fontSize="sm" color="gray.500">
        Sem dados de operadores disponíveis
      </Box>
    );
  }
  
  // Coletar todos os operadores únicos baseados no nome (não no ID)
  const operadoresVistos = new Set<string>();
  const todosOperadores: Array<{id: string, nome: string}> = [];
  
  // Combinando todos os arrays de dados filtrados
  [
    ...eficienciaFiltrada,
    ...motorOciosoFiltrado,
    ...faltaApontamentoFiltrado,
    ...usoGPSFiltrado,
    ...horaElevadorFiltrado
  ].forEach(item => {
    if (item && item.nome && !operadoresVistos.has(item.nome)) {
      operadoresVistos.add(item.nome);
      const idLimpo = limparIdOperador(item.id);
      todosOperadores.push({
        id: idLimpo,
        nome: item.nome
      });
    }
  });
  
  // Obter metas do configManager
  const metas = configManager.getMetas(tipo);
  const metaEficiencia = metas.eficienciaEnergetica || 60;
  const metaMotorOcioso = metas.motorOcioso || 25;
  const metaHorasElevador = metas.horaElevador || 5;
  const metaUsoGPS = metas.usoGPS || 90;
  const metaFaltaApontamento = metas.faltaApontamento || 15;

  // Valores intermediários (85% do valor meta)
  const metaEficienciaIntermediaria = metaEficiencia * 0.8;
  const metaMotorOciosoIntermediaria = metaMotorOcioso * 1.2;
  const metaHorasElevadorIntermediaria = metaHorasElevador * 0.8;
  const metaUsoGPSIntermediaria = metaUsoGPS * 0.85;
  const metaFaltaApontamentoIntermediaria = metaFaltaApontamento * 1.2;

  // Função auxiliar para procurar operador pelo nome exato (não pelo ID)
  const encontrarValorOperadorPorNome = (
    array: Array<any> | undefined, 
    operadorNome: string, 
    campoValor: string
  ) => {
    if (!array || !Array.isArray(array)) return 0;
    
    // Encontrar pelo nome exato do operador
    const item = array.find((m: any) => m.nome === operadorNome);
    
    if (item) {
      return item[campoValor] || 0;
    }
    
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
              Operador
            </Box>
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
          {todosOperadores.map((item, index) => {
              // Usar nossa função auxiliar para encontrar os valores pelo nome do operador
              const eficiencia = encontrarValorOperadorPorNome(
                dados.eficiencia_energetica,
                item.nome, 
                'eficiencia'
              );
              
              const motorOcioso = encontrarValorOperadorPorNome(
                dados.motor_ocioso, 
                item.nome, 
                'percentual'
              );
              
              const horasElevador = encontrarValorOperadorPorNome(
                dados.hora_elevador, 
                item.nome, 
                'horas'
              );
              
              const faltaApontamento = encontrarValorOperadorPorNome(
                dados.falta_apontamento,
                item.nome,
                'percentual'
              );
              
              const usoGPS = encontrarValorOperadorPorNome(
                dados.uso_gps, 
                item.nome, 
                'porcentagem'
              );
              
              // Determinar cores conforme o valor
              const getEfficiencyColor = (val: number) => {
                if (val >= metaEficiencia) return 'green.600';
                if (val >= metaEficienciaIntermediaria) return 'orange.500';
                return 'red.500';
              };
              
              const getInvertedColor = (val: number, meta: number, intermedia: number) => {
                if (val <= meta) return 'green.600';
                if (val <= intermedia) return 'orange.500';
                return 'red.500';
              };
              
              const getHoursColor = (val: number) => {
                if (val >= metaHorasElevador) return 'green.600';
                if (val >= metaHorasElevadorIntermediaria) return 'orange.500';
                return 'red.500';
              };
              
              // Decidir se mostra ou não o operador
              // Vamos esconder a linha se todos os valores do operador forem 0
              const temAlgumValor = eficiencia > 0 || motorOcioso > 0 || horasElevador > 0 || faltaApontamento > 0 || usoGPS > 0;
              if (!temAlgumValor) return null;
              
              // Formatação do ID: mostrar apenas se existir
              const idDisplay = item.id ? `${item.id} - ` : '';
              
              return (
                <Box 
                  as="tr" 
                  key={index} 
                  bg={index % 2 === 0 ? 'white' : 'gray.50'}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  _hover={{ bg: 'gray.100' }}
                >
                  <Box 
                    as="td" 
                    p={2} 
                    fontWeight="medium" 
                    borderRight="1px solid" 
                    borderColor="gray.200"
                    title={item.nome}
                    noOfLines={1}
                  >
                    {idDisplay}{item.nome}
                  </Box>
                  
                  {mostrarColunas.eficiencia && (
                    <Box 
                      as="td" 
                      p={2} 
                      textAlign="center" 
                      borderRight="1px solid" 
                      borderColor="gray.200"
                      color={getEfficiencyColor(eficiencia)}
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
                      borderRight="1px solid" 
                      borderColor="gray.200"
                      color={getInvertedColor(motorOcioso, metaMotorOcioso, metaMotorOciosoIntermediaria)}
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
                      borderRight="1px solid" 
                      borderColor="gray.200"
                      color={getHoursColor(horasElevador)}
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
                      borderRight="1px solid" 
                      borderColor="gray.200"
                      color={getInvertedColor(faltaApontamento, metaFaltaApontamento, metaFaltaApontamentoIntermediaria)}
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
                      color={usoGPS >= metaUsoGPS ? 'green.600' : (usoGPS >= metaUsoGPSIntermediaria ? 'orange.500' : 'red.500')}
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