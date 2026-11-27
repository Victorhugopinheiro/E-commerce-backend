# PRD — Compra sem conta

> Tipo: PRD de feature · Data: 2026-11-24
> **Status:** Aguardando implementação
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Uma pessoa sem conta passa a montar o carrinho, consultar o CEP e fechar a compra nas mesmas rotas de quem está logado. O carrinho dela vive por sete dias. A compra grava, uma vez e sem edição posterior, quem comprou: nome completo, e-mail, CPF e celular. O CPF serve à nota daquela compra. Não vira documento fixo da conta.

O endereço da entrega é preenchido a partir do CEP. O frete deixa de ser um valor fixo e passa a ser a opção mais barata e a mais rápida devolvidas pela cotação. Quem já tem conta e compra com o e-mail dessa conta vê o pedido no histórico dela, mesmo sem ter entrado na hora.

Esta entrega é a API. A tela da loja fica de fora. A tela consome o que esta API devolve.

## 2. Problema que resolve

Hoje o carrinho, o pedido e o pagamento exigem uma conta. O carrinho fica no cadastro da pessoa. O pedido exige o identificador dessa conta. O pagamento por boleto, PIX ou cartão do provedor brasileiro exige um CPF já salvo na conta e recusa a compra sem ele. O frete somado no cartão é R$ 5, e no provedor brasileiro também é R$ 5. Nenhum dos dois é uma escolha de quem compra. A consulta de CEP devolve rua, cidade, estado e código da cidade, e joga fora o bairro. A cotação de frete é outra chamada, e só funciona se quem chama enviar as medidas da caixa.

Quem sofre: a pessoa que quer comprar sem se cadastrar, e a operação, que não recebe nome, CPF e celular desta compra de um jeito estável. O que passa a ser possível: comprar sem conta, ver o endereço ao digitar o CEP, escolher entre o frete mais barato e o mais rápido, e achar essa compra no histórico da conta quando o e-mail já for de uma conta.

## 3. Público-alvo

- Visitante da loja, sem conta, que monta o carrinho e paga.
- Cliente com conta, que compra logado. O e-mail do checkout vem preenchido da conta e a API não aceita outro.
- Admin, que lista todos os pedidos, agora também os de visitante, com nome, e-mail, CPF e celular daquela compra.

A página é de outro projeto.

## 4. Objetivo do recorte atual

Permitir a compra com e sem conta nas rotas que já existem, guardar a identidade daquela compra sem alterá-la depois, cotar o frete de verdade a partir do CEP, e fazer o pedido aparecer no histórico da conta dona do e-mail.

## 5. Funcionalidades

**Essenciais:**

- Reconhecer o visitante por um cookie criado pela API, válido por sete dias, renovado enquanto ele usa o carrinho ou fecha a compra.
- Nas rotas de carrinho e nos três fechamentos de compra, atender o visitante quando não houver cookie de login. Cookie de login ausente chama o fluxo de visitante. Cookie de login inválido, expirado ou de conta que não existe mais continua recusado.
- Se os dois cookies existirem, a conta ganha.
- Guardar o carrinho do visitante por sete dias, com a mesma regra de linha do carrinho logado.
- Ao digitar o CEP, devolver o endereço para preencher o formulário e, no máximo, duas opções de frete: a mais barata e a mais rápida.
- Nos três fechamentos, gravar a identidade imutável da compra, o endereço, o frete recotado e o pedido.
- Não criar conta porque o visitante comprou. A segunda compra com o mesmo e-mail continua como visitante, salvo quando esse e-mail já for de uma conta criada de verdade.
- Quando o e-mail do visitante já for de uma conta, a compra funciona e entra no histórico dessa conta.
- Incluir a identidade da compra na listagem do próprio cliente e na listagem do admin.
- Ao entrar ou se cadastrar, somar o carrinho do visitante no carrinho da conta.
- Parar de oferecer o cadastro de CPF da conta e a leitura dessa identificação antiga.

**Desejáveis:**

- Nenhum neste recorte. O que parecia desejável está em "Fora do escopo".

## 6. Fora do escopo

- A tela da loja. O campo de e-mail bloqueado para quem está logado é comportamento da tela. A API, por sua vez, ignora um e-mail diferente do da conta.
- Carteira de endereços. O endereço da compra fica no pedido. Não entra na lista de endereços da conta.
- Avaliação de produto.
- Juntar o carrinho do visitante na entrada de admin.
- Trocar o e-mail de login durante a compra.
- CPF fixo na conta, e a rota que hoje grava ou lê esse CPF.
- Medidas e peso por produto. Toda cotação usa a mesma caixa.
- Frete grátis e frete expresso com preço fixo de R$ 0 e R$ 19,90.
- Enviar ao provedor brasileiro o CPF antigo da conta. O CPF enviado é o desta compra.
- Estoque.
- Histórico próprio para o visitante que não tem conta. Ele só vê a compra se entrar na conta dona do e-mail, quando essa conta existir.

## 7. Regras de negócio

Decisões confirmadas na sessão:

