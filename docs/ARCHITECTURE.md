# ECO DOT — arquitetura inicial

## Princípio

Separar o produto (identidade, usuários e funcionários) do modelo de IA e do motor que executa ações. Isso permite trocar provedores e motores sem reconstruir a interface.

## Camadas planejadas

1. Web: dashboard, criação por diretrizes, conversa, status e administração.
2. API: autenticação, autorização, validação, perfis, tarefas e auditoria.
3. Especificação de agente: estruturar diretrizes sem permitir que elas concedam permissões.
4. Interface de provedores de modelos.
5. Adaptador independente para motores como invisible_dots ou alternativas.
6. Workers isolados para navegador, arquivos, terminal e ferramentas.
7. Persistência para usuários, versões de diretrizes, conversas, tarefas, eventos e aprovações.

## Estado da implementação

A interface inicial é um protótipo. Perfis ainda não são persistidos em banco e não existe execução real de agentes.

## Segurança

- Autorização no servidor.
- Isolamento por usuário e funcionário.
- Segredos apenas no servidor.
- Aprovação para ações sensíveis.
- Limites de uso e tempo.
- Logs sem segredos.
- Não declarar recurso operacional antes de teste real.
