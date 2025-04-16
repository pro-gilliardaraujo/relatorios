'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid, Center, Spinner, Button, Switch, FormControl, FormLabel, Grid } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';
import { GraficoDisponibilidadeMecanicaTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoDisponibilidadeMecanicaTransbordo';
import { GraficoEficienciaEnergetica } from '@/components/Charts/Transbordo/Diario/GraficoEficienciaEnergetica';
import { GraficoMotorOciosoTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoMotorOciosoTransbordo';
import { GraficoMotorOciosoProgresso } from '@/components/Charts/Transbordo/Diario/GraficoMotorOciosoProgresso';
import { GraficoUsoGPS } from '@/components/Charts/Transbordo/Diario/GraficoUsoGPS';
import { GraficoFaltaApontamentoTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoFaltaApontamentoTransbordo';
import { GraficoMotorOciosoEmpilhado } from '@/components/Charts/Transbordo/Diario/GraficoMotorOciosoEmpilhado';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaPrint } from 'react-icons/fa';
import { configManager } from '@/utils/config';
import RelatorioColheitaDiarioResumo from '@/components/RelatorioColheitaDiarioResumo';
import IndicatorCard from '@/components/IndicatorCard';
import TabelaOperadores from '@/components/TabelaOperadores';
import TabelaFrotas from '@/components/TabelaFrotas';
import HorasPorFrotaFooter from '@/components/HorasPorFrotaFooter';
import { Column as AntColumn } from '@ant-design/plots';
import type { ColumnConfig } from '@ant-design/plots';
import type { Chart } from '@antv/g2';
import { GraficoMediaVelocidadeTransbordo } from '@/components/Charts/Transbordo/Diario/GraficoMediaVelocidadeTransbordo';

// Dados de exemplo para visualização offline
const exemplosDados: DadosProcessados = {
  disponibilidade_mecanica: [
    { frota: '6031', disponibilidade: 89.00 },
    { frota: '6082', disponibilidade: 99.23 },
    { frota: '6087', disponibilidade: 98.61 },
    { frota: '6096', disponibilidade: 79.34 },
    { frota: '0', disponibilidade: 10.00 }
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
  ],
  media_velocidade: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', velocidade: 35.5 },
    { id: '2', nome: 'TROCA DE TURNO', velocidade: 0.0 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', velocidade: 42.8 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', velocidade: 38.2 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', velocidade: 45.6 },
    { id: '6', nome: 'JOSE HUMBERTO DE OLIVEIRA', velocidade: 33.9 },
    { id: '7', nome: 'VITOR SOARES FREITAS', velocidade: 40.1 },
    { id: '8', nome: 'DANILO JESUS BRITO', velocidade: 37.4 }
  ]
};

interface TransbordoA4Props {
  data?: any;
}

interface MotorOciosoData {
  id: string;
  nome: string;
  percentual: number;
  tempoLigado?: number;
  tempoOcioso?: number;
}

interface MediaVelocidadeData {
  id: string;
  nome: string;
  velocidade: number;
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
    tempoTotal?: number;
    tempoOcioso?: number;
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
  media_velocidade: Array<{
    id: string;
    nome: string;
    velocidade: number;
  }>;
}

interface HorasPorFrota {
  frota: string;
  horasRegistradas: number;
  diferencaPara24h: number;
}

interface DadosMotorOcioso {
  id: string;
  nome: string;
  percentual: string;
  horasTotal?: number;
}

interface DadosMotorOciosoProcessado {
  id: string;
  nome: string;
  percentual: number;
  tempoTotal: number;
  tempoOcioso: number;
}

interface DadosFaltaApontamento {
  id: string;
  nome: string;
  percentual: string;
  horasTotal?: number;
}

interface DadosFaltaApontamentoProcessado {
  id: string;
  nome: string;
  percentual: number;
  tempoTotal: number;
  tempoSemApontamento: number;
}

interface DadosParadaOperacional {
  id: string;
  nome: string;
  percentual: string;
  horasTotal?: number;
}

interface DadosParadaOperacionalProcessado {
  id: string;
  nome: string;
  percentual: number;
  tempoTotal: number;
  tempoParado: number;
}

interface DadosGPS {
  id: string;
  nome: string;
  percentual: string;
  horasTotal?: number;
}

interface DadosGPSProcessado {
  id: string;
  nome: string;
  percentual: number;
  tempoTotal: number;
  tempoSemGPS: number;
}

interface DadosVelocidade {
  id: string;
  nome: string;
  porcentagem: string;
  horasTotal?: number;
}

interface DadosVelocidadeProcessado {
  id: string;
  nome: string;
  porcentagem: number;
  tempoTotal: number;
  tempoExcedido: number;
}

// Interfaces para tipagem dos dados
interface OperadorEficiencia {
  id: string;
  nome: string;
  eficiencia: number;
}

interface OperadorMotorOcioso {
  id: string;
  nome: string;
  percentual: number;
  tempoTotal: number;
  tempoOcioso: number;
}

interface OperadorFaltaApontamento {
  id: string;
  nome: string;
  percentual: number;
  horasTotal?: number;
}

interface OperadorUsoGPS {
  id: string;
  nome: string;
  porcentagem: number;
}

interface OperadorVelocidade {
  id: string;
  nome: string;
  velocidade: number;
}

interface RawDataItem {
  operador: string;
  frota: string;
  tdh: string | number;
  diesel: string | number;
  velocidade: string | number;
  media_velocidade: string | number;
  impureza_vegetal: string | number;
  impureza_mineral: string | number;
  perdas_invisiveis: string | number;
  perdas_visiveis: string | number;
  perdas_totais: string | number;
  densidade: string | number;
  data_hora: string;
}

interface ProcessedData {
  operador: string;
  frota: string;
  tdh: number;
  diesel: number;
  velocidade: number;
  media_velocidade: number;
  impureza_vegetal: number;
  impureza_mineral: number;
  perdas_invisiveis: number;
  perdas_visiveis: number;
  perdas_totais: number;
  densidade: number;
  data_hora: string;
}

interface GraficoProps {
  data: ProcessedData[];
  xField: keyof ProcessedData;
  yField: keyof ProcessedData;
  seriesField?: keyof ProcessedData;
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

// Adicione esta função utilitária para calcular o tempo total e ocioso
const calcularTempoTotalEOcioso = (dadosMotorOcioso: Array<{percentual: number}>) => {
  // Valores padrão caso não haja dados
  if (!dadosMotorOcioso || dadosMotorOcioso.length === 0) {
    return {
      tempoTotal: 24, // Assumindo 24 horas por dia
      tempoOcioso: 0,
      meta: 6 // Meta padrão de 6%
    };
  }
  
  // Calcula o tempo total (assumindo que o total é igual para todos os operadores)
  // Em um sistema real, isso viria dos dados precisos
  const tempoTotal = 24; // Horas por dia
  
  // Calcular média de percentual ocioso e converter para horas
  const percentualMedioOcioso = dadosMotorOcioso.reduce((acc, item) => acc + item.percentual, 0) / dadosMotorOcioso.length;
  const tempoOcioso = (percentualMedioOcioso / 100) * tempoTotal;
  
  return {
    tempoTotal,
    tempoOcioso,
    meta: configManager.getMetas('transbordo_diario').motorOcioso || 6 // Meta padrão de 6%
  };
};

function processarDados(dados: RawDataItem[]): ProcessedData[] {
  return dados.map((item: RawDataItem): ProcessedData => ({
    operador: item.operador,
    frota: item.frota,
    tdh: Number(item.tdh) || 0,
    diesel: Number(item.diesel) || 0,
    velocidade: Number(item.velocidade) || 0,
    media_velocidade: Number(item.media_velocidade) || 0,
    impureza_vegetal: Number(item.impureza_vegetal) || 0,
    impureza_mineral: Number(item.impureza_mineral) || 0,
    perdas_invisiveis: Number(item.perdas_invisiveis) || 0,
    perdas_visiveis: Number(item.perdas_visiveis) || 0,
    perdas_totais: Number(item.perdas_totais) || 0,
    densidade: Number(item.densidade) || 0,
    data_hora: item.data_hora
  }));
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
        
        // Função para buscar dados do relatório
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
            setNomeFrente(reportData.frente || '');
            setLoading(false);
            
            // SEMPRE usar dados reais quando temos um ID
            if (reportId) {
              setUseExampleData(false);
            }
          } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
            setError('Erro ao buscar dados. Por favor, tente novamente.');
            setLoading(false);
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
    // Usar apenas reportId como dependência para evitar recálculos
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
  const calcularMedia = (dados: ProcessedData[], propriedade: keyof ProcessedData): number => {
    const itensValidos = dados.filter((item: ProcessedData) => {
      const valor = item[propriedade];
      return Boolean(item.operador) && typeof valor === 'number' && !isNaN(valor);
    });

    if (itensValidos.length === 0) return 0;

    const soma = itensValidos.reduce((acc: number, item: ProcessedData) => {
      const valor = item[propriedade];
      return acc + (typeof valor === 'number' ? valor : 0);
    }, 0);

    return Number((soma / itensValidos.length).toFixed(2));
  };

  const calcularTotal = (dados: ProcessedData[], propriedade: keyof ProcessedData): number => {
    const itensValidos = dados.filter((item: ProcessedData) => {
      const valor = item[propriedade];
      return Boolean(item.operador) && typeof valor === 'number' && !isNaN(valor);
    });

    return itensValidos.reduce((acc: number, item: ProcessedData) => {
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
        (!item.nome || (item.nome !== 'TROCA DE TURNO' && item.nome !== 'SEM OPERADOR')));
      
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
      const itensMeta = itensValidos.filter((item) => {
        const valor = item[propriedade];
        // Para indicadores invertidos (como motor ocioso e velocidade), menor é melhor
        if (isInverted) {
          return valor <= meta;
        }
        // Para indicadores normais, maior é melhor
        return valor >= meta;
      });
      
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
        .filter((item: { frota: string }) => item && item.frota && item.frota !== '0')
        .map((item: { frota: string; disponibilidade: number; horasTotal?: number }) => {
          // Remover qualquer decimal do número da frota
          const frotaStr = String(item.frota).trim();
          const frotaFormatada = frotaStr.includes('.') ? frotaStr.split('.')[0] : frotaStr;
          
          return {
            frota: frotaFormatada,
            disponibilidade: Number(Number(item.disponibilidade).toFixed(2)),
            horasTotal: item.horasTotal || 24 // Adicionar horasTotal
          };
        }),
      eficiencia_energetica: (dados.eficiencia_energetica || [])
        .filter((item: { nome: string }) => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map((item: { id: string; nome: string; eficiencia: number; horasTotal?: number }) => ({
          id: item.id,
          nome: item.nome,
          eficiencia: Number(Number(item.eficiencia).toFixed(2)),
          horasTotal: item.horasTotal || 24 // Adicionar horasTotal
        })),
      motor_ocioso: (dados.motor_ocioso || [] as DadosMotorOcioso[])
        .filter((item: DadosMotorOcioso) => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map((item: DadosMotorOcioso) => ({
          id: item.id,
          nome: item.nome,
          percentual: Number(Number(item.percentual).toFixed(2)),
          tempoTotal: Number(item.horasTotal || 24),
          tempoOcioso: Number(((item.horasTotal || 24) * (Number(item.percentual) / 100)).toFixed(2))
        }))
        .sort((a: DadosMotorOciosoProcessado, b: DadosMotorOciosoProcessado) => b.percentual - a.percentual),
      falta_apontamento: (dados.falta_apontamento || [] as DadosFaltaApontamento[])
        .filter((item: DadosFaltaApontamento) => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map((item: DadosFaltaApontamento) => ({
          id: item.id,
          nome: item.nome,
          percentual: Number(Number(item.percentual).toFixed(2)),
          tempoTotal: Number(item.horasTotal || 24),
          tempoSemApontamento: Number(((item.horasTotal || 24) * (Number(item.percentual) / 100)).toFixed(2))
        }))
        .sort((a: DadosFaltaApontamentoProcessado, b: DadosFaltaApontamentoProcessado) => b.percentual - a.percentual),
      uso_gps: (dados.uso_gps || dados.gps || [] as DadosGPS[])
        .filter((item: DadosGPS) => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map((item: DadosGPS) => ({
          id: item.id,
          nome: item.nome,
          percentual: Number(Number(item.percentual).toFixed(2)),
          tempoTotal: Number(item.horasTotal || 24),
          tempoSemGPS: Number(((item.horasTotal || 24) * (Number(item.percentual) / 100)).toFixed(2))
        }))
        .sort((a: DadosGPSProcessado, b: DadosGPSProcessado) => b.percentual - a.percentual),
      velocidade: (dados.velocidade || [] as DadosVelocidade[])
        .filter((item: DadosVelocidade) => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map((item: DadosVelocidade) => ({
          id: item.id,
          nome: item.nome,
          porcentagem: Number(Number(item.porcentagem).toFixed(2)),
          tempoTotal: Number(item.horasTotal || 24),
          tempoExcedido: Number(((item.horasTotal || 24) * (Number(item.porcentagem) / 100)).toFixed(2))
        }))
        .sort((a: DadosVelocidadeProcessado, b: DadosVelocidadeProcessado) => b.porcentagem - a.porcentagem),
      parada_operacional: (dados.parada_operacional || [] as DadosParadaOperacional[])
        .filter((item: DadosParadaOperacional) => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map((item: DadosParadaOperacional) => ({
          id: item.id,
          nome: item.nome,
          percentual: Number(Number(item.percentual).toFixed(2)),
          tempoTotal: Number(item.horasTotal || 24),
          tempoParado: Number(((item.horasTotal || 24) * (Number(item.percentual) / 100)).toFixed(2))
        }))
        .sort((a: DadosParadaOperacionalProcessado, b: DadosParadaOperacionalProcessado) => b.percentual - a.percentual),
      media_velocidade: (dados.media_velocidade || [])
        .filter((item: any) => item && item.nome && !['0', 'TROCA DE TURNO'].includes(item.nome))
        .map((item: any) => ({
          id: item.id,
          nome: item.nome,
          velocidade: Number(Number(item.velocidade).toFixed(2)),
          tempoTotal: Number(item.horasTotal || 24),
          tempoExcedido: Number(((item.horasTotal || 24) * (Number(item.velocidade) / 100)).toFixed(2))
        }))
        .sort((a: any, b: any) => b.velocidade - a.velocidade)
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
      usoGPS: false,  // Para transbordo, o padrão para Uso GPS é false
      mediaVelocidade: true
    };
    
    // console.log('🔧 Configuração de seções para', tipoRelatorio, ':', configSections);
    return configSections;
  }, [reportData?.metadata?.type]);

  // Preparar dados para o footer de HorasPorFrota
  const dadosHorasPorFrota = useMemo(() => {
    if (!reportData?.dados?.horas_por_frota) return [];
    
    return reportData.dados.horas_por_frota
      .filter((item: any) => item && item.frota && item.frota.trim() !== '')
      .map((item: any) => ({
        frota: item.frota,
        horasRegistradas: Number(item.horasRegistradas || 0),
        diferencaPara24h: Number(item.diferencaPara24h || 0)
      }));
  }, [reportData]);

  const finalDataMotorOcioso = useMemo(() => {
    if (!reportData?.dados?.motor_ocioso) return [];
    return reportData.dados.motor_ocioso.map((item: MotorOciosoData) => ({
      id: item.id,
      nome: item.nome,
      percentual: item.percentual,
      tempoLigado: item.tempoLigado || 0,
      tempoOcioso: item.tempoOcioso || 0
    }));
  }, [reportData?.dados?.motor_ocioso]);

  const finalDataMediaVelocidade = useMemo(() => {
    if (!reportData?.dados?.media_velocidade) return [];
    return reportData.dados.media_velocidade.map((item: MediaVelocidadeData) => ({
      id: item.id,
      nome: item.nome,
      velocidade: item.velocidade
    }));
  }, [reportData?.dados?.media_velocidade]);

  const finalDataFaltaApontamento = useMemo(() => {
    if (!reportData?.dados?.falta_apontamento) return [];
    return reportData.dados.falta_apontamento.map((item: any) => ({
      id: item.id,
      nome: item.nome,
      percentual: item.percentual
    }));
  }, [reportData?.dados?.falta_apontamento]);

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
    <Box>
      {/* Conteúdo do relatório */}
      <Box className="report-content">
        {/* Página 1 - Disponibilidade Mecânica e Eficiência Energética */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* Disponibilidade Mecânica */}
              {secoes.disponibilidadeMecanica && (
                <Box flex="1" mb={3}>
                  <SectionTitle title="Disponibilidade Mecânica" centered={true} />
                  <Box 
                    border="1px solid"
                    borderColor="black"
                    borderRadius="md"
                    p={2}
                    h="calc(100% - 25px)"
                  >
                    {processedData.disponibilidade_mecanica.length > 0 ? (
                      <GraficoDisponibilidadeMecanicaTransbordo 
                        data={processedData.disponibilidade_mecanica} 
                        meta={configManager.getMetas('transbordo_diario').disponibilidadeMecanica} 
                      />
                    ) : (
                      <Center h="100%">
                        <Text>Sem dados de disponibilidade mecânica</Text>
                      </Center>
                    )}
                  </Box>
                </Box>
              )}
              
              {/* Eficiência Energética */}
              {secoes.eficienciaEnergetica && (
                <Box flex="1">
                  <SectionTitle title="Eficiência Energética" centered={true} />
                  <Box 
                    border="1px solid"
                    borderColor="black"
                    borderRadius="md"
                    p={2}
                    h="calc(100% - 25px)"
                  >
                    {processedData.eficiencia_energetica.length > 0 ? (
                      <GraficoEficienciaEnergetica 
                        data={processedData.eficiencia_energetica} 
                        meta={configManager.getMetas('transbordo_diario').eficienciaEnergetica} 
                      />
                    ) : (
                      <Center h="100%">
                        <Text>Sem dados de eficiência energética</Text>
                      </Center>
                    )}
                  </Box>
                </Box>
              )}
            </Flex>
          </Box>
        </A4Colheita>
        
        {/* Página 2 - Motor Ocioso */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* Motor Ocioso */}
              {secoes.motorOcioso && (
                <Box flex="1">
                  <SectionTitle title="Motor Ocioso" centered={true} />
                  <Box 
                    border="1px solid"
                    borderColor="black"
                    borderRadius="md"
                    p={2}
                    h="calc(100% - 25px)"
                  >
                    {finalDataMotorOcioso.length > 0 ? (
                      <GraficoMotorOciosoTransbordo 
                        data={finalDataMotorOcioso} 
                        meta={configManager.getMetas('transbordo_diario').motorOcioso} 
                      />
                    ) : (
                      <Center h="100%">
                        <Text>Sem dados de motor ocioso</Text>
                      </Center>
                    )}
                  </Box>
                </Box>
              )}
            </Flex>
          </Box>
        </A4Colheita>
        
        {/* Página 3 - Falta de Apontamento e Média de Velocidade */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* Falta de Apontamento */}
              {secoes.faltaApontamento && (
                <Box flex="1" mb={3}>
                  <SectionTitle title="Falta de Apontamento" centered={true} />
                  <Box 
                    border="1px solid"
                    borderColor="black"
                    borderRadius="md"
                    p={2}
                    h="calc(100% - 25px)"
                  >
                    {finalDataFaltaApontamento.length > 0 ? (
                      <GraficoFaltaApontamentoTransbordo 
                        data={finalDataFaltaApontamento} 
                        meta={configManager.getMetas('transbordo_diario').faltaApontamento} 
                      />
                    ) : (
                      <Center h="100%">
                        <Text>Sem dados de falta de apontamento</Text>
                      </Center>
                    )}
                  </Box>
                </Box>
              )}

              {/* Média de Velocidade */}
              {secoes.mediaVelocidade && (
                <Box flex="1">
                  <SectionTitle title="Média de Velocidade" centered={true} />
                  <Box 
                    border="1px solid"
                    borderColor="black"
                    borderRadius="md"
                    p={2}
                    h="calc(100% - 25px)"
                  >
                    {finalDataMediaVelocidade.length > 0 ? (
                      <GraficoMediaVelocidadeTransbordo 
                        data={finalDataMediaVelocidade} 
                        meta={15} 
                      />
                    ) : (
                      <Center h="100%">
                        <Text>Sem dados de média de velocidade</Text>
                      </Center>
                    )}
                  </Box>
                </Box>
              )}
            </Flex>
          </Box>
        </A4Colheita>
        
        {/* Página 4 - Resumo Geral */}
        <A4Colheita 
          isLastPage={true} 
          footer={
            dadosHorasPorFrota && dadosHorasPorFrota.length > 0 ? 
            <HorasPorFrotaFooter dados={dadosHorasPorFrota} /> : 
            null
          }
        >
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader />
            
            <Box p={4} flex="1">
              {/* Título Principal do Resumo */}
              <Heading
                as="h1"
                size="sm"
                textAlign="center"
                mb={4}
                color="black"
                fontWeight="bold"
                fontSize="15px"
              >
                Resumo do Relatório de Transbordo Diário
              </Heading>

              {/* Seção Frotas */}
              <Box mb={6}>
                <SectionTitle title="Frotas" centered={true} />
                
                {/* Cards de indicadores de frotas */}
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  {/* Garantir que os dados de disponibilidade mecânica são sempre exibidos */}
                  <IndicatorCard 
                    title="Disponibilidade Mecânica"
                    value={calcularIndicador(processedData.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_diario').disponibilidadeMecanica).valor}
                    meta={configManager.getMetas('transbordo_diario').disponibilidadeMecanica}
                    unitType="porcentagem"
                    acimaMeta={calcularIndicador(processedData.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_diario').disponibilidadeMecanica).acimaMeta}
                  />
                </SimpleGrid>
              </Box>

              {/* Seção Operadores */}
              <Box>
                <SectionTitle title="Operadores" centered={true} />
                
                {/* Cards de indicadores de operadores */}
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  {/* Garantir que os dados de eficiência são renderizados mesmo se a média calculada for zero */}
                  <IndicatorCard 
                    title="Eficiência Energética"
                    value={calcularIndicador(processedData.eficiencia_energetica, 'eficiencia', configManager.getMetas('transbordo_diario').eficienciaEnergetica).valor}
                    meta={configManager.getMetas('transbordo_diario').eficienciaEnergetica}
                    unitType="porcentagem"
                    acimaMeta={calcularIndicador(processedData.eficiencia_energetica, 'eficiencia', configManager.getMetas('transbordo_diario').eficienciaEnergetica).acimaMeta}
                  />
                  
                  {/* Garantir que os dados de motor ocioso são renderizados mesmo se a média calculada for zero */}
                  <IndicatorCard 
                    title="Motor Ocioso"
                    value={calcularIndicador(processedData.motor_ocioso, 'percentual', configManager.getMetas('transbordo_diario').motorOcioso, true).valor}
                    meta={configManager.getMetas('transbordo_diario').motorOcioso}
                    isInverted={true}
                    unitType="porcentagem"
                    acimaMeta={calcularIndicador(processedData.motor_ocioso, 'percentual', configManager.getMetas('transbordo_diario').motorOcioso, true).acimaMeta}
                  />
                  
                  {/* Garantir que os dados de falta de apontamento são renderizados mesmo se a média calculada for zero */}
                  <IndicatorCard 
                    title="Falta de Apontamento"
                    value={calcularIndicador(processedData.falta_apontamento, 'percentual', configManager.getMetas('transbordo_diario').faltaApontamento, true).valor}
                    meta={configManager.getMetas('transbordo_diario').faltaApontamento}
                    isInverted={true}
                    unitType="porcentagem"
                    acimaMeta={calcularIndicador(processedData.falta_apontamento, 'percentual', configManager.getMetas('transbordo_diario').faltaApontamento, true).acimaMeta}
                  />
                  
                  {/* Garantir que os dados de uso GPS são renderizados mesmo se a média calculada for zero */}
                  <IndicatorCard 
                    title="Uso GPS"
                    value={calcularIndicador(processedData.uso_gps, 'porcentagem', configManager.getMetas('transbordo_diario').usoGPS).valor}
                    meta={configManager.getMetas('transbordo_diario').usoGPS}
                    unitType="porcentagem"
                    acimaMeta={calcularIndicador(processedData.uso_gps, 'porcentagem', configManager.getMetas('transbordo_diario').usoGPS).acimaMeta}
                  />
                  
                  {/* Novo card para Média de Velocidade */}
                  <IndicatorCard 
                    title="Média de Velocidade"
                    value={calcularIndicador(processedData.media_velocidade, 'velocidade', 15, true).valor}
                    meta={15}
                    unitType="velocidade"
                    isInverted={true}
                    acimaMeta={(() => {
                      const meta = 15;
                      const quantidade = processedData.media_velocidade.filter((item: OperadorVelocidade) => item.velocidade <= meta).length;
                      const total = processedData.media_velocidade.length;
                      return {
                        quantidade,
                        total,
                        percentual: total > 0 ? (quantidade / total) * 100 : 0
                      };
                    })()}
                  />
                </SimpleGrid>

                {/* Tabela de operadores */}
                <TabelaOperadores 
                  dados={{
                    eficiencia_energetica: processedData.eficiencia_energetica.map((item: OperadorEficiencia) => ({
                      id: item.id,
                      nome: item.nome,
                      eficiencia: item.eficiencia
                    })),
                    motor_ocioso: processedData.motor_ocioso.map((item: OperadorMotorOcioso) => ({
                      id: item.id || '',
                      nome: item.nome || '',
                      percentual: item.percentual || 0,
                      tempoLigado: item.tempoTotal || 0,
                      tempoOcioso: item.tempoOcioso || 0
                    })),
                    falta_apontamento: processedData.falta_apontamento.map((item: OperadorFaltaApontamento) => ({
                      id: item.id,
                      nome: item.nome,
                      percentual: item.percentual
                    })),
                    uso_gps: processedData.uso_gps.map((item: OperadorUsoGPS) => ({
                      id: item.id || '',
                      nome: item.nome || '',
                      porcentagem: item.porcentagem || 0
                    })),
                    media_velocidade: processedData.media_velocidade.map((item: OperadorVelocidade) => ({
                      id: item.id || '',
                      nome: item.nome || '',
                      velocidade: item.velocidade || 0
                    }))
                  }}
                  tipo="transbordo_diario"
                  mostrarUsoGPS={false}
                />
              </Box>
            </Box>
          </Box>
        </A4Colheita>
      </Box>
    </Box>
  );
} 