- Regra 1: Sem cookie de login, carrinho e os três fechamentos usam o fluxo de visitante. A API cria o cookie do visitante se ele ainda não existir, inclusive num fechamento feito sem passar pelo carrinho.
- Regra 2: Cookie de login expirado, inválido ou de conta apagada continua recusado. Não vira visita.
- Regra 3: Com cookie de login e cookie de visitante, vale a conta.
- Regra 4: O cookie do visitante dura sete dias e renova ao adicionar, remover, listar e fechar compra. O carrinho renova nos mesmos momentos. Expirado, a próxima chamada sem login abre outro visitante e um carrinho vazio. O pedido já gravado permanece.
- Regra 5: A linha do carrinho do visitante segue a regra do carrinho logado: produto, tamanho quando o produto tem tamanhos, modelo quando o produto tem modelos. Inclusão repetida da mesma linha soma 1. A primeira inclusão usa a quantidade enviada.
- Regra 6: Os itens do pedido vêm do corpo, nos dois casos. O servidor recota o preço no catálogo. Depois de gravar o pedido, só saem do carrinho as linhas compradas. O carrinho pode ficar diferente do pedido.
- Regra 7: Comprar como visitante não cria conta e não grava CPF na conta. A compra seguinte com o mesmo e-mail segue como visitante.
- Regra 8: Se o e-mail do visitante já existe numa conta, a compra funciona. O pedido fica nessa conta, para aparecer no histórico. A identidade da compra guarda o visitante, não a conta. Não pede login.
- Regra 9: Quem está logado não troca o e-mail nesta compra. A API usa o e-mail da conta e a conta da sessão. Um e-mail diferente no corpo é ignorado.
- Regra 10: CPF repetido não impede a compra. CPF não é gravado na conta por esta compra.
- Regra 11: Cada compra tem uma identidade própria, criada junto com o pedido e nunca alterada. Ela guarda o identificador do pedido, a conta ou o visitante, o nome completo, o e-mail, o CPF e o celular.
- Regra 12: Nome, e-mail e CPF ficam só nessa identidade. O celular fica nela e também numa cópia no endereço do pedido. As duas cópias nascem iguais e nenhuma das duas é editada depois.
- Regra 13: O endereço do pedido exige rua, número, bairro e CEP. Complemento é opcional. Cidade, estado e código da cidade vêm da consulta de CEP, não do corpo. Sem país no corpo, fica Brasil.
- Regra 14: A consulta de CEP devolve, junta, o endereço e o frete. O endereço traz rua, bairro, cidade, estado e código da cidade. Número e complemento não vêm preenchidos.
- Regra 15: A caixa de toda cotação é 20 cm de largura, 20 cm de altura, 10 cm de comprimento e 1 kg. O valor declarado é o preço dos itens calculado no servidor.
- Regra 16: A consulta recebe o CEP e os itens. O fechamento cota de novo com os itens da compra e a mesma caixa. O preço enviado pelo navegador não é cobrado.
- Regra 17: Entram na resposta só cotações com preço. Mostram-se a mais barata e a mais rápida, com transportadora, nome do serviço, preço e prazo. Se forem o mesmo serviço, a resposta tem uma opção. Sem cotação válida, o endereço volta e a lista de frete vem vazia.
- Regra 18: O fechamento cobra o serviço escolhido se a nova cotação ainda tiver preço para ele, mesmo que ele não seja mais o mais barato nem o mais rápido. O valor é o preço novo desse serviço. Sem preço para esse serviço, a compra é recusada.
- Regra 19: O pedido guarda o serviço escolhido, o nome, o preço cobrado e o prazo. Esse preço entra no total dos três fechamentos.
- Regra 20: No login e no cadastro, depois da conta aceita, as linhas do visitante somam a quantidade inteira na mesma combinação do carrinho da conta. Linha cujo produto sumiu, ou cujo modelo não existe mais, é descartada. A chave do visitante e o cookie saem mesmo assim. A resposta de login continua sendo sucesso e mensagem. Senha errada ou cadastro recusado não mexe no carrinho do visitante. A entrada de admin não junta.
- Regra 21: Se o armazenamento do visitante não responder no login, a conta entra, nada é somado e o cookie permanece para a próxima tentativa. Leva já gravada no carrinho da conta não soma de novo.
- Regra 22: Se o armazenamento do visitante não responder ao adicionar, remover ou listar, a chamada falha e não devolve carrinho vazio. O fechamento ainda grava o pedido. Se a limpeza das linhas falhar, o pedido vale e as linhas ficam até uma chamada seguinte ou até os sete dias.
- Regra 23: A listagem de pedidos da conta e a listagem do admin incluem a identidade daquela compra.
- Regra 24: As rotas de gravar CPF na conta e de ler a identificação antiga da conta deixam de existir. O pagamento brasileiro lê nome, e-mail, CPF e celular da identidade desta compra.
- Regra 25: O cliente de pagamento já salvo na conta só é reutilizado quando o e-mail desta compra é o e-mail dessa conta. Fora isso, o cliente de pagamento desta compra nasce do nome e do e-mail da identidade, sem substituir o identificador salvo na conta.

Leitura necessária do empate, não escolhida numa pergunta separada:

- Se dois serviços tiverem o mesmo menor preço, a opção barata é o de menor prazo entre eles. Se o prazo também empatar, vale o primeiro que a cotação devolveu. A opção rápida é o menor prazo. Se o preço também empatar, vale o primeiro.

## 8. Fluxos principais

### Fluxo 1 — Visitante monta o carrinho e compra

1. A pessoa envia um item sem cookie de login.
2. A API cria o cookie do visitante e guarda a linha.
3. Ela consulta o CEP com os itens. Recebe o endereço e até duas opções de frete.
4. Ela envia o fechamento com nome, e-mail, CPF, celular, endereço, itens, serviço de frete e forma de pagamento.
5. A API recota os itens, recota o frete, grava o pedido e a identidade, e tira do carrinho só as linhas compradas.
6. Se o e-mail não for de uma conta, o pedido fica só com o visitante. Se for, o pedido fica naquela conta e a identidade continua com o visitante.

### Fluxo 2 — Cliente logado compra

1. A pessoa já tem cookie de login. O e-mail do corpo, se vier diferente, é ignorado.
2. A consulta de CEP e o fechamento usam a conta.
3. A identidade da compra guarda a conta, o e-mail dela naquele momento, o nome completo enviado, o CPF e o celular.
4. O pedido entra no histórico dessa conta.

### Fluxo 3 — Visitante entra ou se cadastra

