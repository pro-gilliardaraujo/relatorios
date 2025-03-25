from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

import pandas as pd
import plotly.graph_objects as go

@dataclass
class BaseProcessorConfig:
    """Configuração base para processadores de relatórios."""
    colunas_necessarias: List[str]
    colunas_ignoradas: List[str]
    tempo_maximo_entre_registros: float = 25  # minutos
    remover_registros_invalidos: bool = True

class BaseReportProcessor(ABC):
    """Classe base para processadores de relatórios."""
    
    def __init__(self, config: BaseProcessorConfig):
        self.config = config
        self.df: Optional[pd.DataFrame] = None
        self.data_processamento: Optional[datetime] = None
        
    def load_data(self, file_path: Path) -> None:
        """Carrega os dados do arquivo Excel/CSV."""
        if file_path.suffix.lower() == '.csv':
            self.df = pd.read_csv(file_path, sep=';')
        else:
            self.df = pd.read_excel(file_path)
            
        # Remove colunas desnecessárias
        if self.df is not None:
            colunas_manter = [col for col in self.df.columns if col in self.config.colunas_necessarias]
            self.df = self.df[colunas_manter]
            
        # Converte Data/Hora para datetime
        if 'Data/Hora' in self.df.columns:
            self.df['Data/Hora'] = pd.to_datetime(self.df['Data/Hora'])
            
        self.data_processamento = datetime.now()
        
        # Processa as horas decimais
        self._process_horas_decimais()
        
    def _process_horas_decimais(self) -> None:
        """Processa as horas decimais e remove registros com tempo muito grande entre eles."""
        if self.df is None or len(self.df) == 0:
            return
            
        # Ordena o DataFrame por equipamento e data/hora
        self.df = self.df.sort_values(['Equipamento', 'Data/Hora'])
        
        # Calcula a diferença de tempo entre registros consecutivos por equipamento
        self.df['horas_decimais'] = self.df.groupby('Equipamento')['Data/Hora'].diff().dt.total_seconds() / 3600
        
        # Marca registros com tempo muito grande entre eles
        registros_invalidos = self.df['horas_decimais'] > (self.config.tempo_maximo_entre_registros / 60)
        
        if self.config.remover_registros_invalidos:
            # Remove os registros inválidos
            self.df = self.df[~registros_invalidos].copy()
        else:
            # Marca os registros inválidos
            self.df['registro_invalido'] = registros_invalidos
        
        # Preenche o primeiro registro de cada equipamento com a média dos valores válidos
        media_horas = self.df[~self.df['horas_decimais'].isna()]['horas_decimais'].mean()
        self.df['horas_decimais'] = self.df['horas_decimais'].fillna(media_horas)
        
    def validate_data(self) -> Tuple[bool, List[str]]:
        """Valida os dados carregados."""
        if self.df is None:
            return False, ["Nenhum dado carregado"]
            
        erros = []
        
        # Verifica colunas necessárias
        for coluna in self.config.colunas_necessarias:
            if coluna not in self.df.columns:
                erros.append(f"Coluna obrigatória ausente: {coluna}")
                
        # Verifica valores nulos
        for coluna in self.config.colunas_necessarias:
            if coluna in self.df.columns and self.df[coluna].isnull().any():
                erros.append(f"Valores nulos encontrados na coluna: {coluna}")
        
        # Verifica se há registros após a filtragem
        if len(self.df) == 0:
            erros.append("Nenhum registro válido após filtragem")
        
        return len(erros) == 0, erros
    
    @abstractmethod
    def process_data(self) -> Dict[str, Any]:
        """Processa os dados e retorna os indicadores calculados."""
        pass
    
    @abstractmethod
    def generate_graphs(self, resultados: Dict[str, Any]) -> Dict[str, go.Figure]:
        """Gera os gráficos para o relatório."""
        pass 