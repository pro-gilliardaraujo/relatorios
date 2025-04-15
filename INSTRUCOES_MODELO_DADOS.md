# Instruções para Preenchimento do Modelo de Dados para Relatórios

Este documento contém instruções sobre como preencher corretamente o arquivo `modelo_dados_relatorio.json` para gerar relatórios de colheita ou transbordo.

## Estrutura do Arquivo

O modelo de dados está dividido em três seções principais:

1. **informacoes_gerais**: Contém dados gerais do relatório como datas, tipo e frente
2. **colheita**: Todos os dados específicos para relatórios de colheita
3. **transbordo**: Todos os dados específicos para relatórios de transbordo

## Como Preencher

### 1. Informações Gerais

```json
"informacoes_gerais": {
  "data_inicio": "2023-07-01",     // Data de início no formato AAAA-MM-DD
  "data_fim": "2023-07-07",        // Data de fim no formato AAAA-MM-DD
  "tipo_relatorio": "transbordo_semanal",  // Escolha entre "colheita_semanal" ou "transbordo_semanal"
  "frente": "Frente 01",           // Nome da frente de trabalho
  "fazenda": "Fazenda São José"    // Nome da fazenda
}
```

### 2. Dados para Relatórios de Colheita

Se o `tipo_relatorio` for "colheita_semanal", preencha os dados na seção "colheita":

#### Disponibilidade Mecânica
```json
"disponibilidade_mecanica": [
  {
    "frota": "1001",              // Código/número da frota
    "disponibilidade": 95.67      // Percentual de disponibilidade (0-100)
  }
]
```

#### Eficiência Energética
```json
"eficiencia_energetica": [
  {
    "id": "1001",                 // ID do operador
    "nome": "Operador João",      // Nome do operador
    "eficiencia": 85.42           // Percentual de eficiência (0-100)
  }
]
```

#### Hora Elevador
```json
"hora_elevador": [
  {
    "id": "1001",                 // ID do operador
    "nome": "Operador João",      // Nome do operador
    "horas": 2.50                 // Horas em formato decimal (ex: 2.5 = 2h30min)
  }
]
```

#### Motor Ocioso
```json
"motor_ocioso": [
  {
    "id": "1001",                 // ID do operador
    "nome": "Operador João",      // Nome do operador
    "percentual": 8.25            // Percentual de motor ocioso (0-100)
  }
]
```

#### Uso GPS
```json
"uso_gps": [
  {
    "id": "1001",                 // ID do operador
    "nome": "Operador João",      // Nome do operador
    "porcentagem": 98.75          // Percentual de uso do GPS (0-100)
  }
]
```

#### Média de Velocidade
```json
"media_velocidade": [
  {
    "id": "1001",                 // ID da frota
    "nome": "Frota 1001",         // Nome da frota
    "velocidade": 6.8             // Velocidade em km/h
  }
]
```

### 3. Dados para Relatórios de Transbordo

Se o `tipo_relatorio` for "transbordo_semanal", preencha os dados na seção "transbordo":

#### Disponibilidade Mecânica
```json
"disponibilidade_mecanica": [
  {
    "frota": "2001",              // Código/número da frota
    "disponibilidade": 94.30      // Percentual de disponibilidade (0-100)
  }
]
```

#### Eficiência Energética
```json
"eficiencia_energetica": [
  {
    "id": "2001",                 // ID do operador
    "nome": "Operador Carlos",    // Nome do operador
    "eficiencia": 88.65           // Percentual de eficiência (0-100)
  }
]
```

#### Motor Ocioso
```json
"motor_ocioso": [
  {
    "id": "2001",                 // ID do operador
    "nome": "Operador Carlos",    // Nome do operador
    "percentual": 9.35            // Percentual de motor ocioso (0-100)
  }
]
```

#### Falta de Apontamento
```json
"falta_apontamento": [
  {
    "id": "2001",                 // ID do operador
    "nome": "Operador Carlos",    // Nome do operador
    "percentual": 5.25            // Percentual de falta de apontamento (0-100)
  }
]
```

#### Uso GPS
```json
"uso_gps": [
  {
    "id": "2001",                 // ID do operador
    "nome": "Operador Carlos",    // Nome do operador
    "porcentagem": 96.45          // Percentual de uso do GPS (0-100)
  }
]
```

#### Média de Velocidade
```json
"media_velocidade": [
  {
    "id": "2001",                 // ID da frota
    "nome": "Frota 2001",         // Nome da frota
    "velocidade": 14.3            // Velocidade em km/h
  }
]
```

## Observações Importantes

1. Os valores das métricas devem ser inseridos como números (sem aspas)
2. Os percentuais devem ser inseridos como valores de 0 a 100 (ex: 95.67)
3. A velocidade média para colheita tem meta de 7 km/h
4. A velocidade média para transbordo tem meta de 15 km/h
5. Adicione quantos itens forem necessários em cada seção, seguindo o formato dos exemplos

## Como Usar os Dados

Após preencher o modelo, você pode carregar esses dados no sistema para visualizar o relatório gerado. 