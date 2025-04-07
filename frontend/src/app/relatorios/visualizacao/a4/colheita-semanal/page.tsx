'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid, Center, Spinner, Grid, GridItem, Card, CardBody } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';
import { GraficoDisponibilidadeMecanicaColheita } from '@/components/Charts/Colheita/Diario/GraficoDisponibilidadeMecanicaColheita';
import { GraficoEficienciaEnergetica } from '@/components/Charts/Colheita/Diario/GraficoEficienciaEnergetica';
import { GraficoHorasElevador } from '@/components/Charts/Colheita/Diario/GraficoHorasElevador';
import { GraficoMotorOciosoColheita } from '@/components/Charts/Colheita/Diario/GraficoMotorOciosoColheita';
import { GraficoUsoGPS } from '@/components/Charts/Colheita/Diario/GraficoUsoGPS';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { configManager } from '@/utils/config';
import { GraficoTDH } from '@/components/Charts/Colheita/Semanal/GraficoTDH';
import { GraficoDiesel } from '@/components/Charts/Colheita/Semanal/GraficoDiesel';
import { GraficoImpurezaVegetal } from '@/components/Charts/Colheita/Semanal/GraficoImpurezaVegetal';
import { DateRangeDisplay } from '@/components/DateRangeDisplay';
import { useReportData } from '@/hooks/useReportData';
import RelatorioColheitaSemanalResumo, { ResumoData, MetricData, FrotaData, OperadorData } from '@/components/RelatorioColheitaSemanalResumo';
import TabelaOperadores from '@/components/TabelaOperadores';
import TabelaFrotas from '@/components/TabelaFrotas';
import IndicatorCard from '@/components/IndicatorCard';

// Dados de exemplo para visualização offline
const dadosExemplo = {
  tdh: [
    { frota: '7041', valor: 0.010 },
    { frota: '7042', valor: 0.014 }
  ],
  diesel: [
    { frota: '7041', valor: 0.080 },
    { frota: '7042', valor: 0.497 }
  ],
  impureza_vegetal: [
    { frota: '7041', valor: 65.00 },
    { frota: '7042', valor: 65.74 }
  ],
  disponibilidade_mecanica: [
    { frota: '7041', disponibilidade: 94.49 },
    { frota: '7042', disponibilidade: 92.82 }
  ],
  eficiencia_energetica: [
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', eficiencia: 59 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', eficiencia: 60 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', eficiencia: 38 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', eficiencia: 38 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', eficiencia: 55 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', eficiencia: 31 }
  ],
  hora_elevador: [
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', horas: 7.42 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', horas: 6.33 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', horas: 4.54 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', horas: 4.62 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', horas: 5.10 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', horas: 0.42 }
  ],
  motor_ocioso: [
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', percentual: 25.1 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', percentual: 22.0 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', percentual: 40.1 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', percentual: 31.5 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', percentual: 32.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', percentual: 36.8 }
  ],
  uso_gps: [
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', porcentagem: 90.0 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', porcentagem: 85.0 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', porcentagem: 82.3 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', porcentagem: 81.7 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', porcentagem: 80.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', porcentagem: 80.0 }
  ]
};

interface ColheitaA4Props {
  data?: any;
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
  
  const temHorasElevador = Array.isArray(dados.hora_elevador) && 
    dados.hora_elevador.length > 0 &&
    dados.hora_elevador.some((item: any) => item && item.nome && item.horas !== undefined);
  
  const temMotorOcioso = Array.isArray(dados.motor_ocioso) && 
    dados.motor_ocioso.length > 0 &&
    dados.motor_ocioso.some((item: any) => item && item.nome && item.percentual !== undefined);
  
  const temUsoGPS = Array.isArray(dados.uso_gps) && 
    dados.uso_gps.length > 0 &&
    dados.uso_gps.some((item: any) => item && item.nome && item.porcentagem !== undefined);
  
  // Verificar se pelo menos uma das seções tem dados
  return temDisponibilidade || temEficiencia || temHorasElevador || temMotorOcioso || temUsoGPS;
};

// Componente para título de seção
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

interface DataItem {
  frota?: string;
  valor?: number;
  disponibilidade?: number;
  operador?: string;
  horas?: number;
  percentual?: number;
  porcentagem?: number;
}

