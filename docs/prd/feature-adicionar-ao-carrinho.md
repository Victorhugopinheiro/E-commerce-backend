# PRD — Adicionar uma unidade ao carrinho

> Tipo: PRD de feature · Data: 2026-11-26
> **Status:** Implementada
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Adicionar um produto ao carrinho passa a incluir **uma unidade por chamada**, para quem está logado e para o visitante. O número enviado no pedido deixa de ser a quantidade gravada. Se a mesma linha já existe, ela sobe 1. Se ainda não existe, nasce com quantidade 1.

O visitante continua num caminho próprio, separado de quem está logado, no mesmo desenho já usado ao remover um item. A entrada HTTP desta rota mantém as respostas que o carrinho já usa: 401 sem comprador, 400 com dado obrigatório faltando, 200 no sucesso e no erro de negócio, 503 quando o carrinho do visitante está indisponível.

## 2. Problema que resolve

Hoje a primeira inclusão grava a quantidade enviada, e a inclusão seguinte soma 1. Quem pede 5 na primeira chamada fica com 5; quem pede 5 de novo fica com 6. O adicionar também junta visitante e usuário logado num único carregamento, enquanto o remover já separa os dois caminhos e só trata carrinho de visitante indisponível no caminho do visitante.

Quem sofre: a loja, que não consegue prever quantas unidades entram, e quem implementa o carrinho, que mantém duas organizações diferentes para incluir e para tirar. O que passa a acontecer: cada chamada aceita inclui uma unidade, nos dois tipos de comprador, com tamanho e modelo ainda conferidos no catálogo.

## 3. Público-alvo

- Cliente com conta, já reconhecido na rota de carrinho.
- Visitante sem conta, já reconhecido na mesma rota.

A tela da loja fica de fora. Ela consome a resposta desta API.

## 4. Objetivo do recorte atual

Fazer o adicionar incluir sempre uma unidade, para conta e para visitante, separar esses dois caminhos como o remover já separa, e manter o contrato HTTP atual da rota de adicionar.

## 5. Funcionalidades

**Essenciais:**

- Cada adição aceita aumenta a linha em 1, inclusive quando a linha ainda não existe.
- O número enviado em `quantity` não é a quantidade gravada. Ele só precisa estar presente para a chamada seguir.
- Linha igual é o mesmo produto, o mesmo tamanho e o mesmo modelo. Tamanho ou modelo diferente é outra linha, e essa outra linha também nasce com 1.
- Tamanho e modelo continuam conferidos no catálogo, com as mensagens que essa conferência já devolve.
- `name` é opcional. Entra na linha nova. Numa linha que já existe, o nome guardado permanece.
- Visitante e usuário logado seguem caminhos separados. A indisponibilidade do carrinho do visitante só existe no caminho do visitante.
- A rota continua exigindo comprador identificado, `productId` e `quantity`, e repassa `size`, `model` e `name` quando vierem.

**Desejáveis:**

- Nenhum neste recorte. O que parecia desejável está em "Fora do escopo".

## 6. Fora do escopo

- Remover item, listar o carrinho e fechar compra.
- Estoque. Dá para incluir mesmo sem saldo.
- Gravar preço ou imagem na linha do carrinho.
- Mudar os status HTTP da resposta compartilhada do carrinho. Erro de negócio continua em 200. Indisponível continua em 503.
- Exigir que `quantity` seja um inteiro maior que zero. Zero e ausência continuam no 400. Número negativo e texto continuam presentes, e o valor deles é ignorado.
- Somar o número enviado a uma linha nova ou a uma linha existente.
- Juntar o carrinho do visitante ao entrar na conta.
- A tela da loja.
- Reescrever o PRD Compra sem conta. A regra 5 de lá diz que a primeira inclusão usa a quantidade enviada. Para o adicionar, esta feature vence. Aquele documento fica como está.

## 7. Regras de negócio

Decisões confirmadas na sessão:

