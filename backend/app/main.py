from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import reports

app = FastAPI(
    title="Boletim Plantadeiras API",
    description="API para processamento e análise de dados de plantadeiras",
    version="1.0.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar as origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluindo as rotas
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 