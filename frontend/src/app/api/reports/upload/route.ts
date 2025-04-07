import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Obter o formulário enviado pelo frontend
    const formData = await request.formData();
    
    // Obter as informações do formulário
    const file = formData.get('file') as File;
    const reportType = formData.get('report_type') as string;
    const reportDate = formData.get('report_date') as string;
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const frente = formData.get('frente') as string;
    const isTeste = formData.get('is_teste') as string;
    
    // Verificar se é um relatório semanal
    const isWeeklyReport = reportType ? reportType.includes('semanal') : false;
    
    // Validar dados
    if (!reportType || !frente || (isWeeklyReport ? (!startDate || !endDate) : !reportDate) || !file) {
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
    
    // Adicionar campos de data conforme o tipo de relatório
    if (isWeeklyReport && startDate && endDate) {
      // Para relatórios semanais, enviar data início e data fim
      backendFormData.append('report_date', endDate); // Usar data fim como referência
      // O backend ainda espera report_date, então enviamos a data fim como report_date
      // em uma versão futura, o backend pode ser atualizado para aceitar start_date e end_date
    } else {
      // Para relatórios diários, enviar apenas a data do relatório
      backendFormData.append('report_date', reportDate);
    }
    
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
    
    // Se for um relatório semanal, adicionar metadados de data início e fim
    if (isWeeklyReport && result && result.data && result.data.metadata) {
      result.data.metadata.startDate = startDate;
      result.data.metadata.endDate = endDate;
    }
    
    console.log('✅ Dados processados pelo backend com sucesso');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error);
    return NextResponse.json({ 
      detail: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
} 