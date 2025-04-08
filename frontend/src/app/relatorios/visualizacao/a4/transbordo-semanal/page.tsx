'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    { frota: '6031', disponibilidade: 0.95 },
    { frota: '6082', disponibilidade: 0.92 },
    { frota: '6087', disponibilidade: 0.97 },
    { frota: '6096', disponibilidade: 0.91 },
    { frota: '0', disponibilidade: 0.0 }
  ],
  eficiencia_energetica: [
    { operador: 'João Silva', eficiencia: 0.85 },
    { operador: 'Maria Oliveira', eficiencia: 0.82 },
    { operador: 'Pedro Santos', eficiencia: 0.87 },
    { operador: 'Ana Souza', eficiencia: 0.81 },
    { operador: '0', eficiencia: 0.0 }
  ],
  motor_ocioso: [
    { frota: '6031', ociosidade: 0.25 },
    { frota: '6082', ociosidade: 0.22 },
    { frota: '6087', ociosidade: 0.27 },
    { frota: '6096', ociosidade: 0.21 },
    { frota: '0', ociosidade: 0.0 }
  ],
  uso_gps: [
    { frota: '6031', uso: 0.95 },
    { frota: '6082', uso: 0.92 },
    { frota: '6087', uso: 0.97 },
    { frota: '6096', uso: 0.91 },
    { frota: '0', uso: 0.0 }
  ],
  falta_apontamento: [
    { frota: '6031', falta: 0.05 },
    { frota: '6082', falta: 0.08 },
    { frota: '6087', falta: 0.03 },
    { frota: '6096', falta: 0.09 },
    { frota: '0', falta: 0.0 }
  ],
  exemplosOperadores: [
    'João Silva',
    'Maria Oliveira',
    'Pedro Santos',
    'Ana Souza'
  ],
  exemplosFrotas: [
    '6031',
    '6082',
    '6087',
    '6096'
  ]
};

interface TransbordoSemanalA4Props {
  data?: any;
  carregandoDados?: boolean;
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

// Função para processar arrays com segurança
const processarArray = (arr: any): Array<any> => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return [];
  }
  return arr;
};

const filtrarTrocaDeTurno = (array: any[]): any[] => {
  if (!array || !Array.isArray(array)) return [];
  
  return array.filter((item) => {
    // Se o item não for um objeto, verificar se é uma string
    if (typeof item === 'string') {
      return !item.includes('TROCA DE TURNO');
    }
    
    // Se for um objeto, verificar campos comuns que podem conter "TROCA DE TURNO"
    if (typeof item === 'object' && item !== null) {
      // Verificar campo 'operador'
      if (item.operador && typeof item.operador === 'string' && item.operador.includes('TROCA DE TURNO')) {
        return false;
      }
      
      // Verificar campo 'nome'
      if (item.nome && typeof item.nome === 'string' && item.nome.includes('TROCA DE TURNO')) {
        return false;
      }
      
      // Verificar campo 'id'
      if (item.id) {
        // ID como string
        if (typeof item.id === 'string' && (item.id === '9999' || item.id.includes('TROCA DE TURNO'))) {
          return false;
        }
        // ID como número
        if (typeof item.id === 'number' && item.id === 9999) {
          return false;
        }
      }
      
      // Verificar campo 'frota'
      if (item.frota) {
        // Frota como string
        if (typeof item.frota === 'string' && (item.frota.includes('TROCA DE TURNO') || item.frota === '9999')) {
          return false;
        }
        // Frota como número
        if (typeof item.frota === 'number' && item.frota === 9999) {
          return false;
        }
      }
    }
    
    return true;
  });
};