1. A conta é aceita.
2. As linhas válidas do visitante somam no carrinho da conta.
3. O cookie e o carrinho do visitante saem.
4. A pessoa passa a ver o carrinho da conta. Pedidos que ela fez antes com o e-mail dessa conta aparecem no histórico.

## 9. Critérios de aceite

- O visitante consegue adicionar, remover, listar e comprar sem conta.
- O sistema impede que um cookie de login inválido vire visita.
- O sistema não cria conta ao gravar a compra do visitante.
- Quando o e-mail já é de uma conta, a compra entra no histórico dessa conta.
- Quando o visitante compra de novo com um e-mail que não é de conta, o sistema não pede login.
- O sistema devolve endereço e frete na consulta de CEP, e cobra no fechamento o preço novo do serviço escolhido.
- O sistema não altera a identidade depois de criada.
- O sistema não oferece mais a gravação nem a leitura do CPF fixo da conta.
- Ao entrar na conta, o carrinho do visitante soma no carrinho da conta.

## 10. Stack

API em Node com Express e TypeScript. Dados em MongoDB. Sessão de login por cookie assinado, válida por um dia. Pagamento por Stripe e pelo provedor brasileiro já integrado. CEP pelo ViaCEP. Frete pelo Melhor Envio, que já é chamado pela API. O carrinho do visitante passa a ficar no Redis. Validação de CPF pelo validador já usado no projeto.

Não entra biblioteca nova de tela. Não entra outro banco no lugar do MongoDB.

## 11. Justificativa da stack

A compra, o carrinho, o CEP e os dois pagamentos já estão nesta API. O visitante precisa de um carrinho que expire e não ocupe o cadastro da conta. Redis cumpre esse prazo. ViaCEP e Melhor Envio já são as fontes de endereço e de frete. Trocar um deles quebraria a decisão de usar os dois.

## 12. Fases de construção

### Fase 1 — Visitante

Objetivo: a mesma rota de carrinho atender quem não está logado, sem criar conta.

Specs:

- Spec 01 — Carrinho do visitante

### Fase 2 — Entrega

Objetivo: digitar o CEP devolve o endereço e as duas opções de frete que serão cobradas.

Specs:

- Spec 02 — CEP, endereço e frete

### Fase 3 — Compra

Objetivo: os três fechamentos gravam pedido e identidade para visita e para conta, e o pagamento usa essa identidade.

Specs:

- Spec 03 — Identidade da compra e endereço do pedido
- Spec 04 — Fechar a compra
- Spec 05 — Pagamento com a identidade da compra
- Spec 06 — Confirmação do pagamento brasileiro sem conta

### Fase 4 — Depois da compra

Objetivo: o histórico mostra quem comprou, e entrar na conta aproveita o carrinho do visitante. O CPF fixo da conta sai.

Specs:

- Spec 07 — Histórico com a identidade
- Spec 08 — Juntar o carrinho ao entrar ou cadastrar
- Spec 09 — Retirar o CPF fixo da conta

## 13. Specs funcionais detalhadas

> Cada spec deve ser autossuficiente: um agente de codificação vai ler SÓ esta spec (mais as dependências) para montar o plano técnico e implementar. Preencha todos os campos; se um não se aplica, escreva "Não se aplica" e o porquê.

### Spec 01 — Carrinho do visitante

- **Fase:** 1
- **Objetivo (o quê):** Quem não está logado adiciona, remove e lista o carrinho nas rotas que já existem.
- **Intenção (por quê):** A compra sem conta começa no carrinho. Sem isso, a pessoa só conseguiria enviar os itens no fechamento e perderia a lista entre uma visita e outra.
- **Contexto:** O carrinho logado fica no cadastro da conta. A inclusão soma 1 quando a linha já existe e usa a quantidade enviada só na primeira inclusão. A linha é produto + tamanho, se o produto tiver tamanhos, + modelo, se o produto tiver modelos. A listagem descarta produto inexistente e modelo que não existe mais, devolve o preço atual e a foto do modelo quando houver, e grava essa limpeza. Sem cookie de login, essas rotas hoje recusam.
- **Atores:** Visitante. Cliente logado continua no fluxo atual.
- **Descrição do comportamento:** Sem cookie de login, a API cria um cookie de visitante se não houver um, guarda o carrinho ligado a esse visitante e responde no mesmo formato do carrinho logado. O cookie e o carrinho duram sete dias e renovam ao adicionar, remover e listar. Com cookie de login válido, o fluxo logado segue e o carrinho do visitante não é lido. Cookie de login presente, porém inválido, expirado ou de conta ausente, continua recusado.
- **Entradas e saídas:** Entram os mesmos dados de hoje: produto, quantidade, tamanho e modelo, conforme o produto exigir. Sai a mesma forma de resposta do carrinho logado. Na primeira chamada sem cookie de visitante, a resposta também passa a enviar esse cookie.
- **Dados/entidades envolvidos (conceitual):** Visitante: identificador opaco criado pela API. Carrinho do visitante: lista de linhas com produto, quantidade, tamanho opcional, modelo opcional e nome. Prazo de sete dias.
- **Estados e transições:** Sem cookie, nasce um visitante com carrinho vazio e a linha pedida. Com cookie válido, o carrinho existente muda. Expirado, nasce outro visitante e o carrinho anterior deixa de ser lido.
- **Regras de negócio:** Regras 1, 2, 3, 4 e 5.
- **Validações:** As mesmas da inclusão logada: produto existente, tamanho e modelo conferidos contra o produto. Quantidade ausente ou produto ausente recusam, como hoje.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa pede para incluir um item sem estar logada.
  2. A API grava a linha e devolve o carrinho.
  3. Ela lista e vê o preço atual.
  4. Ela remove. A quantidade cai 1, e a linha sai ao chegar a zero.
