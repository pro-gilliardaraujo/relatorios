from pydantic import BaseModel
from typing import Dict, List, Optional, Any

class ProcessingError(BaseModel):
    """Schema para erros de processamento."""
    message: str
    details: Optional[Dict[str, Any]] = None

class ReportData(BaseModel):
    """Schema para dados do relatório."""
    tempo_total: float
    tempo_produtivo: float
    tempo_manutencao: float
    disponibilidade: float
    utilizacao: float
    rpm_medio: float
    velocidade_media: float
    tempo_estados: Dict[str, float]
    registros_validos: int
    horas_totais: float

class ReportResponse(BaseModel):
    """Schema para resposta do processamento de relatório."""
    status: str
    data: Optional[Dict[str, ReportData]] = None
    graphs: Optional[Dict[str, Any]] = None
    errors: Optional[List[str]] = None 