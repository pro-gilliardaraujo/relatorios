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
  exemplosOperadores: [
    { id: '1', nome: 'JOAO BATISTA DA ROCHA', eficiencia: 50.39 },
    { id: '2', nome: 'TROCA DE TURNO', eficiencia: 0.00 },
    { id: '3', nome: 'LEONARDO RODRIGUES DE MENEZES', eficiencia: 56.66 },
    { id: '4', nome: 'GERALDO BRITO DA SILVA', eficiencia: 49.92 },
    { id: '5', nome: 'MANUEL RICARDO ALVES DOS SANTOS', eficiencia: 64.13 }
  ],
  exemplosFrotas: [
    { frota: '6031', disponibilidade: 89.00 },
    { frota: '6082', disponibilidade: 99.23 },
    { frota: '6087', disponibilidade: 98.61 },
    { frota: '6096', disponibilidade: 99.34 },
    { frota: '0', disponibilidade: 0.00 }
  ]
};

interface TransbordoSemanalA4Props {
  data?: any;
}

interface DadosProcessados {
  disponibilidade_mecanica: Array<any>;
  eficiencia_energetica: Array<any>;
  motor_ocioso: Array<any>;
  uso_gps: Array<any>;
  falta_apontamento: Array<any>;
  exemplosOperadores: Array<any>;
  exemplosFrotas: Array<any>;
}

// Função para normalizar dados recebidos do backend
const normalizarDados = (dados: any) => {
  console.log("🔄 NORMALIZANDO DADOS RECEBIDOS:", Object.keys(dados));
  
  // Cópia dos dados para não modificar o original
  const dadosNormalizados = { ...dados };
  
  // Mapeamento de possíveis variações de nomes para o formato esperado
  const mapeamentoChaves: Record<string, string> = {
    // Disponibilidade Mecânica - variações
    'disponibilidade_mecanica': 'disponibilidade_mecanica',
    'disponidademecanica': 'disponibilidade_mecanica',
    'disponibilidade-mecanica': 'disponibilidade_mecanica',
    '1_disponibilidade_mecanica': 'disponibilidade_mecanica',
    '1disponibilidade_mecanica': 'disponibilidade_mecanica',
    'disponibilidade mecânica': 'disponibilidade_mecanica',
    '1_disponibilidade mecânica': 'disponibilidade_mecanica',
    
    // Eficiência Energética - variações
    'eficiencia_energetica': 'eficiencia_energetica',
    'eficienciaenergetica': 'eficiencia_energetica',
    'eficiencia-energetica': 'eficiencia_energetica',
    '2_eficiencia_energetica': 'eficiencia_energetica',
    '2eficiencia_energetica': 'eficiencia_energetica',
    'eficiência energética': 'eficiencia_energetica',
    '2_eficiência energética': 'eficiencia_energetica',
    
    // Motor Ocioso - variações
    'motor_ocioso': 'motor_ocioso',
    'motorocioso': 'motor_ocioso',
    'motor-ocioso': 'motor_ocioso',
    '3_motor_ocioso': 'motor_ocioso',
    '3motor_ocioso': 'motor_ocioso',
    'motor ocioso': 'motor_ocioso',
    '3_motor ocioso': 'motor_ocioso',
    
    // Falta Apontamento - variações
    'falta_apontamento': 'falta_apontamento',
    'faltaapontamento': 'falta_apontamento',
    'falta-apontamento': 'falta_apontamento',
    '4_falta_apontamento': 'falta_apontamento',
    '4falta_apontamento': 'falta_apontamento',
    'falta de apontamento': 'falta_apontamento',
    '4_falta de apontamento': 'falta_apontamento',
    
    // Uso GPS - variações
    'uso_gps': 'uso_gps',
    'usogps': 'uso_gps',
    'uso-gps': 'uso_gps',
    '5_uso_gps': 'uso_gps',
    '5uso_gps': 'uso_gps',
    'uso gps': 'uso_gps',
    '5_uso gps': 'uso_gps',
  };
  
  // Verificar cada chave no objeto original
  Object.keys(dados).forEach(chaveOriginal => {
    // Converter chave para minúsculas para comparação
    const chaveLowerCase = chaveOriginal.toLowerCase();
    
    // Verificar se essa chave precisa ser normalizada
    Object.keys(mapeamentoChaves).forEach(variacao => {
      if (chaveLowerCase.includes(variacao.toLowerCase())) {
        // Usar o valor normalizado e manter o dado original
        const chaveNormalizada = mapeamentoChaves[variacao];
        if (chaveNormalizada && chaveNormalizada !== chaveOriginal) {
          console.log(`🔄 Normalizando: "${chaveOriginal}" -> "${chaveNormalizada}"`);
          dadosNormalizados[chaveNormalizada] = dados[chaveOriginal];
        }
      }
    });
  });
  
  console.log("🔄 DADOS APÓS NORMALIZAÇÃO:", Object.keys(dadosNormalizados));
  return dadosNormalizados;
};

