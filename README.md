# ECO DOT

**Sua equipe de funcionários de IA, configurada por diretrizes.**

O ECO DOT é uma plataforma para criar, configurar e gerenciar funcionários de inteligência artificial. Você prepara as diretrizes com o ChatGPT, cola no formulário de criação e salva o perfil para revisão.

## Estado atual

- Dashboard responsivo em português.
- Criação de funcionário por diretrizes em linguagem natural.
- Visualização dos perfis e seus estados.
- Arquitetura planejada para múltiplos provedores de IA e motores de execução.

**Limitação inicial:** ainda não há autenticação, banco persistente, conexão com modelos ou execução de agentes. Perfis novos são mantidos no estado da página e se perdem ao recarregar. Não exibimos perfis como operacionais antes dessas integrações serem implementadas e testadas.

## Desenvolvimento

Requisitos: Node.js 20.9+.

```bash
npm install
npm run dev
```

## Próximas etapas

1. Persistência de perfis e autenticação segura.
2. Estruturar diretrizes em missão, responsabilidades, ferramentas, autonomia e limites.
3. Abstração de provedores de modelos.
4. Adaptador para motor de execução, após auditoria técnica.
5. Execução assíncrona, eventos, logs e testes de isolamento.

## Segurança

Diretrizes em linguagem natural não concedem privilégios por si mesmas. Permissões devem ser aplicadas pelo backend, com aprovação para ações sensíveis.
