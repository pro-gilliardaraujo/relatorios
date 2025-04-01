from supabase import create_client
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações do Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias")

# Criar cliente Supabase
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY) 