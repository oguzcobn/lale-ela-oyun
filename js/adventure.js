"use strict";
/* =====================================================================
   LALE & ELA – SEVGİ YOLCULUĞU · oyun motoru
   (index.html'deki $, sfx, burst, confetti, cheer, muted, toggleMute,
    kid ve back yardımcılarını kullanır)
   ===================================================================== */
const aRnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const aPick = a => a[Math.floor(Math.random() * a.length)];
const aShuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function aOpts(ans, n, deltas, min) {
  min = min === undefined ? 0 : min;
  const s = new Set([ans]);
  for (const k of aShuffle(deltas)) { if (s.size >= n) break; for (const sg of aShuffle([1, -1])) { const v = ans + sg * k; if (v >= min && !s.has(v)) { s.add(v); break; } } }
  let g = 1; while (s.size < n) { if (!s.has(ans + g)) s.add(ans + g); g++; }
  return aShuffle([...s]);
}
const numOpts = (ans, n, deltas, min) => aOpts(ans, n, deltas, min).map(v => ({ html: String(v), ok: v === ans }));

/* ---------------- çizimler (özgün SVG) ---------------- */
const SVG = {
  flower(c) {
    const p = [0, 72, 144, 216, 288].map(a => { const r = (a - 90) * Math.PI / 180; return `<circle cx="${(50 + 22 * Math.cos(r)).toFixed(1)}" cy="${(50 + 22 * Math.sin(r)).toFixed(1)}" r="17"/>`; }).join('');
    return `<svg class="svgi" viewBox="0 0 100 135"><path d="M50 62 C47 92 53 108 50 132" stroke="#3fae5a" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="35" cy="104" rx="14" ry="7" fill="#4cc26b" transform="rotate(-30 35 104)"/><g fill="${c}">${p}</g><circle cx="50" cy="50" r="14" fill="#ffd93c"/><circle cx="45" cy="45" r="4" fill="#fff" opacity=".7"/></svg>`;
  },
  shape(k, fill, dash) {
    const st = dash ? `fill="rgba(255,255,255,.6)" stroke="#8f7fb5" stroke-width="5" stroke-dasharray="10 8"` : `fill="${fill}" stroke="rgba(0,0,0,.1)" stroke-width="3"`;
    const P = {
      heart: `<path d="M50 88 C20 66 6 50 6 32 C6 18 18 8 31 8 C40 8 46 13 50 20 C54 13 60 8 69 8 C82 8 94 18 94 32 C94 50 80 66 50 88Z" ${st}/>`,
      star: `<polygon points="50,6 61,37 94,38 68,58 77,90 50,71 23,90 32,58 6,38 39,37" ${st} stroke-linejoin="round"/>`,
      circle: `<circle cx="50" cy="50" r="40" ${st}/>`,
      square: `<rect x="12" y="12" width="76" height="76" rx="8" ${st}/>`,
      triangle: `<polygon points="50,8 92,88 8,88" ${st} stroke-linejoin="round"/>`,
      diamond: `<polygon points="50,6 92,50 50,94 8,50" ${st} stroke-linejoin="round"/>`,
      moon: `<path d="M64 8 A42 42 0 1 0 92 66 A33 33 0 1 1 64 8Z" ${st}/>`,
      hexagon: `<polygon points="28,10 72,10 94,50 72,90 28,90 6,50" ${st} stroke-linejoin="round"/>`
    };
    return `<svg class="svgi" viewBox="0 0 100 100">${P[k]}</svg>`;
  },
  balloon(c) {
    return `<svg class="svgi" viewBox="0 0 100 150"><path d="M50 98 C45 115 57 128 50 148" stroke="rgba(59,42,90,.4)" stroke-width="2.5" fill="none"/><ellipse cx="50" cy="52" rx="38" ry="46" fill="${c}"/><polygon points="43,101 57,101 50,92" fill="${c}"/><ellipse cx="35" cy="34" rx="8" ry="13" fill="#fff" opacity=".55" transform="rotate(25 35 34)"/></svg>`;
  },
  ball(c1, c2) { // bordo-mavi top
    return `<svg class="svgi" viewBox="0 0 100 100"><defs><clipPath id="bc${c1.slice(1)}"><circle cx="50" cy="50" r="44"/></clipPath></defs><g clip-path="url(#bc${c1.slice(1)})"><rect x="0" y="0" width="50" height="100" fill="${c1}"/><rect x="50" y="0" width="50" height="100" fill="${c2}"/><path d="M0 50 H100" stroke="#fff" stroke-width="6"/></g><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="3"/><circle cx="34" cy="30" r="8" fill="#fff" opacity=".5"/></svg>`;
  },
  star(c) { return `<svg class="svgi" viewBox="0 0 100 100"><polygon points="50,6 61,37 94,38 68,58 77,90 50,71 23,90 32,58 6,38 39,37" fill="${c}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/></svg>`; },
  jersey(c, n) { return `<svg class="svgi" viewBox="0 0 100 100"><path d="M30 10 L42 6 Q50 16 58 6 L70 10 L92 26 L82 42 L74 36 L74 92 L26 92 L26 36 L18 42 L8 26 Z" fill="${c}" stroke="rgba(0,0,0,.15)" stroke-width="3"/><path d="M42 6 Q50 16 58 6" fill="none" stroke="#fff" stroke-width="4"/><text x="50" y="72" text-anchor="middle" font-size="34" font-weight="900" fill="#fff" font-family="sans-serif">${n}</text></svg>`; },
  lamp(c, on) { return `<svg class="svgi" viewBox="0 0 100 120"><rect x="38" y="92" width="24" height="20" rx="4" fill="#8a7aa8"/><circle cx="50" cy="52" r="40" fill="${on ? c : '#e6e0f0'}" stroke="${c}" stroke-width="6"/>${on ? `<circle cx="38" cy="40" r="10" fill="#fff" opacity=".6"/>` : ''}</svg>`; },
  note(c, t) { return `<svg class="svgi" viewBox="0 0 100 100"><ellipse cx="38" cy="74" rx="20" ry="15" fill="${c}" transform="rotate(-20 38 74)"/><rect x="53" y="12" width="7" height="62" fill="${c}"/><path d="M60 12 Q86 22 80 44 Q76 30 60 30Z" fill="${c}"/>${t ? `<text x="38" y="80" text-anchor="middle" font-size="15" font-weight="900" fill="#fff" font-family="sans-serif">${t}</text>` : ''}</svg>`; }
};
const TS_BORDO = '#8a1538', TS_MAVI = '#5cb8f0';

