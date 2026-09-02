# Convenções

- Código, nomes e commits em inglês; documentação de produto em português.
- TypeScript estrito, ESM e imports explícitos conforme o pacote.
- Arquivos por feature; componentes React em PascalCase, demais arquivos em kebab-case quando criados.
- GraphQL: `Query` para leitura, `Mutation` para escrita, inputs específicos e outputs não nulos quando garantidos.
- Um commit deve representar uma intenção; formato recomendado `type(scope): summary`.
- Dependências sempre com versão exata e alteração justificada.
- Não adicionar abstrações, bibliotecas ou diretórios “para o futuro”.
- Comentários explicam o porquê; nomes e testes explicam o quê.
- Toda alteração de comportamento atualiza docs, SPEC e testes relevantes.
