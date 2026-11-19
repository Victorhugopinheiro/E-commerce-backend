# PRD — Modelo do produto

> Tipo: PRD de feature · Data: 2026-11-18
> **Status:** Aguardando implementação
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

O catálogo passa a aceitar um eixo chamado modelo, ao lado do tamanho que já existe. Cada modelo tem nome, uma foto e preço próprio. Na página do produto, escolher um modelo troca a foto e o preço. A vitrine mostra a foto do primeiro modelo e o menor preço entre os modelos. Carrinho e pedido guardam qual modelo foi comprado e cobram o preço daquele modelo.

Produto sem modelos continua como hoje: um preço, uma lista de fotos e tamanhos obrigatórios.

Esta entrega é a API. A tela da loja fica de fora.

## 2. Problema que resolve

Hoje as fotos pertencem ao produto inteiro, não a uma opção. O único eixo escolhível é o tamanho. O preço é um só. Carrinho e pedido identificam a linha por produto + tamanho.

Com isso, escolher a camiseta vermelha ou o Homem-Aranha comendo pizza não tem como mostrar a foto certa, nem gravar o que foi comprado, nem cobrar um preço diferente por pose ou estampa. Duas opções do mesmo produto e do mesmo tamanho cairiam na mesma linha.

Quem sofre: o cliente, que não vê o item que selecionou, e a operação, que não sabe qual modelo separar. O admin cadastra as opções na criação do produto. Não existe edição de produto.

## 3. Público-alvo

- Admin que cadastra o produto e as opções (pose, cor, estampa).
- Cliente logado que escolhe o modelo, coloca no carrinho e fecha o pedido por qualquer um dos checkouts já existentes.

A página em si é de outro projeto. Esta API entrega os dados e a cobrança para essa página funcionar.

## 4. Objetivo do recorte atual

Permitir que um produto tenha modelos com foto e preço próprios, que a leitura pública entregue capa e menor preço sem mentir sobre a página aberta, e que carrinho e os três checkouts gravem e cobrem exatamente o modelo escolhido.

## 5. Funcionalidades

**Essenciais:**

- Cadastrar produto com um ou mais modelos, cada um com nome, uma foto e preço.
- Manter o cadastro atual para produto sem modelos.
- Recusar cadastro incoerente (nome repetido, modelo incompleto, preço ou galeria solta junto com modelos).
- Na listagem pública, devolver os modelos na ordem do cadastro para a página trocar foto e preço.
- Na vitrine e no card da listagem, usar a foto do primeiro modelo e o menor preço.
- Abrir o conceito da página no primeiro modelo (foto e preço dele), mesmo quando o card mostra um preço menor de outro modelo.
- Incluir o modelo na linha do carrinho, somar quantidade só na mesma combinação e recusar opção que o produto não vende.
- Listar o carrinho com o preço atual do modelo e a foto daquele modelo.
- Nos três checkouts, cobrar o preço do modelo no catálogo, gravar o nome do modelo no item do pedido e tirar do carrinho só a linha correspondente.

**Desejáveis:**

- Nenhum neste recorte. O que parecia desejável está em "Fora do escopo".

## 6. Fora do escopo

- A tela da loja. Este recorte não desenha nem implementa a página. A troca de foto e preço na tela consome a listagem pública.
- Tornar público o detalhe do produto. Ele continua restrito ao admin. A loja usa a listagem.
- Editar produto. Não há atualização hoje. Mudar nome, foto ou preço de um modelo é apagar o produto e criar de novo.
- Migrar produtos já gravados. Eles permanecem sem modelos.
- Estoque por modelo ou por tamanho.
- Preço riscado, cupom, desconto, "5% no PIX" e o pacote "4 peças".
- Preço que muda conforme o tamanho.
- Mais de uma foto por modelo (frente, costas, detalhe).
- Capa separada da foto dos modelos.
- Preço único compartilhado entre modelos.
- Nova forma de pagamento. Os três checkouts atuais permanecem.
- Limite novo de quantidade de modelos. Vale a lista enviada, desde que cada item seja válido.
- Apertar a regra de preço negativo. O preço do produto hoje não recusa número negativo. O preço do modelo segue a mesma regra.

## 7. Regras de negócio

Decisões confirmadas na sessão:

