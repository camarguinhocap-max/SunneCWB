/* ============================================================================
   energy.js — Camada de energia da Sunne (marcante)
   - Linha eletrica em zig-zag que desce a pagina, "desenhada" conforme o scroll,
     com faisca dourada correndo na ponta e brilho verde no rastro.
   - Brilho (spotlight) que segue o mouse e pinta o fundo, com leve atraso.
   Uso: <script src="energy.js" defer></script> em qualquer pagina.
   Ajustes rapidos: objeto CFG abaixo.
   ========================================================================== */
(function () {
  const CFG = {
    green:      '#2FD173',   // verde eletrico (rastro)
    greenCore:  '#CFFFE3',   // nucleo claro da linha
    gold:       '#F5B23E',   // faisca na ponta
    lineWidth:  2.6,         // espessura do nucleo
    glow:       22,          // intensidade do brilho da linha (marcante)
    spotSize:   440,         // raio do brilho do mouse (px)
    spotAlpha:  0.26,        // intensidade do brilho do mouse
    ease:       0.12,        // suavidade do "seguir o mouse" (menor = mais atraso)
    segH:       230,         // altura de cada "perna" do zig-zag (px)
    marginX:    0.14,        // margem lateral (fracao da largura)
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(hover: none)').matches;

  /* -------------------------------- CSS -------------------------------- */
  const css = document.createElement('style');
  css.textContent = `
    #energy-spot, #energy-canvas {
      position: fixed; inset: 0; pointer-events: none;
    }
    #energy-spot {
      z-index: 5; mix-blend-mode: screen;
      background:
        radial-gradient(circle ${CFG.spotSize}px at var(--mx,50%) var(--my,50%),
          rgba(47,209,115,${CFG.spotAlpha}) 0%,
          rgba(47,209,115,${CFG.spotAlpha*0.28}) 38%,
          transparent 70%),
        radial-gradient(circle ${CFG.spotSize*1.5}px at var(--mx,50%) var(--my,50%),
          rgba(245,178,62,${CFG.spotAlpha*0.35}) 0%,
          transparent 60%);
      transition: opacity .4s ease;
    }
    #energy-canvas { z-index: 6; }
  `;
  document.head.appendChild(css);

  /* ------------------------------ Elementos ---------------------------- */
  const spot = document.createElement('div');
  spot.id = 'energy-spot';
  const canvas = document.createElement('canvas');
  canvas.id = 'energy-canvas';
  const ctx = canvas.getContext('2d');

  function mount() {
    document.body.appendChild(spot);
    document.body.appendChild(canvas);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  /* ------------------------------ Geometria ---------------------------- */
  let W = 0, H = 0, DPR = 1, startY = 0, pts = [];

  function heroBottom() {
    const el = document.querySelector('.hero, .hero__pin');
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return r.bottom + window.scrollY;
  }

  // gerador pseudo-aleatorio estavel (pra linha nao "dancar" a cada frame)
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

  function build() {
    W = window.innerWidth;
    H = document.documentElement.scrollHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    startY = heroBottom();
    const left = W * CFG.marginX, right = W * (1 - CFG.marginX);
    const rand = rng(1337);
    pts = [{ x: W * 0.5, y: startY }];
    let y = startY, side = 0;
    while (y < H) {
      const nextY = Math.min(y + CFG.segH, H);
      const targetX = side % 2 === 0 ? right : left;
      // ponto do meio com "quebra" pra dar cara de raio
      const midY = y + (nextY - y) * (0.45 + rand() * 0.1);
      const midX = W * 0.5 + (rand() * 2 - 1) * W * 0.10;
      pts.push({ x: midX, y: midY });
      // pequeno jag antes de chegar na lateral
      pts.push({ x: targetX + (rand() * 2 - 1) * 12, y: nextY - (nextY - y) * 0.18 });
      pts.push({ x: targetX, y: nextY });
      y = nextY; side++;
    }
  }

  /* ------------------------------ Mouse / touch ------------------------ */
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let tx = mx, ty = my;
  if (!coarse) {
    window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  }
  let driftT = 0;

  /* -------------------------------- Loop ------------------------------- */
  function draw(now) {
    // brilho do mouse (com atraso). No touch, faz uma deriva suave.
    if (coarse) {
      driftT += 0.006;
      tx = window.innerWidth  * (0.5 + 0.35 * Math.sin(driftT));
      ty = window.innerHeight * (0.5 + 0.30 * Math.cos(driftT * 0.8));
    }
    mx += (tx - mx) * CFG.ease;
    my += (ty - my) * CFG.ease;
    spot.style.setProperty('--mx', mx + 'px');
    spot.style.setProperty('--my', my + 'px');

    // linha de energia
    const scrollY = window.scrollY;
    ctx.clearRect(0, 0, W, window.innerHeight);

    // ponto "cabeca" da energia = onde o scroll chegou (meio-baixo da tela)
    const headDocY = Math.max(startY, Math.min(scrollY + window.innerHeight * 0.6, H));
    const flicker = reduce ? 1 : (0.82 + 0.18 * Math.abs(Math.sin(now * 0.02)) + Math.random() * 0.05);

    // rastro faint do caminho inteiro (o que ainda nao "energizou")
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], cy = p.y - scrollY;
      i ? ctx.lineTo(p.x, cy) : ctx.moveTo(p.x, cy);
    }
    ctx.strokeStyle = 'rgba(47,209,115,0.05)';
    ctx.lineWidth = 1; ctx.shadowBlur = 0;
    ctx.stroke();

    // parte energizada (ate a cabeca): glow verde + nucleo claro
    const drawUpTo = (color, width, blur, alpha) => {
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (p.y > headDocY) {
          // interpola o ultimo trecho ate a cabeca
          const prev = pts[i - 1];
          if (prev) {
            const t = (headDocY - prev.y) / (p.y - prev.y);
            const hx = prev.x + (p.x - prev.x) * t;
            ctx.lineTo(hx, headDocY - scrollY);
          }
          break;
        }
        const cy = p.y - scrollY;
        started ? ctx.lineTo(p.x, cy) : (ctx.moveTo(p.x, cy), started = true);
      }
      ctx.strokeStyle = color; ctx.lineWidth = width;
      ctx.shadowColor = CFG.green; ctx.shadowBlur = blur;
      ctx.globalAlpha = alpha;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    drawUpTo(CFG.green, CFG.lineWidth + 3.5, CFG.glow, 0.9 * flicker);   // halo
    drawUpTo(CFG.green, CFG.lineWidth, CFG.glow * 0.6, flicker);        // corpo
    drawUpTo(CFG.greenCore, CFG.lineWidth * 0.5, 6, flicker);          // nucleo claro

    // faisca dourada na cabeca
    const headCanvasY = headDocY - scrollY;
    if (headCanvasY > -40 && headCanvasY < window.innerHeight + 40) {
      // acha o x da cabeca
      let hx = W * 0.5;
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].y >= headDocY) {
          const prev = pts[i - 1], t = (headDocY - prev.y) / (pts[i].y - prev.y);
          hx = prev.x + (pts[i].x - prev.x) * t; break;
        }
      }
      ctx.beginPath();
      ctx.arc(hx, headCanvasY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = CFG.gold; ctx.shadowColor = CFG.gold;
      ctx.shadowBlur = reduce ? 12 : 34 * flicker;
      ctx.fill();
      // brilho maior atras
      ctx.beginPath();
      ctx.arc(hx, headCanvasY, 9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245,178,62,0.35)';
      ctx.shadowBlur = 40; ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }

  /* ------------------------------ Recalculos --------------------------- */
  function rebuild() { build(); }
  window.addEventListener('resize', rebuild, { passive: true });
  window.addEventListener('load', rebuild);
  document.addEventListener('toggle', rebuild, true); // abre/fecha FAQ muda altura
  // altura pode mudar depois (imagens/fontes): checa de vez em quando
  let lastH = 0;
  setInterval(() => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastH) > 40) { lastH = h; build(); }
  }, 700);

  build();
  requestAnimationFrame(draw);
})();
