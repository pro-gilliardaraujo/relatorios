from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

class Settings(BaseSettings):
    # Configurações básicas
    PROJECT_NAME: str = "Boletim Plantadeiras API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Configurações do servidor
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Configurações de segurança
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 dias
    
    # Configurações de arquivos
    UPLOAD_DIR: Path = Path("uploads")
    ALLOWED_EXTENSIONS: List[str] = ["xlsx", "csv"]
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Configurações de cache
    CACHE_EXPIRE_MINUTES: int = 60  # 1 hora
    
    class Config:
        case_sensitive = True

settings = Settings()

# Criar diretório de uploads se não existir
os.makedirs(settings.UPLOAD_DIR, exist_ok=True) 