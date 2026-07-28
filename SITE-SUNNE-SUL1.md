# SITE SUNNE SUL — Documento Mestre

> **REGRA DE OURO:** Este arquivo é a fonte da verdade do projeto.
> **Toda alteração feita no site DEVE ser refletida aqui neste arquivo, na mesma hora.**
> Se algo mudar no site e não for atualizado aqui, este documento perde o valor.
> Ao iniciar uma nova conversa para mexer no site, entregue este arquivo primeiro.

Última atualização: 2026-07-28

---

## 0.1 NOVIDADES DE 2026-07-28 (a partir do deck "Programa de Expansão Sunne")

O usuário enviou o PDF interno de recrutamento de assessores da Sunne (marca-mãe, 86 slides,
"Programa de Expansão"). Foi feito um levantamento do que poderia virar conteúdo público; o
usuário aprovou 4 itens. **A maior parte do deck é plano de remuneração/MLM interno (comissões,
bônus, prêmios) e NÃO foi usada** — bate de frente com a regra da seção 7 de nunca mencionar
nem negar o custo do programa de assessor, e revela estrutura comercial interna que não é
para o público.

**O que foi adicionado:**

1. **Nova página `quem-somos.html`** (`/quem-somos`) — prova social: a Sunne Sul é apresentada
   como parceira licenciada da Sunne, marca fundada em 2018 em Fortaleza (CE). Cita investidores
   **Eneva** e **GVAngels** (verificados via imprensa: Suno, CanalEnergia, Eixos, Energia Hoje —
   aporte de R$1mi em 2021, depois R$5,5mi). Números de "trajetória nacional" (fundação, presença
   multirregional, "milhares de clientes") são atribuídos explicitamente à Sunne matriz, não à
   Sunne Sul, com nota de rodapé deixando isso claro. **Não foram usados**: número exato de
   "+30 mil clientes" e "23 estados" do deck (não verificáveis de forma independente), nem os
   logos "Endeavor"/"Scale Up" (não confirmados como investidores via fontes externas).
   Linkada no rodapé de todas as páginas principais + header de blog.html e dos artigos.

2. **`assessor.html`** — adicionado 1 parágrafo na seção "O momento certo" (id `#momento`)
   com a analogia "XP Investimentos criou a categoria de assessor de investimentos" aplicada a
   energia — sem citar nenhum valor ou percentual de comissão.

3. **Novo artigo `mercado-livre-de-energia-residencial-2028.html`**
   (`/mercado-livre-de-energia-residencial-2028`) — sobre a Lei 15.269/2025 e o cronograma de
   abertura do mercado livre de energia (nov/2027 comercial-industrial, nov/2028 residencial),
   verificado via busca (ASN Sebrae RN, Mercado Livre de Energia, MME). Linkado em `blog.html`
   (JSON-LD + card) e no topo da listagem.

4. **`energia-por-assinatura.html`** — 1 parágrafo novo no início da seção "Vantagens" sobre por
   que a conta de luz sobe (bandeira tarifária, encargos, mercado concentrado) — sem estatística
   não verificada (o deck citava "250% em 10 anos", que não foi usado por falta de fonte
   independente).

**Arquivos técnicos atualizados:** `sitemap.xml` (2 URLs novas) e `llms.txt` (seção de páginas
e de artigos). `_redirects` **não** precisou de alteração — as duas páginas novas seguem o
padrão de pretty URL automático do Netlify, igual às demais páginas `.html` da raiz.

**Pendência aberta desta rodada:** confirmar com o dono se os números de "trajetória Sunne"
em `/quem-somos` (fundação 2018, multirregional, milhares de clientes) devem ficar mais
específicos — hoje estão deliberadamente vagos por falta de fonte verificável para os números
exatos do deck.

---

## 0.2 NOVIDADE DE 2026-07-28 (2ª rodada) — Rodízio de WhatsApp

O site ganhou a **primeira peça de backend** (antes era 100% estático). Motivo: alternar
exatamente entre Junior e Josmair nos botões **"Quero economizar" / "Quero minha simulação
real"** de `energia-por-assinatura.html` (1º clique do site → Junior, 2º → Josmair, 3º →
Junior, e assim por diante — contador compartilhado entre todos os visitantes).

