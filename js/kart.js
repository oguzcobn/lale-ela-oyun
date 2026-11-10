/* =====================================================================
   LALE & ELA KART YARIŞI — özgün, tarayıcıda çalışan 3D kart oyunu
   Pistler: Trabzon Sahil Yolu, İskoçya Şato Yolu
   ===================================================================== */
import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from './vendor/geometries/RoundedBoxGeometry.js';
import * as GFX from './gfx.js';
const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: .82, metalness: 0 }, o));

const TRACKS = {
  trabzon: {
    name: 'Trabzon Sahil Yolu', emoji: '🌊', sky: 0xbfe7ff, fog: 0xd8f0ff, grass: 0x6cc276, music: 'trabzon',
    pts: [[0, 0], [70, -14], [140, -6], [190, 30], [186, 92], [140, 118], [92, 96], [50, 120], [-6, 112], [-52, 80], [-60, 30]],
    curb: [0x8a1538, 0x5cb8f0], sea: true
  },
  scotland: {
    name: 'İskoçya Şato Yolu', emoji: '🏰', sky: 0xcfe0f2, fog: 0xe4edf7, grass: 0x7fb97b, music: 'scotland',
    pts: [[0, 0], [60, -26], [122, -16], [158, 30], [132, 78], [84, 66], [56, 112], [0, 128], [-52, 98], [-74, 50], [-44, 18]],
    curb: [0xffffff, 0x005eb8], castle: true
  }
};
const ROAD_W = 16, N = 600;

let R = null; // aktif yarış
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const glbCache = {};
const loadGlb = k => (glbCache[k] = glbCache[k] || new GLTFLoader().loadAsync(`assets/characters/${k}.glb`).catch(() => null));
const isMuted = () => (typeof muted !== 'undefined' && muted);
const speak = (t) => { if (typeof AdvAudio !== 'undefined') AdvAudio.speak(t); };
const NAMES = { lale: 'Lale', ela: 'Ela', anne: 'Anne Nicole', baba: 'Baba Oğuzhan', bear: 'Ayıcık', sheep: 'Kuzucuk' };
const FAMILY_DRIVERS = ['lale', 'ela', 'anne', 'baba'];

/* ---------------- arayüz ---------------- */
function ui(host, kid) {
  host.innerHTML = `<div class="kt-wrap">
    <div class="kt-menu">
      <div class="kt-top"><button class="icon-btn" data-a="back">⬅️</button><h2>🏎️ Kart Yarışı</h2><div style="width:58px"></div></div>
      <div class="kt-hello">${kid === 'ela' ? 'Ela, hangi pistte yarışalım?' : 'Lale, pistini seç!'}</div>
      <div class="kt-sub">Sürücünü seç</div>
      <div class="kt-drivers">${FAMILY_DRIVERS.map(d => `<button class="kt-drv" data-d="${d}"><img src="assets/characters/${d}.png" alt=""><b>${NAMES[d]}</b></button>`).join('')}</div>
      <div class="kt-sub">Pistini seç</div>
      <div class="kt-tracks">${Object.entries(TRACKS).map(([id, t]) => {
        const best = store.get(`kart_best_${kid}_${id}`, null);
        return `<button class="kt-track kt-${id}" data-t="${id}"><span class="e">${t.emoji}</span><b>${t.name}</b><small>${best ? '⏱️ En iyi: ' + fmt(best) : '★ Yeni pist'}</small></button>`;
      }).join('')}</div>
      <button class="kt-gfx" data-a="gfx"></button>
      <div class="kt-help">${kid === 'ela' ? '🚗 Araba kendisi gider! ◀ ▶ ile dön, ⭐ topla!' : '◀ ▶ ile dön · ⭐ topla · 🚀 ile turbo yap · klavyede ok tuşları'}</div>
    </div>
    <div class="kt-game" hidden>
      <div class="kt-canvas"></div>
      <div class="kt-hud"><button class="icon-btn" data-a="quit">⬅️</button><div class="kt-pill kt-lap">Tur 1/3</div><div class="kt-pill kt-pos">1/4</div><div class="kt-pill kt-stars">⭐ 0</div><canvas class="kt-mini" width="120" height="120"></canvas></div>
      <div class="kt-count"></div>
      <div class="kt-ctrl"><div class="kt-steer"><button data-k="l">◀</button><button data-k="r">▶</button></div><div class="kt-act"><button data-k="boost" class="kt-boost">🚀</button><button data-k="brake" class="kt-brake">✋</button></div></div>
      <div class="kt-end" hidden></div>
    </div></div>`;
  return host.querySelector('.kt-wrap');
}
const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;

