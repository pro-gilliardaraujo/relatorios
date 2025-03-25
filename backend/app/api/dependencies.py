from typing import Generator
from ..processors.plantadeiras_processor import PlantadeirasProcessor

def get_processor() -> Generator[PlantadeirasProcessor, None, None]:
    """
    Dependency para obter uma instância do processador.
    """
    processor = PlantadeirasProcessor()
    try:
        yield processor
    finally:
        # Cleanup se necessário
        pass 