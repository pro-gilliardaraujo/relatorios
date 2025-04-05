from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Form
from typing import List, Optional
from datetime import date, datetime, timedelta
from ...processors.excel_processor import ExcelProcessor
from ...processors.report_processor import ReportProcessor
from ...core.config import settings
import json
from pathlib import Path

router = APIRouter()
excel_processor = ExcelProcessor()
report_processor = ReportProcessor()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    report_type: str = Form(..., description="Tipo do relatório (plantio, colheita, cav)"),
    report_date: date = Form(..., description="Data do relatório"),
    frente: str = Form(..., description="Frente de trabalho"),
    equipment_ids: Optional[List[str]] = Form(None, description="IDs dos equipamentos"),
    save_processed: bool = Form(False, description="Salvar dados processados para uso futuro")
):
    """
    Upload e processamento de arquivo Excel/CSV
    """
    try:
        # Validar arquivo
        await excel_processor.validate_file(file)
        
        # Processar arquivo
        processed_data = await excel_processor.process_file(file, report_type=report_type)
        
        # Gerar relatório
        report = await report_processor.generate_report(
            processed_data=processed_data,
            report_type=report_type,
            report_date=report_date,
            frente=frente,
            equipment_ids=equipment_ids
        )
        
        if save_processed:
            # Criar nome único para o arquivo processado
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            processed_filename = f"processed_{timestamp}.json"
            
            # Salvar dados processados
            processed_path = settings.UPLOAD_DIR / processed_filename
            with open(processed_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
        
        return {
            "message": "Relatório gerado com sucesso",
            "data": report
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/daily")
async def get_daily_report(
    report_date: date = Query(..., description="Data do relatório (YYYY-MM-DD)"),
    report_type: str = Query(..., description="Tipo do relatório (plantio, colheita, cav)"),
    frente: str = Query(..., description="Frente de trabalho"),
    equipment_ids: Optional[List[str]] = Query(None, description="IDs dos equipamentos")
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
        
        # Gerar relatório com os dados carregados
        report = await report_processor.generate_report(
            processed_data=data.get('data', {}),
            report_type=report_type,
            report_date=report_date,
            frente=frente,
            equipment_ids=equipment_ids
        )
        
        return report
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_analytics(
    start_date: date = Query(..., description="Data inicial (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Data final (YYYY-MM-DD)"),
    report_type: str = Query(..., description="Tipo do relatório (plantio, colheita, cav)"),
    frente: str = Query(..., description="Frente de trabalho"),
    equipment_ids: Optional[List[str]] = Query(None, description="IDs dos equipamentos"),
    group_by: Optional[str] = Query(None, description="Agrupar por (equipment, operation, state)")
):
    """
    Recupera análises agregadas por período
    """
    try:
        analytics_data = {
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'type': report_type,
                'frente': frente
            },
            'equipment_ids': equipment_ids,
            'group_by': group_by
        }
        
        # Carregar e agregar dados do período
        date_range = [start_date + timedelta(days=x) for x in range((end_date - start_date).days + 1)]
        aggregated_data = {}
        
        for current_date in date_range:
            date_str = current_date.strftime("%Y%m%d")
            files = list(settings.UPLOAD_DIR.glob(f"processed_{date_str}_*.json"))
            
            if files:
                latest_file = max(files, key=lambda x: x.stat().st_mtime)
                with open(latest_file, 'r', encoding='utf-8') as f:
                    day_data = json.load(f)
                
                # Agregar dados do dia
                for key, value in day_data.get('data', {}).items():
                    if key not in aggregated_data:
                        aggregated_data[key] = []
                    aggregated_data[key].append(value)
        
        # Gerar relatório com dados agregados
        if aggregated_data:
            analytics_data['aggregated_metrics'] = await report_processor.generate_report(
                processed_data=aggregated_data,
                report_type=report_type,
                report_date=end_date,  # Usar a data final como referência
                frente=frente,
                equipment_ids=equipment_ids
            )
        
        return analytics_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 