- **Casos de borda e erros:** Cookie de login inválido responde recusa, sem criar visitante. Armazenamento do visitante indisponível responde erro, sem carrinho vazio no lugar. Produto ou modelo inválido responde o mesmo erro da inclusão logada. Dois cookies: a conta é usada e o carrinho do visitante fica intocado.
- **Impacto no existente:** As rotas de carrinho deixam de exigir login quando o cookie de login não vem. Quem está logado não muda de regra.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado que não há cookie de login, quando a pessoa inclui um item, então a API cria o visitante, guarda a linha e devolve o carrinho no formato atual.
  - Dado um cookie de login expirado, quando a pessoa inclui um item, então a API recusa e não cria visitante.
  - Dado um carrinho de visitante com uma linha, quando a mesma combinação é incluída de novo, então a quantidade aumenta em 1.
  - Dado que o armazenamento do visitante não responde, quando a pessoa lista o carrinho, então a API falha e não devolve lista vazia.
- **Definição de pronto:** Visitante e cliente logado usam as mesmas rotas de carrinho, com as regras acima verificadas.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Fechar compra, CEP, frete, juntar carrinho no login.

### Spec 02 — CEP, endereço e frete

- **Fase:** 2
- **Objetivo (o quê):** Uma consulta com CEP e itens devolve o endereço para o formulário e até duas opções de frete.
- **Intenção (por quê):** Quem compra precisa ver a rua e o bairro ao digitar o CEP, e escolher um frete cujo preço a API consegue cobrar de novo no fechamento.
- **Contexto:** A consulta de CEP atual devolve rua, cidade, estado, CEP e código da cidade, sem bairro. A cotação atual é outra chamada e exige que o chamador envie largura, altura, comprimento, peso e valor. O produto não tem medidas. O fechamento hoje soma R$ 5 fixos no cartão e no provedor brasileiro. Esta spec substitui esses R$ 5 como origem do frete mostrado. O valor cobrado no pedido entra na Spec 04.
- **Atores:** Visitante e cliente logado. A consulta não exige login.
- **Descrição do comportamento:** A pessoa envia o CEP e os itens. A API consulta o CEP, precifica os itens no catálogo e cota o frete com uma caixa fixa de 20 cm por 20 cm por 10 cm e 1 kg. O valor declarado é a soma precificada, não um número enviado por fora. A resposta traz o endereço e somente a opção mais barata e a mais rápida entre as cotações que têm preço. Cada opção traz o identificador do serviço, a transportadora, o nome do serviço, o preço e o prazo.
- **Entradas e saídas:** Entram CEP e itens (produto, quantidade, tamanho e modelo). Sai o endereço: rua, bairro, cidade, estado, CEP e código da cidade. Número e complemento não vêm. Sai a lista de frete com zero, uma ou duas opções.
- **Dados/entidades envolvidos (conceitual):** Endereço sugerido. Opção de frete: serviço, transportadora, nome, preço, prazo. Caixa única da loja. Itens precificados no servidor.
- **Estados e transições:** Não se aplica. A consulta não grava pedido nem carrinho.
- **Regras de negócio:** Regras 14, 15, 16 e 17, mais a leitura de empate da seção 7.
- **Validações:** CEP no formato de hoje, oito dígitos com ou sem hífen. CEP inexistente falha. Itens que o catálogo recusaria no pedido também recusam a cotação. Sem itens, a consulta falha.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa informa o CEP e os itens que pretende comprar.
  2. A API devolve a rua, o bairro, a cidade, o estado e o código da cidade.
  3. A API devolve a opção mais barata e a mais rápida, quando existirem.
- **Casos de borda e erros:** CEP inválido ou não encontrado falha, sem frete. Nenhuma cotação com preço: o endereço volta e a lista de frete vem vazia. A mais barata e a mais rápida são o mesmo serviço: uma opção só. Dois serviços com o mesmo menor preço: a barata é a de menor prazo; persistindo o empate, a primeira devolvida. Serviço que volta só com erro não aparece.
- **Impacto no existente:** A consulta de CEP passa a incluir bairro e as opções de frete. A cotação que exige medidas enviadas pelo chamador deixa de ser a forma de obter o frete desta compra. Os R$ 5 fixos deixam de ser a oferta mostrada.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um CEP válido e itens precificáveis, quando a pessoa consulta, então recebe rua, bairro, cidade, estado, código da cidade e no máximo duas opções com preço.
  - Dado que o chamador envia um preço de frete, quando a consulta responde, então esse preço não é o preço das opções.
  - Dado um CEP que a consulta não encontra, quando a pessoa consulta, então a API falha.
  - Dado que só uma cotação tem preço, quando a pessoa consulta, então a lista tem essa única opção.
- **Definição de pronto:** A consulta devolve endereço e frete com a caixa fixa, sem usar preço nem medidas vindos do navegador.
- **Dependências:** Nenhuma para a consulta. O uso da opção escolhida no pedido depende da Spec 04.
- **Fora do escopo desta spec:** Gravar o pedido, cobrar, escolher medidas por produto.

### Spec 03 — Identidade da compra e endereço do pedido

