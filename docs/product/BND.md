---
id: BND-FINANCY-001
status: approved
owner: Product
deadline: 2026-09-04
---

# BND — Financy

## Necessidade

Pessoas que controlam receitas e despesas em anotações dispersas não têm uma visão simples e privada de sua vida financeira. O desafio acadêmico também precisa demonstrar domínio integrado de React, GraphQL, TypeScript, Prisma e SQLite em uma entrega corrigível e reproduzível.

## Público

- Usuário individual que deseja registrar e consultar suas próprias finanças.
- Avaliador técnico que precisa instalar, executar e verificar o projeto localmente.
- Desenvolvedor que dará continuidade ao repositório com Claude Code.

## Evidências e baseline

O baseline disponível é o enunciado acadêmico: 24 itens obrigatórios no checklist, stack fixa e layout Figma como referência. Não foram fornecidos dados de uso, entrevistas ou custos operacionais; portanto, metas de adoção comercial seriam fictícias e não são usadas como critério. A primeira baseline técnica será a execução dos fluxos e do CI em clone limpo.

## Resultado desejado

Entregar um monorepo público, executável localmente, no qual cada usuário se autentica e administra exclusivamente suas categorias e transações. A interface deve reproduzir fielmente as telas fornecidas no Figma.

## Valor

- Uma fonte única para transações e categorias.
- Saldos e movimentações compreensíveis sem planilhas externas.
- Privacidade por padrão entre contas.
- Correção rápida por documentação, testes e comandos previsíveis.

## Indicadores de sucesso

| Indicador | Meta de aceite |
| --- | --- |
| Requisitos obrigatórios rastreados | 100% ligados a uma SPEC |
| Isolamento entre usuários | 100% dos cenários de IDOR automatizados passando |
| Fluxos críticos E2E | cadastro, login e CRUDs passando |
| Qualidade | lint, tipos, testes e build verdes no CI |
| Instalação | ambiente local iniciado apenas com README e `.env.example` |
| Fidelidade visual | telas aprovadas contra os nós Figma fornecidos |

## Restrições

- TypeScript em todo o código de aplicação.
- Backend GraphQL, Prisma e SQLite.
- Frontend React com Vite e GraphQL.
- CORS habilitado e configurável.
- Pastas obrigatórias `backend/` e `frontend/`.
- Entrega base sem funcionalidades opcionais; extras devem viver em branch separada.
- Prazo informado: sexta-feira, 4 de setembro de 2026.

## Não objetivos da entrega obrigatória

- Open banking, conciliação bancária ou importação de extratos.
- Compartilhamento de contas, múltiplas moedas ou parcelamento.
- Upload de avatar, notificações e relatórios avançados.
- Deploy de produção, microserviços ou aplicativo móvel.

## Riscos

| Risco | Tratamento |
| --- | --- |
| Links do Figma não expõem todas as telas internas | Bloquear implementação visual da tela sem link direto; registrar `OPEN-UI-001` |
| Escopo exceder o prazo | Implementar SPECs na ordem crítica e impedir extras na branch principal |
| Vazamento entre usuários | Identidade somente do JWT, filtros compostos e testes cruzados |
| Divergência documentação/código | Rastreabilidade e verificação de docs no CI |

## Stakeholders e donos

| Papel | Responsabilidade |
| --- | --- |
| Estudante/desenvolvedor | implementação, evidências e submissão |
| Avaliador da pós-graduação | aceite dos requisitos obrigatórios |
| Product owner do desafio | decisão sobre ambiguidades funcionais/visuais |
| Figma Community file owner | fonte dos layouts e style guide |

## Risco de não fazer

Sem a solução, o desafio não demonstra a integração obrigatória entre frontend e backend e o usuário continua sem uma visão privada e centralizada das movimentações. Sem harness e rastreabilidade, o maior risco é uma entrega aparentemente completa que falha em isolamento, reprodução local ou critérios de correção.

## Documentos derivados

- Produto: `PRD-FINANCY-001`.
- Regras: `BUSINESS_RULES.md`.
- Implementação: `SPEC-001` a `SPEC-012`.
