/* Lale & Ela — kız sayfalarındaki döndürülebilir 3D karakter (three.js, rig'siz .glb)
   Yüklenemezse sayfadaki fotoğraf/karakter görseli olduğu gibi kalır. */
import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

const cache = {};
function load(kid) {
  if (!cache[kid]) cache[kid] = new GLTFLoader().loadAsync(`assets/characters/${kid}.glb`);
  return cache[kid];
}

const views = new Map();
function mount(host, kid) {
  if (views.has(host)) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
  const v = { host, kid, run: true };
  views.set(host, v);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .05, 50);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0a8c8, 2.4));
  const d1 = new THREE.DirectionalLight(0xffffff, 2.1); d1.position.set(-2, 5, 6); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xffd6ec, 1); d2.position.set(3, 2, -3); scene.add(d2);
  const pivot = new THREE.Group(); scene.add(pivot);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.55, 32), new THREE.MeshBasicMaterial({ color: 0x3b2a5a, transparent: true, opacity: .14 }));
  shadow.rotation.x = -Math.PI / 2; scene.add(shadow);

  load(kid).then(g => {
    if (!v.run) return;
    const m = g.scene.clone(true);
    const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -box.min.y, -c.z); pivot.add(m);
    const h = size.y; cam.position.set(0, h * .55, h / 2 / Math.tan(15 * Math.PI / 180) * 1.05); cam.lookAt(0, h * .5, 0);
    host.appendChild(renderer.domElement);
    host.classList.add('has3d');
    frame();
  }).catch(() => { views.delete(host); });

  // döndürme ve dokununca zıplama
  let rotY = 0, vel = .6, drag = null, jumpT = -1, spinT = -1, last = performance.now();
  const cv = renderer.domElement;
  cv.style.touchAction = 'pan-y';
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, r: rotY, t: performance.now(), moved: false }; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
  cv.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 6) drag.moved = true; rotY = drag.r + dx * .012; vel = 0; });
  cv.addEventListener('pointerup', e => {
    if (!drag) return;
    if (!drag.moved) { if (jumpT < 0) { jumpT = 0; if (Math.random() < .5) spinT = 0; if (typeof sfx !== 'undefined') sfx.pop(); } }
    else vel = (e.clientX - drag.x) / Math.max(60, performance.now() - drag.t) * 2;
    drag = null;
  });

  function frame(t) {
    if (!v.run) return;
    t = t || performance.now();
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    const W = host.clientWidth, H = host.clientHeight;
    if (W && H) {
      if (cv.width !== Math.round(W * renderer.getPixelRatio()) || cv.height !== Math.round(H * renderer.getPixelRatio())) { renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); }
      if (!drag) { rotY += vel * dt; vel += (.35 * Math.sign(vel || 1) - vel) * dt * .8; }
      let y = Math.sin(t / 600) * .03, s = 1, spin = 0;
      if (jumpT >= 0) { jumpT += dt; const p = jumpT / .7; y += Math.sin(Math.min(1, p) * Math.PI) * .55; s = 1 + Math.sin(Math.min(1, p) * Math.PI) * .06; if (p >= 1) jumpT = -1; }
      if (spinT >= 0) { spinT += dt; spin = Math.min(1, spinT / .7) * Math.PI * 2; if (spinT >= .7) spinT = -1; }
      pivot.position.y = y; pivot.rotation.y = rotY + spin; pivot.scale.setScalar(s);
      shadow.scale.setScalar(1 - y * .6);
      renderer.render(scene, cam);
    }
    requestAnimationFrame(frame);
  }
}
function unmountAll() { views.forEach(v => { v.run = false; v.host.classList.remove('has3d'); const c = v.host.querySelector('canvas'); if (c) c.remove(); }); views.clear(); }

window.Char3D = { mount, unmountAll };
window.dispatchEvent(new Event('char3d-ready'));
