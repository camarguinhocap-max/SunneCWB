# SITE SUNNE SUL — Documento Mestre

> **REGRA DE OURO:** Este arquivo é a fonte da verdade do projeto.
> **Toda alteração feita no site DEVE ser refletida aqui neste arquivo, na mesma hora.**
> Se algo mudar no site e não for atualizado aqui, este documento perde o valor.
> Ao iniciar uma nova conversa para mexer no site, entregue este arquivo primeiro.

Última atualização: 2026-08-04

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
| Repositório | **GitHub** |
| DNS / Proxy / Segurança | **Cloudflare** (nameservers: yevgen.ns.cloudflare.com + katja.ns.cloudflare.com) |
| Deploy | Push no GitHub → Netlify publica automaticamente |
| Pasta local | `D:\Sites Claude\Sunne` |

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
- **Google Ads:** conta 946-424-1103. Tag base (gtag.js, `AW-18142105077`) instalada no
  `<head>` de todas as páginas. Ação de conversão **"Clique WhatsApp"** (categoria Contato,
  evento manual, contagem "Uma") criada em 04/08/2026 para medir cliques nos botões de
  WhatsApp vindos de tráfego pago. Snippet de clique adicionado (script inline, antes de
  `</body>`) em: index, energia-por-assinatura, assessor, blog, quem-somos,
  como-reduzir-conta-de-luz, energia-por-assinatura-vale-a-pena,
  mercado-livre-de-energia-residencial-2028. O script escuta clique em `.js-wa`,
  `.js-wa-split` e `#wa-float` e dispara `gtag('event','conversion',{'send_to':
  'AW-18142105077/dZ0sCKv0ktwcEPWb6spD'})`. Não adicionado em cartao.html/cartao-junior.html
  (cartões de visita pessoais, fora do escopo das campanhas).

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

| Pessoa/uso | WhatsApp | Onde aparece |
|--------|----------|--------------|
| **Josmair** (Camarguinho) | **5541998308282** | apenas no cartão dele (cartao.html) e no preset do qr.html |
| **Junior Mulbauer** | **5541984738591** | todos os botões de WhatsApp do site (fixo, rodapé, `.js-wa`) + cartao-junior.html |
| **CRM** | **5541999594737** | metade do rodízio dos botões "Quero economizar"/"Quero minha simulação real" em energia-por-assinatura.html (função `next-whatsapp`) |
| E-mail | **contato@sunnesul.com.br** | formulário, rodapés |

- Nome completo: Josmair Franco de Camargo Filho. Apelido usado no cartão/vCard: "Josmair".
- Formato do link: `https://wa.me/NUMERO?text=MENSAGEM` (visível no HTML, não só via JS).
- **Número banido: 5541987757984.** Não é de ninguém confirmado — provavelmente erro de digitação
  antigo. Apareceu por engano em 4 lugares (cartao.html, qr.html e nos dois arquivos da function
  next-whatsapp) e corrigido em 04/08/2026. Se esse número aparecer de novo em algum arquivo, é bug.
- **Rodízio "Quero economizar" (next-whatsapp):** alterna Junior/CRM a cada clique, contador guardado
  no Netlify Blobs. Existem DOIS arquivos da mesma function — `netlify/functions/next-whatsapp.mjs`
  (o correto, ativo) e `netlify/functions/next-whatsapp.js` (duplicata antiga que deveria ter sido
  apagada em commit anterior e voltou por engano num merge; **apagar manualmente pelo Explorer**).
  Também existe um `next-whatsapp.mjs` solto na RAIZ do site (fora de netlify/functions/) que é lixo
  de uma edição antiga e não faz nada — **apagar também**.

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

### Links curtos (_redirects)
`/junior` `/josmair` `/camarguinho` `/economizar` `/assinatura` `/assessor` `/blog`
e `/*` → `/404.html`. **Ao criar página nova, avaliar se merece link curto aqui.**

### Arquivos de apoio (raiz do site)
- **hero.mp4** — vídeo do hero (~27MB, keyframes densos keyint=10, essencial pro scrub suave)
- **hero-poster.jpg** — poster do vídeo
- **Sunne-nova-logo-19.webp** — logo Sunne (versão clara, pro fundo escuro)
- **ambient.mp3** — música de fundo do hero
- **foto.jpg** (Josmair) e **foto1.jpeg** (Junior) — fotos dos cartões
- **robots.txt** — libera crawlers de IA (GPTBot, ClaudeBot, PerplexityBot etc.) + sitemap
- **llms.txt** — índice do site para IAs (descrição, páginas, contatos)
- **sitemap.xml** — 8 URLs, sem .html
- **site.webmanifest** — ícones para "adicionar à tela inicial"

---

## 6. FUNCIONALIDADES E EFEITOS

- **Hero de vídeo com scroll-scrub:** vanilla JS, sem React. Vídeo avança conforme o scroll.
  Requer keyframes densos no mp4. Motor de energia e efeitos ficam INLINE em cada HTML.
- **Música de fundo (ambient.mp3):** loop, começa no primeiro gesto do usuário, para no fim do hero.
- **Velocímetro:** canto inferior esquerdo, vai de 0 a 180 milhões de MWh conforme o scroll
  do hero. Aparece SÓ durante o vídeo, some quando o hero termina. Número é **decorativo**.
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

### Pendências do dono (Camarguinho)
- [ ] **Apagar 2 arquivos pelo Explorer** (o sandbox não consegue apagar arquivo neste mount):
  `netlify/functions/next-whatsapp.js` (duplicata) e `next-whatsapp.mjs` da raiz do site (lixo)
- [ ] Google Meu Negócio — após formalizar a empresa (~2 meses)
- [ ] Coletar depoimentos reais dos primeiros clientes (com autorização) → preencher carrossel
- [ ] Decidir rótulo/número do velocímetro (hoje decorativo: 180 mi MWh)

### Backlog de melhorias (a fazer no site)
- [ ] QR code dentro dos próprios cartões (mostrar na tela e a pessoa escaneia)
- [ ] Mais artigos no blog (busca orgânica)
- [ ] Páginas por cidade (Londrina, Maringá, Joinville) para SEO regional
- [ ] Cabeçalho fixo na home, igual ao das subpáginas
- [ ] Página "quem somos" / prova social

---

## 10. CHECKLIST AO PUBLICAR UMA MUDANÇA

1. Baixar os arquivos alterados e colocar na pasta `D:\Sites Claude\Sunne`.
2. Conferir nomes de arquivo em minúsculas (o Netlify diferencia maiúsc/minúsc; o Windows não).
3. Push no GitHub → aguardar deploy no Netlify.
4. Se trocou imagem: **Purge Everything** no Cloudflare + Ctrl+Shift+R.
5. Se mexeu no formulário: testar um envio e conferir se chega no e-mail.
6. **ATUALIZAR ESTE ARQUIVO (.md) com o que mudou.**
