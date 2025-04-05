import pandas as pd
from openpyxl import load_workbook

caminho_txt = r"C:\Users\IB\Desktop\Gilliard\Arquivos Relatórios\1_TRATAMENTOS\ttFrente03-0404.txt"
caminho_excel = r"C:\Users\IB\Desktop\Gilliard\Arquivos Relatórios\1_TRATAMENTOS\ttFrente03-0404.xlsx"

try:
    df = pd.read_csv(caminho_txt, sep=';', encoding='utf-8')
    print("Arquivo lido com sucesso!")
except Exception as e:
    print(f"Ocorreu um erro ao ler o arquivo: {e}")
    exit()

print(f"Colunas do DataFrame: {df.columns}")

df[['Data', 'Hora']] = df['Data/Hora'].str.split(' ', expand=True)
df = df.drop(columns=['Data/Hora'])

for col in ['Motor Ligado']:
    if col in df.columns:
        df[col] = df[col].replace({1: 'LIGADO', 0: 'DESLIGADO'})
df['Diferença_Hora'] = pd.to_datetime(df['Hora'], format='%H:%M:%S').diff()
df['Diferença_Hora'] = pd.to_timedelta(df['Diferença_Hora'], errors='coerce')
df['Diferença_Hora'] = df['Diferença_Hora'].dt.total_seconds() / 3600  # Conversor para horas.
df['Diferença_Hora'] = df['Diferença_Hora'].apply(lambda x: x if x >= 0 else 0)
df['Parada com Motor Ligado'] = (df['Velocidade'] == 0) & (df['Motor Ligado'] == 'LIGADO')
df['Horas Produtivas'] = df.apply(lambda row: row['Diferença_Hora'] if row['Grupo Operacao'] == 'Produtiva' else 0, axis=1)
#Remover as colunas que não vai usar. 
colunas_remover = ['Corporativo', 'Estado', 'Latitude', 'Longitude', 'Regional', 'Tipo de Equipamento', 'Trabalhando em Fila', 'Trabalhando Frente Dividida', 'Centro de Custo', 'Quantidade de Caixotes',
                   'Fazenda', 'Zona', 'Talhao']
df = df.drop(columns=colunas_remover, errors='ignore')

try:
    df.to_excel(caminho_excel, index=False, engine='openpyxl')

    print(f"Arquivo salvo com sucesso em {caminho_excel}")
except Exception as e:
    print(f"Ocorreu um erro ao salvar o arquivo: {e}")

