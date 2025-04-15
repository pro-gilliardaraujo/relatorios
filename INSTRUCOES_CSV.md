# Instruções para Preenchimento dos Dados em CSV

Este documento contém instruções sobre como utilizar os arquivos CSV de exemplo para preparar os dados para os relatórios de colheita e transbordo.

## Arquivos Disponíveis

Reorganizamos os arquivos CSV em diretórios separados para melhor organização:

### Pasta `exemplos_csv/colheita` (para relatórios de colheita)

1. `disponibilidade_mecanica.csv` - Para dados de disponibilidade mecânica
2. `eficiencia_energetica.csv` - Para dados de eficiência energética
3. `motor_ocioso.csv` - Para dados de motor ocioso
4. `uso_gps.csv` - Para dados de uso de GPS
5. `hora_elevador.csv` - Para dados de hora elevador
6. `media_velocidade.csv` - Para dados de média de velocidade

### Pasta `exemplos_csv/transbordo` (para relatórios de transbordo)

1. `disponibilidade_mecanica.csv` - Para dados de disponibilidade mecânica
2. `eficiencia_energetica.csv` - Para dados de eficiência energética
3. `motor_ocioso.csv` - Para dados de motor ocioso
4. `uso_gps.csv` - Para dados de uso de GPS
5. `falta_apontamento.csv` - Para dados de falta de apontamento
6. `media_velocidade.csv` - Para dados de média de velocidade

## Como Usar os Arquivos CSV

1. Escolha a pasta correspondente ao tipo de relatório que deseja gerar (colheita ou transbordo)
2. Abra os arquivos CSV no editor de planilhas de sua preferência (Excel ou Google Sheets)
3. Substitua os dados de exemplo pelos seus dados reais
4. Salve os arquivos mantendo os nomes originais e a mesma estrutura de colunas

## Estrutura dos Arquivos CSV

### disponibilidade_mecanica.csv
```
frota,disponibilidade
7001,93.45   # Para colheita
8001,92.35   # Para transbordo
```

- `frota`: Código/número da frota (texto)
- `disponibilidade`: Percentual de disponibilidade (0-100, número)

### eficiencia_energetica.csv
```
id,nome,eficiencia
C001,Operador Antônio,87.35   # Para colheita
T001,Operador Felipe,86.15    # Para transbordo
```

- `id`: ID do operador (texto)
- `nome`: Nome do operador (texto)
- `eficiencia`: Percentual de eficiência (0-100, número)

### motor_ocioso.csv
```
id,nome,percentual
C001,Operador Antônio,7.25   # Para colheita
T001,Operador Felipe,9.45    # Para transbordo
```

- `id`: ID do operador (texto)
- `nome`: Nome do operador (texto)
- `percentual`: Percentual de motor ocioso (0-100, número)

### uso_gps.csv
```
id,nome,porcentagem
C001,Operador Antônio,97.35   # Para colheita
T001,Operador Felipe,94.80    # Para transbordo
```

- `id`: ID do operador (texto)
- `nome`: Nome do operador (texto)
- `porcentagem`: Percentual de uso do GPS (0-100, número)

### hora_elevador.csv (apenas na pasta colheita)
```
id,nome,horas
C001,Operador Antônio,2.75
```

- `id`: ID do operador (texto)
- `nome`: Nome do operador (texto)
- `horas`: Horas em formato decimal (ex: 2.75 = 2h45min, número)

### falta_apontamento.csv (apenas na pasta transbordo)
```
id,nome,percentual
T001,Operador Felipe,6.35
```

- `id`: ID do operador (texto)
- `nome`: Nome do operador (texto)
- `percentual`: Percentual de falta de apontamento (0-100, número)

### media_velocidade.csv
```
id,nome,velocidade
7001,Frota 7001,6.8    # Para colheita
8001,Frota 8001,14.5   # Para transbordo
```

- `id`: ID da frota (texto)
- `nome`: Nome da frota (texto)
- `velocidade`: Velocidade em km/h (número)

## Observações Importantes

1. Mantenha o mesmo formato e cabeçalhos dos arquivos CSV
2. Os valores numéricos devem usar ponto como separador decimal (ex: 95.67)
3. A velocidade média para colheita tem meta de 7 km/h
4. A velocidade média para transbordo tem meta de 15 km/h
5. Note que os IDs dos operadores e frotas seguem padrões diferentes para cada tipo:
   - Colheita: Frotas começam com '7' e operadores com 'C'
   - Transbordo: Frotas começam com '8' e operadores com 'T'

## Usando o Script Python para Gerar o JSON

Incluímos um script Python (`csv_para_json.py`) que facilita a conversão dos arquivos CSV para o formato JSON necessário:

1. Execute o script: `python csv_para_json.py`
2. Siga as instruções para informar o tipo de relatório e demais dados
3. O script irá ler automaticamente os arquivos da pasta correta e gerar um arquivo JSON pronto para uso

Caso prefira ferramentas online, você pode usar:
- [csvjson.com](https://csvjson.com/csv2json)
- [convertcsv.com](https://www.convertcsv.com/csv-to-json.htm) 