- Regra 1: Modelo é um eixo separado do tamanho. Miniatura pode ter só modelos. Camiseta pode ter modelos e tamanhos.
- Regra 2: Cada modelo tem nome, exatamente uma foto e preço próprio. Tamanho não altera esse preço.
- Regra 3: Modelo é opcional. Sem modelos, o produto exige preço, ao menos um tamanho e ao menos uma foto, como hoje.
- Regra 4: Com modelos, preço do produto e galeria solta não fazem parte do cadastro. Se vierem preenchidos, a criação é recusada. Tamanhos podem vir.
- Regra 5: O nome é único no produto. A comparação tira espaços das pontas e distingue maiúsculas. `Selfie` e `selfie` são modelos diferentes. `Selfie` e `Selfie` são o mesmo nome, e o segundo recusa o cadastro.
- Regra 6: A ordem do cadastro é a ordem dos modelos. O primeiro é a capa e é o modelo em que a página abre.
- Regra 7: O card (vitrine e listagem) mostra o menor preço entre os modelos. Esse preço pode ser de outro modelo que não o da capa. A página, ao abrir, mostra foto e preço do primeiro modelo. O checkout cobra o modelo escolhido, não o preço do card.
- Regra 8: A linha de carrinho e de pedido é produto + tamanho, se o produto tiver tamanhos, + modelo, se o produto tiver modelos. A mesma combinação soma quantidade. Combinação diferente é outra linha.
- Regra 9: Carrinho e os três checkouts recusam linha que não existe no produto. Se há modelos, o modelo é obrigatório e tem que ser um nome guardado. Se não há, modelo não pode vir. A mesma regra vale para o tamanho, inclusive em produto antigo que só tem tamanhos.
- Regra 10: Carrinho, ao listar, e checkout, ao cobrar, usam o preço atual do modelo no catálogo. O preço enviado pelo cliente não entra na conta. No produto sem modelos, o preço continua sendo o preço do produto.
- Regra 11: O pedido guarda o nome do modelo e o preço unitário cobrado. Pedidos antigos, sem modelo, continuam válidos.

Decisões derivadas (não foram uma escolha A/B; fecham buraco das decisões acima e estão marcadas para não parecerem suposição solta):

- Regra 12: Lista de modelos ausente ou vazia significa produto sem modelos, e valem as regras antigas de cadastro.
- Regra 13: Preço do modelo ausente, zero ou não numérico recusa o cadastro. Número negativo é aceito, porque o preço do produto hoje também aceita.
- Regra 14: No carrinho, o texto do modelo e do tamanho é comparado depois de tirar espaços das pontas, e tem que ser igual ao texto guardado, inclusive na capitalização.
- Regra 15: Ao listar o carrinho, a linha que tem modelo devolve a foto daquele modelo, não a capa. Sem isso a linha mostraria o item errado.
- Regra 16: Se a linha guardada aponta para um modelo que não existe mais no produto, ela sai do carrinho na listagem, no mesmo critério de produto que já foi apagado.
- Regra 17: Os três checkouts (pedido, Stripe e Asaas) aplicam a mesma regra de linha, preço e remoção do carrinho.
- Regra 18: Preço do produto preenchido com número, inclusive zero, ou galeria com ao menos uma foto, junto com modelos, recusa o cadastro inteiro. Campo ausente ou galeria vazia não conta como enviado.

## 8. Fluxos principais

### Fluxo 1 — Admin cadastra miniatura só com modelos

1. O admin envia o produto com nome, descrição e categoria, sem preço de produto, sem galeria e sem tamanhos.
2. Envia dois ou mais modelos, na ordem desejada. Cada um tem nome, uma foto e preço.
3. O sistema guarda o produto e os modelos nessa ordem.
4. A listagem pública devolve os modelos. A vitrine usa a foto do primeiro e o menor preço.

### Fluxo 2 — Admin cadastra camiseta com modelo e tamanho

1. O admin envia o produto com modelos (cada um nome, foto e preço) e com a lista de tamanhos.
2. Não envia preço de produto nem galeria solta.
3. O sistema guarda modelos e tamanhos.
4. A compra depois exige modelo e tamanho, ambos existentes no produto.

### Fluxo 3 — Admin cadastra produto sem modelos

1. O admin envia preço, tamanhos e ao menos uma foto, como hoje.
2. Não envia modelos.
3. O sistema guarda o produto no formato atual.
4. Vitrine, carrinho e checkout desse produto continuam no preço do produto e no tamanho.

### Fluxo 4 — Cliente escolhe o modelo e compra

1. A loja lê o produto na listagem pública e mostra a foto e o preço do primeiro modelo.
2. O cliente seleciona outro modelo. A loja troca a foto e o preço com os dados desse modelo. A API não participa do clique.
3. O cliente entra no carrinho com produto, modelo e, se houver, tamanho.
4. O sistema confere se essa combinação existe. Se existir, grava ou soma a linha.
5. Ao listar o carrinho, o sistema devolve o preço e a foto atuais daquele modelo.
6. No checkout, o sistema cobra o preço atual do modelo, grava o nome no item do pedido e remove só essa linha do carrinho.

### Fluxo 5 — Card e página não mostram o mesmo preço

1. O primeiro modelo custa mais que outro modelo do mesmo produto.
2. A vitrine mostra a foto do primeiro e o preço do mais barato.
3. A página abre no primeiro modelo, com o preço dele.
4. O pedido só cobra o mais barato se o cliente selecionar esse modelo.

## 9. Critérios de aceite

