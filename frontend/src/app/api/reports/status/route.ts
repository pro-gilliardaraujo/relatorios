import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas');
  throw new Error('Configuração do Supabase incompleta');
}

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    // Obter o ID do relatório da URL
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: 'ID do relatório não fornecido' },
        { status: 400 }
      );
    }

    console.log(`🔍 Verificando status do relatório ${reportId}`);

    // Buscar o relatório no Supabase
    const { data: report, error } = await supabase
      .from('relatorios_diarios')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar relatório:', {
        codigo: error.code,
        mensagem: error.message
      });
      
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar relatório' },
        { status: 500 }
      );
    }

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Relatório não encontrado' },
        { status: 404 }
      );
    }

    console.log(`📄 Status do relatório: ${report.status}`);
    
    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        tipo: report.tipo,
        data: report.data,
        frente: report.frente,
        status: report.status,
        pdf_url: report.pdf_url
      }
    });

  } catch (error) {
    console.error('❌ Erro ao processar solicitação:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
} 