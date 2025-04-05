'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid, Center, Spinner, Button, Switch, FormControl, FormLabel } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { useReportStore } from '@/store/useReportStore';
import { GraficoDisponibilidadeMecanicaColheita } from '@/components/Charts/Colheita/Diario/GraficoDisponibilidadeMecanicaColheita';
import { GraficoEficienciaEnergetica } from '@/components/Charts/Colheita/Diario/GraficoEficienciaEnergetica';
import { GraficoHorasElevador } from '@/components/Charts/Colheita/Diario/GraficoHorasElevador';
import { GraficoMotorOciosoColheita } from '@/components/Charts/Colheita/Diario/GraficoMotorOciosoColheita';
import { GraficoUsoGPS } from '@/components/Charts/Colheita/Diario/GraficoUsoGPS';
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
  tdh: [
    { frota: '7041', valor: 0.0100 },
    { frota: '7042', valor: 0.0098 }
  ],
  diesel: [
    { frota: '7041', valor: 0.0800 },
    { frota: '7042', valor: 0.0780 }
  ],
  impureza_vegetal: [
    { frota: '7041', valor: 65.00 },
    { frota: '7042', valor: 63.50 }
  ],
  disponibilidade_mecanica: [
    { frota: '7041', disponibilidade: 94.49 },
    { frota: '7042', disponibilidade: 92.82 }
  ],
  eficiencia_energetica: [
    { id: '1', nome: 'SEM OPERADOR', eficiencia: 39 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', eficiencia: 59 },
    { id: '9999', nome: 'TROCA DE TURNO', eficiencia: 53 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', eficiencia: 60 },
    { id: '11', nome: 'NAO CADASTRADO', eficiencia: 62 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', eficiencia: 38 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', eficiencia: 38 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', eficiencia: 55 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', eficiencia: 31 }
  ],
  hora_elevador: [
    { id: '1', nome: 'SEM OPERADOR', horas: 2.42 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', horas: 7.42 },
    { id: '9999', nome: 'TROCA DE TURNO', horas: 7.59 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', horas: 6.33 },
    { id: '11', nome: 'NAO CADASTRADO', horas: 6.26 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', horas: 4.54 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', horas: 4.62 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', horas: 5.10 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', horas: 0.42 }
  ],
  motor_ocioso: [
    { id: '1', nome: 'SEM OPERADOR', percentual: 28.1 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', percentual: 25.1 },
    { id: '9999', nome: 'TROCA DE TURNO', percentual: 29.9 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', percentual: 22.0 },
    { id: '11', nome: 'NAO CADASTRADO', percentual: 19.4 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', percentual: 40.1 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', percentual: 31.5 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', percentual: 32.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', percentual: 36.8 }
  ],
  uso_gps: [
    { id: '1', nome: 'SEM OPERADOR', porcentagem: 0.0 },
    { id: '1292073', nome: 'RENATO SOUZA SANTOS LIMA', porcentagem: 0.0 },
    { id: '9999', nome: 'TROCA DE TURNO', porcentagem: 0.0 },
    { id: '289948', nome: 'FABIO JUNIOR DA SILVA COSTA', porcentagem: 0.0 },
    { id: '11', nome: 'NAO CADASTRADO', porcentagem: 0.0 },
    { id: '379118', nome: 'DAYMAN GARCIA DE SOUZA', porcentagem: 2.3 },
    { id: '507194', nome: 'GERSON RODRIGUES DOS SANTOS', porcentagem: 1.7 },
    { id: '357887', nome: 'EVERTON TIAGO MARQUES', porcentagem: 0.0 },
    { id: '218534', nome: 'ADEMIR CARVALHO DE MELO', porcentagem: 0.0 }
  ]
};

interface ColheitaA4Props {
  data?: any;
}

interface DadosProcessados {
  tdh: Array<{
    frota: string;
    valor: number;
  }>;
  diesel: Array<{
    frota: string;
    valor: number;
  }>;
  impureza_vegetal: Array<{
    frota: string;
    valor: number;
  }>;
  disponibilidade_mecanica: Array<{
    frota: string;
    disponibilidade: number;
  }>;
  eficiencia_energetica: Array<{
    id: string;
    nome: string;
    eficiencia: number;
  }>;
  hora_elevador: Array<{
    id: string;
    nome: string;
    horas: number;
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
}

// Função utilitária para verificar formato de dados
const verificarFormatoDados = (dados: any) => {
  if (!dados) return false;
  
  // Verifica se pelo menos uma das propriedades esperadas existe e tem itens
  const temDisponibilidade = Array.isArray(dados.disponibilidade_mecanica) && 
    dados.disponibilidade_mecanica.length > 0;
  
  const temEficiencia = Array.isArray(dados.eficiencia_energetica) && 
    dados.eficiencia_energetica.length > 0;
  
  const temHorasElevador = Array.isArray(dados.hora_elevador) && 
    dados.hora_elevador.length > 0;
  
  const temMotorOcioso = Array.isArray(dados.motor_ocioso) && 
    dados.motor_ocioso.length > 0;
  
  const temUsoGPS = Array.isArray(dados.uso_gps) && 
    dados.uso_gps.length > 0;
  
  // Verificação alternativa com nomes de campos em CamelCase ou outras variações
  const temDisponibilidadeAlt = Array.isArray(dados.disponibilidadeMecanica) && 
    dados.disponibilidadeMecanica.length > 0;
  
  const temEficienciaAlt = Array.isArray(dados.eficienciaEnergetica) && 
    dados.eficienciaEnergetica.length > 0;
  
  const temHorasElevadorAlt = Array.isArray(dados.horaElevador) && 
    dados.horaElevador.length > 0;
  
  const temMotorOciosoAlt = Array.isArray(dados.motorOcioso) && 
    dados.motorOcioso.length > 0;
  
  const temUsoGPSAlt = Array.isArray(dados.usoGPS) && 
    dados.usoGPS.length > 0;
  
  console.log('Verificação de dados do relatório:', {
    temDisponibilidade,
    temEficiencia,
    temHorasElevador,
    temMotorOcioso,
    temUsoGPS,
    temDisponibilidadeAlt,
    temEficienciaAlt,
    temHorasElevadorAlt,
    temMotorOciosoAlt,
    temUsoGPSAlt
  });
  
  // Verificar se pelo menos uma das seções tem dados
  return temDisponibilidade || temEficiencia || temHorasElevador || temMotorOcioso || temUsoGPS ||
         temDisponibilidadeAlt || temEficienciaAlt || temHorasElevadorAlt || temMotorOciosoAlt || temUsoGPSAlt;
};

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
    return `Relatório de Colheita Diário - ${nomeFrente} - ${data}.pdf`;
  };

  const currentDate = formatarData(new Date().toISOString().split('T')[0]);
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";

  useEffect(() => {
    const loadData = async () => {
      try {
        // Recarrega as configurações antes de carregar os dados
        await configManager.reloadConfig();
        
        let subscription: any = null;

        const fetchReportData = async () => {
          // Se não tiver ID, apenas mostrar o layout com dados de exemplo
          if (!reportId) {
            console.log('📋 Modo de visualização offline - usando dados de exemplo');
            setLoading(false);
            setUseExampleData(true);
            return;
          }

          try {
            console.log(`📊 Buscando dados do relatório ID: ${reportId}`);
            const { data: report, error } = await supabase
              .from('relatorios_diarios')
              .select('*')
              .eq('id', reportId)
              .single();

            if (error) {
              console.error('❌ Erro ao buscar dados:', error);
              setError(`Erro ao buscar dados: ${error.message}`);
              setLoading(false);
              setUseExampleData(true);
              return;
            }

            if (!report) {
              console.error('❌ Relatório não encontrado');
              setError('Relatório não encontrado');
              setLoading(false);
              setUseExampleData(true);
              return;
            }

            console.log('✅ Dados carregados com sucesso:', {
              tipo: report.tipo,
              frente: report.frente,
              status: report.status,
              dados: report.dados ? 'Presentes' : 'Ausentes'
            });

            // Log detalhado dos dados
            if (report.dados) {
              console.log('📊 DADOS BRUTOS:', JSON.stringify(report.dados, null, 2));
            }

            setReportData(report);
            setNomeFrente(report.frente || ''); // Atualiza o nome da frente
            setLoading(false);
            setUseExampleData(false);

            // Configurar subscription para atualizações em tempo real
            subscription = supabase
              .channel('relatorios_changes')
              .on(
                'postgres_changes',
                {
                  event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
                  schema: 'public',
                  table: 'relatorios_diarios',
                  filter: `id=eq.${reportId}`
                },
                async (payload) => {
                  console.log('🔄 Atualização detectada:', payload);
                  
                  // Buscar dados atualizados
                  const { data: updatedReport, error: refreshError } = await supabase
                    .from('relatorios_diarios')
                    .select('*')
                    .eq('id', reportId)
                    .single();

                  if (refreshError) {
                    console.error('❌ Erro ao atualizar dados:', refreshError);
                    return;
                  }

                  if (updatedReport) {
                    console.log('✅ Dados atualizados com sucesso');
                    setReportData(updatedReport);
                    setNomeFrente(updatedReport.frente || ''); // Atualiza o nome da frente quando houver atualização
                  }
                }
              )
              .subscribe();

          } catch (error) {
            console.error('❌ Erro ao buscar dados do relatório:', error);
            setError(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            setLoading(false);
            setUseExampleData(true);
          }
        };

        fetchReportData();

        // Cleanup: remover subscription quando o componente for desmontado
        return () => {
          if (subscription) {
            supabase.removeChannel(subscription);
          }
        };
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, [searchParams?.get('id')]);

  // PREPARAÇÃO DE DADOS
  const finalData: DadosProcessados = useMemo(() => {
    if (!useExampleData && reportData?.dados) {
      console.log('📊 DADOS BRUTOS DO RELATÓRIO:', reportData);
      
      // Normalizar estrutura do objeto dados para lidar com diferentes formatos
      const dadosNormalizados = { ...reportData.dados };
      
      // Verificar e corrigir nomes de propriedades que podem estar em CamelCase
      if (!dadosNormalizados.disponibilidade_mecanica && dadosNormalizados.disponibilidadeMecanica) {
        dadosNormalizados.disponibilidade_mecanica = dadosNormalizados.disponibilidadeMecanica;
      }
      
      if (!dadosNormalizados.eficiencia_energetica && dadosNormalizados.eficienciaEnergetica) {
        dadosNormalizados.eficiencia_energetica = dadosNormalizados.eficienciaEnergetica;
      }
      
      if (!dadosNormalizados.hora_elevador && dadosNormalizados.horaElevador) {
        dadosNormalizados.hora_elevador = dadosNormalizados.horaElevador;
      }
      
      if (!dadosNormalizados.motor_ocioso && dadosNormalizados.motorOcioso) {
        dadosNormalizados.motor_ocioso = dadosNormalizados.motorOcioso;
      }
      
      if (!dadosNormalizados.uso_gps && dadosNormalizados.usoGPS) {
        dadosNormalizados.uso_gps = dadosNormalizados.usoGPS;
      }
      
      // Função auxiliar para processar operador no formato "ID - NOME"
      const processarOperador = (operador: any) => {
        if (!operador || operador === 0) return null;
        const match = String(operador).match(/^(\d+)\s*-\s*(.+)$/);
        return match ? { id: match[1], nome: match[2].trim() } : { id: '0', nome: String(operador).trim() };
      };

      // Função auxiliar para converter número
      const converterNumero = (valor: any) => {
        if (valor === undefined || valor === null) return 0;
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
          // Remove qualquer % e converte para número
          return parseFloat(valor.replace('%', ''));
        }
        return 0;
      };

      // Função auxiliar para processar porcentagem
      const processarPorcentagem = (valor: any) => {
        const numero = converterNumero(valor);
        // Se o número já for uma porcentagem (>1), retorna como está, senão multiplica por 100
        return numero > 1 ? numero : numero * 100; 
      };

      // Log para depuração
      console.log('🔍 Estrutura dos dados recebidos:', Object.keys(reportData.dados));
      
      // Garantir que os dados estejam no formato correto
      const dadosProcessados: DadosProcessados = {
        tdh: Array.isArray(dadosNormalizados.tdh) 
          ? dadosNormalizados.tdh
              .filter((item: any) => item && (item.Frota || item.frota))
              .map((item: any) => ({
                frota: String(item.Frota || item.frota || ''),
                valor: converterNumero(item.TDH || item.tdh || item.Valor || item.valor || 0)
              }))
          : [],
        diesel: Array.isArray(dadosNormalizados.diesel) 
          ? dadosNormalizados.diesel
              .filter((item: any) => item && (item.Frota || item.frota))
              .map((item: any) => ({
                frota: String(item.Frota || item.frota || ''),
                valor: converterNumero(item.Consumo || item.consumo || item.Diesel || item.diesel || item.Valor || item.valor || 0)
              }))
          : [],
        impureza_vegetal: Array.isArray(dadosNormalizados.impureza_vegetal) 
          ? dadosNormalizados.impureza_vegetal
              .filter((item: any) => item && (item.Frota || item.frota))
              .map((item: any) => ({
                frota: String(item.Frota || item.frota || ''),
                valor: converterNumero(item.Impureza || item.impureza || item.Valor || item.valor || 0)
              }))
          : [],
        disponibilidade_mecanica: Array.isArray(dadosNormalizados.disponibilidade_mecanica) 
          ? dadosNormalizados.disponibilidade_mecanica
              .filter((item: any) => item && (item.Frota || item.frota))
              .map((item: any) => ({
                frota: String(item.Frota || item.frota || ''),
                disponibilidade: processarPorcentagem(item.Disponibilidade || item.disponibilidade || item.Valor || item.valor || 0)
              }))
          : [],
        eficiencia_energetica: Array.isArray(dadosNormalizados.eficiencia_energetica)
          ? dadosNormalizados.eficiencia_energetica
              .filter((item: any) => item && (item.Operador || item.operador || item.Nome || item.nome))
              .map((item: any) => {
                const operadorValue = item.Operador || item.operador || item.Nome || item.nome;
                const operador = processarOperador(operadorValue);
                if (!operador) return null;
                
                // Log detalhado para verificar os valores
                console.log(`📊 Processando eficiência para ${operador.nome}:`, {
                  eficienciaEnergetica: item["Eficiência Energética"] || item["eficiência energética"],
                  eficiencia: item["Eficiência"] || item["eficiência"],
                  valor: item.Valor || item.valor
                });
                
                // Tentar extrair o valor de várias propriedades possíveis
                let eficienciaBruta = 
                  item["Eficiência Energética"] !== undefined ? item["Eficiência Energética"] :
                  item["eficiência energética"] !== undefined ? item["eficiência energética"] :
                  item["Eficiência"] !== undefined ? item["Eficiência"] :
                  item["eficiência"] !== undefined ? item["eficiência"] :
                  item.Eficiencia !== undefined ? item.Eficiencia :
                  item.eficiencia !== undefined ? item.eficiencia :
                  item.Valor !== undefined ? item.Valor :
                  item.valor !== undefined ? item.valor : 0;
                
                // Se o valor for uma string com "%", remover
                if (typeof eficienciaBruta === 'string' && eficienciaBruta.includes('%')) {
                  eficienciaBruta = eficienciaBruta.replace('%', '');
                }
                
                // Converter para número
                let eficiencia = converterNumero(eficienciaBruta);
                
                // Normalizar o valor
                eficiencia = processarPorcentagem(eficiencia);
                
                // Garantir que o valor não seja NaN ou inválido
                if (isNaN(eficiencia) || eficiencia === null || eficiencia === undefined) {
                  eficiencia = 0;
                }
                
                console.log(`📊 Valor final de eficiência para ${operador.nome}: ${eficiencia}`);
                
                return {
                  id: operador.id,
                  nome: operador.nome,
                  eficiencia
                };
              })
              .filter((item: any) => item !== null)
              .sort((a: any, b: any) => b.eficiencia - a.eficiencia)
          : [],
        hora_elevador: Array.isArray(dadosNormalizados.hora_elevador)
          ? dadosNormalizados.hora_elevador
              .filter((item: any) => item && (item.Operador || item.operador || item.Nome || item.nome))
              .map((item: any) => {
                const operadorValue = item.Operador || item.operador || item.Nome || item.nome;
                const operador = processarOperador(operadorValue);
                if (!operador) return null;
                
                // Log detalhado para verificar os valores
                console.log(`📊 Processando horas elevador para ${operador.nome}:`, {
                  horas: item.Horas || item.horas,
                  horasElevador: item["Horas Elevador"] || item["horas elevador"],
                  elevador: item.Elevador || item.elevador,
                  valor: item.Valor || item.valor
                });
                
                // Tentar extrair o valor de várias propriedades possíveis
                let horasBruta = 
                  item.Horas !== undefined ? item.Horas :
                  item.horas !== undefined ? item.horas :
                  item["Horas Elevador"] !== undefined ? item["Horas Elevador"] :
                  item["horas elevador"] !== undefined ? item["horas elevador"] :
                  item.Elevador !== undefined ? item.Elevador :
                  item.elevador !== undefined ? item.elevador :
                  item.Valor !== undefined ? item.Valor :
                  item.valor !== undefined ? item.valor : 0;
                
                // Converter para número
                let horas = converterNumero(horasBruta);
                
                // Garantir que o valor não seja NaN ou inválido
                if (isNaN(horas) || horas === null || horas === undefined) {
                  horas = 0;
                }
                
                console.log(`📊 Valor final de horas elevador para ${operador.nome}: ${horas}`);
                
                return {
                  id: operador.id,
                  nome: operador.nome,
                  horas
                };
              })
              .filter((item: any) => item !== null)
          : [],
        motor_ocioso: Array.isArray(dadosNormalizados.motor_ocioso)
          ? dadosNormalizados.motor_ocioso
              .filter((item: any) => item && (item.Operador || item.operador || item.Nome || item.nome))
              .map((item: any) => {
                const operadorValue = item.Operador || item.operador || item.Nome || item.nome;
                const operador = processarOperador(operadorValue);
                if (!operador) return null;
                
                // Log detalhado para verificar os valores
                console.log(`📊 Processando motor ocioso para ${operador.nome}:`, {
                  porcentagemOciosa: item["Porcentagem Ociosa"] || item["porcentagem ociosa"],
                  porcentagem: item["Porcentagem"] || item["porcentagem"],
                  valor: item.Valor || item.valor
                });
                
                // Tentar extrair o valor de várias propriedades possíveis
                let percentualBruto = 
                  item["Porcentagem Ociosa"] !== undefined ? item["Porcentagem Ociosa"] :
                  item["porcentagem ociosa"] !== undefined ? item["porcentagem ociosa"] :
                  item["Porcentagem"] !== undefined ? item["Porcentagem"] :
                  item["porcentagem"] !== undefined ? item["porcentagem"] :
                  item["Motor Ocioso"] !== undefined ? item["Motor Ocioso"] :
                  item["motor ocioso"] !== undefined ? item["motor ocioso"] :
                  item["Ocioso"] !== undefined ? item["Ocioso"] :
                  item["ocioso"] !== undefined ? item["ocioso"] :
                  item.Valor !== undefined ? item.Valor :
                  item.valor !== undefined ? item.valor : 0;
                
                // Se o valor for uma string com "%", remover
                if (typeof percentualBruto === 'string' && percentualBruto.includes('%')) {
                  percentualBruto = percentualBruto.replace('%', '');
                }
                
                // Converter para número
                let percentual = converterNumero(percentualBruto);
                
                // Normalizar o valor
                percentual = processarPorcentagem(percentual);
                
                // Garantir que o valor não seja NaN ou inválido
                if (isNaN(percentual) || percentual === null || percentual === undefined) {
                  percentual = 0;
                }
                
                console.log(`📊 Valor final de motor ocioso para ${operador.nome}: ${percentual}`);
                
                return {
                  id: operador.id,
                  nome: operador.nome,
                  percentual
                };
              })
              .filter((item: any) => item !== null)
          : [],
        uso_gps: Array.isArray(dadosNormalizados.uso_gps)
          ? dadosNormalizados.uso_gps
              .filter((item: any) => item && (item.Operador || item.operador || item.Nome || item.nome))
              .map((item: any) => {
                const operadorValue = item.Operador || item.operador || item.Nome || item.nome;
                const operador = processarOperador(operadorValue);
                if (!operador) return null;
                
                // Log detalhado para verificar os valores
                console.log(`📊 Processando uso GPS para ${operador.nome}:`, {
                  porcentagemUso: item["Porcentagem Uso"] || item["porcentagem uso"],
                  porcentagem: item["Porcentagem"] || item["porcentagem"],
                  uso: item["Uso"] || item["uso"],
                  valor: item.Valor || item.valor
                });
                
                // Tentar extrair o valor de várias propriedades possíveis
                let porcentagemBruta = 
                  item["Porcentagem Uso"] !== undefined ? item["Porcentagem Uso"] :
                  item["porcentagem uso"] !== undefined ? item["porcentagem uso"] :
                  item["Porcentagem"] !== undefined ? item["Porcentagem"] :
                  item["porcentagem"] !== undefined ? item["porcentagem"] :
                  item["Uso GPS"] !== undefined ? item["Uso GPS"] :
                  item["uso gps"] !== undefined ? item["uso gps"] :
                  item["Uso"] !== undefined ? item["Uso"] :
                  item["uso"] !== undefined ? item["uso"] :
                  item.Valor !== undefined ? item.Valor :
                  item.valor !== undefined ? item.valor : 0;
                
                // Se o valor for uma string com "%", remover
                if (typeof porcentagemBruta === 'string' && porcentagemBruta.includes('%')) {
                  porcentagemBruta = porcentagemBruta.replace('%', '');
                }
                
                // Converter para número
                let porcentagem = converterNumero(porcentagemBruta);
                
                // Normalizar o valor
                porcentagem = processarPorcentagem(porcentagem);
                
                // Garantir que o valor não seja NaN ou inválido
                if (isNaN(porcentagem) || porcentagem === null || porcentagem === undefined) {
                  porcentagem = 0;
                }
                
                console.log(`📊 Valor final de uso GPS para ${operador.nome}: ${porcentagem}`);
                
                return {
                  id: operador.id,
                  nome: operador.nome,
                  porcentagem
                };
              })
              .filter((item: any) => item !== null)
          : []
      };

      // Log detalhado após processamento
      console.log('📊 DADOS APÓS PROCESSAMENTO:', {
        tdh: dadosProcessados.tdh.length,
        diesel: dadosProcessados.diesel.length,
        impurezaVegetal: dadosProcessados.impureza_vegetal.length,
        disponibilidade: dadosProcessados.disponibilidade_mecanica.length,
        eficiencia: dadosProcessados.eficiencia_energetica.length,
        motorOcioso: dadosProcessados.motor_ocioso.length,
        horasElevador: dadosProcessados.hora_elevador.length,
        usoGPS: dadosProcessados.uso_gps.length
      });
      
      console.log('📊 Exemplo de dados de disponibilidade mecânica:', 
        dadosProcessados.disponibilidade_mecanica.slice(0, 2));
      console.log('📊 Exemplo de dados de eficiência energética:', 
        dadosProcessados.eficiencia_energetica.slice(0, 2));

      return dadosProcessados;
    }

    console.log('📊 Usando dados de exemplo');
    return dadosExemplo;
  }, [useExampleData, reportData]);

  // Preparar os arrays de dados
  const finalDataDisponibilidade = useMemo(() => {
    const data = Array.isArray(finalData.disponibilidade_mecanica) ? finalData.disponibilidade_mecanica : [];
    console.log('📊 Dados de disponibilidade processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);
  
  const finalDataEficiencia = useMemo(() => {
    const data = Array.isArray(finalData.eficiencia_energetica) ? finalData.eficiencia_energetica : [];
    console.log('📊 Dados de eficiência processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);
  
  const finalDataHorasElevador = useMemo(() => {
    const data = Array.isArray(finalData.hora_elevador) ? finalData.hora_elevador : [];
    console.log('📊 Dados de horas elevador processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);
  
  const finalDataMotorOcioso = useMemo(() => {
    const data = Array.isArray(finalData.motor_ocioso) ? finalData.motor_ocioso : [];
    console.log('📊 Dados de motor ocioso processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);
  
  const finalDataUsoGPS = useMemo(() => {
    const data = Array.isArray(finalData.uso_gps) ? finalData.uso_gps : [];
    console.log('📊 Dados de uso GPS processados:', JSON.stringify(data, null, 2));
    return data;
  }, [finalData]);

  // Verificar se estamos no modo de visualização ou no modo de relatório específico
  const isModoTemplate = !reportId;

  // Log para debug
  useEffect(() => {
    if (!loading) {
      console.log('===== DETALHES DO RELATÓRIO =====');
      console.log('📊 Modo:', isModoTemplate ? 'Template/Layout' : 'Relatório Específico');
      console.log('📊 ID do relatório:', reportId || 'Nenhum');
      console.log('📊 Usando dados de exemplo:', useExampleData);
      console.log('📊 Disponibilidade:', finalDataDisponibilidade.length, 'itens');
      console.log('📊 Eficiência:', finalDataEficiencia.length, 'itens');
      console.log('📊 Horas elevador:', finalDataHorasElevador.length, 'itens');
      console.log('📊 Motor ocioso:', finalDataMotorOcioso.length, 'itens');
      console.log('📊 Uso GPS:', finalDataUsoGPS.length, 'itens');
      
      // Verificar primeiro item de cada seção para depuração
      if (finalDataDisponibilidade.length > 0) {
        console.log('📊 Exemplo Disponibilidade:', finalDataDisponibilidade[0]);
      }
      if (finalDataEficiencia.length > 0) {
        console.log('📊 Exemplo Eficiência:', finalDataEficiencia[0]);
      }
    }
  }, [loading, isModoTemplate, reportId, useExampleData, finalDataDisponibilidade, finalDataEficiencia, finalDataHorasElevador, finalDataMotorOcioso, finalDataUsoGPS]);

  // FUNÇÕES
  // Função para imprimir o relatório
  const handlePrint = async () => {
    try {
      // Tentar usar a API de impressão do navegador diretamente
      window.print();
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      setError('Erro ao imprimir. Por favor, tente novamente.');
    }
  };

  // Função para calcular média
  const calcularMedia = (array: any[] | undefined, propriedade: string): number => {
    // Verificação inicial mais robusta
    if (!array || !Array.isArray(array) || array.length === 0) {
      console.log(`📊 calcularMedia: Array vazio ou inválido para propriedade "${propriedade}"`);
      
      // Para cada propriedade, retornar um valor padrão base nos dadosExemplo
      if (propriedade === 'eficiencia' && dadosExemplo.eficiencia_energetica.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.eficiencia_energetica.reduce((acc, item) => acc + (item.eficiencia || 0), 0);
        return soma / dadosExemplo.eficiencia_energetica.length;
      }
      
      if (propriedade === 'disponibilidade' && dadosExemplo.disponibilidade_mecanica.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.disponibilidade_mecanica.reduce((acc, item) => acc + (item.disponibilidade || 0), 0);
        return soma / dadosExemplo.disponibilidade_mecanica.length;
      }
      
      if (propriedade === 'horas' && dadosExemplo.hora_elevador.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.hora_elevador.reduce((acc, item) => acc + (item.horas || 0), 0);
        return soma / dadosExemplo.hora_elevador.length;
      }
      
      if (propriedade === 'percentual' && dadosExemplo.motor_ocioso.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.motor_ocioso.reduce((acc, item) => acc + (item.percentual || 0), 0);
        return soma / dadosExemplo.motor_ocioso.length;
      }
      
      if (propriedade === 'porcentagem' && dadosExemplo.uso_gps.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.uso_gps.reduce((acc, item) => acc + (item.porcentagem || 0), 0);
        return soma / dadosExemplo.uso_gps.length;
      }
      
      return 0;
    }
    
    // Log de entrada para debug
    console.log(`📊 Calculando média para propriedade "${propriedade}" com ${array.length} itens`);
    console.log(`📊 Primeiro item do array:`, array[0]);
    
    // Filtrar apenas itens com valores válidos
    const itensFiltrados = array.filter(item => {
      if (!item) return false;
      
      // Verificação adicional para garantir que o valor existe e é válido
      const valor = item[propriedade];
      const valorExiste = valor !== undefined && valor !== null;
      const valorValido = typeof valor === 'number' || (typeof valor === 'string' && !isNaN(parseFloat(valor)));
      
      if (!valorExiste || !valorValido) {
        console.log(`📊 calcularMedia: Item com valor inválido para "${propriedade}":`, item);
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
    
    // Log para depuração dos itens filtrados
    console.log(`📊 Itens filtrados para média de "${propriedade}":`, itensFiltrados.length);
    if (itensFiltrados.length > 0) {
      console.log(`📊 Primeiro item filtrado:`, itensFiltrados[0]);
    }
    
    // Se não há itens válidos, retorna zero
    if (itensFiltrados.length === 0) {
      console.log(`📊 calcularMedia: Nenhum item válido para "${propriedade}" após filtragem`);
      
      // Para cada propriedade, retornar um valor padrão base nos dadosExemplo
      if (propriedade === 'eficiencia' && dadosExemplo.eficiencia_energetica.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.eficiencia_energetica.reduce((acc, item) => acc + (item.eficiencia || 0), 0);
        return soma / dadosExemplo.eficiencia_energetica.length;
      }
      
      if (propriedade === 'disponibilidade' && dadosExemplo.disponibilidade_mecanica.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.disponibilidade_mecanica.reduce((acc, item) => acc + (item.disponibilidade || 0), 0);
        return soma / dadosExemplo.disponibilidade_mecanica.length;
      }
      
      if (propriedade === 'horas' && dadosExemplo.hora_elevador.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.hora_elevador.reduce((acc, item) => acc + (item.horas || 0), 0);
        return soma / dadosExemplo.hora_elevador.length;
      }
      
      if (propriedade === 'percentual' && dadosExemplo.motor_ocioso.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.motor_ocioso.reduce((acc, item) => acc + (item.percentual || 0), 0);
        return soma / dadosExemplo.motor_ocioso.length;
      }
      
      if (propriedade === 'porcentagem' && dadosExemplo.uso_gps.length > 0) {
        // Calcular média dos valores de exemplo
        const soma = dadosExemplo.uso_gps.reduce((acc, item) => acc + (item.porcentagem || 0), 0);
        return soma / dadosExemplo.uso_gps.length;
      }
      
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
    
    // Log para depuração da soma e média calculada
    console.log(`📊 Média final para "${propriedade}": ${media.toFixed(4)} (Soma: ${soma}, Itens: ${valores.length})`);
    
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
  const PageHeader = () => {
    // Encontrar o nome completo da frente no config
    const frenteConfig = configManager.getFrentes('colheita_diario').find((f: { id: string }) => f.id === reportData?.frente);
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
            {`Relatório de Colheita Diário - ${nomeFrente}`}
          </Heading>
          <Text color="black" fontSize="sm">
            {reportData?.data ? formatarData(reportData.data) : currentDate}
          </Text>
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

  // Preparar dados do resumo
  const resumoData = useMemo(() => {
    console.log('📊 Preparando dados para cards de resumo...');
    console.log('📊 finalData:', JSON.stringify(finalData, null, 2));
    console.log('📊 finalDataDisponibilidade:', finalDataDisponibilidade.length, 'itens');
    console.log('📊 finalDataEficiencia:', finalDataEficiencia.length, 'itens');
    console.log('📊 finalDataHorasElevador:', finalDataHorasElevador.length, 'itens');
    console.log('📊 finalDataMotorOcioso:', finalDataMotorOcioso.length, 'itens');
    console.log('📊 finalDataUsoGPS:', finalDataUsoGPS.length, 'itens');

    // Verificar se os arrays têm conteúdo
    const temDadosDisponibilidade = finalDataDisponibilidade.length > 0;
    const temDadosEficiencia = finalDataEficiencia.length > 0;
    const temDadosHorasElevador = finalDataHorasElevador.length > 0;
    const temDadosMotorOcioso = finalDataMotorOcioso.length > 0;
    const temDadosUsoGPS = finalDataUsoGPS.length > 0;

    console.log('📊 Tem dados disponíveis:', {
      disponibilidade: temDadosDisponibilidade,
      eficiencia: temDadosEficiencia,
      horasElevador: temDadosHorasElevador,
      motorOcioso: temDadosMotorOcioso,
      usoGPS: temDadosUsoGPS
    });

    const tdh = {
      data: finalData.tdh || [],
      meta: configManager.getMetas('colheita_diario').tdh,
      media: calcularMedia(finalData.tdh, 'valor')
    };

    const diesel = {
      data: finalData.diesel || [],
      meta: configManager.getMetas('colheita_diario').diesel,
      media: calcularMedia(finalData.diesel, 'valor')
    };

    const impurezaVegetal = {
      data: finalData.impureza_vegetal || [],
      meta: configManager.getMetas('colheita_diario').impureza_vegetal,
      media: calcularMedia(finalData.impureza_vegetal, 'valor')
    };

    // Garantir que os dados de disponibilidade estejam presentes
    const disponibilidadeMecanica = {
      data: temDadosDisponibilidade ? finalDataDisponibilidade : dadosExemplo.disponibilidade_mecanica,
      meta: configManager.getMetas('colheita_diario').disponibilidadeMecanica,
      media: temDadosDisponibilidade ? 
        calcularMedia(finalDataDisponibilidade, 'disponibilidade') : 
        calcularMedia(dadosExemplo.disponibilidade_mecanica, 'disponibilidade'),
      acimaMeta: {
        quantidade: temDadosDisponibilidade ? 
          contarItensMeta(finalDataDisponibilidade, 'disponibilidade', configManager.getMetas('colheita_diario').disponibilidadeMecanica) :
          contarItensMeta(dadosExemplo.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('colheita_diario').disponibilidadeMecanica),
        total: temDadosDisponibilidade ? finalDataDisponibilidade.length : dadosExemplo.disponibilidade_mecanica.length,
        percentual: temDadosDisponibilidade ? 
          (contarItensMeta(finalDataDisponibilidade, 'disponibilidade', configManager.getMetas('colheita_diario').disponibilidadeMecanica) / 
            (finalDataDisponibilidade.length || 1)) * 100 :
          (contarItensMeta(dadosExemplo.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('colheita_diario').disponibilidadeMecanica) / 
            (dadosExemplo.disponibilidade_mecanica.length || 1)) * 100
      }
    };

    // Garantir que os dados de eficiência energética estejam presentes
    const eficienciaEnergetica = {
      data: temDadosEficiencia ? finalDataEficiencia : dadosExemplo.eficiencia_energetica,
      meta: configManager.getMetas('colheita_diario').eficienciaEnergetica,
      media: temDadosEficiencia ? 
        calcularMedia(finalDataEficiencia, 'eficiencia') : 
        calcularMedia(dadosExemplo.eficiencia_energetica, 'eficiencia'),
      acimaMeta: {
        quantidade: temDadosEficiencia ? 
          contarItensMeta(finalDataEficiencia, 'eficiencia', configManager.getMetas('colheita_diario').eficienciaEnergetica) :
          contarItensMeta(dadosExemplo.eficiencia_energetica, 'eficiencia', configManager.getMetas('colheita_diario').eficienciaEnergetica),
        total: temDadosEficiencia ? finalDataEficiencia.length : dadosExemplo.eficiencia_energetica.length,
        percentual: temDadosEficiencia ? 
          (contarItensMeta(finalDataEficiencia, 'eficiencia', configManager.getMetas('colheita_diario').eficienciaEnergetica) / 
            (finalDataEficiencia.length || 1)) * 100 :
          (contarItensMeta(dadosExemplo.eficiencia_energetica, 'eficiencia', configManager.getMetas('colheita_diario').eficienciaEnergetica) / 
            (dadosExemplo.eficiencia_energetica.length || 1)) * 100
      }
    };

    // Garantir que os dados de horas elevador estejam presentes
    const horaElevador = {
      data: temDadosHorasElevador ? finalDataHorasElevador : dadosExemplo.hora_elevador,
      meta: configManager.getMetas('colheita_diario').horaElevador,
      media: temDadosHorasElevador ? 
        calcularMedia(finalDataHorasElevador, 'horas') : 
        calcularMedia(dadosExemplo.hora_elevador, 'horas'),
      acimaMeta: {
        quantidade: temDadosHorasElevador ? 
          contarItensMeta(finalDataHorasElevador, 'horas', configManager.getMetas('colheita_diario').horaElevador) :
          contarItensMeta(dadosExemplo.hora_elevador, 'horas', configManager.getMetas('colheita_diario').horaElevador),
        total: temDadosHorasElevador ? finalDataHorasElevador.length : dadosExemplo.hora_elevador.length,
        percentual: temDadosHorasElevador ? 
          (contarItensMeta(finalDataHorasElevador, 'horas', configManager.getMetas('colheita_diario').horaElevador) / 
            (finalDataHorasElevador.length || 1)) * 100 :
          (contarItensMeta(dadosExemplo.hora_elevador, 'horas', configManager.getMetas('colheita_diario').horaElevador) / 
            (dadosExemplo.hora_elevador.length || 1)) * 100
      }
    };

    // Garantir que os dados de motor ocioso estejam presentes
    const motorOcioso = {
      data: temDadosMotorOcioso ? finalDataMotorOcioso : dadosExemplo.motor_ocioso,
      meta: configManager.getMetas('colheita_diario').motorOcioso,
      media: temDadosMotorOcioso ? 
        calcularMedia(finalDataMotorOcioso, 'percentual') : 
        calcularMedia(dadosExemplo.motor_ocioso, 'percentual'),
      acimaMeta: {
        quantidade: temDadosMotorOcioso ? 
          contarItensMeta(finalDataMotorOcioso, 'percentual', configManager.getMetas('colheita_diario').motorOcioso, false) :
          contarItensMeta(dadosExemplo.motor_ocioso, 'percentual', configManager.getMetas('colheita_diario').motorOcioso, false),
        total: temDadosMotorOcioso ? finalDataMotorOcioso.length : dadosExemplo.motor_ocioso.length,
        percentual: temDadosMotorOcioso ? 
          (contarItensMeta(finalDataMotorOcioso, 'percentual', configManager.getMetas('colheita_diario').motorOcioso, false) / 
            (finalDataMotorOcioso.length || 1)) * 100 :
          (contarItensMeta(dadosExemplo.motor_ocioso, 'percentual', configManager.getMetas('colheita_diario').motorOcioso, false) / 
            (dadosExemplo.motor_ocioso.length || 1)) * 100
      }
    };

    // Garantir que os dados de uso GPS estejam presentes
    const usoGPS = {
      data: temDadosUsoGPS ? finalDataUsoGPS : dadosExemplo.uso_gps,
      meta: configManager.getMetas('colheita_diario').usoGPS,
      media: temDadosUsoGPS ? 
        calcularMedia(finalDataUsoGPS, 'porcentagem') : 
        calcularMedia(dadosExemplo.uso_gps, 'porcentagem'),
      acimaMeta: {
        quantidade: temDadosUsoGPS ? 
          contarItensMeta(finalDataUsoGPS, 'porcentagem', configManager.getMetas('colheita_diario').usoGPS) :
          contarItensMeta(dadosExemplo.uso_gps, 'porcentagem', configManager.getMetas('colheita_diario').usoGPS),
        total: temDadosUsoGPS ? finalDataUsoGPS.length : dadosExemplo.uso_gps.length,
        percentual: temDadosUsoGPS ? 
          (contarItensMeta(finalDataUsoGPS, 'porcentagem', configManager.getMetas('colheita_diario').usoGPS) / 
            (finalDataUsoGPS.length || 1)) * 100 :
          (contarItensMeta(dadosExemplo.uso_gps, 'porcentagem', configManager.getMetas('colheita_diario').usoGPS) / 
            (dadosExemplo.uso_gps.length || 1)) * 100
      }
    };

    // Log para verificar os dados processados dos cards
    console.log('📊 Dados de disponibilidadeMecanica:', JSON.stringify(disponibilidadeMecanica, null, 2));
    console.log('📊 Dados de eficienciaEnergetica:', JSON.stringify(eficienciaEnergetica, null, 2));
    console.log('📊 Dados de horaElevador:', JSON.stringify(horaElevador, null, 2));
    console.log('📊 Dados de motorOcioso:', JSON.stringify(motorOcioso, null, 2));
    console.log('📊 Dados de usoGPS:', JSON.stringify(usoGPS, null, 2));

    // Preparar dados das frotas
    const frotas = (finalData.tdh || []).map((item: any) => ({
      id: item.frota || '',
      tdh: item.valor || 0,
      diesel: (finalData.diesel || []).find((d: any) => d.frota === item.frota)?.valor || 0,
      disponibilidade: finalDataDisponibilidade.find((d: any) => d.frota === item.frota)?.disponibilidade || 0,
      impureza: (finalData.impureza_vegetal || []).find((d: any) => d.frota === item.frota)?.valor || 0
    }));

    // Preparar dados dos operadores
    const operadores = finalDataEficiencia.map((item: any) => ({
      id: item.nome || '',
      eficiencia: item.eficiencia || 0,
      horasElevador: finalDataHorasElevador.find((h: any) => h.nome === item.nome)?.horas || 0,
      motorOcioso: finalDataMotorOcioso.find((m: any) => m.nome === item.nome)?.percentual || 0,
      usoGPS: finalDataUsoGPS.find((g: any) => g.nome === item.nome)?.porcentagem || 0
    }));

    return {
      tdh,
      diesel,
      impurezaVegetal,
      disponibilidadeMecanica,
      eficienciaEnergetica,
      horaElevador,
      motorOcioso,
      usoGPS,
      frotas,
      operadores
    };
  }, [
    finalData,
    finalDataDisponibilidade,
    finalDataEficiencia,
    finalDataHorasElevador,
    finalDataMotorOcioso,
    finalDataUsoGPS,
    configManager
  ]);

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
    <Box>
      {/* Conteúdo do relatório */}
      <Box className="report-content">
        {/* Página 1 - Disponibilidade, Eficiência e Motor Ocioso */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader />
            
            <Flex flex="1" direction="column" justify="space-between">
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
                    meta={configManager.getMetas('colheita_diario').disponibilidadeMecanica} 
                  />
                </Box>
              </Box>
              
              {/* Eficiência Energética */}
              <Box flex="1" mb={3}>
                <SectionTitle title="Eficiência Energética" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100% - 25px)"
                >
                  <GraficoEficienciaEnergetica 
                    data={finalDataEficiencia} 
                    meta={configManager.getMetas('colheita_diario').eficienciaEnergetica} 
                  />
                </Box>
              </Box>
              
              {/* Motor Ocioso */}
              <Box flex="1">
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
                    meta={configManager.getMetas('colheita_diario').motorOcioso} 
                    inverterMeta 
                  />
                </Box>
              </Box>
            </Flex>
          </Box>
        </A4Colheita>
        
        {/* Página 2 - Horas Elevador e Uso GPS */}
        <A4Colheita>
          <Box h="100%" display="flex" flexDirection="column" bg="white">
            <PageHeader />
            
            <Flex flex="1" direction="column" justify="space-between">
              {/* Horas Elevador */}
              <Box flex="1" mb={3}>
                <SectionTitle title="Horas Elevador" centered={true} />
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100% - 25px)"
                >
                  <GraficoHorasElevador 
                    data={finalDataHorasElevador} 
                    meta={configManager.getMetas('colheita_diario').horaElevador} 
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
                  p={2}
                  h="calc(100% - 25px)"
                >
                  <GraficoUsoGPS 
                    data={finalDataUsoGPS} 
                    meta={configManager.getMetas('colheita_diario').usoGPS} 
                  />
                </Box>
              </Box>
            </Flex>
          </Box>
        </A4Colheita>
        
        {/* Página 3 - Resumo Geral */}
        <A4Colheita isLastPage={true}>
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
                Resumo do Relatório de Colheita Diário
              </Heading>

              {/* Seção Frotas */}
              <Box mb={6}>
                <SectionTitle title="Frotas" centered={true} />
                
                {/* Cards de indicadores de frotas */}
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  {/* Garantir que os dados de disponibilidade mecânica são sempre exibidos */}
                  <IndicatorCard 
                    title="Disponibilidade Mecânica"
                    value={resumoData.disponibilidadeMecanica.media || 0}
                    meta={resumoData.disponibilidadeMecanica.meta || 0}
                    unitType="porcentagem"
                    acimaMeta={resumoData.disponibilidadeMecanica.acimaMeta}
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
                    value={resumoData.eficienciaEnergetica.media || 0}
                    meta={resumoData.eficienciaEnergetica.meta || 0}
                    unitType="porcentagem"
                    acimaMeta={resumoData.eficienciaEnergetica.acimaMeta}
                  />
                  
                  {/* Garantir que os dados de horas elevador são renderizados mesmo se a média calculada for zero */}
                  <IndicatorCard 
                    title="Horas Elevador"
                    value={resumoData.horaElevador.media || 0}
                    meta={resumoData.horaElevador.meta || 0}
                    unitType="horas"
                    acimaMeta={resumoData.horaElevador.acimaMeta}
                  />
                  
                  {/* Garantir que os dados de motor ocioso são renderizados mesmo se a média calculada for zero */}
                  <IndicatorCard 
                    title="Motor Ocioso"
                    value={resumoData.motorOcioso.media || 0}
                    meta={resumoData.motorOcioso.meta || 0}
                    isInverted={true}
                    unitType="porcentagem"
                    acimaMeta={resumoData.motorOcioso.acimaMeta}
                  />
                  
                  {/* Garantir que os dados de uso GPS são renderizados mesmo se a média calculada for zero */}
                  <IndicatorCard 
                    title="Uso GPS"
                    value={resumoData.usoGPS.media || 0}
                    meta={resumoData.usoGPS.meta || 0}
                    unitType="porcentagem"
                    acimaMeta={resumoData.usoGPS.acimaMeta}
                  />
                </SimpleGrid>

                {/* Tabela de operadores */}
                <TabelaOperadores dados={{
                  eficiencia_energetica: finalData.eficiencia_energetica && finalData.eficiencia_energetica.length > 0 ? 
                    finalData.eficiencia_energetica : dadosExemplo.eficiencia_energetica,
                  motor_ocioso: finalData.motor_ocioso && finalData.motor_ocioso.length > 0 ? 
                    finalData.motor_ocioso : dadosExemplo.motor_ocioso,
                  falta_apontamento: (finalData.hora_elevador && finalData.hora_elevador.length > 0 ? 
                    finalData.hora_elevador : dadosExemplo.hora_elevador).map(item => ({
                      id: item.id || '',
                      nome: item.nome || '',
                      percentual: item.horas || 0
                    })),
                  uso_gps: (finalData.uso_gps && finalData.uso_gps.length > 0 ? 
                    finalData.uso_gps : dadosExemplo.uso_gps).map(item => ({
                      id: item.id || '',
                      nome: item.nome || '',
                      porcentagem: item.porcentagem || 0
                    }))
                }} tipo="colheita_diario" />
              </Box>
            </Box>
          </Box>
        </A4Colheita>
      </Box>
    </Box>
  );
} 