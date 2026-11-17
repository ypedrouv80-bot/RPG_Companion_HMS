# RPG Companion HMS 1.5.0 — Observador e Ativo compatível

Esta atualização responde ao problema em que uma cena antiga em Sharia/K416 voltava ao prompt durante um novo início de Mushoku. Também trata códigos de arco acompanhados de título e sinaliza contradições, em vez de adivinhar o arco pelo ano.

## Instalar

Atualize a extensão pelo repositório `ypedrouv80-bot/RPG_Companion_HMS` e reinicie/recarregue a extensão no Lumiverse. Alternativa: substitua somente a pasta `rpg_companion_hms/repo` pelo conteúdo deste repositório. Preserve `storage`; não copie configurações ou chats de outra pessoa. A versão mostrada deve ser 1.5.0.

O primeiro carregamento da atualização seleciona **Observador**. As configurações anteriores e os arquivos de campanha não são apagados. O seletor **Modo da extensão** permite escolher **Ativo**; no modo Ativo ele também fica em Settings → General. Nenhuma opção exige reinstalar a extensão.

## Observador (padrão)

- Lê o último HUD completo da campanha atual e mostra a mensagem/swipe de origem.
- Não acrescenta mensagens ou instruções ao prompt; macros de pedido, pensamentos e Chronicle ficam vazias.
- Não consulta a IA, não reescreve respostas, não fixa valores e não substitui o regex do card.
- Mostra somente linhas presentes no HUD. Não inventa recursos, idade, estado mental, NPCs ou datas; campos ocultos não reaparecem como valores atuais.
- Uma resposta sem HUD mantém a última leitura disponível, identificada como anterior. Um novo Start sem HUD fica aguardando, sem recuperar a cena antiga.
- **Atualizar leitura** relê o histórico sem gastar tokens. **Ignorar esta leitura rejeitada** oculta aquele conteúdo/swipe apenas do painel; uma edição ou outro swipe pode ser lido novamente. Isso não remove a mensagem do contexto do bot.

O painel Observador é deliberadamente uma leitura do HUD, sem os cálculos e ferramentas de simulação do painel Ativo.

## Ativo (escolha do usuário)

Mantém as ferramentas do painel, consultas e ações manuais. Operações manuais que geram conteúdo, como Refresh, combate ou perguntas, continuam podendo usar IA e/ou escrever no chat conforme a ação escolhida.

Mudanças que valem para o modo Ativo:

- O interceptor não reinjeta cenas, resumos, pensamentos, recursos ou referências de lore em cache.
- A extensão não impõe HTML/JS, cores de diálogo, tags de mentira/percepção, tamanho de resposta ou estilo narrativo.
- **Optional companion JSON request**, desligado inicialmente, permite um pedido curto de fatos observáveis em um bloco opcional. Não é pedido durante Start, comandos de interface ou OOC puro. Uma mensagem com fala e OOC não é bloqueada somente por conter OOC.
- **Allow automatic separate extraction**, também desligado inicialmente, libera a chamada adicional de tracker se Separate mode e atualização automática também estiverem ligados. O Observador ignora essa opção.
- A leitura automática grava somente metadados; não recupera texto de raciocínio privado, não restaura linhas ocultas e não repara idade, arco ou outros valores silenciosamente. Edições manuais explícitas do painel continuam sendo ações do usuário.
- As antigas opções de lembretes/contexto/estilo não reativam a injeção antiga. Macros de pensamentos e Chronicle permanecem vazias; o histórico continua disponível no painel.

## Start, Continue e dados antigos

Um Start explícito no começo da mensagem (incluindo aliases Start/Begin Arc) estabelece uma nova fronteira para a leitura. A extensão passa a usar um namespace separado para o estado dessa campanha. O histórico e os arquivos anteriores continuam preservados. Um handler dentro de exemplo, citação ou bloco de código não é um Start.

Continue é diferente: um HUD completo fornecido como save pode estabelecer o estado da continuação. O modo Observador não importa automaticamente o histórico de outro chat por carry-over; usa as mensagens deste chat e o save fornecido. O modo Ativo mantém o carry-over explícito quando não há novo Start.

Alterar o comando inicial não apaga respostas já presentes depois dele. Para uma tentativa totalmente nova, envie um novo Start ou use um chat novo. Corrija/remova mensagens rejeitadas no chat: a extensão não pode impedir que o próprio host envie esse histórico ao modelo.

## Arcos e a imagem “Sandbox · Northern Adventurer”

O leitor reconhece `[MT-ARC:7]`, `[MT-ARC:7] — Northern Adventurer` e códigos de ramificação. Não infere um arco numerado apenas pelo ano quando há um código explícito, nem inventa uma data para o próximo arco.

Se o texto de origem contém `[MT-ARC:Sandbox] · Northern Adventurer`, há um conflito entre o código e o título. O painel mantém a fonte e avisa; não transforma Sandbox em Arc 7 sem uma correção do jogador. Memory 6 é um histórico anterior, não o número do arco atual. A imagem isolada não permite determinar quem criou originalmente a contradição.

## Limites e validação

Os testes cobrem as funções reais distribuídas: 168 verificações do leitor antigo, 253 de compatibilidade de HUD/regex, 56 verificações do backend completo em um host Spindle simulado e 10 asserções da interface em DOM simulado. Testes de sintaxe JavaScript também passaram. Comandos:

```text
node tests/six-sided-v251.cjs
node tests/six-sided-v253.cjs
node tests/observer-active.cjs
node tests/observer-ui.cjs
```

Não houve teste de geração no GLM nem sessão visual completa no Lumiverse. Não se promete fidelidade canônica de 100%. Instruções já existentes no preset do usuário, inclusive regras de OOC e `before_you_write`, não são removidas por esta extensão. Verifique o prompt exportado se o comportamento persistir.

Créditos originais e licença preservados: TenderTriper (Perch), Marinara, Wireless (Ryah), Pyropia e demais autores identificados no projeto. Adaptação de compatibilidade a pedido de Mazaki.
