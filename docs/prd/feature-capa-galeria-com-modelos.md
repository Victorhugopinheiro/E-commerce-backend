# PRD — Capa e galeria com modelos

> Tipo: PRD de feature · Data: 2026-11-19
> **Status:** Aguardando implementação
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

O produto com modelos passa a poder ter também uma galeria de fotos do produto, separada da foto de cada modelo. Essa galeria é opcional. Quando ela existe, a primeira foto é a capa do card e da vitrine, e as demais são a apresentação do produto. Quando ela não existe, a capa continua sendo a foto do primeiro modelo, e o produto continua aparecendo na vitrine.

A página do produto, em outro projeto, abre na foto e no preço do primeiro modelo. A galeria fica disponível nessa página como apresentação, sem ocupar o lugar dessa abertura. Carrinho e checkout não mudam: a linha comprada segue com a foto e o preço do modelo escolhido.

Esta entrega é a API. A tela da loja fica de fora.

Este documento substitui, no PRD Modelo do produto, só o que trata da galeria e da capa de produto com modelos. O restante daquele PRD continua valendo: nome único do modelo, uma foto e um preço por modelo, tamanho opcional, menor preço no card, abertura da página no primeiro modelo, linha de carrinho e cobrança dos três checkouts.

## 2. Problema que resolve

Hoje, produto com modelos não pode ter galeria. O cadastro recusa o produto inteiro se vier qualquer foto solta junto com os modelos. A vitrine usa sempre a foto do primeiro modelo como capa.

Quem cadastra não consegue mostrar o produto com mais de uma foto de apresentação. A foto do modelo é uma só, e ela representa a opção comprada, não o conjunto de fotos do produto. Sem a galeria, a capa e a apresentação ficam presas a essa única foto.

Quem sofre é o admin, que não tem onde colocar as fotos gerais do produto, e o cliente, que no card e na vitrine só vê a foto de um modelo. O cliente que já comprou não muda de problema: carrinho e pedido já mostram o modelo escolhido.

## 3. Público-alvo

- Admin que cadastra o produto, os modelos e, se quiser, as fotos gerais.
- Visitante ou cliente que vê o card, a vitrine e a listagem pública.

A página da loja é de outro projeto. Esta API entrega a galeria, a ordem das fotos e a capa da vitrine para essa página funcionar.

## 4. Objetivo do recorte atual

Permitir galeria opcional no produto com modelos, usar a primeira foto dessa galeria como capa quando ela existir, e manter a foto do primeiro modelo como capa quando a galeria não existir. O preço do produto continua de fora desse cadastro. Carrinho e checkout continuam no modelo escolhido.

## 5. Funcionalidades

**Essenciais:**

- Cadastrar produto com modelos e com uma ou mais fotos de galeria, até o limite que o envio já aceita.
- Cadastrar produto com modelos e sem galeria. O produto é gravado assim mesmo.
- Continuar recusando preço de produto quando há modelos.
- Manter o cadastro atual do produto sem modelos: preço, tamanhos e ao menos uma foto.
- Na listagem pública, devolver a galeria na ordem do cadastro e os modelos na ordem do cadastro.
- Na vitrine, usar a primeira foto da galeria como capa quando a galeria existir.
- Na vitrine, usar a foto do primeiro modelo como capa quando o produto tem modelos e não tem galeria. Esse produto continua na vitrine.
- Manter o menor preço entre os modelos como preço do card e da vitrine.
- Manter carrinho e os três checkouts na foto e no preço do modelo escolhido.

**Desejáveis:**

- Nenhum neste recorte.

## 6. Fora do escopo

- A tela da loja. Este recorte não desenha nem implementa a página. Quem consome a listagem aplica a capa do card e mostra a galeria como apresentação, abrindo na foto e no preço do primeiro modelo.
- Campo novo só para a capa. A capa é a primeira foto da galeria, quando a galeria existe, ou a foto do primeiro modelo, quando não existe.
- Editar produto. Não há atualização hoje. Incluir a galeria num produto já gravado é apagar e criar de novo.
- Migrar produtos já gravados. Eles permanecem como estão. A leitura nova escolhe a capa na hora.
- Mais de uma foto por modelo.
- Mais fotos de galeria do que o envio já aceita. O teto atual é quatro.
- Tornar a galeria obrigatória no produto com modelos.
- Preço de produto compartilhado com os modelos, ou preço de card vindo de outro lugar que não o menor preço entre os modelos.
- Mudar a foto da linha do carrinho para a capa.
- Guardar foto no pedido. O pedido continua sem foto.
- Mudar a cobrança dos três checkouts.
- Estoque, desconto, edição de pedido e nova forma de pagamento.
- Apertar a regra de preço negativo. O preço do modelo continua aceitando número negativo, como hoje.

