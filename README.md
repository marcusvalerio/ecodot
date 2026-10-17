# ECO DOT

**Sua equipe de funcionários de IA, configurada por diretrizes.**

O ECO DOT está sendo desenvolvido para permitir que você crie funcionários digitais, defina responsabilidades por linguagem natural, revise uma especificação estruturada e conecte modelos e ferramentas com permissões explícitas.

## Implementado

- Dashboard responsivo em português e tela de login.
- Sessões assinadas em cookie HttpOnly, com expiração.
- Autenticação de usuário e senha com hash scrypt.
- Banco PostgreSQL via Neon.
- Funcionários persistidos no servidor, com isolamento por proprietário nas rotas de leitura, edição e exclusão.
- Importação/exportação JSON de perfis locais.
- Análise de diretrizes em modo local ou via endpoint compatível com OpenAI, quando configurado.
- Proteção da análise de diretrizes por sessão autenticada.
- Endpoint administrativo para listar/criar usuários, com registro de auditoria.
- Modelo de dados para usuários, funcionários, tarefas e auditoria.
- GitHub Actions para validação de tipos, lint e build.

## Limitações importantes

- Ainda não há motor de execução de computador/navegador conectado. Salvar um funcionário não significa que ele já execute tarefas.
- A análise local é heurística, não uma interpretação por LLM.
- Para análise por IA, configure `AI_BASE_URL`, `AI_API_KEY` e `AI_MODEL` no servidor.
- O gerenciamento de usuários existe como API administrativa; a tela de administração de usuários ainda precisa ser construída.
- É necessário testar a compilação e o fluxo de login no ambiente publicado antes de considerar o MVP validado.
- Perfis importados/exportados localmente não sincronizam automaticamente com o banco até serem salvos por meio da interface.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` no desenvolvimento. Nunca publique valores reais no Git.

- `DATABASE_URL`: conexão PostgreSQL.
- `ECO_SESSION_SECRET`: segredo aleatório longo para assinatura de sessões.
- `ECO_ADMIN_USERNAME` e `ECO_ADMIN_PASSWORD`: credenciais iniciais do administrador, criadas no primeiro login válido.
- `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`: opcionais; endpoint compatível com OpenAI Chat Completions.

Na Vercel, configure as variáveis em Environment Variables. Após alterar variáveis, faça um novo deployment.

## Executar localmente

Requisitos: Node.js 20.9+.

```bash
npm install
npm run dev
```

## Modelo de dados

A migração inicial está em `database/migrations/001_initial_schema.sql`. Ela define `eco_users`, `eco_agents`, `eco_tasks` e `eco_audit_log`.

## Segurança

- Segredos são mantidos no servidor; não use o prefixo `NEXT_PUBLIC_` para credenciais.
- A API de análise de diretrizes exige sessão autenticada.
- As diretrizes não concedem ferramentas automaticamente.
- Ações externas, financeiras ou irreversíveis devem exigir aprovação quando o motor de execução for integrado.
- Antes de uso público, adicionar rate limiting no login, recuperação de senha, rotação de credenciais, testes de isolamento e auditoria de permissões.