/* ---------------- dokular ---------------- */
function roadTexture(c1, c2) {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 256; const g = cv.getContext('2d');
  g.fillStyle = '#6b6f7a'; g.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .06})`; g.fillRect(Math.random() * 128, Math.random() * 256, 2, 2); }
  g.fillStyle = '#fff'; g.fillRect(62, 0, 4, 110);
  const hex = c => '#' + c.toString(16).padStart(6, '0');
  for (let y = 0; y < 256; y += 64) { g.fillStyle = hex(c1); g.fillRect(0, y, 10, 32); g.fillRect(118, y, 10, 32); g.fillStyle = hex(c2); g.fillRect(0, y + 32, 10, 32); g.fillRect(118, y + 32, 10, 32); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function textSprite(txt, bg, fg, w = 512, h = 128) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 30); g.fill();
  g.fillStyle = fg; g.font = `900 ${h * .55}px Nunito, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function checker() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 32; const g = cv.getContext('2d');
  for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) { g.fillStyle = (x + y) % 2 ? '#222' : '#fff'; g.fillRect(x * 8, y * 8, 8, 8); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------------- pist ---------------- */
function buildTrack(scene, T) {
  const curve = new THREE.CatmullRomCurve3(T.pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
  const P = [], D = [], Nm = [];
  for (let i = 0; i < N; i++) { const p = curve.getPointAt(i / N), d = curve.getTangentAt(i / N).setY(0).normalize(); P.push(p); D.push(d); Nm.push(new THREE.Vector3(-d.z, 0, d.x)); }
  // yol şeridi
  const pos = [], uv = [], idx = []; let len = 0;
  for (let i = 0; i <= N; i++) {
    const k = i % N, p = P[k], n = Nm[k];
    if (i > 0) len += P[k].distanceTo(P[(i - 1) % N]);
    pos.push(p.x + n.x * ROAD_W / 2, .02, p.z + n.z * ROAD_W / 2, p.x - n.x * ROAD_W / 2, .02, p.z - n.z * ROAD_W / 2);
    uv.push(0, len / 16, 1, len / 16);
    if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  { const road = new THREE.Mesh(geo, std({ map: roadTexture(T.curb[0], T.curb[1]), side: THREE.DoubleSide, roughness: .7 })); road.receiveShadow = true; road.userData.flat = true; scene.add(road); }
  // kenar çitleri (yumuşak saman balyaları)
  const balyaG = new THREE.CylinderGeometry(1.1, 1.1, 1.6, 10), balyaM = std({ color: 0xf0d27a });
  const bales = new THREE.InstancedMesh(balyaG, balyaM, Math.floor(N / 6) * 2); let bi = 0; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < N; i += 6) for (const sg of [1, -1]) { const p = P[i].clone().addScaledVector(Nm[i], sg * (ROAD_W / 2 + 4.5)); q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(D[i].x, D[i].z))); m4.compose(p.setY(.9), q, s1); bales.setMatrixAt(bi++, m4); }
  scene.add(bales);
  // başlangıç çizgisi ve kemer
  const sl = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, 3), new THREE.MeshBasicMaterial({ map: checker() }));
  sl.rotation.x = -Math.PI / 2; sl.rotation.z = -Math.atan2(D[0].x, D[0].z); sl.position.copy(P[0]).setY(.04); scene.add(sl);
  const arch = new THREE.Group(), postM = std({ color: 0xffffff });
  for (const sg of [1, -1]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 9), postM); post.position.set(sg * (ROAD_W / 2 + 1), 4.5, 0); arch.add(post); }
  const ban = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W + 3, 3.4), new THREE.MeshBasicMaterial({ map: textSprite('BAŞLA · BİTİŞ', '#ff6fa8', '#fff', 768, 160), side: THREE.DoubleSide }));
  ban.position.y = 8.4; ban.rotation.y = Math.PI; arch.add(ban); arch.position.copy(P[0]); arch.rotation.y = Math.atan2(D[0].x, D[0].z); scene.add(arch);
  // turbo pedleri
  const boosts = [];
  const bt = (() => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; const g = cv.getContext('2d'); g.fillStyle = '#ffc93c'; g.fillRect(0, 0, 64, 128); g.fillStyle = '#ff7a00'; for (let y = 10; y < 128; y += 40) { g.beginPath(); g.moveTo(8, y + 24); g.lineTo(32, y); g.lineTo(56, y + 24); g.lineTo(56, y + 34); g.lineTo(32, y + 12); g.lineTo(8, y + 34); g.fill(); } const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  [.18, .46, .74].forEach(f => { const i = Math.floor(f * N), off = (Math.random() < .5 ? -1 : 1) * 3; const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshBasicMaterial({ map: bt })); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(D[i].x, D[i].z) + Math.PI; m.position.copy(P[i]).addScaledVector(Nm[i], off).setY(.05); scene.add(m); boosts.push({ i, pos: m.position.clone() }); });
  return { curve, P, D, Nm, boosts };
}