interface AcimaMeta {
  quantidade: number;
  total: number;
  percentual: number;
}

interface Metas {
  tdh: number;
  diesel: number;
  impureza_vegetal: number;
  disponibilidadeMecanica: number;
  eficienciaEnergetica: number;
  horaElevador: number;
  motorOcioso: number;
  usoGPS: number;
}

export default function ColheitaA4({ data }: ColheitaA4Props) {
  // Hooks e estados
  const { images } = useReportStore();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const format = searchParams.get('format');
  const isPdfMode = format === 'pdf';
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nomeFrente, setNomeFrente] = useState<string>('');
  
  // Função para formatar a data no padrão brasileiro
  const formatarData = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const currentDate = formatarData(new Date().toISOString().split('T')[0]);
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  // Verificar configuração para mostrar ou esconder componentes
  const secoes = useMemo(() => {
    // Obter configurações de seções para o tipo de relatório
    const tipoRelatorio = reportData?.metadata?.type || 'colheita_semanal';
    const configSections = configManager.getTipoRelatorio(tipoRelatorio)?.secoes || {
      tdh: true,
      diesel: true,
      impurezaVegetal: true,
      disponibilidadeMecanica: true,
      eficienciaEnergetica: true,
      motorOcioso: true,
      horaElevador: true,
      usoGPS: true
    };
    
    return configSections;
  }, [reportData?.metadata?.type]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Recarrega as configurações antes de carregar os dados
        await configManager.reloadConfig();
        
        const fetchReportData = async () => {
          // Se não tiver ID, apenas mostrar o layout com dados de exemplo
          if (!reportId) {
            setLoading(false);
            return;
          }

          try {
            const { data: report, error } = await supabase
              .from('relatorios_semanais')
              .select('*')
              .eq('id', reportId)
              .single();

            if (error) {
              console.error('❌ Erro ao buscar dados:', error);
              setError(`Erro ao buscar dados: ${error.message}`);
              setLoading(false);
              return;
            }

            if (!report) {
              console.error('❌ Relatório não encontrado');
              setError('Relatório não encontrado');
              setLoading(false);
              return;
            }

            setReportData(report);
            setNomeFrente(report.frente || ''); // Atualiza o nome da frente
            setLoading(false);
          } catch (error) {
            console.error('❌ Erro ao buscar dados:', error);
            setError(`Erro ao buscar dados: ${error instanceof Error ? error.message : 'Desconhecido'}`);
            setLoading(false);
          }
        };

        fetchReportData();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, [reportId]); // Mudando para usar apenas reportId como dependência

  // PREPARAÇÃO DE DADOS
  const finalData = useMemo(() => {
    if (!reportData?.dados) {
      return dadosExemplo;
    }
    
    // Função auxiliar para processar operador no formato "ID - NOME"
    const processarOperador = (operador: any) => {
      if (!operador || operador === 0) return null;
      
      const operadorStr = String(operador).trim();
      
      // Pular se for TROCA DE TURNO
      if (operadorStr === 'TROCA DE TURNO' || operadorStr === '9999 - TROCA DE TURNO') {
        return null;
      }
      
      // Se tiver o formato "ID - Nome"
      if (operadorStr.includes(' - ')) {
        const [id, nome] = operadorStr.split(' - ', 2);
        return { id, nome: nome.trim() };
      }
      
      // Se for apenas um nome
      return { id: operadorStr, nome: operadorStr };
    };

    // Função auxiliar para converter número
    const converterNumero = (valor: any) => {
      if (typeof valor === 'number') return valor;
      if (typeof valor === 'string') return parseFloat(valor);
      return 0;
    };

    // Função auxiliar para processar porcentagem
    const processarPorcentagem = (valor: any) => {
      const numero = converterNumero(valor);
      return numero * 100; // Converter para porcentagem sem arredondar
    };

    // Garantir que os dados estejam no formato correto
    const dadosProcessados = {
      tdh: Array.isArray(reportData.dados.tdh) 
        ? reportData.dados.tdh
            .filter((item: any) => item && item.Frota && item.TDH !== undefined)
            .map((item: any) => ({
              frota: String(item.Frota),
              valor: converterNumero(item.TDH)
            }))
        : [],
      diesel: Array.isArray(reportData.dados.diesel) 
        ? reportData.dados.diesel
            .filter((item: any) => item && item.Frota && item.Consumo !== undefined)
            .map((item: any) => ({
              frota: String(item.Frota),
              valor: converterNumero(item.Consumo)
            }))
        : [],
      impureza_vegetal: Array.isArray(reportData.dados.impureza_vegetal) 
        ? reportData.dados.impureza_vegetal
            .filter((item: any) => item && item.Frota && item.Impureza !== undefined)
            .map((item: any) => ({
              frota: String(item.Frota),
              valor: converterNumero(item.Impureza)
            }))
        : [],
      disponibilidade_mecanica: Array.isArray(reportData.dados.disponibilidade_mecanica) 
        ? reportData.dados.disponibilidade_mecanica
            .filter((item: any) => item && item.Frota && item.Disponibilidade !== undefined)
            .map((item: any) => ({
              frota: String(item.Frota),
              disponibilidade: processarPorcentagem(item.Disponibilidade)
            }))
        : [],
      eficiencia_energetica: Array.isArray(reportData.dados.eficiencia_energetica)
        ? reportData.dados.eficiencia_energetica
            .filter((item: any) => item && item.Operador && item.Operador !== 0)
            .map((item: any) => {
              const operador = processarOperador(item.Operador);
              if (!operador) return null;
              return {
                id: operador.id,
                nome: operador.nome,
                eficiencia: processarPorcentagem(item["Eficiência Energética"])
              };
            })
            .filter((item: any) => item !== null)
            .sort((a: any, b: any) => b.eficiencia - a.eficiencia)
        : [],
      hora_elevador: Array.isArray(reportData.dados.hora_elevador)
        ? reportData.dados.hora_elevador
            .filter((item: any) => item && item.Operador && item.Operador !== 0)
            .map((item: any) => {
              const operador = processarOperador(item.Operador);
              if (!operador) return null;
              return {
                id: operador.id,
                nome: operador.nome,
                horas: converterNumero(item.Horas)
              };
            })
            .filter((item: any) => item !== null)
        : [],
      motor_ocioso: Array.isArray(reportData.dados.motor_ocioso)
        ? reportData.dados.motor_ocioso
            .filter((item: any) => item && item.Operador && item.Operador !== 0)
            .map((item: any) => {
              const operador = processarOperador(item.Operador);
              if (!operador) return null;
              return {
                id: operador.id,
                nome: operador.nome,
                percentual: processarPorcentagem(item["Porcentagem Ociosa"])
              };
            })
            .filter((item: any) => item !== null)
        : [],
      uso_gps: Array.isArray(reportData.dados.uso_gps)
        ? reportData.dados.uso_gps
            .filter((item: any) => item && item.Operador && item.Operador !== 0)
            .map((item: any) => {
              const operador = processarOperador(item.Operador);
              if (!operador) return null;
              return {
                id: operador.id,
                nome: operador.nome,
                porcentagem: processarPorcentagem(item["Porcentagem Uso"])
              };
            })
            .filter((item: any) => item !== null)
        : []
    };

    return dadosProcessados;
  }, [reportData]);

  // Preparar os arrays de dados
  const finalDataDisponibilidade = useMemo(() => {
    const data = Array.isArray(finalData.disponibilidade_mecanica) ? finalData.disponibilidade_mecanica : [];
    return data;
  }, [finalData]);
  
  const finalDataEficiencia = useMemo(() => {
    const data = Array.isArray(finalData.eficiencia_energetica) ? finalData.eficiencia_energetica : [];
    return data;
  }, [finalData]);
  
  const finalDataHorasElevador = useMemo(() => {
    const data = Array.isArray(finalData.hora_elevador) ? finalData.hora_elevador : [];
    return data;
  }, [finalData]);
  
  const finalDataMotorOcioso = useMemo(() => {
    const data = Array.isArray(finalData.motor_ocioso) ? finalData.motor_ocioso : [];
    return data;
  }, [finalData]);
  
  const finalDataUsoGPS = useMemo(() => {
    const data = Array.isArray(finalData.uso_gps) ? finalData.uso_gps : [];
    return data;
  }, [finalData]);

  // Verificar se estamos no modo de visualização ou no modo de relatório específico
  const isModoTemplate = !reportId;

  // FUNÇÕES
  // Função para calcular média
  const calcularMedia = (array: any[] | undefined, propriedade: string): number => {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return 0;
    }
    
    // Filtrar apenas itens com valores válidos
    const itensFiltrados = array.filter(item => {
      if (!item) return false;
      
      // Verificação adicional para garantir que o valor existe e é válido
      const valor = item[propriedade];
      const valorExiste = valor !== undefined && valor !== null;
      const valorValido = typeof valor === 'number' || (typeof valor === 'string' && !isNaN(parseFloat(valor)));
      
      if (!valorExiste || !valorValido) {
        return false;
      }
      
      // Para disponibilidade, verificar se tem frota
      if (propriedade === 'disponibilidade') {
        return item.frota && item.frota.trim() !== '' && valorExiste && valorValido;
      }
      
      // Para valor (TDH, diesel, impureza)
      if (propriedade === 'valor') {
        return item.frota && item.frota.trim() !== '' && valorExiste && valorValido;
      }
      
      // Para outros, verificar se tem nome de operador
      return item.nome && item.nome.trim() !== '' && valorExiste && valorValido;
    });
    
    // Se não há itens válidos, retorna zero
    if (itensFiltrados.length === 0) {
      return 0;
    }
    
    // Convertendo cada valor para número com cuidado para preservar valores pequenos
    const valores = itensFiltrados.map(item => {
      const valor = item[propriedade];
      
      // Garantir que valores sejam tratados corretamente
      if (typeof valor === 'string') {
        return parseFloat(valor.replace(',', '.').replace('%', ''));
      }
      return typeof valor === 'number' ? valor : 0;
    });
    
    // Calculando a soma manualmente para garantir precisão com números pequenos
    let soma = 0;
    for (let i = 0; i < valores.length; i++) {
      soma += valores[i];
    }
    
    // Calcular média com alta precisão
    const media = soma / valores.length;
    
    // Retorna a média calculada sem arredondar
    return media;
  };

  // Função para calcular total
  const calcularTotal = (array: any[] | undefined, propriedade: string): number => {
    if (!array || array.length === 0) return 0;
    
    // Filtrar apenas itens que têm operador preenchido
    const itensFiltrados = array.filter(item => 
      item && item.nome && item.nome.trim() !== ''
    );
    
    // Soma apenas os itens com operador válido
    return itensFiltrados.reduce((acc: number, item: any) => acc + Number(item[propriedade] || 0), 0);
  };

  // Função para contar itens que atendem à meta
  const contarItensMeta = (array: any[] | undefined, propriedade: string, meta: number, acima: boolean = true): number => {
    if (!array || array.length === 0) return 0;
    
    // Filtrar apenas itens que têm operador/frota preenchidos
    const itensFiltrados = array.filter(item => {
      if (!item) return false;
      
      // Para disponibilidade, verificar se tem frota
      if (propriedade === 'disponibilidade') {
        return item.frota && item.frota.trim() !== '';
      }
      
      // Para outros, verificar se tem nome de operador
      return item.nome && item.nome.trim() !== '';
    });
    
    // Conta itens que atendem à meta
    return itensFiltrados.filter(item => 
      acima ? (Number(item[propriedade] || 0) >= meta) : (Number(item[propriedade] || 0) <= meta)
    ).length;
  };

  // COMPONENTES
  // Componente para o cabeçalho da página
  const PageHeader = ({ showDate = false }: { showDate?: boolean }) => {
    const { reportData } = useReportData();
    const startDate = reportData?.startDate ? new Date(reportData.startDate) : new Date();
    const endDate = reportData?.endDate ? new Date(reportData.endDate) : new Date();
    const frontName = reportData?.frontName || 'Frente 01';

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
            {`Relatório Semanal de Colheita - ${frontName} `} 
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

  // Preparar dados para TDH
  const finalDataTDH = useMemo(() => {
    if (!reportData?.tdh) return [];
    return reportData.tdh
      .filter((item: any) => item && item.frota && item.frota.trim() !== '')
      .map((item: any) => ({
        frota: item.frota,
        valor: item.valor
      }));
  }, [reportData]);

  // Preparar dados para Diesel
  const finalDataDiesel = useMemo(() => {
    if (!reportData?.diesel) return [];
    return reportData.diesel
      .filter((item: any) => item && item.frota && item.frota.trim() !== '')
      .map((item: any) => ({
        frota: item.frota,
        valor: item.valor
      }));
  }, [reportData]);

  // Preparar dados para Impureza Vegetal
  const finalDataImpureza = useMemo(() => {
    if (!reportData?.impureza_vegetal) return [];
    return reportData.impureza_vegetal
      .filter((item: any) => item && item.frota && item.frota.trim() !== '')
      .map((item: any) => ({
        frota: item.frota,
        valor: item.valor
      }));
  }, [reportData]);

  // Processamento dos dados para o resumo
  const processarDadosResumo = (dados: any): ResumoData => {
    const metasConfig = configManager.getMetas('colheita_semanal');
    const metas: Metas = {
      tdh: metasConfig?.tdh ?? 0.0124,
      diesel: metasConfig?.diesel ?? 0.718,
      impureza_vegetal: metasConfig?.impureza_vegetal ?? 64,
      disponibilidadeMecanica: metasConfig?.disponibilidadeMecanica ?? 90,
      eficienciaEnergetica: metasConfig?.eficienciaEnergetica ?? 70,
      horaElevador: metasConfig?.horaElevador ?? 5,
      motorOcioso: metasConfig?.motorOcioso ?? 4,
      usoGPS: metasConfig?.usoGPS ?? 90
    };
    
    return {
      tdh: {
        data: dados.tdh || [],
        meta: metas.tdh,
        media: calcularMedia(dados.tdh, 'valor'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.tdh, 'valor', metas.tdh, false),
          total: (dados.tdh || []).length,
          percentual: ((contarItensMeta(dados.tdh, 'valor', metas.tdh, false) / (dados.tdh || []).length) * 100) || 0
        }
      },
      diesel: {
        data: dados.diesel || [],
        meta: metas.diesel,
        media: calcularMedia(dados.diesel, 'valor'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.diesel, 'valor', metas.diesel, false),
          total: (dados.diesel || []).length,
          percentual: ((contarItensMeta(dados.diesel, 'valor', metas.diesel, false) / (dados.diesel || []).length) * 100) || 0
        }
      },
      impurezaVegetal: {
        data: dados.impureza_vegetal || [],
        meta: metas.impureza_vegetal,
        media: calcularMedia(dados.impureza_vegetal, 'valor'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.impureza_vegetal, 'valor', metas.impureza_vegetal, false),
          total: (dados.impureza_vegetal || []).length,
          percentual: ((contarItensMeta(dados.impureza_vegetal, 'valor', metas.impureza_vegetal, false) / (dados.impureza_vegetal || []).length) * 100) || 0
        }
      },
      disponibilidadeMecanica: {
        data: dados.disponibilidade_mecanica || [],
        meta: metas.disponibilidadeMecanica,
        media: calcularMedia(dados.disponibilidade_mecanica, 'disponibilidade'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.disponibilidade_mecanica, 'disponibilidade', metas.disponibilidadeMecanica),
          total: (dados.disponibilidade_mecanica || []).length,
          percentual: ((contarItensMeta(dados.disponibilidade_mecanica, 'disponibilidade', metas.disponibilidadeMecanica) / (dados.disponibilidade_mecanica || []).length) * 100) || 0
        }
      },
      eficienciaEnergetica: {
        data: dados.eficiencia_energetica || [],
        meta: metas.eficienciaEnergetica,
        media: calcularMedia(dados.eficiencia_energetica, 'eficiencia'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.eficiencia_energetica, 'eficiencia', metas.eficienciaEnergetica),
          total: (dados.eficiencia_energetica || []).length,
          percentual: ((contarItensMeta(dados.eficiencia_energetica, 'eficiencia', metas.eficienciaEnergetica) / (dados.eficiencia_energetica || []).length) * 100) || 0
        }
      },
      horaElevador: {
        data: dados.hora_elevador || [],
        meta: metas.horaElevador,
        media: calcularMedia(dados.hora_elevador, 'horas'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.hora_elevador, 'horas', metas.horaElevador),
          total: (dados.hora_elevador || []).length,
          percentual: ((contarItensMeta(dados.hora_elevador, 'horas', metas.horaElevador) / (dados.hora_elevador || []).length) * 100) || 0
        }
      },
      motorOcioso: {
        data: dados.motor_ocioso || [],
        meta: metas.motorOcioso,
        media: calcularMedia(dados.motor_ocioso, 'percentual'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.motor_ocioso, 'percentual', metas.motorOcioso, false),
          total: (dados.motor_ocioso || []).length,
          percentual: ((contarItensMeta(dados.motor_ocioso, 'percentual', metas.motorOcioso, false) / (dados.motor_ocioso || []).length) * 100) || 0
        }
      },
      usoGPS: {
        data: dados.uso_gps || [],
        meta: metas.usoGPS,
        media: calcularMedia(dados.uso_gps, 'porcentagem'),
        acimaMeta: {
          quantidade: contarItensMeta(dados.uso_gps, 'porcentagem', metas.usoGPS),
          total: (dados.uso_gps || []).length,
          percentual: ((contarItensMeta(dados.uso_gps, 'porcentagem', metas.usoGPS) / (dados.uso_gps || []).length) * 100) || 0
        }
      },
      frotas: (dados.disponibilidade_mecanica || []).map((frota: any) => {
        const tdh = dados.tdh?.find((item: any) => item.frota === frota.frota);
        const diesel = dados.diesel?.find((item: any) => item.frota === frota.frota);
        const impureza = dados.impureza_vegetal?.find((item: any) => item.frota === frota.frota);
        
        return {
          id: frota.frota,
          tdh: tdh?.valor ?? 0,
          diesel: diesel?.valor ?? 0,
          disponibilidade: frota.disponibilidade,
          impureza: impureza?.valor ?? 0
        };
      }),
      operadores: (dados.eficiencia_energetica || []).map((operador: any) => {
        const horasElevador = dados.hora_elevador?.find((item: any) => item.id === operador.id);
        const motorOcioso = dados.motor_ocioso?.find((item: any) => item.id === operador.id);
        const usoGPS = dados.uso_gps?.find((item: any) => item.id === operador.id);
        
        return {
          id: operador.nome,
          eficiencia: operador.eficiencia,
          horasElevador: horasElevador?.horas ?? 0,
          motorOcioso: motorOcioso?.percentual ?? 0,
          usoGPS: usoGPS?.porcentagem ?? 0
        };
      })
    };
  };

  // RENDERIZAÇÃO CONDICIONAL
  // Se estiver carregando, mostrar indicador de loading
  if (loading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text>Carregando dados do relatório...</Text>
        </VStack>
      </Center>
    );
  }
  
  // RENDERIZAÇÃO PRINCIPAL
  return (
    <Box 
      className="report-content" 
      sx={{ 
        '@media print': { 
          m: '0 !important', 
          p: '0 !important',
          breakInside: 'avoid !important',
          breakBefore: 'avoid !important',
          breakAfter: 'avoid !important',
          pageBreakAfter: 'avoid !important',
          pageBreakBefore: 'avoid !important',
          '& > *': {
            m: '0 !important',
            p: '0 !important'
          }
        } 
      }}
    >
      {/* Página 1 - TDH, Diesel, Disponibilidade e Impureza */}
      {secoes.tdh && (
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white" sx={{ '@media print': { breakInside: 'avoid !important', m: '0 !important', p: '0 !important' } }}>
            <PageHeader showDate={true} />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* TDH */}
              <Box flex="1" mb={3}>
                <SectionTitle title="TDH" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100% - 25px)"
                >
                  <GraficoTDH 
                    data={finalDataTDH} 
                    meta={configManager.getMetas('colheita_semanal').tdh} 
                  />
                </Box>
              </Box>
              
              {/* Diesel */}
              <Box flex="1" mb={3}>
                <SectionTitle title="Consumo de Diesel" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoDiesel 
                    data={finalDataDiesel} 
                    meta={configManager.getMetas('colheita_semanal').diesel} 
                  />
                </Box>
              </Box>

              {/* Disponibilidade Mecânica */}
              <Box flex="1" mb={3}>
                <SectionTitle title="Disponibilidade Mecânica" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoDisponibilidadeMecanicaColheita 
                    data={finalDataDisponibilidade} 
                    meta={configManager.getMetas('colheita_semanal').disponibilidadeMecanica} 
                  />
                </Box>
              </Box>
              
              {/* Impureza Vegetal */}
              <Box flex="1">
                <SectionTitle title="Impureza Vegetal" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoImpurezaVegetal 
                    data={finalDataImpureza} 
                    meta={configManager.getMetas('colheita_semanal').impureza_vegetal} 
                  />
                </Box>
              </Box>
            </Flex>
          </Box>
        </A4Colheita>
      )}
      
      {/* Página 2 - Eficiência Energética e Horas Elevador */}
      {secoes.eficienciaEnergetica && (
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader showDate={false} />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* Eficiência Energética */}
              <Box flex="1" mb={6}>
                <SectionTitle title="Eficiência Energética" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoEficienciaEnergetica 
                    data={finalDataEficiencia} 
                    meta={configManager.getMetas('colheita_semanal').eficienciaEnergetica} 
                  />
                </Box>
              </Box>
              
              {/* Horas Elevador */}
              <Box flex="1">
                <SectionTitle title="Horas Elevador" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoHorasElevador 
                    data={finalDataHorasElevador} 
                    meta={configManager.getMetas('colheita_semanal').horaElevador} 
                  />
                </Box>
              </Box>
            </Flex>
          </Box>
        </A4Colheita>
      )}
      
      {/* Página 3 - Motor Ocioso e Uso GPS */}
      {secoes.motorOcioso && (
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader showDate={false} />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* Motor Ocioso */}
              <Box flex="1" mb={6}>
                <SectionTitle title="Motor Ocioso" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoMotorOciosoColheita 
                    data={finalDataMotorOcioso} 
                    meta={configManager.getMetas('colheita_semanal').motorOcioso} 
                  />
                </Box>
              </Box>
              
              {/* Uso GPS */}
              <Box flex="1">
                <SectionTitle title="Uso GPS" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={3}
                  h="calc(100% - 25px)"
                >
                  <GraficoUsoGPS 
                    data={finalDataUsoGPS} 
                    meta={reportData?.metas?.usoGPS || configManager.getMetas('colheita_semanal').usoGPS} 
                  />
                </Box>
              </Box>
            </Flex>
          </Box>
        </A4Colheita>
      )}
      
      {/* Página 4 - Resumo */}
      <A4Colheita isLastPage={true}>
        <Box h="100%" display="flex" flexDirection="column" bg="white">
          <PageHeader showDate={false} />
          
          <Box flex="1" p={4}>
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
              Resumo do Relatório de Colheita Semanal
            </Heading>

            {/* Seção Frotas */}
            <Box mb={6}>
              <SectionTitle title="Frotas" centered={true} />
              
              {/* Cards de indicadores de frotas */}
              <SimpleGrid columns={2} spacing={4} mb={4}>
                <IndicatorCard 
                  title="Consumo de TDH"
                  value={processarDadosResumo(reportData ?? dadosExemplo).tdh?.media ?? 0}
                  meta={processarDadosResumo(reportData ?? dadosExemplo).tdh?.meta ?? 0}
                  isInverted={true}
                  unitType="decimal"
                  acimaMeta={processarDadosResumo(reportData ?? dadosExemplo).tdh?.acimaMeta}
                />
                <IndicatorCard 
                  title="Consumo de Diesel"
                  value={processarDadosResumo(reportData ?? dadosExemplo).diesel?.media ?? 0}
                  meta={processarDadosResumo(reportData ?? dadosExemplo).diesel?.meta ?? 0}
                  isInverted={true}
                  unitType="decimal"
                  acimaMeta={processarDadosResumo(reportData ?? dadosExemplo).diesel?.acimaMeta}
                />
                <IndicatorCard 
                  title="Disponibilidade Mecânica"
                  value={processarDadosResumo(reportData ?? dadosExemplo).disponibilidadeMecanica?.media ?? 0}
                  meta={processarDadosResumo(reportData ?? dadosExemplo).disponibilidadeMecanica?.meta ?? 0}
                  unitType="porcentagem"
                  acimaMeta={processarDadosResumo(reportData ?? dadosExemplo).disponibilidadeMecanica?.acimaMeta}
                />
                <IndicatorCard 
                  title="Impureza Vegetal"
                  value={processarDadosResumo(reportData ?? dadosExemplo).impurezaVegetal?.media ?? 0}
                  meta={processarDadosResumo(reportData ?? dadosExemplo).impurezaVegetal?.meta ?? 0}
                  isInverted={true}
                  unitType="porcentagem"
                  acimaMeta={processarDadosResumo(reportData ?? dadosExemplo).impurezaVegetal?.acimaMeta}
                />
              </SimpleGrid>

              {/* Tabela de frotas */}
              <TabelaFrotas 
                dados={reportData ? reportData.dados.disponibilidade_mecanica : dadosExemplo.disponibilidade_mecanica} 
                tipo="colheita_semanal" 
                dadosCompletos={{
                  tdh: reportData ? reportData.dados.tdh : dadosExemplo.tdh,
                  diesel: reportData ? reportData.dados.diesel : dadosExemplo.diesel,
                  impureza_vegetal: reportData ? reportData.dados.impureza_vegetal : dadosExemplo.impureza_vegetal
                }}
              />
            </Box>

            {/* Seção Operadores */}
            <Box>
              <SectionTitle title="Operadores" centered={true} />
              
              {/* Cards de indicadores de operadores */}
              <SimpleGrid columns={2} spacing={4} mb={4}>
                <IndicatorCard 
                  title="Eficiência Energética"
                  value={processarDadosResumo(reportData ?? dadosExemplo).eficienciaEnergetica.media || 0}
                  meta={processarDadosResumo(reportData ?? dadosExemplo).eficienciaEnergetica.meta || 0}
                  unitType="porcentagem"
                  acimaMeta={processarDadosResumo(reportData ?? dadosExemplo).eficienciaEnergetica.acimaMeta}
                />
                <IndicatorCard 
                  title="Horas Elevador"
                  value={processarDadosResumo(reportData ?? dadosExemplo).horaElevador.media || 0}
                  meta={processarDadosResumo(reportData ?? dadosExemplo).horaElevador.meta || 0}
                  unitType="horas"
                  acimaMeta={processarDadosResumo(reportData ?? dadosExemplo).horaElevador.acimaMeta}
                />
                <IndicatorCard 
                  title="Motor Ocioso"
                  value={processarDadosResumo(reportData ?? dadosExemplo).motorOcioso.media || 0}
                  meta={processarDadosResumo(reportData ?? dadosExemplo).motorOcioso.meta || 0}
                  isInverted={true}
                  unitType="porcentagem"
                  acimaMeta={processarDadosResumo(reportData ?? dadosExemplo).motorOcioso.acimaMeta}
                />
                <IndicatorCard 
                  title="Uso GPS"
                  value={processarDadosResumo(reportData ?? dadosExemplo).usoGPS.media || 0}
                  meta={processarDadosResumo(reportData ?? dadosExemplo).usoGPS.meta || 0}
                  unitType="porcentagem"
                  acimaMeta={processarDadosResumo(reportData ?? dadosExemplo).usoGPS.acimaMeta}
                />
              </SimpleGrid>

              {/* Tabela de operadores */}
              <TabelaOperadores dados={{
                eficiencia_energetica: reportData ? reportData.dados.eficiencia_energetica : dadosExemplo.eficiencia_energetica,
                motor_ocioso: reportData ? reportData.dados.motor_ocioso : dadosExemplo.motor_ocioso,
                hora_elevador: reportData ? reportData.dados.hora_elevador : dadosExemplo.hora_elevador,
                uso_gps: reportData ? reportData.dados.uso_gps : dadosExemplo.uso_gps
              }} tipo="colheita_semanal" />
            </Box>
          </Box>
        </Box>
      </A4Colheita>
    </Box>
  );
} 