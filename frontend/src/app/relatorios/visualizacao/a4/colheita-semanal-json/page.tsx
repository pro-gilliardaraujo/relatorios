'use client';

import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Image, Flex, Text, SimpleGrid, Center, Spinner, Button, useToast } from '@chakra-ui/react';
import A4Colheita from '@/components/Layout/A4Colheita';
import { configManager } from '@/utils/config';
import IndicatorCard from '@/components/IndicatorCard';
import TabelaOperadores from '@/components/TabelaOperadores';
import TabelaFrotas from '@/components/TabelaFrotas';
import { DateRangeDisplay } from '@/components/DateRangeDisplay';
import GraficoDisponibilidadeMecanicaSemanal from '@/components/Charts/Colheita/Semanal/GraficoDisponibilidadeMecanicaSemanal';
import GraficoEficienciaEnergeticaSemanal from '@/components/Charts/Colheita/Semanal/GraficoEficienciaEnergeticaSemanal';
import GraficoHoraElevadorSemanal from '@/components/Charts/Colheita/Semanal/GraficoHoraElevadorSemanal';
import GraficoMotorOciosoSemanal from '@/components/Charts/Colheita/Semanal/GraficoMotorOciosoSemanal';
import GraficoUsoGPSSemanal from '@/components/Charts/Colheita/Semanal/GraficoUsoGPSSemanal';
import { FaPrint, FaFileDownload } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DadosProcessados {
  disponibilidade_mecanica: Array<any>;
  eficiencia_energetica: Array<any>;
  hora_elevador: Array<any>;
  motor_ocioso: Array<any>;
  uso_gps: Array<any>;
  media_velocidade?: Array<any>;
  exemplosOperadores: Array<any>;
  exemplosFrotas: Array<any>;
}

const JSON_URL = '/dados_relatorio_colheita_semanal.json';