function offRoad(P, x, z, margin) { for (let i = 0; i < N; i += 3) { if (Math.hypot(P[i].x - x, P[i].z - z) < ROAD_W / 2 + margin) return false; } return true; }
function scenery(scene, T, tr) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), std({ color: 0xffffff, map: GFX.grassTexture('#' + T.grass.toString(16).padStart(6, '0'), 120) })); ground.receiveShadow = true; ground.userData.flat = true;
  ground.rotation.x = -Math.PI / 2; ground.position.set(60, -.02, 50); scene.add(ground);
  const place = (n, margin, fn, area) => { let k = 0, tries = 0; while (k < n && tries++ < n * 30) { const x = rnd(area[0], area[1]), z = rnd(area[2], area[3]); if (offRoad(tr.P, x, z, margin)) { fn(x, z); k++; } } };
  const A = [-140, 270, -90, 230];
  if (T.sea) {
    const seaM = GFX.waterMaterial(0x2a86cf, 40); tr.water = seaM; const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 260), seaM); sea.userData.flat = true; sea.rotation.x = -Math.PI / 2; sea.position.set(60, .01, -175); scene.add(sea); tr.sea = sea;
    const beach = new THREE.Mesh(new THREE.PlaneGeometry(900, 26), std({ color: 0xf3dfa6, roughness: 1 })); beach.receiveShadow = true; beach.userData.flat = true; beach.rotation.x = -Math.PI / 2; beach.position.set(60, .005, -38); scene.add(beach);
    // çay bahçesi sıraları
    const teaG = new THREE.SphereGeometry(1.6, 8, 6), teaM = std({ color: 0x2f8f3e });
    const tea = new THREE.InstancedMesh(teaG, teaM, 260); let ti = 0; const m4 = new THREE.Matrix4();
    place(260, 3, (x, z) => { if (z < 0) return; m4.makeScale(1.3, .8, 1).setPosition(Math.round(x / 4) * 4, .9, Math.round(z / 5) * 5); if (ti < 260) tea.setMatrixAt(ti++, m4); }, [-140, 270, 0, 230]);
    tea.count = ti; scene.add(tea);
    // evler
    const wallM = std({ color: 0xfff3e2 }), roofM = std({ color: 0xc8553d });
    place(14, 9, (x, z) => { if (z < -20) return; const h = new THREE.Group(); const w = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 6), wallM); w.position.y = 2.5; const r = new THREE.Mesh(new THREE.ConeGeometry(5, 3.4, 4), roofM); r.position.y = 6.7; r.rotation.y = Math.PI / 4; h.add(w, r); h.position.set(x, 0, z); h.rotation.y = rnd(0, 3); scene.add(h); }, A);
    // bordo-mavi bayraklar
    for (let i = 10; i < N; i += 40) { const sg = i % 80 ? 1 : -1; const p = tr.P[i].clone().addScaledVector(tr.Nm[i], sg * (ROAD_W / 2 + 7)); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 7), std({ color: 0xdddddd })); pole.position.copy(p).setY(3.5); const fl = new THREE.Group(); [0x8a1538, 0x5cb8f0].forEach((c, j) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), std({ color: c, side: THREE.DoubleSide })); f.position.set(.75 + j * 1.5, 0, 0); fl.add(f); }); fl.position.copy(p).setY(5.8); fl.userData.wave = Math.random() * 6; scene.add(pole, fl); (tr.flags = tr.flags || []).push(fl); }
    // martılar
    tr.birds = []; for (let i = 0; i < 6; i++) { const b = new THREE.Group(); const wM = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }); for (const sg of [1, -1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(2, .5), wM); w.position.x = sg * 1; b.add(w); } b.userData = { r: rnd(30, 120), a: rnd(0, 6), y: rnd(14, 24), c: new THREE.Vector3(rnd(0, 120), 0, rnd(-60, 0)) }; scene.add(b); tr.birds.push(b); }
  }
  if (T.castle) {
    // tepeler
    const hillM = std({ color: 0x6aa86c });
    [[-120, 160, 60], [240, -40, 70], [200, 190, 80], [-110, -60, 50], [60, 260, 90]].forEach(([x, z, r]) => { const h = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10), hillM); h.scale.y = .35; h.position.set(x, -r * .08, z); scene.add(h); });
    // göl
    const lochM = GFX.waterMaterial(0x4a96d0, 6); tr.water = lochM; const loch = new THREE.Mesh(new THREE.CircleGeometry(26, 48), lochM); loch.userData.flat = true; loch.rotation.x = -Math.PI / 2; loch.position.set(60, .03, 40); if (offRoad(tr.P, 60, 40, 26)) scene.add(loch);
    // şato
    const st = std({ color: 0xb9b2c4 }), top = std({ color: 0x7a6fa0 });
    const cs = new THREE.Group(); const keep = new THREE.Mesh(new THREE.BoxGeometry(22, 16, 16), st); keep.position.y = 8; cs.add(keep);
    [[-12, -9], [12, -9], [-12, 9], [12, 9]].forEach(([x, z]) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 24, 12), st); t.position.set(x, 12, z); const c = new THREE.Mesh(new THREE.ConeGeometry(4.4, 7, 12), top); c.position.set(x, 27.5, z); cs.add(t, c); });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.6), new THREE.MeshBasicMaterial({ map: (() => { const cv = document.createElement('canvas'); cv.width = 80; cv.height = 52; const g = cv.getContext('2d'); g.fillStyle = '#005eb8'; g.fillRect(0, 0, 80, 52); g.strokeStyle = '#fff'; g.lineWidth = 9; g.beginPath(); g.moveTo(0, 0); g.lineTo(80, 52); g.moveTo(80, 0); g.lineTo(0, 52); g.stroke(); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })(), side: THREE.DoubleSide }));
    flag.position.set(0, 20, 0); cs.add(flag);
    let cx = 50, cz = 55; for (const [x, z] of [[50, 55], [70, 20], [10, 60], [100, 40]]) if (offRoad(tr.P, x, z, 22)) { cx = x; cz = z; break; }
    cs.position.set(cx, 0, cz); scene.add(cs);
    // koyunlar
    const woolM = std({ color: 0xffffff }), faceM = std({ color: 0x3b3340 });
    tr.sheep = [];
    place(26, 6, (x, z) => { const s = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 8), woolM); b.scale.set(1.3, 1, 1); b.position.y = 1.5; const h = new THREE.Mesh(new THREE.SphereGeometry(.6, 8, 6), faceM); h.position.set(1.7, 1.8, 0); s.add(b, h); s.position.set(x, 0, z); s.rotation.y = rnd(0, 6); s.userData.ph = Math.random() * 6; scene.add(s); tr.sheep.push(s); }, A);
    // mor çiçekler (devedikeni)
    const flG = new THREE.SphereGeometry(.5, 6, 5), flM = std({ color: 0x9b5de5 }); const fls = new THREE.InstancedMesh(flG, flM, 200); let fi = 0; const m4 = new THREE.Matrix4();
    place(200, 2.5, (x, z) => { m4.makeTranslation(x, .5, z); fls.setMatrixAt(fi++, m4); }, A); fls.count = fi; scene.add(fls);
  }
  // ağaçlar
  const trunkM = std({ color: 0x8a5a33 }), leafM = std({ color: T.castle ? 0x3f8f4a : 0x2f9a4c });
  place(T.castle ? 40 : 30, 7, (x, z) => { if (T.sea && z < -26) return; const t = new THREE.Group(); const tk = new THREE.Mesh(new THREE.CylinderGeometry(.6, .8, 4), trunkM); tk.position.y = 2; const lf = new THREE.Mesh(T.castle ? new THREE.ConeGeometry(3.4, 9, 8) : new THREE.SphereGeometry(3.4, 8, 6), leafM); lf.position.y = T.castle ? 8 : 6; t.add(tk, lf); t.position.set(x, 0, z); scene.add(t); }, A);
  // bulutlar
  const cloudM = std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: .15, roughness: 1 }); tr.clouds = [];
  for (let i = 0; i < 10; i++) { const c = new THREE.Group(); for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(rnd(4, 8), 8, 6), cloudM); s.position.set(k * 6 - 9, rnd(-1, 2), rnd(-3, 3)); c.add(s); } c.position.set(rnd(-200, 320), rnd(50, 80), rnd(-150, 280)); scene.add(c); tr.clouds.push(c); }
}