- Regra 1: Cada chamada aceita inclui uma unidade. A linha nova fica com quantidade 1. A linha que já existe fica com a quantidade guardada mais 1.
- Regra 2: `quantity` presente não define a quantidade. O valor 5, o valor 10, um número negativo ou um texto só liberam a chamada. Quem decide a unidade é a Regra 1.
- Regra 3: `quantity` ausente, vazia ou zero recusa a chamada antes de mexer no carrinho, com a mensagem já usada nesta rota: "Produto não identificado".
- Regra 4: Duas linhas são a mesma quando o produto, o tamanho e o modelo coincidem, depois da conferência no catálogo e ignorando espaços nas pontas. Tamanho ausente só coincide com tamanho ausente. Modelo ausente só coincide com modelo ausente.
- Regra 5: O produto precisa existir. Tamanho e modelo seguem a conferência já usada na compra. Produto com tamanhos exige um tamanho da lista. Produto sem tamanhos recusa tamanho enviado. Produto com modelos exige um modelo cadastrado. Produto sem modelos recusa modelo enviado. Produto sem modelos e com preço que não é um número recusa com "Preço inválido".
- Regra 6: O nome não identifica a linha. Na linha nova, o nome enviado é guardado. Na linha que já existe, um nome novo não substitui o nome guardado.
- Regra 7: Preço e imagem resolvidos na conferência não são gravados na linha por esta feature.
- Regra 8: O visitante tem um caminho próprio. Quem está logado segue o caminho principal. Os dois aplicam as regras 1 a 7.
- Regra 9: Carrinho de visitante indisponível responde falha com indisponibilidade, sem devolver sucesso e sem trocar o carrinho por uma lista vazia. Esse caso não se aplica a quem está logado.
- Regra 10: A abertura do carrinho do visitante continua a regra já usada ao remover. Carrinho ausente com cookie já existente abre outro visitante e um carrinho vazio, e a unidade entra nesse carrinho novo. Sem cookie, o visitante atual recebe o carrinho vazio e a unidade.
- Regra 11: Sem comprador identificado, a rota responde 401 com "Usuário não identificado" e não altera carrinho.
- Regra 12: Conta que não existe responde "Usuário não encontrado" e não altera carrinho. Produto que não existe responde "Produto não encontrado" e não altera carrinho.
- Regra 13: Sucesso responde "Produto adicionado ao carrinho com sucesso" e devolve o carrinho já com a unidade incluída.
- Regra 14: Esta feature substitui, só no adicionar, a frase da regra 5 do PRD Compra sem conta que manda a primeira inclusão usar a quantidade enviada. Remover continua descendo 1.

## 8. Fluxos principais

### Fluxo 1 — Usuário logado inclui uma unidade

1. A pessoa já reconhecida como conta pede para adicionar um produto, com quantidade presente e, quando o produto exigir, tamanho e modelo.
2. A API confere se a conta e o produto existem, e confere tamanho e modelo no catálogo.
3. Se a linha ainda não está no carrinho, ela nasce com quantidade 1.
4. Se a linha já está no carrinho, a quantidade sobe 1 e o nome antigo permanece.
5. A API grava o carrinho da conta e devolve sucesso com esse carrinho.

### Fluxo 2 — Visitante inclui uma unidade

1. A pessoa já reconhecida como visitante pede para adicionar, com os mesmos dados do Fluxo 1.
2. A API abre o carrinho do visitante pela regra já usada ao remover.
3. A conferência de produto, tamanho e modelo é a mesma do Fluxo 1.
4. A unidade entra pela Regra 1.
5. A API grava o carrinho do visitante, renova o cookie do visitante e devolve sucesso com esse carrinho.

### Fluxo 3 — Dado obrigatório faltando

1. A chamada vem sem comprador, sem produto ou sem quantidade.
2. Sem comprador, a resposta é 401 e o carrinho não muda.
3. Sem produto ou sem quantidade, a resposta é 400 com "Produto não identificado". Se for visitante, o cookie do visitante é renovado mesmo nessa recusa. O carrinho não muda.

## 9. Critérios de aceite

