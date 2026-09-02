---
id: BR-FINANCY-001
status: approved
owner: Product + Engineering
source: PRD-FINANCY-001
---

# Regras de negócio

## Autenticação e autorização

| ID | Regra |
| --- | --- |
| BR-AUTH-001 | E-mail é normalizado em minúsculas, sem espaços laterais, e deve ser globalmente único. |
| BR-AUTH-002 | Senhas nunca são armazenadas ou registradas em texto puro; usar Argon2id. |
| BR-AUTH-003 | Login inválido retorna mensagem genérica, independentemente de e-mail ou senha. |
| BR-AUTH-004 | O JWT contém apenas identificadores necessários, possui expiração curta e é assinado com `JWT_SECRET`. |
| BR-AUTH-005 | A senha exige no mínimo 8 caracteres; comprimento prevalece sobre composição obrigatória, conforme NIST 800-63B. |
| BR-AUTH-006 | Cadastro e login aceitam no máximo 10 tentativas por minuto por origem. |
| BR-SEC-001 | A identidade efetiva vem exclusivamente do JWT verificado, nunca de `userId` enviado pelo cliente. |
| BR-SEC-002 | Toda leitura e escrita protegida inclui o `userId` autenticado no predicado do banco. |
| BR-SEC-003 | Recurso inexistente ou pertencente a outra conta produz o mesmo erro `NOT_FOUND`. |
| BR-SEC-004 | Inputs públicos de categorias e transações não expõem `userId`. |

## Categorias

| ID | Regra |
| --- | --- |
| BR-CAT-001 | Nome de categoria é obrigatório, normalizado nas extremidades e único por usuário sem distinção de caixa. |
| BR-CAT-002 | Uma categoria só pode ser lida, alterada ou excluída por seu proprietário. |
| BR-CAT-003 | Categoria referenciada por transações não pode ser excluída; retornar `CATEGORY_IN_USE`. |
| BR-CAT-004 | Cor, quando usada, deve ser uma cor hexadecimal válida definida pelo contrato. |

## Transações e valores

| ID | Regra |
| --- | --- |
| BR-TXN-001 | O valor é obrigatório, positivo e persistido como inteiro em centavos. |
| BR-TXN-002 | O tipo é exatamente `INCOME` ou `EXPENSE`. |
| BR-TXN-003 | A categoria associada deve pertencer ao mesmo usuário da transação. |
| BR-TXN-004 | A data representa a ocorrência informada; armazenamento e transporte usam ISO 8601. |
| BR-TXN-005 | Descrição não pode ficar vazia após normalização. |
| BR-MONEY-001 | Nenhum cálculo monetário usa ponto flutuante; saldo = receitas − despesas em centavos. |

## Listagens e dashboard

| ID | Regra |
| --- | --- |
| BR-LIST-001 | Categorias são ordenadas por nome e transações por data decrescente, com desempate por criação. |
| BR-DASH-001 | Totais consideram exclusivamente transações do usuário autenticado. |
| BR-DASH-002 | Estado sem transações apresenta totais zero, não erro ou valores nulos. |

Alterar uma regra exige atualizar sua SPEC, testes e `TRACEABILITY.md`.

## Razões, exemplos e exceções

- Regras `BR-SEC-*` existem para impedir IDOR: possuir o UUID de outra conta nunca é autorização. Exemplo inválido: `updateCategory(idDeB)` executado por A. Não há exceção administrativa neste escopo.
- `BR-MONEY-001` evita imprecisão binária. Exemplo válido: R$ 10,05 ↔ `1005`; inválido: persistir `10.05` em `Float`. Não há exceção.
- `BR-CAT-003` preserva integridade e histórico. Exemplo válido: orientar renomear a categoria; inválido: exclusão em cascata de transações. Não há exceção na branch obrigatória.
- Regras de normalização preservam a entrada exibível e comparam a forma normalizada. Exemplo inválido: permitir “Mercado” e “ mercado ” para o mesmo usuário.

As demais regras derivam diretamente dos requisitos CRUD e de isolamento do desafio; suas provas específicas são descritas nas SPECs referenciadas pela matriz.
