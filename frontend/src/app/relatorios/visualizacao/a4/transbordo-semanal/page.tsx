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
import { GraficoTDH } from '@/components/Charts/Transbordo/Semanal/GraficoTDH';
import { GraficoDiesel } from '@/components/Charts/Transbordo/Semanal/GraficoDiesel';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaPrint } from 'react-icons/fa';
import { configManager } from '@/utils/config';
import RelatorioColheitaDiarioResumo from '@/components/RelatorioColheitaDiarioResumo';
import IndicatorCard from '@/components/IndicatorCard';
import TabelaOperadores from '@/components/TabelaOperadores';
import TabelaFrotas from '@/components/TabelaFrotas';
import { DateRangeDisplay } from '@/components/DateRangeDisplay';

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
  ],
  tdh: [
    { frota: '6031', valor: 0.015 },
    { frota: '6082', valor: 0.018 },
    { frota: '6087', valor: 0.017 },
    { frota: '6096', valor: 0.019 }
  ],
  diesel: [
    { frota: '6031', valor: 8.5 },
    { frota: '6082', valor: 8.7 },
    { frota: '6087', valor: 9.1 },
    { frota: '6096', valor: 8.9 }
  ]
};

interface TransbordoSemanalA4Props {
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
  tdh: Array<{
    frota: string;
    valor: number;
  }>;
  diesel: Array<{
    frota: string;
    valor: number;
  }>;
}

// Função de verificação de dados mais simples - verificamos apenas se os dados existem
const verificarFormatoDados = (dados: any) => {
  console.log("🔍 VERIFICANDO FORMATO DOS DADOS:", dados);
  
  if (!dados) {
    console.error("❌ Dados ausentes");
    return false;
  }
  
  // Log detalhado das propriedades nos dados
  console.log("📊 Propriedades nos dados:", Object.keys(dados));
  
  // Verificamos se pelo menos alguns dos dados esperados existem
  // Não exigimos todos, apenas alguns para considerarmos válido
  const tiposDados = [
    'disponibilidade_mecanica', 
    'eficiencia_energetica', 
    'motor_ocioso', 
    'uso_gps', 
    'falta_apontamento',
    'tdh',
    'diesel'
  ];
  
  // Verificar quantos tipos de dados estão presentes
  const tiposPresentes = tiposDados.filter(tipo => 
    dados[tipo] && Array.isArray(dados[tipo]) && dados[tipo].length > 0
  );
  
  console.log("✅ Tipos de dados presentes:", tiposPresentes);
  console.log("📊 Total de tipos de dados presentes:", tiposPresentes.length);
  
  // Se temos pelo menos alguns dos tipos de dados, consideramos válido
  const dadosValidos = tiposPresentes.length > 0;
  
  // Para cada tipo de dado presente, mostramos um exemplo
  tiposPresentes.forEach(tipo => {
    console.log(`📄 Exemplo de ${tipo}:`, dados[tipo][0]);
  });
  
  if (!dadosValidos) {
    console.error("❌ Formato de dados inválido");
  }
  
  return dadosValidos;
};

