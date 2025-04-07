import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Obter o formulário enviado pelo frontend
    const formData = await request.formData();
    
    // Obter as informações do formulário
    const file = formData.get('file') as File;
    const reportType = formData.get('report_type') as string;
    const reportDate = formData.get('report_date') as string;
    const frente = formData.get('frente') as string;
    const isTeste = formData.get('is_teste') as string;
    
    // Validar dados
    if (!file || !reportType || !reportDate || !frente) {
      return NextResponse.json({ 
        detail: 'Parâmetros obrigatórios não fornecidos' 
      }, { status: 400 });
    }
    
    // URL da API do backend
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    
    // Criar novo FormData para enviar ao backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('report_type', reportType);
    backendFormData.append('report_date', reportDate);
    backendFormData.append('frente', frente);
    backendFormData.append('save_processed', 'true');
    
    if (isTeste === 'true') {
      backendFormData.append('is_teste', 'true');
    }
    
    console.log(`⏩ Encaminhando arquivo ${file.name} para o backend: ${backendUrl}/api/v1/relatorios/upload`);
    
    // Enviar para o backend
    const response = await fetch(`${backendUrl}/api/v1/relatorios/upload`, {
      method: 'POST',
      body: backendFormData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro do backend [${response.status}]: ${errorText}`);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json({ 
          detail: errorData.detail || 'Erro ao processar arquivo no backend'
        }, { status: response.status });
      } catch {
        return NextResponse.json({ 
          detail: `Erro do backend: ${errorText || response.statusText}`
        }, { status: response.status });
      }
    }
    
    // Retornar os dados processados do backend
    const result = await response.json();
    console.log('✅ Dados processados pelo backend com sucesso');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error);
    return NextResponse.json({ 
      detail: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
} 