/* ===================================================================== */
const Adv = (() => {
  const KCOL = { lale: '#9b6bff', ela: '#ff6fa8' };

  /* ---------------- fotoğraflar ve yedek karakterler ---------------- */
  function face(o) {
    const curls = o.curly ? [[56, 70], [70, 54], [90, 46], [110, 46], [130, 54], [144, 70], [52, 92], [148, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="${o.hair}"/>`).join('') : '';
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="${o.bg}"/>${o.long ? `<path d="M44 100 C38 36 162 36 156 100 L166 196 L34 196Z" fill="${o.hair}"/>` : ''}<path d="M40 200 C44 150 156 150 160 200Z" fill="${o.shirt}"/><rect x="88" y="128" width="24" height="26" rx="10" fill="#f6c9a8"/><circle cx="100" cy="98" r="48" fill="#ffdcc0"/>${curls}${!o.curly ? `<path d="M52 94 C50 48 150 48 148 94 C136 70 112 64 100 66 C88 64 64 70 52 94Z" fill="${o.hair}"/>` : ''}${o.glasses ? `<circle cx="82" cy="100" r="13" fill="none" stroke="#6b5a7a" stroke-width="4"/><circle cx="118" cy="100" r="13" fill="none" stroke="#6b5a7a" stroke-width="4"/><path d="M95 100 H105" stroke="#6b5a7a" stroke-width="4"/>` : ''}<circle cx="82" cy="100" r="6" fill="#3b2a5a"/><circle cx="118" cy="100" r="6" fill="#3b2a5a"/><circle cx="84" cy="98" r="2" fill="#fff"/><circle cx="120" cy="98" r="2" fill="#fff"/><circle cx="70" cy="118" r="8" fill="#ff9fb8" opacity=".6"/><circle cx="130" cy="118" r="8" fill="#ff9fb8" opacity=".6"/><path d="M86 122 Q100 136 114 122" stroke="#c2456b" stroke-width="5" fill="none" stroke-linecap="round"/>${o.mus ? `<path d="M84 115 Q100 108 116 115" stroke="#3b2a20" stroke-width="5" fill="none" stroke-linecap="round"/>` : ''}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  }
  const FALLBACK = {
    anne: face({ bg: '#ffd9ec', hair: '#8a5a33', long: true, shirt: '#ff7eb6' }),
    baba: face({ bg: '#d7ecff', hair: '#3b2a20', shirt: '#4fa3ff' }),
    lale: face({ bg: '#efe4ff', hair: '#f2c14e', long: true, shirt: '#9b6bff' }),
    ela: face({ bg: '#ffe4f0', hair: '#c47a35', curly: true, shirt: '#7fe0c4' }),
    dede: face({ bg: '#dff3ff', hair: '#d9d9e3', shirt: TS_BORDO, glasses: true, mus: true }),
    babaanne: face({ bg: '#e8f8ff', hair: '#cfcfdc', long: true, shirt: TS_MAVI, glasses: true }),
    anneanne: face({ bg: '#f1e6ff', hair: '#e2e2ea', long: true, shirt: '#9b6bff', glasses: true })
  };
  const fb = n => FALLBACK[n] || FALLBACK.anne;
  const photo = n => (FAMILY[n] && FAMILY[n].photo) || '';
  const img = (n, cls) => `<img class="${cls || ''}" src="${photo(n)}" alt="" draggable="false" onerror="this.onerror=null;this.src=Adv.fallback('${n}')">`;
  const loadImg = (srcs, fbn) => new Promise(res => {
    const list = srcs.slice();
    const tryNext = () => {
      const s = list.shift();
      if (!s) { if (!fbn) return res(null); const f = new Image(); f.onload = () => res(f); f.onerror = () => res(null); f.src = fb(fbn); return; }
      const i = new Image(); i.onload = () => res(i); i.onerror = tryNext; i.src = s;
    };
    tryNext();
  });
  const NAME = k => (FAMILY[k] && FAMILY[k].name) || k;

  /* ---------------- zamanlayıcılar / temizlik ---------------- */
  let viewTimers = new Set(), viewCleans = [], taskCleans = [];
  function later(fn, ms) { const t = setTimeout(() => { viewTimers.delete(t); fn(); }, ms); viewTimers.add(t); return t; }
  function runTaskClean() { taskCleans.forEach(f => { try { f(); } catch (e) {} }); taskCleans = []; }
  function runClean() { runTaskClean(); viewCleans.forEach(f => { try { f(); } catch (e) {} }); viewCleans = []; viewTimers.forEach(clearTimeout); viewTimers.clear(); Adv._t = null; }
  const onView = f => viewCleans.push(f);

  let K = null, LV = null;
  const DATA = () => (K === 'lale' ? ADV_LALE : ADV_ELA);
  const R = () => document.getElementById('advRoot');
  const isEla = () => K === 'ela';
  const say0 = (t, o) => AdvAudio.speak(t, o);

  /* ---------------- arka plan sahneleri ---------------- */
  const sr = (() => { let s = 7; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();
  function dc(e, cls, st) { return `<div class="dc ${cls}" style="${st}">${e}</div>`; }
  function clouds(n, top) { let h = ''; for (let i = 0; i < n; i++) h += dc('☁️', 'cloud', `top:${top + i * 9}%;font-size:${50 + i * 14}px;animation-duration:${44 + i * 14}s;animation-delay:-${i * 17}s`); return h; }
  function scatter(list, n, cls, area) {
    let h = '';
    for (let i = 0; i < n; i++) {
      const e = list[i % list.length], x = area[0] + sr() * (area[1] - area[0]), y = area[2] + sr() * (area[3] - area[2]);
      h += dc(e, cls, `left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;font-size:${(area[4] || 22) + sr() * (area[5] || 10)}px;animation-delay:-${(sr() * 4).toFixed(1)}s`);
    }
    return h;
  }
  const SCENE = {
    trabzon: () => `<div class="sea"></div><div class="hill h1"></div><div class="hill h2"></div><div class="tea"></div>${clouds(3, 4)}
      ${dc('🏘️', '', 'left:6%;top:33%;font-size:34px;opacity:.85')}${dc('🏘️', '', 'right:10%;top:31%;font-size:28px;opacity:.75')}
      ${dc('🕊️', 'fly', 'left:12%;top:14%;font-size:26px')}${dc('🕊️', 'fly', 'right:30%;top:20%;font-size:20px;animation-delay:-4s')}
      ${dc('🐟', 'jump', 'left:40%;top:30%;font-size:26px')}${scatter(['🌿', '🌱', '🌸'], 8, 'sway', [0, 95, 84, 94, 22, 10])}`,
    stadium: () => `<div class="stands"></div><div class="pitch"></div>${dc('', 'flag f1', 'left:6%;top:4%')}${dc('', 'flag f2', 'right:8%;top:6%')}${dc('', 'flag f1', 'left:44%;top:2%')}
      <div class="lightbeam lb1"></div><div class="lightbeam lb2"></div>${scatter(['🙌', '🎉', '💙', '❤️'], 10, 'bob', [2, 96, 9, 22, 16, 8])}`,
    scotland: () => `<div class="hill s1"></div><div class="hill s2"></div><div class="loch"></div>${clouds(3, 3)}
      ${dc('🏰', '', 'right:8%;top:30%;font-size:56px')}${dc('🐑', 'bob', 'left:10%;top:66%;font-size:34px')}${dc('🐑', 'bob', 'left:30%;top:72%;font-size:28px;animation-delay:-1s')}
      ${dc('🦄', 'bob', 'right:26%;top:62%;font-size:30px;animation-delay:-2s')}${scatter(['🌸', '💜', '🌿'], 8, 'sway', [0, 96, 82, 94, 20, 10])}`,
    concert: () => `<div class="lightbeam cb1"></div><div class="lightbeam cb2"></div><div class="lightbeam cb3"></div><div class="stagefloor"></div>
      ${scatter(['🎵', '🎶', '✨', '⭐'], 12, 'rise2', [2, 96, 40, 100, 18, 14])}${scatter(['✦'], 14, 'tw', [0, 100, 0, 40, 10, 8])}`,
    castle: () => `<div class="sunglow"></div>${clouds(2, 4)}${dc('🏰', '', 'left:50%;top:22%;font-size:110px;transform:translateX(-50%);opacity:.35')}
      ${scatter(['💗', '💖', '💕'], 8, 'rise2', [4, 96, 50, 100, 18, 12])}${dc('🦋', 'fly', 'left:8%;top:40%;font-size:28px')}${scatter(['🌷', '🌸', '🌼'], 9, 'sway', [0, 96, 86, 95, 22, 10])}`,
    map: () => `<div class="compass-wm">🧭</div>${clouds(2, 3)}${scatter(['✨', '⭐', '💖'], 10, 'tw', [2, 96, 8, 92, 14, 10])}`,
    final: () => `<div class="sunglow"></div><div class="rainbow-bg"></div>${clouds(2, 3)}${dc('🦋', 'fly', 'left:6%;top:30%;font-size:30px')}${dc('🦋', 'fly', 'right:20%;top:18%;font-size:24px;animation-delay:-3s')}
      ${scatter(['🌷', '🌸', '🌼', '🌻'], 12, 'sway', [0, 96, 86, 95, 24, 12])}`
  };
  const decor = th => (SCENE[th] || SCENE.map)();

  /* ---------------- ortak kabuk ---------------- */
  function lightsHtml(st) { return `<span class="lights">${st.map(s => `<i class="${s ? 'on' : ''}"></i>`).join('')}</span>`; }
  function shell(theme, title, backFn) {
    const root = R();
    root.className = 'th-' + theme + (isEla() ? ' ela' : ' lale');
    root.innerHTML = `<div class="adv-bg">${decor(theme)}</div><div class="adv-layer"><div class="adv-top">
      <button class="icon-btn" data-a="back" aria-label="Geri">⬅️</button><div class="ttl">${title}</div>
      <button class="icon-btn" data-a="music" aria-label="Müzik">${AdvAudio.musicOn() ? '🎵' : '🔕'}</button>
      <button class="icon-btn" data-a="mute" aria-label="Ses">${muted ? '🔇' : '🔊'}</button></div><div class="adv-main"></div></div>`;
    root.querySelector('[data-a=back]').onclick = () => { sfx.click(); (backFn || (() => history.back()))(); };
    const mb = root.querySelector('[data-a=music]'); mb.onclick = () => { mb.textContent = AdvAudio.toggleMusic(theme) ? '🎵' : '🔕'; };
    const ub = root.querySelector('[data-a=mute]'); ub.onclick = () => { toggleMute(); ub.textContent = muted ? '🔇' : '🔊'; AdvAudio.refresh(); };
    return root.querySelector('.adv-main');
  }

  /* ---------------- GİRİŞ: sandık, pusula ve mektup ---------------- */
  function intro() {
    const D = DATA(), p = AdvProgress.get(K), n = AdvProgress.count(K), started = n > 0 || p.cur;
    const main = shell('map', D.title, () => history.back());
    AdvAudio.startMusic('map');
    main.innerHTML = `<div class="intro">
      <div class="i-road">
        <div class="i-kid">${img(K)}<b>${NAME(K).toUpperCase()}</b></div>
        <svg class="i-path" viewBox="0 0 300 100" preserveAspectRatio="none"><path d="M10,70 C70,5 120,95 180,40 S260,25 292,38"/></svg>
        <div class="i-goal"><div class="i-par">${img('anne')}${img('baba')}</div><span>🏰</span></div>
        <span class="i-sp s1">✨</span><span class="i-sp s2">⭐</span><span class="i-sp s3">✨</span>
      </div>
      <div class="chest"><div class="lid"></div><div class="box"></div><div class="glowc">🧭</div></div>
      <div class="letter"><div class="ltxt"></div></div>
      <div class="i-foot">${lightsHtml(p.stars)}<button class="abtn xl pulse" style="--c:${KCOL[K]}">${started ? '▶ DEVAM ET' : '✨ MACERAYA BAŞLA'}</button></div>
    </div>`;
    const chest = main.querySelector('.chest'), lt = main.querySelector('.ltxt'), letter = main.querySelector('.letter');
    later(() => { chest.classList.add('open'); sfx.star(); }, 700);
    later(() => {
      letter.classList.add('show');
      const lines = isEla() ? [ADV_LETTER[0], ADV_LETTER[1], ADV_LETTER[2], ADV_LETTER[5], ADV_LETTER[6]] : ADV_LETTER;
      lines.forEach((l, i) => later(() => { const d = document.createElement('p'); d.textContent = l; lt.appendChild(d); lt.scrollTop = 1e4; }, i * (isEla() ? 900 : 650)));
      say0(isEla() ? `Merhaba Ela! Bahçede parlayan bir sandık bulduk! İçinde altın bir pusula ve annen Nicole ile baban Oğuzhan'dan bir mektup var. Sevgi Pusulası'nın beş ışığını yakarsak onlara ulaşacağız!`
        : lines.join(' '));
    }, 1500);
    main.querySelector('.abtn').onclick = () => { sfx.ding(); location.replace('#adv-map'); };
  }

  /* ---------------- HARİTA ---------------- */
  function map() {
    const D = DATA(), p = AdvProgress.get(K), n = AdvProgress.count(K);
    const main = shell('map', `🧭 ${D.mapTitle}`, () => history.back());
    AdvAudio.startMusic('map');
    main.innerHTML = `<div class="map-head">${lightsHtml(p.stars)}<span>${n}/5 Sevgi Işığı</span></div><div class="map"><svg class="map-svg"></svg></div>
      ${n === 5 ? `<button class="abtn pulse fin-go" style="--c:${KCOL[K]}">💖 Anne ve Babaya Git!</button>` : ''}`;
    const box = main.querySelector('.map'), svg = box.querySelector('svg');
    let cur = p.stars.findIndex(s => !s); if (cur < 0) cur = 4;
    const nodes = D.levels.map((L, i) => {
      const done = p.stars[i], open = AdvProgress.unlocked(K, i);
      const b = document.createElement('button');
      b.className = 'mnode' + (done ? ' done' : '') + (open ? '' : ' locked') + (i === cur && !done ? ' cur' : '');
      b.innerHTML = `<span class="me">${L.emoji}</span><span class="ml">${L.short || L.name}</span>${done ? '<span class="mstar">✨</span>' : ''}${open ? '' : '<span class="mlock">🔒</span>'}`;
      b.onclick = () => {
        if (!AdvProgress.unlocked(K, i)) { b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle'); AdvAudio.softBoop(); say0(isEla() ? 'Önce parlayan yere gidelim!' : 'Bu durak henüz kilitli. Önce önceki ışığı yak!'); return; }
        sfx.click(); LV = i; location.hash = 'adv-play';
      };
      box.appendChild(b); return b;
    });
    const av = document.createElement('div'); av.className = 'map-av'; av.innerHTML = `<img src="assets/characters/${K}.png" alt="" onerror="this.onerror=null;this.src='${photo(K)}'">`; box.appendChild(av);
    function lay() {
      const W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
      const port = H > W * 1.05;
      const P = port ? [[.25, .83], [.74, .66], [.27, .49], [.73, .31], [.5, .13]] : [[.09, .6], [.29, .26], [.5, .62], [.71, .26], [.9, .56]];
      const pts = P.map(([x, y]) => [x * W, y * H]);
      nodes.forEach((nd, i) => { nd.style.left = pts[i][0] + 'px'; nd.style.top = pts[i][1] + 'px'; });
      const seg = i => { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; if (port) { const m = (y0 + y1) / 2; return ` C${x0},${m} ${x1},${m} ${x1},${y1}`; } const m = (x0 + x1) / 2; return ` C${m},${y0} ${m},${y1} ${x1},${y1}`; };
      let d = `M${pts[0][0]},${pts[0][1]}`, g = '';
      for (let i = 1; i < 5; i++) { d += seg(i); if (p.stars[i - 1]) g += `<path class="mp-gold" d="M${pts[i - 1][0]},${pts[i - 1][1]}${seg(i)}"/>`; }
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = `<path class="mp-base" d="${d}"/><path class="mp-dash" d="${d}"/>${g}`;
      const ap = pts[cur]; av.style.left = (ap[0] + (port ? 52 : 0)) + 'px'; av.style.top = (ap[1] - (port ? 0 : 58)) + 'px';
    }
    requestAnimationFrame(lay); addEventListener('resize', lay); onView(() => removeEventListener('resize', lay));
    if (p.justUnlocked != null) {
      const nd = nodes[p.justUnlocked]; nd.classList.add('unlocking');
      later(() => { const r = nd.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, '#ffc93c', 22); sfx.star(); }, 500);
      AdvProgress.clearJust(K);
    }
    const fg = main.querySelector('.fin-go'); if (fg) fg.onclick = () => { sfx.ding(); location.hash = 'adv-final'; };
    later(() => say0(n === 5 ? 'Bütün ışıklar yandı! Hadi anne ve babaya gidelim!' : isEla() ? 'Parlayan yere dokun Ela!' : `Sevgi Pusulası'nda ${n} ışık yandı. Sıradaki durağa dokun!`), 500);
  }

  /* ---------------- BÖLÜM ---------------- */
  function play() {
    const D = DATA(), L = D.levels[LV], p = AdvProgress.get(K);
    const start = (p.cur && p.cur.level === LV) ? p.cur.task : 0;
    const main = shell(L.theme, `${L.emoji} ${L.name}`, () => history.back());
    AdvAudio.startMusic(L.theme);
    main.innerHTML = `<div class="adv-stage"><div class="tdots"></div><div class="guide"><div class="gav">${L.guide}</div><div class="bubble"><span class="btxt"></span><button class="rep" aria-label="Tekrar dinle">🔊</button></div></div><div class="taskarea"></div></div>`;
    const stage = main.querySelector('.adv-stage'), area = main.querySelector('.taskarea'), btxt = main.querySelector('.btxt'), bub = main.querySelector('.bubble'), dots = main.querySelector('.tdots');
    let lastSay = null;
    function say(t, opt) {
      if (!t) return; btxt.innerHTML = t; bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
      lastSay = [opt && opt.voice || t, opt]; say0(lastSay[0], opt);
    }
    main.querySelector('.rep').onclick = () => { if (lastSay) say0(lastSay[0], lastSay[1]); };
    function setDots(i) { dots.innerHTML = L.tasks.map((_, k) => `<i class="${k < i ? 'ok' : k === i ? 'now' : ''}"></i>`).join(''); }

    // Ela: 10 saniye hareketsizlikte ipucu
    let idleT = null, idleFn = null;
    const resetIdle = () => { clearTimeout(idleT); if (idleFn && isEla()) idleT = setTimeout(() => { try { idleFn(); } catch (e) {} resetIdle(); }, 10000); };
    stage.addEventListener('pointerdown', resetIdle);
    onView(() => clearTimeout(idleT));

    function ctxFor(cfg, onDone) {
      let wrongs = 0, fin = false;
      const x = {
        kid: K, ela: isEla(), area, later, say,
        speak: (t, o) => say0(t, o),
        onClean: f => taskCleans.push(f),
        good(el, n) { if (el) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, null, n || 16); } sfx.ding(); },
        wrong(el, hint, msg) {
          wrongs++;
          if (el) { el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle'); }
          if (isEla()) { AdvAudio.softBoop(); say0(msg || aPick(['Bir daha deneyelim!', 'Hadi tekrar deneyelim!', 'Neredeyse! Bir daha dene!'])); }
          else { sfx.buzz(); if (msg) say0(msg); if (wrongs >= 3) x.hint(hint || cfg.hint); }
          return wrongs;
        },
        hint(t) { if (!t) return; let hb = area.querySelector('.hintbox'); if (!hb) { hb = document.createElement('div'); hb.className = 'hintbox'; area.prepend(hb); } hb.innerHTML = '💡 ' + t; },
        idle(fn) { idleFn = fn; resetIdle(); },
        done() { if (fin) return; fin = true; idleFn = null; clearTimeout(idleT); onDone(); }
      };
      return x;
    }
    function run(i) {
      runTaskClean(); idleFn = null; clearTimeout(idleT);
      AdvProgress.setCur(K, LV, i); setDots(i);
      area.innerHTML = ''; area.className = 'taskarea';
      const t = L.tasks[i], cfg = typeof t === 'function' ? t() : t;
      const x = ctxFor(cfg, () => {
        cheer(); sfx.star(); setDots(i + 1);
        later(() => (i + 1 < L.tasks.length ? run(i + 1) : complete()), 1300);
      });
      if (cfg.say) say(cfg.say, { voice: cfg.voice, lang: cfg.lang });
      Adv._t = null;
      T[cfg.type](area, cfg, x);
    }
    function scene(sc, then) {
      if (!sc) return then();
      if (Array.isArray(sc)) { const list = sc.slice(); const nx = () => list.length ? scene(list.shift(), nx) : then(); return nx(); }
      runTaskClean(); area.innerHTML = '';
      SC[sc.type](area, sc, { say, later, speak: (t, o) => say0(t, o), onClean: f => taskCleans.push(f) }, then);
    }
    function complete() {
      scene(L.outroScene, () => {
        runTaskClean();
        AdvProgress.award(K, LV);
        const st = AdvProgress.get(K).stars, n = st.filter(Boolean).length;
        area.innerHTML = `<div class="award"><div class="compass">🧭${st.map((s, k) => `<i class="cl c${k} ${s ? 'on' : ''} ${k === LV ? 'new' : ''}"></i>`).join('')}</div>
          <h3>✨ SEVGİ IŞIĞI KAZANDIN!</h3><p>${n}/5 Sevgi Işığı</p>
          <button class="abtn xl" style="--c:${KCOL[K]}">${LV < 4 ? '🗺️ Haritaya Dön' : '🏰 Kapıyı Aç!'}</button></div>`;
        say(L.outro, { voice: L.outroVoice, lang: L.outroLang });
        sfx.win(); confetti();
        area.querySelector('.abtn').onclick = () => { sfx.ding(); if (LV < 4) history.back(); else location.replace('#adv-final'); };
      });
    }
    if (start === 0) {
      say(L.intro, { voice: L.introVoice });
      const go = () => scene(L.introScene, () => run(0));
      if (L.introScene && (L.introScene.auto || (Array.isArray(L.introScene) && L.introScene[0].auto))) go();
      else { area.innerHTML = `<button class="abtn xl pulse" style="--c:${KCOL[K]}">▶ Başla</button>`; area.querySelector('.abtn').onclick = () => { sfx.ding(); go(); }; }
    } else run(start);
  }

  /* ---------------- FİNAL: anne ve babaya kavuşma ---------------- */
  function final() {
    const F = ADV_FINAL[K], p = AdvProgress.get(K);
    if (p.stars.filter(Boolean).length < 5) { location.replace('#adv-map'); return; }
    AdvProgress.markDone(K);
    const main = shell('final', '💖 Sevgi Şatosu', () => history.back());
    AdvAudio.stopMusic(); AdvAudio.startMusic('final');
    main.innerHTML = `<div class="fin">
      <div class="doors"><div class="dl"></div><div class="dr"></div></div>
      <div class="fstars">${[0, 1, 2, 3, 4].map(i => `<span class="fs fs${i}">✨</span>`).join('')}</div>
      <div class="ffam"><div class="fp anne">${img('anne')}<span>${FAMILY.anne.name}</span></div><div class="fkid"><img class="spr" src="assets/characters/${K}-side.png" alt="" style="transform:scaleX(-1)" onerror="this.onerror=null;this.src='${photo(K)}'">${img(K, 'badge')}</div><div class="fp baba">${img('baba')}<span>${FAMILY.baba.name}</span></div></div>
      ${F.banner ? `<div class="fbanner">${F.banner}</div>` : ''}
      <div class="fbig">${F.big}</div><div class="fsub">${F.sub}</div>
      <div class="fmsg"></div><div class="fforever">${ADV_FINAL.forever}</div>
      <div class="fbtns"><button class="abtn" style="--c:var(--green)" data-a="again">🔁 Yeniden Oyna</button><button class="abtn" style="--c:${KCOL[K]}" data-a="home">🏡 Oyun Bahçesine Dön</button><button class="abtn" style="--c:var(--orange)" data-a="cert">📸 Aile Hatırası</button></div>
    </div>`;
    const f = main.querySelector('.fin'), step = (cls, ms, fn) => later(() => { f.classList.add(cls); if (fn) fn(); }, ms);
    step('open', 300, () => AdvAudio.note(784, 1.2, 'sine', .04));
    step('par', 1100);
    step('walk', 1900);
    step('hug', 3900, () => { AdvAudio.celebrate(); confetti(); const r = f.querySelector('.ffam').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, '#ff6fa8', 30); });
    step('ttl-on', 4500, () => say0(F.big + ' ' + F.sub));
    const msg = f.querySelector('.fmsg');
    F.lines.forEach((l, i) => later(() => {
      const d = document.createElement('p'); d.textContent = l; msg.appendChild(d); say0(l, { queue: true });
      if (i === 0) f.classList.add('msg');
    }, 6500 + i * 2300));
    const endT = 6500 + F.lines.length * 2300;
    step('fst-on', endT, () => { sfx.star(); const rb = R().querySelector('.rainbow-bg'); if (rb) rb.classList.add('on'); });
    step('end', endT + 1500, () => { confetti(); say0(ADV_FINAL.forever, { queue: true }); });
    f.querySelector('[data-a=again]').onclick = () => { sfx.click(); AdvProgress.reset(K); location.replace('#adv-map'); };
    f.querySelector('[data-a=home]').onclick = () => { sfx.click(); if (history.length > 2) history.go(-2); else location.replace('#' + K); };
    f.querySelector('[data-a=cert]').onclick = () => { sfx.click(); certificate(); };
    f.addEventListener('click', e => { if (!e.target.closest('button') && !f.classList.contains('end')) { /* hızlı geçiş */ } });
  }

  /* ---------------- Aile Hatırası (PNG sertifika) ---------------- */
  async function certificate() {
    const W = 1200, H = 860, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#ffe0f0'); gr.addColorStop(.5, '#efe4ff'); gr.addColorStop(1, '#dcf2ff');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#ffffff'; g.lineWidth = 18; g.strokeRect(24, 24, W - 48, H - 48);
    g.strokeStyle = KCOL[K]; g.lineWidth = 5; g.setLineDash([18, 12]); g.strokeRect(46, 46, W - 92, H - 92); g.setLineDash([]);
    const font = (s, w) => `${w || 900} ${s}px Nunito, "Baloo 2", system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#3b2a5a'; g.font = font(34, 800); g.fillText('🧭 LALE & ELA: SEVGİ YOLCULUĞU', W / 2, 108);
    g.fillStyle = K === 'lale' ? '#7b45f0' : '#e2457f'; g.font = font(64); g.fillText(`${NAME(K).toUpperCase()} – SEVGİ YOLCULUĞU KAHRAMANI`, W / 2, 190, W - 140);
    const [A, B, C] = await Promise.all([loadImg([photo('anne')], 'anne'), loadImg([photo(K)], K), loadImg([photo('baba')], 'baba')]);
    const circ = (im, cx, cy, r, col, label) => {
      g.save(); g.beginPath(); g.arc(cx, cy, r + 10, 0, 7); g.fillStyle = '#fff'; g.fill();
      g.beginPath(); g.arc(cx, cy, r + 10, 0, 7); g.lineWidth = 8; g.strokeStyle = col; g.stroke();
      g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
      if (im) { const s = Math.max(2 * r / im.width, 2 * r / im.height); g.drawImage(im, cx - im.width * s / 2, cy - im.height * s / 2, im.width * s, im.height * s); }
      g.restore(); g.fillStyle = '#3b2a5a'; g.font = font(30, 900); g.fillText(label, cx, cy + r + 42);
    };
    circ(A, 280, 420, 120, '#ff6fa8', FAMILY.anne.name);
    circ(B, 600, 400, 150, KCOL[K], NAME(K));
    circ(C, 920, 420, 120, '#4fb3ff', FAMILY.baba.name);
    g.font = font(44); g.fillText('💖', 440, 430); g.fillText('💖', 760, 430);
    g.fillStyle = '#3b2a5a'; g.font = font(42); g.fillText('Sevgi Pusulası’nın beş ışığı yakıldı!', W / 2, 660);
    g.font = font(48); g.fillText('✨ ✨ ✨ ✨ ✨', W / 2, 726);
    g.font = font(26, 800); g.fillStyle = '#6b5a8a';
    g.fillText(`${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} · ${FAMILY.anne.sign} ve ${FAMILY.baba.sign} ❤️`, W / 2, 790);
    let url; try { url = cv.toDataURL('image/png'); } catch (e) { url = null; }
    const ov = document.createElement('div'); ov.className = 'cert-ov';
    ov.innerHTML = `<div class="cert-box">${url ? `<img src="${url}" alt="Aile Hatırası">` : '<p>Sertifika bu cihazda oluşturulamadı.</p>'}
      <p class="cert-tip">Telefonda resme basılı tutarak da kaydedebilirsin.</p>
      <div class="mrow">${url ? `<a class="mbtn" style="--c:var(--green)" download="${NAME(K)}-sevgi-yolculugu.png" href="${url}">⬇️ PNG İndir</a>` : ''}<button class="mbtn" style="--c:var(--purple)">✖ Kapat</button></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector('button').onclick = () => ov.remove();
    onView(() => ov.remove());
  }

  /* ---------------- İki kardeş birlikte bitirince ---------------- */
  function siblingsReady() { return AdvProgress.get('lale').done && AdvProgress.get('ela').done; }
  function checkSiblings() {
    const b = document.getElementById('sibBtn'); if (b) b.style.display = siblingsReady() ? '' : 'none';
    if (siblingsReady() && !AdvProgress.flag('sisters_seen')) { AdvProgress.flag('sisters_seen', true); setTimeout(siblings, 700); }
  }
  function siblings() {
    const S = ADV_SISTERS;
    const ov = document.createElement('div'); ov.className = 'sis-ov';
    ov.innerHTML = `<div class="sis">
      <div class="sis-map"><div class="land tr"><b>Trabzon</b></div><div class="land sc"><b>İskoçya</b></div>
        <span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span><span class="orb o4"></span><div class="bigheart">❤️</div></div>
      <h2>${S.title}</h2>
      <div class="sis-row"><div class="sp anne">${img('anne')}<span>${FAMILY.anne.name}</span></div><div class="sp skid">${img('lale')}<span>Lale</span></div><div class="sp skid">${img('ela')}<span>Ela</span></div><div class="sp baba">${img('baba')}<span>${FAMILY.baba.name}</span></div></div>
      <div class="sis-gp">${['dede', 'babaanne', 'anneanne'].map(n => `<div class="gp">${img(n)}<span>${FAMILY[n].name.replace(/n$/, '')}</span></div>`).join('')}</div>
      <div class="sis-msg"></div><div class="sis-foot">${S.footer}</div>
      <button class="mbtn" style="--c:var(--pink)">💖 Kapat</button></div>`;
    document.body.appendChild(ov);
    const box = ov.querySelector('.sis'), msg = ov.querySelector('.sis-msg');
    const ts = [];
    const at = (ms, fn) => ts.push(setTimeout(fn, ms));
    AdvAudio.startMusic('final');
    at(200, () => box.classList.add('a1'));
    at(1600, () => { box.classList.add('a2'); sfx.star(); });
    at(3000, () => { box.classList.add('a3'); AdvAudio.celebrate(); confetti(); say0(S.title); });
    S.lines.forEach((l, i) => at(4200 + i * 2300, () => { const d = document.createElement('p'); d.textContent = l; msg.appendChild(d); say0(l, { queue: true }); }));
    at(4200 + S.lines.length * 2300, () => { box.classList.add('a4'); confetti(); });
    ov.querySelector('button').onclick = () => { ts.forEach(clearTimeout); AdvAudio.stopSpeak(); AdvAudio.stopMusic(); ov.remove(); };
  }

  /* ---------------- menü kartları ---------------- */
  function updateCards() {
    ['lale', 'ela'].forEach(k => { const e = document.querySelector(`#advCard-${k} i`); if (e) { const n = AdvProgress.count(k); e.textContent = AdvProgress.get(k).done ? '💖 Tamamlandı!' : `✨ ${n}/5 Sevgi Işığı`; } });
  }

  /* ---------------- yönlendirme ---------------- */
  function route(r) {
    runClean(); AdvAudio.stopSpeak(); K = kid;
    if (!K) { location.replace('#'); return; }
    document.querySelectorAll('.cert-ov').forEach(e => e.remove());
    if (r === 'adv') intro();
    else if (r === 'adv-map') map();
    else if (r === 'adv-play') { if (LV === null) { location.replace('#adv-map'); return; } play(); }
    else if (r === 'adv-final') final();
  }
  function leave() { runClean(); AdvAudio.stopSpeak(); AdvAudio.stopMusic(); const r = R(); if (r) r.innerHTML = ''; }

  return { route, leave, fallback: fb, img, loadImg, photo, later, checkSiblings, siblings, updateCards, _t: null, get kidKey() { return K; } };
})();

