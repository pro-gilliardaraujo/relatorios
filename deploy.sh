#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando deploy do servidor de relatórios...${NC}"

# Função para verificar comandos
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}$1 não encontrado. Por favor, instale o $1 primeiro.${NC}"
        exit 1
    fi
}

# Verifica dependências necessárias
check_command node
check_command npm
check_command python3
check_command pip3
check_command pm2

# Deploy do Backend
echo -e "${YELLOW}Iniciando deploy do backend...${NC}"

# Navega para o diretório do backend
cd backend

# Cria ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Criando ambiente virtual Python...${NC}"
    python3 -m venv venv
fi

# Ativa o ambiente virtual
source venv/bin/activate

# Instala dependências do Python
echo -e "${YELLOW}Instalando dependências do backend...${NC}"
pip install -r requirements.txt

# Cria arquivo .env se não existir
if [ ! -f .env ]; then
    echo -e "${YELLOW}Criando arquivo .env para o backend...${NC}"
    cat > .env << EOL
SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
SUPABASE_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
PORT=8000
EOL
fi

# Configura o PM2 para o backend
echo -e "${YELLOW}Configurando PM2 para o backend...${NC}"
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'relatorios-backend',
    cwd: '.',
    script: 'venv/bin/python',
    args: 'main.py',
    env: {
      PORT: 8000
    }
  }]
}
EOL

# Inicia ou reinicia o backend
if pm2 list | grep -q "relatorios-backend"; then
    echo -e "${YELLOW}Reiniciando backend...${NC}"
    pm2 restart relatorios-backend
else
    echo -e "${YELLOW}Iniciando backend...${NC}"
    pm2 start ecosystem.config.js
fi

# Deploy do Frontend
echo -e "${YELLOW}Iniciando deploy do frontend...${NC}"

# Navega para o diretório do frontend
cd ../frontend

# Instala dependências do Node
echo -e "${YELLOW}Instalando dependências do frontend...${NC}"
npm install

# Cria arquivo .env.production se não existir
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Criando arquivo .env.production para o frontend...${NC}"
    cat > .env.production << EOL
NEXT_PUBLIC_API_URL=https://iblogistica.ddns.net/api
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
PORT=3001
EOL
fi

# Build do frontend
echo -e "${YELLOW}Realizando build do frontend...${NC}"
npm run build

# Configura o PM2 para o frontend
echo -e "${YELLOW}Configurando PM2 para o frontend...${NC}"
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'relatorios-frontend',
    cwd: '.',
    script: 'npm',
    args: 'start:prod',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOL

# Inicia ou reinicia o frontend
if pm2 list | grep -q "relatorios-frontend"; then
    echo -e "${YELLOW}Reiniciando frontend...${NC}"
    pm2 restart relatorios-frontend
else
    echo -e "${YELLOW}Iniciando frontend...${NC}"
    pm2 start ecosystem.config.js
fi

# Salva a configuração do PM2
echo -e "${YELLOW}Salvando configuração do PM2...${NC}"
pm2 save

# Verifica o status dos processos
echo -e "${YELLOW}Status dos processos:${NC}"
pm2 status

echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}Backend está rodando em: https://iblogistica.ddns.net/api${NC}"
echo -e "${GREEN}Frontend está rodando em: https://iblogistica.ddns.net${NC}"

# Lista de comandos úteis
echo -e "\n${YELLOW}Comandos úteis:${NC}"
echo -e "  ${GREEN}Ver logs do backend:${NC} pm2 logs relatorios-backend"
echo -e "  ${GREEN}Ver logs do frontend:${NC} pm2 logs relatorios-frontend"
echo -e "  ${GREEN}Reiniciar backend:${NC} pm2 restart relatorios-backend"
echo -e "  ${GREEN}Reiniciar frontend:${NC} pm2 restart relatorios-frontend"
echo -e "  ${GREEN}Reiniciar tudo:${NC} pm2 restart all" 