## 7. Regras de negócio

Decisões confirmadas na sessão:

- Regra 1: Galeria e foto de modelo são conjuntos diferentes. A galeria é a lista de fotos do produto. Cada modelo continua com o próprio nome, a própria foto e o próprio preço.
- Regra 2: No produto com modelos, a galeria é opcional. Sem nenhuma foto de galeria, o produto é gravado. Com fotos, a ordem enviada é a ordem guardada. A primeira é a capa. As outras são a apresentação.
- Regra 3: A página abre na foto e no preço do primeiro modelo, tenha o produto galeria ou não. A galeria, quando existe, fica na mesma página como apresentação e não substitui essa abertura. Quem aplica a abertura é quem consome a listagem. A API garante a ordem: o primeiro modelo da lista é essa abertura, e a primeira foto da galeria é a capa.
- Regra 4: Card e vitrine usam a mesma capa. Se há ao menos uma foto na galeria, a capa é a primeira. Se há modelos e não há galeria, a capa é a foto do primeiro modelo. Isso vale para produto novo e para produto já gravado.
- Regra 5: Produto com modelos e sem galeria entra na vitrine. Os quatro grupos da home seguem a mesma regra, inclusive os destaques. Falta de galeria não tira o produto do grupo.
- Regra 6: O preço do produto continua proibido quando há modelos. Número enviado, inclusive zero, recusa o cadastro inteiro. Campo ausente ou vazio é o caminho válido. O card e a vitrine mostram o menor preço entre os modelos. O checkout cobra o modelo escolhido.
- Regra 7: Produto sem modelos não muda. Continua exigindo preço, ao menos um tamanho e ao menos uma foto. A primeira foto da galeria segue sendo a capa, e o preço do card segue sendo o preço do produto.
- Regra 8: Cada modelo continua com exatamente uma foto. Nome único no produto, comparação e preço do modelo continuam como no PRD Modelo do produto.
- Regra 9: Carrinho, ao listar uma linha com modelo, devolve a foto desse modelo, não a capa. O pedido não passa a guardar foto.

Decisões derivadas (fecham buraco das decisões acima e estão marcadas para não parecerem suposição solta):

- Regra 10: Lista de galeria ausente ou vazia, com modelos, significa produto sem capa de galeria. A capa de leitura cai na foto do primeiro modelo.
- Regra 11: Preço de produto preenchido junto com modelos recusa o cadastro mesmo que a galeria seja válida. Nada parcial é gravado.
- Regra 12: A vitrine não descarta produto com modelos por falta de preço de produto nem por falta de galeria, desde que tenha nome válido e ao menos um modelo com preço numérico. Filtro de grupo, ordem e limite da vitrine não mudam.
- Regra 13: Se a foto escolhida como capa não existir no dado já gravado, o card segue com o preço e sem foto. O produto não sai da vitrine por causa disso.
- Regra 14: Falha ao guardar qualquer foto, de galeria ou de modelo, recusa a criação inteira. Vale o mesmo critério que o cadastro já usa quando uma foto não pode ser guardada.

## 8. Fluxos principais

### Fluxo 1 — Admin cadastra produto com modelos e galeria

1. O admin envia o produto com modelos. Cada modelo tem nome, uma foto e preço.
2. Envia uma ou mais fotos de galeria, na ordem desejada, sem preço de produto.
3. O sistema guarda os modelos nessa ordem e a galeria nessa ordem.
4. A listagem devolve os dois conjuntos. A vitrine usa a primeira foto da galeria e o menor preço entre os modelos.

### Fluxo 2 — Admin cadastra produto com modelos e sem galeria

