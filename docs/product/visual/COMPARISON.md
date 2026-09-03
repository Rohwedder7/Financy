---
id: FIGMA-COMPARE-001
status: completed
captured: 2026-09-02
source: Sj0a8DSgyFq1tbAUyLadwz
---

# Comparação visual Figma × implementação

Capturas da cópia canônica (`node-id` na URL) e das rotas locais em 1280×800, em 2026-09-02. `OPEN-UI-001` aceito: canvas comparado; sem inspect Dev Mode de variáveis exportadas.

## Pares

| Nó | Tela | Figma | App |
| --- | --- | --- | --- |
| `3:377` | Style Guide | [figma](./figma/style-guide.png) | tokens em `frontend/src/theme/style-guide.ts` |
| `3101:353` | Login | [figma](./figma/login.png) | [app](./app/login.png) |
| `3103:1915` | Cadastro | [figma](./figma/cadastro.png) | [app](./app/cadastro.png) |
| `3103:1987` | Dashboard | [figma](./figma/dashboard.png) | [app](./app/dashboard.png) |
| `3104:362` | Transações | [figma](./figma/transacoes.png) | [app](./app/transacoes.png) |
| `3104:2028` | Categorias | [figma](./figma/categorias.png) | [app](./app/categorias.png) |
| `3107:3599` | Dialogs (Gestão) | [figma](./figma/gestao.png) | [transação](./app/dialog-transacao.png), [categoria](./app/dialog-categoria.png) |

## Desvios aceitos (PRD prevalece)

| Observado no Figma | Entrega |
| --- | --- |
| Logotipo ilustrado e ícones stroke | Wordmark tipográfico; sem ícones recriados |
| Título de login “Fazer login” | Heading e botão **Entrar** (jornada e testes já estáveis) |
| Esqueci senha / lembrar-me | Fora do PRD obrigatório |
| Gráfico, orçamento e filtros | Omitidos |
| Página Perfil / avatar | Fora da branch obrigatória |
| Nav “Contas” / sexta rota | Não implementada |

## Limitação aceita

`OPEN-UI-001`: as capturas são do canvas, não do inspect de variáveis. Hex da entrega vêm dos swatches rotulados do Style Guide.
