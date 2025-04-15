#!/usr/bin/env python3
"""
Conversor de CSV para JSON para relatórios de colheita e transbordo
Este script lê arquivos CSV das pastas específicas e gera um arquivo JSON no formato necessário
"""

import csv
import json
import os
from datetime import datetime

# Diretório base onde estão os arquivos CSV
CSV_BASE_DIR = 'exemplos_csv'

# Estrutura básica do JSON
base_json = {
    "informacoes_gerais": {
        "data_inicio": "",
        "data_fim": "",
        "tipo_relatorio": "",
        "frente": "",
        "fazenda": ""
    },
    "colheita": {
        "disponibilidade_mecanica": [],
        "eficiencia_energetica": [],
        "hora_elevador": [],
        "motor_ocioso": [],
        "uso_gps": [],
        "media_velocidade": []
    },
    "transbordo": {
        "disponibilidade_mecanica": [],
        "eficiencia_energetica": [],
        "motor_ocioso": [],
        "falta_apontamento": [],
        "uso_gps": [],
        "media_velocidade": []
    }
}

def csv_para_lista(arquivo_csv):
    """Converte um arquivo CSV para uma lista de dicionários"""
    resultado = []
    
    if not os.path.exists(arquivo_csv):
        print(f"Arquivo não encontrado: {arquivo_csv}")
        return resultado
    
    with open(arquivo_csv, 'r', encoding='utf-8') as arquivo:
        leitor = csv.DictReader(arquivo)
        for linha in leitor:
            # Converte valores numéricos
            for chave, valor in linha.items():
                if chave in ['disponibilidade', 'eficiencia', 'percentual', 'porcentagem', 'horas', 'velocidade']:
                    try:
                        linha[chave] = float(valor)
                    except (ValueError, TypeError):
                        linha[chave] = 0.0
            resultado.append(linha)
    
    return resultado

def main():
    # Solicita informações gerais
    print("=== GERADOR DE RELATÓRIO EM JSON ===")
    print("\nPreencha as informações gerais:")
    
    tipo_relatorio = input("Tipo de relatório (colheita_semanal ou transbordo_semanal): ").strip()
    if tipo_relatorio not in ["colheita_semanal", "transbordo_semanal"]:
        print("Tipo de relatório inválido. Usando 'transbordo_semanal' como padrão.")
        tipo_relatorio = "transbordo_semanal"
    
    tipo_principal = "colheita" if tipo_relatorio == "colheita_semanal" else "transbordo"
    
    data_inicio = input("Data de início (AAAA-MM-DD): ").strip()
    try:
        # Valida o formato da data
        datetime.strptime(data_inicio, '%Y-%m-%d')
    except ValueError:
        print("Formato de data inválido. Usando a data atual.")
        data_inicio = datetime.now().strftime('%Y-%m-%d')
    
    data_fim = input("Data de fim (AAAA-MM-DD): ").strip()
    try:
        datetime.strptime(data_fim, '%Y-%m-%d')
    except ValueError:
        print("Formato de data inválido. Usando a data atual.")
        data_fim = datetime.now().strftime('%Y-%m-%d')
    
    frente = input("Frente: ").strip() or "Frente 01"
    fazenda = input("Fazenda: ").strip() or "Fazenda São José"
    
    # Atualiza o JSON com as informações gerais
    base_json["informacoes_gerais"]["data_inicio"] = data_inicio
    base_json["informacoes_gerais"]["data_fim"] = data_fim
    base_json["informacoes_gerais"]["tipo_relatorio"] = tipo_relatorio
    base_json["informacoes_gerais"]["frente"] = frente
    base_json["informacoes_gerais"]["fazenda"] = fazenda
    
    print(f"\nProcessando arquivos CSV para {tipo_principal}...")
    
    # Define o diretório específico baseado no tipo
    csv_dir = os.path.join(CSV_BASE_DIR, tipo_principal)
    
    # Processa os arquivos CSV
    base_json[tipo_principal]["disponibilidade_mecanica"] = csv_para_lista(f'{csv_dir}/disponibilidade_mecanica.csv')
    base_json[tipo_principal]["eficiencia_energetica"] = csv_para_lista(f'{csv_dir}/eficiencia_energetica.csv')
    base_json[tipo_principal]["motor_ocioso"] = csv_para_lista(f'{csv_dir}/motor_ocioso.csv')
    base_json[tipo_principal]["uso_gps"] = csv_para_lista(f'{csv_dir}/uso_gps.csv')
    base_json[tipo_principal]["media_velocidade"] = csv_para_lista(f'{csv_dir}/media_velocidade.csv')
    
    # Processa arquivos específicos do tipo de relatório
    if tipo_principal == "colheita":
        base_json[tipo_principal]["hora_elevador"] = csv_para_lista(f'{csv_dir}/hora_elevador.csv')
    else:
        base_json[tipo_principal]["falta_apontamento"] = csv_para_lista(f'{csv_dir}/falta_apontamento.csv')
    
    # Salva o arquivo JSON
    nome_arquivo = f'dados_relatorio_{tipo_relatorio}.json'
    with open(nome_arquivo, 'w', encoding='utf-8') as arquivo:
        json.dump(base_json, arquivo, indent=2, ensure_ascii=False)
    
    print(f"\nArquivo gerado com sucesso: {nome_arquivo}")
    print("Use este arquivo para carregar seus dados no relatório.")

if __name__ == "__main__":
    main() 