1. O admin envia o produto com modelos, sem fotos de galeria e sem preço de produto.
2. O sistema grava o produto com os modelos e sem galeria.
3. A vitrine usa a foto do primeiro modelo e o menor preço. O produto aparece no grupo em que já entraria.

### Fluxo 3 — Admin cadastra produto sem modelos

1. O admin envia preço, tamanhos e ao menos uma foto, como hoje.
2. Não envia modelos.
3. O sistema guarda o produto no formato atual.
4. Vitrine, carrinho e checkout desse produto continuam no preço do produto e na galeria.

### Fluxo 4 — Cliente vê capa, abertura e modelo

1. A loja lê o produto na listagem pública.
2. Se há galeria, o card usa a primeira foto dela. Se não há, o card usa a foto do primeiro modelo. Nos dois casos o preço do card é o menor entre os modelos.
3. A página abre na foto e no preço do primeiro modelo. Se há galeria, a loja mostra essas fotos como apresentação, sem trocar a abertura.
4. O cliente seleciona outro modelo. A loja troca a foto e o preço de abertura com os dados desse modelo. A API não participa do clique.
5. No carrinho, a linha continua com a foto e o preço do modelo escolhido.

### Fluxo 5 — Card e página não mostram o mesmo preço nem, com galeria, a mesma foto

1. O produto tem galeria, e o primeiro modelo custa mais que outro modelo.
2. A vitrine mostra a primeira foto da galeria e o preço do modelo mais barato.
3. A página abre na foto e no preço do primeiro modelo.
4. O pedido só cobra o mais barato se o cliente selecionar esse modelo.

## 9. Critérios de aceite

- O admin consegue cadastrar um produto com modelos e com galeria, sem preço de produto.
- O admin consegue cadastrar um produto com modelos e sem galeria.
- O sistema recusa preço de produto, inclusive zero, quando há modelos, com ou sem galeria. O produto não é gravado.
- O admin consegue cadastrar um produto sem modelos, no formato de hoje.
- A listagem pública devolve a galeria na ordem do cadastro, quando ela existe, e os modelos na ordem do cadastro.
- A vitrine de produto com galeria mostra a primeira foto da galeria e o menor preço entre os modelos.
- A vitrine de produto com modelos e sem galeria mostra a foto do primeiro modelo e o menor preço, e o produto aparece.
- Produto antigo com modelos e sem galeria entra na vitrine pela foto do primeiro modelo, sem migração.
- Produto sem modelos continua com a primeira foto da galeria e o preço do produto.
- A listagem do carrinho, numa linha com modelo, continua devolvendo a foto desse modelo.
- O pedido continua sem foto. Os três checkouts continuam cobrando o preço do modelo escolhido.

## 10. Stack

API existente, sem tecnologia nova:

- Node.js e TypeScript
- Express
- MongoDB com Mongoose
- Cloudinary para guardar a foto, como as fotos do produto e as fotos de modelo já são guardadas
- Multer no envio do arquivo, como no cadastro atual
- JWT do admin no cadastro e no detalhe do produto
- JWT do cliente no carrinho e nos checkouts
- Checkouts já existentes: pedido direto, Stripe e Asaas

Nenhuma biblioteca nova é necessária para esta feature.

## 11. Justificativa da stack

A galeria já é uma lista de fotos do produto, e cada modelo já tem a própria foto. Esta feature deixa os dois conjuntos coexistirem e muda qual foto a vitrine escolhe como capa. Trocar de banco, de armazenamento ou de framework não resolve isso. A foto nova da galeria reutiliza o mesmo armazenamento das fotos atuais.

## 12. Fases de construção

### Fase 1 — Cadastro

Objetivo: o admin grava produto com modelos tendo ou não galeria, e o produto sem modelos continua válido.
Specs:

- Spec 01 — Gravar galeria opcional junto com os modelos

### Fase 2 — Capa na leitura

Objetivo: a listagem entrega a galeria, e a vitrine escolhe a capa certa sem esconder o produto sem galeria.
Specs:

- Spec 02 — Escolher a capa e expor a galeria

## 13. Specs funcionais detalhadas

> Cada spec deve ser autossuficiente: um agente de codificação vai ler SÓ esta spec (mais as dependências) para montar o plano técnico e implementar. Preencha todos os campos; se um não se aplica, escreva "Não se aplica" e o porquê.