- **Fase:** 3
- **Objetivo (o quê):** Definir os dados imutáveis de quem comprou e o endereço guardado no pedido.
- **Intenção (por quê):** A nota e o histórico precisam do nome, do e-mail, do CPF e do celular daquela compra, mesmo se a pessoa comprar de novo ou se a conta mudar o e-mail depois.
- **Contexto:** O pedido hoje exige a conta e guarda rua, número, cidade, estado, CEP, país, código da cidade e celular opcional. Não guarda bairro nem complemento. Existe uma identificação da conta com CPF, nome e sobrenome, única por CPF, que o pagamento brasileiro lê. Esta spec substitui essa identificação da conta pela identidade de uma compra. A criação efetiva no fechamento está na Spec 04. A retirada das rotas antigas está na Spec 09.
- **Atores:** Visitante e cliente logado, no momento em que a compra é aceita.
- **Descrição do comportamento:** Toda compra aceita ganha uma identidade que não muda mais. Ela aponta para o pedido. Se havia login, aponta para a conta. Se não havia, aponta para o visitante, mesmo quando o pedido em si fica na conta dona do e-mail. Guarda o nome completo como foi digitado, o e-mail usado nesta compra, o CPF e o celular. O pedido guarda o endereço: rua, número, bairro, complemento opcional, CEP, cidade, estado, código da cidade, país e uma cópia do celular. Cidade, estado e código da cidade vêm da consulta de CEP feita de novo no fechamento. País ausente vira Brasil.
- **Entradas e saídas:** Entram nome completo, e-mail, CPF, celular e endereço. Sai a identidade ligada ao pedido e o endereço dentro do pedido. Não há alteração posterior.
- **Dados/entidades envolvidos (conceitual):** Identidade da compra: pedido, conta ou visitante, nome completo, e-mail, CPF, celular. Endereço do pedido: rua, número, bairro, complemento, CEP, cidade, estado, código da cidade, país, celular copiado.
- **Estados e transições:** Nasce com o pedido e permanece. Não há estado editável. Compra seguinte cria outra identidade.
- **Regras de negócio:** Regras 8, 9, 10, 11, 12 e 13.
- **Validações:** Nome, e-mail, CPF e celular obrigatórios. CPF passa no mesmo critério de CPF válido já usado no projeto. E-mail precisa ter formato de e-mail. Rua, número, bairro e CEP obrigatórios. Complemento pode faltar. CEP inexistente recusa a compra.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa envia os dados da compra.
  2. A API confere o CPF e o CEP.
  3. A API grava a identidade e o endereço junto com o pedido.
  4. Uma tentativa posterior de mudar essa identidade não altera o que foi gravado.
- **Casos de borda e erros:** CPF inválido recusa. Nome com uma palavra só é guardado inteiro no nome completo. E-mail de quem está logado é o da conta, não o do corpo. Visitante com e-mail de uma conta: o pedido aponta para a conta e a identidade aponta para o visitante.
- **Impacto no existente:** O pedido deixa de exigir conta. O celular do endereço passa a ser obrigatório como cópia. Bairro e complemento passam a existir no endereço. A identificação antiga da conta deixa de ser a fonte do CPF da compra.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma compra aceita, quando ela é gravada, então existe uma identidade com nome, e-mail, CPF e celular, e ela não muda se a pessoa comprar de novo.
  - Dado um cliente logado, quando o corpo traz outro e-mail, então a identidade guarda o e-mail da conta.
  - Dado um CEP válido, quando o corpo traz outra cidade, então o pedido guarda a cidade devolvida pela consulta de CEP.
  - Dado um CPF em formato inválido, quando a compra é enviada, então ela é recusada.
- **Definição de pronto:** Compra de visitante e de conta gravam identidade imutável e endereço com bairro, sem usar a identificação antiga da conta.
- **Dependências:** Spec 02, para a consulta de CEP reutilizada no fechamento. A gravação acontece na Spec 04.
- **Fora do escopo desta spec:** Chamar o provedor de pagamento, listar o histórico, apagar as rotas antigas de CPF.

### Spec 04 — Fechar a compra

- **Fase:** 3
- **Objetivo (o quê):** Os três fechamentos aceitam visitante e conta, recotam frete e gravam o pedido.
- **Intenção (por quê):** O carrinho e o CEP não concluem a venda. O pedido precisa nascer com o frete verdadeiro e com a identidade da Spec 03.
- **Contexto:** Existem três fechamentos: um simples, um por Stripe e um pelo provedor brasileiro. Os três exigem login, leem os itens do corpo, precificam no catálogo e removem do carrinho as linhas compradas. O simples não soma frete. Os outros somam R$ 5. O total e o serviço de frete passam a ser comuns aos três. O detalhe de cada provedor está na Spec 05.
- **Atores:** Visitante e cliente logado.
- **Descrição do comportamento:** Sem cookie de login, o fluxo é de visitante e cria o cookie se faltar. Com login válido, é a conta. A API precifica os itens, cota de novo o serviço de frete escolhido com a mesma caixa da Spec 02 e soma esse preço ao total. Grava o pedido com os itens, o endereço, o serviço, o nome do serviço, o preço cobrado, o prazo, a forma de pagamento e a conta, quando a compra pertence a uma conta. Grava a identidade da Spec 03. Remove do carrinho só as linhas cujo produto, tamanho e modelo foram comprados.
- **Entradas e saídas:** Entram itens, endereço, nome completo, e-mail, CPF, celular, forma de pagamento e o identificador do serviço de frete. Sai o pedido e, nos fechamentos que já devolvem link de pagamento, esse link. O cookie de visitante sai na resposta quando for criado.
- **Dados/entidades envolvidos (conceitual):** Pedido: itens precificados, total com frete, endereço, serviço de frete, preço do frete, prazo, forma de pagamento, conta opcional, visitante quando não houver conta no pedido. Identidade da compra, como na Spec 03.
- **Estados e transições:** O pedido nasce pendente, como hoje. A identidade nasce com ele e não muda. Não nasce identidade se o pedido não chega a ser gravado.
- **Regras de negócio:** Regras 1, 6, 7, 8, 9, 16, 18 e 19.
- **Validações:** Itens obrigatórios e aceitos pelo catálogo, como hoje. Serviço de frete obrigatório. A nova cotação precisa devolver preço para esse serviço. Dados da Spec 03 válidos. Forma de pagamento obrigatória, como hoje.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa envia o fechamento com o serviço escolhido na consulta.
  2. A API recusa se esse serviço não tiver preço na cotação nova.
  3. A API grava pedido e identidade.
  4. A API tira do carrinho as linhas compradas.
