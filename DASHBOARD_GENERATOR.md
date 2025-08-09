# Dashboard Generator - Documentação

## Visão Geral

Sistema de geração automatizada de dashboards em PNG a partir de dados CSV. Cada firm recebe um dashboard personalizado com ranking contextual (3 posições acima, 1 abaixo).

## Estrutura do CSV

O arquivo CSV deve ter as seguintes colunas (em ordem):

| Coluna | Nome | Descrição | Exemplo |
|--------|------|-----------|---------|
| A | Firms | Nome da empresa | Funding Pips |
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

### 1. Preparar o CSV

Coloque seu arquivo CSV em `data/weekly/data.csv` ou especifique o caminho.

### 2. Gerar Dashboards

```bash
# Usando o script npm (recomendado)
npm run generate-dashboards -- --input data/weekly/data.csv

# Com opções customizadas
npm run generate-dashboards -- \
  --input data/weekly/data.csv \
  --output ./output/dashboards \
  --width 1560 \
  --height 850

# Alta resolução (2x)
npm run generate-dashboards -- \
  --input data/weekly/data.csv \
  --scale 2

# Máxima qualidade (3x)
npm run generate-dashboards -- \
  --input data/weekly/data.csv \
  --scale 3 \
  --output ./output/high-res
```

### 3. Opções Disponíveis

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `-i, --input <file>` | Arquivo CSV de entrada (obrigatório) | - |
| `-o, --output <dir>` | Diretório de saída para PNGs | ./output/dashboards |
| `-w, --width <number>` | Largura do dashboard em pixels | 1560 |
| `--height <number>` | Altura do dashboard em pixels | 850 |
| `--scale <number>` | Fator de escala da imagem (1x, 2x, 3x) | 1 |
| `-q, --quality <number>` | Qualidade da imagem para JPEG (1-100) | 90 |
| `-f, --format <type>` | Formato de saída (png, jpeg, pdf) | png |

## Lógica do Ranking Contextual

Para cada firm, o sistema:

1. **Posiciona a firm na 4ª linha visual** (sempre)
2. **Mostra 3 posições acima** no ranking real
3. **Mostra 1 posição abaixo** no ranking real
4. **Anonimiza vizinhas** com nome "???" mas mantém métricas reais

### Exemplo:
Se "Alpha Capital" está em #4 no ranking:
- Linha 1: Firm #1 (??? mas com métricas reais)
- Linha 2: Firm #2 (??? mas com métricas reais)  
- Linha 3: Firm #3 (??? mas com métricas reais)
- **Linha 4: Alpha Capital #4** (destacado com nome e métricas reais)
- Linha 5: Firm #5 (??? mas com métricas reais)

**Métricas mostradas**:
- **Favorites**: Coluna H do CSV (Current Week)
- **Revenue**: Coluna E do CSV (Revenue Generated)  
- **Visits**: Coluna N do CSV (% Share)
- **Rating**: Valor calculado automaticamente

## Estrutura de Arquivos Gerados

```
output/
└── dashboards/
    ├── Funding_Pips.png
    ├── FTMO.png
    ├── MyForexFunds.png
    └── ...
```

## Troubleshooting

### Erro: "Server failed to start"
- Verifique se a porta 3001 está livre
- Certifique-se que o Next.js está instalado: `npm install`

### Erro: "Failed to parse CSV"
- Verifique o formato do CSV
- Remova caracteres especiais dos valores monetários ($, vírgulas)
- Use ponto (.) para decimais

### Screenshots vazios
- Aumente o timeout de espera
- Verifique se o servidor Next.js está rodando corretamente

## Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   CSV File  │────▶│  CSV Parser  │────▶│  Firm Data  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                 │
                                                 ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  PNG Files  │◀────│  Puppeteer   │◀────│  Next.js    │
└─────────────┘     └──────────────┘     │  Dashboard  │
                                          └─────────────┘
```

## Componentes Modificados

- `/app/dashboard/[firmId]/page.tsx` - Página especial para captura
- `/components/PopularityLeaderboardStatic.tsx` - Versão estática do ranking
- `/scripts/generate-dashboards.ts` - Script principal
- `/scripts/csv-parser.ts` - Parser e lógica contextual
- `/scripts/types.ts` - Definições TypeScript