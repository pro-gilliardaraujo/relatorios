import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados de entrada
    if (!body.tipo) {
      return NextResponse.json({ error: 'Tipo de relatório não informado' }, { status: 400 });
    }
    
    if (!body.data) {
      return NextResponse.json({ error: 'Data do relatório não informada' }, { status: 400 });
    }
    
    // Gerar ID único para o relatório
    const reportId = uuidv4();
    
    // Salvar dados no Supabase
    const { data, error } = await supabase
      .from('relatorios_diarios')
      .insert({
        id: reportId,
        tipo: body.tipo,
        data: body.data,
        frente: body.frente || null,
        status: 'concluido', // Marcar como concluído diretamente
        dados: body.dados || {}
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao salvar dados no Supabase:', error);
      return NextResponse.json({ error: `Erro ao salvar dados: ${error.message}` }, { status: 500 });
    }
    
    console.log('✅ Dados salvos com sucesso:', {
      id: reportId,
      tipo: body.tipo,
      data: body.data
    });
    
    // Retornar o ID do relatório
    return NextResponse.json({ 
      id: reportId,
      message: 'Relatório salvo com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro interno no servidor:', error);
    return NextResponse.json({ error: `Erro interno no servidor: ${error.message}` }, { status: 500 });
  }
} 