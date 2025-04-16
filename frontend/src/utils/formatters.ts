/**
 * Utilitários para formatação de dados nos relatórios
 */

/**
 * Limpa o ID do operador, removendo numerações desnecessárias
 * @param idCompleto ID original do operador
 * @returns ID limpo ou string vazia se for apenas um número de índice
 */
export const limparIdOperador = (idCompleto: string): string => {
  // Se não tiver ID, retorna string vazia
  if (!idCompleto) return '';
  
  // Se o ID contém um padrão como "123 - NOME", extrai apenas o número inicial
  if (typeof idCompleto === 'string' && idCompleto.includes(' - ')) {
    return idCompleto.split(' - ')[0].trim();
  }
  
  // Se o ID parece ser apenas um índice numérico (1, 2, 3, etc.), retorna vazio
  if (/^\d{1,2}$/.test(String(idCompleto))) {
    return '';
  }
  
  // Se não encontrou nenhum dos padrões, retorna o ID original
  return String(idCompleto);
};

/**
 * Formata um código de frota, garantindo que seja tratado como texto
 * @param frota Código da frota
 * @returns Frota como string sem prefixos
 */
export const formatarFrota = (frota: string | number): string => {
  // Se for undefined ou null, retorna string vazia
  if (frota === undefined || frota === null) return '';
  
  // Garantir que seja tratado como string e remover decimais
  const frotaStr = String(frota).trim();
  const frotaSemDecimal = frotaStr.includes('.') ? frotaStr.split('.')[0] : frotaStr;
  
  // Remover prefixo "Frota" se existir
  if (frotaSemDecimal.toLowerCase().startsWith('frota ')) {
    return frotaSemDecimal.substring(6).trim();
  }
  
  return frotaSemDecimal;
};

/**
 * Formata a exibição do operador no formato "ID - Nome" quando apropriado
 * @param id ID do operador (já limpo)
 * @param nome Nome do operador
 * @returns String formatada para exibição
 */
export const formatarExibicaoOperador = (id: string, nome: string): string => {
  // Se tiver ID, mostra no formato "ID - Nome"
  if (id && nome) {
    return `${id} - ${nome}`;
  }
  
  // Se só tiver nome, mostra apenas o nome
  if (nome) {
    return nome;
  }
  
  // Se só tiver ID, mostra apenas o ID
  if (id) {
    return id;
  }
  
  // Se não tiver nenhum dos dois, mostra "Sem identificação"
  return 'Sem identificação';
};

/**
 * Formata um número de horas para o formato "Xh00m"
 * @param horas Número de horas (pode ser decimal)
 * @returns String formatada no padrão "Xh00m"
 */
export const formatarHoras = (horas: number): string => {
  if (typeof horas !== 'number' || isNaN(horas)) return '0h00m';
  
  // Separar horas e minutos
  const horasInteiras = Math.floor(horas);
  const minutos = Math.round((horas - horasInteiras) * 60);
  
  // Se os minutos forem 60, incrementar a hora
  if (minutos === 60) {
    return `${horasInteiras + 1}h00m`;
  }
  
  // Formatar minutos com dois dígitos
  const minutosFormatados = minutos.toString().padStart(2, '0');
  
  return `${horasInteiras}h${minutosFormatados}m`;
}; 