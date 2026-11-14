# RPG Companion HMS 1.4.3 — compatibilidade com Six-Sided World 2.5.1

Atualização de compatibilidade preparada em 12/11/2026 a pedido de Mazaki, sobre o ZIP fornecido da HMS Edition 1.4.2 RC. A versão **1.4.3 é da extensão**; **2.5.1 é do bot**.

## Corrigido

- O leitor de World State aceita `### WORLD STATE [PANEL] ###` e `### WORLD STATE [COLLAPSED] ###`, além dos cabeçalhos antigos e Visual com 🌐/🌍. Isso resolve a incompatibilidade principal que impedia a detecção.
- A seleção de estilo reconhece `[HUD = COLLAPSED]`, `HUD: Collapsed`, o seletor do cabeçalho e `HUD Style:`. A extensão deixa Panel/Collapsed para o renderer do bot, evitando um segundo card por cima do painel.
- O parser lê os meses Themed (Deepfrost a Frostfall) e Familiar, mantendo datas Numbered/legadas. Não inventa dia ou hora quando o bot informa apenas um período aproximado.
- Compact lê `🌪️ Wind — Elementary` e outras habilidades com rank por nome, sem incorporar o travessão ao nome da escola. Os formatos curtos antigos continuam aceitos.
- Quando recebe HTML já produzido pelo renderer HMS, o leitor reconhece as linhas do painel e do painel recolhível. Essa leitura é somente de dados; não reescreve o HTML de origem.
- O adaptador de Mushoku recebe `Dream Link`, `Rudeus Mode`, `Guide`, `Season` e `Calendar Profile`, preservando valores como Replacement, Estranged e reserva 0. As linhas também continuam disponíveis no HUD genérico.

Os arquivos executáveis fornecidos são JavaScript legível em `dist/`; o ZIP de origem não continha um projeto de build separado. As correções foram aplicadas nesses arquivos e testadas diretamente. Identificador `rpg_companion_hms`, permissões, autores e estrutura de armazenamento permanecem iguais.

## Usar

Após recarregar a extensão no Lumiverse, abra a campanha e envie:

```text
[HUD = PANEL]
[HUD = SHOW]
```

O bot deve produzir o cabeçalho Panel e suas linhas atuais. Para recolher o painel, use `[HUD = COLLAPSED]`. Classic, Visual, Compact e Card continuam disponíveis. O modo Card usa o renderer da extensão; Panel/Collapsed usam os scripts do bot. A detecção de World State não depende de habilitar os antigos conversores HMS Calendar.

Esta atualização não exige trocar seu preset pelo HMS Reporter. As instruções históricas de preset nos guias antigos descrevem a configuração original da extensão; reconhecer o novo HUD independe dessa troca. Os demais recursos da extensão e suas configurações de geração/injeção não foram redesenhados neste patch.

## Atualização manual pelo ZIP

1. Feche o Lumiverse ou desative a extensão antes de substituir arquivos em outra instalação.
2. Faça backup da pasta atual `rpg_companion_hms`.
3. Extraia o ZIP de atualização em `Lumiverse/data/extensions/`, substituindo os arquivos dentro de `rpg_companion_hms/repo/`.
4. Preserve `rpg_companion_hms/storage/`. O ZIP de atualização **não inclui storage nem seus dados de chats**.
5. Reabra o Lumiverse ou desative/ative a extensão para carregar os novos arquivos. Confira a versão 1.4.3 no painel de extensões.

O pacote serve para atualizar a extensão existente com o mesmo identificador, sem criar uma segunda Companion. Não é um card de personagem nem um arquivo de World Info.

## Verificação

168 asserções locais aprovadas: detecção, offsets e limite da narrativa, modos Rudeus, estilos, calendário, habilidades, HTML produzido pelos regexes reais do bot, saves, classificação de mundos e sintaxe dos dois arquivos JavaScript. Os testes executam as funções reais do leitor em VM isolada, sem armazenamento, rede ou geração. Lookups externos de lore foram ausentes no teste do adaptador Mushoku. Relatório: `docs/compatibility/six-sided-v251/tests.json`; reprodução: `node tests/six-sided-v251.cjs`.

Não houve sessão de teste dentro do Lumiverse nem uma partida com modelo. Este patch não certifica todas as funcionalidades antigas da extensão, sua lógica de arcos, agendas ou combate. O escopo validado é leitura e apresentação compatíveis com o novo World State. Não altera o bot nem concede habilidades/personagens.

Créditos originais preservados: TenderTriper (Perch), Marinara, Wireless (Ryah), Pyropia e demais autores citados nos arquivos. Licença AGPL-3.0 mantida. Os fixtures de HUD/regex vêm do card de Mazaki e conservam seus créditos no projeto de origem.