/* =====================================================================
   GÖREV TÜRLERİ
   her görev: T[type](alan, ayar, ctx) → bitince ctx.done()
   ===================================================================== */
const T = {};
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const NUMS_TR = ['', 'Bir!', 'İki!', 'Üç!', 'Dört!', 'Beş!', 'Altı!', 'Yedi!', 'Sekiz!', 'Dokuz!', 'On!'];
const spriteImg = (k, side) => `<img src="assets/characters/${k}${side ? '-side' : ''}.png" alt="" draggable="false" onerror="this.onerror=null;this.src='${Adv.photo(k)}'">`;
const heroHtml = (k, s) => `<div class="hero" style="--hs:${s}px"><div class="hb">${spriteImg(k, true)}</div></div>`;
function glowOk(root, x) { root.querySelectorAll('[data-ok]:not(.used)').forEach(b => { b.classList.add('glow'); x.later(() => b.classList.remove('glow'), 3200); }); }

/* ---- seçmeli soru (tek) ---- */
function runChoice(a, c, x, fin) {
  a.innerHTML = '';
  if (c.visual) a.appendChild(el(`<div class="visual ${c.vclass || ''}">${c.counter ? `<small class="qn">${c.counter}</small>` : ''}${c.visual}</div>`));
  const row = el(`<div class="opt-row ${c.cls || ''}"></div>`); a.appendChild(row);
  let locked = false;
  c.options.forEach(o => {
    const b = el(`<button class="aopt ${o.cls || ''}">${o.html}</button>`);
    if (o.ok || c.allOk) b.dataset.ok = 1;
    if (o.style) b.style.cssText = o.style;
    row.appendChild(b);
    b.onclick = () => {
      if (locked || b.classList.contains('tried')) return;
      if (o.ok || c.allOk) {
        locked = true; b.classList.add('okk', c.okAnim || 'dance'); x.good(b);
        if (c.okSay) x.say(c.okSay, { lang: c.okLang });
        else if (x.ela) x.speak(aPick(['Yaşasın!', 'Aferin Ela!', 'Harika!', 'Süpersin!']));
        x.later(fin, c.okDelay || 1200);
      } else {
        b.classList.add('tried'); x.wrong(b, o.hint || c.hint, c.wrongSay);
        if (x.ela) x.later(() => b.classList.remove('tried'), 900);
      }
    };
  });
  x.idle(() => { glowOk(row, x); x.speak(c.voice || c.say); });
}
T.choice = (a, c, x) => runChoice(a, c, x, () => x.done());
T.series = (a, c, x) => {
  let i = 0;
  const next = () => {
    if (i >= c.items.length) return x.done();
    const it = Object.assign({}, c.items[i]);
    if (c.items.length > 1 && !x.ela) it.counter = `${i + 1}/${c.items.length}`;
    i++;
    if (it.say) x.say(it.say, { voice: it.voice, lang: it.lang });
    runChoice(a, it, x, () => { sfx.star(); next(); });
  };
  next();
};