**Arquivos novos:**
- `netlify/functions/next-whatsapp.js` — Netlify Function (Node, `exports.handler`) que lê/
  incrementa um contador no **Netlify Blobs** (`getStore("whatsapp-round-robin")`, chave
  `counter-economizar`) e devolve `{ "number": "..." }`. Se o Blobs falhar por qualquer
  motivo, devolve sempre o número do Junior (fallback seguro).
- `package.json` (raiz) — só existe para declarar a dependência `@netlify/blobs`, necessária
  pra function funcionar. Não afeta o publish do site (o Netlify não precisa rodar build
  nenhum pro HTML, só instala essa dependência pra empacotar a function).
- `netlify.toml` (raiz) — declara `functions = "netlify/functions"`. **Não mexe** na pasta de
  publish do site (deixado como já estava configurado no painel Netlify, pra não arriscar
  quebrar o deploy do site estático).

**Como funciona no HTML:** os 4 botões relevantes em `energia-por-assinatura.html` (hero,
"como funciona", simulador, banda final) ganharam a classe extra `js-wa-split` além da
`js-wa` que já existia. Um novo `<script>` intercepta o clique nesses botões, chama
`/.netlify/functions/next-whatsapp` (timeout de 1.8s) e abre o WhatsApp do número
retornado. Se a function falhar ou demorar, cai no link padrão do Junior — o comportamento
não regride, só passa a ter uma chance extra de ir pro Josmair.

**Escopo — só esses 4 botões.** Ficaram de fora, por escolha do dono: o botão flutuante de
WhatsApp, o botão "Falar no WhatsApp" do header, os botões de `assessor.html` (recrutamento
continua indo só pro Junior) e as páginas de cartão (`cartao.html`/`cartao-junior.html`, que
têm que ir pro dono do cartão). Os CTAs dos artigos do blog ("Falar com um assessor") também
não foram incluídos — avaliar se o dono quer estender pra lá também.

**Limitação conhecida:** a leitura+escrita do contador no Blobs não é 100% atômica (não usa
`onlyIfMatch`/retry). Em tráfego baixo (site de negócio local) isso não é um problema real;
só em cliques simultâneos muito próximos (mesmo milissegundo) o rodízio poderia,
raramente, repetir um número em vez de alternar. Se o volume de leads crescer muito, dá pra
reforçar com concorrência otimista.

**Para testar depois do deploy:** abrir
`https://sunnesul.com.br/.netlify/functions/next-whatsapp` duas vezes seguidas no navegador
(ou via curl) — o `number` retornado deve alternar entre `5541984738591` (Junior) e
`5541998308282` (Josmair).

---

## 0. CHANGELOG / ESTADO ATUAL (leia primeiro)

> Esta seção foi reconstruída em **2026-07-28** comparando o `.md` (parado em 24/07) com o
> conteúdo **real do repositório GitHub** (`camarguinhocap-max/SunneCWB`, branch `main`).
> **Não foi possível ler as datas dos commits** (API do GitHub bloqueada por limite de IP),
> então o que segue é o *estado final* dos arquivos hoje, não a linha do tempo de cada mudança.

**Divergências encontradas entre o `.md` antigo e o site real:**

1. **Foto do cartão do Josmair — POSSÍVEL BUG AO VIVO.** O `.md` dizia que a foto era
   `foto.jpg`, mas **esse arquivo não existe mais no repo**. O `cartao.html` ainda aponta
   para `foto.jpg` (linhas 42 e 242). Resultado provável: **foto quebrada no cartão do
   Josmair.** → Conferir no navegador e corrigir (pendência registrada na seção 9).

2. **Efeitos NÃO são mais totalmente inline.** Existe um **`energy.js`** externo, que é
   referenciado pelo `index.html`. O motor de energia foi extraído para esse arquivo.
   (A seção 6 foi corrigida.)

