import { createClient } from '@supabase/supabase-js';

// Inicializa o cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Parâmetro id é obrigatório', { status: 400 });
  }

  try {
    // Busca os dados do relatório
    const { data: report, error } = await supabase
      .from('relatorios_diarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !report) {
      throw new Error('Erro ao buscar dados do relatório');
    }

    // Formata a data para o nome do arquivo
    const formatarData = (data: string) => {
      if (!data) return '';
      const [ano, mes, dia] = data.split('-');
      return `${dia}-${mes}-${ano}`;
    };

    // Gera o nome do arquivo
    const nomeArquivo = `Relatório de Colheita Diário - ${report.frente || 'Sem Frente'} - ${formatarData(report.data || '')}.pdf`;

    // Faz a requisição para o backend gerar o PDF
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pdf/${id}`);
    
    if (!response.ok) {
      throw new Error('Erro ao gerar PDF');
    }

    const pdfBuffer = await response.arrayBuffer();

    // Define os cabeçalhos da resposta
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(nomeArquivo)}"`);

    return new Response(pdfBuffer, {
      headers: headers
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return new Response('Erro ao gerar PDF', { status: 500 });
  }
} 