from fastapi import APIRouter, File, UploadFile, HTTPException, Body
from fastapi.responses import JSONResponse
from typing import Dict, Optional
import base64
from io import BytesIO
from pathlib import Path
from PIL import Image
import tempfile
import uuid

router = APIRouter()

ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif']
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image(image_data: bytes) -> bool:
    """Valida se os bytes representam uma imagem válida."""
    try:
        Image.open(BytesIO(image_data))
        return True
    except:
        return False

@router.post("/upload")
async def upload_image(
    file: Optional[UploadFile] = File(None),
    base64_image: Optional[Dict] = Body(None)
):
    """
    Upload de imagem via arquivo ou base64 (para Ctrl+V).
    """
    try:
        if file:
            # Validação do arquivo
            if file.content_type not in ALLOWED_MIME_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail="Formato de imagem não suportado"
                )
            
            content = await file.read()
            
        elif base64_image and 'data' in base64_image:
            # Processa imagem em base64
            try:
                # Remove o cabeçalho do data URL se presente
                base64_str = base64_image['data']
                if ',' in base64_str:
                    base64_str = base64_str.split(',')[1]
                
                content = base64.b64decode(base64_str)
            except:
                raise HTTPException(
                    status_code=400,
                    detail="Formato base64 inválido"
                )
        else:
            raise HTTPException(
                status_code=400,
                detail="Nenhuma imagem fornecida"
            )
        
        # Validação do tamanho
        if len(content) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Imagem muito grande. Máximo permitido: 10MB"
            )
        
        # Valida se é uma imagem válida
        if not validate_image(content):
            raise HTTPException(
                status_code=400,
                detail="Arquivo não é uma imagem válida"
            )
        
        # Gera um ID único para a imagem
        image_id = str(uuid.uuid4())
        
        # TODO: Implementar armazenamento permanente das imagens
        # Por enquanto, salvamos em um diretório temporário
        temp_dir = Path("temp_images")
        temp_dir.mkdir(exist_ok=True)
        
        image_path = temp_dir / f"{image_id}.png"
        
        # Salva a imagem
        image = Image.open(BytesIO(content))
        image.save(image_path, format="PNG")
        
        return {
            "status": "success",
            "image_id": image_id,
            "message": "Imagem salva com sucesso"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar imagem: {str(e)}"
        )

@router.get("/{image_id}")
async def get_image(image_id: str):
    """
    Recupera uma imagem pelo ID.
    """
    # TODO: Implementar recuperação da imagem do armazenamento permanente
    temp_path = Path("temp_images") / f"{image_id}.png"
    
    if not temp_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Imagem não encontrada"
        )
    
    try:
        with open(temp_path, "rb") as f:
            content = f.read()
        return JSONResponse(
            content={
                "status": "success",
                "data": base64.b64encode(content).decode()
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao recuperar imagem: {str(e)}"
        ) 