/* ---- haritada şehir bul ---- */
T.mapFind = (a, c, x) => {
  const cities = c.cities; // [{n, x, y, show, ok}]
  a.innerHTML = `<div class="mapf"><svg viewBox="0 0 400 220" class="mapf-svg">
     <path d="M0 0 H400 V96 C360 104 330 118 300 112 C260 104 230 120 190 116 C150 112 120 126 80 118 C50 112 25 120 0 112 Z" fill="#5ab4ea"/>
     <path d="M0 112 C25 120 50 112 80 118 C120 126 150 112 190 116 C230 120 260 104 300 112 C330 118 360 104 400 96 V220 H0 Z" fill="#8fd18a"/>
     <path d="M0 150 C80 140 160 170 240 150 S360 140 400 156 V220 H0Z" fill="#6cbf6a" opacity=".7"/>
     <text x="200" y="48" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" opacity=".9">KARADENİZ 🌊</text>
     ${[60, 140, 250, 330].map((sx, i) => `<text x="${sx}" y="${74 + (i % 2) * 14}" font-size="18">🐟</text>`).join('')}
   </svg>${cities.map((ct, i) => `<button class="city ${ct.show ? 'shown' : ''}" data-i="${i}" ${ct.ok ? 'data-ok="1"' : ''} style="left:${ct.x / 4}%;top:${ct.y / 2.2}%"><span class="dot"></span><span class="cn">${ct.show ? ct.n : '?'}</span></button>`).join('')}</div>`;
  a.querySelectorAll('.city').forEach(b => {
    const ct = cities[+b.dataset.i];
    b.onclick = () => {
      if (ct.show || b.classList.contains('found')) return;
      if (ct.ok) { b.classList.add('found'); b.querySelector('.cn').textContent = ct.n + ' 💙'; x.good(b, 24); x.say(c.okSay); x.later(() => x.done(), 1800); }
      else { b.querySelector('.cn').textContent = ct.n; b.classList.add('shown'); x.wrong(b, c.hint, `Burası ${ct.n}. Trabzon'u bulalım!`); x.hint(c.hint); }
    };
  });
};