3. **Arquivos novos na raiz que o `.md` não listava.** Ver seção 5. Três deles **não são
   referenciados por nenhum HTML** — tratados aqui como "presentes, sem uso confirmado no
   código; confirmar se são backup antes de remover":
   - `sunnesite.mp4` (~48 MB) — nenhum HTML aponta para ele.
   - `hero.zip` (~27 MB) — nenhum HTML aponta para ele (parece backup do `hero.mp4`).
   - `ikoliks_aj-background-music-320427.mp3` — **idêntico** ao `ambient.mp3` (mesmo MD5);
     o site usa `ambient.mp3`, este é duplicata.

4. **Logo em duas versões.** Além de `Sunne-nova-logo-19.webp` (usada em todas as páginas),
   existe `Sunne-nova-logo-19-115px.webp` (versão pequena, usada no `index.html`, provável
   `srcset`). Também existe `sunne-fundo-verde.png` no repo (uso não confirmado no código).

**Pendências do backlog conferidas contra o código (continuam PENDENTES):**
- Carrossel de depoimentos: segue **oculto** (array `DEPOIMENTOS` vazio no `index.html`). ✔ pendente
- QR dentro dos cartões: **não** implementado (nenhum canvas/QR em `cartao.html`). ✔ pendente
- Velocímetro: segue em **180 milhões de MWh** (`var MAX = 180000000` no `index.html`). ✔ pendente
- Cabeçalho fixo na home: **não confirmado** nesta revisão (achei `sound` e `gauge` fixos,
  não um header). Verificar no chat novo.

---

## 1. O QUE É O NEGÓCIO

**Sunne Sul** é uma operação **parceira** da marca **Sunne** (site oficial: sunne.com.br).
Vende **energia limpa por assinatura**: o cliente recebe créditos de energia de usinas
solares, abatidos na conta de luz, com desconto de **até 20%** (é um teto, não garantia).
Sem obras, sem instalação, sem investimento inicial e sem taxa de adesão **para o cliente**.

Também recruta **Assessores de Energia** (quem vende/atende). **Atenção:** o programa de
assessor **tem custo de entrada**, mas isso **NÃO** deve ser mencionado no site nem negado —
o site simplesmente não fala em valores de investimento do assessor. Serve para filtrar
curiosos de quem quer trabalhar de verdade. O contato do programa vai para o WhatsApp do
Junior (nunca colocar link de checkout/Kiwify no site).

**Base legal do serviço:** ANEEL, Lei 14.300/2022, Resolução Normativa 1.059/2023.

### Área de atendimento
Base em **Curitiba/PR**, mas atende **todo o Paraná** e, quando possível, estados vizinhos:
**Santa Catarina, São Paulo e Mato Grosso do Sul**. Curitiba é só a base, não o limite.

---

## 2. INFRAESTRUTURA

| Item | Valor |
|------|-------|
| Domínio | **sunnesul.com.br** (registrado no Registro.br) |
| Hospedagem | **Netlify** — subdomínio `sunnecwb.netlify.app` |
| Repositório | **GitHub** — `camarguinhocap-max/SunneCWB` (branch `main`) |
| DNS / Proxy / Segurança | **Cloudflare** (nameservers: yevgen.ns.cloudflare.com + katja.ns.cloudflare.com) |
| Deploy | Push no GitHub → Netlify publica automaticamente |
| Pasta local | `D:\Sites Claude\Sunne` |
| Functions | **Desde 2026-07-28:** `netlify/functions/next-whatsapp.js` (rodízio de WhatsApp), usa Netlify Blobs. Ver seção 0.2. |

### DNS no Cloudflare
- `@` (raiz): CNAME → `apex-loadbalancer.netlify.com` — **proxy LARANJA (ligado)**
- `www`: CNAME → `sunnecwb.netlify.app` — **proxy LARANJA (ligado)**
- Redirect Rule: `www.sunnesul.com.br` → `https://sunnesul.com.br` (301, dinâmica, preserva path)
- **SSL/TLS = Full (strict)** — obrigatório. Se cair em Flexible, o site entra em loop.
- Always Use HTTPS: ON · Automatic HTTPS Rewrites: ON · Min TLS 1.2 · Bot Fight Mode: ON
- **HSTS: desligado** (por enquanto)
- Brotli e "Security Level" não existem mais no painel (automáticos/descontinuados)
- **Após trocar qualquer imagem: Caching → Purge Everything** (o proxy guarda cache)