- O usuário logado consegue incluir uma unidade de um produto válido e receber o carrinho atualizado.
- O visitante consegue incluir uma unidade e receber o carrinho atualizado, com o cookie de visitante renovado.
- O sistema deve gravar quantidade 1 na linha nova, mesmo quando o pedido envia outra quantidade.
- O sistema deve somar 1 na linha que já existe, mesmo quando o pedido envia outra quantidade.
- O sistema deve tratar tamanho ou modelo diferente como outra linha.
- O sistema não deve gravar o preço nem a imagem na linha.
- O sistema não deve alterar o nome de uma linha que já existe.
- O sistema não deve alterar o carrinho quando a conta não existe, o produto não existe ou tamanho e modelo são recusados.
- Quando faltar comprador, o sistema deve responder 401.
- Quando faltar produto ou quantidade, o sistema deve responder 400 com "Produto não identificado".
- Quando o carrinho do visitante estiver indisponível, o sistema deve responder 503 e não renovar o cookie.
- Quando o erro for de negócio e o carrinho do visitante estiver disponível, o sistema deve responder 200 com sucesso falso.

## 10. Stack

Node.js e TypeScript, Express, MongoDB com Mongoose, carrinho da conta no cadastro do usuário, carrinho do visitante no armazenamento já usado pelo visitante, reconhecimento de comprador já usado nas rotas de carrinho, conferência de tamanho e modelo já usada na compra, e a resposta HTTP de carrinho já usada ao remover e ao adicionar.

Nenhuma biblioteca nova.

## 11. Justificativa da stack

A feature só muda a regra de inclusão e a separação entre visitante e conta. A rota, o comprador, o catálogo, os dois carrinhos e a resposta HTTP já existem. Trocar de stack ou acrescentar serviço novo não ajuda esta regra.

## 12. Fases de construção

### Fase 1 — Conta

Objetivo: a inclusão de quem está logado passa a gravar uma unidade por chamada, com a conferência de catálogo que já existe.

Specs:

- Spec 01 — Incluir uma unidade no carrinho da conta

### Fase 2 — Visitante

Objetivo: o visitante ganha a mesma regra de unidade, no caminho próprio que o remover já usa, inclusive quando o armazenamento falha.

Specs:

- Spec 02 — Incluir uma unidade no carrinho do visitante

### Fase 3 — Entrada da rota

Objetivo: a rota de adicionar continua recusando quem não está identificado e quem não manda produto ou quantidade, e entrega o resultado das fases 1 e 2 na resposta de carrinho já existente.

Specs:

- Spec 03 — Entrada HTTP de adicionar ao carrinho

## 13. Specs funcionais detalhadas

> Cada spec deve ser autossuficiente: um agente de codificação vai ler SÓ esta spec (mais as dependências) para montar o plano técnico e implementar. Preencha todos os campos; se um não se aplica, escreva "Não se aplica" e o porquê.

### Spec 01 — Incluir uma unidade no carrinho da conta