- O admin consegue cadastrar um produto só com modelos, sem preço de produto, sem galeria e sem tamanhos.
- O admin consegue cadastrar um produto com modelos e tamanhos.
- O admin consegue cadastrar um produto sem modelos, no formato de hoje.
- O sistema recusa modelo sem nome, sem foto ou sem preço válido, nome repetido no mesmo produto, e preço de produto ou galeria solta junto com modelos.
- A listagem pública devolve nome, foto e preço de cada modelo, na ordem do cadastro.
- A vitrine mostra a foto do primeiro modelo e o menor preço. Produto com modelos não some da vitrine por não ter preço de produto.
- A página, conceitualmente, abre no primeiro modelo. O card pode mostrar um preço menor de outro modelo.
- O cliente consegue colocar no carrinho duas linhas do mesmo produto e do mesmo tamanho com modelos diferentes.
- O sistema recusa modelo ou tamanho que o produto não tem, e recusa omitir modelo ou tamanho quando o produto os tem.
- O carrinho listado mostra o preço atual e a foto do modelo da linha.
- Os três checkouts cobram o preço do modelo, ignoram o preço enviado pelo cliente, gravam o nome do modelo no item e removem só a linha daquela combinação.
- Produto antigo, sem modelos, continua comprável por produto + tamanho, no preço do produto.
- Pedido antigo, sem modelo no item, continua legível.

## 10. Stack

API existente, sem tecnologia nova:

- Node.js e TypeScript
- Express
- MongoDB com Mongoose
- Cloudinary para guardar a foto, como as fotos do produto já são guardadas
- Multer no envio do arquivo, como no cadastro atual
- JWT do admin no cadastro e no detalhe do produto
- JWT do cliente no carrinho e nos checkouts
- Checkouts já existentes: pedido direto, Stripe e Asaas

Nenhuma biblioteca nova é necessária para esta feature.

## 11. Justificativa da stack

O catálogo, a vitrine, o carrinho e os três checkouts já estão nessa API. O modelo é mais um dado do produto e mais um campo da linha de compra. Trocar de banco, de storage ou de framework não resolve o problema e quebraria o que já funciona. A foto do modelo reutiliza o mesmo armazenamento de imagem do cadastro atual.

## 12. Fases de construção

### Fase 1 — Cadastro

Objetivo: o admin consegue gravar um produto com modelos válidos, e o produto sem modelos continua válido.
Specs:

- Spec 01 — Cadastrar produto com modelos

### Fase 2 — Leitura pública

Objetivo: a loja consegue mostrar a troca de foto e preço, e o card usa capa e menor preço sem exigir preço de produto.
Specs:

- Spec 02 — Expor modelos, capa e menor preço

### Fase 3 — Carrinho

Objetivo: a linha guardada é a combinação certa e a listagem mostra foto e preço daquele modelo.
Specs:

- Spec 03 — Identificar a linha do carrinho pelo modelo

### Fase 4 — Checkout

Objetivo: os três pagamentos cobram e gravam o modelo, e só retiram a linha comprada.
Specs:

- Spec 04 — Cobrar e gravar o modelo no pedido

## 13. Specs funcionais detalhadas

> Cada spec deve ser autossuficiente: um agente de codificação vai ler SÓ esta spec (mais as dependências) para montar o plano técnico e implementar. Preencha todos os campos; se um não se aplica, escreva "Não se aplica" e o porquê.

### Spec 01 — Cadastrar produto com modelos

- **Fase:** Fase 1 — Cadastro
- **Objetivo (o quê):** O admin grava um produto com modelos (nome, uma foto e preço cada) ou, se não houver modelos, grava o produto como hoje.
- **Intenção (por quê):** Sem o modelo gravado com a foto e o preço dele, a página não tem o que trocar e o pedido não tem o que cobrar. O cadastro precisa impedir as duas fontes de preço e de foto ao mesmo tempo, senão a vitrine volta a ler a galeria solta.
- **Contexto:** O produto já tem nome, descrição, preço, lista de fotos (até quatro no envio atual), categoria, subcategoria opcional, tamanhos, destaque, data, franquia opcional e características opcionais. Criar produto é ação de admin. Foto é arquivo enviado e guardado como endereço, no mesmo storage das fotos atuais. Não existe atualização de produto. Apagar produto continua como está. Produtos já gravados não são migrados.
- **Atores:** Admin autenticado.
- **Descrição do comportamento:** Se o envio não traz modelos, ou traz uma lista vazia, o sistema exige preço numérico diferente de zero, ao menos um tamanho e ao menos uma foto, e grava o produto sem modelos. Se o envio traz ao menos um modelo, o sistema exige que cada modelo tenha nome, uma foto e preço, grava a lista na ordem enviada e não grava preço de produto nem galeria solta. Tamanhos são opcionais nesse caso: lista com itens vira o eixo de tamanho; lista ausente ou vazia significa produto sem tamanho. Franquia, características, categoria, destaque e os demais campos obrigatórios de hoje continuam valendo nos dois casos. Qualquer falha de validação ou de guarda de foto impede a criação. Nada parcial é gravado.
- **Entradas e saídas:** Entram os dados do produto que o cadastro já recebe, mais uma lista opcional de modelos. Cada modelo entra com nome, preço e um arquivo de imagem. Sai a confirmação de produto criado, ou a recusa com o motivo. O produto guardado, quando tem modelos, contém a lista ordenada. Cada item da lista tem o nome já sem espaços nas pontas, o endereço da foto e o preço.
- **Dados/entidades envolvidos (conceitual):** Produto: identidade, nome, descrição, categoria e o que o cadastro já guarda. Eixo tamanho: lista de textos, opcional quando há modelos, obrigatória quando não há. Eixo modelo: lista ordenada. Cada modelo: nome, uma foto, preço. Preço do produto e galeria de fotos: existem só no produto sem modelos.
- **Estados e transições:** Dois formatos de produto, definidos na criação e estáveis depois, porque não há edição. Sem modelos: preço do produto, tamanhos e galeria. Com modelos: lista de modelos e, se enviados, tamanhos. Não há transição de um formato para o outro neste recorte.
- **Regras de negócio:**
  - Nome do modelo é obrigatório depois de tirar espaços das pontas.
  - Nomes únicos no mesmo produto, com capitalização distinta. `Selfie` e `selfie` passam. `Selfie` repetido, ou `Selfie` e `Selfie`, recusam.
  - Cada modelo tem exatamente uma foto. Foto que não puder ser guardada recusa o produto inteiro.
  - Preço do modelo ausente, zero ou não numérico recusa. Negativo é aceito, igual ao preço do produto hoje.
  - Com modelos, preço de produto numérico (inclusive zero) ou galeria com ao menos uma foto recusam o cadastro. Ausência desses campos, ou galeria vazia, é o caminho válido.
  - Tamanhos podem acompanhar os modelos. Não são obrigatórios.
  - Sem modelos, preço, tamanhos e ao menos uma foto continuam obrigatórios.
  - A ordem enviada é a ordem guardada.
