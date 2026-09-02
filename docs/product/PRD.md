---
id: PRD-FINANCY-001
status: approved
business-need: BND-FINANCY-001
owner: Product + Engineering
---

# PRD — Financy

## Visão do produto

Financy é uma aplicação web pessoal para registrar receitas e despesas, organizá-las por categoria e consultar um resumo financeiro. A raiz (`/`) apresenta login para visitantes e dashboard para usuários autenticados.

## Personas

- **Visitante:** cria uma conta ou entra com e-mail e senha.
- **Usuário autenticado:** consulta e gerencia somente os próprios dados.
- **Avaliador:** verifica funcionalidades, isolamento, aderência técnica e visual.

## Jornadas essenciais

1. Visitante abre `/`, cria a conta e recebe uma sessão válida.
2. Usuário retorna, faz login e acessa o dashboard.
3. Usuário cria, lista, edita e exclui categorias próprias.
4. Usuário cria, lista, edita e exclui transações próprias associadas a categorias próprias.
5. Usuário encerra a sessão e volta ao login.

## Capacidades

| ID | Capacidade |
| --- | --- |
| CAP-01 | Identidade e sessão segura |
| CAP-02 | Organização por categorias próprias |
| CAP-03 | Registro de receitas e despesas próprias |
| CAP-04 | Resumo e navegação financeira |
| CAP-05 | Experiência responsiva fiel ao Figma |

## Requisitos funcionais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-AUTH-001 | Criar conta com nome, e-mail e senha | P0 |
| RF-AUTH-002 | Entrar com e-mail e senha | P0 |
| RF-AUTH-003 | Encerrar a sessão no cliente | P0 |
| RF-AUTH-004 | Obter o usuário autenticado | P0 |
| RF-CAT-001 | Criar categoria | P0 |
| RF-CAT-002 | Listar categorias do usuário | P0 |
| RF-CAT-003 | Editar categoria do usuário | P0 |
| RF-CAT-004 | Excluir categoria do usuário | P0 |
| RF-TXN-001 | Criar transação | P0 |
| RF-TXN-002 | Listar transações do usuário | P0 |
| RF-TXN-003 | Editar transação do usuário | P0 |
| RF-TXN-004 | Excluir transação do usuário | P0 |
| RF-DASH-001 | Exibir saldo, receitas, despesas e movimentações | P0 |
| RF-NAV-001 | Proteger rotas e direcionar por estado de autenticação | P0 |

## Requisitos não funcionais

| ID | Requisito | Critério |
| --- | --- | --- |
| RNF-TECH-001 | TypeScript | `typecheck` sem erros em ambos os projetos |
| RNF-TECH-002 | GraphQL | consultas e mutações da aplicação passam por `/graphql` |
| RNF-TECH-003 | Persistência | Prisma com SQLite configurado por `DATABASE_URL` |
| RNF-TECH-004 | Frontend | React e Vite sem framework fullstack |
| RNF-SEC-001 | Isolamento | nenhum ID de outro usuário pode ser lido ou alterado |
| RNF-SEC-002 | Credenciais | senha com Argon2id; JWT assinado e expirável |
| RNF-OPS-001 | Configuração | `.env.example` completo em cada aplicação |
| RNF-OPS-002 | CORS | origem permitida configurável por ambiente |
| RNF-QA-001 | Automação | lint, tipos, testes e build no CI |
| RNF-UX-001 | Fidelidade | implementação comparada com os nós Figma da tela |
| RNF-A11Y-001 | Acessibilidade | teclado, foco, rótulos e contraste nos fluxos críticos |

## Modelo conceitual

- Um usuário possui muitas categorias e transações.
- Uma categoria pertence a um único usuário.
- Uma transação pertence a um único usuário e a uma categoria do mesmo usuário.
- Uma transação possui tipo `INCOME` ou `EXPENSE`, valor inteiro em centavos e data de ocorrência.

## Estados e feedbacks obrigatórios

- Carregamento, vazio, sucesso e erro nas listagens.
- Erro de credenciais sem revelar se o e-mail existe.
- Validação de formulário junto ao campo e erro GraphQL global quando aplicável.
- Confirmação antes de exclusão destrutiva.
- Sessão expirada remove token e conduz ao login.

## Fora do escopo

Tudo listado como não objetivo no BND, paginação e filtros avançados. O avatar é opcional e não entra na branch de correção.

## Critério de liberação

O produto pode ser submetido quando todas as SPECs P0 estiverem concluídas, a matriz de rastreabilidade não tiver lacunas, o checklist de entrega estiver completo e o CI estiver verde.

## Mapa de SPECs

| Capacidade | Unidades de entrega |
| --- | --- |
| Fundação transversal | SPEC-001, SPEC-002, SPEC-012 |
| CAP-01 | SPEC-003, SPEC-004, SPEC-005 |
| CAP-02 | SPEC-006, SPEC-007 |
| CAP-03 | SPEC-008, SPEC-009 |
| CAP-04 | SPEC-010 |
| CAP-05 | SPEC-011 |
