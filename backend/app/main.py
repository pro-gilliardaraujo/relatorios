from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Boletim Plantadeiras API",
    description="API para processamento de dados e geração de relatórios de plantadeiras",
    version="1.0.0"
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handlers de erro
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)},
    )

# Rota de healthcheck
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Importa e inclui os routers
from api.routes import reports, images

app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(images.router, prefix="/api/v1/images", tags=["images"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 