### Spec 01 — Gravar galeria opcional junto com os modelos

- **Fase:** Fase 1 — Cadastro
- **Objetivo (o quê):** O admin grava um produto com modelos com galeria ou sem galeria. O preço do produto continua recusado nesse formato. O produto sem modelos continua como hoje.
- **Intenção (por quê):** A apresentação do produto pede mais de uma foto, e a foto do modelo é a foto da opção. Se a galeria continuar recusada, não existe capa separada. Se a galeria for obrigatória, o produto sem essas fotos deixa de poder ser cadastrado. Se o preço do produto voltar a ser gravado, o card fica com duas fontes de preço.
- **Contexto:** Criar produto é ação de admin. O produto já tem nome, descrição, categoria, subcategoria opcional, tamanhos, destaque, data, franquia opcional e características opcionais. O envio já aceita até quatro fotos de galeria e uma foto por modelo. Hoje, se há modelos, preço de produto ou qualquer foto de galeria recusa o cadastro inteiro, e a galeria não é gravada. Sem modelos, o cadastro exige preço numérico diferente de zero, ao menos um tamanho e ao menos uma foto. Não existe atualização de produto. Apagar produto continua como está. As regras de nome, foto e preço de cada modelo continuam as do PRD Modelo do produto.
- **Atores:** Admin autenticado.
- **Descrição do comportamento:** Se o envio não traz modelos, ou traz uma lista vazia, o sistema exige preço numérico diferente de zero, ao menos um tamanho e ao menos uma foto, e grava o produto sem modelos, como hoje. Se o envio traz ao menos um modelo, o sistema exige que cada modelo tenha nome, uma foto e preço, grava os modelos na ordem enviada e grava a galeria na ordem enviada quando houver ao menos uma foto. Galeria ausente ou vazia é válida nesse formato: o produto é gravado sem galeria. Preço de produto numérico, inclusive zero, recusa o cadastro inteiro, com ou sem galeria. Tamanhos continuam opcionais quando há modelos. Franquia, características, categoria, destaque e os demais campos obrigatórios de hoje continuam valendo nos dois formatos. Qualquer falha de validação ou de guarda de foto impede a criação. Nada parcial é gravado.
- **Entradas e saídas:** Entram os dados do produto que o cadastro já recebe: dados do produto, fotos de galeria opcionais e a lista de modelos. Cada modelo entra com nome, preço e um arquivo de imagem. Sai a confirmação de produto criado, ou a recusa com o motivo. O produto guardado, quando tem modelos, contém a lista ordenada de modelos. Quando a galeria foi enviada, contém a lista ordenada de fotos do produto. Não contém preço de produto.
- **Dados/entidades envolvidos (conceitual):** Produto: identidade, nome, descrição, categoria e o que o cadastro já guarda. Galeria: lista ordenada de fotos do produto, opcional quando há modelos, obrigatória quando não há. Eixo modelo: lista ordenada. Cada modelo: nome, uma foto, preço. Preço do produto: existe só no produto sem modelos.
- **Estados e transições:** Dois formatos, definidos na criação e estáveis depois, porque não há edição. Sem modelos: preço do produto, tamanhos e galeria. Com modelos: lista de modelos, galeria presente ou ausente, e tamanhos se enviados. Não há transição de um formato para o outro neste recorte.
- **Regras de negócio:**
  - Com modelos, galeria com uma ou mais fotos é gravada na ordem enviada. A primeira será a capa na leitura.
  - Com modelos, galeria ausente ou vazia grava o produto sem galeria.
  - Com modelos, preço de produto numérico, inclusive zero, recusa o cadastro. Ausência ou valor vazio não conta como preço enviado.
  - Cada modelo continua com exatamente uma foto. A quantidade de fotos de modelo tem que bater com a quantidade de modelos. Foto de modelo não entra na galeria, e foto de galeria não entra no modelo.
  - Nome do modelo, unicidade, preço zero do modelo e preço negativo do modelo continuam como no PRD Modelo do produto.
  - Tamanhos podem acompanhar os modelos. Não são obrigatórios.
  - Sem modelos, preço, tamanhos e ao menos uma foto continuam obrigatórios.
  - A ordem enviada da galeria e a ordem enviada dos modelos são as ordens guardadas.