- **Fase:** 1
- **Objetivo (o quê):** Uma chamada aceita de quem está logado deixa o carrinho da conta com uma unidade a mais na linha pedida.
- **Intenção (por quê):** A quantidade enviada não pode mais decidir o saldo da linha. Cada pedido de inclusão é um clique a mais, igual ao remover, que é um clique a menos. Quem lê só esta spec precisa aplicar essa regra na conta, sem olhar o visitante.
- **Contexto:** O carrinho da conta já é a lista de linhas guardada no cadastro do usuário. Remover já busca a conta, busca o produto, acha a linha pelo produto, tamanho e modelo, e grava a lista de volta. Adicionar hoje, na linha nova, grava a quantidade enviada e, na linha repetida, soma 1. Esta spec troca a linha nova para quantidade 1 e separa o caminho da conta do caminho do visitante. A Spec 02 cobre o visitante. A conferência de tamanho e modelo é a já usada na compra: produto com tamanhos exige tamanho da lista; produto sem tamanhos recusa tamanho; produto com modelos exige modelo cadastrado; produto sem modelos recusa modelo; produto sem modelos precisa ter preço numérico.
- **Atores:** Cliente com conta, já reconhecido como comprador desta chamada.
- **Descrição do comportamento:** A inclusão da conta não abre carrinho de visitante. A API busca a conta. Se ela não existe, responde falha "Usuário não encontrado" e para. Busca o produto. Se ele não existe, responde falha "Produto não encontrado" e para. Confere tamanho e modelo no catálogo. Se a conferência recusa, responde a mensagem dela e para. Monta a linha com o produto e com o tamanho e o modelo aceitos. Procura no carrinho uma linha igual. Se não houver, acrescenta uma linha com quantidade 1 e com o nome enviado, quando ele vier. Se houver, soma 1 à quantidade guardada e mantém o nome, o tamanho e o modelo que já estavam. Grava a lista na conta. Se a gravação não confirmar o carrinho, responde falha "Erro ao adicionar produto ao carrinho" e não diz que deu certo. Se gravar, responde sucesso "Produto adicionado ao carrinho com sucesso" e devolve o carrinho gravado.
- **Entradas e saídas:** Entram o comprador do tipo conta, o produto, a quantidade (só como presença), o tamanho opcional, o modelo opcional e o nome opcional. Sai sucesso com a mensagem e o carrinho, ou falha com uma mensagem e sem carrinho alterado. Não sai identificador de visitante neste caminho.
- **Dados/entidades envolvidos (conceitual):** Conta: identificador e carrinho. Linha do carrinho: produto, quantidade, tamanho opcional, modelo opcional, nome opcional. A quantidade desta spec é sempre um inteiro positivo depois de uma inclusão aceita. Preço e imagem não fazem parte da linha gravada aqui.
- **Estados e transições:** Carrinho sem a linha passa a ter a linha com quantidade 1. Carrinho com a linha passa a ter essa quantidade mais 1. Conta inexistente, produto inexistente, tamanho ou modelo recusado, ou gravação não confirmada: o carrinho permanece como estava.
- **Regras de negócio:** Regras 1, 2, 4, 5, 6, 7, 8, 12 e 13. A Regra 2 vale para o significado do número; a recusa por quantidade ausente é da Spec 03. A Regra 14 registra que a primeira inclusão não usa mais o número enviado.
- **Validações:** A conta precisa existir. O produto precisa existir. Tamanho e modelo precisam passar na conferência do catálogo. A quantidade numérica não é validada aqui: qualquer valor presente produz o mesmo efeito de uma unidade. Nome não é validado e não serve para achar a linha.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa logada pede para incluir um produto.
  2. A API recusa se a conta ou o produto não existem, ou se tamanho e modelo não passam no catálogo.
  3. A API inclui uma unidade na linha correspondente.
  4. A API devolve o carrinho da conta.
- **Casos de borda e erros:** Quantidade 5 na linha nova grava 1. Quantidade 5 numa linha que já tem 2 deixa 3. A mesma chamada com outro tamanho cria outra linha com 1, sem mexer na anterior. Nome novo numa linha existente é ignorado. Nome só na linha nova é guardado, inclusive texto vazio, se ele tiver sido enviado. Quantidade guardada que não é um número finito: a inclusão aceita deixa essa linha com quantidade 1, em vez de gravar um não-número. Falha inesperada no servidor responde "Erro no servidor" e não confirma inclusão. Este caminho não responde indisponibilidade de visitante.
- **Impacto no existente:** A primeira inclusão da conta deixa de gravar a quantidade enviada. O adicionar da conta deixa de compartilhar o carregamento com o visitante. Remover, listar e fechar compra não mudam. A mensagem de conta inexistente neste fluxo é "Usuário não encontrado", não "Produto não identificado".
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um cliente logado e um produto válido que ainda não está no carrinho, quando ele envia quantidade 4, então o carrinho fica com uma linha desse produto e quantidade 1.
  - Dado que essa linha já tem quantidade 2, quando ele adiciona de novo com quantidade 9, então a quantidade fica 3 e o restante da linha permanece.
  - Dado o mesmo produto com outro tamanho aceito pelo catálogo, quando ele adiciona, então surge uma segunda linha com quantidade 1.
  - Dado um produto que exige modelo e o modelo não vem, quando ele adiciona, então a API recusa com a mensagem da conferência e o carrinho não muda.
  - Dado um identificador de conta que não existe, quando a inclusão é pedida, então a resposta é falha "Usuário não encontrado".
- **Definição de pronto:** Inclusões aceitas da conta aumentam uma unidade por chamada, linha nova nasce com 1, e as recusas de conta, produto, tamanho e modelo não gravam carrinho.
- **Dependências:** Nenhuma. A rota que recebe o pedido é a Spec 03.
- **Fora do escopo desta spec:** Visitante, cookie, status HTTP, remover, estoque, preço e imagem na linha.

