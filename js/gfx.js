/* =====================================================================
   Lale & Ela — ortak grafik motoru
   Gökyüzü + ortam ışığı, gerçek gölgeler, parlama (bloom), su ve çimen dokuları,
   kalite kademeleri (Otomatik / Yüksek / Orta / Düşük) ve otomatik FPS uyarlaması.
   ===================================================================== */
import * as THREE from 'three';
import { Sky } from './vendor/objects/Sky.js';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';

const KEY = 'gfx_quality';
export const QUALITY_LABELS = { auto: '✨ Otomatik', high: '💎 Yüksek', mid: '⚖️ Orta', low: '🔋 Düşük' };
export function getQualitySetting() { try { return localStorage.getItem(KEY) || 'auto'; } catch (e) { return 'auto'; } }
export function setQualitySetting(q) { try { localStorage.setItem(KEY, q); } catch (e) {} }
export function nextQuality(q) { const o = ['auto', 'high', 'mid', 'low']; return o[(o.indexOf(q) + 1) % o.length]; }
/* otomatikte en yüksekten başla; çok düşük güçlü cihazlarda ortadan */
export function resolveQuality(q) {
  if (q && q !== 'auto') return q;
  const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
  return (mem <= 2 || cores <= 2) ? 'mid' : 'high';
}
export const TIERS = {
  high: { pr: 2, shadows: true, shadowSize: 2048, bloom: true, aa: true, grass: 1, sparkle: 1 },
  mid: { pr: 1.35, shadows: true, shadowSize: 1024, bloom: false, aa: true, grass: .5, sparkle: .6 },
  low: { pr: 1, shadows: false, shadowSize: 0, bloom: false, aa: false, grass: 0, sparkle: .3 }
};

/* ---------- gökyüzü ve ortam ışığı ---------- */
export function makeSky(renderer, scene, o = {}) {
  const sky = new Sky(); sky.scale.setScalar(4000); scene.add(sky);
  const u = sky.material.uniforms;
  u.turbidity.value = o.turbidity ?? 3.2; u.rayleigh.value = o.rayleigh ?? 1.4;
  u.mieCoefficient.value = o.mie ?? .004; u.mieDirectionalG.value = .82;
  const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - (o.elevation ?? 38)), THREE.MathUtils.degToRad(o.azimuth ?? 150));
  u.sunPosition.value.copy(sun);
  // gökyüzünden ortam haritası: malzemeler gökyüzünü yansıtır
  let env = null;
  try {
    const pm = new THREE.PMREMGenerator(renderer);
    const s2 = new THREE.Scene(); const sk2 = new Sky(); sk2.scale.setScalar(4000); s2.add(sk2);
    Object.keys(u).forEach(k => { if (sk2.material.uniforms[k] && u[k].value !== undefined) { const v = u[k].value; sk2.material.uniforms[k].value = v.clone ? v.clone() : v; } });
    env = pm.fromScene(s2, .02).texture; scene.environment = env; scene.environmentIntensity = o.envIntensity ?? .45; pm.dispose();
  } catch (e) {}
  return { sky, sun, env };
}

/* ---------- güneş ışığı ve gölgeler ---------- */
export function makeSun(scene, sunDir, tier, o = {}) {
  const light = new THREE.DirectionalLight(o.color ?? 0xfff2dc, o.intensity ?? 2.6);
  light.position.copy(sunDir).multiplyScalar(80);
  scene.add(light); scene.add(light.target);
  if (tier.shadows) {
    light.castShadow = true;
    light.shadow.mapSize.set(tier.shadowSize, tier.shadowSize);
    const r = o.range ?? 60, c = light.shadow.camera;
    c.left = -r; c.right = r; c.top = r; c.bottom = -r; c.near = 1; c.far = 260;
    light.shadow.bias = -.0004; light.shadow.normalBias = .04; light.shadow.radius = 3;
  }
  // gölge kutusu oyuncuyu takip etsin
  light.follow = (p) => { light.target.position.copy(p); light.position.copy(p).addScaledVector(sunDir, 90); };
  return light;
}

export function makeRenderer(holder, tier) {
  const r = new THREE.WebGLRenderer({ antialias: tier.aa, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, tier.pr));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = .82;
  if (tier.shadows) { r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; }
  holder.appendChild(r.domElement);
  return r;
}

/* ---------- parlama (bloom) ---------- */
export function makeComposer(renderer, scene, camera, tier, o = {}) {
  if (!tier.bloom) return null;
  try {
    const c = new EffectComposer(renderer);
    c.addPass(new RenderPass(scene, camera));
    const b = new UnrealBloomPass(new THREE.Vector2(256, 256), o.strength ?? .32, o.radius ?? .4, o.threshold ?? 1.05);
    c.addPass(b); c.addPass(new OutputPass());
    c.bloom = b; return c;
  } catch (e) { return null; }
}

/* ---------- işaretle: gölge düşür / al ---------- */
export function shadows(root, cast = true, receive = false) { root.traverse(o => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } }); }

