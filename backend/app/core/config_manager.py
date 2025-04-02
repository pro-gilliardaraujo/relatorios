import json
from pathlib import Path
from typing import Dict, List, Optional, TypedDict, Union

class Frente(TypedDict):
    id: str
    nome: str

class Meta(TypedDict):
    pass  # Permite qualquer chave numérica

class Componentes(TypedDict):
    mostrarImageUpload: bool
    mostrarExcelUpload: bool
    mostrarMapas: bool

class TipoRelatorio(TypedDict):
    nome: str
    frentes: List[Frente]
    metas: Meta
    componentes: Componentes

class Fonte(TypedDict):
    id: str
    nome: str

class Fontes(TypedDict):
    excel: List[Fonte]
    imagens: List[Fonte]

class Defaults(TypedDict):
    dataInicial: int
    paginacao: int
    atualizacaoAutomatica: bool
    intervaloAtualizacao: int

class Config(TypedDict):
    tiposRelatorio: Dict[str, TipoRelatorio]
    fontes: Fontes
    defaults: Defaults

class ConfigManager:
    _instance = None
    _config: Config = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigManager, cls).__new__(cls)
            cls._instance._load_config()
        return cls._instance

    def _load_config(self):
        config_path = Path(__file__).parent.parent.parent.parent / 'config' / 'reports.config.json'
        with open(config_path, 'r', encoding='utf-8') as f:
            self._config = json.load(f)

    def get_tipos_relatorio(self) -> List[str]:
        return list(self._config['tiposRelatorio'].keys())

    def get_tipo_relatorio(self, tipo: str) -> Optional[TipoRelatorio]:
        return self._config['tiposRelatorio'].get(tipo)

    def get_frentes(self, tipo: str) -> List[Frente]:
        tipo_relatorio = self.get_tipo_relatorio(tipo)
        return tipo_relatorio['frentes'] if tipo_relatorio else []

    def get_metas(self, tipo: str) -> Meta:
        tipo_relatorio = self.get_tipo_relatorio(tipo)
        return tipo_relatorio['metas'] if tipo_relatorio else {}

    def get_fontes_excel(self) -> List[Fonte]:
        return self._config['fontes']['excel']

    def get_fontes_imagens(self) -> List[Fonte]:
        return self._config['fontes']['imagens']

    def get_componentes_config(self, tipo: str) -> Componentes:
        tipo_relatorio = self.get_tipo_relatorio(tipo)
        if not tipo_relatorio:
            return {
                'mostrarImageUpload': False,
                'mostrarExcelUpload': False,
                'mostrarMapas': False
            }
        return tipo_relatorio['componentes']

    def get_defaults(self) -> Defaults:
        return self._config['defaults']

config_manager = ConfigManager() 