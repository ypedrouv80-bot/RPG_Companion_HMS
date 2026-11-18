# HMS 1.5.3 — Leitores dos cartões de HUD

- Preserva a leitura completa de seções separadas por --- até o fechamento *** (correção 1.5.2).
- Magia: aceita Earth Imperial, Earth (Imperial), Earth: Imperial e Earth — Imperial; remove emojis dos nomes antes de comparar ranks.
- Combate: valida os cartões finais com Sword Style/Sword Styles, separadores e ranks dos formatos antigo e novo.
- Localização: Location sem setas funciona também com Date: K410; não depende mais do cabeçalho Armored Dragon Calendar. Sem localização explícita, continua desconhecida.
- Família: pai/mãe, irmãos, avós e descendentes em português são organizados na geração correspondente, além dos termos em inglês. Não cria parentes nem muda a persona.
- Capítulos: o modo Ativo volta a acompanhar as respostas. Um histórico sem capítulos recebe um capítulo aberto a partir do primeiro HUD da campanha ao recarregar. Fronteiras automáticas seguem as opções existentes. Resumo não é fabricado a partir do HUD: use Encerrar capítulo e resumir (chamada ao modelo). Observador continua sem chamadas e sem alterações nas mensagens.

## Instalação
Atualize a extensão no Lumiverse pelo GitHub ou importe este ZIP como atualização da extensão existente; reinicie/recarregue o runtime. Versão esperada: 1.5.3. Os dois formatos de HUD continuam aceitos; não precisa reescrever o bot para usar a extensão.

## Validação
618 verificações automatizadas: leitores antigos/atuais, HUD completo enviado pelo usuário, cartões reais de magia/técnicas com catálogo de teste, capítulos e árvore de família. Sintaxe dos dois bundles verificada. Testes com host/DOM simulados, sem afirmar teste visual em uma sessão Lumiverse real ou execução de resumo por modelo.

Créditos originais preservados no manifesto e arquivos do projeto.
