'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid, Center, Spinner, Button, Switch, FormControl, FormLabel } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';
import { GraficoDisponibilidadeMecanicaTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoDisponibilidadeMecanicaTransbordo';
import { GraficoEficienciaEnergetica } from '@/components/Charts/Transbordo/Diario/GraficoEficienciaEnergetica';
import { GraficoMotorOciosoTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoMotorOciosoTransbordo';
import { GraficoUsoGPS } from '@/components/Charts/Transbordo/Diario/GraficoUsoGPS';
import { GraficoFaltaApontamentoTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoFaltaApontamentoTransbordo';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaPrint } from 'react-icons/fa';
import { configManager } from '@/utils/config';
import RelatorioColheitaDiarioResumo from '@/components/RelatorioColheitaDiarioResumo';
import IndicatorCard from '@/components/IndicatorCard';
import TabelaOperadores from '@/components/TabelaOperadores';
import TabelaFrotas from '@/components/TabelaFrotas';

// Dados de exemplo para visualização offline
const exemplosDados: DadosProcessados = {
  disponibilidade_mecanica: [
    { frota: '6031', disponibilidade: 89.00 },
    { frota: '6082', disponibilidade: 99.23 },
    { frota: '6087', disponibilidade: 98.61 },
    { frota: '6096', disponibilidade: 99.34 },
    { frota: '0', disponibilidade: 0.00 }
  ],
  eficiencia_energetica: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', eficiencia: 50.39 },
    { id: '2', nome: 'TROCA DE TURNO', eficiencia: 0.00 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', eficiencia: 56.66 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', eficiencia: 49.92 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', eficiencia: 64.13 },
    { id: '6', nome: 'JOSE HUMBERTO DE OLIVEIRA', eficiencia: 52.45 },
    { id: '7', nome: 'SEM OPERADOR', eficiencia: 9.25 },
    { id: '8', nome: 'VITOR SOARES FREITAS', eficiencia: 56.81 },
    { id: '9', nome: 'DANILO JESUS BRITO', eficiencia: 54.67 }
  ],
  motor_ocioso: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', percentual: 8.87 },
    { id: '2', nome: 'TROCA DE TURNO', percentual: 89.76 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', percentual: 25.30 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', percentual: 38.27 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', percentual: 20.85 },
    { id: '6', nome: 'JOSE HUMBERTO DE OLIVEIRA', percentual: 23.03 },
    { id: '7', nome: 'VITOR SOARES FREITAS', percentual: 13.96 },
    { id: '8', nome: 'DANILO JESUS BRITO', percentual: 17.89 }
  ],
  uso_gps: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', porcentagem: 0.0 },
    { id: '2', nome: 'TROCA DE TURNO', porcentagem: 0.0 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', porcentagem: 0.0 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', porcentagem: 0.0 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', porcentagem: 0.0 },
    { id: '6', nome: 'JOSE HUMBERTO DE OLIVEIRA', porcentagem: 0.0 },
    { id: '7', nome: 'VITOR SOARES FREITAS', porcentagem: 0.0 },
    { id: '8', nome: 'DANILO JESUS BRITO', porcentagem: 0.0 }
  ],
  falta_apontamento: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', percentual: 3.74 },
    { id: '2', nome: 'TROCA DE TURNO', percentual: 0.00 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', percentual: 8.82 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', percentual: 9.26 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', percentual: 0.04 },
    { id: '6', nome: 'JOSE HUMBERTO DE OLIVEIRA', percentual: 14.99 },
    { id: '7', nome: 'VITOR SOARES FREITAS', percentual: 5.30 },
    { id: '8', nome: 'DANILO JESUS BRITO', percentual: 1.02 }
  ]
};

interface TransbordoA4Props {
  data?: any;
}

interface DadosProcessados {
  disponibilidade_mecanica: Array<{
    frota: string;
    disponibilidade: number;
  }>;
  eficiencia_energetica: Array<{
    id: string;
    nome: string;
    eficiencia: number;
  }>;
  motor_ocioso: Array<{
    id: string;
    nome: string;
    percentual: number;
  }>;
  uso_gps: Array<{
    id: string;
    nome: string;
    porcentagem: number;
  }>;
  falta_apontamento: Array<{
    id: string;
    nome: string;
    percentual: number;
  }>;
}

// Função para verificar se os dados estão no formato esperado
function verificarFormatoDados(dados: any) {
  // console.log("🔍 VERIFICANDO FORMATO DOS DADOS:", dados);
  
  if (!dados) {
    console.error("❌ Dados ausentes");
    return false;
  }

  // Verificar se temos pelo menos alguns dos dados esperados
  const tiposDados = [
    { chave: 'disponibilidade_mecanica', validar: (item: any) => item.frota && item.disponibilidade !== undefined },
    { 
      chave: 'eficiencia_energetica', 
      validar: (item: any) => {
        // Ignorar itens sem operador ou com operador inválido
        if (!item.nome || item.nome === '0' || item.nome === 'TROCA DE TURNO') {
          return false;
        }
        return item.eficiencia !== undefined;
      }
    },
    { 
      chave: 'motor_ocioso', 
      validar: (item: any) => {
        if (!item.nome || item.nome === '0' || item.nome === 'TROCA DE TURNO') {
          return false;
        }
        return item.percentual !== undefined;
      }
    },
    { 
      chave: 'falta_apontamento', 
      validar: (item: any) => {
        if (!item.nome || item.nome === '0' || item.nome === 'TROCA DE TURNO') {
          return false;
        }
        return item.percentual !== undefined;
      }
    },
    { 
      chave: 'uso_gps', 
      validar: (item: any) => {
        if (!item.nome || item.nome === '0' || item.nome === 'TROCA DE TURNO') {
          return false;
        }
        return item.porcentagem !== undefined;
      }
    }
  ];

  // Verificar cada tipo de dado
  const dadosValidos = tiposDados.map(tipo => {
    const dados_tipo = dados[tipo.chave];
    if (!Array.isArray(dados_tipo)) {
      // console.log(`❌ ${tipo.chave}: Não é um array`);
      return false;
    }

    // Filtrar itens válidos
    const itensValidos = dados_tipo.filter(tipo.validar);
    // console.log(`✅ ${tipo.chave}: ${itensValidos.length} itens válidos de ${dados_tipo.length} total`);
    
    // Mostrar exemplo de item válido se houver
    // if (itensValidos.length > 0) {
    //   console.log(`📄 Exemplo de ${tipo.chave}:`, itensValidos[0]);
    // }

    return itensValidos.length > 0;
  });

  // Se pelo menos alguns tipos de dados são válidos, considerar ok
  const temDadosValidos = dadosValidos.some(v => v);
  // console.log("📊 Resultado final:", temDadosValidos ? "✅ Dados válidos" : "❌ Dados inválidos");
  
  return temDadosValidos;
}

export default function TransbordoA4({ data }: TransbordoA4Props) {
  // Hooks e estados
  const { images } = useReportStore();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const format = searchParams.get('format');
  const isPdfMode = format === 'pdf';
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useExampleData, setUseExampleData] = useState<boolean>(false);
  const [nomeFrente, setNomeFrente] = useState<string>('');
  
  // Função para formatar a data no padrão brasileiro
  const formatarData = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Função para gerar o nome do arquivo PDF
  const gerarNomeArquivo = () => {
    const data = reportData?.data ? formatarData(reportData.data).replace(/\//g, '-') : formatarData(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    return `Relatório de Transbordo Diário - ${nomeFrente} - ${data}.pdf`;
  };

  const currentDate = formatarData(new Date().toISOString().split('T')[0]);
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  useEffect(() => {
    // Recarregar configurações antes de buscar dados
    const reloadConfig = async () => {
      await configManager.reloadConfig();
    };
    
    const loadData = async () => {
      try {
        await reloadConfig();
        setLoading(true);
        
        if (!reportId) {
          setUseExampleData(true);
          setLoading(false);
          return;
        }
        
        // Mostrar dados brutos do relatório para debugging
        const fetchReportData = async () => {
          try {
            // Buscar dados do relatório
            const { data: reportData, error } = await supabase
              .from('relatorios_diarios')
              .select('*')
              .eq('id', reportId)
              .single();
            
            if (error) {
              throw error;
            }
            
            if (!reportData) {
              throw new Error('Relatório não encontrado');
            }
            
            // Definir dados do relatório
            setReportData(reportData);
            setLoading(false);
            
            // SEMPRE usar dados reais quando temos um ID
            if (reportId) {
              setUseExampleData(false);
            }
          } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
            setError('Erro ao buscar dados. Por favor, tente novamente.');
            setLoading(false);
            return null;
          }
        };
        
        await fetchReportData();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [reportId]);

  // Funções utilitárias para processamento de dados
      const processarOperador = (operador: any) => {
    if (!operador || !operador.nome) return 'Não informado';
    return operador.nome;
      };

      const converterNumero = (valor: any) => {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
          const parsedValue = parseFloat(valor);
          return isNaN(parsedValue) ? 0 : parsedValue;
        }
        return 0;
      };

      const processarPorcentagem = (valor: any) => {
        const numero = converterNumero(valor);
        return numero * 100; // Converter para porcentagem sem arredondar
      };

  // Função para imprimir o relatório
  const handlePrint = async () => {
      window.print();
  };

  // Funções para cálculos estatísticos
  const calcularMedia = (array: any[] | undefined, propriedade: string): number => {
    if (!array || array.length === 0) return 0;
    
    // Log de entrada para debug
    // console.log(`📊 Calculando média para propriedade "${propriedade}" com ${array.length} itens`, 
    //   array.map(item => ({
    //     id: item.frota || item.nome || 'desconhecido',
    //     valor: item[propriedade]
    //   }))
    // );
    
    // Filtrar apenas itens com valores válidos
    const itensFiltrados = array.filter(item => {
      if (!item) return false;
      
      // Verificação adicional para garantir que o valor existe e é válido
      const valorExiste = item[propriedade] !== undefined && item[propriedade] !== null;
      
      // Para disponibilidade, verificar se tem frota
      if (propriedade === 'disponibilidade') {
        return item.frota && item.frota.trim() !== '' && valorExiste;
      }
      
      // Para outros, verificar se tem nome de operador (exceto se for valor de frota)
      if (item.frota) {
        return item.frota.trim() !== '' && valorExiste;
      } else {
        return item.nome && item.nome.trim() !== '' && valorExiste;
      }
    });
    
    // Log para depuração dos itens filtrados
    // console.log(`📊 Itens filtrados para média de "${propriedade}":`, itensFiltrados.length);
    
    // Se não há itens válidos, retorna zero
    if (itensFiltrados.length === 0) return 0;
    
    // Convertendo cada valor para número com cuidado para preservar valores pequenos
    const valores = itensFiltrados.map(item => {
      const valor = item[propriedade];
      // Garantir que valores como "0.01" sejam preservados como 0.01 e não convertidos para 0
      if (typeof valor === 'string') {
        return parseFloat(valor);
      }
      return typeof valor === 'number' ? valor : 0;
    });
    
    // Log individual de cada valor para debug
    // valores.forEach((valor, index) => {
    //   console.log(`📊 Valor[${index}] para média de "${propriedade}": ${valor} (${typeof valor})`);
    // });
    
    // Calculando a soma manualmente para garantir precisão com números pequenos
    let soma = 0;
    for (let i = 0; i < valores.length; i++) {
      soma += valores[i];
    }
    
    // Calcular média com alta precisão
    const media = soma / valores.length;
    
    // Log para depuração da soma e média calculada
    // console.log(`📊 Soma para "${propriedade}": ${soma}, Itens: ${valores.length}, Média: ${media}`);
    
    // Retorna a média calculada sem arredondar
    return media;
  };

  const calcularTotal = (array: any[] | undefined, propriedade: string): number => {
    if (!array || array.length === 0) return 0;
    
    return array.reduce((acc, item) => {
      const valor = item[propriedade];
      return acc + (typeof valor === 'number' ? valor : 0);
    }, 0);
  };

  const contarItensMeta = (array: any[] | undefined, propriedade: string, meta: number, acima: boolean = true): number => {
    if (!array || array.length === 0) return 0;
    
    return array.reduce((count, item) => {
      const valor = item[propriedade];
      if (typeof valor !== 'number') return count;
      
      if (acima) {
        return valor >= meta ? count + 1 : count;
      } else {
        return valor < meta ? count + 1 : count;
      }
    }, 0);
  };

  // Função utilitária para calcular indicadores com segurança
  function calcularIndicador(
    dados: any[] | undefined,
    propriedade: string,
    meta: number,
    isInverted: boolean = false
  ) {
    // Se dados for undefined ou vazio, retornar valores padrão
    if (!dados || !Array.isArray(dados) || dados.length === 0) {
      console.log(`⚠️ Dados ausentes ou inválidos para ${propriedade}`);
      return {
        valor: 0,
        acimaMeta: {
          quantidade: 0,
          total: 0,
          percentual: 0
        }
      };
    }

    try {
      // Filtrar itens válidos e remover 'TROCA DE TURNO'
      const itensValidos = dados.filter((item) => 
        item && 
        typeof item[propriedade] === 'number' && 
        (!item.nome || (item.nome !== 'TROCA DE TURNO')));
      
      if (itensValidos.length === 0) {
        console.log(`⚠️ Sem itens válidos para ${propriedade}`);
        return {
          valor: 0,
          acimaMeta: {
            quantidade: 0,
            total: 0,
            percentual: 0
          }
        };
      }

      // Calcular média dos valores
      const soma = itensValidos.reduce((acc, item) => acc + item[propriedade], 0);
      const media = soma / itensValidos.length;
      
      // Contar quantos itens estão dentro da meta
      const itensMeta = itensValidos.filter((item) => 
        isInverted ? item[propriedade] <= meta : item[propriedade] >= meta
      );
      
      const quantidade = itensMeta.length;
      const total = itensValidos.length;
      const percentual = total > 0 ? (quantidade / total) * 100 : 0;

      return {
        valor: Number(media.toFixed(1)),
        acimaMeta: {
          quantidade,
          total,
          percentual: Number(percentual.toFixed(1))
        }
      };
    } catch (error) {
      console.error(`❌ Erro ao calcular indicador para ${propriedade}:`, error);
      return {
        valor: 0,
        acimaMeta: {
          quantidade: 0,
          total: 0,
          percentual: 0
        }
      };
    }
  }

  // Componentes de layout
  const PageHeader = ({ showDate = true }: { showDate?: boolean }) => {
    // Encontrar o nome completo da frente no config
    const frenteConfig = configManager.getFrentes('transbordo_diario').find((f: { id: string }) => f.id === reportData?.frente);
    const nomeFrente = frenteConfig?.nome || reportData?.frente || 'Exemplo';

    return (
      <Flex justify="space-between" align="center" mb={4}>
        <Image
          src={LOGO_URL}
          alt="Logo IB"
          h={LOGO_HEIGHT}
          objectFit="contain"
        />
        <VStack spacing={1}>
          <Heading size="md" color="black" fontWeight="bold" textAlign="center">
            {`Relatório de Transbordo Diário - ${nomeFrente}`}
          </Heading>
          {showDate && (
            <Text color="black" fontSize="sm">
              {reportData?.data ? formatarData(reportData.data) : currentDate}
            </Text>
          )}
        </VStack>
        <Image 
          src={LOGO_URL} 
          alt="Logo IB"
          h={LOGO_HEIGHT}
          objectFit="contain"
        />
      </Flex>
    );
  };

  const SectionTitle = ({ title, centered = true }: { title: string; centered?: boolean }) => (
    <Heading 
      as="h2" 
      size="sm" 
      textAlign={centered ? "center" : "left"} 
      mb={2} 
      fontSize="15px"
      color="black"
    >
      {title}
      </Heading>
  );

  // Use reportData ou dados de exemplo
  const processedData = useMemo(() => {
    // console.log("🔄 PROCESSANDO DADOS DO RELATÓRIO", {
    //   reportData, 
    //   temDados: reportData?.dados && Object.keys(reportData.dados).length > 0
    // });

    // Se não tivermos dados válidos, usar dados de exemplo
    if (!reportData?.dados || !verificarFormatoDados(reportData.dados)) {
      // console.log("📊 Usando dados de exemplo");
      return exemplosDados;
    }
    
    // A partir daqui, temos dados válidos do relatório
    // console.log("✅ Processando dados reais do relatório");
    
    // Processar e formatar os dados
    const dados = reportData.dados;
    return {
      disponibilidade_mecanica: (dados.disponibilidade_mecanica || [])
        .filter(item => item && item.frota && item.frota !== '0')
        .map(item => {
          // Remover qualquer decimal do número da frota
          const frotaStr = String(item.frota).trim();
          const frotaFormatada = frotaStr.includes('.') ? frotaStr.split('.')[0] : frotaStr;
          
          return {
            frota: frotaFormatada,
            disponibilidade: Number(Number(item.disponibilidade).toFixed(2))
          };
        }),
      eficiencia_energetica: (dados.eficiencia_energetica || [])
        .filter(item => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map(item => ({
          id: item.id,
          nome: item.nome,
          eficiencia: Number(Number(item.eficiencia).toFixed(2))
        })),
      motor_ocioso: (dados.motor_ocioso || [])
        .filter(item => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map(item => ({
          id: item.id,
          nome: item.nome,
          percentual: Number(Number(item.percentual).toFixed(2))
        }))
        .sort((a, b) => b.percentual - a.percentual),
      falta_apontamento: (dados.falta_apontamento || [])
        .filter(item => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map(item => ({
          id: item.id,
          nome: item.nome,
          percentual: Number(Number(item.percentual).toFixed(2))
        })),
      uso_gps: (dados.uso_gps || dados.gps || []) // Tenta uso_gps primeiro, depois gps, ou array vazio
        .filter(item => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map(item => ({
          id: item.id,
          nome: item.nome,
          porcentagem: Number(Number(item.porcentagem).toFixed(2))
        }))
    };
  }, [reportData]);

  // Verificar configuração para mostrar ou esconder componentes
  const secoes = useMemo(() => {
    // Obter configurações de seções para o tipo de relatório
    const tipoRelatorio = reportData?.metadata?.type || 'transbordo_diario';
    const configSections = configManager.getTipoRelatorio(tipoRelatorio)?.secoes || {
      disponibilidadeMecanica: true,
      eficienciaEnergetica: true,
      motorOcioso: true,
      faltaApontamento: true,
      usoGPS: false  // Para transbordo, o padrão para Uso GPS é false
    };
    
    // console.log('🔧 Configuração de seções para', tipoRelatorio, ':', configSections);
    return configSections;
  }, [reportData?.metadata?.type]);

  // Renderização condicional baseada no estado de carregamento
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error && !useExampleData) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Text color="red.500">{error}</Text>
          <Button
            onClick={() => setUseExampleData(true)}
            colorScheme="blue"
          >
            Usar Dados de Exemplo
          </Button>
        </VStack>
      </Center>
    );
  }
  
  // RENDERIZAÇÃO PRINCIPAL
  return (
    <Box 
      className="relatorio-container" 
      bg="white" 
      p={0}
      m={0}
      sx={{
        '@media print': {
          bg: 'white',
          m: '0 !important',
          p: '0 !important',
          '& > *': {
            m: '0 !important',
            p: '0 !important'
          },
          breakAfter: 'avoid !important',
          pageBreakAfter: 'avoid !important'
        }
      }}
    >
      <VStack 
        spacing={0} 
        m={0}
        p={0}
        className="paginas"
        sx={{
          '@media screen': {
            '& > *:not(:last-child)': {
              mb: '2rem'
            }
          },
          '@media print': {
            m: '0 !important',
            p: '0 !important',
            '& > *': {
              m: '0 !important',
              p: '0 !important'
            }
          }
        }}
      >
        {/* Primeira Página - Disponibilidade e Eficiência */}
        {(processedData.disponibilidade_mecanica.length > 0 || processedData.eficiencia_energetica.length > 0) && (
          <A4Colheita>
            <Box h="100%" display="flex" flexDirection="column">
              <PageHeader />
              <Box flex="1" display="flex" flexDirection="column">
                {/* Disponibilidade Mecânica */}
                {secoes.disponibilidadeMecanica && (
                  <Box flex="1" mb={2}>
                    <SectionTitle title="Disponibilidade Mecânica" />
                    <Box 
                      border="1px solid"
                      borderColor="black"
                      borderRadius="md"
                      p={2}
                      h="calc(100% - 30px)"
                      overflow="hidden"
                    >
                      <GraficoDisponibilidadeMecanicaTransbordo
                        data={processedData.disponibilidade_mecanica}
                        meta={configManager.getMetas('transbordo_diario').disponibilidadeMecanica}
                      />
                    </Box>
                  </Box>
                )}
                
                {/* Eficiência Energética */}
                {secoes.eficienciaEnergetica && (
                  <Box flex="1">
                    <SectionTitle title="Eficiência Energética" />
                    <Box 
                      border="1px solid"
                      borderColor="black"
                      borderRadius="md"
                      p={2}
                      h="calc(100% - 30px)"
                      overflow="hidden"
                    >
                      <GraficoEficienciaEnergetica 
                        data={processedData.eficiencia_energetica}
                        meta={configManager.getMetas('transbordo_diario').eficienciaEnergetica}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </A4Colheita>
        )}
              
        {/* Segunda Página - Motor Ocioso e Falta Apontamento */}
        {(processedData.motor_ocioso.length > 0 || processedData.falta_apontamento.length > 0) && (
          <A4Colheita>
            <Box h="100%" display="flex" flexDirection="column">
              <PageHeader />
              <Box flex="1" display="flex" flexDirection="column">
                {/* Motor Ocioso */}
                {secoes.motorOcioso && (
                  <Box flex="1" mb={2}>
                    <SectionTitle title="Motor Ocioso" />
                    <Box 
                      border="1px solid"
                      borderColor="black"
                      borderRadius="md"
                      p={2}
                      h="calc(100% - 30px)"
                      overflow="hidden"
                    >
                      <GraficoMotorOciosoTransbordo
                        data={processedData.motor_ocioso}
                        meta={configManager.getMetas('transbordo_diario').motorOcioso}
                      />
                    </Box>
                  </Box>
                )}

                {/* Falta de Apontamento */}
                {secoes.faltaApontamento && (
                  <Box flex="1">
                    <SectionTitle title="Falta de Apontamento" />
                    <Box 
                      border="1px solid"
                      borderColor="black"
                      borderRadius="md"
                      p={2}
                      h="calc(100% - 30px)"
                      overflow="hidden"
                    >
                      <GraficoFaltaApontamentoTransbordo
                        data={processedData.falta_apontamento}
                        meta={configManager.getMetas('transbordo_diario').faltaApontamento}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </A4Colheita>
        )}
              
        {/* Terceira Página - Uso GPS */}
        {secoes.usoGPS && (
          <A4Colheita>
            <Box h="100%" display="flex" flexDirection="column">
              <PageHeader />
              <Box flex="1" display="flex" flexDirection="column">
                {/* Uso GPS */}
                <Box flex="1">
                  <SectionTitle title="Uso GPS" />
                  <Box 
                    border="1px solid"
                    borderColor="black"
                    borderRadius="md"
                    p={2}
                    h="calc(100% - 30px)"
                    overflow="hidden"
                  >
                    <GraficoUsoGPS 
                      data={processedData.uso_gps}
                      meta={configManager.getMetas('transbordo_diario').usoGPS}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </A4Colheita>
        )}
        
        {/* Quarta Página - Resumo */}
        <A4Colheita isLastPage={true}>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader />
            <Box flex="1" display="flex" flexDirection="column" p={3}>
              <Heading
                as="h1"
                size="sm"
                textAlign="center"
                mb={2}
                color="black"
                fontWeight="bold"
                fontSize="15px"
              >
                Resumo do Relatório de Transbordo Diário
              </Heading>

              {/* Seção Frotas */}
              {processedData.disponibilidade_mecanica.length > 0 && (
                <Box mb={2}>
                  <Text fontSize="13px" fontWeight="bold" color="black" mb={1} textAlign="center">
                    Frotas
                  </Text>
                  <SimpleGrid columns={2} spacing={3} w="100%" mb={2}>
                    <IndicatorCard
                      title="Disponibilidade Mecânica"
                      value={calcularIndicador(processedData.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_diario').disponibilidadeMecanica).valor}
                      meta={configManager.getMetas('transbordo_diario').disponibilidadeMecanica}
                      unitType="porcentagem"
                      acimaMeta={calcularIndicador(processedData.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_diario').disponibilidadeMecanica).acimaMeta}
                    />
                  </SimpleGrid>
                </Box>
              )}

              {/* Seção Operadores */}
              {(processedData.eficiencia_energetica.length > 0 || processedData.motor_ocioso.length > 0 || processedData.falta_apontamento.length > 0) && (
                <Box>
                  <Text fontSize="13px" fontWeight="bold" color="black" mb={1} textAlign="center">
                    Operadores
                  </Text>
                  <SimpleGrid columns={2} spacing={3} w="100%" mb={2}>
                    {processedData.eficiencia_energetica.length > 0 && secoes.eficienciaEnergetica && (
                      <IndicatorCard
                        title="Eficiência Energética"
                        value={calcularIndicador(processedData.eficiencia_energetica, 'eficiencia', configManager.getMetas('transbordo_diario').eficienciaEnergetica).valor}
                        meta={configManager.getMetas('transbordo_diario').eficienciaEnergetica}
                        unitType="porcentagem"
                        acimaMeta={calcularIndicador(processedData.eficiencia_energetica, 'eficiencia', configManager.getMetas('transbordo_diario').eficienciaEnergetica).acimaMeta}
                      />
                    )}
                    {processedData.motor_ocioso.length > 0 && secoes.motorOcioso && (
                      <IndicatorCard
                        title="Motor Ocioso"
                        value={calcularIndicador(processedData.motor_ocioso, 'percentual', configManager.getMetas('transbordo_diario').motorOcioso, true).valor}
                        meta={configManager.getMetas('transbordo_diario').motorOcioso}
                        unitType="porcentagem"
                        isInverted={true}
                        acimaMeta={calcularIndicador(processedData.motor_ocioso, 'percentual', configManager.getMetas('transbordo_diario').motorOcioso, true).acimaMeta}
                      />
                    )}
                    {processedData.falta_apontamento.length > 0 && secoes.faltaApontamento && (
                      <IndicatorCard
                        title="Falta Apontamento"
                        value={calcularIndicador(processedData.falta_apontamento, 'percentual', configManager.getMetas('transbordo_diario').faltaApontamento, true).valor}
                        meta={configManager.getMetas('transbordo_diario').faltaApontamento}
                        unitType="porcentagem"
                        isInverted={true}
                        acimaMeta={calcularIndicador(processedData.falta_apontamento, 'percentual', configManager.getMetas('transbordo_diario').faltaApontamento, true).acimaMeta}
                      />
                    )}
                  </SimpleGrid>

                  {/* Tabela de Operadores */}
                  <Box>
                    <TabelaOperadores 
                      dados={processedData} 
                      tipo="transbordo_diario" 
                      mostrarUsoGPS={secoes.usoGPS}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </A4Colheita>
      </VStack>
    </Box>
  );
} 