# Skills do projeto

Skills são playbooks versionados em `.claude/skills/*/SKILL.md`. Elas coordenam uma tarefa recorrente; não armazenam segredos nem substituem os requisitos.

| Skill | Quando usar | Saída |
| --- | --- | --- |
| `create-spec` | transformar uma necessidade aprovada em unidade pequena | SPEC planejada/ativa |
| `implement-spec` | executar uma SPEC aprovada | código, testes e evidências |
| `review-spec` | revisar um diff contra aceite e segurança | achados priorizados |
| `verify-project` | fechar uma implementação | relatório dos gates |

## Instalação e manutenção

As skills já vivem no repositório; abrir Claude Code na raiz é suficiente para descoberta conforme a versão instalada. Antes de instalar skills externas, leia todos os arquivos, confirme procedência e faça a mudança em PR próprio.

## Ordem de autoridade

Requisitos do desafio e decisões humanas prevalecem sobre `CLAUDE.md`; este prevalece sobre skill local; skill local prevalece sobre sugestão do modelo. Em dúvida de produto, parar e perguntar.