const processarDadosApi = (data: any): DadosProcessados => {
  try {
    if (!data || typeof data !== 'object') {
      console.error('Dados inválidos recebidos da API:', data);
      return exemplosDados;
    }

    // Log para debug dos dados recebidos
    console.log('📊 DADOS RECEBIDOS DA API:', Object.keys(data));
    
    // Garantir que todos os arrays existam, mesmo que vazios
    let disponibilidade = Array.isArray(data.disponibilidade_mecanica) ? data.disponibilidade_mecanica : [];
    let eficiencia = Array.isArray(data.eficiencia_energetica) ? data.eficiencia_energetica : [];  
    let motorOcioso = Array.isArray(data.motor_ocioso) ? data.motor_ocioso : [];
    let faltaApontamento = Array.isArray(data.falta_apontamento) ? data.falta_apontamento : [];
    let usoGps = Array.isArray(data.uso_gps) ? data.uso_gps : [];
    
    // Filtrar todas as entradas "TROCA DE TURNO"
    disponibilidade = filtrarTrocaDeTurno(disponibilidade);
    eficiencia = filtrarTrocaDeTurno(eficiencia);
    motorOcioso = filtrarTrocaDeTurno(motorOcioso);
    faltaApontamento = filtrarTrocaDeTurno(faltaApontamento);
    usoGps = filtrarTrocaDeTurno(usoGps);
    
    console.log('📊 Quantidades encontradas após filtrar TROCA DE TURNO:', {
      disponibilidade: disponibilidade.length,
      eficiencia: eficiencia.length,
      motorOcioso: motorOcioso.length,
      faltaApontamento: faltaApontamento.length,
      usoGps: usoGps.length
    });

    return {
      disponibilidade_mecanica: disponibilidade,
      eficiencia_energetica: eficiencia,
      motor_ocioso: motorOcioso,
      falta_apontamento: faltaApontamento,
      uso_gps: usoGps,
      exemplosOperadores: disponibilidade.length > 0 
        ? eficiencia 
        : exemplosDados.exemplosOperadores,
      exemplosFrotas: disponibilidade.length > 0 
        ? disponibilidade 
        : exemplosDados.exemplosFrotas,
    };
  } catch (error) {
    console.error('Erro ao processar dados da API:', error);
    return exemplosDados;
  }
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

  // Função para carregar os dados do relatório
  const loadData = useCallback(async () => {
    if (!reportId) {
      console.log('📊 Sem ID de relatório, usando dados de exemplo');
      setReportData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Buscando relatório:', reportId);
      // Instead of using relatoriosApi, use supabase directly
      const { data, error } = await supabase
        .from('relatorios_semanais')
        .select('*')
        .eq('id', reportId)
        .single();
        
      if (error) {
        throw error;
      }
        
      console.log('📊 Relatório recebido:', 
        data ? `objeto com ${Object.keys(data).length} chaves` : 'null/undefined');
      
      // Exibir as chaves principais do relatório para debug
      if (data) {
        console.log('📊 Chaves do relatório:', Object.keys(data).join(', '));
        
        // Se tiver uma chave 'dados', mostrar suas chaves também
        if (data.dados && typeof data.dados === 'object') {
          console.log('📊 Chaves dentro de "dados":', Object.keys(data.dados).join(', '));
        }
      }
      
      setReportData(data);
    } catch (error) {
      console.error('❌ Erro ao buscar relatório:', error);
      setError('Não foi possível obter os dados do relatório');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  // Carregar dados quando o componente montar ou quando o ID mudar
  useEffect(() => {
    loadData();
  }, [loadData]);

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
    
    // Primeiro, aplicar o filtro para remover as entradas de TROCA DE TURNO
    const arrayFiltrado = filtrarTrocaDeTurno(array);
    
    // Log de entrada para debug
    console.log(`📊 Calculando média para propriedade "${propriedade}" com ${arrayFiltrado.length} itens (após filtrar TROCA DE TURNO)`);
    
    // Filtrar apenas itens com valores válidos
    const itensFiltrados = arrayFiltrado.filter(item => {
      if (!item) return false;
      
      // Verificação adicional para garantir que o valor existe e é válido
      const valorExiste = item[propriedade] !== undefined && item[propriedade] !== null;
      
      // Verificar se é TROCA DE TURNO em algum campo
      if (
        (item.operador && typeof item.operador === 'string' && item.operador.includes('TROCA DE TURNO')) ||
        (item.nome && typeof item.nome === 'string' && item.nome.includes('TROCA DE TURNO')) ||
        (item.frota && (
          (typeof item.frota === 'string' && (item.frota.includes('TROCA DE TURNO') || item.frota === '9999')) ||
          (typeof item.frota === 'number' && item.frota === 9999)
        )) ||
        (item.id && (
          (typeof item.id === 'string' && (item.id === '9999' || item.id.includes('TROCA DE TURNO'))) ||
          (typeof item.id === 'number' && item.id === 9999)
        ))
      ) {
        return false;
      }
      
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
    // Se estiver carregando, não processar nada
    if (loading) return exemplosDados;
    
    console.log('📊 Processando relatório:', reportData ? Object.keys(reportData).join(', ') : 'null');
    
    // Se não houver dados do relatório ou se useExampleData estiver definido, usar dados de exemplo
    if (!reportData || useExampleData) {
      console.log("📊 Usando dados de exemplo");
      return exemplosDados;
    }
    
    try {
      // Obter os dados diretamente do relatório
      const dados = reportData;
      
      console.log("📊 Processando dados do relatório:", 
        dados?.disponibilidade_mecanica ? 
          `tem dados diretos: ${dados.disponibilidade_mecanica.length} itens disp. mecânica` : 
          "sem dados diretos"
      );
      
      if (dados?.disponibilidade_mecanica) {
        console.log("📊 Usando dados diretos do relatório");
        
        // Aplicar filtro para remover TROCA DE TURNO
        const dispMecanica = filtrarTrocaDeTurno(Array.isArray(dados.disponibilidade_mecanica) ? dados.disponibilidade_mecanica : []);
        const eficEnerg = filtrarTrocaDeTurno(Array.isArray(dados.eficiencia_energetica) ? dados.eficiencia_energetica : []);
        const motorOcioso = filtrarTrocaDeTurno(Array.isArray(dados.motor_ocioso) ? dados.motor_ocioso : []);
        const faltaApontamento = filtrarTrocaDeTurno(Array.isArray(dados.falta_apontamento) ? dados.falta_apontamento : []);
        const usoGps = filtrarTrocaDeTurno(Array.isArray(dados.uso_gps) ? dados.uso_gps : []);
        
        console.log("📊 Dados após filtrar TROCA DE TURNO:", {
          disponibilidade: dispMecanica.length,
          eficiencia: eficEnerg.length,
          motorOcioso: motorOcioso.length,
          faltaApontamento: faltaApontamento.length,
          usoGps: usoGps.length
        });
        
        // Dados já estão no formato correto na raiz do objeto
        return {
          disponibilidade_mecanica: dispMecanica,
          eficiencia_energetica: eficEnerg,
          motor_ocioso: motorOcioso,
          falta_apontamento: faltaApontamento,
          uso_gps: usoGps,
          exemplosOperadores: eficEnerg.length > 0 
            ? eficEnerg 
            : exemplosDados.exemplosOperadores,
          exemplosFrotas: dispMecanica.length > 0 
            ? dispMecanica 
            : exemplosDados.exemplosFrotas
        };
      } 
      
      if (dados?.dados) {
        console.log("📊 Tentando usar dados do objeto 'dados'");
        
        // Aplicar filtro para remover TROCA DE TURNO
        const dispMecanica = filtrarTrocaDeTurno(Array.isArray(dados.dados.disponibilidade_mecanica) ? dados.dados.disponibilidade_mecanica : []);
        const eficEnerg = filtrarTrocaDeTurno(Array.isArray(dados.dados.eficiencia_energetica) ? dados.dados.eficiencia_energetica : []);
        const motorOcioso = filtrarTrocaDeTurno(Array.isArray(dados.dados.motor_ocioso) ? dados.dados.motor_ocioso : []);
        const faltaApontamento = filtrarTrocaDeTurno(Array.isArray(dados.dados.falta_apontamento) ? dados.dados.falta_apontamento : []);
        const usoGps = filtrarTrocaDeTurno(Array.isArray(dados.dados.uso_gps) ? dados.dados.uso_gps : []);
        
        console.log("📊 Dados após filtrar TROCA DE TURNO:", {
          disponibilidade: dispMecanica.length,
          eficiencia: eficEnerg.length,
          motorOcioso: motorOcioso.length,
          faltaApontamento: faltaApontamento.length,
          usoGps: usoGps.length
        });
        
        // Dados estão dentro da propriedade 'dados'
        return {
          disponibilidade_mecanica: dispMecanica,
          eficiencia_energetica: eficEnerg,
          motor_ocioso: motorOcioso,
          falta_apontamento: faltaApontamento,
          uso_gps: usoGps,
          exemplosOperadores: eficEnerg.length > 0 
            ? eficEnerg 
            : exemplosDados.exemplosOperadores,
          exemplosFrotas: dispMecanica.length > 0 
            ? dispMecanica 
            : exemplosDados.exemplosFrotas
        };
      }
      
      // Se não encontrou dados no formato esperado, usar exemplos
      console.log("❌ Não encontrou dados no formato esperado, usando dados de exemplo");
      return exemplosDados;
    } catch (error) {
      console.error('❌ ERRO NO PROCESSAMENTO DE DADOS:', error);
      return exemplosDados;
    }
  }, [reportData, loading, useExampleData, searchParams]);

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
        {/* Primeira Página - Disponibilidade Mecânica */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader showDate={true} />
            <Box flex="1" display="flex" flexDirection="column">
              {/* Disponibilidade Mecânica */}
              <Box flex="1">
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
                  h="calc(100vh - 50px)"
                  maxH="2000px"
                  overflow="hidden"
                >
                  <GraficoDisponibilidadeMecanicaTransbordo
                    data={dadosProcessados.disponibilidade_mecanica}
                    meta={configManager.getMetas('transbordo_semanal').disponibilidadeMecanica}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>

        {/* Segunda Página - Eficiência Energética */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column">
            <PageHeader showDate={true} />
            <Box flex="1" display="flex" flexDirection="column">
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
                  h="calc(100vh - 50px)"
                  maxH="2000px"
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

        {/* Terceira Página - Motor Ocioso */}
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
                  h="calc(100vh - 50px)"
                  maxH="2000px"
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
              
        {/* Quarta Página - Falta Apontamento */}
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
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100vh - 50px)"
                  maxH="2000px"
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
        
        {/* Quinta Página - Uso GPS */}
        {secoes.usoGPS && (
          <A4Colheita>
            <Box h="100%" display="flex" flexDirection="column">
              <PageHeader showDate={true} />
              <Box flex="1" display="flex" flexDirection="column">
                {/* Uso GPS */}
                <Box flex="1">
                  <SectionTitle title="Uso GPS" />
                  <SimpleGrid columns={1} spacing={3} w="100%" mb={2}>
                    {dadosProcessados.uso_gps.length > 0 && (
                      <IndicatorCard
                        title=""
                        value={calcularMedia(dadosProcessados.uso_gps, 'porcentagem')}
                        meta={configManager.getMetas('transbordo_semanal').usoGPS}
                        unitType="porcentagem"
                        acimaMeta={{
                          quantidade: contarItensMeta(dadosProcessados.uso_gps, 'porcentagem', configManager.getMetas('transbordo_semanal').usoGPS),
                          total: dadosProcessados.uso_gps.length,
                          percentual: (contarItensMeta(dadosProcessados.uso_gps, 'porcentagem', configManager.getMetas('transbordo_semanal').usoGPS) / dadosProcessados.uso_gps.length) * 100
                        }}
                      />
                    )}
                  </SimpleGrid>
                  <Box 
                    border="1px solid"
                    borderColor="black"
                    borderRadius="md"
                    p={2}
                    h="calc(100vh - 50px)"
                    maxH="2000px"
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
        
        {/* Sexta Página - Resumo de Frotas */}
        <A4Colheita>
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
              <Box>
                <Text fontSize="14px" fontWeight="bold" color="black" mb={2} textAlign="center">
                  Resumo de Frotas
                </Text>
                <Box>
                  <TabelaFrotas 
                    dados={dadosProcessados.disponibilidade_mecanica
                      .filter((item: any) => {
                        // Verificar se frota é 0
                        if (item.frota === 0 || item.frota === '0') return false;
                        
                        // Verificar TROCA DE TURNO e 9999 para string
                        if (typeof item.frota === 'string') {
                          if (item.frota.includes('TROCA DE TURNO') || item.frota === '9999') 
                            return false;
                        }
                        
                        // Verificar 9999 para número
                        if (typeof item.frota === 'number' && item.frota === 9999) 
                          return false;
                          
                        return true;
                      })
                      .map((item: { frota: any; disponibilidade: number }) => ({
                        frota: String(item.frota),
                        disponibilidade: item.disponibilidade
                      }))
                    }
                    tipo="transbordo_semanal"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
        
        {/* Sétima Página - Resumo de Operadores */}
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

              {/* Seção Operadores */}
              <Box>
                <Text fontSize="14px" fontWeight="bold" color="black" mb={2} textAlign="center">
                  Resumo de Operadores
                </Text>
                <Box>
                  <TabelaOperadores 
                    dados={{
                      ...dadosProcessados,
                      // Garantir que todos os conjuntos de dados estejam filtrados
                      eficiencia_energetica: dadosProcessados.eficiencia_energetica.filter(
                        item => !((item.operador && typeof item.operador === 'string' && item.operador.includes('TROCA DE TURNO')) || 
                                 (item.nome && typeof item.nome === 'string' && item.nome.includes('TROCA DE TURNO')) || 
                                 (item.id && (
                                    (typeof item.id === 'string' && (item.id === '9999' || item.id.includes('TROCA DE TURNO'))) || 
                                    (typeof item.id === 'number' && item.id === 9999)
                                  )))
                      )
                    }}
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