- **Validações:** Aplicar antes de persistir. Recusar o envio inteiro no primeiro conjunto inválido, sem gravar produto pela metade e sem deixar foto órfã como se o produto existisse. Campos que já são validados hoje (nome, descrição, categoria, franquia quando preenchida, características) continuam valendo.
- **Fluxo do usuário (passo a passo):**
  1. O admin envia o cadastro com ou sem modelos.
  2. O sistema classifica o envio: com modelos ou sem modelos.
  3. O sistema valida o formato correspondente e a unicidade dos nomes.
  4. O sistema guarda cada foto de modelo e o produto.
  5. O admin recebe sucesso, ou a recusa sem produto criado.
- **Casos de borda e erros:**
  - Lista de modelos vazia: tratar como produto sem modelos.
  - Um modelo no meio da lista sem foto, sem nome ou com preço zero: recusar tudo.
  - Dois nomes iguais ignorando só os espaços das pontas: recusar.
  - Modelos mais preço de produto, ou modelos mais galeria com foto: recusar.
  - Produto sem modelos e sem tamanho, ou sem foto, ou sem preço: recusar, como hoje.
  - Franquia preenchida que não existe: recusar, como hoje.
  - Admin sem autenticação: recusar, como hoje.
  - Falha ao guardar uma das fotos: recusar a criação.
- **Impacto no existente:** O cadastro atual ganha um segundo formato válido. O formato antigo permanece para envios sem modelos. Quem já cria produto com preço, tamanhos e fotos não precisa mudar o envio. O detalhe administrativo, que devolve o produto gravado, passa a incluir os modelos quando existirem. A rota de detalhe continua só de admin.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um admin autenticado e um produto sem preço de produto, sem galeria e sem tamanhos, com os modelos Pizza a 40 e Selfie a 80 nessa ordem, quando cria o produto, então o produto existe com esses dois modelos, nessa ordem, cada um com uma foto e o próprio preço.
  - Dado um envio com modelos e também com preço de produto ou com ao menos uma foto na galeria, quando o admin cria, então o produto não é gravado.
  - Dado um envio com modelos cujos nomes são `Selfie` e `Selfie`, quando o admin cria, então o produto não é gravado.
  - Dado um envio com modelos `Selfie` e `selfie`, quando o admin cria, então os dois modelos são gravados.
  - Dado um envio sem modelos, com preço, tamanhos e uma foto, quando o admin cria, então o produto é gravado no formato atual, sem modelos.
  - Dado um modelo com preço zero ou preço ausente, quando o admin cria, então o produto não é gravado.
- **Definição de pronto:** Dá para criar os três formatos (só modelos, modelos e tamanhos, produto antigo) e as recusas acima acontecem sem gravar produto inválido.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Listagem, vitrine, carrinho, checkout, edição, migração de produtos antigos e a tela da loja.

### Spec 02 — Expor modelos, capa e menor preço

