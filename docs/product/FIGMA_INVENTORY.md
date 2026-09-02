---
id: FIGMA-FINANCY-001
status: blocked
owner: Frontend + Design
blocked-by: OPEN-UI-001
---

# Inventário Figma

## Fonte

- Arquivo: [Financy — Community](https://www.figma.com/design/ZJPY2R5yPCrZmq8cjUHk9n/Financy--Community-?node-id=0-1&m=dev)
- Protótipo: [fluxo inicial](https://www.figma.com/proto/ZJPY2R5yPCrZmq8cjUHk9n/Financy--Community-?node-id=915-685&p=f&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=915%3A685)
- Arquivo-chave: `ZJPY2R5yPCrZmq8cjUHk9n`
- Página disponibilizada: `0:1`
- Nó inicial do protótipo: `915:685`

## Evidências obtidas

| Nó | Nome | Uso |
| --- | --- | --- |
| `915:685` | Thumbnail | Capa do projeto |
| `928:587` | Cover | Capa “Financy — Desafio de pós-graduação” |

A prévia da capa evidencia navegação com Dashboard, Transações e Categorias; cartões de saldo, receitas e despesas; lista de transações; lista de categorias; e ação “Nova transação”. Esses elementos são evidência de direção, não medidas implementáveis sem os nós das telas.

## Tokens observados na capa

| Token Figma | Valor |
| --- | --- |
| gray-950 | `#E1E1E6` |
| white | `#FFFFFF` |
| gray-800 | `#8D8D99` |
| gray-300 | `#202024` |
| FTR purple | `#5E55C2` |
| Tipografia | Plus Jakarta Sans |

Os tokens finais do produto devem ser extraídos da página **Style Guide**; estes valores não autorizam completar por suposição o tema inteiro.

## Pendência bloqueadora

`OPEN-UI-001`: os links fornecidos expõem a página “Sobre” e a capa, mas não retornam os nós diretos das seis páginas e dos dois dialogs mencionados no desafio. O arquivo lista as páginas `🚀 Sobre`, `💻 Projeto` e `🎨 Style Guide`; na visualização anônima da Community, selecionar **Projeto** continua mostrando apenas as layers Thumbnail/About (`node-id=0-1`). Antes da SPEC-011, fornecer links Dev Mode com `node-id` para login, cadastro, dashboard, transações, categorias, sexta página e ambos os dialogs — em geral após duplicar o arquivo na conta Figma.

Não inventar a sexta página, medidas, variantes ou estados. Enquanto a pendência estiver aberta, a fundação visual usa apenas tokens provisórios claramente isolados em CSS.

Decisão de produto (2026-09-01): as SPECs 007, 009 e 010 implementam o CRUD e o resumo funcional com esses tokens provisórios. A SPEC-012 segue a entrega com a mesma pendência. A comparação com os nós Figma continua bloqueada em `OPEN-UI-001` / SPEC-011.

## Procedimento por tela

1. Abrir o link direto do nó com o MCP oficial do Figma.
2. Capturar contexto e screenshot do mesmo nó.
3. Mapear tokens e assets reais antes do JSX.
4. Implementar responsividade e estados não representados sem alterar a hierarquia visual.
5. Comparar screenshot local e Figma em desktop e mobile; registrar diferenças aceitas.
