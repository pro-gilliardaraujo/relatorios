from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from config.settings import PROCESSING_CONFIG, PLANTADEIRAS_CONFIG, ESTADOS_OPERACIONAIS
from .base_processor import BaseProcessorConfig, BaseReportProcessor

@dataclass
class PlantadeirasConfig(BaseProcessorConfig):
    """Configurações específicas para o processador de plantadeiras."""
    estados_produtivos: List[str] = ("TRABALHANDO",)
    estados_manutencao: List[str] = ("MANUTENCAO MECANICA", "MANUTENCAO ELETRICA")
    estados_parada: List[str] = ("PARADA",)
    estados_deslocamento: List[str] = ("DESLOC P/ DESC", "MANOBRA")

class PlantadeirasProcessor(BaseReportProcessor):
    """Processador específico para o Boletim Diário de Plantadeiras."""
    
    def __init__(self):
        config = PlantadeirasConfig(
            colunas_necessarias=PLANTADEIRAS_CONFIG["COLUNAS_NECESSARIAS"],
            colunas_ignoradas=PLANTADEIRAS_CONFIG["COLUNAS_IGNORADAS"],
            estados_produtivos=ESTADOS_OPERACIONAIS["PRODUTIVO"],
            estados_manutencao=ESTADOS_OPERACIONAIS["MANUTENCAO"],
            estados_parada=ESTADOS_OPERACIONAIS["PARADA"],
            estados_deslocamento=ESTADOS_OPERACIONAIS["DESLOCAMENTO"]
        )
        super().__init__(config)
        
    def load_data(self, file_path: Path) -> None:
        """Carrega os dados do arquivo Excel/CSV."""
        if file_path.suffix.lower() == '.csv':
            self.df = pd.read_csv(file_path, sep=';')
        else:
            self.df = pd.read_excel(file_path)
            
        # Converte Data/Hora para datetime
        self.df['Data/Hora'] = pd.to_datetime(self.df['Data/Hora'])
        self.data_processamento = datetime.now()
        
        # Processa as horas decimais e filtra registros inválidos
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
        colunas_obrigatorias = [
            'Equipamento', 'Data/Hora', 'Estado', 'RPM Motor',
            'Velocidade', 'Motor Ligado', 'RTK'
        ]
        
        # Verifica colunas obrigatórias
        for coluna in colunas_obrigatorias:
            if coluna not in self.df.columns:
                erros.append(f"Coluna obrigatória ausente: {coluna}")
                
        # Verifica valores nulos
        for coluna in colunas_obrigatorias:
            if coluna in self.df.columns and self.df[coluna].isnull().any():
                erros.append(f"Valores nulos encontrados na coluna: {coluna}")
        
        # Verifica se há registros após a filtragem
        if len(self.df) == 0:
            erros.append("Nenhum registro válido após filtragem de tempos")
        
        # Adiciona informação sobre registros removidos
        if hasattr(self, '_registros_removidos'):
            total_removidos = self._registros_removidos
            if total_removidos > 0:
                erros.append(f"Foram removidos {total_removidos} registros com tempo maior que {self.config.tempo_maximo_entre_registros} minutos")
                
        return len(erros) == 0, erros
        
    def process_data(self) -> Dict[str, Any]:
        """Processa os dados e retorna os indicadores calculados."""
        if self.df is None:
            raise ValueError("Dados não carregados")
            
        resultados = {}
        
        # Agrupa por equipamento
        for equipamento in self.df['Equipamento'].unique():
            df_equip = self.df[self.df['Equipamento'] == equipamento]
            
            # Calcula tempo total por estado usando horas_decimais
            tempo_estados = df_equip.groupby('Estado')['horas_decimais'].sum() * 3600  # converte para segundos
            
            # Calcula métricas de operação
            tempo_produtivo = sum(
                tempo_estados[estado] 
                for estado in self.config.estados_produtivos 
                if estado in tempo_estados
            )
            
            tempo_manutencao = sum(
                tempo_estados[estado] 
                for estado in self.config.estados_manutencao 
                if estado in tempo_estados
            )
            
            tempo_total = tempo_estados.sum()
            
            # Calcula médias de velocidade em operação
            df_operando = df_equip[df_equip['Estado'].isin(self.config.estados_produtivos)]
            velocidade_media = df_operando['Velocidade'].mean()
            
            resultados[equipamento] = {
                'tempo_total': tempo_total,
                'tempo_produtivo': tempo_produtivo,
                'tempo_manutencao': tempo_manutencao,
                'disponibilidade': (tempo_total - tempo_manutencao) / tempo_total * 100 if tempo_total > 0 else 0,
                'utilizacao': tempo_produtivo / tempo_total * 100 if tempo_total > 0 else 0,
                'velocidade_media': velocidade_media,
                'tempo_estados': tempo_estados.to_dict(),
                'registros_validos': len(df_equip),
                'horas_totais': df_equip['horas_decimais'].sum()
            }
            
        return resultados
        
    def generate_graphs(self, resultados: Dict[str, Any]) -> Dict[str, go.Figure]:
        """Gera os gráficos para o boletim."""
        graficos = {}
        
        # Gráfico de Disponibilidade e Utilização
        fig_disp_util = make_subplots(
            rows=1, cols=2,
            subplot_titles=('Disponibilidade por Equipamento', 'Utilização por Equipamento')
        )
        
        equipamentos = list(resultados.keys())
        disponibilidade = [res['disponibilidade'] for res in resultados.values()]
        utilizacao = [res['utilizacao'] for res in resultados.values()]
        
        fig_disp_util.add_trace(
            go.Bar(x=equipamentos, y=disponibilidade, name='Disponibilidade'),
            row=1, col=1
        )
        fig_disp_util.add_trace(
            go.Bar(x=equipamentos, y=utilizacao, name='Utilização'),
            row=1, col=2
        )
        
        fig_disp_util.update_layout(
            title_text='Indicadores de Performance',
            showlegend=True
        )
        
        graficos['disp_util'] = fig_disp_util
        
        return graficos 