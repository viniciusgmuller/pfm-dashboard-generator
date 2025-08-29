# Dashboard Generator - Documentação

## Visão Geral

Sistema de geração automatizada de dashboards em PNG a partir de dados CSV com suporte a múltiplas categorias. Cada firm recebe um dashboard personalizado com ranking contextual e logos específicos da categoria.

### Características

- ✅ **Múltiplas categorias**: Prop Trading e Futures
- ✅ **Logos específicos**: Cada categoria tem seu conjunto de logos
- ✅ **Detecção automática**: Categoria detectada pelo nome do arquivo CSV
- ✅ **Alta qualidade**: Suporte a scale 2x e 3x para melhor resolução
- ✅ **Headless**: Gera imagens sem abrir navegador
- ✅ **Ranking contextual**: Mostra competidores vizinhos anonimizados

## Categorias Suportadas

### 1. Prop Trading (Padrão)
- **Arquivo CSV**: `data/weekly/data.csv`
- **Categoria**: `prop-trading` (detectada automaticamente)
- **Logos**: FundingPips, FTMO, The5ers, Alpha Capital, etc.

### 2. Futures
- **Arquivo CSV**: `data/weekly/datafutures.csv`  
- **Categoria**: `futures` (detectada automaticamente)
- **Logos**: My Funded Futures, Topstep, Alpha Futures, etc.

## Estrutura do CSV

O arquivo CSV deve ter as seguintes colunas (em ordem):

| Coluna | Nome | Descrição | Exemplo |
|--------|------|-----------|---------|
| A | Firms | Nome da empresa | FundingPips |
| B | Previous Position | Posição anterior no ranking | 5 |
| C | Popularity Ranking | Posição atual no ranking | 4 |
| D | Previous Week | Revenue semana anterior | $145000 |
| E | Revenue Generated | Revenue semana atual | $151280 |
| F | % Change | Variação de revenue | 4.3% |
| G | Previous Week | Visits anteriores (rosa) | 15890 |
| H | Current Week | Visits atuais (rosa) | 16256 |
| I | Count of added favorite votes | Favoritos adicionados | 366 |
| J | % Added | Variação de favoritos | 2.3% |
| K | Previous Week | Visits anteriores (azul) | 52340 |
| L | Traffic | Visits atuais (azul) | 58600 |
| M | % Increase | Variação de traffic | 12.0% |
| N | % Share | Share de CFD | 58.6% |

## Como Usar

### 1. Iniciar o servidor Next.js

```bash
npm run dev
```

### 2. Gerar Dashboards

#### Prop Trading (Qualidade Padrão)
```bash
npm run generate-dashboards -- --input data/weekly/data.csv
```

#### Prop Trading (Alta Qualidade 2x)
```bash
npm run generate-dashboards -- --input data/weekly/data.csv --scale 2
```

#### Futures (Qualidade Padrão)
```bash
npm run generate-dashboards -- --input data/weekly/datafutures.csv
```

#### Futures (Alta Qualidade 2x)
```bash
npm run generate-dashboards -- --input data/weekly/datafutures.csv --scale 2
```

#### Exemplos com Customização
```bash
# Qualidade máxima (3x) com output customizado
npm run generate-dashboards -- \
  --input data/weekly/data.csv \
  --scale 3 \
  --output ./output/high-res

# Futures em alta qualidade
npm run generate-dashboards -- \
  --input data/weekly/datafutures.csv \
  --scale 2 \
  --output ./output/futures-hq
```

### 3. Opções Disponíveis

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `--input <file>` | Arquivo CSV de entrada (obrigatório) | - |
| `--output <dir>` | Diretório de saída para PNGs | ./output/dashboards |
| `--scale <number>` | Fator de escala para qualidade (1x, 2x, 3x) | 1 |

### 4. Detecção Automática de Categoria

O sistema detecta automaticamente a categoria baseado no nome do arquivo:

- **`data.csv`** → categoria `prop-trading`
- **`datafutures.csv`** → categoria `futures`

Isso garante que os logos corretos sejam usados automaticamente.

## Configuração de Qualidade (Scale)

O parâmetro `--scale` controla a qualidade das imagens geradas:

| Scale | Resolução | Uso Recomendado |
|-------|-----------|-----------------|
| `1` | 1560x850 (padrão) | Visualização rápida, testes |
| `2` | 3120x1700 (alta qualidade) | Apresentações, relatórios |
| `3` | 4680x2550 (máxima qualidade) | Impressão, materiais finais |

