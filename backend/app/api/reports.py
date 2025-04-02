from fastapi import APIRouter, HTTPException, Response
from ..services.pdf_service import PDFService

router = APIRouter()

@router.post("/{report_id}/pdf")
async def generate_pdf(report_id: str, report_type: str):
    """
    Generate a PDF from a report
    """
    try:
        pdf_buffer = await PDFService.generate_pdf(report_id, report_type)
        
        # Return PDF file
        return Response(
            content=pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=report_{report_id}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating PDF: {str(e)}"
        ) 