- **Fase:** Fase 2 — Leitura pública
- **Objetivo (o quê):** A listagem pública entrega os modelos para a página trocar foto e preço. A vitrine e o card usam a foto do primeiro modelo e o menor preço.
- **Intenção (por quê):** A loja não tem outra leitura pública do produto. O detalhe é de admin. Se a listagem não trouxer nome, foto e preço de cada modelo, a página não troca. Se a vitrine continuar exigindo o preço do produto e a primeira foto da galeria, o produto com modelos some ou aparece com a foto errada.
- **Contexto:** A listagem pública devolve os produtos, com filtros de categoria e subcategoria que já existem. A vitrine monta quatro grupos (destaques e franquias já configuradas), com um limite já existente de itens por grupo, e hoje usa o preço do produto e a primeira foto da galeria. Produto sem preço numérico ou sem nome válido já fica de fora da vitrine. O detalhe do produto continua restrito ao admin e não é a fonte da página da loja.
- **Atores:** Visitante ou cliente que lê a listagem e a vitrine. Admin que lê o detalhe.
- **Descrição do comportamento:** Para produto com modelos, a listagem devolve a lista na ordem do cadastro. Cada item traz nome, foto e preço. O card desse produto, onde a leitura precisar de uma foto e um preço únicos, usa a foto do primeiro modelo e o menor preço entre os modelos. A vitrine faz o mesmo e não descarta o produto por falta de preço de produto ou de galeria solta. Para produto sem modelos, listagem e vitrine continuam com a galeria e o preço do produto. A primeira foto da galeria segue sendo a capa desse formato. Filtros, ordem e limite da vitrine não mudam. O detalhe administrativo devolve o produto como foi gravado, incluindo modelos quando existirem, e segue exigindo admin.
- **Entradas e saídas:** Entram os mesmos filtros de listagem e de vitrine de hoje. Sai o produto com modelos completos na listagem. Sai o card da vitrine com uma foto e um preço. No produto com modelos, essa foto é a do primeiro e esse preço é o menor. No produto sem modelos, foto e preço são os de hoje.
- **Dados/entidades envolvidos (conceitual):** Produto com ou sem modelos, como gravado na Spec 01. Card: uma foto e um preço. Modelo exposto: nome, foto, preço, posição na lista.
- **Estados e transições:** Não se aplica. Esta spec só lê. Não muda estado do produto.
- **Regras de negócio:**
  - Ordem dos modelos na leitura é a ordem do cadastro.
  - Capa de produto com modelos é a foto do primeiro.
  - Preço de card e de vitrine de produto com modelos é o menor preço entre os modelos, mesmo que pertença a outro modelo.
  - A página da loja, ao abrir, deve usar o primeiro modelo (foto e preço dele). A API não escolhe outro modelo só porque ele é mais barato. Quem aplica o "abrir no primeiro" é quem consome a lista. A API garante que o primeiro da lista é essa escolha.
  - Produto sem modelos não ganha lista de modelos na leitura.
  - Produto com modelos não depende de preço de produto nem de galeria para aparecer na vitrine, desde que tenha nome válido e ao menos um modelo com preço numérico.
- **Validações:** Não se aplica a uma entrada de escrita. A leitura ignora produto que já seria ignorado hoje por nome vazio. Produto com modelos e preço de modelo não numérico não deve ser produzido pela Spec 01. Se aparecer dado inconsistente, esse produto não entra na vitrine.
- **Fluxo do usuário (passo a passo):**
  1. O cliente abre a home ou a listagem.
  2. O sistema devolve os cards. No produto com modelos, foto do primeiro e menor preço.
  3. O cliente abre a página. A loja usa a listagem e mostra o primeiro modelo.
  4. O cliente seleciona outro modelo. A loja usa nome, foto e preço devolvidos para esse item. A API não recebe o clique.
- **Casos de borda e erros:**
  - Produto sem modelos: capa e preço iguais aos de hoje.
  - Todos os modelos com o mesmo preço: o card mostra esse preço e a foto do primeiro.
  - O modelo mais barato não é o primeiro: o card mostra a foto do primeiro e o preço do mais barato. A lista continua começando pelo primeiro, com o preço maior.
  - Produto com modelos fora dos filtros de categoria, subcategoria, destaque ou franquia: continua de fora, como hoje.
  - Leitura de detalhe sem admin: continua negada.
- **Impacto no existente:** O formato público do produto cresce quando há modelos. Card da vitrine deixa de depender só do preço do produto e da primeira foto da galeria. Produto antigo não muda o que a vitrine mostra. A loja, em outro projeto, precisa passar a ler esses campos para trocar a foto. Isso não faz parte desta spec.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um produto com Pizza a 40 e Selfie a 80, Selfie gravada primeiro, quando a vitrine ou o card é montado, então a foto é a da Selfie e o preço exibido no card é 40.
  - Dado esse mesmo produto, quando a listagem pública é lida, então o primeiro modelo é Selfie com preço 80 e foto da Selfie, e Pizza vem depois com preço 40 e a foto dela.
  - Dado um produto sem modelos, quando a vitrine é montada, então a foto é a primeira da galeria e o preço é o preço do produto.
  - Dado um produto com modelos e sem preço de produto, quando a vitrine é montada e ele cumpre o filtro do grupo, então ele aparece.
  - Dado um cliente sem sessão de admin, quando pede o detalhe do produto, então o acesso continua negado.
- **Definição de pronto:** Listagem e vitrine cumprem os critérios acima para produto com modelos e para produto antigo, sem alterar filtros, limite e grupos da vitrine.
- **Dependências:** Spec 01 — o produto precisa estar gravado nos dois formatos.
- **Fora do escopo desta spec:** Carrinho, checkout, cadastro, tornar o detalhe público e implementar a tela.

### Spec 03 — Identificar a linha do carrinho pelo modelo

