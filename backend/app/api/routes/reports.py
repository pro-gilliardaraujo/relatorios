from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List, Optional
from datetime import date, datetime
from ...processors.excel_processor import ExcelProcessor
from ...core.config import settings
import json
from pathlib import Path

router = APIRouter()
processor = ExcelProcessor()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    save_processed: bool = Query(False, description="Salvar dados processados para uso futuro")
):
    """
    Upload e processamento de arquivo Excel/CSV
    """
    try:
        # Validar arquivo
        await processor.validate_file(file)
        
        # Processar arquivo
        processed_data = await processor.process_file(file)
        
        if save_processed:
            # Criar nome único para o arquivo processado
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            processed_filename = f"processed_{timestamp}.json"
            
            # Salvar dados processados
            processed_path = settings.UPLOAD_DIR / processed_filename
            with open(processed_path, 'w', encoding='utf-8') as f:
                json.dump(processed_data, f, ensure_ascii=False, indent=2)
        
        return {
            "message": "Arquivo processado com sucesso",
            "data": processed_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/daily")
async def get_daily_report(
    report_date: date = Query(..., description="Data do relatório (YYYY-MM-DD)"),
    equipment_ids: Optional[List[str]] = Query(None, description="IDs dos equipamentos"),
    metrics: Optional[List[str]] = Query(None, description="Métricas específicas para retornar")
):
    """
    Recupera relatório diário processado
    """
    try:
        # Construir padrão do nome do arquivo
        date_str = report_date.strftime("%Y%m%d")
        files = list(settings.UPLOAD_DIR.glob(f"processed_{date_str}_*.json"))
        
        if not files:
            raise HTTPException(
                status_code=404,
                detail=f"Nenhum relatório encontrado para a data {report_date}"
            )
        
        # Pegar o arquivo mais recente
        latest_file = max(files, key=lambda x: x.stat().st_mtime)
        
        # Carregar dados
        with open(latest_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Filtrar por equipamento se especificado
        if equipment_ids:
            # Implementar filtro por equipamento
            pass
        
        # Filtrar métricas se especificado
        if metrics:
            filtered_data = {k: v for k, v in data.items() if k in metrics}
            return filtered_data
        
        return data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_analytics(
    start_date: date = Query(..., description="Data inicial (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Data final (YYYY-MM-DD)"),
    equipment_ids: Optional[List[str]] = Query(None, description="IDs dos equipamentos"),
    group_by: Optional[str] = Query(None, description="Agrupar por (equipment, operation, state)")
):
    """
    Recupera análises agregadas por período
    """
    try:
        # Implementar lógica de agregação de dados
        # Esta é uma implementação básica que deve ser expandida
        
        analytics_data = {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "equipment_ids": equipment_ids,
            "group_by": group_by,
            # Adicionar dados agregados aqui
        }
        
        return analytics_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 