export default function TransbordoSemanalA4({ data }: TransbordoSemanalA4Props) {
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
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Função para formatar a data no padrão brasileiro
  const formatarData = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Função para gerar o nome do arquivo PDF
  const gerarNomeArquivo = () => {
    const data = reportData?.data ? formatarData(reportData.data).replace(/\//g, '-') : formatarData(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    return `Relatório de Transbordo Semanal - ${nomeFrente} - ${data}.pdf`;
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
              .from('relatorios_semanais')
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
            
            // SEMPRE usar dados reais quando temos um ID
            if (reportId) {
              console.log("✅ ID válido, NUNCA usar dados de exemplo");
              setUseExampleData(false);
            }
            
            // Assinatura para atualizações em tempo real
            const subscription = supabase
              .channel('report_updates')
              .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'relatorios_semanais',
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
            setError('Erro ao buscar dados. Por favor, tente novamente.');
            setLoading(false);
            return null;
          }
        };
        
        await fetchReportData();
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [searchParams]);

  // Funções utilitárias para processamento de dados
      const processarOperador = (operador: any) => {
        // Se vier vazio, 0 ou nulo, retornar null
        if (!operador || operador === 0) return null;
        
        try {
          // Garantir que temos uma string
          const operadorStr = String(operador).trim();
          
          // Pular se for TROCA DE TURNO
          if (operadorStr === 'TROCA DE TURNO' || operadorStr === '9999 - TROCA DE TURNO') {
            return null;
          }
          
          // Se tiver o formato "ID - Nome"
          if (operadorStr.includes(' - ')) {
            const [id, nome] = operadorStr.split(' - ', 2);
            return { id, nome };
          }
          
          // Se for apenas um nome
          return { id: operadorStr, nome: operadorStr };
        } catch (erro) {
          console.error('Erro ao processar operador:', operador, erro);
          return null;
        }
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

  // Função auxiliar para encontrar o nome da coluna de forma mais flexível
  const encontrarColuna = (objeto: any, nomesPossiveis: string[]): string | null => {
    if (!objeto || typeof objeto !== 'object') return null;
    
    // Verificar matches exatos primeiro
    for (const nome of nomesPossiveis) {
      if (nome in objeto) return nome;
    }
    
    // Se não encontrou match exato, tenta encontrar por substring
    const chaves = Object.keys(objeto);
    for (const nome of nomesPossiveis) {
      const match = chaves.find(chave => 
        chave.toLowerCase().includes(nome.toLowerCase()) || 
        nome.toLowerCase().includes(chave.toLowerCase())
      );
      if (match) return match;
    }
    
    return null;
  };

  // Componentes de layout
  const PageHeader = ({ showDate = false }: { showDate?: boolean }) => {
    // Encontrar o nome completo da frente no config
    const frenteConfig = configManager.getFrentes('transbordo_semanal').find((f: { id: string }) => f.id === reportData?.frente);
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
            {`Relatório de Transbordo Semanal - ${nomeFrente}`}
          </Heading>
          {showDate && <DateRangeDisplay startDate={startDate} endDate={endDate} />}
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

  // Adicionar no início da função principal, após a declaração de variáveis iniciais
  // Verificar configuração para mostrar ou esconder componentes
  const secoes = useMemo(() => {
    // Obter configurações de seções para o tipo de relatório
    const tipoRelatorio = reportData?.metadata?.type || 'transbordo_semanal';
    const configSections = configManager.getTipoRelatorio(tipoRelatorio)?.secoes || {
      disponibilidadeMecanica: true,
      tdh: true,
      diesel: true,
      eficienciaEnergetica: true,
      motorOcioso: true,
      faltaApontamento: true,
      usoGPS: false  // Para transbordo, o padrão para Uso GPS é false
    };
    
    console.log('🔧 Configuração de seções para', tipoRelatorio, ':', configSections);
    return configSections;
  }, [reportData?.metadata?.type]);

  // Dados processados para os gráficos
  const dadosProcessados = useMemo(() => {
    try {
      console.log('📊 INICIANDO PROCESSAMENTO DE DADOS - TRANSBORDO SEMANAL', {
        reportData,
        temDados: reportData?.dados && Object.keys(reportData.dados).length > 0,
        useExampleData
      });
      
      // Se useExampleData estiver definido (e não tivermos um ID válido), use os dados de exemplo
      if (useExampleData && !searchParams.get('id')) {
        console.log('📊 Usando dados de exemplo (modo preview)');
        return exemplosDados;
      }

      // Se não tivermos reportData ou seus dados, ou se o formato for inválido, use os dados de exemplo
      if (!reportData?.dados || !verificarFormatoDados(reportData.dados)) {
        console.warn("⚠️ Dados do relatório ausentes ou inválidos, verificando se há ID");
        
        // Se temos um ID de relatório mas não temos dados válidos, isso é um erro
        if (reportId) {
          console.error("❌ ERRO: Relatório com ID existe, mas sem dados válidos:", reportId);
          setError('O relatório não contém dados válidos. Verifique o arquivo Excel enviado.');
        }
        
        console.log("📊 Usando dados de exemplo (fallback)");
        return exemplosDados;
      }
      
      // A partir daqui, temos dados válidos do relatório, vamos processá-los:
      console.log("✅ Processando dados reais do relatório");
      
      // Lendo configuração do relatório para saber os campos esperados
      const configRelatorio = configManager.getTipoRelatorio('transbordo_semanal');
      console.log('📊 Configuração do relatório:', configRelatorio);
      
      // Processar cada tipo de dado conforme a configuração
      const dadosProcessados: DadosProcessados = {
        disponibilidade_mecanica: [],
        eficiencia_energetica: [],
        motor_ocioso: [],
        uso_gps: [],
        falta_apontamento: [],
        tdh: [],
        diesel: []
      };

      // 1. Processar disponibilidade mecânica
      if (Array.isArray(reportData.dados.disponibilidade_mecanica)) {
        console.log('📊 Processando disponibilidade mecânica...');
        
        dadosProcessados.disponibilidade_mecanica = reportData.dados.disponibilidade_mecanica
          .filter((item: any) => item && typeof item === 'object')
          .map((item: any) => {
            // Localizar a coluna de Frota
            const frotaKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'frota' || 
              k.toLowerCase().includes('frota')
            ) || 'Frota';
            
            // Localizar a coluna de Disponibilidade
            const dispKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'disponibilidade' || 
              k.toLowerCase().includes('disponibilidade') ||
              k.toLowerCase().includes('disp')
            ) || 'Disponibilidade';
            
            console.log(`📊 Item: ${JSON.stringify(item)}, Frota: ${frotaKey}, Disp: ${dispKey}`);
            
            return {
              frota: String(item[frotaKey] || ''),
              disponibilidade: processarPorcentagem(item[dispKey])
            };
          })
          .filter((item: any) => item.frota && item.disponibilidade !== undefined);
      }

      // 2. Processar eficiência energética
      if (Array.isArray(reportData.dados.eficiencia_energetica)) {
        console.log('📊 Processando eficiência energética...');
        
        dadosProcessados.eficiencia_energetica = reportData.dados.eficiencia_energetica
          .filter((item: any) => item && typeof item === 'object')
          .map((item: any) => {
            // Localizar a coluna de Operador
            const operadorKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'operador' || 
              k.toLowerCase().includes('operador')
            ) || 'Operador';
            
            // Localizar a coluna de Eficiência
            const eficienciaKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'eficiência' || 
              k.toLowerCase().includes('eficiência') ||
              k.toLowerCase().includes('eficiencia') ||
              k.toLowerCase().includes('ef')
            ) || 'Eficiência';
            
            const operador = processarOperador(item[operadorKey]);
            
            console.log(`📊 Item: ${JSON.stringify(item)}, Operador: ${operadorKey}, Eficiência: ${eficienciaKey}`);
            
            if (!operador) return null;
            
            return {
              id: operador.id,
              nome: operador.nome,
              eficiencia: processarPorcentagem(item[eficienciaKey])
            };
          })
          .filter((item: any) => item !== null)
          .sort((a: any, b: any) => b.eficiencia - a.eficiencia);
      }

      // 3. Processar motor ocioso
      if (Array.isArray(reportData.dados.motor_ocioso)) {
        console.log('📊 Processando motor ocioso...');
        
        dadosProcessados.motor_ocioso = reportData.dados.motor_ocioso
          .filter((item: any) => item && typeof item === 'object')
          .map((item: any) => {
            // Localizar a coluna de Operador
            const operadorKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'operador' || 
              k.toLowerCase().includes('operador')
            ) || 'Operador';
            
            // Localizar a coluna de Porcentagem
            const porcentagemKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'porcentagem' || 
              k.toLowerCase().includes('porcentagem') ||
              k.toLowerCase().includes('percentual') ||
              k.toLowerCase().includes('ocioso')
            ) || 'Porcentagem';
            
            const operador = processarOperador(item[operadorKey]);
            
            console.log(`📊 Item: ${JSON.stringify(item)}, Operador: ${operadorKey}, Porcentagem: ${porcentagemKey}`);
            
            if (!operador) return null;
            
            return {
              id: operador.id,
              nome: operador.nome,
              percentual: processarPorcentagem(item[porcentagemKey])
            };
          })
          .filter((item: any) => item !== null);
      }

      // 4. Processar uso GPS
      if (Array.isArray(reportData.dados.uso_gps)) {
        console.log('📊 Processando uso GPS...');
        
        dadosProcessados.uso_gps = reportData.dados.uso_gps
          .filter((item: any) => item && typeof item === 'object')
          .map((item: any) => {
            // Localizar a coluna de Operador
            const operadorKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'operador' || 
              k.toLowerCase().includes('operador')
            ) || 'Operador';
            
            // Localizar a coluna de Porcentagem
            const porcentagemKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'porcentagem' || 
              k.toLowerCase().includes('porcentagem') ||
              k.toLowerCase().includes('percentual') ||
              k.toLowerCase().includes('gps')
            ) || 'Porcentagem';
            
            const operador = processarOperador(item[operadorKey]);
            
            console.log(`📊 Item: ${JSON.stringify(item)}, Operador: ${operadorKey}, Porcentagem: ${porcentagemKey}`);
            
            if (!operador) return null;
            
            return {
              id: operador.id,
              nome: operador.nome,
              porcentagem: processarPorcentagem(item[porcentagemKey])
            };
          })
          .filter((item: any) => item !== null);
      }

      // 5. Processar falta apontamento
      if (Array.isArray(reportData.dados.falta_apontamento)) {
        console.log('📊 Processando falta apontamento...');
        
        dadosProcessados.falta_apontamento = reportData.dados.falta_apontamento
          .filter((item: any) => item && typeof item === 'object')
          .map((item: any) => {
            // Localizar a coluna de Operador
            const operadorKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'operador' || 
              k.toLowerCase().includes('operador')
            ) || 'Operador';
            
            // Localizar a coluna de Porcentagem
            const porcentagemKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'porcentagem' || 
              k.toLowerCase().includes('porcentagem') ||
              k.toLowerCase().includes('percentual') ||
              k.toLowerCase().includes('falta')
            ) || 'Porcentagem';
            
            const operador = processarOperador(item[operadorKey]);
            
            console.log(`📊 Item: ${JSON.stringify(item)}, Operador: ${operadorKey}, Porcentagem: ${porcentagemKey}`);
            
            if (!operador) return null;
            
            return {
              id: operador.id,
              nome: operador.nome,
              percentual: processarPorcentagem(item[porcentagemKey])
            };
          })
          .filter((item: any) => item !== null);
      }

      // 6. Processar TDH
      if (Array.isArray(reportData.dados.tdh)) {
        console.log('📊 Processando TDH...');
        
        dadosProcessados.tdh = reportData.dados.tdh
          .filter((item: any) => item && typeof item === 'object')
          .map((item: any) => {
            // Localizar a coluna de Frota
            const frotaKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'frota' || 
              k.toLowerCase().includes('frota')
            ) || 'Frota';
            
            // Localizar a coluna de TDH
            const tdhKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'tdh' || 
              k.toLowerCase().includes('tdh') ||
              k.toLowerCase().includes('consumo tdh')
            ) || 'TDH';
            
            console.log(`📊 Item: ${JSON.stringify(item)}, Frota: ${frotaKey}, TDH: ${tdhKey}`);
            
            return {
              frota: processarFrota(item[frotaKey]),
              valor: converterNumero(item[tdhKey])
            };
          })
          .filter((item: any) => item.frota && item.valor !== undefined);
      }

      // 7. Processar Diesel
      if (Array.isArray(reportData.dados.diesel)) {
        console.log('📊 Processando Diesel...');
        
        dadosProcessados.diesel = reportData.dados.diesel
          .filter((item: any) => item && typeof item === 'object')
          .map((item: any) => {
            // Localizar a coluna de Frota
            const frotaKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'frota' || 
              k.toLowerCase().includes('frota')
            ) || 'Frota';
            
            // Localizar a coluna de Diesel
            const dieselKey = Object.keys(item).find(k => 
              k.toLowerCase() === 'diesel' || 
              k.toLowerCase().includes('diesel') ||
              k.toLowerCase().includes('consumo')
            ) || 'Diesel';
            
            console.log(`📊 Item: ${JSON.stringify(item)}, Frota: ${frotaKey}, Diesel: ${dieselKey}`);
            
            return {
              frota: processarFrota(item[frotaKey]),
              valor: converterNumero(item[dieselKey])
            };
          })
          .filter((item: any) => item.frota && item.valor !== undefined);
      }

      console.log('📊 DADOS FINAIS APÓS PROCESSAMENTO:', dadosProcessados);
      return dadosProcessados;
    } catch (error) {
      console.error('❌ ERRO NO PROCESSAMENTO DE DADOS:', error);
      // Em caso de erro, usar dados de exemplo
      return exemplosDados;
    }
  }, [reportData, useExampleData, searchParams]);

  // Formatação dos dados de frota para remover decimais
  const processarFrota = (frota: any) => {
    if (!frota) return '';
    // Remover qualquer decimal do número da frota
    const frotaStr = String(frota).trim();
    return frotaStr.includes('.') ? frotaStr.split('.')[0] : frotaStr;
  };

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
        {/* Primeira Página - TDH e Diesel */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader showDate={true} />
            <Box flex="1" display="flex" flexDirection="column">
              {/* TDH */}
              {secoes.tdh && (
                <Box flex="1" mb={3}>
                  <SectionTitle title="TDH" centered={true} />
                  <Box 
                    border="1px solid"
                    borderColor="black"
                    borderRadius="md"
                    p={2}
                    h="calc(100% - 25px)"
                  >
                    {dadosProcessados.tdh.length > 0 ? (
                      <GraficoTDH 
                        data={dadosProcessados.tdh} 
                        meta={configManager.getMetas('transbordo_semanal').tdh} 
                      />
                    ) : (
                      <Center h="100%">
                        <Text>Sem dados de TDH</Text>
                      </Center>
                    )}
                  </Box>
                </Box>
              )}
              
              {/* Diesel */}
              {secoes.diesel && (
                <Box flex="1" mb={3}>
                  <SectionTitle title="Diesel" centered={true} />
                  <Box 
                    border="1px solid"
                    borderColor="black"
                    borderRadius="md"
                    p={2}
                    h="calc(100% - 25px)"
                  >
                    {dadosProcessados.diesel.length > 0 ? (
                      <GraficoDiesel 
                        data={dadosProcessados.diesel} 
                        meta={configManager.getMetas('transbordo_semanal').diesel} 
                      />
                    ) : (
                      <Center h="100%">
                        <Text>Sem dados de diesel</Text>
                      </Center>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </A4Colheita>

        {/* Segunda Página - Disponibilidade e Eficiência */}
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
                    data={dadosProcessados.disponibilidade_mecanica}
                    meta={configManager.getMetas('transbordo_semanal').disponibilidadeMecanica}
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
                    data={dadosProcessados.eficiencia_energetica}
                    meta={configManager.getMetas('transbordo_semanal').eficienciaEnergetica}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
              
        {/* Terceira Página - Motor Ocioso e Falta Apontamento */}
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
                    data={dadosProcessados.motor_ocioso}
                    meta={configManager.getMetas('transbordo_semanal').motorOcioso}
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
                    data={dadosProcessados.falta_apontamento}
                    meta={configManager.getMetas('transbordo_semanal').faltaApontamento}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
              
        {/* Quarta Página - Uso GPS */}
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
                      data={dadosProcessados.uso_gps}
                      meta={configManager.getMetas('transbordo_semanal').usoGPS}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </A4Colheita>
        )}
        
        {/* Quinta Página - Resumo */}
        <A4Colheita isLastPage={true}>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader showDate={true} />
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
                Resumo do Relatório de Transbordo Semanal
              </Heading>

              {/* Seção Frotas */}
              <Box mb={2}>
                <Text fontSize="13px" fontWeight="bold" color="black" mb={1} textAlign="center">
                  Frotas
                </Text>
                <SimpleGrid columns={2} spacing={3} w="100%" mb={2}>
                  <IndicatorCard
                    title="Consumo de TDH"
                    value={calcularMedia(dadosProcessados.tdh, 'valor')}
                    meta={configManager.getMetas('transbordo_semanal').tdh}
                    unitType="decimal"
                    isInverted={true}
                    acimaMeta={{
                      quantidade: contarItensMeta(dadosProcessados.tdh, 'valor', configManager.getMetas('transbordo_semanal').tdh, false),
                      total: dadosProcessados.tdh.length,
                      percentual: (contarItensMeta(dadosProcessados.tdh, 'valor', configManager.getMetas('transbordo_semanal').tdh, false) / dadosProcessados.tdh.length) * 100
                    }}
                  />
                  <IndicatorCard
                    title="Consumo de Diesel"
                    value={calcularMedia(dadosProcessados.diesel, 'valor')}
                    meta={configManager.getMetas('transbordo_semanal').diesel}
                    unitType="decimal"
                    isInverted={true}
                    acimaMeta={{
                      quantidade: contarItensMeta(dadosProcessados.diesel, 'valor', configManager.getMetas('transbordo_semanal').diesel, false),
                      total: dadosProcessados.diesel.length,
                      percentual: (contarItensMeta(dadosProcessados.diesel, 'valor', configManager.getMetas('transbordo_semanal').diesel, false) / dadosProcessados.diesel.length) * 100
                    }}
                  />
                  <IndicatorCard
                    title="Disponibilidade Mecânica"
                    value={calcularMedia(dadosProcessados.disponibilidade_mecanica, 'disponibilidade')}
                    meta={configManager.getMetas('transbordo_semanal').disponibilidadeMecanica}
                    unitType="porcentagem"
                    acimaMeta={{
                      quantidade: contarItensMeta(dadosProcessados.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_semanal').disponibilidadeMecanica),
                      total: dadosProcessados.disponibilidade_mecanica.length,
                      percentual: (contarItensMeta(dadosProcessados.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('transbordo_semanal').disponibilidadeMecanica) / dadosProcessados.disponibilidade_mecanica.length) * 100
                    }}
                  />
                </SimpleGrid>
                
                {/* Tabela de Frotas */}
                <Box mb={2}>
                  <TabelaFrotas 
                    dados={dadosProcessados.disponibilidade_mecanica
                      .filter((item: { frota: string }) => item.frota !== '0')
                      .map((item: { frota: string; disponibilidade: number }) => ({
                        frota: item.frota,
                        disponibilidade: item.disponibilidade
                      }))
                    }
                    tipo="transbordo_semanal"
                    dadosCompletos={{
                      tdh: dadosProcessados.tdh,
                      diesel: dadosProcessados.diesel
                    }}
                  />
                </Box>
              </Box>

              {/* Seção Operadores */}
              <Box>
                <Text fontSize="13px" fontWeight="bold" color="black" mb={1} textAlign="center">
                  Operadores
                </Text>
                <SimpleGrid columns={secoes.faltaApontamento ? 3 : 2} spacing={3} w="100%" mb={2}>
                  {dadosProcessados.eficiencia_energetica.length > 0 && secoes.eficienciaEnergetica && (
                    <IndicatorCard
                      title="Eficiência Energética"
                      value={calcularMedia(dadosProcessados.eficiencia_energetica, 'eficiencia')}
                      meta={configManager.getMetas('transbordo_semanal').eficienciaEnergetica}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: contarItensMeta(dadosProcessados.eficiencia_energetica, 'eficiencia', configManager.getMetas('transbordo_semanal').eficienciaEnergetica),
                        total: dadosProcessados.eficiencia_energetica.length,
                        percentual: (contarItensMeta(dadosProcessados.eficiencia_energetica, 'eficiencia', configManager.getMetas('transbordo_semanal').eficienciaEnergetica) / dadosProcessados.eficiencia_energetica.length) * 100
                      }}
                    />
                  )}
                  {dadosProcessados.motor_ocioso.length > 0 && secoes.motorOcioso && (
                    <IndicatorCard
                      title="Motor Ocioso"
                      value={calcularMedia(dadosProcessados.motor_ocioso, 'percentual')}
                      meta={configManager.getMetas('transbordo_semanal').motorOcioso}
                      unitType="porcentagem"
                      isInverted={true}
                      acimaMeta={{
                        quantidade: contarItensMeta(dadosProcessados.motor_ocioso, 'percentual', configManager.getMetas('transbordo_semanal').motorOcioso),
                        total: dadosProcessados.motor_ocioso.length,
                        percentual: (contarItensMeta(dadosProcessados.motor_ocioso, 'percentual', configManager.getMetas('transbordo_semanal').motorOcioso) / dadosProcessados.motor_ocioso.length) * 100
                      }}
                    />
                  )}
                  {dadosProcessados.falta_apontamento.length > 0 && secoes.faltaApontamento && (
                    <IndicatorCard
                      title="Falta Apontamento"
                      value={calcularMedia(dadosProcessados.falta_apontamento, 'percentual')}
                      meta={configManager.getMetas('transbordo_semanal').faltaApontamento}
                      unitType="porcentagem"
                      isInverted={true}
                      acimaMeta={{
                        quantidade: contarItensMeta(dadosProcessados.falta_apontamento, 'percentual', configManager.getMetas('transbordo_semanal').faltaApontamento),
                        total: dadosProcessados.falta_apontamento.length,
                        percentual: (contarItensMeta(dadosProcessados.falta_apontamento, 'percentual', configManager.getMetas('transbordo_semanal').faltaApontamento) / dadosProcessados.falta_apontamento.length) * 100
                      }}
                    />
                  )}
                </SimpleGrid>

                {/* Tabela de Operadores */}
                <Box>
                  <TabelaOperadores dados={dadosProcessados} tipo="transbordo_semanal" />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
      </VStack>
    </Box>
  );
} 