/* ---------------- kartlar ve sürücüler ---------------- */
function kartMesh(color) {
  const g = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color, roughness: .32, metalness: .15, clearcoat: 1, clearcoatRoughness: .08 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .3, clearcoat: .8 });
  const chrome = std({ color: 0xdddddd, metalness: 1, roughness: .18 }), dark = std({ color: 0x24242c, roughness: .6 });
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; };
  add(new RoundedBoxGeometry(2.5, .7, 3.9, 4, .28), paint, 0, .78, 0);
  add(new RoundedBoxGeometry(2.1, .5, 1.3, 4, .22), white, 0, .72, 2.25);
  add(new RoundedBoxGeometry(2.7, .18, .7, 3, .08), paint, 0, .55, 2.75);                       // ön tampon
  add(new RoundedBoxGeometry(1.7, 1, .5, 3, .18), dark, 0, 1.5, -1.1);                          // koltuk
  const sp = add(new RoundedBoxGeometry(2.6, .12, .7, 2, .05), paint, 0, 1.9, -1.95);           // rüzgârlık
  for (const sx of [-1, 1]) add(new THREE.BoxGeometry(.12, .7, .3), dark, sx * 1, 1.5, -1.95);
  const sw = add(new THREE.TorusGeometry(.32, .06, 8, 20), dark, 0, 1.5, .55); sw.rotation.x = -.9;   // direksiyon
  g.userData.exhaust = [];
  for (const sx of [-1, 1]) {
    const ex = add(new THREE.CylinderGeometry(.13, .16, .7, 12), chrome, sx * .55, .75, -2.15); ex.rotation.x = Math.PI / 2; g.userData.exhaust.push(ex);
    const hl = add(new THREE.SphereGeometry(.16, 12, 8), new THREE.MeshStandardMaterial({ color: 0xfff6cf, emissive: 0xfff2b0, emissiveIntensity: 3 }), sx * .7, .85, 2.9); hl.scale.z = .5;
  }
  const wG = new THREE.CylinderGeometry(.55, .55, .5, 20), wM = std({ color: 0x1e1e24, roughness: .9 }), rimG = new THREE.CylinderGeometry(.3, .3, .52, 12);
  g.userData.wheels = [];
  [[-1.4, 1.3], [1.4, 1.3], [-1.4, -1.3], [1.4, -1.3]].forEach(([x, z]) => { const w = new THREE.Group(); const t = new THREE.Mesh(wG, wM); const r = new THREE.Mesh(rimG, chrome); w.add(t, r); w.rotation.z = Math.PI / 2; w.position.set(x, .55, z); g.add(w); g.userData.wheels.push(w); });
  const sh = new THREE.Mesh(new THREE.CircleGeometry(2.4, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .18 })); sh.rotation.x = -Math.PI / 2; sh.position.y = .03; g.add(sh);
  return g;
}
function animalDriver(kind) {
  const g = new THREE.Group();
  const col = kind === 'bear' ? 0x9a6a43 : 0xffffff, face = kind === 'bear' ? 0xd9b48a : 0x3b3340;
  const M = c => std({ color: c });
  const body = new THREE.Mesh(new THREE.SphereGeometry(.8, 12, 10), M(kind === 'bear' ? 0x8a1538 : 0x005eb8)); body.position.y = .2; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.8, 14, 12), M(col)); head.position.y = 1.4; g.add(head);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(.38, 10, 8), M(face)); snout.position.set(0, 1.25, .66); g.add(snout);
  for (const sg of [1, -1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 6), M(kind === 'bear' ? col : face)); ear.position.set(sg * .62, 2, 0); g.add(ear); const eye = new THREE.Mesh(new THREE.SphereGeometry(.09, 6, 5), M(0x111111)); eye.position.set(sg * .28, 1.55, .72); g.add(eye); }
  return g;
}
async function driver(kind) {
  if (FAMILY_DRIVERS.includes(kind)) {
    const gl = await loadGlb(kind);
    if (gl) { const m = gl.scene.clone(true); const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3()); const sc = (kind === 'baba' ? 3.1 : kind === 'anne' ? 3.0 : 2.6) / s.y; m.scale.setScalar(sc); m.position.set(-c.x * sc, -b.min.y * sc - 1.2, -c.z * sc); const g = new THREE.Group(); g.add(m); return g; }
    return animalDriver('bear');
  }
  return animalDriver(kind);
}

