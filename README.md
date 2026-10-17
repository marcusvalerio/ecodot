# ECO DOT

**Sua equipe de funcionários de IA, configurada por diretrizes.**

O ECO DOT está sendo desenvolvido para permitir que você crie seus próprios funcionários de IA: defina nome e cargo, cole as diretrizes elaboradas com o ChatGPT, revise o perfil e, futuramente, conecte modelos, ferramentas e motores de execução.

## O que existe nesta primeira etapa

- Dashboard responsivo em português.
- Perfis de referência para demonstrar o conceito.
- Criação de funcionários personalizados a partir de diretrizes coladas.
- Salvamento de rascunhos no armazenamento local do navegador.
- Busca, visualização, edição, exclusão e cópia das diretrizes de perfis criados.
- Documentação inicial de produto e arquitetura.
- Estados operacionais explícitos: o sistema não finge que um perfil já executa tarefas.

## Limitações atuais

- Os perfis personalizados ficam no navegador em que foram criados; ainda não sincronizam entre dispositivos.
- Não há autenticação nem gestão multiusuário.
- Não há banco de dados conectado.
- Ainda não há integração com modelos de IA, navegador autônomo, computador virtual, ferramentas ou execução de tarefas.
- Os perfis de referência são exemplos estáticos, não agentes ativos.
- Build e testes precisam ser executados num ambiente com dependências instaladas.

## Executar localmente

Requisitos: Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

Verificações disponíveis:

```bash
npm run typecheck
npm run lint
npm run build
```

## Próximas etapas

1. Executar build, lint e checagem de tipos e corrigir problemas.
2. Implementar autenticação e persistência compartilhada.
3. Transformar diretrizes em uma especificação validada com missão, responsabilidades, ferramentas, autonomia e limites.
4. Adicionar seleção de modelo por uma camada de provedores.
5. Auditar e integrar um motor de execução, em vez de simular capacidades.
6. Implementar tarefas assíncronas, eventos, aprovações e logs.
7. Testar isolamento entre usuários e permissões.

## Segurança

Diretrizes em linguagem natural não concedem privilégios por si mesmas. Permissões devem ser validadas no backend; segredos ficam no servidor; ações sensíveis exigem aprovação conforme a política configurada.
