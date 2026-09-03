---
id: FIGMA-FINANCY-001
status: completed
owner: Frontend + Design
---

# Inventário Figma

## Fonte canônica (cópia do Community)

Arquivo enviado em 2026-09-01, dono visível `WillRohvedder`:

- Arquivo Dev Mode: [Financy — Community](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=0-1&m=dev)
- Arquivo-chave: `Sj0a8DSgyFq1tbAUyLadwz`

O Community original (`ZJPY2R5yPCrZmq8cjUHk9n`) permanece como origem pública; a implementação usa a cópia acima.

## Páginas

| Nó | Página | Link |
| --- | --- | --- |
| `0:1` | 🚀 Sobre | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=0-1&m=dev) |
| `3:376` | 💻 Projeto | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3-376&m=dev) |
| `3:377` | 🎨 Style Guide | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3-377&m=dev) |

## Telas e dialogs (frames Auto layout, página Projeto)

Base: `https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=` + id com hífen + `&m=dev`.

| Nó | Nome | Tipo | Link |
| --- | --- | --- | --- |
| `3107:3489` | Acesso | Section (login + cadastro) | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3107-3489&m=dev) |
| `3101:353` | Login | Tela | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3101-353&m=dev) |
| `3103:1915` | Cadastro | Tela | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3103-1915&m=dev) |
| `3103:1987` | Dashboard | Tela 1280×800 | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3103-1987&m=dev) |
| `3104:362` | Transações | Tela | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3104-362&m=dev) |
| `3104:2028` | Categorias | Tela | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3104-2028&m=dev) |
| `3104:2925` | Perfil | Sexta página do arquivo | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3104-2925&m=dev) |
| `3107:3599` | Gestão | Section com os dois overlays | [abrir](https://www.figma.com/design/Sj0a8DSgyFq1tbAUyLadwz/Financy--Community-?node-id=3107-3599&m=dev) |

Os overlays de **Nova transação** e **Nova categoria** estão nas artboards da seção Gestão (dashboard e categorias com modal aberto). Os nós de texto internos `3107:4985` e `3104:2494` não são o frame do dialog.

## Style Guide observado (`3:377`)

Inspeção visual da página Estilos/Componentes. Hex lidos dos swatches rotulados; o inspect Dev Mode de variáveis exportadas não esteve disponível sem PAT (`OPEN-UI-001` aceito).

| Token | Valor observado |
| --- | --- |
| Brand | `#184835`, `#125E3F`, `#229367` |
| Grayscale | `#161719` `#23262F` `#353945` `#777E90` `#B1B5C3` `#E6E8EC` `#F4F5F6` `#FCFCFD` `#FFFFFF` |
| Feedback | erro `#EF466F`, aviso `#FFD166`, sucesso `#45B36B` |
| Tipografia | Inter |
| Componentes | input default/foco/erro, botão primário verde, secundário, ghost, tags, ícones stroke |

A capa usa Plus Jakarta Sans; o Style Guide (Inter) prevalece na implementação.

## Decisão de produto (2026-09-02)

Seguir a SPEC-011 nas rotas obrigatórias. O PRD prevalece sobre o Figma nestes pontos:

| Figma | Entrega |
| --- | --- |
| Gráfico e orçamento no Dashboard | Omitidos; cartões de saldo/receitas/despesas e lista recente |
| Filtros na lista de transações | Omitidos |
| Página Perfil / avatar | Fora da branch obrigatória |
| Marca desenhada e ícones | Wordmark tipográfico; sem ícones recriados à mão |

## Encerramento

Capturas canvas × app versionadas em [visual/COMPARISON.md](./visual/COMPARISON.md) (2026-09-02). `OPEN-UI-001` aceito: sem exportação autenticada de variáveis CSS/SVG; tokens da entrega são os swatches rotulados.

## Procedimento por tela

1. Abrir o link direto do nó.
2. Capturar contexto e screenshot do mesmo nó.
3. Mapear tokens e assets reais antes do JSX.
4. Implementar responsividade e estados não representados sem alterar a hierarquia visual.
5. Comparar screenshot local e Figma em desktop e mobile; registrar diferenças aceitas.