- **Fase:** Fase 3 — Carrinho
- **Objetivo (o quê):** Incluir, somar, remover e listar a linha certa: produto + tamanho, se houver, + modelo, se houver. A listagem mostra o preço atual e a foto do modelo.
- **Intenção (por quê):** Se a linha continuar só em produto + tamanho, a camiseta M vermelha e a M preta viram a mesma compra, e remover uma apaga a outra. A listagem hoje troca o preço da linha pelo preço do produto. No produto com modelos esse preço não é o cobrado, e a foto da capa pode ser de outro modelo.
- **Contexto:** O carrinho é do cliente autenticado. A linha já guarda produto, quantidade, tamanho opcional, nome e preço opcional. Incluir procura uma linha do mesmo produto e do mesmo tamanho: se acha, soma 1; se não acha, cria a linha com a quantidade enviada. Remover acha essa mesma combinação, diminui 1, e tira a linha quando a quantidade chega a zero. Listar descarta linha cujo produto não existe mais, apaga essas linhas do carrinho guardado, joga fora o preço guardado na linha e coloca o preço atual do produto. Tamanho vazio hoje impede a inclusão. Tamanho que não está na lista do produto hoje é aceito. Esta spec passa a conferir tamanho e modelo contra o produto.
- **Atores:** Cliente autenticado.
- **Descrição do comportamento:** Na inclusão, o sistema carrega o produto. Se ele tem modelos, o modelo enviado, sem espaços nas pontas, é obrigatório e tem que ser igual a um nome guardado. Se ele não tem modelos, modelo preenchido recusa. Se ele tem tamanhos, o tamanho enviado, sem espaços nas pontas, é obrigatório e tem que ser um dos tamanhos guardados. Se ele não tem tamanhos, tamanho preenchido recusa. A combinação que identifica a linha é produto + tamanho presente ou ausente + modelo presente ou ausente. Inclusão repetida da mesma combinação soma quantidade do jeito que já soma hoje. Remoção usa a mesma combinação: diminui 1 ou tira a linha, e não mexe em outra combinação do mesmo produto. Na listagem, linha de produto que não existe mais continua sendo descartada e removida do carrinho guardado. Linha com modelo cujo nome não existe mais no produto também é descartada e removida. Linha com modelo válido devolve o preço atual desse modelo e a foto desse modelo. Linha sem modelo devolve o preço atual do produto, como hoje, e não inventa foto de modelo.
- **Entradas e saídas:** Inclusão e remoção entram com cliente, produto, quantidade na inclusão, tamanho opcional e modelo opcional. A listagem entra com o cliente. Sai o carrinho atualizado ou a recusa. Cada linha listada de produto com modelo inclui o nome do modelo, o preço atual dele e a foto dele.
- **Dados/entidades envolvidos (conceitual):** Linha de carrinho: produto, quantidade, tamanho opcional, modelo opcional, nome do produto se já era guardado, preço de exibição, foto de exibição. Produto: formatos da Spec 01.
- **Estados e transições:** Linha ausente → linha criada na primeira inclusão válida. Linha existente da mesma combinação → quantidade maior na inclusão e menor na remoção. Quantidade que chega a zero na remoção → linha some. Produto apagado ou modelo inexistente, descobertos na listagem → linha some do carrinho guardado.
- **Regras de negócio:**
  - Modelo obrigatório se e só se o produto tem modelos. Tem que ser o texto guardado, depois de tirar espaços das pontas, com a mesma capitalização.
  - Tamanho obrigatório se e só se o produto tem tamanhos. Mesma comparação. Isso vale também para produto antigo, só com tamanhos.
  - Duas linhas com o mesmo produto e o mesmo tamanho e modelos diferentes coexistem.
  - Duas linhas com o mesmo produto e o mesmo modelo e tamanhos diferentes coexistem.
  - Produto sem tamanho e com modelos: a linha é produto + modelo, sem tamanho.
  - A regra de quanto a quantidade sobe na inclusão repetida não muda.
  - Preço enviado pelo cliente não é o preço da linha listada.
- **Validações:** Produto inexistente, cliente inexistente e quantidade ausente continuam recusando a inclusão. Modelo ou tamanho fora do produto recusa sem alterar o carrinho. A remoção de uma combinação que não está no carrinho recusa, sem alterar outras linhas.
- **Fluxo do usuário (passo a passo):**
  1. O cliente pede para incluir produto, modelo e tamanho conforme o produto exige.
  2. O sistema confere a combinação e cria ou soma a linha.
  3. O cliente lista o carrinho e vê preço e foto daquele modelo.
  4. O cliente remove uma unidade. Só aquela combinação diminui.
- **Casos de borda e erros:**
  - Produto com modelos e modelo omitido, ou modelo `Pizza` quando só existe `Selfie`: recusa, carrinho intacto.
  - Produto sem modelos e modelo `Selfie` enviado: recusa.
  - Produto com tamanhos e tamanho que não está na lista: recusa. Isso passa a valer também para produto antigo.
  - Produto sem tamanhos e tamanho enviado: recusa.
  - `Selfie` com o modelo guardado `Selfie`: é a mesma linha.
  - `selfie` com o modelo guardado `Selfie`: recusa.
  - Inclusão de Selfie M e de Pizza M: duas linhas.
  - Remoção de Selfie M: Pizza M permanece.
  - Listagem com produto apagado: a linha sai do carrinho, como hoje.
  - Listagem com modelo que não está mais no produto: a linha sai do carrinho.
  - Cliente sem autenticação: recusa, como hoje.
