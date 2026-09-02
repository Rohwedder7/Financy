# Estratégia de testes

## Pirâmide

- Unidade: regras puras, validação, cálculos monetários e componentes.
- Integração: resolvers/services com SQLite isolado e operações GraphQL reais.
- E2E: Playwright para jornadas críticas no navegador.

## Cenários inegociáveis

- Cadastro duplicado e login inválido.
- Token ausente, expirado e adulterado.
- Usuário A não lista, lê, edita ou exclui dados do usuário B.
- Categoria de B não pode ser usada em transação de A.
- Categoria em uso não pode ser excluída.
- Centavos e totais sem perda de precisão.
- Formulários operáveis por teclado; dialogs restauram foco.

## Isolamento

Testes de banco usam arquivo SQLite temporário por processo e migrations reais. O CI não depende de ordem ou de dados locais. Cada teste cria os próprios usuários e limpa somente seu banco temporário.

## Comandos de saída

`pnpm verify` é o portão local. `pnpm test:e2e` é obrigatório antes de marcar as SPECs de fluxo como concluídas. Falha intermitente deve ser investigada, não ocultada com retries locais.
