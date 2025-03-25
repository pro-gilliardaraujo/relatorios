from pathlib import Path
from typing import Dict, List

# Diretórios
BASE_DIR = Path(__file__).parent.parent.parent
TEMP_DIR = BASE_DIR / "temp_data"
DATA_DIR = BASE_DIR / "data"

# Configurações de processamento
ESTADOS_OPERACIONAIS: Dict[str, List[str]] = {
    "PRODUTIVO": ["TRABALHANDO"],
    "MANUTENCAO": ["MANUTENCAO MECANICA", "MANUTENCAO ELETRICA"],
    "PARADA": ["PARADA"],
    "DESLOCAMENTO": ["DESLOC P/ DESC", "MANOBRA"]
}

# Configurações de validação
COLUNAS_OBRIGATORIAS = [
    'Equipamento',
    'Data/Hora',
    'Estado',
    'RPM Motor',
    'Velocidade',
    'Motor Ligado',
    'RTK'
]

# Configurações de gráficos
CORES_ESTADOS = {
    "PRODUTIVO": "#2ecc71",
    "MANUTENCAO": "#e74c3c",
    "PARADA": "#f1c40f",
    "DESLOCAMENTO": "#3498db"
}

# Configurações de interface
LAYOUT_CONFIG = {
    "MAIN_COLUMN_RATIO": [2, 1],  # Proporção entre coluna principal e lateral
    "MAX_IMAGE_HEIGHT": 300,  # Altura máxima para imagens em pixels
    "GRAPH_HEIGHT": 400  # Altura dos gráficos em pixels
}

# Configurações de processamento
PROCESSING_CONFIG = {
    "MIN_REGISTROS_VALIDOS": 100,  # Número mínimo de registros para processamento
    "INTERVALO_AMOSTRAGEM": 60,  # Intervalo em segundos entre registros
    "TEMPO_MINIMO_ESTADO": 300,  # Tempo mínimo em segundos para considerar mudança de estado
    "TEMPO_MAXIMO_ENTRE_REGISTROS": 25,  # Tempo máximo em minutos entre registros (para filtrar arrastos)
    "REMOVER_REGISTROS_INVALIDOS": True  # Se deve remover registros com tempo maior que o máximo
}

# Mensagens de erro
ERROR_MESSAGES = {
    "ARQUIVO_INVALIDO": "Formato de arquivo inválido. Por favor, use Excel (.xlsx) ou CSV.",
    "DADOS_INSUFICIENTES": "Número insuficiente de registros para processamento.",
    "COLUNAS_AUSENTES": "Colunas obrigatórias ausentes no arquivo:",
    "ERRO_PROCESSAMENTO": "Erro ao processar os dados:",
    "ERRO_VALIDACAO": "Erro na validação dos dados:"
}

# Configurações de cache
CACHE_CONFIG = {
    "TEMPO_EXPIRACAO": 3600,  # Tempo em segundos
    "MAX_ITEMS": 100
}

# Configurações específicas para cada tipo de relatório
PLANTADEIRAS_CONFIG = {
    "COLUNAS_NECESSARIAS": [
        'Equipamento',
        'Data/Hora',
        'Estado',
        'Estado Operacional',
        'Grupo Operacao',
        'Operacao',
        'Velocidade',
        'Motor Ligado',
        'RTK'
    ],
    "COLUNAS_IGNORADAS": [
        'Codigo Frente (Digitada)',
        'Descricao Equipamento',
        'Esteira Ligada',
        'Grupo',
        'Horimetro',
        'Implemento Ligado',
        'Latitude',
        'Longitude',
        'Operador',
        'Pressao de Corte',
        'RPM Extrator',
        'RPM Motor',
        'Tipo de Equipamento',
        'Trabalhando Frente Dividida',
        'Trabalhando em Fila'
    ]
}

# Criar diretórios necessários
TEMP_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True) 