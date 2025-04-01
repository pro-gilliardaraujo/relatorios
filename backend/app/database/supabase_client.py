import os
from supabase import create_client, Client
from ..utils.logger import logger
from dotenv import load_dotenv
import sys

# Verificar se o arquivo .env existe e carregá-lo
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if os.path.exists(env_path):
    logger.info(f"Carregando variáveis de ambiente de {env_path}")
    load_dotenv(env_path)
else:
    logger.error(f"Arquivo .env não encontrado em {env_path}")

# Configurações do Supabase
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_KEY')
supabase_service_key = os.environ.get('SUPABASE_SERVICE_ROLE')

# Logar detalhes completos para diagnóstico
logger.info(f"Diretório atual: {os.getcwd()}")
logger.info(f"Variáveis de ambiente carregadas: {list(os.environ.keys())}")
logger.info(f"SUPABASE_URL: {'[PRESENTE]' if supabase_url else '[AUSENTE]'}")
logger.info(f"SUPABASE_KEY: {'[PRESENTE]' if supabase_key else '[AUSENTE]'}")
logger.info(f"SUPABASE_SERVICE_ROLE: {'[PRESENTE]' if supabase_service_key else '[AUSENTE]'}")

if not supabase_url or not supabase_key:
    logger.error("Variáveis de ambiente do Supabase não configuradas")
    logger.error(f"SUPABASE_URL: {'configurado' if supabase_url else 'ausente'}")
    logger.error(f"SUPABASE_KEY: {'configurado' if supabase_key else 'ausente'}")
    
    # Tentar definir valores padrão para ambiente de desenvolvimento
    if not supabase_url:
        supabase_url = "https://kjlwqezxzqjfhacmjhbh.supabase.co"
        logger.warning(f"Usando URL padrão do Supabase: {supabase_url}")
    
    if not supabase_key:
        supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqbHdxZXp4enFqZmhhY21qaGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NDY3OTgsImV4cCI6MjA1MzEyMjc5OH0.bB58zKtOtIyd4pZl-lycUQFVyHsQK_6Rxe2XtYta_cY"
        logger.warning(f"Usando KEY padrão do Supabase (truncada): {supabase_key[:15]}...")
    
    # Verificar novamente se temos as variáveis agora
    if not supabase_url or not supabase_key:
        raise ValueError("Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_KEY")

try:
    logger.info("Inicializando cliente Supabase")
    supabase_client: Client = create_client(supabase_url, supabase_key)
    logger.success("Cliente Supabase inicializado com sucesso")
except Exception as e:
    logger.error(f"Erro ao inicializar cliente Supabase: {str(e)}")
    raise

def create_admin_client() -> Client:
    """
    Cria um cliente Supabase com permissões de service_role para operações de administração
    """
    global supabase_url, supabase_service_key
    
    if not supabase_url or not supabase_service_key:
        logger.warning("Não foi possível criar cliente admin: URL ou SERVICE_ROLE ausente")
        
        # Definir valores padrão caso não estejam nas variáveis de ambiente
        if not supabase_url:
            supabase_url = "https://kjlwqezxzqjfhacmjhbh.supabase.co"
        
        if not supabase_service_key:
            supabase_service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqbHdxZXp4enFqZmhhY21qaGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU0Njc5OCwiZXhwIjoyMDUzMTIyNzk4fQ.eJ4REIHX_e2Q3pEXvHDlGuMcUBA8dco_DYmph1VA9zc"
            logger.warning(f"Usando SERVICE_ROLE padrão")
        
        if not supabase_url or not supabase_service_key:
            return None
    
    try:
        logger.info("Inicializando cliente Supabase Admin com service_role")
        logger.info(f"URL: {supabase_url}")
        logger.info(f"SERVICE_ROLE KEY (primeiros 15 chars): {supabase_service_key[:15]}...")
        
        # Criar cliente com service_role - abordagem mais simples conforme recomendado
        admin_client = create_client(supabase_url, supabase_service_key)
        
        logger.success("Cliente Supabase Admin inicializado com sucesso")
        return admin_client
    except Exception as e:
        logger.error(f"Erro ao inicializar cliente Supabase Admin: {str(e)}")
        logger.warning("Operações de administração podem não funcionar corretamente")
        return None 