/* ---- gizli nesneler ---- */
T.hidden = (a, c, x) => {
  a.innerHTML = `<div class="hscene ${c.sceneCls || ''}"></div><div class="tray">${c.items.map((it, i) => `<span class="ti" data-i="${i}">${it.html}<small>${it.name}</small></span>`).join('')}<button class="hint-btn" aria-label="İpucu">💡</button></div>`;
  const sc = a.querySelector('.hscene');
  let dec = '';
  for (let i = 0; i < (c.decorN || 16); i++) dec += `<span class="hdec" style="left:${aRnd(0, 92)}%;top:${aRnd(0, 86)}%;font-size:${aRnd(30, 56)}px;transform:rotate(${aRnd(-20, 20)}deg)">${aPick(c.decor)}</span>`;
  sc.innerHTML = dec;
  const cells = aShuffle(Array.from({ length: 20 }, (_, i) => i)).slice(0, c.items.length);
  let got = 0;
  c.items.forEach((it, i) => {
    const cx = cells[i] % 5, cy = Math.floor(cells[i] / 5);
    const b = el(`<button class="hitem" style="left:${cx * 19 + aRnd(2, 9)}%;top:${cy * 23 + aRnd(3, 10)}%;transform:rotate(${aRnd(-25, 25)}deg)">${it.html}</button>`);
    b.onclick = () => {
      if (b.classList.contains('used')) return;
      b.classList.add('used'); x.good(b, 12);
      const slot = a.querySelector(`.ti[data-i="${i}"]`); slot.classList.add('got');
      const r1 = b.getBoundingClientRect(), r2 = slot.getBoundingClientRect();
      b.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${r2.left - r1.left}px,${r2.top - r1.top}px) scale(.6)`, opacity: .2 }], { duration: 600, easing: 'ease-in', fill: 'forwards' });
      if (++got === c.items.length) x.later(() => x.done(), 800);
    };
    sc.appendChild(b);
  });
  a.querySelector('.hint-btn').onclick = () => { const r = [...sc.querySelectorAll('.hitem:not(.used)')]; if (r[0]) { r[0].classList.add('glow'); x.later(() => r[0].classList.remove('glow'), 2500); } };
  Adv._t = { solve: () => sc.querySelectorAll('.hitem').forEach(b => b.click()) };
};

/* ---- sırayla dokun (formalar, ışıklar, gökkuşağı) ---- */
T.tapOrder = (a, c, x) => {
  const seq = c.seq; let k = 0;
  a.innerHTML = `${c.visual ? `<div class="visual q">${c.visual}</div>` : ''}<div class="oslots ${c.slotCls || ''}">${(c.prefill || []).map(h => `<span class="os pre">${h}</span>`).join('')}${seq.map(() => `<span class="os"></span>`).join('')}</div><div class="ochips"></div>`;
  const slots = [...a.querySelectorAll('.os:not(.pre)')], chips = a.querySelector('.ochips');
  const pal = c.consume ? aShuffle(c.chips) : c.chips;
  pal.forEach(ch => {
    const b = el(`<button class="ochip" data-id="${ch.id}">${ch.html}</button>`);
    b.onclick = () => {
      if (k >= seq.length || b.classList.contains('used')) return;
      if (ch.id === seq[k]) {
        slots[k].innerHTML = ch.slot || ch.html; slots[k].classList.add('filled'); x.good(slots[k], 10);
        if (c.tone) AdvAudio.note(c.tone[ch.id] || 600, .3, 'triangle', .06);
        if (c.consume) b.classList.add('used');
        k++; chips.querySelectorAll('.glow').forEach(g => g.classList.remove('glow'));
        if (k === seq.length) x.later(() => x.done(), 900);
      } else if (x.wrong(b, c.hint) >= 3) { const nb = chips.querySelector(`.ochip[data-id="${seq[k]}"]:not(.used)`); if (nb) nb.classList.add('glow'); }
    };
    chips.appendChild(b);
  });
  Adv._t = { solve: () => { for (const id of seq.slice(k)) chips.querySelector(`.ochip[data-id="${id}"]:not(.used)`).click(); } };
};

/* ---- sürükle / dokun-eşleştir ---- */
T.dragMatch = (a, c, x) => {
  a.innerHTML = `${c.visual ? `<div class="visual q">${c.visual}</div>` : ''}<div class="dm-targets ${c.tcls || ''}"></div><div class="dm-items ${c.icls || ''}"></div>`;
  const tw = a.querySelector('.dm-targets'), iw = a.querySelector('.dm-items');
  c.targets.forEach(t => { const d = el(`<div class="dm-target ${t.fixed ? 'fixed' : ''} ${t.cls || ''}" data-key="${t.key || ''}">${t.html}</div>`); if (t.style) d.style.cssText = t.style; tw.appendChild(d); });
  let sel = null, placed = 0;
  const need = c.items.length;
  (c.shuffle === false ? c.items : aShuffle(c.items)).forEach(it => {
    const d = el(`<div class="dm-item" data-key="${it.key}">${it.html}</div>`); iw.appendChild(d);
    let sx = 0, sy = 0, drag = false, pid = null;
    d.addEventListener('pointerdown', e => { if (d.classList.contains('used')) return; e.preventDefault(); sx = e.clientX; sy = e.clientY; drag = false; pid = e.pointerId; try { d.setPointerCapture(pid); } catch (_) {} });
    d.addEventListener('pointermove', e => { if (pid !== e.pointerId) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (!drag && Math.hypot(dx, dy) > 10) { drag = true; d.classList.add('dragging'); } if (drag) d.style.transform = `translate(${dx}px,${dy}px) scale(1.08)`; });
    const up = e => {
      if (pid !== e.pointerId) return; pid = null;
      if (drag) {
        d.style.pointerEvents = 'none'; const under = document.elementFromPoint(e.clientX, e.clientY); d.style.pointerEvents = '';
        d.classList.remove('dragging'); d.style.transform = '';
        const tg = under && under.closest('.dm-target'); if (tg) attempt(d, tg);
      } else select(d);
    };
    d.addEventListener('pointerup', up); d.addEventListener('pointercancel', e => { pid = null; d.classList.remove('dragging'); d.style.transform = ''; });
  });
  function select(d) { if (d.classList.contains('used')) return; iw.querySelectorAll('.sel').forEach(s => s.classList.remove('sel')); sel = d; d.classList.add('sel'); sfx.click(); if (c.onSelect) c.onSelect(d, x); }
  tw.querySelectorAll('.dm-target').forEach(tg => tg.addEventListener('click', () => { if (sel) attempt(sel, tg); }));
  function attempt(d, tg) {
    if (tg.classList.contains('fixed') || (tg.classList.contains('full') && !c.multi)) return;
    if (d.dataset.key === tg.dataset.key) {
      d.classList.add('used'); d.classList.remove('sel'); sel = null;
      if (!c.consume) { tg.classList.add('full'); const inner = tg.querySelector('.slot-in') || tg; if (c.replace) inner.innerHTML = d.innerHTML; else inner.appendChild(el(`<span class="placed">${d.innerHTML}</span>`)); }
      x.good(tg, 14); if (c.onPlace) c.onPlace(tg, d, ++placed, x); else placed++;
      if (placed >= need) x.later(() => x.done(), c.endDelay || 1000);
    } else { x.wrong(d, c.hint, c.wrongSay); d.classList.remove('sel'); sel = null; }
  }
  x.idle(() => { const d = iw.querySelector('.dm-item:not(.used)'); if (!d) return; d.classList.add('glow'); const tg = [...tw.querySelectorAll('.dm-target')].find(t => t.dataset.key === d.dataset.key && !t.classList.contains('full')); if (tg) tg.classList.add('glow'); x.later(() => { d.classList.remove('glow'); if (tg) tg.classList.remove('glow'); }, 3200); x.speak(c.voice || c.say); });
  Adv._t = { solve: () => { iw.querySelectorAll('.dm-item:not(.used)').forEach(d => { const tg = [...tw.querySelectorAll('.dm-target:not(.fixed)')].find(t => t.dataset.key === d.dataset.key && (c.multi || c.consume || !t.classList.contains('full'))); attempt(d, tg); }); } };
};

/* ---- harf dizme / cümle tamamlama ---- */
T.word = (a, c, x) => {
  let wi = 0, wrongs = 0;
  function load() {
    const it = c.items[wi], w = it.word, L = Array.from(w);
    let sh; do { sh = aShuffle(L); } while (sh.join('') === w && L.length > 1);
    a.innerHTML = `<div class="visual q">${it.clue ? `<span class="clue">${it.clue}</span>` : ''}${it.sentence ? it.sentence.replace('____', `<span class="blank">${'＿'.repeat(L.length)}</span>`) : 'Harfleri doğru sıraya diz!'} <small class="qn">${wi + 1}/${c.items.length}</small></div>
      <div class="wslots">${L.map(() => '<span class="ws"></span>').join('')}</div><div class="wtiles">${sh.map((ch, i) => `<button class="wt" data-i="${i}">${ch}</button>`).join('')}</div>`;
    const slots = [...a.querySelectorAll('.ws')].map(e => ({ e, t: null, lock: false })), tiles = [...a.querySelectorAll('.wt')];
    tiles.forEach(t => t.onclick = () => {
      if (t.classList.contains('used')) return;
      const s = slots.find(s => !s.t && !s.lock); if (!s) return;
      s.t = t; s.e.textContent = t.textContent; s.e.classList.add('f'); t.classList.add('used'); sfx.click(); check();
    });
    slots.forEach(s => s.e.onclick = () => { if (s.lock || !s.t) return; s.t.classList.remove('used'); s.t = null; s.e.textContent = ''; s.e.classList.remove('f'); });
    function clear() { slots.forEach(s => { if (!s.lock && s.t) { s.t.classList.remove('used'); s.t = null; s.e.textContent = ''; s.e.classList.remove('f'); } }); }
    function check() {
      if (slots.some(s => !s.t && !s.lock)) return;
      const got = slots.map(s => s.e.textContent).join('');
      if (got === w) { slots.forEach(s => s.e.classList.add('right')); x.good(a.querySelector('.wslots'), 20); if (it.okSay) x.say(it.okSay); wi++; x.later(() => wi < c.items.length ? load() : x.done(), 1400); }
      else {
        wrongs++; x.wrong(a.querySelector('.wslots'), `Kelime “${L[0]}” harfiyle başlıyor.`);
        x.later(() => {
          clear();
          if (wrongs >= 3) { const pi = slots.findIndex(s => !s.lock); if (pi >= 0) { const t = tiles.find(t => !t.classList.contains('used') && t.textContent === L[pi]); if (t) { slots[pi].lock = true; slots[pi].t = t; slots[pi].e.textContent = L[pi]; slots[pi].e.classList.add('f', 'locked'); t.classList.add('used'); } } }
        }, 700);
      }
    }
    Adv._t = { solve: () => { clear(); L.forEach((ch, i) => { if (slots[i].lock) return; const t = tiles.find(t => !t.classList.contains('used') && t.textContent === ch); t.click(); }); } };
  }
  load();
};

/* ---- hafıza kartları ---- */
T.memory = (a, c, x) => {
  const sy = aShuffle(c.symbols).slice(0, c.pairs), deck = aShuffle(sy.concat(sy));
  a.innerHTML = `<div class="amem"></div>`;
  const g = a.querySelector('.amem');
  let first = null, lock = false, found = 0;
  deck.forEach(e => {
    const cd = el(`<div class="card" data-e="${e}"><div class="in"><div class="face front"></div><div class="face back"><span>${e}</span></div></div></div>`);
    cd.onclick = () => {
      if (lock || cd.classList.contains('up') || cd.classList.contains('done')) return;
      sfx.flip(); cd.classList.add('up');
      if (!first) { first = cd; return; }
      const f = first; first = null;
      if (f.dataset.e === cd.dataset.e) { x.later(() => { f.classList.add('done'); cd.classList.add('done'); f.classList.remove('up'); cd.classList.remove('up'); x.good(cd, 10); if (++found === c.pairs) x.later(() => x.done(), 700); }, 350); }
      else { lock = true; x.later(() => { f.classList.remove('up'); cd.classList.remove('up'); lock = false; }, 850); }
    };
    g.appendChild(cd);
  });
  const fit = () => {
    const n = deck.length, W = a.clientWidth - 10, H = a.clientHeight - 10, gap = 8; let best = { s: 0, c: 3 };
    for (let cc = 2; cc <= 6; cc++) { const r = Math.ceil(n / cc), s = Math.min((W - gap * (cc - 1)) / cc, (H - gap * (r - 1)) / r / 1.1); if (s > best.s) best = { s, c: cc }; }
    const s = Math.floor(Math.min(best.s, 130));
    g.style.gridTemplateColumns = `repeat(${best.c},${s}px)`; g.style.gridAutoRows = Math.floor(s * 1.1) + 'px'; g.style.setProperty('--fs', Math.floor(s * .55) + 'px');
  };
  requestAnimationFrame(fit); addEventListener('resize', fit); x.onClean(() => removeEventListener('resize', fit));
  Adv._t = { solve: () => { const byE = {}; g.querySelectorAll('.card').forEach(cd => (byE[cd.dataset.e] = byE[cd.dataset.e] || []).push(cd)); Object.values(byE).forEach(p => { p.forEach(cd => cd.classList.add('done')); }); found = c.pairs; x.later(() => x.done(), 300); } };
};

/* ---- hareket: yön tuşları + dokunarak git ---- */
function dpadHtml() { return `<div class="dpad"><button data-d="u" aria-label="Yukarı">▲</button><div><button data-d="l" aria-label="Sol">◀</button><button data-d="d" aria-label="Aşağı">▼</button><button data-d="r" aria-label="Sağ">▶</button></div></div>`; }
function bindDpad(a, x, onDir, repeatMs) {
  const keys = {};
  a.querySelectorAll('.dpad button').forEach(b => {
    let rt = null;
    const on = e => { e.preventDefault(); keys[b.dataset.d] = true; if (repeatMs) { onDir(b.dataset.d); rt = setInterval(() => onDir(b.dataset.d), repeatMs); } };
    const off = () => { keys[b.dataset.d] = false; clearInterval(rt); };
    b.addEventListener('pointerdown', on); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, off));
    x.onClean(() => clearInterval(rt));
  });
  const map = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r' };
  const kd = e => { const d = map[e.key]; if (!d) return; e.preventDefault(); if (repeatMs) { if (!e.repeat || true) onDir(d); } keys[d] = true; };
  const ku = e => { const d = map[e.key]; if (d) keys[d] = false; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  x.onClean(() => { removeEventListener('keydown', kd); removeEventListener('keyup', ku); });
  return keys;
}
function mover(arena, h, x, R, opt) {
  let W = arena.clientWidth, H = arena.clientHeight, px = opt.x != null ? opt.x : W / 2, py = opt.y != null ? opt.y : H / 2, target = null, run = true, last = performance.now();
  const keys = bindDpad(arena.parentElement, x, null, 0);
  const sp = opt.speed || 230;
  arena.addEventListener('pointerdown', e => { const r = arena.getBoundingClientRect(); target = { x: e.clientX - r.left, y: e.clientY - r.top }; const m = el(`<span class="tapmark" style="left:${target.x}px;top:${target.y}px">✨</span>`); arena.appendChild(m); setTimeout(() => m.remove(), 600); });
  const rs = () => { W = arena.clientWidth; H = arena.clientHeight; }; addEventListener('resize', rs);
  function blocked(nx, ny) { return (opt.blockers || []).some(b => Math.hypot(nx - b.x, ny - b.y) < R + b.r); }
  function step(t) {
    if (!run) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    let dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
    if (dx || dy) target = null;
    else if (target) { const vx = target.x - px, vy = target.y - py, d = Math.hypot(vx, vy); if (d < 5) target = null; else { dx = vx / d; dy = vy / d; } }
    const m = Math.hypot(dx, dy);
    if (m) {
      const nx = Math.max(R, Math.min(W - R, px + dx / m * sp * dt)), ny = Math.max(R, Math.min(H - R, py + dy / m * sp * dt));
      if (!blocked(nx, py)) px = nx; else if (target) target = null;
      if (!blocked(px, ny)) py = ny; else if (target) target = null;
      h.classList.add('walk'); if (dx > .2) h.classList.add('faceR'); else if (dx < -.2) h.classList.remove('faceR');
    } else h.classList.remove('walk');
    h.style.transform = `translate(${px - R}px,${py - R}px)`;
    if (opt.onMove) opt.onMove(px, py);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  x.onClean(() => { run = false; removeEventListener('resize', rs); });
  return { stop: () => { run = false; }, set: (nx, ny) => { px = nx; py = ny; }, get W() { return W; }, get H() { return H; } };
}

/* ---- yıldız toplama ---- */
T.collect = (a, c, x) => {
  a.innerHTML = `<div class="arena ${c.acls || ''}"><div class="acount">${c.icon || '⭐'} <b>0</b> / ${c.count}</div>${heroHtml(x.kid, 54)}</div>${dpadHtml()}`;
  const ar = a.querySelector('.arena'), h = ar.querySelector('.hero'), cnt = ar.querySelector('b');
  const R = 27; let got = 0, spawned = 0, stars = [], mv;
  function spawn() {
    if (spawned >= c.count) return; spawned++;
    const W = ar.clientWidth, H = ar.clientHeight; let sx, sy, t = 0;
    do { sx = aRnd(30, W - 30); sy = aRnd(50, H - 30); t++; } while (t < 40 && mv && Math.hypot(sx - W / 2, sy - H / 2) < 60);
    const s = el(`<div class="astar" style="left:${sx}px;top:${sy}px">${c.icon || '⭐'}</div>`); ar.appendChild(s); stars.push({ el: s, x: sx, y: sy });
  }
  mv = mover(ar, h, x, R, {
    onMove(px, py) {
      for (const s of stars.slice()) if (Math.hypot(px - s.x, py - s.y) < R + 20) {
        stars.splice(stars.indexOf(s), 1); s.el.classList.add('got'); sfx.star(); const r = s.el.getBoundingClientRect(); burst(r.left + 16, r.top + 16, '#ffc93c', 10);
        cnt.textContent = ++got; setTimeout(() => s.el.remove(), 500); spawn();
        if (got >= c.count) { mv.stop(); x.later(() => x.done(), 600); }
      }
    }
  });
  requestAnimationFrame(() => { for (let i = 0; i < Math.min(4, c.count); i++) spawn(); });
  Adv._t = { solve: () => { const go = () => { if (got >= c.count) return; const s = stars[0]; if (s) mv.set(s.x, s.y); setTimeout(go, 80); }; go(); } };
};

/* ---- topu kaleye götür (engelli) ---- */
T.goalKick = (a, c, x) => {
  a.innerHTML = `<div class="arena pitchA"><div class="goalnet"><span>🥅</span></div><div class="ballp">⚽</div></div>${dpadHtml()}`;
  const ar = a.querySelector('.arena'), b = ar.querySelector('.ballp'), net = ar.querySelector('.goalnet');
  const R = 22; let mv, scored = false;
  requestAnimationFrame(() => {
    const W = ar.clientWidth, H = ar.clientHeight, blockers = [];
    const rows = [.34, .55, .74];
    rows.forEach((ry, i) => { const n = i === 1 ? 2 : 1; for (let k = 0; k < n; k++) { const bx = n === 1 ? (i === 0 ? W * .35 : W * .62) : (k === 0 ? W * .2 : W * .8); blockers.push({ x: bx, y: H * ry, r: 26 }); } });
    blockers.forEach(bk => ar.appendChild(el(`<span class="cone" style="left:${bk.x}px;top:${bk.y}px">🔶</span>`)));
    mv = mover(ar, b, x, R, {
      x: W / 2, y: H - 40, speed: 210, blockers,
      onMove(px, py) {
        const nr = net.getBoundingClientRect(), arr = ar.getBoundingClientRect();
        if (!scored && py - R < nr.bottom - arr.top - 4 && px > nr.left - arr.left && px < nr.right - arr.left) {
          scored = true; mv.stop(); net.classList.add('shake'); confetti(); AdvAudio.noise(1.2, .05, 800); x.say(c.goalSay || 'GOOOOL! Harikasın!'); x.later(() => x.done(), 1800);
        }
      }
    });
    Adv._t = { solve: () => { const nr = net.getBoundingClientRect(), arr = ar.getBoundingClientRect(); mv.set((nr.left + nr.right) / 2 - arr.left, nr.bottom - arr.top - 10); } };
  });
};

/* ---- labirent ---- */
function genMaze(w, h) {
  const C = Array.from({ length: w * h }, () => ({ n: 1, e: 1, s: 1, w: 1, v: 0 })), st = [0]; C[0].v = 1;
  const opp = { n: 's', s: 'n', e: 'w', w: 'e' };
  while (st.length) {
    const i = st[st.length - 1], cx = i % w, cy = Math.floor(i / w), nb = [];
    if (cy > 0 && !C[i - w].v) nb.push(['n', i - w]); if (cx < w - 1 && !C[i + 1].v) nb.push(['e', i + 1]);
    if (cy < h - 1 && !C[i + w].v) nb.push(['s', i + w]); if (cx > 0 && !C[i - 1].v) nb.push(['w', i - 1]);
    if (!nb.length) { st.pop(); continue; }
    const [d, j] = aPick(nb); C[i][d] = 0; C[j][opp[d]] = 0; C[j].v = 1; st.push(j);
  }
  return C;
}
T.maze = (a, c, x) => {
  a.innerHTML = `<div class="maze-wrap"><div class="maze"></div></div>${dpadHtml()}`;
  const mz = a.querySelector('.maze');
  requestAnimationFrame(() => {
    const aw = a.clientWidth - 16, ah = a.clientHeight - 140, port = ah > aw;
    const w = port ? 5 : 7, h = port ? 6 : 4, C = genMaze(w, h);
    const cs = Math.floor(Math.min(aw / w, ah / h, 76));
    mz.style.gridTemplateColumns = `repeat(${w},${cs}px)`; mz.style.gridAutoRows = cs + 'px';
    C.forEach((cl, i) => { const d = el(`<div class="mc" style="border-top-width:${cl.n ? 4 : 0}px;border-right-width:${cl.e ? 4 : 0}px;border-bottom-width:${cl.s ? 4 : 0}px;border-left-width:${cl.w ? 4 : 0}px"></div>`); if (i === w * h - 1) d.innerHTML = `<span class="mgoal">${c.goal || '🏰'}</span>`; d.dataset.i = i; mz.appendChild(d); });
    const hs = Math.floor(cs * .74); const hEl = el(heroHtml(x.kid, hs)); hEl.classList.add('mhero'); mz.appendChild(hEl);
    let px = 0, py = 0, done = false;
    const place = () => { hEl.style.transform = `translate(${px * cs + (cs - hs) / 2}px,${py * cs + (cs - hs) / 2}px)`; };
    place();
    const D = { u: ['n', 0, -1], d: ['s', 0, 1], l: ['w', -1, 0], r: ['e', 1, 0] };
    function move(dir) {
      if (done) return false; const [wall, dx, dy] = D[dir];
      if (C[py * w + px][wall]) { hEl.classList.remove('bump'); void hEl.offsetWidth; hEl.classList.add('bump'); return false; }
      px += dx; py += dy; place(); if (dx) hEl.classList.toggle('faceR', dx > 0); AdvAudio.note(660 + py * 30, .06, 'sine', .03);
      if (px === w - 1 && py === h - 1) { done = true; x.good(mz.lastElementChild.previousElementSibling || mz, 24); x.later(() => x.done(), 900); }
      return true;
    }
    bindDpad(a, x, move, 230);
    mz.addEventListener('click', e => {
      const cell = e.target.closest('.mc'); if (!cell) return; const i = +cell.dataset.i, tx = i % w, ty = Math.floor(i / w);
      const dir = tx === px ? (ty > py ? 'd' : ty < py ? 'u' : null) : ty === py ? (tx > px ? 'r' : 'l') : null; if (!dir) return;
      let steps = Math.abs(tx - px) + Math.abs(ty - py); const go = () => { if (steps-- > 0 && move(dir)) setTimeout(go, 160); }; go();
    });
    let ss = null;
    mz.addEventListener('pointerdown', e => ss = [e.clientX, e.clientY]);
    mz.addEventListener('pointerup', e => { if (!ss) return; const dx = e.clientX - ss[0], dy = e.clientY - ss[1]; ss = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u')); });
    Adv._t = { solve: () => {
      const prev = new Map([[0, null]]), q = [0];
      while (q.length) { const i = q.shift(); if (i === w * h - 1) break; const cx = i % w, cy = Math.floor(i / w); [['n', -w], ['s', w], ['e', 1], ['w', -1]].forEach(([d, o]) => { if (!C[i][d] && !prev.has(i + o)) { prev.set(i + o, [i, d]); q.push(i + o); } }); }
      const path = []; let cur = w * h - 1; while (prev.get(cur)) { const [p, d] = prev.get(cur); path.unshift(d); cur = p; }
      const m = { n: 'u', s: 'd', e: 'r', w: 'l' }; path.forEach(d => move(m[d]));
    } };
  });
};

/* ---- yapboz (aile fotoğrafı, bayrak, anneanne) ---- */
async function puzzleSource(kind, S) {
  const cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d');
  const cover = (im, dx, dy, dw, dh, fy) => { const r = Math.max(dw / im.width, dh / im.height), sw = dw / r, sh = dh / r; g.drawImage(im, (im.width - sw) / 2, Math.max(0, (im.height - sh) * (fy == null ? .3 : fy)), sw, sh, dx, dy, dw, dh); };
  if (kind === 'scotflag') {
    g.fillStyle = '#005eb8'; g.fillRect(0, 0, S, S); g.strokeStyle = '#fff'; g.lineWidth = S * .16;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(S, S); g.moveTo(S, 0); g.lineTo(0, S); g.stroke();
  } else if (kind === 'tsflag') {
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? TS_MAVI : TS_BORDO; g.fillRect(i * S / 4, 0, S / 4, S); }
    g.font = `${S * .3}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⚽', S / 2, S / 2);
  } else {
    let im = null;
    if (kind === 'parents') im = await Adv.loadImg([FAMILY.parents.photo]);
    if (im) cover(im, 0, 0, S, S, .35);
    else {
      const n = kind === 'parents' ? ['anne', 'baba'] : [kind];
      const ims = await Promise.all(n.map(k => Adv.loadImg([Adv.photo(k)], k)));
      g.fillStyle = '#ffe3f0'; g.fillRect(0, 0, S, S);
      ims.forEach((m, i) => m && cover(m, i * S / ims.length, 0, S / ims.length, S, .2));
    }
  }
  try { return cv.toDataURL('image/jpeg', .9); } catch (e) { return Adv.fallback('anne'); }
}
T.puzzle = async (a, c, x) => {
  const cols = c.cols || 3, rows = c.rows || 3, n = cols * rows;
  a.innerHTML = `<div class="pz-wrap"><div class="pz"></div><div class="pz-ref"></div></div>`;
  const S = Math.floor(Math.min(a.clientWidth * .82, a.clientHeight - 30, 420));
  const url = await puzzleSource(c.src, 600);
  if (!a.isConnected) return;
  const pz = a.querySelector('.pz'), ref = a.querySelector('.pz-ref');
  ref.style.backgroundImage = `url(${url})`;
  pz.style.width = S + 'px'; pz.style.height = Math.floor(S * rows / cols) + 'px'; pz.style.gridTemplateColumns = `repeat(${cols},1fr)`;
  let order; do { order = aShuffle(Array.from({ length: n }, (_, i) => i)); } while (order.every((v, i) => v === i) || (n > 2 && order.filter((v, i) => v === i).length > n / 3));
  const ph = Math.floor(S * rows / cols) / rows, pw = S / cols;
  const pieces = order.map(p => { const d = el(`<div class="pc"></div>`); d.dataset.p = p; d.style.backgroundImage = `url(${url})`; d.style.backgroundSize = `${S}px ${pw * cols * rows / cols * 1}px`; pz.appendChild(d); return d; });
  const paint = () => [...pz.children].forEach((d, i) => { const p = +d.dataset.p; d.style.backgroundSize = `${S}px ${ph * rows}px`; d.style.backgroundPosition = `-${(p % cols) * pw}px -${Math.floor(p / cols) * ph}px`; d.classList.toggle('fixed', p === i); });
  paint();
  let sel = null, solved = false;
  function swap(a1, b1) { const t = a1.dataset.p; a1.dataset.p = b1.dataset.p; b1.dataset.p = t; sfx.flip(); paint(); check(); }
  function check() { if ([...pz.children].every((d, i) => +d.dataset.p === i)) { solved = true; pz.classList.add('solved'); x.good(pz, 30); if (c.okSay) x.say(c.okSay); x.later(() => x.done(), 1600); } }
  pz.addEventListener('pointerdown', e => {
    const d = e.target.closest('.pc'); if (!d || solved) return;
    if (n === 2 || (x.ela && n <= 3)) { const other = [...pz.children].find((o, i) => o !== d && +o.dataset.p !== i) || [...pz.children].find(o => o !== d); swap(d, other); return; }
    if (sel && sel !== d) { sel.classList.remove('sel'); swap(sel, d); sel = null; }
    else if (sel === d) { d.classList.remove('sel'); sel = null; }
    else { sel = d; d.classList.add('sel'); sfx.click(); }
  });
  x.idle(() => { const d = [...pz.children].find((o, i) => +o.dataset.p !== i); if (d) { d.classList.add('glow'); x.later(() => d.classList.remove('glow'), 3000); } x.speak(c.voice || c.say); });
  Adv._t = { solve: () => { [...pz.children].forEach((d, i) => d.dataset.p = i); paint(); check(); } };
};

/* ---- Simon: renk dizisini tekrarla ---- */
T.simon = (a, c, x) => {
  const pads = [['#ff6fa8', 523, 'Pembe'], ['#9b6bff', 659, 'Mor'], ['#4fb3ff', 784, 'Mavi'], ['#ffc93c', 988, 'Sarı']];
  a.innerHTML = `<div class="visual q">Işıkları izle, sonra aynı sırayla dokun! <b class="sr"></b></div><div class="simon">${pads.map((p, i) => `<button class="spad" data-i="${i}" style="--c:${p[0]}"></button>`).join('')}</div>`;
  const btns = [...a.querySelectorAll('.spad')], sr = a.querySelector('.sr'), L = c.lengths || [3, 4, 5];
  let round = 0, seq = [], pos = 0, busy = true;
  const flash = (i, ms) => { btns[i].classList.add('lit'); AdvAudio.note(pads[i][1], (ms || 400) / 1000, 'triangle', .07); setTimeout(() => btns[i].classList.remove('lit'), ms || 400); };
  function show() { busy = true; pos = 0; sr.textContent = `Tur ${round + 1}/${L.length}`; seq.forEach((v, k) => x.later(() => flash(v, 420), 700 + k * 650)); x.later(() => { busy = false; }, 700 + seq.length * 650); }
  function newRound() { while (seq.length < L[round]) seq.push(aRnd(0, 3)); show(); }
  btns.forEach((b, i) => b.onclick = () => {
    if (busy) return; flash(i, 260);
    if (i === seq[pos]) { pos++; if (pos === seq.length) { busy = true; x.good(b, 10); round++; if (round >= L.length) x.later(() => x.done(), 700); else x.later(newRound, 900); } }
    else { x.wrong(b, 'Renkleri sesli söyle: ' + seq.map(v => pads[v][2]).join(', ')); x.later(show, 900); }
  });
  x.later(newRound, 400);
  Adv._t = { solve: () => { round = L.length - 1; seq = seq.slice(0, 1); busy = false; pos = 0; seq.length = 1; btns[seq[0]].click(); } };
};

/* ---- ritim oyunu ---- */
T.rhythm = (a, c, x) => {
  const lanes = [['#ff6fa8', 523], ['#9b6bff', 659], ['#4fb3ff', 784]];
  a.innerHTML = `<div class="rh"><div class="rh-count">🎵 <b>0</b> / ${c.need}</div>${lanes.map((l, i) => `<div class="lane" style="--c:${l[0]}"></div>`).join('')}<div class="hitline"></div></div><div class="rh-btns">${lanes.map((l, i) => `<button class="rhb" data-i="${i}" style="--c:${l[0]}">${['💗', '💜', '💙'][i]}</button>`).join('')}</div>`;
  const rh = a.querySelector('.rh'), laneEls = [...a.querySelectorAll('.lane')], cnt = a.querySelector('.rh-count b');
  AdvAudio.pauseMusic(true); x.onClean(() => AdvAudio.pauseMusic(false));
  const FALL = c.fall || 2000, BEAT = c.beat || 750;
  let notes = [], hits = 0, run = true, beatN = 0, done = false;
  const beat = setInterval(() => {
    if (!run) return; AdvAudio.kick(); if (beatN % 2) AdvAudio.noise(.05, .02, 6000);
    if (beatN % 1 === 0 && Math.random() < .85) { const ln = aRnd(0, 2), e = el(`<span class="rnote">♪</span>`); laneEls[ln].appendChild(e); notes.push({ ln, t0: performance.now(), e, hit: false }); }
    beatN++;
  }, BEAT);
  x.onClean(() => { run = false; clearInterval(beat); });
  function frame(t) {
    if (!run) return;
    const H = rh.clientHeight, hy = H - 70;
    notes.forEach(n => { const y = (t - n.t0) / FALL * hy; n.y = y; n.e.style.transform = `translate(-50%,${y}px)`; });
    notes = notes.filter(n => { if (n.y > H) { n.e.remove(); return false; } return true; });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  function hit(ln) {
    const H = rh.clientHeight, hy = H - 70;
    const n = notes.find(n => n.ln === ln && !n.hit && Math.abs(n.y - hy) < 60);
    AdvAudio.note(lanes[ln][1], .25, 'triangle', .06);
    const b = a.querySelectorAll('.rhb')[ln]; b.classList.remove('hitp'); void b.offsetWidth; b.classList.add('hitp');
    if (n) { n.hit = true; n.e.classList.add('hit'); setTimeout(() => n.e.remove(), 300); notes = notes.filter(o => o !== n); cnt.textContent = ++hits; const r = laneEls[ln].getBoundingClientRect(); burst(r.left + r.width / 2, r.top + hy, lanes[ln][0], 8);
      if (hits >= c.need && !done) { done = true; run = false; clearInterval(beat); x.later(() => x.done(), 700); } }
  }
  a.querySelectorAll('.rhb').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); hit(+b.dataset.i); }));
  const kd = e => { const m = { ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2, '1': 0, '2': 1, '3': 2 }[e.key]; if (m !== undefined) hit(m); };
  addEventListener('keydown', kd); x.onClean(() => removeEventListener('keydown', kd));
  Adv._t = { solve: () => { hits = c.need - 1; const H = rh.clientHeight; notes.push({ ln: 0, t0: 0, e: el('<span></span>'), hit: false, y: H - 70 }); const t0 = notes[notes.length - 1]; t0.y = H - 70; hit(0); } };
};

