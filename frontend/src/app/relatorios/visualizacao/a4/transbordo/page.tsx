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
const dadosExemplo: DadosProcessados = {
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

// Função utilitária para verificar formato de dados
const verificarFormatoDados = (dados: any) => {
  if (!dados) return false;
  
  const temDisponibilidade = Array.isArray(dados.disponibilidade_mecanica) && 
    dados.disponibilidade_mecanica.length > 0 &&
    dados.disponibilidade_mecanica.some((item: any) => item && item.frota && item.disponibilidade !== undefined);
  
  const temEficiencia = Array.isArray(dados.eficiencia_energetica) && 
    dados.eficiencia_energetica.length > 0 &&
    dados.eficiencia_energetica.some((item: any) => item && item.nome && item.eficiencia !== undefined);
  
  const temMotorOcioso = Array.isArray(dados.motor_ocioso) && 
    dados.motor_ocioso.length > 0 &&
    dados.motor_ocioso.some((item: any) => item && item.nome && item.percentual !== undefined);
  
  const temFaltaApontamento = Array.isArray(dados.falta_apontamento) && 
    dados.falta_apontamento.length > 0 &&
    dados.falta_apontamento.some((item: any) => item && item.nome && item.percentual !== undefined);
  
  const temUsoGPS = Array.isArray(dados.uso_gps) && 
    dados.uso_gps.length > 0 &&
    dados.uso_gps.some((item: any) => item && item.nome && item.porcentagem !== undefined);
  
  // Verificar se pelo menos uma das seções tem dados
  return temDisponibilidade || temEficiencia || temMotorOcioso || temFaltaApontamento || temUsoGPS;
};

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
        console.log("🔄 Buscando relatório:", searchParams);
        
        const reportId = searchParams.get('id');
        console.log("📊 ID do relatório:", reportId);
        
        if (!reportId) {
          console.log("⚠️ ID do relatório não fornecido, usando dados de exemplo");
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
            
            console.log("🔍 DADOS BRUTOS DO RELATÓRIO:", JSON.stringify(reportData, null, 2));
            
            // Exibir estrutura da árvore de dados para debug
            console.log("📋 ESTRUTURA DE DADOS:");
            console.log("- id:", reportData.id);
            console.log("- tipo:", reportData.tipo);
            console.log("- data:", reportData.data);
            console.log("- frente:", reportData.frente);
            
            if (reportData.dados) {
              console.log("- dados: ✓ Presente");
              Object.keys(reportData.dados).forEach(key => {
                const items = reportData.dados[key];
                console.log(`  - ${key}: ${Array.isArray(items) ? items.length + ' itens' : 'não é array'}`);
                
                // Mostrar primeiro item de cada categoria, se disponível
                if (Array.isArray(items) && items.length > 0) {
                  console.log(`    Exemplo: ${JSON.stringify(items[0])}`);
                }
              });
            } else {
              console.log("- dados: ❌ Ausente");
            }
            
            // Definir dados do relatório
            setReportData(reportData);
            
            // NOVA ABORDAGEM: Se temos dados, usar eles sempre (sem validação complexa)
            if (reportData && reportData.dados) {
              console.log("✅ Dados encontrados, usando dados reais do Excel");
              setUseExampleData(false);
            } else {
              console.log("❌ Dados ausentes, usando exemplo");
              setUseExampleData(true);
            }
            
            // Assinatura para atualizações em tempo real
            const subscription = supabase
              .channel('report_updates')
              .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'relatorios_diarios',
                filter: `id=eq.${reportId}`,
              }, (payload) => {
                console.log('Relatório atualizado:', payload);
                setReportData(payload.new as any);
              })
              .subscribe();
            
            return () => {
              subscription.unsubscribe();
            };
          } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
            setUseExampleData(true);
            return null;
          }
        };
        
        await fetchReportData();
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setUseExampleData(true);
        setLoading(false);
      }
    };
    
    loadData();
  }, [searchParams]);

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
    console.log(`📊 Calculando média para propriedade "${propriedade}" com ${array.length} itens`, 
      array.map(item => ({
        id: item.frota || item.nome || 'desconhecido',
        valor: item[propriedade]
      }))
    );
    
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
    console.log(`📊 Itens filtrados para média de "${propriedade}":`, itensFiltrados.length);
    
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
    valores.forEach((valor, index) => {
      console.log(`📊 Valor[${index}] para média de "${propriedade}": ${valor} (${typeof valor})`);
    });
    
    // Calculando a soma manualmente para garantir precisão com números pequenos
    let soma = 0;
    for (let i = 0; i < valores.length; i++) {
      soma += valores[i];
    }
    
    // Calcular média com alta precisão
    const media = soma / valores.length;
    
    // Log para depuração da soma e média calculada
    console.log(`📊 Soma para "${propriedade}": ${soma}, Itens: ${valores.length}, Média: ${media}`);
    
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
      // Filtrar itens válidos e remover 'TROCA DE TURNO' e 'SEM OPERADOR'
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
      
      // Contar quantos itens estão acima da meta
      const itensMeta = isInverted
        ? itensValidos.filter((item) => item[propriedade] <= meta)
        : itensValidos.filter((item) => item[propriedade] >= meta);
      
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
      console.error(`❌ Erro ao calcular indicador ${propriedade}:`, error);
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

  // Dados processados para os gráficos
  const dados = useMemo(() => {
    try {
      console.log("⚙️ Processando dados do relatório...");
      
      // Se não há dados ou estamos usando exemplo, retornar dados de exemplo
      if (!reportData?.dados) {
        console.log("❌ Dados ausentes, usando exemplo");
        return dadosExemplo;
      }
      
      // Aqui vamos fazer log detalhado de cada seção de dados
      console.log("✅ PROCESSANDO DADOS REAIS:");
      
      // Disponibilidade Mecânica
      if (reportData.dados.disponibilidade_mecanica) {
        console.log("- Disponibilidade Mecânica:");
        console.log(`  ${reportData.dados.disponibilidade_mecanica.length} itens encontrados`);
        console.log("  Exemplo:", JSON.stringify(reportData.dados.disponibilidade_mecanica[0]));
      } else {
        console.log("- Disponibilidade Mecânica: ❌ Ausente");
      }
      
      // Eficiência Energética
      if (reportData.dados.eficiencia_energetica) {
        console.log("- Eficiência Energética:");
        console.log(`  ${reportData.dados.eficiencia_energetica.length} itens encontrados`);
        console.log("  Exemplo:", JSON.stringify(reportData.dados.eficiencia_energetica[0]));
      } else {
        console.log("- Eficiência Energética: ❌ Ausente");
      }
      
      // Motor Ocioso
      if (reportData.dados.motor_ocioso) {
        console.log("- Motor Ocioso:");
        console.log(`  ${reportData.dados.motor_ocioso.length} itens encontrados`);
        console.log("  Exemplo:", JSON.stringify(reportData.dados.motor_ocioso[0]));
      } else {
        console.log("- Motor Ocioso: ❌ Ausente");
      }
      
      // Falta de Apontamento
      if (reportData.dados.falta_apontamento) {
        console.log("- Falta de Apontamento:");
        console.log(`  ${reportData.dados.falta_apontamento.length} itens encontrados`);
        console.log("  Exemplo:", JSON.stringify(reportData.dados.falta_apontamento[0]));
      } else {
        console.log("- Falta de Apontamento: ❌ Ausente");
      }
      
      // Uso GPS
      if (reportData.dados.uso_gps) {
        console.log("- Uso GPS:");
        console.log(`  ${reportData.dados.uso_gps.length} itens encontrados`);
        console.log("  Exemplo:", JSON.stringify(reportData.dados.uso_gps[0]));
      } else {
        console.log("- Uso GPS: ❌ Ausente");
      }
      
      // Clonar os dados para evitar modificação do objeto original
      const dadosProcessados = { ...reportData.dados };
      
      console.log("✅ Usando dados do Excel");
      return dadosProcessados;
      
    } catch (error) {
      console.error("❌ Erro ao processar dados:", error);
      console.log("Usando dados de exemplo como fallback");
      return dadosExemplo;
    }
  }, [reportData]);

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
      {/* Páginas do Relatório */}
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
        {/* Primeira Página */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader />
            <Box flex="1" display="flex" flexDirection="column">
              {/* Disponibilidade Mecânica */}
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
                    data={dados.disponibilidade_mecanica}
                    meta={configManager.getMetas('transbordo_diario').disponibilidadeMecanica}
                  />
                </Box>
              </Box>
              
              {/* Eficiência Energética */}
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
                    data={dados.eficiencia_energetica}
                    meta={configManager.getMetas('transbordo_diario').eficienciaEnergetica}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
              
        {/* Segunda Página */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader />
            <Box flex="1" display="flex" flexDirection="column">
              {/* Motor Ocioso */}
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
                    data={dados.motor_ocioso}
                    meta={configManager.getMetas('transbordo_diario').motorOcioso}
                  />
                </Box>
              </Box>

              {/* Falta de Apontamento */}
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
                    data={dados.falta_apontamento}
                    meta={configManager.getMetas('transbordo_diario').faltaApontamento}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
              
        {/* Terceira Página */}
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
                    data={dados.uso_gps}
                    meta={configManager.getMetas('transbordo_diario').usoGPS}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
        
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
              <Box mb={2}>
                <Text fontSize="13px" fontWeight="bold" color="black" mb={1} textAlign="center">
                  Frotas
                </Text>
                <SimpleGrid columns={2} spacing={3} w="100%" mb={2}>
                  <IndicatorCard
                    title="Disponibilidade Mecânica"
                    value={calcularIndicador(dados.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_diario').disponibilidadeMecanica).valor}
                    meta={configManager.getMetas('transbordo_diario').disponibilidadeMecanica}
                    unitType="porcentagem"
                    acimaMeta={calcularIndicador(dados.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_diario').disponibilidadeMecanica).acimaMeta}
                  />
                </SimpleGrid>
              </Box>

              {/* Seção Operadores */}
              <Box>
                <Text fontSize="13px" fontWeight="bold" color="black" mb={1} textAlign="center">
                  Operadores
                </Text>
                <SimpleGrid columns={2} spacing={3} w="100%" mb={2}>
                  <IndicatorCard
                    title="Eficiência Energética"
                    value={calcularIndicador(dados.eficiencia_energetica, 'eficiencia', configManager.getMetas('transbordo_diario').eficienciaEnergetica).valor}
                    meta={configManager.getMetas('transbordo_diario').eficienciaEnergetica}
                    unitType="porcentagem"
                    acimaMeta={calcularIndicador(dados.eficiencia_energetica, 'eficiencia', configManager.getMetas('transbordo_diario').eficienciaEnergetica).acimaMeta}
                  />
                  <IndicatorCard
                    title="Motor Ocioso"
                    value={calcularIndicador(dados.motor_ocioso, 'percentual', configManager.getMetas('transbordo_diario').motorOcioso).valor}
                    meta={configManager.getMetas('transbordo_diario').motorOcioso}
                    unitType="porcentagem"
                    acimaMeta={calcularIndicador(dados.motor_ocioso, 'percentual', configManager.getMetas('transbordo_diario').motorOcioso).acimaMeta}
                  />
                </SimpleGrid>

                {/* Tabela de Operadores */}
                <Box>
                  <TabelaOperadores dados={dados} tipo="transbordo_diario" />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
      </VStack>
    </Box>
  );
} 