### Spec 02 — Incluir uma unidade no carrinho do visitante

- **Fase:** 2
- **Objetivo (o quê):** Uma chamada aceita de visitante deixa o carrinho dele com uma unidade a mais, ou falha sem fingir carrinho vazio quando o armazenamento não responde.
- **Intenção (por quê):** O visitante compra sem conta. A unidade incluída precisa ser a mesma regra da conta, mas o carrinho dele vive à parte e pode estar indisponível. Tratar isso no caminho da conta esconde a falha ou renova cookie no momento errado.
- **Contexto:** O visitante já é reconhecido nas rotas de carrinho. O carrinho dele já abre, grava e renova o prazo como no remover: se o cookie existia e o carrinho não está mais lá, nasce outro visitante com carrinho vazio; se não havia cookie, o visitante atual ganha um carrinho vazio; se o carrinho existe, ele é reaberto e o prazo renova. Armazenamento indisponível já responde a mensagem "Carrinho do visitante indisponível". A regra da unidade é a da Spec 01. Esta spec não muda essa abertura; ela inclui a unidade depois que o carrinho abre.
- **Atores:** Visitante sem conta, já reconhecido como comprador desta chamada.
- **Descrição do comportamento:** A inclusão do visitante não busca conta. A API abre o carrinho pela regra já usada ao remover e fica com o identificador de visitante que essa abertura devolveu, que pode ser novo. Busca o produto. Se ele não existe, responde falha "Produto não encontrado", devolve esse identificador para o cookie poder renovar, e não grava. Confere tamanho e modelo como na Spec 01. Se a conferência recusa, responde a mensagem dela, devolve o identificador e não grava. Aplica a mesma inclusão de uma unidade da Spec 01, inclusive nome só na linha nova. Grava o carrinho desse visitante. Sucesso responde "Produto adicionado ao carrinho com sucesso", o carrinho e o identificador de visitante usado na gravação. Se o armazenamento falha ao abrir ou ao gravar, a resposta é falha com indisponibilidade e a mensagem "Carrinho do visitante indisponível", sem identificador de visitante e sem sucesso.
- **Entradas e saídas:** Entram o comprador do tipo visitante, o produto, a quantidade como presença, o tamanho opcional, o modelo opcional e o nome opcional. Sai sucesso com mensagem, carrinho e o identificador de visitante desta abertura, ou falha de negócio com mensagem e esse identificador, ou indisponibilidade sem identificador. O identificador não é um campo para a tela; a Spec 03 decide o cookie e o corpo HTTP.
- **Dados/entidades envolvidos (conceitual):** Visitante: identificador opaco. Carrinho do visitante: as mesmas linhas da Spec 01, com prazo já usado hoje. A quantidade gravada segue a Regra 1.
- **Estados e transições:** Sem carrinho utilizável e com cookie antigo, nasce outro visitante, carrinho vazio, e a unidade entra nele. Sem cookie, o visitante atual passa a ter a linha. Com carrinho existente, a linha nova nasce com 1 ou a linha igual sobe 1. Indisponibilidade não cria visitante novo e não devolve carrinho vazio como se fosse sucesso.
- **Regras de negócio:** Regras 1, 2, 4, 5, 6, 7, 8, 9, 10, 12 e 13.
- **Validações:** As mesmas da Spec 01 para produto, tamanho e modelo. Não há conta para validar. A quantidade numérica não muda o resultado.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa sem conta pede para incluir um produto.
  2. A API abre o carrinho do visitante.
  3. A API recusa se o produto, o tamanho ou o modelo não passam, sem gravar a inclusão.
  4. A API inclui uma unidade e grava.
  5. A resposta leva o carrinho e o identificador de visitante desta abertura.
