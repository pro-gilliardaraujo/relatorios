// Função para verificar se os dados estão no formato esperado
const verificarFormatoDados = (dados: any) => {
  if (!dados) return false;
  
  // Verificar se pelo menos uma das propriedades esperadas existe e tem itens
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
  
  // Verificar se pelo menos uma das seções tem dados
  return temDisponibilidade || temEficiencia || temHorasElevador || temMotorOcioso || temUsoGPS ||
         temDisponibilidadeAlt || temEficienciaAlt || temHorasElevadorAlt || temMotorOciosoAlt || temUsoGPSAlt;
};

// Função para processar dados
export const processarDados = (dados: any) => {
  if (!dados) return {};
  
  // Verificar se os dados estão no formato correto
  const dadosValidos = verificarFormatoDados(dados);
  if (!dadosValidos) {
    console.log('❌ Dados inválidos ou em formato incompatível');
    return {};
  }
  
  // Processar dados de disponibilidade mecânica
  const disponibilidade_mecanica = dados.disponibilidade_mecanica || dados.disponibilidadeMecanica || [];
  
  // Processar dados de eficiência energética
  const eficiencia_energetica = dados.eficiencia_energetica || dados.eficienciaEnergetica || [];
  
  // Processar dados de motor ocioso
  const motor_ocioso = dados.motor_ocioso || dados.motorOcioso || [];
  
  // Processar dados de horas de elevador
  const hora_elevador = dados.hora_elevador || dados.horaElevador || [];
  
  // Processar dados de uso de GPS
  const uso_gps = dados.uso_gps || dados.usoGPS || [];

  // Processar dados de TDH
  const tdh = dados.tdh || [];

  // Processar dados de diesel
  const diesel = dados.diesel || [];

  // Processar dados de impureza vegetal
  const impureza_vegetal = dados.impureza_vegetal || [];

  // Processar dados de média de velocidade
  const media_velocidade = dados.media_velocidade || [];
  
  return {
    disponibilidade_mecanica,
    eficiencia_energetica,
    motor_ocioso,
    hora_elevador,
    uso_gps,
    tdh,
    diesel,
    impureza_vegetal,
    media_velocidade
  };
}; 