- **Validações:** Aplicar antes de persistir. Recusar o envio inteiro no primeiro conjunto inválido, sem gravar produto pela metade e sem deixar foto órfã como se o produto existisse. Campos que já são validados hoje (nome, descrição, categoria, franquia quando preenchida, características, modelos) continuam valendo.
- **Fluxo do usuário (passo a passo):**
  1. O admin envia o cadastro com ou sem modelos, e com ou sem fotos de galeria.
  2. O sistema classifica o envio: com modelos ou sem modelos.
  3. O sistema valida o formato correspondente.
  4. O sistema guarda as fotos de modelo, as fotos de galeria quando existirem, e o produto.
  5. O admin recebe sucesso, ou a recusa sem produto criado.
- **Casos de borda e erros:**
  - Modelos e nenhuma foto de galeria, sem preço de produto: grava, sem galeria.
  - Modelos e uma foto de galeria, sem preço de produto: grava a galeria com essa foto na frente.
  - Modelos e quatro fotos de galeria: grava as quatro, na ordem enviada.
  - Modelos e preço de produto, inclusive zero, com ou sem galeria: não grava.
  - Um modelo sem foto, sem nome ou com preço zero: não grava, mesmo que a galeria esteja completa.
  - Quantidade de fotos de modelo diferente da quantidade de modelos: não grava.
  - Dois modelos com o mesmo nome, ignorando só os espaços das pontas: não grava.
  - Envio sem modelos, com preço, tamanhos e uma foto: grava no formato atual.
  - Envio sem modelos, sem foto, sem tamanho ou sem preço: não grava, como hoje.
  - Lista de modelos vazia: tratar como produto sem modelos.
  - Falha ao guardar uma foto de galeria ou de modelo: não grava o produto.
  - Admin sem autenticação: recusa, como hoje.
- **Impacto no existente:** O cadastro com modelos deixa de recusar a galeria e passa a gravá-la quando ela vier. Continua recusando o preço de produto. O formato sem modelos não muda. O detalhe administrativo, que devolve o produto gravado, passa a incluir a galeria quando ela existir. A rota de detalhe continua só de admin.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um admin autenticado e um produto sem preço de produto, sem galeria e com os modelos Pizza a 40 e Selfie a 80 nessa ordem, quando cria o produto, então o produto existe com esses dois modelos, nessa ordem, cada um com uma foto e o próprio preço, e sem galeria.
  - Dado um envio com esses modelos e com duas fotos de galeria, sem preço de produto, quando o admin cria, então a galeria tem as duas fotos nessa ordem e os modelos continuam gravados.
  - Dado um envio com modelos e com preço de produto 0, com ou sem galeria, quando o admin cria, então o produto não é gravado.
  - Dado um envio com modelos e com preço de produto 50 e com uma foto de galeria, quando o admin cria, então o produto não é gravado.
  - Dado um modelo sem foto e uma galeria com foto, quando o admin cria, então o produto não é gravado.
  - Dado um envio sem modelos, com preço, tamanhos e uma foto, quando o admin cria, então o produto é gravado no formato atual, sem modelos.
  - Dado um envio sem modelos e sem foto, quando o admin cria, então o produto não é gravado.
- **Definição de pronto:** Dá para criar produto com modelos e galeria, produto com modelos e sem galeria, e produto sem modelos. Preço de produto junto com modelos recusa o cadastro sem gravar produto inválido.
- **Dependências:** O cadastro de modelos já existente, com nome, uma foto e preço por modelo. As regras desse cadastro que não são a galeria nem a capa permanecem.
- **Fora do escopo desta spec:** Vitrine, listagem, carrinho, checkout, edição, migração e a tela da loja.

### Spec 02 — Escolher a capa e expor a galeria