- **Casos de borda e erros:** Primeira inclusão com quantidade 8 grava 1. Inclusão repetida soma 1 e ignora o número enviado. Cookie existente com carrinho ausente: a unidade vai para o visitante novo, não para o identificador velho. Produto inexistente não grava e ainda informa o identificador aberto, para o cookie não ficar apontando para um visitante abandonado. Armazenamento fora do ar, carrinho ilegível ou falha ao gravar: indisponibilidade, sem sucesso e sem lista vazia no lugar. Falha que não é indisponibilidade responde "Erro no servidor". Quantidade guardada que não é um número finito fica 1 nesta inclusão aceita, como na Spec 01.
- **Impacto no existente:** O visitante deixa de ter a primeira inclusão com a quantidade enviada. O caminho dele deixa de passar pelo carregamento compartilhado com a conta. A abertura, o prazo e a mensagem de indisponibilidade continuam os já usados. Remover não muda.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um visitante com carrinho vazio e um produto válido, quando ele envia quantidade 6, então a linha fica com quantidade 1 e a resposta traz o identificador desse visitante.
  - Dado que a mesma linha já tem quantidade 1, quando ele adiciona de novo, então a quantidade fica 2.
  - Dado um cookie de visitante cujo carrinho já não existe, quando ele adiciona um produto válido, então a unidade entra num carrinho novo e a resposta traz o identificador novo.
  - Dado que o armazenamento do visitante não responde, quando ele adiciona, então a resposta é indisponibilidade com "Carrinho do visitante indisponível" e não é sucesso.
  - Dado um tamanho inválido para o produto, quando ele adiciona, então o carrinho não ganha a unidade e a falha ainda informa o identificador aberto.
- **Definição de pronto:** O visitante inclui uma unidade por chamada aceita, recebe o identificador correto nas falhas de negócio e recebe indisponibilidade quando o armazenamento falha.
- **Dependências:** Spec 01, pela regra da unidade, da linha e do nome. A abertura do carrinho do visitante já existe e é reutilizada, não redefinida.
- **Fora do escopo desta spec:** Status HTTP, texto do cookie, conta logada, remover, juntar carrinhos no login.

### Spec 03 — Entrada HTTP de adicionar ao carrinho

- **Fase:** 3
- **Objetivo (o quê):** A rota de adicionar recusa chamada incompleta e entrega o resultado da Spec 01 ou da Spec 02 na resposta de carrinho já usada hoje.
- **Intenção (por quê):** A regra da unidade mora nas specs anteriores. A rota precisa continuar reconhecível para quem já chama adicionar: mesmos dados, mesmas recusas de entrada e os mesmos status. Mudar 200 de erro de negócio para 404 quebraria o remover, porque os dois usam a mesma resposta.
- **Contexto:** A rota de adicionar já exige comprador resolvido, lê produto, quantidade, tamanho, modelo e nome, e devolve pela resposta compartilhada do carrinho. Sem comprador, responde 401 "Usuário não identificado". Sem produto ou sem quantidade, responde 400 "Produto não identificado" e, se for visitante, renova o cookie antes dessa resposta. A resposta compartilhada renova o cookie do visitante quando o resultado não é indisponibilidade, responde 503 na indisponibilidade e responde 200 no resto, sem colocar o identificador de visitante no corpo. Esta spec mantém esse contrato e passa a chamar a inclusão das specs 01 e 02.
- **Atores:** Cliente com conta e visitante, pela rota de adicionar. Quem não foi reconhecido como nenhum dos dois.
- **Descrição do comportamento:** Sem comprador, a rota responde 401 "Usuário não identificado" e não chama a inclusão. Sem `productId` ou sem `quantity`, responde 400 "Produto não identificado" e não chama a inclusão. Quantidade zero, vazia ou ausente cai nesse 400. Quantidade negativa, texto ou número maior que zero seguem adiante, porque só a presença importa. Se o comprador é visitante nessa recusa 400, o cookie dele é renovado com o identificador que já veio na chamada. Com os dados presentes, a rota entrega a chamada à inclusão da conta ou à do visitante, conforme o comprador, repassando produto, quantidade, tamanho, modelo e nome. O resultado volta pela resposta compartilhada: visitante sem indisponibilidade renova o cookie com o identificador devolvido pela inclusão, ou com o da chamada se a inclusão não devolver um; indisponibilidade responde 503 "Carrinho do visitante indisponível" e não renova cookie; qualquer outro resultado responde 200, com sucesso verdadeiro ou falso, mensagem e carrinho quando houver. O identificador de visitante não aparece no JSON.
- **Entradas e saídas:** Entram o corpo com produto, quantidade, tamanho opcional, modelo opcional e nome opcional, e o comprador já resolvido ou a ausência dele. Sai 401, 400, 503 ou 200, no formato já usado pelo carrinho. O cookie de visitante sai na recusa 400 de visitante e em todo 200 de visitante. Não sai no 401, no 503 e no caminho da conta.
- **Dados/entidades envolvidos (conceitual):** Os mesmos da Spec 01 e da Spec 02. Esta spec não cria entidade. Ela só decide se a inclusão pode começar e como a resposta sai.
- **Estados e transições:** Não se aplica à rota em si. O carrinho só muda quando a Spec 01 ou a Spec 02 grava. A recusa 400 e a recusa 401 não mudam linhas.
- **Regras de negócio:** Regras 2, 3, 8, 9, 11 e 13. As regras da linha são aplicadas pelas specs 01 e 02, não reimplementadas na entrada.
- **Validações:** Comprador presente. Produto presente. Quantidade presente no sentido já usado nesta rota: falta, vazio e zero recusam; os demais valores passam e não são convertidos em quantidade gravada. Tamanho, modelo e nome podem faltar aqui. A conferência deles, quando fizer sentido para o produto, é das specs 01 e 02.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa chama adicionar.
  2. A API recusa com 401 ou 400 se faltar comprador, produto ou quantidade.
  3. A API inclui uma unidade pela Spec 01 ou pela Spec 02.
  4. A API devolve 200 ou 503, e renova o cookie do visitante só quando a inclusão não veio como indisponível.
