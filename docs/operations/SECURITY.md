# Segurança

## Modelo de ameaça resumido

Ativos: credenciais, JWTs, categorias e transações. Fronteiras: navegador/API e API/SQLite. Ameaças prioritárias: IDOR, roubo de token por XSS, força bruta, vazamento em logs e configuração insegura.

## Controles

- Argon2id com parâmetros definidos e testados para senhas.
- JWT de curta duração, segredo validado na inicialização (recusa o placeholder do `.env.example`) e claims mínimas. Algoritmo pinado em HS256; token sem `exp` ou com vida maior que a sessão curta é recusado.
- Token em `sessionStorage`: reduz persistência após fechar a aba, mas continua exposto a XSS; por isso evitar HTML não confiável e dependências supérfluas.
- CORS com origem explícita; nunca `*` com credenciais.
- Rate limit em cadastro/login e validação de inputs. O contador é por IP do cliente e vive na memória do processo: zera a cada reinício e, atrás de um proxy reverso sem `trust proxy`, agruparia todos os clientes num só balde. Aceitável para a entrega de instância única.
- Mensagens de erro seguem lista de permissão invertida: só texto escrito pela aplicação chega ao cliente. Ver `GRAPHQL_CONTRACT.md`.
- Consultas por recurso sempre combinam `id` e `userId` autenticado.
- Erro genérico para recurso alheio e credenciais inválidas.
- Logs estruturados sem senha, token, hash ou payload financeiro completo.
- Introspection GraphQL ligada fora de `production`; em produção o schema não é enumerável.

## Segredos

Somente chaves aparecem em `.env.example`. `.env`, bancos e relatórios são ignorados. Revogue imediatamente um segredo publicado e reescreva o histórico quando necessário.

## Checklist de revisão

- Procurar inputs `userId` e acessos Prisma sem filtro de proprietário.
- Executar os testes usuário A/B.
- Revisar dependências e lockfile.
- Confirmar que respostas de produção não incluem stack traces.