/* ---------- yordamsal dokular ---------- */
function noiseCanvas(size, base, spots, fn) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const g = cv.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  for (let i = 0; i < spots; i++) fn(g, size);
  return cv;
}
export function grassTexture(base = '#6cc276', repeat = 60) {
  const cv = noiseCanvas(256, base, 2600, (g, s) => {
    const l = Math.random(); g.fillStyle = l < .5 ? `rgba(30,90,40,${Math.random() * .22})` : `rgba(220,255,180,${Math.random() * .16})`;
    const x = Math.random() * s, y = Math.random() * s; g.fillRect(x, y, 1 + Math.random() * 2, 3 + Math.random() * 6);
  });
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
/* deniz/göl için dalga normal haritası (yükseklik alanından türetilir) */
export function waterNormals(size = 256) {
  const h = new Float32Array(size * size);
  const waves = Array.from({ length: 9 }, () => ({ kx: (Math.random() * 2 - 1) * 6, ky: (Math.random() * 2 - 1) * 6, a: Math.random() * .6 + .2, p: Math.random() * 6.28 }));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { let v = 0; for (const w of waves) v += Math.sin((x * Math.round(w.kx) + y * Math.round(w.ky)) / size * Math.PI * 2 + w.p) * w.a; h[y * size + x] = v; }
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const g = cv.getContext('2d'); const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = h[y * size + (x + 1) % size] - h[y * size + (x - 1 + size) % size], dy = h[((y + 1) % size) * size + x] - h[((y - 1 + size) % size) * size + x];
    const n = new THREE.Vector3(-dx, -dy, 2.2).normalize(), i = (y * size + x) * 4;
    img.data[i] = (n.x * .5 + .5) * 255; img.data[i + 1] = (n.y * .5 + .5) * 255; img.data[i + 2] = (n.z * .5 + .5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
export function waterMaterial(color = 0x2f8fd6, repeat = 18) {
  const n = waterNormals(); n.repeat.set(repeat, repeat);
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: .08, metalness: 0, normalMap: n, normalScale: new THREE.Vector2(.55, .55), clearcoat: 1, clearcoatRoughness: .1, transparent: true, opacity: .92 });
  m.tick = (t) => { n.offset.set(t * .012, t * .008); };
  return m;
}

/* ---------- çimen tutamları (instancing) ---------- */
export function grassField(scene, count, placeFn, color = 0x4fae5a) {
  if (count <= 0) return null;
  const geo = new THREE.ConeGeometry(.07, .42, 4); geo.translate(0, .21, 0);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: .9 });
  const im = new THREE.InstancedMesh(geo, mat, count); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  let n = 0, tries = 0;
  while (n < count && tries++ < count * 4) { const pt = placeFn(); if (!pt) continue; p.set(pt[0], 0, pt[1]); q.setFromEuler(new THREE.Euler((Math.random() - .5) * .3, Math.random() * 6.28, (Math.random() - .5) * .3)); const k = .5 + Math.random() * .7; s.set(k, k * (.8 + Math.random() * .6), k); m4.compose(p, q, s); im.setMatrixAt(n, m4); c.setHSL(.27 + Math.random() * .06, .45, .45 + Math.random() * .12); im.setColorAt(n, c); n++; }
  im.count = n; im.receiveShadow = true; scene.add(im); return im;
}

/* ---------- parçacıklar: kıvılcım, alev, toz ---------- */
export function particles(scene, max = 400) {
  const pos = new Float32Array(max * 3), col = new Float32Array(max * 3), vel = new Float32Array(max * 3), life = new Float32Array(max), size = new Float32Array(max);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const sp = document.createElement('canvas'); sp.width = sp.height = 64; const g = sp.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const mat = new THREE.PointsMaterial({ size: .9, map: new THREE.CanvasTexture(sp), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
  let head = 0; life.fill(0); pos.fill(0);
  const tmpC = new THREE.Color();
  return {
    emit(p, v, color, l = .6, spread = 1) {
      const i = head; head = (head + 1) % max;
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      vel[i * 3] = v.x + (Math.random() - .5) * spread; vel[i * 3 + 1] = v.y + Math.random() * spread; vel[i * 3 + 2] = v.z + (Math.random() - .5) * spread;
      tmpC.set(color); col[i * 3] = tmpC.r; col[i * 3 + 1] = tmpC.g; col[i * 3 + 2] = tmpC.b; life[i] = l; size[i] = l;
    },
    update(dt) {
      for (let i = 0; i < max; i++) {
        if (life[i] <= 0) { pos[i * 3 + 1] = -999; continue; }
        life[i] -= dt; const f = Math.max(0, life[i] / size[i]);
        pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt; vel[i * 3 + 1] -= 3 * dt;
        col[i * 3] *= .985 + f * .015; col[i * 3 + 1] *= .97 + f * .03; col[i * 3 + 2] *= .96 + f * .04;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    },
    dispose() { scene.remove(pts); geo.dispose(); mat.dispose(); }
  };
}

/* ---------- FPS izleyici: yetişemezse kaliteyi bir kademe düşür ---------- */
export function fpsGuard(onDrop) {
  let frames = 0, t0 = performance.now(), low = 0, done = false;
  return function tick() {
    if (done) return; frames++;
    const t = performance.now(); if (t - t0 < 2000) return;
    const fps = frames * 1000 / (t - t0); frames = 0; t0 = t;
    if (fps < 34) { if (++low >= 2) { done = true; onDrop(fps); } } else low = 0;
  };
}