/* ---------------- ses ---------------- */
function engineSound() {
  const a = typeof ac === 'function' ? ac() : null; if (!a) return null;
  const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain();
  o.type = 'sawtooth'; o.frequency.value = 50; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
  o.connect(f); f.connect(g); g.connect(a.destination); o.start();
  return { set(sp) { g.gain.setTargetAtTime(isMuted() ? 0 : .018 + sp * .0007, a.currentTime, .1); o.frequency.setTargetAtTime(50 + sp * 4.2, a.currentTime, .08); }, stop() { try { g.gain.setTargetAtTime(0, a.currentTime, .05); o.stop(a.currentTime + .3); } catch (e) {} } };
}
const tone = (f, d, v) => { if (typeof AdvAudio !== 'undefined') AdvAudio.note(f, d, 'triangle', v || .06); };

/* ---------------- yarış ---------------- */
async function race(wrap, kid, tid, drv) {
  drv = drv || kid;
  stopRace();
  const T = TRACKS[tid], ela = kid === 'ela', LAPS = ela ? 2 : 3;
  const game = wrap.querySelector('.kt-game'), menu = wrap.querySelector('.kt-menu');
  menu.hidden = true; game.hidden = false;
  const holder = game.querySelector('.kt-canvas'); holder.innerHTML = '';
  const end = game.querySelector('.kt-end'); end.hidden = true;
  let renderer;
  const qSet = GFX.getQualitySetting(); let qName = GFX.resolveQuality(qSet); const tier = GFX.TIERS[qName];
  try { renderer = GFX.makeRenderer(holder, tier); } catch (e) { holder.innerHTML = '<p class="kt-err">Bu cihazda 3D çalışmıyor 😔</p>'; return; }
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(T.fog, 90, 420);
  const SK = GFX.makeSky(renderer, scene, T.castle ? { elevation: 30, turbidity: 4, azimuth: 200 } : { elevation: 42, azimuth: 140 });
  scene.add(new THREE.HemisphereLight(0xdfefff, 0x6f8a5a, .55));
  const sun = GFX.makeSun(scene, SK.sun, tier, { range: 70, intensity: 2.4 });
  const cam = new THREE.PerspectiveCamera(62, 1, .5, 5000);
  const tr = buildTrack(scene, T); scenery(scene, T, tr);
  // gölgeler: zemin dışındaki her şey gölge düşürür
  scene.traverse(o => { if (o.isMesh || o.isInstancedMesh) { if (o.userData.flat) o.receiveShadow = true; else o.castShadow = true; } });
  if (tier.grass) GFX.grassField(scene, Math.round(3000 * tier.grass), () => { const i = Math.floor(Math.random() * N), sg = Math.random() < .5 ? -1 : 1, d = ROAD_W / 2 + 6 + Math.random() * 30, p = tr.P[i].clone().addScaledVector(tr.Nm[i], sg * d); if (T.sea && p.z < -26) return null; if (!offRoad(tr.P, p.x, p.z, 5)) return null; return [p.x, p.z]; }, T.castle ? 0x5d9e5c : 0x4fae5a);
  let composer = GFX.makeComposer(renderer, scene, cam, tier, { strength: .35, threshold: 1.05 });
  const fx = GFX.particles(scene, 600);
  const guard = qSet === 'auto' && qName !== 'low' ? GFX.fpsGuard(() => { if (composer) { composer = null; } else if (renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; sun.castShadow = false; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); } renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.2)); }) : null;

  // yıldızlar
  const starG = new THREE.OctahedronGeometry(1.1, 0), starM = new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffb300, emissiveIntensity: 1.6, metalness: .3, roughness: .3 });
  const stars = [];
  for (let i = 25; i < N; i += 45) for (const off of [-4, 0, 4]) { if (Math.random() < .45) continue; const m = new THREE.Mesh(starG, starM); m.castShadow = true; m.position.copy(tr.P[i]).addScaledVector(tr.Nm[i], off).setY(1.6); scene.add(m); stars.push({ m, t: 0 }); }

  // yarışçılar
  const rivals = [...FAMILY_DRIVERS.filter(d => d !== drv), 'bear', 'sheep'].slice(0, 3);
  const colors = { lale: 0x9b6bff, ela: 0xff6fa8, anne: 0x7fa6e6, baba: 0x8a1538, bear: 0xb07a4a, sheep: 0x5cb8f0 };
  const racers = [];
  const make = async (kind, slot, isP) => {
    const g = kartMesh(colors[kind]); const d = await driver(kind); d.position.set(0, 1.4, -1); g.add(d); GFX.shadows(g, true, false);
    const i0 = (N - 8 - Math.floor(slot / 2) * 9) % N, off = (slot % 2 ? -1 : 1) * 3.6;
    const p = tr.P[i0].clone().addScaledVector(tr.Nm[i0], off);
    const r = { kind, g, isP, pos: p, head: Math.atan2(tr.D[i0].x, tr.D[i0].z), speed: 0, idx: i0, lap: 0, half: false, done: false, finishT: 0, boostT: 0, off: off * .6, skill: 1, stars: 0, drv: d };
    g.position.copy(p); g.rotation.y = r.head; scene.add(g); racers.push(r); return r;
  };
  const me = await make(drv, 0, true);
  for (let k = 0; k < rivals.length; k++) { const r = await make(rivals[k], k + 1, false); r.skill = (ela ? [.7, .62, .58] : [.9, .84, .8])[k]; }
  me.lap = 0; racers.forEach(r => r.lap = -1); // başlangıç çizgisinin arkasındalar

  const hud = { lap: game.querySelector('.kt-lap'), pos: game.querySelector('.kt-pos'), st: game.querySelector('.kt-stars'), mini: game.querySelector('.kt-mini').getContext('2d'), count: game.querySelector('.kt-count') };
  // mini harita sınırları
  let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9; tr.P.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); });
  const msc = 100 / Math.max(maxX - minX, maxZ - minZ), mx = x => 10 + (x - minX) * msc, mz = z => 10 + (z - minZ) * msc;

  // giriş
  const keys = {};
  const kd = e => { const m = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'gas', ArrowDown: 'brake', ' ': 'boost', a: 'l', d: 'r' }[e.key]; if (m) { keys[m] = true; e.preventDefault(); if (m === 'boost') useBoost(); } };
  const ku = e => { const m = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'gas', ArrowDown: 'brake', ' ': 'boost', a: 'l', d: 'r' }[e.key]; if (m) keys[m] = false; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  game.querySelectorAll('.kt-ctrl button').forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); keys[k] = true; if (k === 'boost') useBoost(); b.classList.add('on'); };
    const off = () => { keys[k] = false; b.classList.remove('on'); };
    b.onpointerdown = on; b.onpointerup = off; b.onpointerleave = off; b.onpointercancel = off;
  });
  // Ela: ekranın sol/sağ yarısına dokunarak da dönebilir
  holder.onpointerdown = e => { if (!ela) return; const r = holder.getBoundingClientRect(); keys[e.clientX < r.left + r.width / 2 ? 'l' : 'r'] = true; };
  holder.onpointerup = holder.onpointercancel = () => { if (ela) { keys.l = keys.r = false; } };
  function useBoost() { if (state !== 'race' || me.stars <= 0 || me.boostT > 0) return; me.stars--; me.boostT = 1.6; tone(660, .2); tone(990, .3, .05); }

  let state = 'count', t0 = performance.now(), raceT = 0, last = performance.now(), run = true;
  const eng = engineSound();
  if (typeof AdvAudio !== 'undefined') AdvAudio.startMusic(T.music);
  // geri sayım
  const cd = ['3', '2', '1', ela ? 'BAŞLA! 🚗' : 'BAŞLA!'];
  cd.forEach((c, i) => setTimeout(() => { if (!run) return; hud.count.textContent = c; hud.count.classList.remove('show'); void hud.count.offsetWidth; hud.count.classList.add('show'); tone(i < 3 ? 520 : 1040, .3, .08); if (i === 3) { state = 'race'; t0 = performance.now(); } }, 600 + i * 900));
  setTimeout(() => { if (run) hud.count.textContent = ''; }, 600 + 4 * 900 + 700);

  const tmp = new THREE.Vector3(), camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  function nearest(r) { let best = r.idx, bd = 1e9; for (let k = -25; k <= 25; k++) { const i = (r.idx + k + N) % N, d = (tr.P[i].x - r.pos.x) ** 2 + (tr.P[i].z - r.pos.z) ** 2; if (d < bd) { bd = d; best = i; } } return [best, Math.sqrt(bd)]; }
  const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
  function progress(r) { return (r.done ? 1e6 - r.finishT : 0) + r.lap * N + r.idx; }
  function finish() {
    state = 'end'; if (eng) eng.stop();
    const order = racers.slice().sort((a, b) => progress(b) - progress(a)), place = order.indexOf(me) + 1;
    const key = `kart_best_${kid}_${tid}`, best = store.get(key, null); const newBest = !best || me.finishT < best; if (newBest) store.set(key, me.finishT);
    const medal = ['🥇', '🥈', '🥉', '🎖️'][place - 1];
    end.innerHTML = `<div class="kt-endbox"><div class="kt-medal">${medal}</div><h3>${place === 1 ? `BİRİNCİ OLDUN ${NAMES[drv].toUpperCase()}!` : `${place}. oldun ${NAMES[drv]}! Harika yarıştın!`}</h3>
      <p>⏱️ ${fmt(me.finishT)} ${newBest ? '· 🌟 Yeni rekor!' : ''}</p>
      <ol class="kt-res">${order.map((r, i) => `<li class="${r === me ? 'me' : ''}">${['🥇', '🥈', '🥉', '4.'][i]} ${NAMES[r.kind]}</li>`).join('')}</ol>
      <div class="mrow"><button class="mbtn" style="--c:var(--green)" data-a="again">🔁 Tekrar</button><button class="mbtn" style="--c:var(--purple)" data-a="tracks">🗺️ Pist Seç</button></div></div>`;
    end.hidden = false;
    if (typeof confetti === 'function') confetti(); if (typeof sfx !== 'undefined') sfx.win();
    speak(place === 1 ? `Yaşasın! Birinci oldun ${NAMES[drv]}!` : `Aferin ${NAMES[drv]}! ${place}. oldun!`);
    end.querySelector('[data-a=again]').onclick = () => race(wrap, kid, tid, drv);
    end.querySelector('[data-a=tracks]').onclick = () => { stopRace(); showMenu(wrap); };
  }

  function step(t) {
    if (!run) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    const W = holder.clientWidth, H = holder.clientHeight;
    if (renderer.domElement.width !== Math.round(W * renderer.getPixelRatio())) { renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); }
    if (state === 'race') raceT = (t - t0) / 1000;
    for (const r of racers) {
      const [ni, dist] = nearest(r);
      // tur kontrolü
      if (ni < N * .1 && r.idx > N * .9) { if (r.half || r.lap < 0) { r.lap++; r.half = false; if (r.isP && r.lap > 0 && r.lap < LAPS) { speak(r.lap === LAPS - 1 ? 'Son tur!' : `Tur ${r.lap + 1}!`); tone(880, .3); } if (r.lap >= LAPS && !r.done) { r.done = true; r.finishT = state === 'race' ? raceT : 999; if (r.isP) finish(); } } }
      else if (ni > N * .9 && r.idx < N * .1) { /* geri gitti */ }
      if (ni > N * .45 && ni < N * .55) r.half = true;
      r.idx = ni;
      const onRoad = dist < ROAD_W / 2 + .5;
      let maxS = (ela ? 29 : 37) * (r.isP ? 1 : r.skill) * (onRoad ? 1 : .5);
      if (r.boostT > 0) { r.boostT -= dt; maxS *= 1.45; }
      let steer = 0, gas = 1;
      const look = tr.P[(ni + (r.isP ? 14 : 10)) % N].clone().addScaledVector(tr.Nm[(ni + 10) % N], r.isP ? 0 : r.off);
      const want = Math.atan2(look.x - r.pos.x, look.z - r.pos.z), diff = angDiff(want, r.head);
      if (r.isP) {
        steer = (keys.l ? 1 : 0) - (keys.r ? 1 : 0);
        const assist = ela ? .85 : .25;
        steer = steer * (1 - assist * .4) + Math.max(-1, Math.min(1, diff * 2.2)) * assist * (steer === 0 ? 1 : .35);
        if (keys.brake) gas = -.6;
      } else {
        steer = Math.max(-1, Math.min(1, diff * 2.4));
        // lastik bant: oyuncuya yakın kalsınlar
        const gap = progress(r) - progress(me);
        maxS *= gap > 60 ? .86 : gap < -80 ? 1.12 : 1;
        if (r.stars > 0 && Math.random() < .004) { r.stars--; r.boostT = 1.2; }
      }
      if (state !== 'race' || r.done) { gas = r.done ? .3 : 0; if (state === 'count') r.speed = 0; }
      const acc = gas > 0 ? 16 : 30;
      r.speed += (gas > 0 ? (maxS * gas - r.speed) / maxS * acc : gas * acc) * dt;
      if (r.speed > maxS) r.speed += (maxS - r.speed) * dt * 2.5;
      r.speed = Math.max(0, r.speed);
      r.head += steer * 1.9 * dt * Math.min(1, r.speed / 10 + .15) * (r.speed > 0.5 ? 1 : 0);
      r.pos.x += Math.sin(r.head) * r.speed * dt; r.pos.z += Math.cos(r.head) * r.speed * dt;
      // saman balyası sınırı
      const p = tr.P[r.idx], n = tr.Nm[r.idx], lat = (r.pos.x - p.x) * n.x + (r.pos.z - p.z) * n.z, lim = ROAD_W / 2 + 3.2;
      if (Math.abs(lat) > lim) { const sg = Math.sign(lat); r.pos.x -= n.x * (Math.abs(lat) - lim) * sg; r.pos.z -= n.z * (Math.abs(lat) - lim) * sg; r.speed *= .9; r.head += angDiff(Math.atan2(tr.D[r.idx].x, tr.D[r.idx].z), r.head) * .15; }
      // turbo pedi
      for (const b of tr.boosts) if (Math.hypot(b.pos.x - r.pos.x, b.pos.z - r.pos.z) < 3.4 && r.boostT <= .2) { r.boostT = 1.3; if (r.isP) { tone(700, .2); tone(1050, .25, .05); } }
      // yıldız toplama
      for (const s of stars) if (s.t <= 0 && Math.hypot(s.m.position.x - r.pos.x, s.m.position.z - r.pos.z) < 2.6) { s.t = 8; s.m.visible = false; r.stars = Math.min(r.isP ? 9 : 3, r.stars + 1); if (r.isP) { tone(1200, .15); tone(1600, .2, .04); if (ela) r.boostT = Math.max(r.boostT, .8); } for (let k = 0; k < 18 * tier.sparkle + 4; k++) fx.emit(s.m.position, new THREE.Vector3(0, 2, 0), 0xffe066, .7, 7); }
      r.g.position.copy(r.pos); r.g.rotation.y = r.head; r.g.rotation.z = -steer * .05 * Math.min(1, r.speed / 20);
      r.g.position.y = Math.abs(Math.sin(t / 90 + r.idx)) * .06 * Math.min(1, r.speed / 10);
      r.g.userData.wheels.forEach(w => w.rotation.x += r.speed * dt / .55);
      if (r.boostT > 0 && Math.random() < .9 * tier.sparkle + .2) for (const ex of r.g.userData.exhaust) { ex.getWorldPosition(tmp); fx.emit(tmp, new THREE.Vector3(-Math.sin(r.head) * 6, 1, -Math.cos(r.head) * 6), Math.random() < .5 ? 0xff7a00 : 0xffd23f, .35, 1.2); }
      if (!onRoad && r.speed > 6 && Math.random() < .5 * tier.sparkle) { tmp.copy(r.pos).setY(.4); fx.emit(tmp, new THREE.Vector3(0, 1.5, 0), 0x7a5a30, .6, 2); }
    }
    // çarpışma (yumuşak itme)
    for (let i = 0; i < racers.length; i++) for (let j = i + 1; j < racers.length; j++) { const a = racers[i], b = racers[j], dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d = Math.hypot(dx, dz); if (d < 3 && d > .01) { const push = (3 - d) / 2; a.pos.x -= dx / d * push; a.pos.z -= dz / d * push; b.pos.x += dx / d * push; b.pos.z += dz / d * push; } }
    // yıldızlar dönsün, geri gelsin
    for (const s of stars) { s.m.rotation.y += dt * 2; s.m.position.y = 1.6 + Math.sin(t / 300 + s.m.position.x) * .3; if (s.t > 0) { s.t -= dt; if (s.t <= 0) s.m.visible = true; } }
    if (tr.flags) tr.flags.forEach(f => f.rotation.y = Math.sin(t / 400 + f.userData.wave) * .3);
    if (tr.birds) tr.birds.forEach(b => { const u = b.userData; u.a += dt * .25; b.position.set(u.c.x + Math.cos(u.a) * u.r, u.y + Math.sin(t / 500) * 1.5, u.c.z + Math.sin(u.a) * u.r); b.rotation.y = -u.a; b.children.forEach((w, k) => w.rotation.z = (k ? -1 : 1) * Math.sin(t / 150) * .5); });
    if (tr.sheep) tr.sheep.forEach(s => s.position.y = Math.max(0, Math.sin(t / 400 + s.userData.ph)) * .3);
    if (tr.clouds) tr.clouds.forEach(c => { c.position.x += dt * 2; if (c.position.x > 340) c.position.x = -220; });
    // kamera
    const back = me.boostT > 0 ? 11 : 9.5;
    camPos.set(me.pos.x - Math.sin(me.head) * back, 5.2, me.pos.z - Math.cos(me.head) * back);
    cam.position.lerp(camPos, Math.min(1, dt * 5));
    camLook.set(me.pos.x + Math.sin(me.head) * 6, 1.6, me.pos.z + Math.cos(me.head) * 6);
    cam.lookAt(camLook);
    cam.fov += ((me.boostT > 0 ? 72 : 62) - cam.fov) * dt * 4; cam.updateProjectionMatrix();
    if (tr.water && tr.water.tick) tr.water.tick(t / 1000);
    sun.follow(me.pos); fx.update(dt);
    if (composer) { const W2 = holder.clientWidth, H2 = holder.clientHeight; if (composer._w !== W2 || composer._h !== H2) { composer.setSize(W2, H2); composer._w = W2; composer._h = H2; } composer.render(); } else renderer.render(scene, cam);
    if (guard) guard();
    // HUD
    const order = racers.slice().sort((a, b) => progress(b) - progress(a));
    hud.lap.textContent = `Tur ${Math.min(LAPS, Math.max(1, me.lap + 1))}/${LAPS}`;
    hud.pos.textContent = `${['🥇', '🥈', '🥉', '4.'][order.indexOf(me)]} ${order.indexOf(me) + 1}/4`;
    hud.st.textContent = `⭐ ${me.stars}`;
    const m = hud.mini; m.clearRect(0, 0, 120, 120); m.fillStyle = 'rgba(255,255,255,.55)'; m.beginPath(); m.roundRect(0, 0, 120, 120, 16); m.fill();
    m.strokeStyle = '#6b6f7a'; m.lineWidth = 5; m.beginPath(); tr.P.forEach((p, i) => i % 6 === 0 && (i ? m.lineTo(mx(p.x), mz(p.z)) : m.moveTo(mx(p.x), mz(p.z)))); m.closePath(); m.stroke();
    racers.forEach(r => { m.fillStyle = '#' + colors[r.kind].toString(16).padStart(6, '0'); m.beginPath(); m.arc(mx(r.pos.x), mz(r.pos.z), r.isP ? 6 : 4.5, 0, 7); m.fill(); if (r.isP) { m.strokeStyle = '#fff'; m.lineWidth = 2; m.stroke(); } });
    if (eng) eng.set(me.speed);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  R = { stop() { run = false; removeEventListener('keydown', kd); removeEventListener('keyup', ku); if (eng) eng.stop(); fx.dispose(); renderer.dispose(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); holder.innerHTML = ''; }, get me() { return me; }, get racers() { return racers; }, tr, get state() { return state; } };
  window.__kart = R;
}
function stopRace() { if (R) { R.stop(); R = null; } }
function showMenu(wrap) { wrap.querySelector('.kt-game').hidden = true; wrap.querySelector('.kt-menu').hidden = false; if (typeof AdvAudio !== 'undefined') AdvAudio.startMusic('map'); }