- **Casos de borda e erros:** Serviço ausente na cotação nova recusa, sem pedido. Itens que não estão no carrinho ainda podem ser comprados, porque a fonte é o corpo. Armazenamento do visitante fora do ar no fechamento: o pedido é gravado assim mesmo; as linhas que não puderem ser limpas permanecem. Cookie de login inválido recusa. Visitante cujo e-mail é de uma conta: o pedido fica nessa conta.
- **Impacto no existente:** Os três fechamentos deixam de exigir login. O total passa a incluir o frete cotado, também no fechamento simples, que hoje não soma frete. Os R$ 5 deixam de ser somados.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um visitante sem conta, quando o fechamento é válido, então nasce um pedido sem conta e uma identidade com o visitante.
  - Dado um e-mail que já é de uma conta e nenhum login, quando o fechamento é válido, então o pedido fica nessa conta e a identidade fica com o visitante.
  - Dado um serviço que a nova cotação não precifica, quando a pessoa fecha a compra, então não nasce pedido.
  - Dado que a limpeza do carrinho do visitante falha depois do pedido gravado, quando a API responde, então a compra continua valendo.
- **Definição de pronto:** Os três fechamentos gravam pedido, frete recotado e identidade para visita e para conta.
- **Dependências:** Spec 01 para o carrinho do visitante. Spec 02 para a caixa e a cotação. Spec 03 para a identidade e o endereço.
- **Fora do escopo desta spec:** O corpo enviado a cada provedor de pagamento, o webhook e o histórico.

### Spec 05 — Pagamento com a identidade da compra

- **Fase:** 3
- **Objetivo (o quê):** Stripe e o provedor brasileiro cobram esta compra com o nome, o e-mail, o CPF e o celular da identidade, e com o frete recotado.
- **Intenção (por quê):** O link de pagamento não pode usar o CPF antigo da conta nem os R$ 5 fixos, senão a nota e o total divergem do pedido.
- **Contexto:** O Stripe cria ou reutiliza um cliente de pagamento da conta com o e-mail e o nome da conta, e soma R$ 5 na sessão. O provedor brasileiro recusa sem CPF na identificação da conta, cria o cliente com nome e e-mail da conta, e envia na sessão de checkout um CPF, um e-mail e um celular. O webhook desses provedores fica para a Spec 06 no caso brasileiro. O Stripe já localiza o pedido pelo identificador gravado na sessão.
- **Atores:** Visitante e cliente logado, no fechamento correspondente.
- **Descrição do comportamento:** Os dois fechamentos usam o pedido e a identidade da Spec 04. O valor das linhas é o preço do catálogo. O frete entra como mais uma linha, com o preço recotado. O cliente de pagamento desta sessão usa o nome e o e-mail da identidade. O CPF e o celular enviados ao provedor brasileiro também vêm da identidade. Se a compra está numa conta e o e-mail da identidade é o e-mail dessa conta, o identificador de cliente de pagamento já salvo nela é reutilizado. Se não for, nasce um cliente de pagamento para esta sessão e o identificador salvo na conta não é trocado.
- **Entradas e saídas:** Entra o pedido com identidade. Sai a mesma resposta de hoje: endereço da sessão de pagamento. O pedido guarda o identificador dessa sessão, como hoje.
- **Dados/entidades envolvidos (conceitual):** Cliente de pagamento: nome, e-mail, e no provedor brasileiro também CPF e celular. Identificador de cliente já salvo na conta, reutilizado só quando os e-mails coincidem.
- **Estados e transições:** O pedido permanece pendente até a confirmação do provedor, como hoje.
- **Regras de negócio:** Regras 19, 24 e 25.
- **Validações:** Sem identidade, o fechamento não chama o provedor. CPF ausente na identidade recusa o provedor brasileiro. Falha ao abrir a sessão devolve erro, como hoje.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa escolhe o fechamento por cartão ou pelo provedor brasileiro.
  2. A API abre a sessão com os itens, o frete e os dados da identidade.
  3. A API devolve o endereço da sessão.
- **Casos de borda e erros:** Conta com cliente de pagamento salvo e e-mail igual: reutiliza. Visitante cujo pedido ficou numa conta, com o mesmo e-mail: também reutiliza o cliente dessa conta. E-mail diferente do da conta não ocorre para quem está logado. Provedor indisponível: a pessoa recebe erro. Se o pedido já tiver sido gravado e a sessão falhar, o pedido pendente permanece, como o fluxo atual já pode deixar pedido gravado antes do link.
- **Impacto no existente:** Os dois fechamentos deixam de ler o CPF da identificação antiga da conta e deixam de somar R$ 5. O nome enviado ao provedor brasileiro deixa de ser um nome fixo de exemplo.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um fechamento brasileiro válido, quando a sessão é aberta, então o CPF, o e-mail e o celular enviados são os da identidade desta compra.
  - Dado um frete de R$ 30 na recotação, quando a sessão é aberta, então esse valor entra na cobrança no lugar dos R$ 5.
  - Dado uma conta com cliente de pagamento salvo e o mesmo e-mail, quando a sessão é aberta, então esse cliente é reutilizado.
  - Dado uma compra cujo e-mail não é o da conta dona do cliente salvo, quando a sessão é aberta, então o identificador salvo na conta não muda.
- **Definição de pronto:** Os dois links de pagamento usam a identidade e o frete do pedido.
- **Dependências:** Spec 04.
- **Fora do escopo desta spec:** Mudar o webhook do Stripe além de ele continuar achando o pedido pelo identificador da sessão. A confirmação brasileira está na Spec 06.

### Spec 06 — Confirmação do pagamento brasileiro sem conta

