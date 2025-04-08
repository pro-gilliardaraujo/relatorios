from typing import Dict, Any, List, Optional
from datetime import datetime, date
from pathlib import Path
import json
from .excel_processor import ExcelProcessor

class ReportProcessor:
    def __init__(self):
        self.excel_processor = ExcelProcessor()
        self._load_config()
        
    def _load_config(self):
        """Carrega o arquivo de configuração"""
        try:
            # Tentar diferentes localizações do arquivo de configuração
            config_paths = [
                Path("../config/reports.config.json"),
                Path("config/reports.config.json"),
                Path("../../config/reports.config.json")
            ]
            
            for config_file in config_paths:
                if config_file.exists():
                    print(f"Carregando configurações de: {config_file}")
                    with open(config_file, 'r', encoding='utf-8') as f:
                        self.config = json.load(f)
                    return
            
            print("ERRO: Arquivo de configuração não encontrado!")
            self.config = {}
        except Exception as e:
            print(f"ERRO ao carregar configurações: {str(e)}")
            self.config = {}
    
    def _get_metas(self, report_type: str) -> Dict[str, Any]:
        """Obtém as metas para o tipo de relatório especificado"""
        try:
            if not self.config:
                self._load_config()
            
            if report_type in self.config.get('tiposRelatorio', {}):
                metas = self.config['tiposRelatorio'][report_type].get('metas', {})
                print(f"Metas carregadas para {report_type}: {metas}")
                
                # Garantir que todas as metas necessárias estão presentes
                default_metas = {
                    'disponibilidadeMecanica': 90,
                    'eficienciaEnergetica': 70,
                    'motorOcioso': 4,
                    'horaElevador': 5,
                    'usoGPS': 90,
                    'tdh': 0.0124,
                    'diesel': 0.718,
                    'impureza_vegetal': 64
                }
                
                # Usar valores do config ou fallback para os defaults
                for key, default_value in default_metas.items():
                    if key not in metas:
                        print(f"Meta {key} não encontrada na configuração, usando valor padrão: {default_value}")
                        metas[key] = default_value
                    else:
                        print(f"Meta {key}: {metas[key]} (da configuração)")
                
                return metas
            else:
                print(f"Tipo de relatório {report_type} não encontrado na configuração")
                return {}
        except Exception as e:
            print(f"ERRO ao obter metas: {str(e)}")
            return {}
        
    async def generate_report(
        self,
        processed_data: Dict[str, Any],
        report_type: str,
        report_date: date,
        frente: str,
        equipment_ids: Optional[List[str]] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Gera relatório final com base nos dados processados
        Suporta relatórios diários (report_date) e semanais (start_date, end_date)
        """
        print(f"\n==== GERANDO RELATÓRIO TIPO: {report_type}, DATA: {report_date}, FRENTE: {frente} ====")
        
        # Log para relatórios semanais
        is_weekly = 'semanal' in report_type and start_date and end_date
        if is_weekly:
            print(f"Relatório Semanal - Período: {start_date} a {end_date}")
        
        # Filtrar por equipamentos se especificado
        if equipment_ids:
            print(f"Filtrando por equipamentos: {equipment_ids}")
            processed_data = self._filter_by_equipment(processed_data, equipment_ids)
        
        # Obter as metas do relatório
        metas = self._get_metas(report_type)
        print(f"Metas para inclusão no relatório: {metas}")
        
        # Criar o relatório com metadados e metas
        metadata = {
            'type': report_type,
            'date': report_date.isoformat() if isinstance(report_date, date) else report_date,
            'frente': frente,
            'generated_at': datetime.now().isoformat(),
            'equipment_ids': equipment_ids
        }
        
        # Adicionar metadados para relatórios semanais
        if is_weekly:
            metadata['is_weekly'] = True
            metadata['start_date'] = start_date.isoformat() if isinstance(start_date, date) else start_date
            metadata['end_date'] = end_date.isoformat() if isinstance(end_date, date) else end_date
        
        report = {
            'metadata': metadata,
            'metas': metas  # Incluir as metas no relatório
        }
        
        # Anexar os dados processados
        if isinstance(processed_data, dict):
            print(f"Seções de dados disponíveis: {list(processed_data.keys())}")
            
            # Processamento especial para relatório de transbordo semanal
            if report_type == 'transbordo_semanal':
                print("Processamento especial para relatório de transbordo semanal")
                report = self._process_transbordo_semanal_report(report, processed_data, metas)
            else:
                # Converter valores decimais para porcentagem onde apropriado
                for key, value in processed_data.items():
                    if isinstance(value, list):
                        for item in value:
                            if isinstance(item, dict):
                                if 'porcentagem' in item and item['porcentagem'] < 1:
                                    print(f"Convertendo porcentagem de {item['porcentagem']} para {item['porcentagem'] * 100}")
                                    item['porcentagem'] *= 100
                                if 'percentual' in item and item['percentual'] < 1:
                                    print(f"Convertendo percentual de {item['percentual']} para {item['percentual'] * 100}")
                                    item['percentual'] *= 100
                                if 'disponibilidade' in item and item['disponibilidade'] < 1:
                                    print(f"Convertendo disponibilidade de {item['disponibilidade']} para {item['disponibilidade'] * 100}")
                                    item['disponibilidade'] *= 100
                                if 'eficiencia' in item and item['eficiencia'] < 1:
                                    print(f"Convertendo eficiencia de {item['eficiencia']} para {item['eficiencia'] * 100}")
                                    item['eficiencia'] *= 100
                
                # Para outros relatórios, apenas atualize os dados
                report.update(processed_data)
        else:
            print(f"AVISO: processed_data não é um dicionário: {type(processed_data)}")
            report['data'] = processed_data
        
        print("Relatório gerado com sucesso!")
        print(f"Metas incluídas: {metas}")
        return report
        
    def _process_transbordo_semanal_report(self, report: Dict[str, Any], data: Dict[str, Any], metas: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processamento especial para relatório de transbordo semanal
        Este método garante que todos os campos necessários estejam presentes no relatório
        Nota: Processamento adaptado para ser igual ao transbordo diário, sem TDH e Diesel
        """
        print("Processando relatório de transbordo semanal (mesmo padrão do transbordo diário)")
        print(f"Dados recebidos: {list(data.keys())}")
        
        # Conjuntos de dados necessários para o relatório
        required_data_sets = [
            'disponibilidade_mecanica',
            'eficiencia_energetica',
            'motor_ocioso',
            'falta_apontamento',
            'uso_gps'
        ]
        
        # Para cada conjunto de dados, verificar existência e adicionar ao relatório
        for data_set in required_data_sets:
            if data_set in data and isinstance(data[data_set], list):
                # Converter porcentagens e valores decimais conforme necessário
                for item in data[data_set]:
                    if isinstance(item, dict):
                        # Conversões específicas para cada tipo de dados
                        if data_set == 'disponibilidade_mecanica' and 'disponibilidade' in item and item['disponibilidade'] < 1:
                            item['disponibilidade'] *= 100
                            print(f"Convertendo disponibilidade para porcentagem: {item['disponibilidade']}")
                        
                        elif data_set == 'eficiencia_energetica' and 'eficiencia' in item and item['eficiencia'] < 1:
                            item['eficiencia'] *= 100
                            print(f"Convertendo eficiencia para porcentagem: {item['eficiencia']}")
                        
                        elif data_set == 'motor_ocioso' and 'percentual' in item and item['percentual'] < 1:
                            item['percentual'] *= 100
                            print(f"Convertendo percentual de motor ocioso para porcentagem: {item['percentual']}")
                        
                        elif data_set == 'falta_apontamento' and 'percentual' in item and item['percentual'] < 1:
                            item['percentual'] *= 100
                            print(f"Convertendo percentual de falta de apontamento para porcentagem: {item['percentual']}")
                        
                        elif data_set == 'uso_gps' and 'porcentagem' in item and item['porcentagem'] < 1:
                            item['porcentagem'] *= 100
                            print(f"Convertendo porcentagem de uso GPS para porcentagem: {item['porcentagem']}")
                
                # Adicionar o conjunto de dados ao relatório
                report[data_set] = data[data_set]
                print(f"Adicionado conjunto de dados {data_set} com {len(data[data_set])} itens")
            else:
                # Se o conjunto de dados não existe, adicionar uma lista vazia
                print(f"Conjunto de dados {data_set} não encontrado, adicionando lista vazia")
                report[data_set] = []
        
        print(f"Relatório de transbordo semanal processado com sucesso: {list(report.keys())}")
        return report
    
    def _filter_by_equipment(self, data: Dict[str, Any], equipment_ids: List[str]) -> Dict[str, Any]:
        """
        Filtra dados por equipamentos específicos
        """
        filtered_data = {}
        
        # Filtrar métricas operacionais
        if 'operational_metrics' in data:
            filtered_data['operational_metrics'] = {
                k: v for k, v in data['operational_metrics'].items()
                if isinstance(v, dict) and any(eq in v for eq in equipment_ids)
            }
        
        # Filtrar indicadores de performance
        if 'performance_indicators' in data:
            filtered_data['performance_indicators'] = {
                k: {
                    eq: v[eq] for eq in equipment_ids if eq in v
                }
                for k, v in data['performance_indicators'].items()
            }
        
        # Filtrar análise de tempo
        if 'time_analysis' in data:
            filtered_data['time_analysis'] = {
                k: {
                    eq: v[eq] for eq in equipment_ids if eq in v
                }
                for k, v in data['time_analysis'].items()
                if isinstance(v, dict)
            }
        
        # Filtrar dados geográficos
        if 'geographic_data' in data:
            filtered_data['geographic_data'] = {
                'type': 'FeatureCollection',
                'features': [
                    f for f in data['geographic_data']['features']
                    if f['properties']['equipamento'] in equipment_ids
                ],
                'area_stats': {
                    k: v for k, v in data['geographic_data']['area_stats'].items()
                    if k[0] in equipment_ids
                }
            }
        
        return filtered_data
    
    async def _process_plantio_report(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa relatório específico de plantio
        """
        return {
            'plantio_metrics': {
                'area_total': self._calculate_area_total(data),
                'velocidade_media': self._calculate_velocidade_media(data),
                'tempo_efetivo': self._calculate_tempo_efetivo(data),
                'consumo_medio': self._calculate_consumo_medio(data)
            }
        }
    
    async def _process_colheita_report(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa relatório específico de colheita
        """
        return {
            'colheita_metrics': {
                'produtividade': self._calculate_produtividade(data),
                'perdas': self._calculate_perdas(data),
                'qualidade': self._calculate_qualidade(data)
            }
        }
    
    async def _process_cav_report(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa relatório específico de CAV
        """
        return {
            'cav_metrics': {
                'cobertura': self._calculate_cobertura(data),
                'aplicacao': self._calculate_aplicacao(data),
                'volume': self._calculate_volume(data)
            }
        }
    
    def _calculate_area_total(self, data: Dict[str, Any]) -> float:
        """Calcula área total trabalhada"""
        # Implementar cálculo específico
        return 0.0
    
    def _calculate_velocidade_media(self, data: Dict[str, Any]) -> float:
        """Calcula velocidade média"""
        if 'operational_metrics' in data:
            speeds = data['operational_metrics'].get('speed_by_operation', {})
            if speeds:
                return sum(s['media'] for s in speeds.values()) / len(speeds)
        return 0.0
    
    def _calculate_tempo_efetivo(self, data: Dict[str, Any]) -> float:
        """Calcula tempo efetivo de operação"""
        if 'time_analysis' in data:
            times = data['time_analysis'].get('group_distribution', {})
            if times:
                return sum(t for t in times.values())
        return 0.0
    
    def _calculate_consumo_medio(self, data: Dict[str, Any]) -> float:
        """Calcula consumo médio"""
        # Implementar cálculo específico
        return 0.0
    
    def _calculate_produtividade(self, data: Dict[str, Any]) -> float:
        """Calcula produtividade"""
        # Implementar cálculo específico
        return 0.0
    
    def _calculate_perdas(self, data: Dict[str, Any]) -> float:
        """Calcula perdas"""
        # Implementar cálculo específico
        return 0.0
    
    def _calculate_qualidade(self, data: Dict[str, Any]) -> float:
        """Calcula indicadores de qualidade"""
        # Implementar cálculo específico
        return 0.0
    
    def _calculate_cobertura(self, data: Dict[str, Any]) -> float:
        """Calcula cobertura"""
        # Implementar cálculo específico
        return 0.0
    
    def _calculate_aplicacao(self, data: Dict[str, Any]) -> float:
        """Calcula taxa de aplicação"""
        # Implementar cálculo específico
        return 0.0
    
    def _calculate_volume(self, data: Dict[str, Any]) -> float:
        """Calcula volume aplicado"""
        # Implementar cálculo específico
        return 0.0 