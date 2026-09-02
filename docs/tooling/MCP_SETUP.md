# MCPs recomendados

Instale apenas servidores necessários, fixe a origem e revise permissões. MCP é código com acesso ao ambiente: nunca aceite pacote homônimo desconhecido nem conceda escrita quando leitura basta.

## Essenciais

| MCP | Uso no Financy | Permissão mínima |
| --- | --- | --- |
| Figma oficial | Contexto, screenshots, tokens e assets dos nós fornecidos | leitura no arquivo do projeto |
| Context7 | Documentação atual e exemplos das bibliotecas | leitura pública |
| GitHub oficial | Issues, PRs, checks e repositório da entrega | repositório selecionado |

## Instalação orientativa no Claude Code

Os comandos mudam entre versões; confirme sempre na documentação oficial do provedor. Use o escopo do projeto quando a configuração for compartilhável e mantenha tokens fora do Git.

```bash
# Exemplos de formato — substitua pelos comandos/URLs oficiais vigentes
claude mcp add --transport http figma https://mcp.figma.com/mcp
claude mcp add --transport http context7 https://mcp.context7.com/mcp
claude mcp add --transport http github https://api.githubcopilot.com/mcp
claude mcp list
```

Se um endpoint ou fluxo OAuth tiver mudado, não improvise credenciais: consulte o fornecedor e atualize este documento em PR separado.

## Figma

1. Conecte o servidor oficial e autorize a conta com acesso ao arquivo.
2. Forneça links diretos Dev Mode com `node-id`, não apenas a capa.
3. Para cada tela, obtenha contexto e screenshot do mesmo nó.
4. Reuse assets retornados pelo servidor; não crie placeholders quando houver fonte real.
5. A pendência `OPEN-UI-001` em `FIGMA_INVENTORY.md` precisa ser resolvida antes da implementação fiel.

## Context7

Use para confirmar APIs e migrações da versão exata registrada no `package.json`. Consulte documentação primária e evite gerar código de versões diferentes.

## Superpowers

Superpowers é um conjunto comunitário de skills/workflows, não um MCP obrigatório do produto. Instale somente a partir do repositório oficial do autor, revise o conteúdo de cada skill e fixe uma revisão. Não execute um instalador remoto sem inspeção.

Fluxo seguro:

1. Verifique URL, mantenedor, licença e commit/release oficial.
2. Clone em diretório temporário e leia instruções e scripts.
3. Instale somente as skills úteis; não sobrescreva `.claude/` sem diff.
4. Registre versão e origem em um PR dedicado.
5. Remova a skill se ela conflitar com `CLAUDE.md` ou ampliar permissões.

As skills locais deste starter cobrem o fluxo essencial sem depender de Superpowers.