- **Fase:** 3
- **Objetivo (o quê):** O aviso de pagamento do provedor brasileiro continua atualizando o pedido quando a compra não tem conta.
- **Intenção (por quê):** Sem isso, o visitante paga e o pedido permanece pendente, porque o registro do aviso hoje exige a conta.
- **Contexto:** O aviso acha o pedido pela sessão de checkout e grava um registro do evento antes de mudar o status. Esse registro exige a conta. Os status tratados hoje permanecem: pagamento criado, confirmado, falhado e estornado.
- **Atores:** O provedor brasileiro. Não é uma pessoa.
- **Descrição do comportamento:** O aviso continua achando o pedido pela sessão. O registro do evento aceita a conta do pedido quando ela existir, e o visitante da identidade quando o pedido não tiver conta. O status do pedido muda como hoje. Um evento já processado continua sem ser aplicado de novo.
- **Entradas e saídas:** Entra o aviso já aceito hoje. Sai o pedido com o status correspondente. Não sai dado novo para a loja.
- **Dados/entidades envolvidos (conceitual):** Aviso já processado: evento, e a conta ou o visitante da compra. Pedido: status e status de pagamento.
- **Estados e transições:** As mesmas de hoje: pendente, confirmado e pago, cancelado e falho, cancelado e estornado.
- **Regras de negócio:** Regra 11, no que diz que a identidade não muda com o aviso. O aviso não reescreve nome, e-mail, CPF nem celular.
- **Validações:** Pedido não encontrado para a sessão continua falha. Evento repetido continua ignorado.
- **Fluxo do usuário (passo a passo):**
  1. O provedor avisa que o pagamento foi confirmado.
  2. A API acha o pedido.
  3. A API grava o evento e marca o pedido como pago.
- **Casos de borda e erros:** Pedido de visitante sem conta: o evento é gravado com o visitante e o status muda. Pedido ligado a uma conta: o evento continua com a conta. Identidade da compra não é atualizada.
- **Impacto no existente:** O registro do aviso deixa de exigir conta. Pedido de quem está logado segue gravando a conta.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um pedido de visitante sem conta, quando chega a confirmação de pagamento, então o pedido fica pago e o evento fica registrado.
  - Dado o mesmo evento recebido de novo, quando a API processa, então o pedido não muda outra vez.
  - Dado um aviso de pagamento, quando ele é processado, então nome, e-mail, CPF e celular da identidade permanecem os mesmos.
- **Definição de pronto:** Pagamento brasileiro confirma pedido com conta e pedido só de visitante.
- **Dependências:** Spec 04 e Spec 05.
- **Fora do escopo desta spec:** Alterar os status já existentes ou o webhook do Stripe.

### Spec 07 — Histórico com a identidade

- **Fase:** 4
- **Objetivo (o quê):** A lista de pedidos da conta e a lista do admin trazem a identidade de cada compra.
- **Intenção (por quê):** Nome, e-mail e CPF não ficam no pedido. Sem eles na lista, o histórico não mostra quem comprou.
- **Contexto:** A lista da conta exige login e devolve os pedidos daquela conta. A lista do admin devolve todos os pedidos. Nenhuma das duas lê a identificação antiga.
- **Atores:** Cliente logado e admin.
- **Descrição do comportamento:** Cada pedido das duas listas vem acompanhado da identidade daquela compra: nome completo, e-mail, CPF e celular. Pedido de visitante cujo e-mail era de uma conta aparece na lista dessa conta. Pedido só de visitante, sem conta, não aparece na lista de uma conta. Aparece na lista do admin.
- **Entradas e saídas:** A lista da conta continua exigindo login. Sai a lista atual mais a identidade de cada pedido. A lista do admin segue restrita ao admin.
- **Dados/entidades envolvidos (conceitual):** Pedido e a identidade ligada a ele.
- **Estados e transições:** Não se aplica. A lista não muda status.
- **Regras de negócio:** Regras 8 e 23.
- **Validações:** Sem login, a lista da conta continua recusada. Admin segue como hoje.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa entra na conta.
  2. Pede os próprios pedidos.
  3. Vê cada compra com nome, e-mail, CPF e celular da época.
- **Casos de borda e erros:** Pedido antigo, de antes desta entrega, pode não ter identidade. A lista não falha por isso: o pedido volta e a identidade vem vazia. Visitante sem conta não tem lista própria.
- **Impacto no existente:** As duas listas passam a incluir a identidade. O restante do pedido permanece.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um pedido ligado a uma conta, quando essa conta lista os pedidos, então a resposta inclui nome, e-mail, CPF e celular da identidade.
  - Dado um pedido só de visitante, quando uma conta qualquer lista os pedidos, então esse pedido não aparece.
  - Dado um pedido só de visitante, quando o admin lista, então o pedido aparece com a identidade.
- **Definição de pronto:** As duas listas devolvem a identidade quando ela existir, sem exigir a identificação antiga da conta.
- **Dependências:** Spec 03 e Spec 04.
- **Fora do escopo desta spec:** Tela do histórico. Filtro novo. Paginação nova.

### Spec 08 — Juntar o carrinho ao entrar ou cadastrar

