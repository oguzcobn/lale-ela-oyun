// Lale & Ela mevcut sitesine zarar vermeden 3D Macera bağlantılarını ekler.
// Menü seçicileri farklıysa en azından görünür bir bağlantı sunar.
(function () {
  'use strict';
  function makeCard(kid) {
    const a = document.createElement('a');
    a.className = 'big world3d-launch-card';
    a.href = `3d-macera/?kid=${kid}`;
    a.style.cssText = 'text-decoration:none;color:inherit;cursor:pointer;--c:' + (kid==='lale' ? '#8d71ff' : '#ff7eaf');
    const emoji = document.createElement('span'); emoji.className = 'emo'; emoji.textContent = '🌈';
    const title = document.createElement('span'); title.className = 'lbl'; title.textContent = 'Büyülü 3D Dünya';
    const detail = document.createElement('small'); detail.textContent = '5 bölge • Keşfet • Görevleri tamamla';
    a.append(emoji,title,detail);
    return a;
  }
  function addKidCard(kid) {
    const section = document.querySelector(`#scr-${kid}`);
    const menu = section?.querySelector('.menu, .games, .game-grid, .menu-grid, .cards');
    const target = menu || section;
    if (!target || target.querySelector('.world3d-launch-card')) return false;
    const card = makeCard(kid);
    if (!menu) {
      card.style.cssText += ';display:block;max-width:320px;margin:16px auto;padding:18px 20px;text-align:center;background:linear-gradient(125deg,#e9dcff,#ffe2f0);border-radius:20px;box-shadow:0 10px 28px #674b8e33;';
      card.querySelector('.emo').style.fontSize='28px';
      card.querySelector('.lbl').style.cssText='display:block;font-weight:900;font-size:20px';
      card.querySelector('small').style.cssText='display:block;margin-top:5px';
    }
    target.prepend(card);
    return true;
  }
  function addFallback() {
    if (document.getElementById('lale-ela-3d-floating')) return;
    const a=document.createElement('a'); a.id='lale-ela-3d-floating';a.href='3d-macera/';
    a.textContent='🌈 3D Macera';
    a.style.cssText='position:fixed;bottom:16px;right:16px;z-index:9999;padding:13px 18px;border-radius:999px;background:#7155d7;color:white;font-weight:800;text-decoration:none;box-shadow:0 7px 22px #4b368b77';
    document.body.append(a);
  }
  function init() {
    const lale=addKidCard('lale'),ela=addKidCard('ela');
    if (!lale && !ela && !document.querySelector('.world3d-launch-card')) addFallback();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
