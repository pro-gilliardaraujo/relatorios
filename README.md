# Processador de Boletim Diário - Plantadeiras

Este projeto implementa um sistema de processamento e visualização de dados para o Boletim Diário de Plantadeiras, permitindo a análise de dados operacionais e geração de relatórios com gráficos e indicadores de performance.

## Funcionalidades

- Processamento de arquivos Excel/CSV com dados operacionais
- Cálculo de indicadores de performance (disponibilidade, utilização, etc.)
- Geração de gráficos e visualizações
- Interface web com Streamlit
- Suporte para colagem de imagens (Ctrl+V)
- Validação e limpeza de dados
- Exportação de relatórios

## Requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)
- Navegador web moderno

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd [NOME_DO_DIRETORIO]
```

2. Crie um ambiente virtual Python:
```bash
python -m venv venv
```

3. Ative o ambiente virtual:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Uso

1. Ative o ambiente virtual (se ainda não estiver ativo)

2. Execute a aplicação Streamlit:
```bash
streamlit run src/interface/app.py
```

3. Acesse a interface web no navegador (geralmente em http://localhost:8501)

4. Na interface:
   - Use o botão "Carregar arquivo Excel/CSV" para selecionar o arquivo de dados
   - Cole imagens usando Ctrl+V na área designada
   - Visualize os gráficos e indicadores gerados
   - Exporte os resultados conforme necessário

## Estrutura do Projeto

```
.
├── data/                  # Diretório para armazenamento de dados
├── src/                   # Código fonte
│   ├── processors/       # Processadores de dados
│   ├── interface/        # Interface Streamlit
│   ├── config/          # Configurações
│   └── utils/           # Utilitários
├── tests/                # Testes
├── temp_data/            # Dados temporários
├── requirements.txt      # Dependências
└── README.md            # Este arquivo
```

## Configuração

As principais configurações podem ser ajustadas no arquivo `src/config/settings.py`:

- Estados operacionais
- Colunas obrigatórias
- Cores dos gráficos
- Parâmetros de processamento
- Configurações de layout

## Desenvolvimento

Para contribuir com o projeto:

1. Crie um branch para suas alterações
2. Mantenha os testes atualizados
3. Siga o padrão de código existente
4. Documente novas funcionalidades
5. Faça um pull request

## Testes

Para executar os testes:

```bash
pytest tests/
```

## Suporte

Para reportar problemas ou sugerir melhorias, abra uma issue no repositório.

## Licença

[Tipo de Licença] - Veja o arquivo LICENSE para detalhes. 