- **Fase:** 4
- **Objetivo (o quê):** Login e cadastro bem-sucedidos somam o carrinho do visitante no carrinho da conta e encerram o visitante.
- **Intenção (por quê):** A pessoa que montou o carrinho sem conta não deve perder as linhas ao entrar, nem continuar com dois carrinhos.
- **Contexto:** Login e cadastro hoje só criam a sessão. Não leem carrinho. O carrinho da conta é o da Spec 01 no lado logado. A entrada de admin não entra aqui.
- **Atores:** Pessoa que entra ou se cadastra com o cookie de visitante ainda presente.
- **Descrição do comportamento:** Depois da conta aceita, a API lê o carrinho do visitante. Descarta linha de produto inexistente ou de modelo que não existe mais. Soma a quantidade inteira na linha da conta com a mesma combinação. Copia a linha quando a conta ainda não a tem. Apaga o carrinho do visitante e o cookie. A resposta de login segue sendo sucesso e mensagem, sem listar o que foi descartado. Sem cookie de visitante, nada disso ocorre.
- **Entradas e saídas:** Entram e-mail e senha, ou os dados de cadastro, mais o cookie de visitante se existir. Sai a sessão da conta, como hoje, e a limpeza do cookie de visitante quando a soma acontece.
- **Dados/entidades envolvidos (conceitual):** Carrinho do visitante e carrinho da conta. Linha: produto, tamanho, modelo, quantidade, nome.
- **Estados e transições:** Visitante com carrinho passa a conta com essas quantidades somadas, e o visitante de carrinho deixa de existir. A sessão da conta passa a valer.
- **Regras de negócio:** Regra 20 e Regra 21.
- **Validações:** Senha errada ou cadastro recusado não leem nem apagam o carrinho do visitante. Linha morta não entra na conta.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa acerta a senha ou conclui o cadastro, com carrinho de visitante.
  2. A API soma as linhas válidas.
  3. A API encerra o visitante.
  4. A próxima leitura de carrinho, já logada, mostra a conta.
- **Casos de borda e erros:** Carrinho do visitante vazio: a conta entra e o cookie some. Armazenamento do visitante ilegível: a conta entra, nada é somado, o cookie fica. Soma já gravada na conta e limpeza do visitante falhou: a próxima entrada não soma essa leva de novo. Admin não junta.
- **Impacto no existente:** Login e cadastro passam a ler o carrinho do visitante quando o cookie existe. A resposta de sucesso não ganha campo novo.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um visitante com duas unidades de uma linha e uma conta com uma unidade da mesma linha, quando o login é aceito, então a conta fica com três e o cookie de visitante some.
  - Dado senha errada, quando a pessoa tenta entrar, então o carrinho do visitante permanece.
  - Dado que o armazenamento do visitante não responde, quando o login é aceito, então a conta entra e o cookie de visitante permanece.
  - Dado que a soma já foi gravada e a limpeza não, quando a pessoa entra de novo, então a quantidade não dobra.
- **Definição de pronto:** Entrar e cadastrar aproveitam o carrinho do visitante sem duplicar uma leva já somada.
- **Dependências:** Spec 01.
- **Fora do escopo desta spec:** Juntar na rota de admin. Avisar quais linhas foram descartadas.

### Spec 09 — Retirar o CPF fixo da conta

- **Fase:** 4
- **Objetivo (o quê):** A conta deixa de ter rota para gravar ou ler um CPF fixo.
- **Intenção (por quê):** Esse CPF era a trava da compra. A compra agora guarda o CPF na identidade do pedido. Manter a rota antiga faria dois lugares disputarem o documento.
- **Contexto:** Existe uma rota autenticada que grava CPF, nome e sobrenome, recusa segundo CPF na mesma conta e recusa CPF já usado. Existe outra que lê esse registro. O pagamento brasileiro deixou de lê-lo na Spec 05.
- **Atores:** Cliente logado que hoje chamaria essas rotas. Nesta spec, ninguém mais as usa.
- **Descrição do comportamento:** As duas rotas deixam de existir. Chamá-las responde que não há esse recurso. Nenhum dado de compra é migrado para a conta. Compras novas não escrevem nessa identificação antiga.
- **Entradas e saídas:** Não há entrada válida. A chamada recebe a resposta de rota inexistente.
- **Dados/entidades envolvidos (conceitual):** A identificação antiga da conta deixa de ser usada pelo fluxo de compra. Registros já gravados não são apagados por esta spec e não são lidos pela compra.
- **Estados e transições:** Não se aplica.
- **Regras de negócio:** Regras 10 e 24.
- **Validações:** Não se aplica. Não há corpo aceito.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa tenta gravar ou ler o CPF da conta.
  2. A API informa que a rota não existe.
- **Casos de borda e erros:** Conta que já tem CPF antigo continua podendo comprar. O CPF da compra nova é o enviado no fechamento, não o antigo.
- **Impacto no existente:** As duas rotas saem. O fechamento e o pagamento não as consultam.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um cliente logado, quando ele chama a gravação de CPF da conta, então a API não grava e responde que a rota não existe.
  - Dado um cliente logado, quando ele chama a leitura da identificação da conta, então a API responde que a rota não existe.
  - Dado uma conta com CPF antigo, quando ela compra com outro CPF válido, então a identidade da compra guarda o CPF enviado e a compra não é recusada por causa do antigo.
- **Definição de pronto:** Não há mais como gravar ou ler o CPF fixo da conta, e a compra não depende dele.
- **Dependências:** Spec 05, para o pagamento já ler a identidade da compra.
- **Fora do escopo desta spec:** Apagar registros antigos. Impedir que um CPF se repita entre compras.

## 14. Ordem recomendada de implementação

1. Spec 01 — Carrinho do visitante
2. Spec 02 — CEP, endereço e frete
3. Spec 03 — Identidade da compra e endereço do pedido
4. Spec 04 — Fechar a compra
5. Spec 05 — Pagamento com a identidade da compra
6. Spec 06 — Confirmação do pagamento brasileiro sem conta
7. Spec 07 — Histórico com a identidade
8. Spec 08 — Juntar o carrinho ao entrar ou cadastrar
9. Spec 09 — Retirar o CPF fixo da conta

Seguir essa ordem evita fechar a compra sem carrinho de visitante, sem frete recotado e sem identidade. O pagamento só muda depois que o pedido já nasce certo. O histórico e a junção do carrinho usam dados que as specs anteriores já gravam. A retirada do CPF antigo fica por último para não quebrar o pagamento antes de ele ler a identidade da compra.