/* ---- afişi süsle ---- */
T.stampFill = (a, c, x) => {
  const spots = c.spots;
  a.innerHTML = `<div class="poster"><div class="pt">${c.title}</div><div class="psub">${c.sub || ''}</div>${spots.map(([l, t], i) => `<button class="pspot" style="left:${l}%;top:${t}%" data-i="${i}"></button>`).join('')}</div><div class="stamps">${c.stamps.map((s, i) => `<button class="stp ${i === 0 ? 'sel' : ''}" data-s="${s}">${s}</button>`).join('')}</div>`;
  let cur = c.stamps[0], filled = 0;
  a.querySelectorAll('.stp').forEach(b => b.onclick = () => { a.querySelectorAll('.stp').forEach(o => o.classList.remove('sel')); b.classList.add('sel'); cur = b.dataset.s; sfx.click(); });
  a.querySelectorAll('.pspot').forEach(b => b.onclick = () => {
    if (b.classList.contains('f')) { b.textContent = cur; sfx.pop(); return; }
    b.textContent = cur; b.classList.add('f'); sfx.pop(); x.good(b, 8);
    if (++filled === spots.length) { a.querySelector('.poster').classList.add('done'); x.later(() => x.done(), 1200); }
  });
  Adv._t = { solve: () => a.querySelectorAll('.pspot:not(.f)').forEach(b => b.click()) };
};