### E-mail — contato@sunnesul.com.br
- Recebimento via **Cloudflare Email Routing** (Enabled).
- Regra de roteamento: `contato@sunnesul.com.br` → `contato.sunnesul@gmail.com` (Active).
- Registros MX: route1/2/3.mx.cloudflare.net + TXT DKIM (`cf2024-1._domainkey`) + SPF
  (`v=spf1 include:_spf.mx.cloudflare.net ~all`). Não apagar esses TXT.
- Catch-all fica Disabled/Drop de propósito.

### Formulário de contato (Netlify Forms)
- Nome do form: **contato**. Envio via `fetch` (sem recarregar a página).
- Precisa do **form-espelho oculto** logo após `<body>` para o Netlify detectar os campos.
- Campos: nome, sobrenome, telefone, **email**, assunto (select), mensagem.
- **Ao mudar qualquer campo:** atualizar os DOIS forms (visível + espelho) e refazer deploy
  (o Netlify redetecta os campos no build; pode exigir "Clear cache and deploy").
- Notificação por e-mail configurada no Netlify → cai em contato@sunnesul.com.br e no Gmail.
- Honeypot `bot-field` ativo contra spam.

### Google
- **Search Console:** propriedade tipo Domínio, verificada por TXT no Cloudflare, sitemap enviado.
- **Google Meu Negócio:** AINDA NÃO criar. Esperar a empresa ser formalizada (~2 meses).
  Sem endereço fixo, usar formato "área de atendimento". Perfil reprovado é difícil recuperar.

---

## 3. IDENTIDADE VISUAL

| Uso | Cor | Hex |
|-----|-----|-----|
| Primária (verde Sunne) | verde | `#23A455` |
| Secundária (sol) | dourado | `#F5B23E` |
| Fundo (palco escuro) | quase-preto | `#0A0A0B` |
| Fundo secundário | grafite | `#111013` |
| Texto sobre escuro | creme | `#F6F2EA` |
| Texto suave | cinza | `#9A948B` |
| Tinta sobre verde | verde-escuro | `#04120A` |

- **Fontes:** Fraunces (display/títulos) + Hanken Grotesk (interface/corpo). Via Google Fonts.
- **Favicon:** gerado do "S" laranja sobre vinho. Arquivos: favicon.ico (multi 16-256),
  favicon-16/32/48/192/512.png, apple-touch-icon.png (180), site.webmanifest.

---

## 4. CONTATOS

| Pessoa | WhatsApp | Onde aparece |
|--------|----------|--------------|
| **Josmair** (Camarguinho) | **5541998308282** | apenas no cartão dele (cartao.html) |
| **Junior Mulbauer** | **5541984738591** | todos os botões de WhatsApp do site + cartao-junior.html |
| E-mail | **contato@sunnesul.com.br** | formulário, rodapés |

- Nome completo: Josmair Franco de Camargo Filho. Apelido usado no cartão/vCard: "Josmair".
- Formato do link: `https://wa.me/NUMERO?text=MENSAGEM` (visível no HTML, não só via JS).

---

## 5. PÁGINAS E ARQUIVOS

### URLs servidas SEM `.html` (Netlify pretty URLs)
Todos os links internos, canonical, sitemap e llms.txt usam a forma **sem** `.html`.

| Arquivo | URL | O que é |
|---------|-----|---------|
| index.html | `/` | Home: hero de vídeo scroll, teaser cliente, teaser assessor, depoimentos (oculto até ter), mídia, contato, rodapé |
| energia-por-assinatura.html | `/energia-por-assinatura` | Página do cliente: benefícios, como funciona, **simulador de economia**, FAQ |
| assessor.html | `/assessor` | Recrutamento: 2 trilhas, por que agora, 3 etapas (Cadastro→Validação→Início), FAQ |
| blog.html | `/blog` | Índice do blog |
| energia-por-assinatura-vale-a-pena.html | `/energia-por-assinatura-vale-a-pena` | Artigo |
| como-reduzir-conta-de-luz.html | `/como-reduzir-conta-de-luz` | Artigo |
| cartao.html | `/cartao` ou `/josmair` `/camarguinho` | Cartão de visita do Josmair |
| cartao-junior.html | `/cartao-junior` ou `/junior` | Cartão de visita do Junior |
| 404.html | (erro) | Página de erro personalizada |
| qr.html | `/qr` | Gerador interno de QR Code (noindex) |
| quem-somos.html | `/quem-somos` | **Nova (2026-07-28).** Prova social: Sunne Sul como parceira da Sunne, trajetória e investidores da marca-mãe |
| mercado-livre-de-energia-residencial-2028.html | `/mercado-livre-de-energia-residencial-2028` | **Nova (2026-07-28).** Artigo sobre a Lei 15.269/2025 e abertura do mercado livre residencial |

