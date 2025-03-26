import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime, timedelta
from pathlib import Path
from fastapi import UploadFile, HTTPException
from ..core.config import settings

class ExcelProcessor:
    def __init__(self):
        self.required_columns = [
            'Equipamento', 'Data/Hora', 'Estado', 
            'Estado Operacional', 'Grupo Operacao',
            'Horimetro', 'RPM Motor', 'Velocidade',
            'RTK', 'Motor Ligado', 'Latitude', 'Longitude'
        ]

    async def validate_file(self, file: UploadFile) -> bool:
        """Valida o arquivo enviado"""
        # Verifica extensão
        ext = file.filename.split('.')[-1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Formato de arquivo não suportado. Use: {settings.ALLOWED_EXTENSIONS}"
            )
        return True

    async def process_file(self, file: UploadFile) -> Dict[str, Any]:
        """Processa o arquivo Excel/CSV"""
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file.file, sep=';')
            else:
                df = pd.read_excel(file.file)
            
            # Validar colunas
            missing_cols = [col for col in self.required_columns if col not in df.columns]
            if missing_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Colunas ausentes: {missing_cols}"
                )
            
            return await self._transform_data(df)
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def _transform_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Transforma os dados brutos em formato estruturado"""
        return {
            'operational_metrics': await self._calculate_operational_metrics(df),
            'performance_indicators': await self._calculate_performance(df),
            'time_analysis': await self._analyze_time_distribution(df),
            'geographic_data': await self._process_geographic_data(df)
        }

    async def _calculate_operational_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calcula métricas operacionais"""
        metrics = {}
        
        # Tempo total por estado
        state_times = df.groupby('Estado')['Data/Hora'].agg(
            lambda x: (x.max() - x.min()).total_seconds() / 3600
        ).round(2)
        
        # Média de velocidade por operação
        speed_by_op = df.groupby('Operacao')['Velocidade'].mean().round(2)
        
        # Tempo de motor ocioso (RPM baixo com motor ligado)
        idle_condition = (df['Motor Ligado'] == 'Sim') & (df['RPM Motor'] < 1000)
        idle_time = df[idle_condition]['Data/Hora'].agg(
            lambda x: (x.max() - x.min()).total_seconds() / 3600
        ).round(2)
        
        metrics.update({
            'state_times': state_times.to_dict(),
            'speed_by_operation': speed_by_op.to_dict(),
            'idle_time': idle_time
        })
        
        return metrics

    async def _calculate_performance(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calcula indicadores de performance"""
        performance = {}
        
        # Disponibilidade mecânica
        total_time = (df['Data/Hora'].max() - df['Data/Hora'].min()).total_seconds() / 3600
        maintenance_time = df[df['Grupo Operacao'] == 'Manutenção']['Data/Hora'].agg(
            lambda x: (x.max() - x.min()).total_seconds() / 3600
        ).sum()
        
        mechanical_availability = ((total_time - maintenance_time) / total_time * 100).round(2)
        
        # Utilização do RTK
        rtk_usage = (df['RTK'] == 'Sim').mean() * 100
        
        performance.update({
            'mechanical_availability': mechanical_availability,
            'rtk_usage': rtk_usage,
            'total_hours': total_time,
            'maintenance_hours': maintenance_time
        })
        
        return performance

    async def _analyze_time_distribution(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analisa distribuição de tempo"""
        time_analysis = {}
        
        # Distribuição por grupo de operação
        group_distribution = df.groupby('Grupo Operacao')['Data/Hora'].agg(
            lambda x: (x.max() - x.min()).total_seconds() / 3600
        ).round(2)
        
        # Top 5 ofensores (maiores tempos perdidos)
        lost_time = df[df['Grupo Operacao'] == 'Perdida'].groupby('Operacao')['Data/Hora'].agg(
            lambda x: (x.max() - x.min()).total_seconds() / 3600
        ).sort_values(ascending=False).head(5)
        
        time_analysis.update({
            'group_distribution': group_distribution.to_dict(),
            'top_offenders': lost_time.to_dict()
        })
        
        return time_analysis

    async def _process_geographic_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Processa dados geográficos"""
        geo_data = {}
        
        # Filtrar pontos válidos
        valid_coords = df[
            (df['Latitude'].notna()) & 
            (df['Longitude'].notna())
        ]
        
        # Criar features para o mapa
        features = []
        for _, row in valid_coords.iterrows():
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [row['Longitude'], row['Latitude']]
                },
                'properties': {
                    'estado': row['Estado'],
                    'velocidade': row['Velocidade'],
                    'rpm': row['RPM Motor'],
                    'timestamp': row['Data/Hora'].isoformat()
                }
            }
            features.append(feature)
        
        geo_data.update({
            'type': 'FeatureCollection',
            'features': features
        })
        
        return geo_data 