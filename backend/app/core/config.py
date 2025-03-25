from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configurações da aplicação."""
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Boletim Plantadeiras API"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Frontend Next.js
        "http://localhost:8000",  # Backend FastAPI
    ]
    
    # Diretórios
    BASE_DIR: Path = Path(__file__).parent.parent.parent
    TEMP_DIR: Path = BASE_DIR / "temp"
    DATA_DIR: Path = BASE_DIR / "data"
    TEMP_IMAGES_DIR: Path = TEMP_DIR / "images"
    
    # Limites
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Processamento
    ALLOWED_EXTENSIONS: List[str] = [".xlsx", ".csv"]
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif"]
    
    class Config:
        case_sensitive = True

# Cria uma instância das configurações
settings = Settings()

# Cria os diretórios necessários
settings.TEMP_DIR.mkdir(exist_ok=True)
settings.DATA_DIR.mkdir(exist_ok=True)
settings.TEMP_IMAGES_DIR.mkdir(exist_ok=True) 