export default function ColheitaSemanalJSON() {
  // Estados
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dadosProcessados, setDadosProcessados] = useState<DadosProcessados>({
    disponibilidade_mecanica: [],
    eficiencia_energetica: [],
    hora_elevador: [],
    motor_ocioso: [],
    uso_gps: [],
    media_velocidade: [],
    exemplosOperadores: [],
    exemplosFrotas: []
  });
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [nomeFrente, setNomeFrente] = useState<string>('');
  const [fazenda, setFazenda] = useState<string>('');
  const [secoes, setSecoes] = useState({
    disponibilidadeMecanica: true,
    eficienciaEnergetica: true,
    horaElevador: true,
    motorOcioso: true,
    usoGPS: true,
  });

  // Constantes de layout
  const LOGO_HEIGHT = "50px";
  const LOGO_URL = "https://kjlwqezxzqjfhacmjhbh.supabase.co/storage/v1/object/public/sourcefiles/Logo%20IB%20Full.png";
  
  const toast = useToast();

  // Carregar o arquivo JSON
  const carregarDados = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Adicionar um parâmetro de timestamp para evitar cache
      const timestamp = new Date().getTime();
      const response = await fetch(`${JSON_URL}?t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar o arquivo (${response.status}): ${response.statusText}`);
      }
      
      const dados = await response.json();
      
      if (!dados || typeof dados !== 'object') {
        setError("O arquivo JSON não possui o formato esperado.");
        setLoading(false);
        return;
      }

      // Verificar se o tipo de relatório é o esperado
      if (dados.informacoes_gerais?.tipo_relatorio !== 'colheita_semanal') {
        setError("Este JSON não contém um relatório de colheita semanal.");
        console.warn("Tipo de relatório incorreto:", dados.informacoes_gerais?.tipo_relatorio);
      }

      // Extrair dados gerais
      const informacoesGerais = dados.informacoes_gerais || {};
      setNomeFrente(informacoesGerais.frente || 'Frente 1');
      setFazenda(informacoesGerais.fazenda || '');
      
      // Configurar datas
      if (informacoesGerais.data_inicio) {
        // Criar a data usando os componentes da data para garantir a precisão
        const [ano, mes, dia] = informacoesGerais.data_inicio.split('-');
        // Usar dia, mês (0-indexed) e ano
        setStartDate(new Date(Number(ano), Number(mes) - 1, Number(dia)));
      }
      if (informacoesGerais.data_fim) {
        // Criar a data usando os componentes da data para garantir a precisão
        const [ano, mes, dia] = informacoesGerais.data_fim.split('-');
        // Usar dia, mês (0-indexed) e ano
        setEndDate(new Date(Number(ano), Number(mes) - 1, Number(dia)));
      }

      // Extrair dados de colheita
      const dadosColheita = dados.colheita || {};
      
      // Processar os dados específicos
      const processados = {
        disponibilidade_mecanica: dadosColheita.disponibilidade_mecanica || [],
        eficiencia_energetica: dadosColheita.eficiencia_energetica || [],
        hora_elevador: dadosColheita.hora_elevador || [],
        motor_ocioso: dadosColheita.motor_ocioso || [],
        uso_gps: dadosColheita.uso_gps || [],
        media_velocidade: dadosColheita.media_velocidade || [],
        exemplosOperadores: [],
        exemplosFrotas: []
      };

      // Extrair operadores e frotas para tabelas
      processados.exemplosOperadores = processados.eficiencia_energetica.map((op: any) => op.nome || '');
      processados.exemplosFrotas = processados.disponibilidade_mecanica.map((f: any) => f.frota || '');

      setDadosProcessados(processados);
      setReportData(dados);
      console.log('Dados carregados com sucesso');

      // Determinar quais seções estão disponíveis
      setSecoes({
        disponibilidadeMecanica: processados.disponibilidade_mecanica.length > 0,
        eficienciaEnergetica: processados.eficiencia_energetica.length > 0,
        horaElevador: processados.hora_elevador.length > 0,
        motorOcioso: processados.motor_ocioso.length > 0,
        usoGPS: processados.uso_gps.length > 0,
      });
    } catch (error) {
      console.error('Erro ao carregar arquivo JSON:', error);
      setError(`Não foi possível carregar o arquivo JSON: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar os dados inicialmente
  useEffect(() => {
    carregarDados();
  }, []);

  // Função auxiliar para imprimir o relatório
  const handlePrint = () => {
    window.print();
  };

  // Funções auxiliares para cálculos
  const calcularMedia = (array: any[] | undefined, propriedade: string): number => {
    if (!array || array.length === 0) return 0;
    
    const values = array
      .map(item => {
        const valor = parseFloat(item[propriedade]);
        return isNaN(valor) ? 0 : valor;
      })
      .filter(valor => valor !== 0);
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, valor) => sum + valor, 0) / values.length;
  };

  const contarItensMeta = (array: any[] | undefined, propriedade: string, meta: number, acima: boolean = true): number => {
    if (!array || array.length === 0) return 0;
    
    return array.filter(item => {
      const valor = parseFloat(item[propriedade]);
      return !isNaN(valor) && (acima ? valor >= meta : valor <= meta);
    }).length;
  };

  // Componentes de layout
  const PageHeader = ({ showDate = false }: { showDate?: boolean }) => {
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
            {`Relatório de Colheita Semanal - ${nomeFrente} - ${fazenda}`}
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

  // Se estiver carregando, mostrar indicador
  if (loading && !reportData) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text>Carregando dados do relatório...</Text>
        </VStack>
      </Center>
    );
  }

  // Se tiver erro e não tiver dados, mostrar mensagem de erro
  if (error && !reportData) {
    return (
      <Center h="100vh" p={4}>
        <VStack spacing={6} maxW="600px" textAlign="center">
          <Heading size="lg" color="red.500">Erro ao carregar relatório</Heading>
          <Text>{error}</Text>
          <Text fontSize="sm">
            Verifique se o arquivo <code>{JSON_URL}</code> existe e está no formato correto.
          </Text>
          <Button colorScheme="blue" onClick={carregarDados}>Tentar novamente</Button>
        </VStack>
      </Center>
    );
  }

  // Renderização do relatório
  return (
    <Box position="relative">
      {/* Controles */}
      <Box 
        position="fixed" 
        top="10px" 
        right="10px" 
        zIndex={1000}
        bg="blue.50"
        p={2}
        borderRadius="md"
        fontSize="sm"
        shadow="sm"
        className="no-print"
      >
        <Flex direction="column" gap={2}>
          <Text fontWeight="bold">Arquivo: {JSON_URL}</Text>
          <Button size="sm" leftIcon={<FaFileDownload />} onClick={carregarDados} isLoading={loading}>
            Recarregar dados
          </Button>
          <Button size="sm" leftIcon={<FaPrint />} onClick={handlePrint}>
            Imprimir
          </Button>
        </Flex>
      </Box>

      {/* Páginas do Relatório */}
      
      {/* Primeira Página - Disponibilidade Mecânica */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column">
          <PageHeader showDate={true} />
          <Box flex="1" display="flex" flexDirection="column">
            {/* Disponibilidade Mecânica */}
            <Box flex="1">
              <SectionTitle title="Disponibilidade Mecânica" />
              <SimpleGrid columns={1} spacing={3} w="100%" mb={2}>
                {dadosProcessados.disponibilidade_mecanica.length > 0 && secoes.disponibilidadeMecanica && (
                  <IndicatorCard
                    title=""
                    value={calcularMedia(dadosProcessados.disponibilidade_mecanica, 'disponibilidade')}
                    meta={configManager.getMetas('colheita_semanal').disponibilidadeMecanica}
                    unitType="porcentagem"
                    acimaMeta={{
                      quantidade: contarItensMeta(dadosProcessados.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('colheita_semanal').disponibilidadeMecanica),
                      total: dadosProcessados.disponibilidade_mecanica.length,
                      percentual: (contarItensMeta(dadosProcessados.disponibilidade_mecanica, 'disponibilidade', configManager.getMetas('colheita_semanal').disponibilidadeMecanica) / (dadosProcessados.disponibilidade_mecanica.length || 1)) * 100
                    }}
                  />
                )}
              </SimpleGrid>
              <Box 
                border="1px solid"
                borderColor="black"
                borderRadius="md"
                p={2}
                h="calc(100% - 100px)"
                overflow="hidden"
              >
                <GraficoDisponibilidadeMecanicaSemanal
                  data={dadosProcessados.disponibilidade_mecanica}
                  meta={configManager.getMetas('colheita_semanal').disponibilidadeMecanica}
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
                    meta={configManager.getMetas('colheita_semanal').eficienciaEnergetica}
                    unitType="porcentagem"
                    acimaMeta={{
                      quantidade: contarItensMeta(dadosProcessados.eficiencia_energetica, 'eficiencia', configManager.getMetas('colheita_semanal').eficienciaEnergetica),
                      total: dadosProcessados.eficiencia_energetica.length,
                      percentual: (contarItensMeta(dadosProcessados.eficiencia_energetica, 'eficiencia', configManager.getMetas('colheita_semanal').eficienciaEnergetica) / (dadosProcessados.eficiencia_energetica.length || 1)) * 100
                    }}
                  />
                )}
              </SimpleGrid>
              <Box 
                border="1px solid"
                borderColor="black"
                borderRadius="md"
                p={2}
                h="calc(100% - 100px)"
                overflow="hidden"
              >
                <GraficoEficienciaEnergeticaSemanal
                  data={dadosProcessados.eficiencia_energetica}
                  meta={configManager.getMetas('colheita_semanal').eficienciaEnergetica}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </A4Colheita>

      {/* Terceira Página - Hora Elevador */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column">
          <PageHeader showDate={true} />
          <Box flex="1" display="flex" flexDirection="column">
            {/* Hora Elevador */}
            <Box flex="1">
              <SectionTitle title="Hora Elevador" />
              <SimpleGrid columns={1} spacing={3} w="100%" mb={2}>
                {dadosProcessados.hora_elevador.length > 0 && secoes.horaElevador && (
                  <IndicatorCard
                    title=""
                    value={calcularMedia(dadosProcessados.hora_elevador, 'horas')}
                    meta={configManager.getMetas('colheita_semanal').horaElevador}
                    unitType="horas"
                    acimaMeta={{
                      quantidade: contarItensMeta(dadosProcessados.hora_elevador, 'horas', configManager.getMetas('colheita_semanal').horaElevador),
                      total: dadosProcessados.hora_elevador.length,
                      percentual: (contarItensMeta(dadosProcessados.hora_elevador, 'horas', configManager.getMetas('colheita_semanal').horaElevador) / (dadosProcessados.hora_elevador.length || 1)) * 100
                    }}
                  />
                )}
              </SimpleGrid>
              <Box 
                border="1px solid"
                borderColor="black"
                borderRadius="md"
                p={2}
                h="calc(100% - 100px)"
                overflow="hidden"
              >
                <GraficoHoraElevadorSemanal
                  data={dadosProcessados.hora_elevador}
                  meta={configManager.getMetas('colheita_semanal').horaElevador}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </A4Colheita>

      {/* Quarta Página - Motor Ocioso */}
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
                    meta={configManager.getMetas('colheita_semanal').motorOcioso}
                    isInverted={true}
                    unitType="porcentagem"
                    acimaMeta={{
                      quantidade: contarItensMeta(dadosProcessados.motor_ocioso, 'percentual', configManager.getMetas('colheita_semanal').motorOcioso, false),
                      total: dadosProcessados.motor_ocioso.length,
                      percentual: (contarItensMeta(dadosProcessados.motor_ocioso, 'percentual', configManager.getMetas('colheita_semanal').motorOcioso, false) / (dadosProcessados.motor_ocioso.length || 1)) * 100
                    }}
                  />
                )}
              </SimpleGrid>
              <Box 
                border="1px solid"
                borderColor="black"
                borderRadius="md"
                p={2}
                h="calc(100% - 100px)"
                overflow="hidden"
              >
                <GraficoMotorOciosoSemanal
                  data={dadosProcessados.motor_ocioso}
                  meta={configManager.getMetas('colheita_semanal').motorOcioso}
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
                      meta={configManager.getMetas('colheita_semanal').usoGPS}
                      unitType="porcentagem"
                      acimaMeta={{
                        quantidade: contarItensMeta(dadosProcessados.uso_gps, 'porcentagem', configManager.getMetas('colheita_semanal').usoGPS),
                        total: dadosProcessados.uso_gps.length,
                        percentual: (contarItensMeta(dadosProcessados.uso_gps, 'porcentagem', configManager.getMetas('colheita_semanal').usoGPS) / (dadosProcessados.uso_gps.length || 1)) * 100
                      }}
                    />
                  )}
                </SimpleGrid>
                <Box 
                  border="1px solid"
                  borderColor="black"
                  borderRadius="md"
                  p={2}
                  h="calc(100% - 100px)"
                  overflow="hidden"
                >
                  <GraficoUsoGPSSemanal
                    data={dadosProcessados.uso_gps}
                    meta={configManager.getMetas('colheita_semanal').usoGPS}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </A4Colheita>
      )}

      {/* Nova Página - Gráfico de Produção */}
      <A4Colheita>
        <Box h="100%" display="flex" flexDirection="column">
          <PageHeader showDate={true} />
          <Box flex="1" display="flex" flexDirection="column" p={3}>
            <Heading
              as="h1"
              size="sm"
              textAlign="center"
              mb={4}
              color="black"
              fontWeight="bold"
              fontSize="15px"
            >
              Gráfico de Produção
            </Heading>
            
            {/* Container vazio com borda para posterior inclusão de imagem */}
            <Box 
              border="1px solid"
              borderColor="black"
              borderRadius="md"
              h="calc(100% - 40px)"
              w="100%"
            />
          </Box>
        </Box>
      </A4Colheita>

      {/* Sexta Página - Resumo */}
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
              Resumo do Relatório de Colheita Semanal
            </Heading>

            {/* Seção Frotas */}
            <Box>
              <Text fontSize="14px" fontWeight="bold" color="black" mb={2} textAlign="center">
                Resumo de Frotas
              </Text>
              <TabelaFrotas 
                dados={dadosProcessados.disponibilidade_mecanica} 
                tipo="colheita_semanal"
              />
            </Box>

            {/* Seção Operadores */}
            <Box mt={6}>
              <Text fontSize="14px" fontWeight="bold" color="black" mb={2} textAlign="center">
                Resumo de Operadores
              </Text>
              <TabelaOperadores 
                dados={{
                  eficiencia_energetica: dadosProcessados.eficiencia_energetica,
                  motor_ocioso: dadosProcessados.motor_ocioso,
                  hora_elevador: dadosProcessados.hora_elevador,
                  uso_gps: dadosProcessados.uso_gps
                }} 
                tipo="colheita_semanal" 
              />
            </Box>
          </Box>
        </Box>
      </A4Colheita>

      {/* Estilos de impressão */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
} 