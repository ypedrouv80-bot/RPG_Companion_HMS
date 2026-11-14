# RPG Companion HMS 1.4.4 — compatibilidade com Six-Sided World 2.5.3 (HUD configurável)

Atualização preparada em 13/11/2026 a pedido de Mazaki, sobre a 1.4.3 (Six-Sided 2.5.1). A versão **1.4.4 é da extensão**; **2.5.3 é do bot**. O bot não foi alterado: o card, o lorebook (1.017 entradas), os 77 regexes e as 13 greetings ficam exatamente como vieram.

## O que mudou no bot e o que a extensão faz agora

A 2.5.3 escreve só as linhas que o jogador ligou. O padrão é **BASIC**: data e hora, estação, local, Condition, o código do arco (`Current Arc: [MT-ARC:8]`, sem o título) e Rudeus Mode. Bonds e os outros 14 grupos começam desligados e voltam com `[HUD BONDS = ON]`, `[HUD = FULL]` etc. O próprio card avisa que uma linha omitida está **oculta, não apagada**. A 1.4.3 não sabia disso. A 1.4.4 corrige:

- **Arco pelo código.** `[MT-ARC:8]` agora é lido como "Arc 8: University" (títulos do route registry do card), inclusive sub-arcos (`[MT-ARC:3-B]`) e `[MT-ARC:Sandbox]`. A 1.4.3 tratava o código como arco pessoal e caía no arco do calendário (no teste, mostrava o Arc 2 em vez do 8). Passar de "Arc 8: University [MT-ARC:8]" (2.5.1) para "[MT-ARC:8]" (2.5.3) no meio da campanha **não** abre um capítulo novo, e o aviso de arco que não bate com o lorebook deixou de disparar à toa com o código.
- **Linhas ocultas não são "linhas perdidas".** O guarda do HUD não marca como sumidas as linhas que as configurações escondem e não oferece "Restore". Isso importa porque restaurar recolocaria Bonds e nomes no HUD, que é justamente o que o BASIC quer evitar. Se um grupo estiver **ligado** e o bot esquecer a linha, o aviso continua. No lugar do aviso de restauração aparece uma nota: "N linhas ocultas pelas configurações de HUD do bot (BASIC)".
- **O painel guarda o último valor conhecido.** Mana, magia, idiomas, treino, equipamento, inventário, Bonds, identidade, políticas, dons, Dream Link, posição social e caminhos ativos continuam no painel (cartão do mundo, Você, Magia, Equipamento, Missões) com o último valor lido. Em World State eles aparecem em "Ocultas pelas configurações de HUD — último valor conhecido", em itálico. **Isso fica só na exibição:** a extensão não devolve essas linhas para a resposta, para o lore nem para o modelo. Cena, NPCs presentes, ferimentos detalhados e contagens canônicas mudam sozinhos, por isso não são mantidos.
- **Respostas a comandos de HUD sem HUD.** `[HUD SETTINGS]`, `[HUD HELP]`, `[HUD BONDS = OFF]`, `[HUD SHOW BONDS]`, `[HUD = PANEL]`, `[HELP]` e `Mushoku_Save` podem vir sem HUD, como o card permite. Isso não conta mais como "resposta sem WORLD STATE", e o painel continua mostrando o último HUD de verdade. `[HUD = SHOW]` pede o HUD, então continua sendo cobrado.
- **Leitura das configurações.** Os comandos do jogador são lidos em ordem e sem diferenciar maiúsculas. Comandos dentro de bloco de código ou escritos pelo bot não contam. As configurações também são lidas das `SAVE NOTES` de um save colado (perfil e grupos ON/OFF; save 2.5.3 sem configurações recomeça em BASIC) e da resposta do bot a `[HUD SETTINGS]`. A extensão só reconhece o modo 2.5.3 quando há sinal dele: a página-guia do HUD entre as greetings, um comando de visibilidade, um save 2.5.3 ou o arco só com código. Chats 2.5.1 e os outros bots continuam como antes.
- **Página-guia fora do construtor de jogo novo.** A 13ª greeting alternativa ("HUD — Choose what you see") é uma página OOC. A 1.4.3 a mostrava no construtor como página de modificadores ("IDENTITY", "BONDS", "Mushoku_Save"...), e eles iriam parar no comando de início. Agora ela fica fora do construtor, mas continua disponível como referência para o guia OOC.
- **Estilo.** Como o BASIC não imprime a linha `HUD Style`, o estilo vem do comando do jogador e agora também de `HUD Style:` dentro de um save colado. `[HUD = BASIC]`, `[HUD = FULL]` e `[HUD = SHOW]` não mudam o estilo.
- **Local curto.** O BASIC pode escrever `Location: A roadside shelter` sem setas. Em Mushoku, isso agora vale como local (um segmento), em vez de ficar vazio.
- **Upkeep.** Com IDENTITY desligado, o reparo automático não recoloca a linha Race. O aviso de treino não dispara com a linha de Training oculta.

