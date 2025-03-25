from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Optional
import tempfile
from pathlib import Path

from ...processors.plantadeiras_processor import PlantadeirasProcessor
from ...schemas.report import ReportResponse, ProcessingError

router = APIRouter()

@router.post("/process", response_model=ReportResponse)
async def process_report(file: UploadFile = File(...)):
    """
    Processa um arquivo Excel/CSV e retorna os dados processados.
    """
    if not file.filename.endswith(('.xlsx', '.csv')):
        raise HTTPException(
            status_code=400,
            detail="Formato de arquivo inválido. Use Excel (.xlsx) ou CSV."
        )
    
    try:
        # Salva o arquivo temporariamente
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = Path(temp_file.name)
        
        # Processa os dados
        processor = PlantadeirasProcessor()
        processor.load_data(temp_path)
        
        # Valida os dados
        is_valid, errors = processor.validate_data()
        if not is_valid:
            return JSONResponse(
                status_code=400,
                content={"errors": errors}
            )
        
        # Processa e retorna os resultados
        results = processor.process_data()
        graphs = processor.generate_graphs(results)
        
        return {
            "status": "success",
            "data": results,
            "graphs": graphs
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )
    
    finally:
        # Limpa o arquivo temporário
        if 'temp_path' in locals() and temp_path.exists():
            temp_path.unlink()

@router.get("/{report_id}")
async def get_report(report_id: str):
    """
    Recupera um relatório processado pelo ID.
    """
    # TODO: Implementar recuperação de relatório do banco de dados
    raise HTTPException(
        status_code=501,
        detail="Funcionalidade ainda não implementada"
    )

@router.post("/generate")
async def generate_report(report_id: str):
    """
    Gera o relatório final com dados e imagens.
    """
    # TODO: Implementar geração de relatório final
    raise HTTPException(
        status_code=501,
        detail="Funcionalidade ainda não implementada"
    ) 