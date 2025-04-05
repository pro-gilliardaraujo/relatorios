import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime, timedelta
from pathlib import Path
from fastapi import UploadFile, HTTPException
from ..core.config import settings
from io import BytesIO
import re

class ExcelProcessor:
    def __init__(self):
        # Lista de colunas esperadas
        # Isso pode precisar ser flexibilizado dependendo do tipo de relatório
        self.required_columns = [
            # Vamos tornar isso opcional ou configurável por tipo de relatório
        ]

    async def validate_file(self, file: UploadFile) -> bool:
        """Valida o arquivo enviado"""
        # Verifica extensão
        ext = file.filename.split('.')[-1].lower()
        print(f"\n==== VALIDANDO ARQUIVO: {file.filename} (extensão: {ext}) ====")
        
        if ext not in settings.ALLOWED_EXTENSIONS:
            print(f"ERRO: Formato de arquivo não suportado. Extensão: {ext}")
            print(f"Extensões permitidas: {settings.ALLOWED_EXTENSIONS}")
            raise HTTPException(
                status_code=400,
                detail=f"Formato de arquivo não suportado. Use: {settings.ALLOWED_EXTENSIONS}"
            )
            
        # Sucesso na validação
        print(f"Arquivo {file.filename} validado com sucesso!")
        return True

    async def process_file(self, file: UploadFile, report_type: str = None) -> Dict[str, Any]:
        """Processa o arquivo Excel/CSV conforme o tipo de relatório"""
        try:
            print(f"\n==== PROCESSANDO ARQUIVO: {file.filename} (Tipo: {report_type}) ====")
            
            # Ler o arquivo de configuração para obter as planilhas esperadas
            config_file = Path("../config/reports.config.json")
            if not config_file.exists():
                config_file = Path("config/reports.config.json")
            if not config_file.exists():
                config_file = Path("../../config/reports.config.json")
            
            import json
            try:
                if config_file.exists():
                    print(f"Carregando configurações de: {config_file}")
                    with open(config_file, 'r', encoding='utf-8') as f:
                        config = json.load(f)
                    
                    if report_type and report_type in config.get('tiposRelatorio', {}):
                        expected_sheets = config['tiposRelatorio'][report_type].get('planilhas_excel', [])
                        print(f"Planilhas esperadas para {report_type}: {expected_sheets}")
                    else:
                        print(f"Tipo de relatório {report_type} não encontrado na configuração ou nenhum tipo especificado")
                        expected_sheets = []
                else:
                    print("Arquivo de configuração não encontrado")
                    expected_sheets = []
            except Exception as config_error:
                print(f"Erro ao carregar configurações: {str(config_error)}")
                expected_sheets = []
            
            # Carregar o arquivo Excel
            try:
                content = await file.read()
                print(f"Conteúdo lido: {len(content)} bytes")
                
                # Usar pandas para ler cada planilha individualmente
                import pandas as pd
                from io import BytesIO
                
                excel_file = BytesIO(content)
                
                # No caso de não termos configuração, lemos todas as planilhas
                if not expected_sheets:
                    print("Sem planilhas configuradas, tentando ler todo o arquivo")
                    try:
                        all_data = pd.read_excel(excel_file)
                        print(f"Leitura simples: {all_data.shape[0]} linhas, {all_data.shape[1]} colunas")
                        # Transformar os dados
                        result = await self._transform_data(all_data)
                        return result
                    except Exception as excel_read_error:
                        print(f"Erro na leitura simples do Excel: {str(excel_read_error)}")
                        raise
                
                # Se temos configuração, processamos cada planilha individualmente
                print("Processando planilhas individualmente:")
                result = {}
                
                # Verificar quais planilhas estão disponíveis
                xl = pd.ExcelFile(excel_file)
                available_sheets = xl.sheet_names
                print(f"Planilhas disponíveis no arquivo: {available_sheets}")
                
                for sheet_name in expected_sheets:
                    # Limpar nome (remover números)
                    sheet_clean = sheet_name
                    for prefix in ["1_", "2_", "3_", "4_", "5_", "6_", "7_", "8_", "9_"]:
                        if sheet_name.startswith(prefix):
                            sheet_clean = sheet_name[len(prefix):]
                            break
                    
                    # Tentar encontrar a planilha
                    found = False
                    for available in available_sheets:
                        if sheet_name == available or sheet_clean == available:
                            found = True
                            try:
                                print(f"Processando planilha: {available}")
                                sheet_data = xl.parse(available)
                                print(f"  - {sheet_data.shape[0]} linhas, {sheet_data.shape[1]} colunas")
                                
                                # Identificar o tipo de dados com base nas colunas
                                sheet_type = self._identify_sheet_type(sheet_data, sheet_clean, report_type, config)
                                print(f"  - Tipo identificado: {sheet_type}")
                                
                                if sheet_type:
                                    # Processar os dados conforme o tipo
                                    processed = self._process_sheet_data(sheet_data, sheet_type, report_type, config)
                                    if processed:
                                        result.update(processed)
                            except Exception as sheet_error:
                                print(f"  - ERRO ao processar planilha {available}: {str(sheet_error)}")
                            break
                    
                    if not found:
                        print(f"AVISO: Planilha {sheet_name} não encontrada no arquivo")
                
                if not result:
                    print("AVISO: Nenhuma planilha processada corretamente!")
                    
                return result
                
            except Exception as excel_error:
                print(f"ERRO AO LER EXCEL: {str(excel_error)}")
                import traceback
                print(traceback.format_exc())
                raise
        
        except Exception as e:
            print(f"ERRO GERAL NO PROCESSAMENTO: {str(e)}")
            import traceback
            print(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))
    
    def _identify_sheet_type(self, df: pd.DataFrame, sheet_name: str, report_type: str, config: Dict) -> str:
        """Identifica o tipo de planilha com base nas colunas e nome"""
        try:
            # Obter as configurações de colunas para o tipo de relatório
            if report_type and report_type in config.get('tiposRelatorio', {}):
                column_config = config['tiposRelatorio'][report_type].get('colunas_excel', {})
            else:
                column_config = {}
            
            # Tentar identificar pelo nome completo da planilha (mais confiável)
            sheet_name_clean = sheet_name.lower().strip()
            name_lower = sheet_name_clean
            
            # Log para depuração do nome da planilha
            print(f"  - Analisando planilha: '{sheet_name}', nome limpo: '{name_lower}'")
            
            # Verificar PRIMEIRO por "Uso GPS" com alta prioridade
            if "uso gps" in name_lower or "5_uso gps" in name_lower:
                print(f"  - Identificado como 'uso_gps' pelo nome da planilha: {sheet_name}")
                return "uso_gps"
            
            # Verificação prioritária para "Falta de Apontamento"
            if "falta de apontamento" in name_lower or "falta apontamento" in name_lower or "4_falta" in name_lower:
                print(f"  - Identificado como 'falta_apontamento' pelo nome da planilha: {sheet_name}")
                return "falta_apontamento"
            
            # Verificar por configuração de colunas
            for sheet_type, cols in column_config.items():
                if len(cols) >= 2:  # Precisa de pelo menos a coluna de ID e valor
                    id_col, value_col = cols[0], cols[1]
                    if id_col in df.columns and value_col in df.columns:
                        return sheet_type
            
            # Identificação por nome parcial (menos confiável, mas útil como fallback)
            if "disponibilidade" in name_lower:
                return "disponibilidade_mecanica"
            elif "eficiência" in name_lower or "eficiencia" in name_lower:
                return "eficiencia_energetica"
            elif "hora elevador" in name_lower:
                return "hora_elevador"
            elif "motor ocioso" in name_lower:
                return "motor_ocioso"
            elif "tdh" in name_lower:
                return "tdh"
            elif "diesel" in name_lower:
                return "diesel"
            elif "impureza" in name_lower:
                return "impureza_vegetal"
            elif "falta" in name_lower and "apontamento" in name_lower:
                return "falta_apontamento"
            
            return None
        
        except Exception as e:
            print(f"Erro ao identificar tipo de planilha: {str(e)}")
            return None
    
    def convert_value(self, row, col, fmt_type="porcentagem"):
        """Converte valores com tratamento especial para porcentagens e textos"""
        # Pegar o valor da coluna
        valor = row[col]
        
        # Verificar se é None ou NaN
        if valor is None or pd.isna(valor):
            return None
        
        # Se o tipo for texto, apenas retorna como string
        if fmt_type == "texto":
            return str(valor).strip()
        
        # Tentar converter para float para tipos numéricos
        try:
            # Remover % e trocar vírgula por ponto se for string
            if isinstance(valor, str):
                valor = valor.replace('%', '').replace(',', '.').strip()
            
            valor_float = float(valor)
            
            # Para valores percentuais, verificar se precisam ser convertidos
            if fmt_type == "porcentagem":
                # Log para depuração
                print(f"DEBUG - Valor percentual original: {valor}, convertido: {valor_float}")
                
                # Regras para identificar se o valor já está em porcentagem:
                # 1. Se o valor for exatamente 1.0, consideramos que é 100%
                # 2. Se o valor estiver entre 0 e 1, consideramos decimal e convertemos para porcentagem
                # 3. Valores > 1 já são considerados percentuais
                
                if valor_float == 1.0:
                    print(f"  - Valor 1.0 detectado, considerando como 100%")
                    valor_float = 100.0
                elif valor_float > 0 and valor_float < 1.0:
                    print(f"  - Convertendo valor decimal para porcentagem: {valor_float} -> {valor_float * 100}")
                    valor_float = valor_float * 100
            
            return valor_float
        except (ValueError, TypeError) as e:
            # Se não conseguir converter, retornar None
            print(f"  - Erro ao converter valor '{valor}': {str(e)}")
            return None

    def _process_sheet_data(self, df: pd.DataFrame, sheet_type: str, report_type: str, config: Dict) -> Dict[str, List]:
        """Processa os dados da planilha conforme seu tipo"""
        result = {}
        
        try:
            # Substituir NaN por None em todo o DataFrame
            df = df.replace({np.nan: None})
            
            # Obter as configurações de colunas para o tipo de relatório
            if report_type and report_type in config.get('tiposRelatorio', {}):
                column_config = config['tiposRelatorio'][report_type].get('colunas_excel', {})
            else:
                column_config = {}
            
            # Obter configuração para este tipo de planilha
            type_config = column_config.get(sheet_type, [])
            
            # Variáveis padrão
            id_col = ""
            value_col = ""
            id_type = "texto"  # Tipo padrão para a coluna ID
            value_type = "porcentagem"  # Tipo padrão para a coluna de valor
            
            # Interpretar a configuração com o novo formato
            if len(type_config) >= 4:
                # Novo formato: ["Coluna1", "Coluna2", "tipo_coluna1", "tipo_coluna2"]
                id_col, value_col = type_config[0], type_config[1]
                id_type, value_type = type_config[2], type_config[3]
                print(f"  - Usando configuração de colunas: {id_col}({id_type}), {value_col}({value_type})")
            elif len(type_config) >= 3:
                # Formato anterior: ["Coluna1", "Coluna2", "tipo_geral"]
                id_col, value_col = type_config[0], type_config[1]
                value_type = type_config[2]
                print(f"  - Usando configuração de colunas: {id_col}, {value_col}({value_type})")
            elif len(type_config) >= 2:
                # Formato básico: ["Coluna1", "Coluna2"]
                id_col, value_col = type_config[0], type_config[1]
                print(f"  - Usando configuração de colunas básica: {id_col}, {value_col}")
            else:
                # Configuração padrão por tipo
                if sheet_type == "disponibilidade_mecanica":
                    id_col, value_col = "Frota", "Disponibilidade"
                    id_type, value_type = "texto", "porcentagem"
                elif sheet_type == "eficiencia_energetica":
                    id_col, value_col = "Operador", "Eficiência"
                    id_type, value_type = "texto", "porcentagem"
                elif sheet_type == "hora_elevador":
                    id_col, value_col = "Operador", "Horas"
                    id_type, value_type = "texto", "horas"
                elif sheet_type == "motor_ocioso":
                    id_col, value_col = "Operador", "Porcentagem"
                    id_type, value_type = "texto", "porcentagem"
                elif sheet_type == "uso_gps":
                    id_col, value_col = "Operador", "Porcentagem"
                    id_type, value_type = "texto", "porcentagem"
                elif sheet_type == "tdh":
                    id_col, value_col = "Frota", "TDH"
                    id_type, value_type = "texto", "decimal"
                elif sheet_type == "diesel":
                    id_col, value_col = "Frota", "Diesel"
                    id_type, value_type = "texto", "decimal"
                elif sheet_type == "impureza_vegetal":
                    id_col, value_col = "Frota", "Impureza"
                    id_type, value_type = "texto", "porcentagem"
                elif sheet_type == "falta_apontamento":
                    id_col, value_col = "Operador", "Porcentagem"
                    id_type, value_type = "texto", "porcentagem"
                else:
                    return {}
                print(f"  - Usando configuração padrão para {sheet_type}: {id_col}({id_type}), {value_col}({value_type})")
            
            # Verificar variações de nomes de colunas
            if id_col not in df.columns:
                for alt in [id_col.lower(), id_col.upper(), id_col.capitalize()]:
                    if alt in df.columns:
                        id_col = alt
                        break
            
            if value_col not in df.columns:
                for alt in [value_col.lower(), value_col.upper(), value_col.capitalize()]:
                    if alt in df.columns:
                        value_col = alt
                        break
            
            # Processar conforme o tipo
            result[sheet_type] = []
            for _, row in df.iterrows():
                try:
                    # Validar ID
                    if not self.is_valid_id(row[id_col]):
                        continue
                    
                    # Extrair o ID, sempre como texto se configurado assim
                    id_value = row[id_col]
                    if id_type == "texto":
                        id_value = str(id_value).strip()
                        
                    # Limpar valor de frota (remover decimal se for um número)
                    if sheet_type == "disponibilidade_mecanica" or sheet_type in ["tdh", "diesel", "impureza_vegetal"]:
                        # Para frota, remover a parte decimal se for um número com ponto
                        if re.match(r'^\d+\.\d+$', id_value):
                            id_value = id_value.split('.')[0]
                    
                    # Processar ID e nome para operadores
                    operator_id = id_value
                    operator_name = id_value
                    
                    # Se for um tipo relacionado a operadores, tentar separar ID do nome
                    if sheet_type in ["eficiencia_energetica", "hora_elevador", "motor_ocioso", "uso_gps", "falta_apontamento"]:
                        # Tentar extrair ID e nome se estiver no formato "ID - Nome"
                        if " - " in id_value:
                            parts = id_value.split(" - ", 1)
                            operator_id = parts[0].strip()
                            operator_name = parts[1].strip() if len(parts) > 1 else parts[0].strip()
                            print(f"  - Separando ID e nome: '{id_value}' -> ID='{operator_id}', Nome='{operator_name}'")
                    
                    # Converter o valor conforme o tipo configurado
                    valor = self.convert_value(row, value_col, value_type)
                    if valor is None:
                        continue
                    
                    # Criar item com base no tipo de planilha
                    if sheet_type == "disponibilidade_mecanica":
                        result[sheet_type].append({
                            'frota': id_value,
                            'disponibilidade': valor
                        })
                    elif sheet_type == "eficiencia_energetica":
                        result[sheet_type].append({
                            'id': operator_id,
                            'nome': operator_name,
                            'eficiencia': valor
                        })
                    elif sheet_type == "hora_elevador":
                        result[sheet_type].append({
                            'id': operator_id,
                            'nome': operator_name,
                            'horas': valor
                        })
                    elif sheet_type == "motor_ocioso":
                        result[sheet_type].append({
                            'id': operator_id,
                            'nome': operator_name,
                            'percentual': valor
                        })
                    elif sheet_type == "uso_gps":
                        result[sheet_type].append({
                            'id': operator_id,
                            'nome': operator_name,
                            'porcentagem': valor
                        })
                    elif sheet_type in ["tdh", "diesel", "impureza_vegetal"]:
                        result[sheet_type].append({
                            'frota': id_value,
                            'valor': valor
                        })
                    elif sheet_type == "falta_apontamento":
                        result[sheet_type].append({
                            'id': operator_id,
                            'nome': operator_name,
                            'percentual': valor
                        })
                except Exception as row_error:
                    print(f"  - Erro ao processar linha: {str(row_error)}")
            
            print(f"  - Processados {len(result.get(sheet_type, []))} registros do tipo {sheet_type}")
            return result
        
        except Exception as e:
            print(f"Erro ao processar dados da planilha: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return {}

    async def _transform_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Transforma os dados brutos em formato estruturado conforme as planilhas"""
        print("\n==== TRANSFORMANDO DADOS EXCEL ====")
        
        # Preparar estrutura básica
        result = {}
        
        try:
            # Substituir NaN por None em todo o DataFrame
            df = df.replace({np.nan: None})
            
            # Função para separar ID e nome de operadores
            def process_operator_id(id_value):
                id_value = str(id_value).strip()
                operator_id = id_value
                operator_name = id_value
                
                # Tentar extrair ID e nome se estiver no formato "ID - Nome"
                if " - " in id_value:
                    parts = id_value.split(" - ", 1)
                    operator_id = parts[0].strip()
                    operator_name = parts[1].strip() if len(parts) > 1 else parts[0].strip()
                    print(f"  - Separando ID e nome: '{id_value}' -> ID='{operator_id}', Nome='{operator_name}'")
                
                return operator_id, operator_name
            
            # Função para limpar valores de frota (remover decimal se for um número)
            def clean_frota_value(frota_value):
                frota_value = str(frota_value).strip()
                if re.match(r'^\d+\.\d+$', frota_value):
                    print(f"  - Limpando valor de frota: '{frota_value}' -> '{frota_value.split('.')[0]}'")
                    return frota_value.split('.')[0]
                return frota_value
            
            # Função para validar o ID (não aceitar "0-0" ou outros valores inválidos)
            def is_valid_id(id_value):
                if id_value is None or pd.isna(id_value):
                    return False
                
                id_str = str(id_value).strip()
                
                # Filtrar explicitamente "TROCA DE TURNO"
                if "TROCA DE TURNO" in id_str:
                    return False
                
                # Se estiver no formato "ID - Nome", extrair apenas o ID
                if " - " in id_str:
                    id_str = id_str.split(" - ")[0].strip()
                
                # Verificar se está vazio ou é inválido
                if not id_str or id_str == "0-0" or id_str == "-" or id_str == "0":
                    return False
                
                # Se for um número com decimal (ex: 7041.0), é válido
                if re.match(r'^\d+\.\d+$', id_str):
                    return True
                
                # Qualquer outro valor não vazio é válido
                return True
            
            # Verificar se temos dados de disponibilidade mecânica
            if 'Frota' in df.columns and ('Disponibilidade' in df.columns or 'disponibilidade' in df.columns):
                print("Processando dados de Disponibilidade Mecânica")
                disp_col = 'Disponibilidade' if 'Disponibilidade' in df.columns else 'disponibilidade'
                
                result['disponibilidade_mecanica'] = []
                for _, row in df.iterrows():
                    # Validar ID
                    if not is_valid_id(row['Frota']):
                        continue
                    
                    # Limpar valor de frota
                    frota_limpa = clean_frota_value(row['Frota'])
                    
                    # Converter o valor usando o método da classe
                    valor = self.convert_value(row, disp_col, "porcentagem")
                    if valor is None:
                        continue
                    
                    result['disponibilidade_mecanica'].append({
                        'frota': frota_limpa,
                        'disponibilidade': valor
                    })
                print(f"Processados {len(result['disponibilidade_mecanica'])} registros de disponibilidade mecânica")
            
            # Verificar se temos dados de eficiência energética
            if 'Operador' in df.columns and ('Eficiência' in df.columns or 'eficiencia' in df.columns):
                print("Processando dados de Eficiência Energética")
                ef_col = 'Eficiência' if 'Eficiência' in df.columns else 'eficiencia'
                
                result['eficiencia_energetica'] = []
                for _, row in df.iterrows():
                    # Validar ID
                    if not is_valid_id(row['Operador']):
                        continue
                    
                    # Separar ID e nome do operador
                    operator_id, operator_name = process_operator_id(row['Operador'])
                    
                    # Converter o valor usando o método da classe
                    valor = self.convert_value(row, ef_col, "porcentagem")
                    if valor is None:
                        continue
                    
                    result['eficiencia_energetica'].append({
                        'id': operator_id,
                        'nome': operator_name,
                        'eficiencia': valor
                    })
                print(f"Processados {len(result['eficiencia_energetica'])} registros de eficiência energética")
            
            # Verificar se temos dados de hora elevador
            if 'Operador' in df.columns and 'Horas' in df.columns:
                print("Processando dados de Hora Elevador")
                result['hora_elevador'] = []
                for _, row in df.iterrows():
                    # Validar ID
                    if not is_valid_id(row['Operador']):
                        continue
                    
                    # Separar ID e nome do operador
                    operator_id, operator_name = process_operator_id(row['Operador'])
                    
                    # Converter o valor usando o método da classe
                    valor = self.convert_value(row, 'Horas', "horas")
                    if valor is None:
                        continue
                    
                    result['hora_elevador'].append({
                        'id': operator_id,
                        'nome': operator_name,
                        'horas': valor
                    })
                print(f"Processados {len(result['hora_elevador'])} registros de hora elevador")
                
            # Verificar se temos dados de motor ocioso
            if 'Operador' in df.columns and 'Porcentagem' in df.columns:
                print("Processando dados de Motor Ocioso")
                result['motor_ocioso'] = []
                for _, row in df.iterrows():
                    # Validar ID
                    if not is_valid_id(row['Operador']):
                        continue
                    
                    # Separar ID e nome do operador
                    operator_id, operator_name = process_operator_id(row['Operador'])
                    
                    # Converter o valor usando o método da classe
                    valor = self.convert_value(row, 'Porcentagem', "porcentagem")
                    if valor is None:
                        continue
                    
                    result['motor_ocioso'].append({
                        'id': operator_id,
                        'nome': operator_name,
                        'percentual': valor
                    })
                print(f"Processados {len(result['motor_ocioso'])} registros de motor ocioso")
                
            # Verificar se temos dados de uso GPS
            if 'Operador' in df.columns and ('Porcentagem' in df.columns or 'porcentagem' in df.columns):
                print("Processando dados de Uso GPS")
                porc_col = 'Porcentagem' if 'Porcentagem' in df.columns else 'porcentagem'
                
                result['uso_gps'] = []
                for _, row in df.iterrows():
                    # Validar ID
                    if not is_valid_id(row['Operador']):
                        continue
                    
                    # Separar ID e nome do operador
                    operator_id, operator_name = process_operator_id(row['Operador'])
                    
                    # Converter o valor usando o método da classe
                    valor = self.convert_value(row, porc_col, "porcentagem")
                    if valor is None:
                        continue
                    
                    result['uso_gps'].append({
                        'id': operator_id,
                        'nome': operator_name,
                        'porcentagem': valor
                    })
                print(f"Processados {len(result['uso_gps'])} registros de uso GPS")
            
            # Verificar se temos dados de TDH (para relatórios semanais)
            if 'Frota' in df.columns and 'TDH' in df.columns:
                print("Processando dados de TDH")
                result['tdh'] = []
                for _, row in df.iterrows():
                    # Validar ID
                    if not is_valid_id(row['Frota']):
                        continue
                    
                    # Limpar valor de frota
                    frota_limpa = clean_frota_value(row['Frota'])
                    
                    # Converter o valor usando o método da classe
                    valor = self.convert_value(row, 'TDH', "decimal")
                    if valor is None:
                        continue
                    
                    result['tdh'].append({
                        'frota': frota_limpa,
                        'valor': valor
                    })
                print(f"Processados {len(result['tdh'])} registros de TDH")
                
            # Verificar se temos dados de consumo diesel (para relatórios semanais)
            if 'Frota' in df.columns and 'Diesel' in df.columns:
                print("Processando dados de Consumo de Diesel")
                result['diesel'] = []
                for _, row in df.iterrows():
                    # Validar ID
                    if not is_valid_id(row['Frota']):
                        continue
                    
                    # Limpar valor de frota
                    frota_limpa = clean_frota_value(row['Frota'])
                    
                    # Converter o valor usando o método da classe
                    valor = self.convert_value(row, 'Diesel', "decimal")
                    if valor is None:
                        continue
                    
                    result['diesel'].append({
                        'frota': frota_limpa,
                        'valor': valor
                    })
                print(f"Processados {len(result['diesel'])} registros de consumo de diesel")
                
            # Verificar se temos dados de impureza vegetal (para relatórios semanais)
            if 'Frota' in df.columns and 'Impureza' in df.columns:
                print("Processando dados de Impureza Vegetal")
                result['impureza_vegetal'] = []
                for _, row in df.iterrows():
                    # Validar ID
                    if not is_valid_id(row['Frota']):
                        continue
                    
                    # Limpar valor de frota
                    frota_limpa = clean_frota_value(row['Frota'])
                    
                    # Converter o valor usando o método da classe
                    valor = self.convert_value(row, 'Impureza', "porcentagem")
                    if valor is None:
                        continue
                    
                    result['impureza_vegetal'].append({
                        'frota': frota_limpa,
                        'valor': valor
                    })
                print(f"Processados {len(result['impureza_vegetal'])} registros de impureza vegetal")
                
            print("Transformação de dados concluída com sucesso!")
            print(f"Seções processadas: {list(result.keys())}")
            return result
            
        except Exception as e:
            print(f"ERRO NA TRANSFORMAÇÃO DE DADOS: {str(e)}")
            import traceback
            print(traceback.format_exc())
            raise

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

    def is_valid_id(self, id_value):
        """
        Verifica se o ID é válido (não está vazio e não é um valor inválido como '0-0')
        Também trata IDs no formato 'ID - Nome' extraindo apenas o ID para validação
        """
        if id_value is None or pd.isna(id_value):
            return False
        
        id_str = str(id_value).strip()
        
        # Filtrar explicitamente "TROCA DE TURNO"
        if "TROCA DE TURNO" in id_str:
            return False
        
        # Se estiver no formato "ID - Nome", extrair apenas o ID
        if " - " in id_str:
            id_str = id_str.split(" - ")[0].strip()
        
        # Verificar se está vazio ou é inválido
        if not id_str or id_str == "0-0" or id_str == "-" or id_str == "0":
            return False
        
        # Se for um número com decimal (ex: 7041.0), é válido
        if re.match(r'^\d+\.\d+$', id_str):
            return True
        
        # Qualquer outro valor não vazio é válido
        return True 