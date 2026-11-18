# 1.5.1 — leitura de “Arco”, emojis e aviso de lorebook

Corrige o caso `Current Arc: 📖 Arco 2 — Home Tutor [Memory 1]`. O painel reconhece o arco 2 sem tratar Memory 1 como número de arco. Também aceita os rótulos `Arco:` e `Arco Atual:`, códigos MT-ARC, títulos e ramificações como 3-B. A linha de origem continua intacta.

O aviso antigo afirmava que não reconhecer uma chave na linha do HUD provava que o arco e suas missões estavam ausentes do prompt. Essa conclusão era incorreta: o host pode ativar referências por outras mensagens, chaves ou condições. A extensão agora diferencia **identificar o arco** de **confirmar quais entradas chegaram ao modelo**.

Quando reconhece um formato alternativo, mostra uma nota discreta com o identificador estável, por exemplo `[MT-ARC:2]`. Não exibe o alarme da imagem nem oferece substituir a linha completa por `Arc 2:`. Conflitos reais entre código e título continuam sendo sinalizados, sem correção automática. Um formato desconhecido pede conferência do prompt exportado, sem declarar que o lorebook está ausente.

Os modos Observador e Ativo da 1.5.0 permanecem selecionáveis. Atualize a extensão e reinicie/recarregue seu runtime. Não é necessário apagar chats, storage ou reinstalar o card. Esta correção não muda a data, localização ou eventos escritos pelo bot.

Validação local: 503 verificações — 168 do leitor, 253 de compatibilidade HUD/regex, 72 do backend em Spindle simulado e 10 de interface em DOM simulado. Inclui 16 novas verificações específicas da foto. Sintaxe aprovada; sem afirmação de teste visual completo no Lumiverse ou geração real no GLM.

O usuário informou que já resolveu o erro anterior “Runtime exited”; esta atualização foca na leitura e no aviso do World State, sem atribuir uma causa àquele erro.