Identificador `rpg_companion_hms`, permissões, autores e formato de armazenamento são os mesmos. Os dados dos chats existentes continuam valendo.

## Usar

1. Importe o card 2.5.3 (PNG ou JSON) como o próprio pacote do bot manda. Não ative uma segunda cópia do lorebook.
2. Atualize a extensão (abaixo) e recarregue o Lumiverse ou desative/ative a extensão. Confira **1.4.4** no painel de extensões.
3. Na campanha existente, envie:

```text
[HUD = BASIC]
[HUD = SHOW]
```

Para ter um painel dourado pequeno com habilidades, por exemplo: `[HUD = BASIC]`, `[HUD = PANEL]`, `[HUD SKILLS = ON]` e `[HUD = SHOW]`, na mesma mensagem e nessa ordem. O painel da extensão continua mostrando o que já foi lido antes, sem precisar ligar os grupos no HUD.

## Atualização

**Pelo GitHub:** o repositório é `https://github.com/ypedrouv80-bot/RPG_Companion_HMS` (o `spindle.json` aponta para ele). Se o Lumiverse instalou a extensão por esse endereço, use a atualização de extensões do próprio Lumiverse.

**Manual pelo ZIP:**
1. Feche o Lumiverse ou desative a extensão.
2. Faça backup da pasta `Lumiverse/data/extensions/rpg_companion_hms`.
3. Extraia o ZIP em `Lumiverse/data/extensions/`, substituindo os arquivos de `rpg_companion_hms/repo/`.
4. Preserve `rpg_companion_hms/storage/`, onde ficam os dados dos chats. O ZIP não traz storage.
5. Reabra o Lumiverse e confira a versão 1.4.4.

## Verificação

- `node tests/six-sided-v253.cjs`: **253 verificações, 0 falhas.** Os testes usam as funções reais do backend numa VM isolada, com os seis exemplos BASIC do próprio bot (LF e CRLF), o HTML gerado pelos 77 regexes reais, as 14 greetings e as chaves de arco do lorebook. O guarda é testado pelo `hmsProcessContent` real, com armazenamento simulado.
- `node tests/six-sided-v251.cjs`: os 168 testes da 1.4.3 continuam passando.
- O backend inteiro também foi carregado num ambiente simulado, e o painel e o cartão do mundo foram montados para um chat com greeting 2.5.3, HUD completo, HUD BASIC e uma resposta a `[HUD SETTINGS]`. Resultado: o painel usa o último HUD real, o arco é o 8 e mana e raça seguem no cartão. Na 1.4.3, o mesmo chat dava "resposta sem HUD", arco 2 e mana/raça vazios.
- Relatório: `docs/compatibility/six-sided-v253/tests.json`. Diferenças em relação à 1.4.3: `docs/compatibility/six-sided-v253/changes.diff`.

**Limites:** não houve sessão dentro do Lumiverse nem partida com modelo. A extensão lê as configurações a partir dos comandos e das respostas no chat. Como o próprio card diz, elas são instruções ao modelo, e a extensão não força o modelo a obedecer. O formato exato das `SAVE NOTES` e da resposta a `[HUD SETTINGS]` depende do modelo; a leitura aceita as formas comuns ("BONDS: OFF", "ON: SKILLS, MANA", "Field profile: CUSTOM"), mas pode não reconhecer outras. Nesse caso vale o que os comandos do jogador dizem. Os valores "último conhecido" são os da última resposta que mostrou a linha, e podem estar desatualizados se a história mudou algo sem mostrar.

Créditos originais preservados: TenderTriper (Perch), Marinara, Wireless (Ryah), Pyropia e os demais autores citados nos arquivos. Licença AGPL-3.0 mantida. As fixtures de teste vêm do card de Mazaki (Six-Sided World 2.5.3) e mantêm seus créditos no projeto de origem.
