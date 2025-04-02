import os
import asyncio
import pyppeteer
import uuid
from datetime import datetime
from ..utils.logger import logger
from ..database.supabase_client import supabase_client, create_admin_client, supabase_url
from pyppeteer import launch
from fastapi import HTTPException
from typing import Optional

class PDFService:
    def __init__(self):
        self.frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        self.bucket_name = 'relatorios'
        # Criar um cliente do Supabase com permissão de administrador para o Storage
        self.admin_client = create_admin_client()
        # URL do Supabase para construção de URLs públicas
        self.supabase_url = supabase_url
        
    async def generate_and_upload_pdf(self, report_id, report_type):
        """Gera um PDF do relatório e faz upload para o Supabase"""
        try:
            logger.start(f"Iniciando geração do PDF para o relatório {report_id}")
            
            # Construir URL do relatório baseado no tipo
            base_path = '/relatorios/visualizacao/a4'
            
            if 'colheita' in report_type:
                view_path = f"{base_path}/colheita"
            elif 'plantio' in report_type:
                view_path = f"{base_path}/plantio"
            elif 'cav' in report_type:
                view_path = f"{base_path}/cav"
            else:
                view_path = f"{base_path}/{report_type}"
            
            report_url = f"{self.frontend_url}{view_path}?id={report_id}&format=pdf"
            logger.info(f"URL do relatório: {report_url}")
            
            # Gerar o PDF
            pdf_buffer = await self._generate_pdf(report_url)
            if not pdf_buffer:
                logger.error("Falha ao gerar o PDF")
                return None
                
            logger.success("PDF gerado com sucesso")
            
            # Criar nome do arquivo baseado no tipo e data
            today = datetime.now().strftime("%Y%m%d")
            folder_path = f"{report_type}"
            file_name = f"{today}_{uuid.uuid4().hex[:8]}.pdf"
            storage_path = f"{folder_path}/{file_name}"
            
            # Fazer upload do PDF para o Supabase
            pdf_url = await self._upload_to_supabase(pdf_buffer, storage_path)
            if not pdf_url:
                logger.error("Falha ao fazer upload do PDF")
                return None
                
            logger.success(f"PDF enviado para o Supabase: {pdf_url}")
            
            # Atualizar o registro do relatório com a URL do PDF
            success = await self._update_report_record(report_id, pdf_url)
            if success:
                logger.success(f"Registro do relatório atualizado com a URL do PDF")
            else:
                logger.error(f"Falha ao atualizar registro do relatório com a URL do PDF")
            
            return pdf_url
            
        except Exception as e:
            logger.error(f"Erro ao gerar e fazer upload do PDF: {str(e)}")
            return None
            
    async def _generate_pdf(self, url):
        """Gera um PDF a partir de uma URL usando o pyppeteer"""
        try:
            logger.processing("Inicializando navegador headless")
            browser = await launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            page = await browser.newPage()
            
            # Configurar viewport para tamanho A4
            await page.setViewport({
                'width': 794,  # A4 width in pixels at 96 DPI
                'height': 1123,  # A4 height in pixels at 96 DPI
                'deviceScaleFactor': 2,
            })
            
            logger.processing(f"Navegando para URL: {url}")
            await page.goto(url, {'waitUntil': 'networkidle0'})
            
            # Aguardar pelo elemento #report-content que indica que o relatório carregou
            logger.processing("Aguardando carregamento do relatório")
            await page.waitForSelector('.chakra-container', {'timeout': 5000})
            
            # Gerar PDF
            logger.processing("Gerando PDF")
            pdf_buffer = await page.pdf({
                'format': 'A4',
                'printBackground': True,
                'margin': {
                    'top': '20px',
                    'right': '20px',
                    'bottom': '20px',
                    'left': '20px'
                }
            })
            
            await browser.close()
            return pdf_buffer
            
        except Exception as e:
            logger.error(f"Erro ao gerar PDF: {str(e)}")
            return None
            
    async def _upload_to_supabase(self, pdf_buffer, storage_path):
        """Faz upload do PDF para o Storage do Supabase"""
        try:
            logger.upload(f"Enviando PDF para o Supabase: {storage_path}")
            
            # Usar o admin client que tem permissões de service_role
            client = self.admin_client if self.admin_client else supabase_client
            
            # Verificar se o bucket existe, caso contrário, criar
            try:
                buckets = client.storage.list_buckets()
                
                bucket_exists = False
                for bucket in buckets:
                    if bucket.get('name') == self.bucket_name:
                        bucket_exists = True
                        break
                
                if not bucket_exists:
                    logger.info(f"Criando bucket '{self.bucket_name}'")
                    client.storage.create_bucket(self.bucket_name, {'public': True})
                    logger.success(f"Bucket '{self.bucket_name}' criado com sucesso")
            except Exception as e:
                logger.error(f"Erro ao verificar/criar bucket: {str(e)}")
                # Tentamos continuar mesmo se houver erro, assumindo que o bucket já existe
            
            # Upload do arquivo
            try:
                # Para PDFs, não precisamos abrir o arquivo, já temos o buffer
                response = client.storage.from_(self.bucket_name).upload(
                    path=storage_path,
                    file=pdf_buffer,
                    file_options={"contentType": "application/pdf"}
                )
                
                logger.success("Upload concluído com sucesso")
                
                # Obter URL pública
                url = client.storage.from_(self.bucket_name).get_public_url(storage_path)
                
                # Se não conseguir obter a URL pública, construir manualmente
                if not url:
                    url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{storage_path}"
                    logger.info(f"URL construída manualmente: {url}")
                else:
                    logger.success(f"URL pública obtida: {url}")
                
                return url
            except Exception as e:
                logger.error(f"Erro durante o upload: {str(e)}")
                # Tentar uma abordagem alternativa se a primeira falhar
                try:
                    logger.info("Tentando abordagem alternativa de upload...")
                    response = client.storage.from_(self.bucket_name).upload(
                        storage_path, 
                        pdf_buffer
                    )
                    
                    # Construir URL manualmente
                    url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{storage_path}"
                    logger.info(f"URL construída manualmente após tentativa alternativa: {url}")
                    return url
                except Exception as alt_e:
                    logger.error(f"Tentativa alternativa falhou: {str(alt_e)}")
                    return None
        except Exception as e:
            logger.error(f"Erro ao fazer upload para o Supabase: {str(e)}")
            return None
            
    async def _update_report_record(self, report_id, pdf_url):
        """Atualiza o registro do relatório com a URL do PDF"""
        try:
            logger.database(f"Atualizando registro do relatório {report_id}")
            
            # Atualizar o registro com a URL do PDF e status 'concluído'
            try:
                update_data = {
                    'pdf_url': pdf_url,
                    'status': 'concluido',
                    'updated_at': datetime.now().isoformat()
                }
                
                # Abordagem simplificada conforme recomendado pelo assistente do Supabase
                supabase_client.from_('relatorios_diarios').update(update_data).eq('id', report_id)
                
                logger.success(f"Registro do relatório atualizado com sucesso: {report_id}")
                return True
            except Exception as e:
                logger.error(f"Erro ao executar atualização: {str(e)}")
                return False
            
        except Exception as e:
            logger.error(f"Erro ao atualizar registro do relatório: {str(e)}")
            return False

    @staticmethod
    async def generate_pdf(report_id: str, report_type: str) -> bytes:
        """
        Generate a PDF from a report page using Puppeteer
        """
        try:
            print("Initializing browser...")
            browser = await launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                handleSIGINT=False,
                handleSIGTERM=False,
                handleSIGHUP=False
            )
            
            try:
                # Create new page
                print("Creating new page...")
                page = await browser.newPage()
                
                # Set viewport to A4 size
                await page.setViewport({
                    'width': 794,  # A4 width in pixels at 96 DPI
                    'height': 1123,  # A4 height in pixels at 96 DPI
                    'deviceScaleFactor': 2,
                })
                
                # Navigate to the report page with correct URL format
                url = f"http://localhost:3000/relatorios/visualizacao/a4/{report_type}?id={report_id}"
                print(f"Navigating to URL: {url}")
                
                # Navigate with extended timeout
                try:
                    response = await page.goto(
                        url, 
                        {
                            'waitUntil': ['networkidle0', 'load', 'domcontentloaded'],
                            'timeout': 60000
                        }
                    )
                    
                    if not response.ok:
                        print(f"Page response not OK: {response.status}")
                        raise Exception(f"Failed to load page: {response.status}")
                        
                except Exception as e:
                    print(f"Navigation error: {str(e)}")
                    raise
                
                print("Page loaded, waiting for content...")
                
                # Wait for specific content to load
                try:
                    # Wait for report content
                    await page.waitForSelector('.report-content', {'timeout': 60000})
                    print("Found .report-content")
                    
                    # Wait a bit more to ensure all content is rendered
                    await page.waitFor(2000)
                    
                except Exception as e:
                    print(f"Error waiting for content: {str(e)}")
                    # Take screenshot for debugging
                    await page.screenshot({'path': 'error_screenshot.png'})
                    raise
                    
                print("Content loaded, generating PDF...")
                
                # Generate PDF
                pdf_buffer = await page.pdf({
                    'format': 'A4',
                    'printBackground': True,
                    'margin': {
                        'top': '20px',
                        'right': '20px',
                        'bottom': '20px',
                        'left': '20px'
                    }
                })
                
                print("PDF generated successfully")
                return pdf_buffer
                
            finally:
                # Always close the browser
                await browser.close()
                print("Browser closed")
            
        except Exception as e:
            print(f"Error in generate_pdf: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error generating PDF: {str(e)}"
            ) 