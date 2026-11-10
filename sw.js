const CACHE='lale-ela-v3';
const FILES=['./','index.html','manifest.webmanifest','css/adventure.css',
 'js/family-config.js','js/adventure-progress.js','js/adventure-audio.js','js/adventure.js','js/adventure-lale.js','js/adventure-ela.js','js/char3d.js','js/kart.js','css/kart.css',
 'js/vendor/three.module.min.js','js/vendor/loaders/GLTFLoader.js','js/vendor/utils/BufferGeometryUtils.js',
 'img/lale-ela.jpg','img/lale.jpg','img/ela.jpg','img/apple-touch-icon.png','img/icon-192.png','img/icon-512.png',
 'assets/family/anne.webp','assets/family/baba.webp','assets/family/anne-baba.webp','assets/family/lale.webp','assets/family/ela.webp','assets/family/lale-ela.webp',
 'assets/characters/lale.png','assets/characters/ela.png','assets/characters/lale-side.png','assets/characters/ela-side.png','assets/characters/lale.glb','assets/characters/ela.glb','assets/characters/baba.glb','assets/characters/baba.png','assets/characters/baba-side.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
// önce internetten en yeni sürüm, internet yoksa kayıtlı kopya
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))))});