function open(host, kid) {
  stopRace();
  const wrap = ui(host, kid || 'lale');
  wrap.querySelector('[data-a=back]').onclick = () => { if (typeof sfx !== 'undefined') sfx.click(); history.back(); };
  const gb = wrap.querySelector('[data-a=gfx]'); const showQ = () => { gb.textContent = 'Grafik: ' + GFX.QUALITY_LABELS[GFX.getQualitySetting()]; }; showQ();
  gb.onclick = () => { GFX.setQualitySetting(GFX.nextQuality(GFX.getQualitySetting())); showQ(); if (typeof sfx !== 'undefined') sfx.click(); };
  wrap.querySelector('[data-a=quit]').onclick = () => { stopRace(); showMenu(wrap); };
  let drv = store.get('kart_driver_' + kid, kid || 'lale');
  const mark = () => wrap.querySelectorAll('.kt-drv').forEach(b => b.classList.toggle('sel', b.dataset.d === drv));
  wrap.querySelectorAll('.kt-drv').forEach(b => b.onclick = () => { drv = b.dataset.d; store.set('kart_driver_' + kid, drv); mark(); if (typeof sfx !== 'undefined') sfx.pop(); speak(NAMES[drv] + '!'); });
  mark();
  wrap.querySelectorAll('.kt-track').forEach(b => b.onclick = () => { if (typeof sfx !== 'undefined') sfx.ding(); race(wrap, kid || 'lale', b.dataset.t, drv); });
  FAMILY_DRIVERS.forEach(loadGlb);
  speak(kid === 'ela' ? 'Ela, hangi pistte yarışalım?' : 'Lale, pistini seç!');
}
function close() { stopRace(); if (typeof AdvAudio !== 'undefined') { AdvAudio.stopMusic(); } }

window.Kart = { open, close };
window.dispatchEvent(new Event('kart-ready'));
