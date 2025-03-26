# Boletim Plantadeiras - Sistema de Análise

Sistema de análise e geração de relatórios para dados de plantadeiras, com backend em Python/FastAPI e frontend em Next.js.

## Estrutura do Projeto

```
.
├── backend/                      # API e processamento (Python/FastAPI)
│   ├── app/
│   │   ├── api/                 # Endpoints da API
│   │   ├── core/               # Configurações principais
│   │   ├── processors/         # Processadores de dados
│   │   └── models/             # Modelos de dados
│   └── main.py                 # Ponto de entrada da API
└── frontend/                    # Interface (Next.js)
```

## Requisitos

- Python 3.8+
- Node.js 18+
- PostgreSQL (opcional)
- Redis (opcional, para cache)

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd boletim-plantadeiras
```

2. Configure o ambiente Python:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## Executando o Backend

1. Ative o ambiente virtual:
```bash
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Execute o servidor de desenvolvimento:
```bash
cd backend
uvicorn main:app --reload
```

O servidor estará disponível em `http://localhost:8000`

## API Endpoints

### Upload de Arquivo
```http
POST /api/v1/reports/upload
```
- Aceita arquivos Excel (.xlsx) ou CSV
- Parâmetro opcional `save_processed=true` para salvar dados processados

### Relatório Diário
```http
GET /api/v1/reports/daily?report_date=2024-03-25
```
- Parâmetros opcionais:
  - `equipment_ids`: Lista de IDs de equipamentos
  - `metrics`: Lista de métricas específicas

### Análises
```http
GET /api/v1/reports/analytics
```
- Parâmetros obrigatórios:
  - `start_date`: Data inicial
  - `end_date`: Data final
- Parâmetros opcionais:
  - `equipment_ids`: Lista de IDs de equipamentos
  - `group_by`: Agrupamento (equipment, operation, state)

## Dados Processados

O sistema processa os seguintes tipos de dados:

1. Métricas Operacionais
   - Tempo total por estado
   - Média de velocidade por operação
   - Tempo de motor ocioso

2. Indicadores de Performance
   - Disponibilidade mecânica
   - Utilização do RTK
   - Horas totais e de manutenção

3. Análise de Tempo
   - Distribuição por grupo de operação
   - Top 5 ofensores (tempos perdidos)

4. Dados Geográficos
   - Coordenadas de operação
   - Estado operacional por ponto
   - Velocidade e RPM por localização

## Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das suas alterações
3. Envie um pull request

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE). 