- **Fase:** Fase 2 — Capa na leitura
- **Objetivo (o quê):** A listagem pública devolve a galeria e os modelos. A vitrine usa a primeira foto da galeria como capa quando a galeria existe, e a foto do primeiro modelo quando não existe. O preço do card continua o menor entre os modelos.
- **Intenção (por quê):** Se a vitrine continuar usando sempre a foto do primeiro modelo, a galeria gravada não vira capa. Se a vitrine esconder o produto sem galeria, o cadastro sem capa, que passou a ser válido, some da home. A loja precisa dos dois conjuntos na listagem para abrir no primeiro modelo e mostrar a galeria como apresentação.
- **Contexto:** A listagem pública devolve os produtos, com os filtros de categoria e subcategoria que já existem. A vitrine monta quatro grupos (destaques e franquias já configuradas), com o limite já existente de itens por grupo. Hoje, no produto com modelos, o card usa a foto do primeiro modelo e o menor preço, e o produto não é descartado por falta de preço de produto. No produto sem modelos, o card usa a primeira foto da galeria e o preço do produto. O detalhe do produto continua restrito ao admin. A página da loja é outro projeto e lê a listagem, não o detalhe.
- **Atores:** Visitante ou cliente que lê a listagem e a vitrine. Admin que lê o detalhe.
- **Descrição do comportamento:** Para produto com modelos, a listagem devolve os modelos na ordem do cadastro, cada um com nome, foto e preço. Se o produto tem galeria, a listagem também devolve essas fotos na ordem do cadastro. A listagem não escolhe uma capa única: devolve os dois conjuntos para a loja aplicar a regra. A vitrine, onde a leitura precisa de uma foto e um preço únicos, aplica a capa assim: se há ao menos uma foto na galeria, a foto do card é a primeira; se há modelos e não há galeria, a foto do card é a do primeiro modelo. O preço do card é o menor entre os modelos, nos dois casos. Produto com modelos e sem galeria permanece na vitrine, inclusive nos destaques, quando cumpre o filtro do grupo. Para produto sem modelos, listagem e vitrine continuam com a galeria e o preço do produto. A primeira foto da galeria segue sendo a capa desse formato. Filtros, ordem e limite da vitrine não mudam. O detalhe administrativo devolve o produto como foi gravado, incluindo a galeria quando existir, e segue exigindo admin. Carrinho e checkout não passam a usar a capa.
- **Entradas e saídas:** Entram os mesmos filtros de listagem e de vitrine de hoje. Sai o produto com modelos e, quando existir, com a galeria ordenada. Sai o card da vitrine com uma foto e um preço. No produto com modelos e galeria, essa foto é a primeira da galeria e esse preço é o menor entre os modelos. No produto com modelos e sem galeria, essa foto é a do primeiro modelo e esse preço é o menor. No produto sem modelos, foto e preço são os de hoje.
- **Dados/entidades envolvidos (conceitual):** Produto com ou sem modelos, e com ou sem galeria, como gravado na Spec 01. Card: uma foto e um preço. Galeria exposta: fotos na ordem do cadastro. Modelo exposto: nome, foto, preço, posição na lista.
- **Estados e transições:** Não se aplica. Esta spec só lê. Não muda estado do produto.
- **Regras de negócio:**
  - Ordem da galeria na leitura é a ordem do cadastro. Ordem dos modelos na leitura é a ordem do cadastro.
  - Capa de produto com modelos e com galeria é a primeira foto da galeria.
  - Capa de produto com modelos e sem galeria é a foto do primeiro modelo.
  - Preço de card e de vitrine de produto com modelos é o menor preço entre os modelos, mesmo que a capa seja uma foto da galeria e mesmo que o preço pertença a outro modelo.
  - A página, ao abrir, usa o primeiro modelo (foto e preço dele). A galeria é a apresentação e não substitui essa abertura. A API não escolhe outro modelo só porque ele é mais barato. Quem aplica isso é quem consome a lista.
  - Produto com modelos e sem galeria não sai da vitrine por falta de galeria.
  - Produto sem modelos não ganha lista de modelos na leitura. A capa dele continua sendo a primeira foto da galeria.
  - A listagem do carrinho de uma linha com modelo continua devolvendo a foto desse modelo. O pedido continua sem foto.
- **Validações:** Não se aplica a uma entrada de escrita. A leitura ignora produto que já seria ignorado hoje por nome vazio. Produto com modelos e preço de modelo não numérico não deve ser produzido pela Spec 01. Se aparecer dado inconsistente, esse produto não entra na vitrine.
- **Fluxo do usuário (passo a passo):**
  1. O cliente abre a home ou a listagem.
  2. O sistema devolve a vitrine com a capa desta spec e a listagem com galeria e modelos.
  3. A loja, em outro projeto, monta o card da listagem com a mesma regra da capa e abre a página no primeiro modelo.
  4. Se há galeria, a loja mostra essas fotos como apresentação. A API não recebe o clique de troca de modelo.