// Função de verificação de dados mais robusta
const verificarFormatoDados = (dados: any): { dadosValidos: boolean; dadosNormalizados: any } => {
  console.log("🔍 VERIFICANDO FORMATO DOS DADOS:", dados);
  
  if (!dados) {
    console.error("❌ Dados ausentes");
    return { dadosValidos: false, dadosNormalizados: {} };
  }
  
  // Normalizar dados antes da verificação
  const dadosNormalizados = normalizarDados(dados);
  
  // Log detalhado das propriedades nos dados
  console.log("📊 Propriedades nos dados normalizados:", Object.keys(dadosNormalizados));
  
  // Verificamos se pelo menos alguns dos dados esperados existem
  // Não exigimos todos, apenas alguns para considerarmos válido
  const tiposDados = [
    'disponibilidade_mecanica', 
    'eficiencia_energetica', 
    'motor_ocioso', 
    'uso_gps', 
    'falta_apontamento'
  ];
  
  // Verificar se qualquer propriedade nos dados contém as chaves que buscamos (busca parcial)
  const chavesParciais = Object.keys(dadosNormalizados).filter(chave => {
    return tiposDados.some(tipoDado => 
      chave.toLowerCase().includes(tipoDado.toLowerCase())
    );
  });
  
  console.log("🔍 Chaves parciais encontradas:", chavesParciais);
  
  // Verificar quantos tipos de dados estão presentes com match exato
  const tiposPresentes = tiposDados.filter(tipo => 
    dadosNormalizados[tipo] && Array.isArray(dadosNormalizados[tipo]) && dadosNormalizados[tipo].length > 0
  );
  
  console.log("✅ Tipos de dados presentes (match exato):", tiposPresentes);
  console.log("📊 Total de tipos de dados presentes:", tiposPresentes.length);
  
  // Para cada tipo de dado presente, mostramos um exemplo
  tiposPresentes.forEach(tipo => {
    console.log(`📄 Exemplo de ${tipo}:`, dadosNormalizados[tipo][0]);
  });
  
  // Se temos pelo menos alguns dos tipos de dados ou chaves parciais, consideramos válido
  const dadosValidos = tiposPresentes.length > 0 || chavesParciais.length > 0;
  
  if (!dadosValidos) {
    console.error("❌ Formato de dados inválido, nenhum dado reconhecido");
  } else {
    console.log("✅ Dados válidos encontrados");
  }
  
  return { dadosValidos, dadosNormalizados };
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
  
  // Obter configuração das seções do relatório
  const secoes = configManager.getTipoRelatorio('transbordo_semanal')?.secoes || {
    disponibilidadeMecanica: true,
    eficienciaEnergetica: true,
    motorOcioso: true,
    faltaApontamento: true,
    usoGPS: false
  };

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
            
            // Código modificado para desabilitar atualizações constantes
            /*
            const subscription = supabase
            .channel('report_updates')
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'relatorios_semanais',
              filter: `id=eq.${reportId}`
            },
            async (payload) => {
              console.log("Atualização recebida:", payload);
              fetchReport();
            })
            .subscribe();

            return () => {
              subscription.unsubscribe();
            };
            */
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

  // Dados processados para os gráficos
  const dadosProcessados = useMemo(() => {
    // Configurações e exemplos para exibição
    const exemplosFrotas = exemplosDados.disponibilidade_mecanica;
    const exemplosOperadores = exemplosDados.eficiencia_energetica;

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
      if (!reportData?.dados) {
        console.warn("⚠️ Dados do relatório ausentes, verificando se há ID");
        
        // Se temos um ID de relatório mas não temos dados válidos, isso é um erro
        if (reportId) {
          console.error("❌ ERRO: Relatório com ID existe, mas sem dados:", reportId);
          setError('O relatório não contém dados válidos. Verifique o arquivo Excel enviado.');
        }
        
        console.log("📊 Usando dados de exemplo (fallback)");
        return exemplosDados;
      }
      
      // Verificar formato dos dados e obter dados normalizados
      const { dadosValidos, dadosNormalizados } = verificarFormatoDados(reportData.dados);
      
      if (!dadosValidos) {
        console.warn("⚠️ Dados do relatório em formato inválido, verificando se há ID");
        
        // Se temos um ID de relatório mas o formato dos dados é inválido, isso é um erro
        if (reportId) {
          console.error("❌ ERRO: Relatório com ID existe, mas formato inválido:", reportId);
          setError('O relatório não contém dados válidos. Verifique o arquivo Excel enviado.');
        }
        
        console.log("📊 Usando dados de exemplo (fallback)");
        return exemplosDados;
      }
      
      console.log("✅ Dados válidos encontrados:", dadosNormalizados);
      
      // Processar os dados normalizados
      try {
        const dadosProcessados: DadosProcessados = {
          disponibilidade_mecanica: 
            dadosNormalizados.disponibilidade_mecanica?.map((item: any) => ({
              ...item,
              tipo: 'Disponibilidade',
              registro: new Date(item.registro),
            })) || [],
          
          eficiencia_energetica: 
            dadosNormalizados.eficiencia_energetica?.map((item: any) => ({
              ...item,
              tipo: 'Eficiência',
              registro: new Date(item.registro),
            })) || [],
          
          motor_ocioso: 
            dadosNormalizados.motor_ocioso?.map((item: any) => ({
              ...item,
              tipo: 'Motor Ocioso',
              registro: new Date(item.registro),
            })) || [],
          
          falta_apontamento: 
            dadosNormalizados.falta_apontamento?.map((item: any) => ({
              ...item,
              tipo: 'Falta Apontamento',
              registro: new Date(item.registro),
            })) || [],
          
          uso_gps: 
            dadosNormalizados.uso_gps?.map((item: any) => ({
              ...item,
              tipo: 'Uso GPS',
              registro: new Date(item.registro),
            })) || [],
          
          exemplosOperadores: dadosNormalizados.eficiencia_energetica 
            ? dadosNormalizados.eficiencia_energetica.slice(0, 5) 
            : exemplosDados.eficiencia_energetica,
          
          exemplosFrotas: dadosNormalizados.disponibilidade_mecanica 
            ? dadosNormalizados.disponibilidade_mecanica.slice(0, 5) 
            : exemplosDados.disponibilidade_mecanica,
        };
        
        console.log('📊 DADOS FINAIS APÓS PROCESSAMENTO:', dadosProcessados);
        return dadosProcessados;
      } catch (error) {
        console.error('❌ ERRO NO PROCESSAMENTO DE DADOS:', error);
        // Em caso de erro, usar dados de exemplo
        return exemplosDados;
      }
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
        {/* Primeira Página - Disponibilidade Mecânica e Eficiência Energética */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader showDate={true} />
            <Box flex="1" display="flex" flexDirection="column">
              {/* Disponibilidade Mecânica */}
              <Box flex="1" mb={4}>
                <SectionTitle title="Disponibilidade Mecânica" />
                <SimpleGrid columns={1} spacing={3} w="100%" mb={2}>
                  <IndicatorCard
                    title=""
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
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="500px"
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
                <SimpleGrid columns={1} spacing={3} w="100%" mb={2}>
                  {dadosProcessados.eficiencia_energetica.length > 0 && secoes.eficienciaEnergetica && (
                    <IndicatorCard
                      title=""
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
                </SimpleGrid>
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="500px"
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

        {/* Segunda Página - Motor Ocioso */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader showDate={true} />
            <Box flex="1" display="flex" flexDirection="column">
              {/* Motor Ocioso */}
              <Box flex="1">
                <SectionTitle title="Motor Ocioso" />
                <SimpleGrid columns={1} spacing={3} w="100%" mb={2}>
                  {dadosProcessados.motor_ocioso.length > 0 && secoes.motorOcioso && (
                    <IndicatorCard
                      title=""
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
                </SimpleGrid>
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="500px"
                  overflow="hidden"
                >
                  <GraficoMotorOciosoTransbordo
                    data={dadosProcessados.motor_ocioso}
                    meta={configManager.getMetas('transbordo_semanal').motorOcioso}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
              
        {/* Terceira Página - Falta Apontamento */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader showDate={true} />
            <Box flex="1" display="flex" flexDirection="column">
              {/* Falta Apontamento */}
              <Box flex="1">
                <SectionTitle title="Falta Apontamento" />
                <SimpleGrid columns={1} spacing={3} w="100%" mb={2}>
                  {dadosProcessados.falta_apontamento.length > 0 && secoes.faltaApontamento && (
                    <IndicatorCard
                      title=""
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
              </Box>
            </Box>
          </Box>
        </A4Colheita>
        
        {/* Quarta Página - Resumo */}
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
                <SimpleGrid columns={1} spacing={3} w="100%" mb={2}>
                  <IndicatorCard
                    title=""
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
                  />
                </Box>
              </Box>

              {/* Seção Operadores */}
              <Box>
                <Text fontSize="13px" fontWeight="bold" color="black" mb={1} textAlign="center">
                  Operadores
                </Text>
                <SimpleGrid columns={2} spacing={3} w="100%" mb={2}>
                  {dadosProcessados.eficiencia_energetica.length > 0 && secoes.eficienciaEnergetica && (
                    <IndicatorCard
                      title=""
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
                      title=""
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
                      title=""
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
                  <TabelaOperadores 
                    dados={dadosProcessados} 
                    tipo="transbordo_semanal" 
                    mostrarUsoGPS={secoes.usoGPS}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
      </VStack>
    </Box>
  );
} 