### Links curtos (_redirects)
`/junior` `/josmair` `/camarguinho` `/economizar` `/assinatura` `/assessor` `/blog`
e `/*` → `/404.html`. **Ao criar página nova, avaliar se merece link curto aqui.**

### Arquivos de apoio (raiz do site)
**Em uso (confirmado no código):**
- **hero.mp4** — vídeo do hero (~27MB, keyframes densos keyint=10, essencial pro scrub suave)
- **hero-poster.jpg** — poster do vídeo
- **energy.js** — motor de energia/efeitos do fundo, referenciado pelo `index.html`
- **Sunne-nova-logo-19.webp** — logo Sunne (versão clara, pro fundo escuro) — usada em TODAS as páginas
- **Sunne-nova-logo-19-115px.webp** — versão pequena da logo, usada no `index.html` (srcset)
- **ambient.mp3** — música de fundo do hero
- **foto1.jpeg** (Junior) — foto do cartão do Junior
- **foto.jpg** (Josmair) — **ATENÇÃO: referenciada pelo cartao.html mas AUSENTE do repo** (ver seção 0 e 9)
- **robots.txt** — libera crawlers de IA (GPTBot, ClaudeBot, PerplexityBot etc.) + sitemap
- **llms.txt** — índice do site para IAs (descrição, páginas, contatos)
- **sitemap.xml** — 8 URLs, sem .html
- **site.webmanifest** — ícones para "adicionar à tela inicial"
- favicons: favicon.ico + favicon-16/32/192/512.png + apple-touch-icon.png

**Presentes no repo, SEM uso confirmado no código (confirmar se são backup antes de remover):**
- **sunnesite.mp4** (~48 MB) — nenhum HTML referencia.
- **hero.zip** (~27 MB) — nenhum HTML referencia; parece backup do hero.mp4.
- **ikoliks_aj-background-music-320427.mp3** — duplicata exata de `ambient.mp3` (mesmo MD5).
- **sunne-fundo-verde.png** — uso não localizado no código.

---

## 6. FUNCIONALIDADES E EFEITOS

- **Hero de vídeo com scroll-scrub:** vanilla JS, sem React. Vídeo avança conforme o scroll.
  Requer keyframes densos no mp4. **O motor de energia/efeitos está em `energy.js` (externo),
  referenciado pelo `index.html`** (antes o `.md` dizia "inline"; foi extraído).
- **Música de fundo (ambient.mp3):** loop, começa no primeiro gesto do usuário, para no fim do hero.
- **Velocímetro:** canto inferior esquerdo, vai de 0 a 180 milhões de MWh (`var MAX = 180000000`)
  conforme o scroll do hero. Aparece SÓ durante o vídeo, some quando o hero termina. Número é **decorativo**.