- **Impacto no existente:** A chave da linha deixa de ser só produto + tamanho. Produto antigo sem modelos continua em produto + tamanho, mas tamanho inexistente passa a ser recusado. A listagem deixa de usar o preço do produto quando a linha tem modelo.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um produto com modelos Selfie e Pizza e tamanhos M e G, quando o cliente inclui Selfie M e Pizza M, então o carrinho tem duas linhas.
  - Dado essas duas linhas, quando o cliente remove uma unidade de Selfie M, então Pizza M permanece com a mesma quantidade.
  - Dado um produto com modelos e sem tamanhos, quando o cliente inclui só o modelo Selfie, então a linha existe sem tamanho.
  - Dado um produto com modelos, quando o cliente inclui sem modelo, então a linha não é criada.
  - Dado um produto só com tamanhos P e M, quando o cliente inclui tamanho G, então a linha não é criada.
  - Dado uma linha Selfie cujo preço de catálogo é 80, quando o cliente lista o carrinho, então a linha volta com preço 80 e com a foto da Selfie, mesmo que o primeiro modelo seja outro e mesmo que o cliente tenha enviado outro preço.
- **Definição de pronto:** Incluir, remover e listar distinguem modelo e tamanho, recusam combinação inválida e devolvem preço e foto do modelo na listagem. Produto sem modelos continua comprável com tamanho válido.
- **Dependências:** Spec 01 — os dois formatos de produto. A listagem pública da Spec 02 não é necessária para o carrinho funcionar.
- **Fora do escopo desta spec:** Checkout, vitrine, tela da loja e mudar a regra de incremento de quantidade.

### Spec 04 — Cobrar e gravar o modelo no pedido

- **Fase:** Fase 4 — Checkout
- **Objetivo (o quê):** Os três checkouts cobram o preço do modelo, gravam o nome do modelo no item e removem do carrinho só a combinação comprada.
- **Intenção (por quê):** O pedido é o que a operação separa e o que o pagamento cobra. Se o checkout continuar exigindo tamanho sempre, a miniatura sem tamanho não fecha. Se continuar usando o preço do produto, cobra o valor errado. Se continuar achando a linha do carrinho só por produto + tamanho, comprar a Selfie apaga a Pizza.
- **Contexto:** Existem três criações de pedido do cliente autenticado: pedido direto, Stripe e Asaas. As três hoje recusam item sem tamanho, calculam o total com o preço do produto vezes a quantidade, gravam esse preço no item e localizam a linha do carrinho por produto + tamanho. O preço que o cliente envia no item não é a fonte do total no serviço de pedido. Pedidos já gravados têm itens com produto, quantidade, tamanho opcional e preço. A leitura dos pedidos do cliente e a leitura administrativa devolvem esses itens. Esta spec não cria pagamento novo.
- **Atores:** Cliente autenticado que fecha a compra. Admin e o próprio cliente, ao lerem o pedido depois.
- **Descrição do comportamento:** Cada item do checkout é validado contra o produto, com a mesma regra da Spec 03: modelo obrigatório só quando há modelos e igual a um nome guardado; tamanho obrigatório só quando há tamanhos e igual a um tamanho guardado; texto comparado sem espaços nas pontas e com a mesma capitalização. Se qualquer item falha, o pedido não é criado e o carrinho não muda. O preço unitário cobrado é o preço atual do modelo quando o item tem modelo, ou o preço atual do produto quando não tem. O preço enviado pelo cliente é ignorado nos três fluxos, inclusive no valor enviado ao Stripe e ao Asaas. O total é a soma de preço unitário vezes quantidade, como já é a estrutura do pedido. O item gravado leva produto, quantidade, tamanho se houver, nome do modelo se houver e o preço unitário cobrado. Depois do pedido criado, a linha removida do carrinho é a da mesma combinação, não outra linha do mesmo produto. Os três fluxos se comportam igual nessa regra. Ler o pedido depois devolve o modelo no item. Pedido antigo, sem modelo, continua sendo lido sem exigir esse campo.
- **Entradas e saídas:** Entram os dados que cada checkout já exige (cliente, itens, endereço, pagamento) e, em cada item, produto, quantidade, tamanho opcional e modelo opcional. Sai o pedido criado com total e itens, ou a recusa sem pedido e sem mudança no carrinho. A cobrança externa, quando o fluxo é Stripe ou Asaas, usa o preço de catálogo da combinação.
- **Dados/entidades envolvidos (conceitual):** Item de pedido: produto, quantidade, tamanho opcional, modelo opcional, preço unitário cobrado. Pedido: os campos que já tem (total, status, endereço, pagamento). Linha de carrinho: a combinação da Spec 03.
- **Estados e transições:** Carrinho com a combinação → pedido criado com o item gravado → essa combinação deixa o carrinho. Falha de validação ou de pagamento, quando o fluxo hoje não grava pedido em caso de falha, mantém o carrinho. Não se introduz status novo de pedido.
- **Regras de negócio:**
  - A regra de presença e de correspondência de modelo e tamanho é a mesma do carrinho.
  - Preço cobrado é o do catálogo no momento do checkout. Card, menor preço e preço enviado pelo cliente não são o valor cobrado, salvo quando o modelo escolhido é de fato o mais barato.
  - Tamanho não muda o preço.
  - O nome do modelo gravado no pedido é o texto guardado no catálogo.
  - Remover o item comprado do carrinho usa produto + tamanho presente ou ausente + modelo presente ou ausente.
  - Pedido antigo sem modelo permanece válido.
  - Os três checkouts aplicam as mesmas regras de item, preço e carrinho.