- **Casos de borda e erros:** Quantidade 0 responde 400 e não grava. Quantidade -1 ou um texto respondem como inclusão de uma unidade, se o resto for válido. Visitante com corpo incompleto recebe 400 e cookie renovado, mesmo sem carrinho alterado. Sucesso falso de produto inexistente sai em 200, com a mensagem da spec correspondente, e o visitante ainda renova o cookie. Indisponibilidade sai em 503, sem cookie novo e sem o identificador no corpo. Conta logada não recebe cookie de visitante. Falha "Erro no servidor" sai em 200, como os outros erros de negócio que não são indisponibilidade.
- **Impacto no existente:** A rota deixa de poder gravar a quantidade enviada, porque as specs 01 e 02 não usam esse número. Mensagens de 401 e 400, a renovação de cookie e os status 200 e 503 permanecem. Remover e listar continuam na mesma resposta compartilhada, sem mudança de status.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma chamada sem comprador, quando ela chega em adicionar, então a resposta é 401 "Usuário não identificado" e a inclusão não roda.
  - Dado um visitante sem quantidade, quando ele adiciona, então a resposta é 400 "Produto não identificado", o cookie é renovado e o carrinho não muda.
  - Dado um cliente logado e quantidade 3 num produto válido fora do carrinho, quando a rota responde, então o status é 200, o sucesso é verdadeiro e a quantidade da linha é 1.
  - Dado um visitante e o armazenamento indisponível, quando a rota responde, então o status é 503, o cookie não é renovado e o corpo não traz identificador de visitante.
  - Dado um produto inexistente para um visitante, quando a rota responde, então o status é 200, o sucesso é falso e o cookie é renovado.
- **Definição de pronto:** A rota aplica a unidade das specs 01 e 02 sem mudar o contrato de 401, 400, 200, 503 e do cookie do visitante.
- **Dependências:** Spec 01 e Spec 02. A resposta compartilhada do carrinho já existe e é reutilizada.
- **Fora do escopo desta spec:** Alterar a resposta compartilhada para o remover, validar inteiro positivo, devolver 404 para produto inexistente, gravar preço ou imagem.

## 14. Ordem recomendada de implementação

1. Spec 01 — Incluir uma unidade no carrinho da conta
2. Spec 02 — Incluir uma unidade no carrinho do visitante
3. Spec 03 — Entrada HTTP de adicionar ao carrinho

Seguir essa ordem deixa a regra da unidade pronta na conta antes de repeti-la no visitante, e só então liga a rota. A Spec 03 sozinha não tem o que responder de inclusão. A Spec 02 sem a Spec 01 repetiria a regra da linha sem a referência que a define.
