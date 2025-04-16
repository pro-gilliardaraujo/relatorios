"""
Processador unificado para arquivos TXT de colhedoras e transbordos.
Gera múltiplos relatórios a partir de arquivos TXT de entrada.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from fastapi import UploadFile, HTTPException, BackgroundTasks
import io
import os
import tempfile
from pathlib import Path
import json
import asyncio
from ..core.config import settings
from ..database.supabase import supabase_client

# Constantes comuns
OPERADORES_EXCLUIR = ["9999 - TROCA DE TURNO"]

# Constantes para colhedoras
COLUNAS_REMOVER_COLHEDORAS = [
    'Justificativa Corte Base Desligado',
    'Latitude',
    'Longitude',
    'Regional',
    'Tipo de Equipamento',
    'Unidade',
    'Centro de Custo'
]

COLUNAS_DESEJADAS_COLHEDORAS = [
    'Data', 'Hora', 'Equipamento', 'Apertura do Rolo', 'Codigo da Operacao',
    'Codigo Frente (digitada)', 'Corporativo', 'Corte Base Automatico/Manual',
    'Descricao Equipamento', 'Estado', 'Estado Operacional', 'Esteira Ligada',
    'Field Cruiser', 'Grupo Equipamento/Frente', 'Grupo Operacao', 'Horimetro',
    'Implemento Ligado', 'Motor Ligado', 'Operacao', 'Operador', 'Pressao de Corte',
    'RPM Extrator', 'RPM Motor', 'RTK (Piloto Automatico)', 'Fazenda', 'Zona',
    'Talhao', 'Velocidade', 'Diferença_Hora', 'Parada com Motor Ligado',
    'Horas Produtivas'
]

# Constantes para transbordos
COLUNAS_REMOVER_TRANSBORDOS = [
    'Latitude',
    'Longitude',
    'Regional',
    'Unidade',
    'Centro de Custo'
]

COLUNAS_DESEJADAS_TRANSBORDOS = [
    'Data', 'Hora', 'Equipamento', 'Codigo da Operacao',
    'Codigo Frente (digitada)', 'Corporativo',
    'Descricao Equipamento', 'Estado', 'Estado Operacional',
    'Grupo Equipamento/Frente', 'Grupo Operacao', 'Horimetro',
    'Motor Ligado', 'Operacao', 'Operador',
    'RPM Motor', 'Fazenda', 'Zona',
    'Talhao', 'Velocidade', 'Diferença_Hora', 'Parado Com Motor Ligado',
    'Horas Produtivas', 'GPS'
]

class UnifiedTXTProcessor:
    """
    Processador unificado para arquivos TXT de colhedoras e transbordos.
    Gera múltiplos relatórios com base nos arquivos e seleções do usuário.
    """
    
    def __init__(self):
        # Inicialização das propriedades
        self.task_status = {}
        self.processing_results = {}
        self.temp_dir = None
    
    async def process_files(
        self,
        colhedora_file: Optional[UploadFile] = None,
        transbordo_file: Optional[UploadFile] = None,
        frentes: List[str] = [],
        report_types: List[str] = [],
        report_date: str = None,
        is_teste: bool = False,
        task_id: str = None
    ) -> Dict[str, Any]:
        """
        Processa os arquivos TXT e gera múltiplos relatórios com base nas seleções.
        
        Args:
            colhedora_file: Arquivo TXT de colhedoras
            transbordo_file: Arquivo TXT de transbordos
            frentes: Lista de frentes selecionadas
            report_types: Lista de tipos de relatórios selecionados
            report_date: Data do relatório
            is_teste: Indica se é um relatório de teste
            task_id: ID da tarefa para acompanhamento
            
        Returns:
            Dict com os resultados do processamento
        """
        try:
            print(f"Iniciando processamento unificado. Task ID: {task_id}")
            
            # Criar diretório temporário para os arquivos
            self.temp_dir = tempfile.TemporaryDirectory()
            temp_path = Path(self.temp_dir.name)
            
            # Inicializar o status da tarefa
            if task_id:
                self.task_status[task_id] = {
                    "status": "processing",
                    "progress": 0,
                    "total_reports": 0,
                    "completed_reports": 0,
                    "reports": []
                }
            
            # Calcular o total de relatórios a serem gerados
            total_reports = len(frentes) * len(report_types)
            
            if task_id:
                self.task_status[task_id]["total_reports"] = total_reports
            
            # Validar que temos arquivos e seleções
            if not colhedora_file and not transbordo_file:
                raise ValueError("Pelo menos um arquivo (colhedora ou transbordo) deve ser fornecido")
            
            if not frentes:
                raise ValueError("Selecione pelo menos uma frente")
                
            if not report_types:
                raise ValueError("Selecione pelo menos um tipo de relatório")
                
            if not report_date:
                raise ValueError("Informe a data do relatório")
            
            # Processar e salvar os arquivos TXT
            colhedora_data = None
            if colhedora_file:
                colhedora_path = temp_path / f"colhedora_{task_id}.txt"
                await self._save_upload_file(colhedora_file, colhedora_path)
                colhedora_data = await self._process_colhedora_file(str(colhedora_path))
            
            transbordo_data = None
            if transbordo_file:
                transbordo_path = temp_path / f"transbordo_{task_id}.txt"
                await self._save_upload_file(transbordo_file, transbordo_path)
                transbordo_data = await self._process_transbordo_file(str(transbordo_path))
            
            # Dicionário para armazenar os resultados por relatório
            results = {}
            
            # Processar cada combinação de frente e tipo de relatório
            completed_reports = 0
            
            for frente in frentes:
                for report_type in report_types:
                    # Verificar o tipo de arquivo necessário
                    needs_colhedora = "colheita" in report_type
                    needs_transbordo = "transbordo" in report_type
                    
                    # Pular se não temos o arquivo necessário
                    if (needs_colhedora and not colhedora_data) or (needs_transbordo and not transbordo_data):
                        completed_reports += 1
                        if task_id:
                            self.task_status[task_id]["completed_reports"] = completed_reports
                            self.task_status[task_id]["progress"] = int((completed_reports / total_reports) * 100)
                        continue
                    
                    # Gerar chave única para este relatório
                    report_key = f"{report_type}_{frente}"
                    
                    # Nome descritivo para o relatório
                    report_name = f"Relatório {report_type.replace('_', ' ').title()} Frente {frente}"
                    
                    print(f"Processando: {report_name}")
                    
                    # Filtrar e processar os dados conforme o tipo
                    if needs_colhedora and colhedora_data is not None:
                        # Filtrar para a frente específica
                        frente_data = self._filter_colhedora_by_frente(colhedora_data, frente)
                        
                        # Gerar métricas e dados do relatório
                        report_data = await self._generate_colheita_report(frente_data, frente, report_type)
                        
                        # Salvar no Supabase
                        report_id = await self._save_report_to_supabase(
                            report_type, report_date, frente, report_data, is_teste
                        )
                        
                        # Guardar resultado
                        results[report_key] = {
                            "id": report_id,
                            "name": report_name,
                            "status": "success"
                        }
                        
                    elif needs_transbordo and transbordo_data is not None:
                        # Filtrar para a frente específica
                        frente_data = self._filter_transbordo_by_frente(transbordo_data, frente)
                        
                        # Gerar métricas e dados do relatório
                        report_data = await self._generate_transbordo_report(frente_data, frente, report_type)
                        
                        # Salvar no Supabase
                        report_id = await self._save_report_to_supabase(
                            report_type, report_date, frente, report_data, is_teste
                        )
                        
                        # Guardar resultado
                        results[report_key] = {
                            "id": report_id,
                            "name": report_name,
                            "status": "success"
                        }
                    
                    # Atualizar progresso
                    completed_reports += 1
                    if task_id:
                        self.task_status[task_id]["completed_reports"] = completed_reports
                        self.task_status[task_id]["progress"] = int((completed_reports / total_reports) * 100)
                        self.task_status[task_id]["reports"].append({
                            "name": report_name,
                            "status": "success",
                            "type": report_type,
                            "frente": frente
                        })
            
            # Finalizar o status da tarefa
            if task_id:
                self.task_status[task_id]["status"] = "completed"
                self.task_status[task_id]["progress"] = 100
                
            # Guardar os resultados para referência futura
            if task_id:
                self.processing_results[task_id] = results
                
            return results
            
        except Exception as e:
            print(f"Erro no processamento unificado: {str(e)}")
            if task_id:
                self.task_status[task_id] = {
                    "status": "error",
                    "error": str(e)
                }
            raise e
        finally:
            # Limpar o diretório temporário
            if self.temp_dir:
                self.temp_dir.cleanup()
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Retorna o status atual de uma tarefa de processamento.
        """
        return self.task_status.get(task_id, {"status": "not_found"})

    async def _save_upload_file(self, upload_file: UploadFile, destination: Path) -> None:
        """
        Salva um arquivo de upload em um destino específico.
        """
        try:
            # Ler o conteúdo do arquivo
            content = await upload_file.read()
            
            # Escrever no destino
            with open(str(destination), 'wb') as f:
                f.write(content)
                
            print(f"Arquivo salvo em: {destination}")
        except Exception as e:
            print(f"Erro ao salvar arquivo: {str(e)}")
            raise e

    # Funções comuns
    def _calcular_porcentagem(self, numerador, denominador, precisao=4):
        """Calcula porcentagem como decimal (0-1) evitando divisão por zero."""
        if denominador > 0:
            return round((numerador / denominador), precisao)
        return 0.0
    
    # Funções para processamento de colhedoras
    async def _process_colhedora_file(self, caminho_arquivo: str) -> pd.DataFrame:
        """
        Processa o arquivo TXT de colhedoras.
        Adaptado de processamento_unificado.py
        """
        # Lista de codificações para tentar
        codificacoes = ['utf-8', 'latin1', 'ISO-8859-1', 'cp1252']
        
        for codificacao in codificacoes:
            try:
                # Leitura do arquivo
                df = pd.read_csv(caminho_arquivo, sep=';', encoding=codificacao)
                print(f"Arquivo de colhedora lido com sucesso usando {codificacao}! Total de linhas: {len(df)}")
                
                # Verificar se o DataFrame está vazio
                if len(df) == 0:
                    print(f"O arquivo {caminho_arquivo} contém apenas cabeçalhos sem dados.")
                    for col in COLUNAS_DESEJADAS_COLHEDORAS:
                        if col not in df.columns:
                            df[col] = np.nan
                    colunas_existentes = [col for col in COLUNAS_DESEJADAS_COLHEDORAS if col in df.columns]
                    colunas_extras = [col for col in df.columns if col not in COLUNAS_DESEJADAS_COLHEDORAS]
                    return df[colunas_existentes + colunas_extras]
                
                # Limpeza de espaços extras nos nomes das colunas
                df.columns = df.columns.str.strip()
                
                # Verificar se 'Data/Hora' existe e processá-la
                if 'Data/Hora' in df.columns:
                    df[['Data', 'Hora']] = df['Data/Hora'].str.split(' ', expand=True)
                    df = df.drop(columns=['Data/Hora'])
                
                # Conversão e cálculo de diferenças de hora
                df['Hora'] = pd.to_datetime(df['Hora'], format='%H:%M:%S', errors='coerce')
                
                # Calcular a diferença de hora em segundos para maior precisão e depois converter para horas
                if 'Diferença_Hora' not in df.columns or df['Diferença_Hora'].isna().any():
                    df['Diferença_Hora'] = df['Hora'].diff().dt.total_seconds() / 3600
                    df['Diferença_Hora'] = df['Diferença_Hora'].apply(lambda x: 0 if pd.isna(x) or x < 0 else x)
                    df['Diferença_Hora'] = df['Diferença_Hora'].apply(lambda x: 0 if x > 0.50 else round(x, 4))
                else:
                    df['Diferença_Hora'] = pd.to_numeric(df['Diferença_Hora'].astype(str).str.strip(), errors='coerce')
                    df['Diferença_Hora'] = df['Diferença_Hora'].fillna(0)
                    df['Diferença_Hora'] = df['Diferença_Hora'].apply(lambda x: 0 if x > 0.50 else round(x, 4))
                
                # Cálculos adicionais
                RPM_MINIMO = 300
                if 'Parada com Motor Ligado' not in df.columns:
                    df['Parada com Motor Ligado'] = ((df['Velocidade'] == 0) & 
                                                  (df['RPM Motor'] >= RPM_MINIMO)).astype(int)
                
                # Verificar se Horas Produtivas já existe
                if 'Horas Produtivas' not in df.columns or df['Horas Produtivas'].isna().any():
                    df['Horas Produtivas'] = df.apply(
                        lambda row: round(row['Diferença_Hora'], 4) if row['Grupo Operacao'] == 'Produtiva' else 0,
                        axis=1
                    )
                else:
                    df['Horas Produtivas'] = pd.to_numeric(df['Horas Produtivas'].astype(str).str.strip(), errors='coerce')
                    df['Horas Produtivas'] = df['Horas Produtivas'].fillna(0)
                
                # Conversão de colunas binárias para valores numéricos
                for col in ['Esteira Ligada', 'Motor Ligado', 'Field Cruiser', 'RTK (Piloto Automatico)', 'Implemento Ligado']:
                    if col in df.columns:
                        if df[col].dtype == 'object':
                            df[col] = df[col].replace({'LIGADO': 1, 'DESLIGADO': 0})
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
                
                # Limpeza e organização das colunas
                df = df.drop(columns=COLUNAS_REMOVER_COLHEDORAS, errors='ignore')
                
                # Garantir que todas as colunas desejadas existam
                for col in COLUNAS_DESEJADAS_COLHEDORAS:
                    if col not in df.columns:
                        df[col] = np.nan
                
                # Reorganizar as colunas na ordem desejada
                colunas_existentes = [col for col in COLUNAS_DESEJADAS_COLHEDORAS if col in df.columns]
                colunas_extras = [col for col in df.columns if col not in COLUNAS_DESEJADAS_COLHEDORAS]
                df = df[colunas_existentes + colunas_extras]
                
                return df
                
            except UnicodeDecodeError:
                print(f"Tentativa com codificação {codificacao} falhou, tentando próxima codificação...")
                continue
            except Exception as e:
                print(f"Erro ao processar o arquivo com codificação {codificacao}: {str(e)}")
                continue
        
        print(f"Erro: Não foi possível ler o arquivo {caminho_arquivo} com nenhuma das codificações tentadas.")
        return None
    
    # Função para processar transbordos
    async def _process_transbordo_file(self, caminho_arquivo: str) -> pd.DataFrame:
        """
        Processa o arquivo TXT de transbordos.
        Adaptado de processamento_unificado.py
        """
        # Lista de codificações para tentar
        codificacoes = ['utf-8', 'latin1', 'ISO-8859-1', 'cp1252']
        
        for codificacao in codificacoes:
            try:
                # Leitura do arquivo
                df = pd.read_csv(caminho_arquivo, sep=';', encoding=codificacao)
                print(f"Arquivo de transbordo lido com sucesso usando {codificacao}! Total de linhas: {len(df)}")
                
                # Verificar se o DataFrame está vazio
                if len(df) == 0:
                    print(f"O arquivo {caminho_arquivo} contém apenas cabeçalhos sem dados.")
                    for col in COLUNAS_DESEJADAS_TRANSBORDOS:
                        if col not in df.columns:
                            df[col] = np.nan
                    colunas_existentes = [col for col in COLUNAS_DESEJADAS_TRANSBORDOS if col in df.columns]
                    colunas_extras = [col for col in df.columns if col not in COLUNAS_DESEJADAS_TRANSBORDOS]
                    return df[colunas_existentes + colunas_extras]
                
                # Limpeza de espaços extras nos nomes das colunas
                df.columns = df.columns.str.strip()
                
                # Verificar se 'Data/Hora' existe e processá-la
                if 'Data/Hora' in df.columns:
                    df[['Data', 'Hora']] = df['Data/Hora'].str.split(' ', expand=True)
                    df = df.drop(columns=['Data/Hora'])
                
                # Conversão e cálculo de diferenças de hora
                if isinstance(df['Hora'].iloc[0], str):
                    df['Hora'] = pd.to_datetime(df['Hora'], format='%H:%M:%S', errors='coerce')
                
                # Calcular a diferença de hora se ainda não existir
                if 'Diferença_Hora' not in df.columns or df['Diferença_Hora'].isna().any():
                    df['Diferença_Hora'] = df['Hora'].diff().dt.total_seconds() / 3600
                    df['Diferença_Hora'] = df['Diferença_Hora'].apply(lambda x: 0 if pd.isna(x) or x < 0 else x)
                    df['Diferença_Hora'] = df['Diferença_Hora'].apply(lambda x: 0 if x > 0.50 else round(x, 4))
                else:
                    df['Diferença_Hora'] = pd.to_numeric(df['Diferença_Hora'].astype(str).str.strip(), errors='coerce')
                    df['Diferença_Hora'] = df['Diferença_Hora'].fillna(0)
                    df['Diferença_Hora'] = df['Diferença_Hora'].apply(lambda x: 0 if x > 0.50 else round(x, 4))
                
                # Conversão de Motor Ligado para formato numérico
                if 'Motor Ligado' in df.columns:
                    if df['Motor Ligado'].dtype == 'object':
                        df['Motor Ligado'] = df['Motor Ligado'].replace({'LIGADO': 1, 'DESLIGADO': 0})
                    df['Motor Ligado'] = pd.to_numeric(df['Motor Ligado'], errors='coerce').fillna(0).astype(int)
                
                # Cálculos específicos para transbordos
                RPM_MINIMO = 300
                
                # Verificar e calcular "Parado Com Motor Ligado" se necessário
                if 'Parado Com Motor Ligado' not in df.columns:
                    df['Parado Com Motor Ligado'] = ((df['Velocidade'] == 0) & 
                                                  (df['RPM Motor'] >= RPM_MINIMO)).astype(int)
                
                # Verificar se Horas Produtivas já existe
                if 'Horas Produtivas' not in df.columns or df['Horas Produtivas'].isna().any():
                    df['Horas Produtivas'] = df.apply(
                        lambda row: round(row['Diferença_Hora'], 4) if row['Grupo Operacao'] == 'Produtiva' else 0,
                        axis=1
                    )
                else:
                    df['Horas Produtivas'] = pd.to_numeric(df['Horas Produtivas'].astype(str).str.strip(), errors='coerce')
                    df['Horas Produtivas'] = df['Horas Produtivas'].fillna(0)
                
                # Coluna de GPS - Para transbordos
                if 'RTK (Piloto Automatico)' in df.columns:
                    df['GPS'] = df.apply(
                        lambda row: row['Diferença_Hora'] if row.get('RTK (Piloto Automatico)', 0) == 1 
                        and row['Velocidade'] > 0 and row['Grupo Operacao'] == 'Produtiva' else 0,
                        axis=1
                    )
                else:
                    df['GPS'] = 0
                
                # Limpeza e organização das colunas
                df = df.drop(columns=COLUNAS_REMOVER_TRANSBORDOS, errors='ignore')
                
                # Garantir que todas as colunas desejadas existam
                for col in COLUNAS_DESEJADAS_TRANSBORDOS:
                    if col not in df.columns:
                        df[col] = np.nan
                
                # Reorganizar as colunas na ordem desejada
                colunas_existentes = [col for col in COLUNAS_DESEJADAS_TRANSBORDOS if col in df.columns]
                colunas_extras = [col for col in df.columns if col not in COLUNAS_DESEJADAS_TRANSBORDOS]
                df = df[colunas_existentes + colunas_extras]
                
                return df
                
            except UnicodeDecodeError:
                print(f"Tentativa com codificação {codificacao} falhou, tentando próxima codificação...")
                continue
            except Exception as e:
                print(f"Erro ao processar o arquivo com codificação {codificacao}: {str(e)}")
                continue
        
        print(f"Erro: Não foi possível ler o arquivo {caminho_arquivo} com nenhuma das codificações tentadas.")
        return None
        
    def _filter_colhedora_by_frente(self, df: pd.DataFrame, frente: str) -> pd.DataFrame:
        """
        Filtra os dados de colhedora para uma frente específica.
        """
        try:
            # Verificar diferentes formas de representar a frente
            filtro = (
                (df['Grupo Equipamento/Frente'].str.contains(f'Frente {frente}', case=False, na=False)) |
                (df['Grupo Equipamento/Frente'].str.contains(f'Frente{frente}', case=False, na=False)) |
                (df['Grupo Equipamento/Frente'] == frente) |
                (df['Codigo Frente (digitada)'] == frente)
            )
            
            df_filtrado = df[filtro].copy()
            
            if len(df_filtrado) == 0:
                print(f"Aviso: Nenhum dado encontrado para a frente {frente} nos dados de colhedora")
            else:
                print(f"Dados de colhedora filtrados para frente {frente}: {len(df_filtrado)} registros")
                
            return df_filtrado
            
        except Exception as e:
            print(f"Erro ao filtrar dados de colhedora por frente: {str(e)}")
            # Retornar um DataFrame vazio em caso de erro
            return pd.DataFrame(columns=df.columns)
            
    def _filter_transbordo_by_frente(self, df: pd.DataFrame, frente: str) -> pd.DataFrame:
        """
        Filtra os dados de transbordo para uma frente específica.
        """
        try:
            # Verificar diferentes formas de representar a frente
            filtro = (
                (df['Grupo Equipamento/Frente'].str.contains(f'Frente {frente}', case=False, na=False)) |
                (df['Grupo Equipamento/Frente'].str.contains(f'Frente{frente}', case=False, na=False)) |
                (df['Grupo Equipamento/Frente'] == frente) |
                (df['Codigo Frente (digitada)'] == frente)
            )
            
            df_filtrado = df[filtro].copy()
            
            if len(df_filtrado) == 0:
                print(f"Aviso: Nenhum dado encontrado para a frente {frente} nos dados de transbordo")
            else:
                print(f"Dados de transbordo filtrados para frente {frente}: {len(df_filtrado)} registros")
                
            return df_filtrado
            
        except Exception as e:
            print(f"Erro ao filtrar dados de transbordo por frente: {str(e)}")
            # Retornar um DataFrame vazio em caso de erro
            return pd.DataFrame(columns=df.columns)
    
    async def _generate_colheita_report(self, df: pd.DataFrame, frente: str, report_type: str) -> Dict[str, Any]:
        """
        Gera os dados do relatório de colheita para uma frente específica.
        """
        try:
            if len(df) == 0:
                return {
                    "status": "empty",
                    "message": f"Sem dados para gerar relatório de colheita para frente {frente}"
                }
            
            # Calcular a Base Calculo
            base_calculo = self._calcular_base_calculo_colhedora(df)
            
            # Calcular as métricas auxiliares
            disp_mecanica = self._calcular_disponibilidade_mecanica(df)
            eficiencia_energetica = self._calcular_eficiencia_energetica_colhedora(base_calculo)
            hora_elevador = self._calcular_hora_elevador(df, base_calculo)
            motor_ocioso = self._calcular_motor_ocioso_colhedora(base_calculo)
            uso_gps = self._calcular_uso_gps_colhedora(df, base_calculo)
            horas_por_frota = self._calcular_horas_por_frota(df)
            
            # Converter DataFrames para dicionários
            report_data = {
                "base": df.to_dict(orient='records'),
                "base_calculo": base_calculo.to_dict(orient='records'),
                "disponibilidade_mecanica": disp_mecanica.to_dict(orient='records'),
                "eficiencia_energetica": eficiencia_energetica.to_dict(orient='records'),
                "hora_elevador": hora_elevador.to_dict(orient='records'),
                "motor_ocioso": motor_ocioso.to_dict(orient='records'),
                "uso_gps": uso_gps.to_dict(orient='records'),
                "horas_por_frota": horas_por_frota.to_dict(orient='records')
            }
            
            return report_data
            
        except Exception as e:
            print(f"Erro ao gerar relatório de colheita: {str(e)}")
            return {
                "status": "error",
                "message": f"Erro ao gerar relatório de colheita: {str(e)}"
            }
    
    async def _generate_transbordo_report(self, df: pd.DataFrame, frente: str, report_type: str) -> Dict[str, Any]:
        """
        Gera os dados do relatório de transbordo para uma frente específica.
        """
        try:
            if len(df) == 0:
                return {
                    "status": "empty",
                    "message": f"Sem dados para gerar relatório de transbordo para frente {frente}"
                }
            
            # Calcular a Base Calculo
            base_calculo = self._calcular_base_calculo_transbordo(df)
            
            # Calcular as métricas auxiliares
            disp_mecanica = self._calcular_disponibilidade_mecanica(df)
            eficiencia_energetica = self._calcular_eficiencia_energetica_transbordo(base_calculo)
            motor_ocioso = self._calcular_motor_ocioso_transbordo(base_calculo)
            falta_apontamento = self._calcular_falta_apontamento(base_calculo)
            uso_gps = self._calcular_uso_gps_transbordo(base_calculo)
            horas_por_frota = self._calcular_horas_por_frota(df)
            
            # Converter DataFrames para dicionários
            report_data = {
                "base": df.to_dict(orient='records'),
                "base_calculo": base_calculo.to_dict(orient='records'),
                "disponibilidade_mecanica": disp_mecanica.to_dict(orient='records'),
                "eficiencia_energetica": eficiencia_energetica.to_dict(orient='records'),
                "motor_ocioso": motor_ocioso.to_dict(orient='records'),
                "falta_apontamento": falta_apontamento.to_dict(orient='records'),
                "uso_gps": uso_gps.to_dict(orient='records'),
                "horas_por_frota": horas_por_frota.to_dict(orient='records')
            }
            
            return report_data
            
        except Exception as e:
            print(f"Erro ao gerar relatório de transbordo: {str(e)}")
            return {
                "status": "error",
                "message": f"Erro ao gerar relatório de transbordo: {str(e)}"
            }
    
    async def _save_report_to_supabase(
        self, report_type: str, report_date: str, frente: str,
        report_data: Dict[str, Any], is_teste: bool
    ) -> str:
        """
        Salva os dados do relatório no Supabase.
        """
        try:
            # Determinar a tabela correta baseada no tipo de relatório
            table_name = "relatorios_diarios"
            if "semanal" in report_type:
                table_name = "relatorios_semanais"
            
            # Preparar os dados para o Supabase
            supabase_data = {
                "tipo": report_type,
                "data": report_date,
                "frente": frente,
                "dados": report_data,
                "status": "concluido",
                "created_at": datetime.now().isoformat(),
                "is_teste": is_teste
            }
            
            print(f"Salvando relatório {report_type} para frente {frente} no Supabase (tabela: {table_name})")
            
            # Inserir no Supabase
            response = supabase_client.from_(table_name).insert(supabase_data).execute()
            
            # Verificar resposta
            if hasattr(response, 'data') and len(response.data) > 0:
                report_id = response.data[0].get('id')
                print(f"Relatório salvo com sucesso. ID: {report_id}")
                return report_id
            else:
                raise Exception(f"Erro ao salvar relatório no Supabase: {response}")
        
        except Exception as e:
            print(f"Erro ao salvar relatório no Supabase: {str(e)}")
            raise e
    
    def _calcular_disponibilidade_mecanica(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula a disponibilidade mecânica para cada equipamento.
        """
        # Filtramos os dados excluindo os operadores da lista
        df_filtrado = df[~df['Operador'].isin(OPERADORES_EXCLUIR)]
        
        # Agrupar por Equipamento e calcular horas por grupo operacional
        equipamentos = df_filtrado['Equipamento'].unique()
        resultados = []
        
        for equipamento in equipamentos:
            dados_equip = df_filtrado[df_filtrado['Equipamento'] == equipamento]
            total_horas = round(dados_equip['Diferença_Hora'].sum(), 4)
            
            # Calcular horas de manutenção
            manutencao = round(dados_equip[dados_equip['Grupo Operacao'] == 'Manutenção']['Diferença_Hora'].sum(), 4)
            
            # A disponibilidade mecânica é o percentual de tempo fora de manutenção
            disp_mecanica = self._calcular_porcentagem(total_horas - manutencao, total_horas)
            
            resultados.append({
                'Frota': equipamento,
                'Disponibilidade': disp_mecanica
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_horas_por_frota(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula o total de horas registradas para cada frota e a diferença para 24 horas.
        """
        # Agrupar por Equipamento e somar as diferenças de hora
        equipamentos = df['Equipamento'].unique()
        resultados = []
        
        for equipamento in equipamentos:
            dados_equip = df[df['Equipamento'] == equipamento]
            total_horas = round(dados_equip['Diferença_Hora'].sum(), 2)
            
            # Calcular a diferença para 24 horas
            diferenca_24h = round(max(24 - total_horas, 0), 2)
            
            resultados.append({
                'Frota': equipamento,
                'Horas Registradas': total_horas,
                'Diferença para 24h': diferenca_24h
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_base_calculo_colhedora(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula a tabela de Base Calculo para colhedoras.
        """
        # Extrair combinações únicas de Equipamento, Grupo Equipamento/Frente e Operador
        combinacoes = df[['Equipamento', 'Grupo Equipamento/Frente', 'Operador']].drop_duplicates().reset_index(drop=True)
        
        # Filtrar operadores excluídos
        combinacoes = combinacoes[~combinacoes['Operador'].isin(OPERADORES_EXCLUIR)]
        
        # Inicializar as colunas de métricas
        resultados = []
        
        # Calcular as métricas para cada combinação
        for idx, row in combinacoes.iterrows():
            equipamento = row['Equipamento']
            grupo = row['Grupo Equipamento/Frente']
            operador = row['Operador']
            
            # Filtrar dados para esta combinação
            filtro = (df['Equipamento'] == equipamento) & \
                    (df['Grupo Equipamento/Frente'] == grupo) & \
                    (df['Operador'] == operador)
            
            dados_filtrados = df[filtro]
            
            # Horas totais
            horas_totais = round(dados_filtrados['Diferença_Hora'].sum(), 4)
            
            # Horas elevador (Esteira Ligada = 1 E Pressão de Corte > 400)
            horas_elevador = round(dados_filtrados[
                (dados_filtrados['Esteira Ligada'] == 1) & 
                (dados_filtrados['Pressao de Corte'] > 400)
            ]['Diferença_Hora'].sum(), 4)
            
            # Percentual horas elevador
            percent_elevador = self._calcular_porcentagem(horas_elevador, horas_totais)
            
            # RTK (Piloto Automático = 1 e Field Cruiser = 1)
            rtk = round(dados_filtrados[(dados_filtrados['RTK (Piloto Automatico)'] == 1) & 
                                 (dados_filtrados['Field Cruiser'] == 1)]['Diferença_Hora'].sum(), 4)
            
            # Horas Produtivas
            horas_produtivas = round(dados_filtrados['Horas Produtivas'].sum(), 4)
            
            # % Utilização RTK
            utilizacao_rtk = self._calcular_porcentagem(rtk, horas_produtivas)
            
            # Motor Ligado
            motor_ligado = round(dados_filtrados[dados_filtrados['Motor Ligado'] == 1]['Diferença_Hora'].sum(), 4)
            
            # % Eficiência Elevador
            eficiencia_elevador = self._calcular_porcentagem(horas_elevador, motor_ligado)
            
            # Parado com Motor Ligado
            parado_motor_ligado = round(dados_filtrados[dados_filtrados['Parada com Motor Ligado'] == 1]['Diferença_Hora'].sum(), 4)
            
            # % Parado com motor ligado
            percent_parado_motor = self._calcular_porcentagem(parado_motor_ligado, motor_ligado)
            
            resultados.append({
                'Equipamento': equipamento,
                'Grupo Equipamento/Frente': grupo,
                'Operador': operador,
                'Horas totais': horas_totais,
                'Horas elevador': horas_elevador,
                '%': percent_elevador,
                'RTK': rtk,
                'Horas Produtivas': horas_produtivas,
                '% Utilização RTK': utilizacao_rtk,
                'Motor Ligado': motor_ligado,
                '% Eficiência Elevador': eficiencia_elevador,
                'Parado Com Motor Ligado': parado_motor_ligado,
                '% Parado com motor ligado': percent_parado_motor
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_eficiencia_energetica_colhedora(self, base_calculo: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula a eficiência energética por operador para colhedoras.
        """
        # Agrupar por operador
        operadores = base_calculo[['Operador', 'Grupo Equipamento/Frente']].drop_duplicates()
        resultados = []
        
        for _, row in operadores.iterrows():
            operador = row['Operador']
            grupo = row['Grupo Equipamento/Frente']
            
            # Filtrar dados para este operador e grupo
            filtro = (base_calculo['Operador'] == operador) & (base_calculo['Grupo Equipamento/Frente'] == grupo)
            dados_op = base_calculo[filtro]
            
            # Eficiência Energética = horas elevador / motor ligado
            horas_elevador_sum = round(dados_op['Horas elevador'].sum(), 4)
            motor_ligado_sum = round(dados_op['Motor Ligado'].sum(), 4)
            
            # Calcular eficiência
            eficiencia = self._calcular_porcentagem(horas_elevador_sum, motor_ligado_sum)
            
            # Garantir que não ultrapasse 100%
            eficiencia = min(eficiencia, 1.0)
            
            resultados.append({
                'Operador': operador,
                'Eficiência': eficiencia
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_hora_elevador(self, df: pd.DataFrame, base_calculo: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula as horas de elevador por operador.
        """
        # Agrupar por operador
        operadores = base_calculo[['Operador', 'Grupo Equipamento/Frente']].drop_duplicates()
        resultados = []
        
        for _, row in operadores.iterrows():
            operador = row['Operador']
            grupo = row['Grupo Equipamento/Frente']
            
            # Filtrar dados para este operador e grupo
            filtro = (base_calculo['Operador'] == operador) & (base_calculo['Grupo Equipamento/Frente'] == grupo)
            dados_op = base_calculo[filtro]
            
            # Somar horas de elevador da base de cálculo
            horas_elevador_sum = round(dados_op['Horas elevador'].sum(), 2)
            
            resultados.append({
                'Operador': operador,
                'Horas': horas_elevador_sum
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_motor_ocioso_colhedora(self, base_calculo: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula o percentual de motor ocioso por operador para colhedoras.
        """
        # Agrupar por operador
        operadores = base_calculo[['Operador', 'Grupo Equipamento/Frente']].drop_duplicates()
        resultados = []
        
        for _, row in operadores.iterrows():
            operador = row['Operador']
            grupo = row['Grupo Equipamento/Frente']
            
            # Filtrar dados para este operador e grupo
            filtro = (base_calculo['Operador'] == operador) & (base_calculo['Grupo Equipamento/Frente'] == grupo)
            dados_op = base_calculo[filtro]
            
            # Motor Ocioso = Parado Com Motor Ligado / Motor Ligado
            parado_motor_sum = round(dados_op['Parado Com Motor Ligado'].sum(), 4)
            motor_ligado_sum = round(dados_op['Motor Ligado'].sum(), 4)
            
            percentual = self._calcular_porcentagem(parado_motor_sum, motor_ligado_sum)
            
            resultados.append({
                'Operador': operador,
                'Porcentagem': percentual,
                'Tempo_Ligado': motor_ligado_sum,
                'Tempo_Ocioso': parado_motor_sum
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_uso_gps_colhedora(self, df: pd.DataFrame, base_calculo: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula o percentual de uso de GPS por operador para colhedoras.
        """
        # Agrupar por operador
        operadores = base_calculo[['Operador', 'Grupo Equipamento/Frente']].drop_duplicates()
        resultados = []
        
        for _, row in operadores.iterrows():
            operador = row['Operador']
            grupo = row['Grupo Equipamento/Frente']
            
            # Filtrar dados base para este operador e grupo
            filtro_base = (df['Operador'] == operador) & (df['Grupo Equipamento/Frente'] == grupo)
            dados_op_base = df[filtro_base]
            
            # Calcular tempo total trabalhando
            tempo_trabalhando = round(dados_op_base[
                (dados_op_base['Estado'].isin(['TRABALHANDO', 'COLHEITA']))
            ]['Diferença_Hora'].sum(), 4)
            
            # Calcular tempo com GPS ativo
            tempo_gps_ativo = round(dados_op_base[
                (dados_op_base['Estado'].isin(['TRABALHANDO', 'COLHEITA'])) &
                (dados_op_base['RTK (Piloto Automatico)'] == 1) &
                (dados_op_base['Velocidade'] > 0)
            ]['Diferença_Hora'].sum(), 4)
            
            # Calcular percentual
            percentual = self._calcular_porcentagem(tempo_gps_ativo, tempo_trabalhando)
            
            # Garantir que não ultrapasse 100%
            percentual = min(percentual, 1.0)
            
            resultados.append({
                'Operador': operador,
                'Porcentagem': percentual
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_base_calculo_transbordo(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula a tabela de Base Calculo para transbordos.
        """
        # Extrair combinações únicas de Equipamento, Grupo Equipamento/Frente e Operador
        combinacoes = df[['Equipamento', 'Grupo Equipamento/Frente', 'Operador']].drop_duplicates().reset_index(drop=True)
        
        # Filtrar operadores excluídos
        combinacoes = combinacoes[~combinacoes['Operador'].isin(OPERADORES_EXCLUIR)]
        
        # Inicializar as colunas de métricas
        resultados = []
        
        # Calcular as métricas para cada combinação
        for idx, row in combinacoes.iterrows():
            equipamento = row['Equipamento']
            grupo = row['Grupo Equipamento/Frente']
            operador = row['Operador']
            
            # Filtrar dados para esta combinação
            filtro = (df['Equipamento'] == equipamento) & \
                    (df['Grupo Equipamento/Frente'] == grupo) & \
                    (df['Operador'] == operador)
            
            dados_filtrados = df[filtro]
            
            # Horas totais
            horas_totais = round(dados_filtrados['Diferença_Hora'].sum(), 4)
            
            # Horas Produtivas
            horas_produtivas = round(dados_filtrados['Horas Produtivas'].sum(), 4)
            
            # GPS para transbordos
            gps = round(dados_filtrados['GPS'].sum(), 4)
            
            # % Utilização GPS
            utilizacao_gps = self._calcular_porcentagem(gps, horas_produtivas)
            
            # Motor Ligado
            motor_ligado = round(dados_filtrados[dados_filtrados['Motor Ligado'] == 1]['Diferença_Hora'].sum(), 4)
            
            # Parado com Motor Ligado
            parado_motor_ligado = round(dados_filtrados[dados_filtrados['Parado Com Motor Ligado'] == 1]['Diferença_Hora'].sum(), 4)
            
            # % Parado com motor ligado
            percent_parado_motor = self._calcular_porcentagem(parado_motor_ligado, motor_ligado)
            
            # Falta de Apontamento - Contabilizar apenas registros explicitamente marcados
            falta_apontamento = round(dados_filtrados[
                (dados_filtrados['Motor Ligado'] == 1) & 
                (
                    (dados_filtrados['Codigo da Operacao'] == 8340) |
                    (dados_filtrados['Codigo da Operacao'].astype(str).str.startswith('8340')) |
                    (dados_filtrados['Operacao'].astype(str).str.contains('FALTA DE APONTAMENTO', case=False))
                )
            ]['Diferença_Hora'].sum(), 4)
            
            # % Falta de apontamento
            percent_falta_apontamento = self._calcular_porcentagem(falta_apontamento, motor_ligado)
            
            resultados.append({
                'Equipamento': equipamento,
                'Grupo Equipamento/Frente': grupo,
                'Operador': operador,
                'Horas totais': horas_totais,
                'Horas Produtivas': horas_produtivas,
                'GPS': gps,
                '% Utilização GPS': utilizacao_gps,
                'Motor Ligado': motor_ligado,
                'Parado Com Motor Ligado': parado_motor_ligado,
                '% Parado com motor ligado': percent_parado_motor,
                'Falta de Apontamento': falta_apontamento,
                '% Falta de Apontamento': percent_falta_apontamento
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_eficiencia_energetica_transbordo(self, base_calculo: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula a eficiência energética por operador para transbordos.
        """
        # Agrupar por operador
        operadores = base_calculo[['Operador', 'Grupo Equipamento/Frente']].drop_duplicates()
        resultados = []
        
        for _, row in operadores.iterrows():
            operador = row['Operador']
            grupo = row['Grupo Equipamento/Frente']
            
            # Filtrar dados para este operador e grupo
            filtro = (base_calculo['Operador'] == operador) & (base_calculo['Grupo Equipamento/Frente'] == grupo)
            dados_op = base_calculo[filtro]
            
            # Eficiência Energética para transbordos = Horas Produtivas / Horas Totais
            horas_produtivas_sum = round(dados_op['Horas Produtivas'].sum(), 4)
            horas_totais_sum = round(dados_op['Horas totais'].sum(), 4)
            
            # Calcular eficiência
            eficiencia = self._calcular_porcentagem(horas_produtivas_sum, horas_totais_sum)
            
            # Garantir que não ultrapasse 100%
            eficiencia = min(eficiencia, 1.0)
            
            resultados.append({
                'Operador': operador,
                'Eficiência': eficiencia
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_motor_ocioso_transbordo(self, base_calculo: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula o percentual de motor ocioso por operador para transbordos.
        """
        # Agrupar por operador
        operadores = base_calculo[['Operador', 'Grupo Equipamento/Frente']].drop_duplicates()
        resultados = []
        
        for _, row in operadores.iterrows():
            operador = row['Operador']
            grupo = row['Grupo Equipamento/Frente']
            
            # Filtrar dados para este operador e grupo
            filtro = (base_calculo['Operador'] == operador) & (base_calculo['Grupo Equipamento/Frente'] == grupo)
            dados_op = base_calculo[filtro]
            
            # Motor Ocioso = Parado Com Motor Ligado / Motor Ligado
            parado_motor_sum = round(dados_op['Parado Com Motor Ligado'].sum(), 4)
            motor_ligado_sum = round(dados_op['Motor Ligado'].sum(), 4)
            
            percentual = self._calcular_porcentagem(parado_motor_sum, motor_ligado_sum)
            
            resultados.append({
                'Operador': operador,
                'Porcentagem': percentual,
                'Tempo_Ligado': motor_ligado_sum,
                'Tempo_Ocioso': parado_motor_sum
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_falta_apontamento(self, base_calculo: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula o percentual de falta de apontamento por operador.
        """
        # Agrupar por operador
        operadores = base_calculo[['Operador', 'Grupo Equipamento/Frente']].drop_duplicates()
        resultados = []
        
        for _, row in operadores.iterrows():
            operador = row['Operador']
            grupo = row['Grupo Equipamento/Frente']
            
            # Filtrar dados para este operador e grupo
            filtro = (base_calculo['Operador'] == operador) & (base_calculo['Grupo Equipamento/Frente'] == grupo)
            dados_op = base_calculo[filtro]
            
            # Usar os valores já calculados em base_calculo
            falta_apontamento_sum = round(dados_op['Falta de Apontamento'].sum(), 4)
            motor_ligado_sum = round(dados_op['Motor Ligado'].sum(), 4)
            
            # Calcular percentual
            percentual = self._calcular_porcentagem(falta_apontamento_sum, motor_ligado_sum)
            
            resultados.append({
                'Operador': operador,
                'Porcentagem': percentual
            })
        
        return pd.DataFrame(resultados)
    
    def _calcular_uso_gps_transbordo(self, base_calculo: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula o percentual de uso de GPS por operador para transbordos.
        """
        # Agrupar por operador
        operadores = base_calculo[['Operador', 'Grupo Equipamento/Frente']].drop_duplicates()
        resultados = []
        
        for _, row in operadores.iterrows():
            operador = row['Operador']
            grupo = row['Grupo Equipamento/Frente']
            
            # Filtrar dados para este operador e grupo
            filtro = (base_calculo['Operador'] == operador) & (base_calculo['Grupo Equipamento/Frente'] == grupo)
            dados_op = base_calculo[filtro]
            
            # Uso GPS = GPS / Horas Produtivas
            gps_sum = round(dados_op['GPS'].sum(), 4)
            horas_produtivas_sum = round(dados_op['Horas Produtivas'].sum(), 4)
            
            percentual = self._calcular_porcentagem(gps_sum, horas_produtivas_sum)
            
            # Garantir que não ultrapasse 100%
            percentual = min(percentual, 1.0)
            
            resultados.append({
                'Operador': operador,
                'Porcentagem': percentual
            })
        
        return pd.DataFrame(resultados) 