- **Validações:** Item sem produto, sem quantidade ou com quantidade inválida continua recusando, como hoje. Item com modelo ou tamanho incompatível com o produto recusa o checkout inteiro. Endereço, frete e o que cada fluxo já valida continuam valendo. Não criar pedido parcial se um item do meio da lista for inválido.
- **Fluxo do usuário (passo a passo):**
  1. O cliente envia o checkout com as linhas que quer comprar.
  2. O sistema confere cada linha contra o produto.
  3. O sistema calcula o total com o preço de catálogo de cada combinação.
  4. O sistema grava o pedido com o modelo em cada item que tiver modelo e segue o pagamento daquele fluxo.
  5. O sistema tira do carrinho só as combinações compradas.
  6. Uma leitura posterior do pedido mostra o modelo e o preço cobrado.
- **Casos de borda e erros:**
  - Miniatura sem tamanho, com modelo válido: o checkout aceita o item sem tamanho.
  - Camiseta com modelo e tamanho válidos: aceita e cobra o preço daquele modelo, igual para M e para G.
  - Modelo ou tamanho inválido em um dos itens: nenhum pedido é criado e o carrinho permanece.
  - Cliente envia preço diferente do catálogo: o total usa o catálogo.
  - Carrinho com Selfie M e Pizza M, checkout só da Selfie M: Pizza M continua no carrinho.
  - Produto sem modelos, com tamanho válido: cobra o preço do produto e grava o item sem modelo.
  - Pedido já existente sem modelo: a leitura segue funcionando.
  - Os três fluxos, diante do mesmo item inválido, recusam. Diante do mesmo item válido, gravam o mesmo nome de modelo e o mesmo preço unitário.
- **Impacto no existente:** A obrigatoriedade cega de tamanho sai dos três checkouts. Produto com tamanhos continua exigindo tamanho, agora também conferido contra a lista. O preço do item deixa de ser sempre o preço do produto. A busca da linha no carrinho depois da compra passa a incluir o modelo. A leitura de pedidos passa a mostrar o modelo quando ele foi gravado. Status, endereço e meios de pagamento não mudam.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um produto sem tamanhos, com Selfie a 80, quando o cliente fecha o pedido só com esse modelo e envia um preço 10, então o item é gravado com o modelo Selfie e preço unitário 80, e o total usa 80.
  - Dado Selfie M a 80 e Pizza M a 40 no carrinho, quando o checkout compra só Selfie M, então o pedido tem a Selfie a 80 e a Pizza M continua no carrinho.
  - Dado um produto com tamanhos e modelos, quando o checkout omite o tamanho ou omite o modelo, então o pedido não é criado e o carrinho não muda.
  - Dado o mesmo item válido, quando o cliente usa pedido direto, Stripe ou Asaas, então os três gravam o mesmo modelo e o mesmo preço unitário de catálogo.
  - Dado um pedido antigo cujo item não tem modelo, quando ele é lido, então a leitura continua possível.
  - Dado um produto sem modelos e com tamanho M cadastrado, quando o checkout envia M, então o pedido é criado no preço do produto, sem modelo no item.
- **Definição de pronto:** Os três checkouts cumprem os critérios acima, incluindo cobrança externa pelo preço de catálogo, e a leitura do pedido devolve o modelo gravado.
- **Dependências:** Spec 01 — formatos do produto e preço do modelo. Spec 03 — a combinação da linha do carrinho que o checkout remove. A Spec 02 não é necessária para cobrar.
- **Fora do escopo desta spec:** Tela de checkout, desconto, PIX, estoque, editar o pedido e criar outro meio de pagamento.

## 14. Ordem recomendada de implementação

1. Spec 01 — Cadastrar produto com modelos
2. Spec 02 — Expor modelos, capa e menor preço
3. Spec 03 — Identificar a linha do carrinho pelo modelo
4. Spec 04 — Cobrar e gravar o modelo no pedido

A Spec 01 cria o dado que todas as outras leem. A Spec 02 só expõe esse dado e pode ser feita antes do carrinho porque a página não grava linha. A Spec 03 fixa a combinação que a Spec 04 precisa remover do carrinho e o preço que a listagem já mostra. Fazer o checkout antes do carrinho cobraria o modelo certo e ainda apagaria a linha errada, ou aceitaria uma combinação que o carrinho recusa. Seguir a ordem evita implementar a cobrança em cima de uma linha que ainda é só produto + tamanho.