/* ---- Ela: say ve dokun ---- */
T.tapCount = (a, c, x) => {
  a.innerHTML = `<div class="tc-num"></div><div class="tc-field ${c.fcls || ''}"></div>`;
  const f = a.querySelector('.tc-field'), num = a.querySelector('.tc-num');
  let n = 0;
  aShuffle(c.items).forEach((it, i) => {
    const b = el(`<button class="tc-item ${it.cls || ''}" style="animation-delay:-${(i * .4).toFixed(1)}s">${it.html}</button>`);
    if (!c.filter || it.ok) b.dataset.ok = 1;
    b.onclick = () => {
      if (b.classList.contains('used') || n >= c.need) return;
      if (c.filter && !it.ok) { x.wrong(b, null, c.wrongSay); return; }
      b.classList.add('used'); n++; x.good(b, 12); sfx.pop();
      num.textContent = n; num.classList.remove('show'); void num.offsetWidth; num.classList.add('show');
      x.speak(NUMS_TR[n]);
      if (n >= c.need) { x.later(() => { if (c.okSay) x.say(c.okSay); }, 700); x.later(() => x.done(), 1800); }
    };
    f.appendChild(b);
  });
  x.idle(() => { glowOk(f, x); x.speak(c.voice || c.say); });
  Adv._t = { solve: () => { f.querySelectorAll('[data-ok]:not(.used)').forEach(b => b.click()); } };
};

