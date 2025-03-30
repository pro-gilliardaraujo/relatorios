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
        df['Data/Hora'] = pd.to_datetime(df['Data/Hora'])
        state_times = df.groupby('Estado').agg({
            'Data/Hora': lambda x: (x.max() - x.min()).total_seconds() / 3600
        }).round(2)
        
        # Média de velocidade por operação
        speed_by_op = df.groupby('Grupo Operacao')['Velocidade'].agg({
            'media': 'mean',
            'max': 'max',
            'min': 'min'
        }).round(2)
        
        # Tempo de motor ocioso (RPM baixo com motor ligado)
        idle_condition = (df['Motor Ligado'] == True) & (df['RPM Motor'] < 1000)
        idle_time = df[idle_condition].groupby('Equipamento').agg({
            'Data/Hora': lambda x: (x.max() - x.min()).total_seconds() / 3600
        }).round(2)
        
        # Tempo total por grupo de operação
        operation_times = df.groupby('Grupo Operacao').agg({
            'Data/Hora': lambda x: (x.max() - x.min()).total_seconds() / 3600
        }).round(2)
        
        metrics.update({
            'state_times': state_times['Data/Hora'].to_dict(),
            'speed_by_operation': speed_by_op.to_dict(),
            'idle_time': idle_time['Data/Hora'].to_dict(),
            'operation_times': operation_times['Data/Hora'].to_dict()
        })
        
        return metrics

    async def _calculate_performance(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calcula indicadores de performance"""
        performance = {}
        
        # Disponibilidade mecânica por equipamento
        equipment_availability = {}
        for equipment in df['Equipamento'].unique():
            equip_data = df[df['Equipamento'] == equipment]
            total_time = (equip_data['Data/Hora'].max() - equip_data['Data/Hora'].min()).total_seconds() / 3600
            maintenance_time = equip_data[equip_data['Grupo Operacao'] == 'Manutenção']['Data/Hora'].agg(
                lambda x: (x.max() - x.min()).total_seconds() / 3600
            ).sum()
            
            availability = ((total_time - maintenance_time) / total_time * 100).round(2) if total_time > 0 else 0
            equipment_availability[equipment] = {
                'availability': availability,
                'total_hours': round(total_time, 2),
                'maintenance_hours': round(maintenance_time, 2)
            }
        
        # Utilização do RTK por equipamento
        rtk_usage = df.groupby('Equipamento').agg({
            'RTK': lambda x: (x == True).mean() * 100
        }).round(2)
        
        # Motor ligado vs desligado por equipamento
        motor_usage = df.groupby('Equipamento').agg({
            'Motor Ligado': lambda x: (x == True).mean() * 100
        }).round(2)
        
        performance.update({
            'mechanical_availability': equipment_availability,
            'rtk_usage': rtk_usage['RTK'].to_dict(),
            'motor_usage': motor_usage['Motor Ligado'].to_dict()
        })
        
        return performance

    async def _analyze_time_distribution(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analisa distribuição de tempo"""
        time_analysis = {}
        
        # Distribuição por grupo de operação e equipamento
        group_distribution = df.groupby(['Equipamento', 'Grupo Operacao']).agg({
            'Data/Hora': lambda x: (x.max() - x.min()).total_seconds() / 3600
        }).round(2)
        
        # Top 5 ofensores por equipamento
        lost_time = {}
        for equipment in df['Equipamento'].unique():
            equip_data = df[
                (df['Equipamento'] == equipment) & 
                (df['Grupo Operacao'] == 'Perdida')
            ]
            if not equip_data.empty:
                lost_time[equipment] = equip_data.groupby('Estado').agg({
                    'Data/Hora': lambda x: (x.max() - x.min()).total_seconds() / 3600
                }).round(2).nlargest(5, 'Data/Hora')['Data/Hora'].to_dict()
        
        # Análise de velocidade média por hora do dia
        hourly_speed = df.assign(
            hour=df['Data/Hora'].dt.hour
        ).groupby(['Equipamento', 'hour'])['Velocidade'].mean().round(2)
        
        time_analysis.update({
            'group_distribution': group_distribution.to_dict(),
            'top_offenders': lost_time,
            'hourly_speed': hourly_speed.to_dict()
        })
        
        return time_analysis

    async def _process_geographic_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Processa dados geográficos"""
        geo_data = {}
        
        # Filtrar pontos válidos e criar features para o mapa
        valid_coords = df[
            (df['Latitude'].notna()) & 
            (df['Longitude'].notna()) &
            (df['Latitude'] != 0) & 
            (df['Longitude'] != 0)
        ]
        
        features = []
        for _, row in valid_coords.iterrows():
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [row['Longitude'], row['Latitude']]
                },
                'properties': {
                    'equipamento': row['Equipamento'],
                    'estado': row['Estado'],
                    'grupo_operacao': row['Grupo Operacao'],
                    'velocidade': float(row['Velocidade']),
                    'rpm': float(row['RPM Motor']),
                    'rtk': bool(row['RTK']),
                    'motor_ligado': bool(row['Motor Ligado']),
                    'timestamp': row['Data/Hora'].isoformat()
                }
            }
            features.append(feature)
        
        # Adicionar estatísticas por área
        area_stats = valid_coords.groupby(['Equipamento', 'Grupo Operacao']).agg({
            'Velocidade': ['mean', 'max', 'min'],
            'RPM Motor': ['mean', 'max', 'min']
        }).round(2)
        
        geo_data.update({
            'type': 'FeatureCollection',
            'features': features,
            'area_stats': area_stats.to_dict()
        })
        
        return geo_data 