- **Brilho que segue o mouse (#energy-spot):** MANTER. É o efeito de luz do fundo.
- **Linha em zig-zag de energia:** REMOVIDA (desativada via CFG baseAlpha:0, coreAlpha:0,
  spark:false). Não reativar sem pedido.
- **Botão flutuante de WhatsApp:** ícone redondo, canto inferior direito, fixo. Aparece após
  rolar ~25% da tela. Vai para o WhatsApp do Junior.
- **Simulador de economia** (energia-por-assinatura): digita valor da conta + slider 10-20%,
  mostra economia mês/ano. É estimativa, deixa isso claro.
- **Carrossel de depoimentos** (home): PRONTO mas OCULTO até preencher o array `DEPOIMENTOS`
  no script. Só publicar depoimento real e COM autorização do cliente (nome + foto).
- **Faixa "Sunne na mídia":** links reais (Valor, Exame, Startups.com.br, Suno). Deixa claro
  que Sunne Sul é assessora da marca — não dá a entender que a imprensa falou da Sunne Sul.
- **Gerador de QR (qr.html):** gera QR ESTÁTICO (aponta direto pro site, não expira), com o
  logo da Sunne no centro. Logo embutido em base64 (funciona offline). Correção nível H.

---

## 7. REGRAS DE CONTEÚDO (o que pode e o que não pode)

- **Nunca copiar texto verbatim** do sunne.com.br. Reescrever com palavras próprias.
- **Nunca** afirmar economia garantida — "até 20%" é teto, sempre com ressalva.
- **Programa de assessor:** não citar custo, mas não prometer que é grátis/sem investimento.
- **"Sem investimento / sem taxa"** vale só para o CLIENTE, nunca para o assessor.
- **Não usar** nome, foto ou depoimento de terceiros sem autorização (inclui os depoimentos
  do site oficial da Sunne — são de parceiros B2B da Sunne, não clientes da Sunne Sul).
- **Não usar** logotipos de veículos de imprensa (só o nome escrito).
- Tom honesto: dizer inclusive para quem o serviço/programa NÃO serve gera mais confiança.

---

## 8. SEO — PADRÃO A MANTER EM TODA PÁGINA NOVA

Toda página precisa ter:
- `<title>` único e `<meta name="description">` focados em busca local (Paraná/região).
- `<link rel="canonical">` na forma SEM .html.
- Open Graph (og:title, og:description, og:image, og:url) — importa pro preview no WhatsApp.
- 1 (um) `<h1>` por página.
- Dados estruturados JSON-LD quando fizer sentido (LocalBusiness, FAQPage, Person, BlogPosting).
- Geo tags (BR-PR, Curitiba) + coverage (PR, SC, SP, MS).
- Favicon + apple-touch-icon + manifest (bloco padrão no `<head>`).
- **Ao criar página:** adicionar ao sitemap.xml, ao llms.txt e (se fizer sentido) ao _redirects.

---

## 9. PENDÊNCIAS E BACKLOG

### 🔴 Corrigir com prioridade (achado em 2026-07-28)
- [ ] **Foto do cartão do Josmair quebrada:** `cartao.html` referencia `foto.jpg`, que não
      existe no repo. Ou re-subir `foto.jpg`, ou apontar o `cartao.html` para o arquivo certo.
      Conferir no navegador primeiro.

### Pendências do dono (Camarguinho)
- [ ] Google Meu Negócio — após formalizar a empresa (~2 meses)
- [ ] Coletar depoimentos reais dos primeiros clientes (com autorização) → preencher carrossel
- [ ] Decidir rótulo/número do velocímetro (hoje decorativo: 180 mi MWh)
- [ ] Decidir o destino dos arquivos órfãos no repo (sunnesite.mp4, hero.zip, mp3 duplicado,
      sunne-fundo-verde.png) — manter como backup ou remover para aliviar o repo.

### Backlog de melhorias (a fazer no site)
- [ ] QR code dentro dos próprios cartões (mostrar na tela e a pessoa escaneia)
- [ ] Mais artigos no blog (busca orgânica)
- [ ] Páginas por cidade (Londrina, Maringá, Joinville) para SEO regional
- [ ] Cabeçalho fixo na home, igual ao das subpáginas (verificar se já não foi feito)
- [ ] Página "quem somos" / prova social

---

## 10. CHECKLIST AO PUBLICAR UMA MUDANÇA

1. Baixar os arquivos alterados e colocar na pasta `D:\Sites Claude\Sunne`.
2. Conferir nomes de arquivo em minúsculas (o Netlify diferencia maiúsc/minúsc; o Windows não).
3. Push no GitHub → aguardar deploy no Netlify.
4. Se trocou imagem: **Purge Everything** no Cloudflare + Ctrl+Shift+R.
5. Se mexeu no formulário: testar um envio e conferir se chega no e-mail.
6. **ATUALIZAR ESTE ARQUIVO (.md) com o que mudou.**
