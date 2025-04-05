import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Carregar variáveis de ambiente
print("Tentando carregar .env...")
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    print(f"Arquivo .env encontrado: {env_path}")
    load_dotenv(env_path)
else:
    print(f"Arquivo .env não encontrado em: {env_path}")

# Obter variáveis do Supabase
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_KEY')
supabase_service_key = os.environ.get('SUPABASE_SERVICE_ROLE')

# Imprimir informações (sem mostrar as chaves completas)
print(f"\nConfiguração do Supabase:")
print(f"SUPABASE_URL: {supabase_url}")
print(f"SUPABASE_KEY (primeiros 15 chars): {supabase_key[:15] if supabase_key else 'Não definido'}...")
print(f"SUPABASE_SERVICE_ROLE (primeiros 15 chars): {supabase_service_key[:15] if supabase_service_key else 'Não definido'}...")

# Tentar criar cliente com a chave anônima
try:
    print("\nTentando criar cliente Supabase com chave anônima...")
    supabase_client = create_client(supabase_url, supabase_key)
    print("✅ Cliente criado com sucesso!")
    
    # Tentar uma operação simples
    print("\nTentando fazer uma operação simples...")
    response = supabase_client.table('relatorios_diarios').select("*").limit(1).execute()
    print(f"✅ Operação realizada com sucesso! Resultado: {response}")
    
except Exception as e:
    print(f"❌ Erro ao criar cliente ou executar operação: {str(e)}")

# Tentar criar cliente com a service role
try:
    print("\nTentando criar cliente Supabase com service role...")
    admin_client = create_client(supabase_url, supabase_service_key)
    print("✅ Cliente admin criado com sucesso!")
    
    # Tentar uma operação simples
    print("\nTentando fazer uma operação simples com o cliente admin...")
    response = admin_client.table('relatorios_diarios').select("*").limit(1).execute()
    print(f"✅ Operação realizada com sucesso! Resultado: {response}")
    
except Exception as e:
    print(f"❌ Erro ao criar cliente admin ou executar operação: {str(e)}") 