**Importante**: O scale usa `deviceScaleFactor` para manter as proporções visuais corretas, apenas aumentando a resolução interna das imagens.

## Lógica do Ranking Contextual

Para cada firm, o sistema:

1. **Mostra a firm atual** em destaque com nome real
2. **Mostra competidores vizinhos** com logos mas nomes obscurecidos  
3. **Mantém métricas reais** de todos os competidores
4. **Usa logos da categoria correta** automaticamente

### Exemplo - Prop Trading:
Se "FundingPips" está em #1:
- **Linha 1: FundingPips** (logo + nome real + métricas reais)
- Linha 2: The5ers (logo real + nome obscurecido + métricas reais)
- Linha 3: Alpha Capital (logo real + nome obscurecido + métricas reais)
- Linha 4: E8 Markets (logo real + nome obscurecido + métricas reais)

### Exemplo - Futures:
Se "Topstep" está em #2:
- Linha 1: My Funded Futures (logo real + nome obscurecido + métricas reais)
- **Linha 2: Topstep** (logo + nome real + métricas reais)
- Linha 3: Alpha Futures (logo real + nome obscurecido + métricas reais)
- Linha 4: Top One Futures (logo real + nome obscurecido + métricas reais)

## Estrutura de Arquivos Gerados

### Prop Trading
```
output/
└── dashboards/
    ├── FundingPips.png
    ├── The5ers.png
    ├── Alpha_Capital.png
    ├── E8_Markets.png
    ├── FTMO.png
    └── ...
```

### Futures
```
output/
└── dashboards/ (ou diretório personalizado)
    ├── My_Funded_Futures.png
    ├── Topstep.png
    ├── Alpha_Futures.png
    ├── Top_One_Futures.png
    ├── FundingTicks.png
    └── ...
```

## Pré-requisitos

1. **Next.js Server**: Deve estar rodando na porta 3000
   ```bash
   npm run dev
   ```

2. **Arquivos CSV**: Devem estar no formato correto
   - `data/weekly/data.csv` para prop trading
   - `data/weekly/datafutures.csv` para futures

3. **Logos**: Devem estar configurados em:
   - `/data/logoData.ts` (biblioteca de logos)
   - `/lib/logoMapping.ts` (mapeamento nome → ID)

## Troubleshooting

### ❌ Erro: "Next.js server is not running!"
**Solução**: Inicie o servidor Next.js primeiro:
```bash
npm run dev
```

### ❌ Timeout durante a geração
**Causa**: Muitas empresas ou servidor lento  
**Solução**: Execute em lotes menores ou aumente o timeout

### ❌ Screenshot com elementos vazios
**Causa**: Dados faltando ou logos não encontrados  
**Solução**: Verifique se os logos estão mapeados corretamente

### ❌ Proporções incorretas com scale
**Causa**: Versões antigas do script  
**Solução**: Use apenas `deviceScaleFactor`, não multiplique viewport

## Arquitetura do Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CSV Files     │────▶│   CSV Parser     │────▶│   Firm Data     │
│ • data.csv      │     │ • Category       │     │ • Rankings      │
│ • datafutures.  │     │   Detection      │     │ • Competitors   │
│   csv           │     │ • Data parsing   │     │ • Metrics       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   PNG Files     │◀────│    Puppeteer     │◀────│   Next.js       │
│ • High Quality  │     │ • Headless       │     │   Dashboard     │
│ • Multiple      │     │ • Scale Support  │     │ • Dynamic Route │
│   Categories    │     │ • Screenshots    │     │ • Logo System   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Arquivos Principais

### Scripts
- `/scripts/simple-generate.ts` - Script principal de geração
- `/lib/csv-utils.ts` - Utilitários para parsing e ranking

### Componentes Next.js  
- `/app/dashboard/[firmId]/page.tsx` - Página dinâmica do dashboard
- `/components/PopularityLeaderboardStatic.tsx` - Componente de ranking
- `/components/Header.tsx` - Cabeçalho com logo da empresa

### Configuração
- `/lib/globalConfig.ts` - Configurações das categorias
- `/data/logoData.ts` - Biblioteca de todos os logos
- `/lib/logoMapping.ts` - Mapeamento nome da empresa → ID do logo

### Dados
- `/data/weekly/data.csv` - Dados das empresas prop trading
- `/data/weekly/datafutures.csv` - Dados das empresas futures