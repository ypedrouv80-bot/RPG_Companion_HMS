# 1.5.2 — World State completo

O leitor encerrava o HUD no primeiro `---`. O exemplo fornecido contém 37 linhas de estado, mas apenas seis eram lidas. Agora separadores internos são atravessados quando há campos de HUD até o `***` final. Um separador final antigo continua válido quando o trecho seguinte é narrativa. Texto, offsets e os dois Demon Eyes são preservados.

O cartão World State também deixa de omitir Training e blocos por aparecerem em outros cartões, e deixa de mostrar apenas linhas alteradas por padrão. O painel informa a quantidade de linhas lidas. Grupos continuam podendo ser recolhidos pelo usuário; campos não presentes no texto não são inventados.

Atualize a extensão para 1.5.2 e recarregue o runtime. Os modos Observador e Ativo continuam selecionáveis. Não é necessário apagar a campanha.

Validação: 587 verificações locais passaram, incluindo as 37 linhas do exemplo em LF/CRLF, os dois olhos, preservação de separadores finais antigos e exclusão da narrativa. Sem teste visual completo no Lumiverse ou geração no GLM.