- **Casos de borda e erros:**
  - Produto com modelos, galeria e o modelo mais barato diferente do primeiro: o card mostra a primeira foto da galeria e o menor preço. A lista de modelos continua começando pelo primeiro, com o preço dele.
  - Produto com modelos, sem galeria, já gravado antes desta feature: entra na vitrine com a foto do primeiro modelo e o menor preço. Nada é reescrito no produto.
  - Produto sem modelos: capa e preço iguais aos de hoje.
  - Todos os modelos com o mesmo preço: o card mostra esse preço e a capa desta spec.
  - A foto que seria a capa não existe no dado: o card segue com o preço e sem foto, e o produto permanece na vitrine se o restante for válido.
  - Produto fora dos filtros de categoria, subcategoria, destaque ou franquia: continua de fora, como hoje.
  - Leitura de detalhe sem admin: continua negada.
  - Linha de carrinho com modelo: a foto devolvida continua sendo a do modelo, mesmo que o produto tenha galeria.
- **Impacto no existente:** A vitrine deixa de usar sempre a foto do primeiro modelo quando o produto com modelos tem galeria. Produto sem galeria mantém a capa que a vitrine já usa hoje, a foto do primeiro modelo, e não passa a ser escondido. A listagem pública, que já devolve o produto gravado, passa a incluir a galeria nos produtos com modelos que a tiverem. Qualquer leitura que já devolve a lista de fotos do produto passa a ver essa galeria. Isso não cria regra nova de avaliação. Carrinho, pedido e os três checkouts não mudam de foto nem de preço por causa da capa. A loja, em outro projeto, precisa usar a primeira foto da galeria como capa do card quando a galeria existir, e a foto do primeiro modelo quando não existir. Isso não faz parte desta spec.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um produto com galeria cuja primeira foto é a capa, e com Pizza a 40 e Selfie a 80, Selfie gravada primeiro, quando a vitrine é montada, então a foto do card é a primeira da galeria e o preço é 40.
  - Dado esse mesmo produto, quando a listagem pública é lida, então a galeria começa pela capa, o primeiro modelo é Selfie com preço 80 e a foto da Selfie, e Pizza vem depois com preço 40 e a foto dela.
  - Dado um produto com modelos, sem galeria, quando a vitrine é montada e ele cumpre o filtro do grupo, então ele aparece, a foto do card é a do primeiro modelo e o preço é o menor.
  - Dado um produto antigo com modelos e sem galeria, quando a vitrine é montada, então ele aparece com a foto do primeiro modelo, sem ter sido migrado.
  - Dado um produto sem modelos, quando a vitrine é montada, então a foto é a primeira da galeria e o preço é o preço do produto.
  - Dado uma linha de carrinho do modelo Selfie num produto que também tem galeria, quando o cliente lista o carrinho, então a foto da linha é a da Selfie.
  - Dado um cliente sem sessão de admin, quando pede o detalhe do produto, então o acesso continua negado.
- **Definição de pronto:** Listagem e vitrine cumprem os critérios acima para produto com galeria, produto com modelos sem galeria e produto sem modelos. Filtros, limite e grupos da vitrine permanecem. Carrinho não passa a devolver a capa no lugar da foto do modelo.
- **Dependências:** Spec 01 — o produto precisa poder estar gravado com modelos e galeria, e com modelos sem galeria.
- **Fora do escopo desta spec:** Cadastro, carrinho além de não trocar a foto da linha, checkout, tornar o detalhe público e implementar a tela da loja.

## 14. Ordem recomendada de implementação

1. Spec 01 — Gravar galeria opcional junto com os modelos
2. Spec 02 — Escolher a capa e expor a galeria

A Spec 01 grava o dado que a Spec 02 lê. Sem a galeria persistida, a vitrine não tem capa nova para escolher, e a listagem não tem apresentação para devolver. A Spec 02 não precisa esperar mudança de carrinho nem de checkout, porque esses fluxos continuam na foto e no preço do modelo. Seguir a ordem evita escolher capa em cima de um cadastro que ainda recusa a galeria.
