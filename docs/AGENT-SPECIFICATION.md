# Especificação de funcionário do ECO DOT

Este documento define o formato-alvo para converter diretrizes escritas em linguagem natural em uma configuração de funcionário revisável.

## Campos conceituais

- `name`: nome visível do funcionário.
- `role`: cargo ou especialidade.
- `mission`: objetivo principal.
- `directives`: texto original fornecido pelo administrador, preservado sem alterações silenciosas.
- `responsibilities`: resultados e deveres esperados.
- `tools_requested`: ferramentas que o texto solicita.
- `tools_granted`: ferramentas realmente concedidas pelo administrador.
- `autonomy_level`: assistida, rotinas autorizadas ou avançada dentro de limites explícitos.
- `approval_rules`: ações que exigem aprovação humana.
- `constraints`: limites, proibições e restrições.
- `model_preference`: modelo preferido ou seleção automática compatível.
- `status`: draft, needs_configuration, ready, running, paused ou error.

## Regra essencial

As ferramentas solicitadas nas diretrizes não são automaticamente concedidas. O sistema deve comparar pedidos com as capacidades instaladas e as permissões administrativas, mostrar diferenças e pedir confirmação antes de ativar o funcionário.

## Fluxo alvo

1. Receber o texto original.
2. Analisar e propor uma especificação estruturada.
3. Mostrar a especificação e os requisitos não atendidos.
4. Permitir edição humana.
5. Validar as permissões no backend.
6. Salvar uma versão do perfil.
7. Ativar somente após configurar e testar modelo, ferramentas e motor de execução.

## Estado atual

O formulário atual salva nome, cargo e diretrizes como rascunho no armazenamento local do navegador. A interpretação automática por modelo, versionamento no servidor, autenticação e execução ainda não foram implementados.
