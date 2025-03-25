export interface ReportData {
  tempo_total: number
  tempo_produtivo: number
  tempo_manutencao: number
  disponibilidade: number
  utilizacao: number
  rpm_medio: number
  velocidade_media: number
  tempo_estados: Record<string, number>
  registros_validos: number
  horas_totais: number
}

export interface ProcessedData {
  status: string
  data: Record<string, ReportData>
  graphs: Record<string, any>
  errors?: string[]
}

export interface ImageData {
  id: string
  url: string
  type: ImageType
}

export type ImageType = 
  | 'area_plantio'
  | 'mapa_velocidade'
  | 'mapa_rpm'
  | 'consumo_combustivel'
  | 'temperatura_motor'
  | 'area_total'

export const IMAGE_TYPES: Record<ImageType, string> = {
  area_plantio: 'Área de Plantio',
  mapa_velocidade: 'Mapa de Velocidade',
  mapa_rpm: 'Mapa de RPM',
  consumo_combustivel: 'Consumo de Combustível',
  temperatura_motor: 'Mapa de Temperatura do Motor',
  area_total: 'Mapa por Área Total'
} 