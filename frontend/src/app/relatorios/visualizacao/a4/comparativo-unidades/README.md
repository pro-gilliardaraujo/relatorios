# Relatório Comparativo de Unidades

Este componente implementa a visualização do relatório comparativo entre unidades, mostrando indicadores-chave de performance tanto para colheita quanto para transbordo.

## Funcionalidades

- Exibe indicadores de colheita e transbordo em um único relatório
- Compara dados de diferentes unidades lado a lado
- Utiliza código de cores para indicar performance em relação às metas
- Apresenta tabelas detalhadas de cada indicador
- Suporta impressão do relatório em formato A4

## Estrutura de Dados

O relatório espera uma estrutura de dados específica:

```typescript
interface UnidadeData {
  id: string;
  nome: string;
  valor: number;
}

interface ProcessedData {
  colheita: {
    disponibilidade_mecanica: UnidadeData[];
    eficiencia_energetica: UnidadeData[];
    motor_ocioso: UnidadeData[];
    hora_elevador: UnidadeData[];
    uso_gps: UnidadeData[];
  };
  transbordo: {
    disponibilidade_mecanica: UnidadeData[];
    eficiencia_energetica: UnidadeData[];
    motor_ocioso: UnidadeData[];
    falta_apontamento: UnidadeData[];
    uso_gps: UnidadeData[];
  };
}
```

## Metas e Configuração

As metas para os indicadores são obtidas do arquivo de configuração `config/reports.config.json`, na seção `comparativo_unidades_diario`. Este relatório utiliza as seguintes metas:

- Colheita:
  - Disponibilidade Mecânica: 90%
  - Eficiência Operacional: 70%
  - Motor Ocioso: 4%
  - Horas Elevador: 5h
  - Uso GPS: 90%

- Transbordo:
  - Disponibilidade Mecânica: 90%
  - Eficiência Operacional: 65%
  - Motor Ocioso: 6%
  - Falta de Apontamento: 10%
  - Uso GPS: 90%

## Componentes Utilizados

- `A4Colheita` - Para layout em formato A4
- `TabelaUnidades` - Para exibir dados detalhados por unidade
- `IndicadorCompacto` - Componente customizado para mostrar indicadores de forma compacta

## Uso

O relatório é acessado através da URL:
```
/relatorios/visualizacao/a4/comparativo-unidades?id=REPORT_ID
```

Onde `REPORT_ID` é o ID do relatório gerado.

## Modo de Depuração

Para facilitar o desenvolvimento e teste da interface, este componente oferece um modo de depuração que carrega dados de exemplo sem necessidade de consulta ao banco de dados.

### Opções de depuração:

1. **Parâmetro URL debug=true**:
   ```
   /relatorios/visualizacao/a4/comparativo-unidades?debug=true
   ```
   Este parâmetro carrega automaticamente dados de exemplo predefinidos, ignorando qualquer requisição ao Supabase.

2. **Botão "Carregar Dados de Exemplo"**:
   Quando nenhum relatório é encontrado, um botão é mostrado permitindo carregar dados de exemplo para visualizar o layout da página.

Ambos os métodos usam o mesmo conjunto de dados de exemplo, que inclui três unidades com métricas fictícias para colheita e transbordo.

## Troubleshooting

Se você encontrar uma tela de carregamento infinito, verifique:

1. Se você está usando o ID de relatório correto na URL
2. Se o relatório existe na tabela `relatorios_diarios` do Supabase
3. Se há erros no console do navegador
4. Use o modo de depuração `?debug=true` para testar a interface independentemente dos dados do banco 