/* ---- Ela: yavaşça uçuşanlara dokun ---- */
T.floatTap = (a, c, x) => {
  a.innerHTML = `<div class="tc-num"></div><div class="float-field"></div>`;
  const f = a.querySelector('.float-field'), num = a.querySelector('.tc-num');
  let n = 0, run = true, items = [], last = performance.now();
  requestAnimationFrame(() => {
    const W = f.clientWidth, H = f.clientHeight, S = Math.min(110, Math.max(80, W / 4.2));
    for (let i = 0; i < c.count; i++) {
      const b = el(`<button class="fl-item" data-ok="1" style="width:${S}px;height:${S}px">${typeof c.html === 'function' ? c.html(i) : c.html}</button>`);
      const it = { b, x: aRnd(0, W - S), y: aRnd(0, H - S), vx: (Math.random() < .5 ? -1 : 1) * aRnd(18, 38) * (c.speed || 1), vy: (Math.random() < .5 ? -1 : 1) * aRnd(14, 30) * (c.speed || 1), S };
      b.onclick = () => {
        if (b.classList.contains('used')) return; b.classList.add('used'); n++; x.good(b, 14); sfx.star();
        num.textContent = n; num.classList.remove('show'); void num.offsetWidth; num.classList.add('show'); x.speak(NUMS_TR[n]);
        if (n >= c.count) { x.later(() => c.okSay && x.say(c.okSay), 600); x.later(() => x.done(), 1700); }
      };
      f.appendChild(b); items.push(it);
    }
    const loop = t => {
      if (!run) return; const dt = Math.min(.05, (t - last) / 1000); last = t;
      const W2 = f.clientWidth, H2 = f.clientHeight;
      items.forEach(it => { if (it.b.classList.contains('used')) return; it.x += it.vx * dt; it.y += it.vy * dt; if (it.x < 0 || it.x > W2 - it.S) it.vx *= -1; if (it.y < 0 || it.y > H2 - it.S) it.vy *= -1; it.x = Math.max(0, Math.min(W2 - it.S, it.x)); it.y = Math.max(0, Math.min(H2 - it.S, it.y)); it.b.style.transform = `translate(${it.x}px,${it.y}px)`; });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
  x.onClean(() => { run = false; });
  x.idle(() => { glowOk(f, x); x.speak(c.voice || c.say); });
  Adv._t = { solve: () => f.querySelectorAll('.fl-item:not(.used)').forEach(b => b.click()) };
};

/* ---- Ela: anahtar ve kapı ---- */
T.keyDoor = (a, c, x) => {
  a.innerHTML = `<div class="door-wrap"><div class="door"><div class="dlight"></div><div class="dleaf l"></div><div class="dleaf r"></div><div class="khole">🔒</div></div><button class="key-btn" data-ok="1">🗝️</button></div>`;
  const k = a.querySelector('.key-btn'), door = a.querySelector('.door'), kh = a.querySelector('.khole');
  k.onclick = () => {
    if (k.classList.contains('used')) return; k.classList.add('used');
    const r1 = k.getBoundingClientRect(), r2 = kh.getBoundingClientRect();
    k.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${r2.left - r1.left}px,${r2.top - r1.top}px) rotate(90deg) scale(.6)` }], { duration: 900, easing: 'ease-in-out', fill: 'forwards' });
    x.later(() => { kh.textContent = '🔓'; AdvAudio.note(880, .3, 'sine', .05); }, 950);
    x.later(() => { door.classList.add('open'); [523, 659, 784, 1047].forEach((f, i) => AdvAudio.note(f, .6, 'sine', .05, i * .15)); if (c.okSay) x.say(c.okSay); }, 1300);
    x.later(() => x.done(), 3200);
  };
  x.idle(() => { k.classList.add('glow'); x.later(() => k.classList.remove('glow'), 3000); x.speak(c.voice || c.say); });
  Adv._t = { solve: () => k.click() };
};

/* ---- Ela: kaleye gol ---- */
T.goalTap = (a, c, x) => {
  a.innerHTML = `<div class="gt"><button class="gt-goal" data-ok="1"><span>🥅</span></button><div class="gt-ball">⚽</div><div class="gt-kid">${Adv.img(x.kid)}<span class="jersey">${SVG.jersey(TS_BORDO, 4)}</span></div></div>`;
  const g = a.querySelector('.gt-goal'), b = a.querySelector('.gt-ball');
  g.onclick = () => {
    if (g.classList.contains('used')) return; g.classList.add('used');
    const r1 = b.getBoundingClientRect(), r2 = g.getBoundingClientRect();
    b.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${r2.left + r2.width / 2 - r1.left - r1.width / 2}px,${r2.top + r2.height / 2 - r1.top - r1.height / 2}px) scale(.7) rotate(720deg)` }], { duration: 800, easing: 'ease-in', fill: 'forwards' });
    x.later(() => { g.classList.add('shake'); confetti(); AdvAudio.noise(1.4, .05, 700); x.say(c.okSay || 'GOOOOL!'); }, 820);
    x.later(() => x.done(), 2800);
  };
  x.idle(() => { g.classList.add('glow'); x.later(() => g.classList.remove('glow'), 3000); x.speak(c.voice || c.say); });
  Adv._t = { solve: () => g.click() };
};

/* ---- Ela: ışıkları yak ---- */
T.lamps = (a, c, x) => {
  const L = c.lamps; // [{c, name}]
  let k = 0;
  a.innerHTML = `<div class="opt-row lamps">${aShuffle(L.map((l, i) => i)).map(i => `<button class="aopt lamp" data-i="${i}">${SVG.lamp(L[i].c, false)}</button>`).join('')}</div>`;
  const ask = () => { if (k >= L.length) return; x.say(`${L[k].name} ışığı yak!`); a.querySelectorAll('.lamp').forEach(b => { if (+b.dataset.i === k) b.dataset.ok = 1; else delete b.dataset.ok; }); };
  a.querySelectorAll('.lamp').forEach(b => b.onclick = () => {
    const i = +b.dataset.i; if (b.classList.contains('used')) return;
    if (i === k) { b.classList.add('used', 'dance'); b.innerHTML = SVG.lamp(L[i].c, true); x.good(b, 14); AdvAudio.note(523 + k * 130, .4, 'triangle', .06); k++; if (k < L.length) x.later(ask, 900); else { x.later(() => x.say(c.okSay || 'Yaşasın! Bütün ışıklar yandı!'), 600); x.later(() => x.done(), 1900); } }
    else x.wrong(b, null, `Bu ${L[i].name.toLowerCase()}. ${L[k].name} ışığı bulalım!`);
  });
  ask();
  x.idle(() => { if (k >= L.length) return; glowOk(a, x); x.speak(`${L[k].name} ışığı yak!`); });
  Adv._t = { solve: () => { for (let i = k; i < L.length; i++) a.querySelector(`.lamp[data-i="${i}"]`).click(); } };
};

/* ---- Ela: dans eden karakter ---- */
T.dancer = (a, c, x) => {
  const moves = ['dz-spin', 'dz-jump', 'dz-wiggle', 'dz-flip'];
  a.innerHTML = `<div class="tc-num"></div><button class="dancer" data-ok="1">${c.html || '🐻'}</button><div class="dfloor">${'💡'.repeat(6)}</div>`;
  const d = a.querySelector('.dancer'), num = a.querySelector('.tc-num'); let n = 0;
  d.onclick = () => {
    if (n >= c.need) return; d.className = 'dancer ' + moves[n % moves.length]; n++; sfx.pop(); x.good(d, 10);
    num.textContent = n; num.classList.remove('show'); void num.offsetWidth; num.classList.add('show');
    x.speak(aPick(['Dans!', 'Zıpla!', 'Dön!', 'Harika!']));
    if (n >= c.need) { x.later(() => x.say(c.okSay), 700); x.later(() => x.done(), 2000); }
  };
  x.idle(() => { d.classList.add('glow'); x.later(() => d.classList.remove('glow'), 3000); x.speak(c.voice || c.say); });
  Adv._t = { solve: () => { for (let i = n; i < c.need; i++) d.click(); } };
};

/* ---- altın kalp ---- */
T.goldHeart = (a, c, x) => {
  a.innerHTML = `<button class="gheart" data-ok="1">💛</button>`;
  const b = a.querySelector('.gheart');
  b.onclick = () => {
    if (b.classList.contains('used')) return; b.classList.add('used', 'shine'); x.good(b, 30); confetti();
    [523, 659, 784, 1047, 1319].forEach((f, i) => AdvAudio.note(f, .7, 'sine', .05, i * .14));
    const s = el('<span class="gstar">✨</span>'); a.appendChild(s);
    if (c.okSay) x.say(c.okSay);
    x.later(() => x.done(), 2600);
  };
  x.idle(() => { b.classList.add('glow'); x.speak(c.voice || c.say); });
  Adv._t = { solve: () => b.click() };
};

/* =====================================================================
   ARA SAHNELER  SC[type](alan, ayar, ctx, bitince)
   ===================================================================== */
const SC = {};
SC.message = (a, c, x, then) => {
  a.innerHTML = `<div class="msgs"><div class="mphotos">${c.people.map(p => `<div class="mph">${Adv.img(p)}<span>${FAMILY[p].name}</span></div>`).join('')}</div><div class="mlines"></div><button class="abtn" style="opacity:0;pointer-events:none">${c.btn || 'Devam ▶'}</button></div>`;
  const ml = a.querySelector('.mlines'), btn = a.querySelector('.abtn');
  let t = 300;
  c.lines.forEach(l => {
    x.later(() => { const d = el(`<p class="ml ${l.who || ''}"><b>${l.who ? FAMILY[l.who].name + ':' : ''}</b> ${l.text}</p>`); ml.appendChild(d); x.speak(l.voice || l.text, { lang: l.lang, queue: true }); ml.scrollTop = 1e4; }, t);
    t += l.ms || 2600;
  });
  x.later(() => { btn.style.opacity = 1; btn.style.pointerEvents = ''; btn.classList.add('pulse'); }, Math.min(t, 2500));
  btn.onclick = () => { sfx.ding(); then(); };
  if (c.confetti) x.later(confetti, 400);
};
SC.plane = (a, c, x, then) => {
  a.innerHTML = `<div class="flight"><div class="fl-from">${c.from || 'Trabzon'} 💙</div><div class="fl-to">${c.to || 'İskoçya'} 🏰</div><svg viewBox="0 0 300 120" preserveAspectRatio="none"><path d="M20 100 Q150 -20 280 90" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 8"/></svg><div class="plane">✈️</div>${'<span class="fc">☁️</span>'.repeat(5)}</div>`;
  if (c.say) x.say(c.say);
  AdvAudio.noise(3, .015, 300);
  x.later(then, 4300);
};
SC.doorLights = (a, c, x, then) => {
  a.innerHTML = `<div class="cdoor"><div class="cd-gate">🏰</div><div class="cd-slots">${[0, 1, 2, 3, 4].map(i => `<span class="cslot" data-i="${i}"></span>`).join('')}</div></div><button class="abtn" style="opacity:0;pointer-events:none">▶ Son Görevlere Başla</button>`;
  const sl = a.querySelectorAll('.cslot');
  for (let i = 0; i < 4; i++) x.later(() => { sl[i].classList.add('on'); sfx.star(); const r = sl[i].getBoundingClientRect(); burst(r.left + 20, r.top + 20, '#ffc93c', 10); }, 700 + i * 700);
  x.later(() => { sl[4].classList.add('wait'); const b = a.querySelector('.abtn'); b.style.opacity = 1; b.style.pointerEvents = ''; b.classList.add('pulse'); if (c.say) x.say(c.say); }, 3600);
  a.querySelector('.abtn').onclick = () => { sfx.ding(); then(); };
};
SC.banner = (a, c, x, then) => {
  a.innerHTML = `<div class="sbanner"><div class="sb-big">${c.text}</div>${c.sub ? `<div class="sb-sub">${c.sub}</div>` : ''}</div>`;
  confetti(); AdvAudio.celebrate(); x.say(c.text);
  x.later(then, c.ms || 3500);
};
