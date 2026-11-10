import * as THREE from 'three';

// Lale & Ela: Büyülü 3D Dünya — statik hosting, veritabanı/hesap gerektirmez.
// Hareket ve görevler 4 ve 8 yaş için ayrı uyarlanır. Harici ses ya da kişisel veri gönderilmez.
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = THREE.MathUtils.lerp;
const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const zoneData = [
  { name: "Trabzon'un Yaylaları", emoji:'🏔️', x:-22,z:15, color:0x91da8e, icon:'🌸', title:'Dede ve Babaanne', intro:'Trabzon’a hoş geldin! Dedenle babaannen seni bekliyor. Yayladaki sihirli çiçekleri bul.', collect:'🌸 Çiçekleri bul ve topla', done:'Trabzon’daki deden ve babaannen seninle gurur duyuyor! İlk sevgi ışığı yandı.', npc:'Dede & Babaanne', marker:'💌'},
  { name:'Bordo-Mavi Stadyum', emoji:'⚽', x:22,z:15, color:0x9fd8db,icon:'⚽',title:'Trabzonspor Görevi',intro:'Bordo-mavi tribünlere geldin! Trabzonspor için üç özel top bulalım.',collect:'⚽ Bordo-mavi topları topla',done:'Gol! Trabzonspor’un coşkusu ikinci sevgi ışığını yaktı.',npc:'Takım Maskotu',marker:'🏆'},
  { name:'Müzik ve Işık Festivali', emoji:'🎤',x:22,z:-26,color:0xfbd4eb,icon:'🎵',title:'Sihirli Konser',intro:'Müzik sahnesi ışıl ışıl! Manifest hayranı iki kardeş için üç müzik notası saklandı. Şarkılarımız kendi küçük melodilerimiz!',collect:'🎵 Müzik notalarını topla',done:'Muhteşem sahne! Üçüncü sevgi ışığı parlıyor.',npc:'Müzik Perisi',marker:'🎤'},
  { name:'İskoçya Şatosu',emoji:'🏰',x:-22,z:-26,color:0xb5cced,icon:'💜',title:'Anneanneden Mektup',intro:'İskoçya’ya hoş geldin! Anneannen şatonun çevresine kalpler sakladı. Onları bulup mektubunu aç.',collect:'💜 İskoçya kalplerini topla',done:'Anneannen İskoçya’dan kucak dolusu sevgiler gönderiyor! Dördüncü sevgi ışığı yandı.',npc:'Anneanne',marker:'💌'},
  { name:'Aile Kalesi',emoji:'💖',x:0,z:-53,color:0xffe8ad,icon:'💛',title:'Nicole ve Oğuzhan',intro:'Son durak: Aile Kalesi! Anne Nicole ve Baba Oğuzhan kapıda seni bekliyor. Üç sevgi ışığını bul ve kapıyı aç.',collect:'💛 Sevgi ışıklarını bul',done:'Başardın! Nicole ve Oğuzhan’a ulaştın. Ailen seni çok seviyor!',npc:'Anne & Baba',marker:'👨‍👩‍👧‍👧'}
];
const questions = {
  lale:[
    {q:'Deden soruyor: 7 + 5 kaç eder?',a:['10','12','14','9'],ok:1,tip:'7’den sonra 5 say: 8, 9, 10, 11, 12.'},
    {q:'Trabzonspor’un renkleri hangileridir?',a:['Yeşil – Sarı','Bordo – Mavi','Siyah – Beyaz','Mor – Pembe'],ok:1,tip:'Formadaki bordo-mavi renklere bak.'},
    {q:'Ritim sorusu! 🎵 🎶 🎵 🎶 🎵 Sonraki hangisi?',a:['🎶','🎵','🎸','🌸'],ok:0,tip:'İki farklı nota sırayla geliyor.'},
    {q:'İskoçya’nın başkenti hangisidir?',a:['Antalya','Trabzon','Edinburgh','Berlin'],ok:2,tip:'Anneannenin ülkesindeki şatolarıyla tanınan şehir.'},
    {q:'Sevgi Pusulası için toplam kaç ışık gerekiyor?',a:['3','4','5','8'],ok:2,tip:'Ekranın sağ üstündeki toplam ışık sayısını düşün.'}
  ],
  ela:[
    {q:'Kırmızı çiçek hangisi?',a:['🌹','🌻','💙','🍋'],ok:0,tip:'Kırmızı güle dokun.'},
    {q:'Top hangisi? ⚽',a:['🍎','⚽','🌈','⭐'],ok:1,tip:'Futbol topuna dokun.'},
    {q:'Müzik yapan hangisi?',a:['🐱','🌸','🎵','🏰'],ok:2,tip:'Müzik notasını seç.'},
    {q:'Kalp hangisi?',a:['🌙','💜','☀️','🐻'],ok:1,tip:'Mor kalbe dokun.'},
    {q:'Anne ve babana kocaman sevgi gönder! ❤️ Hangisi kalp?',a:['🚗','🍓','❤️','🎈'],ok:2,tip:'Kırmızı kalbi seç.'}
  ]
};
const SAVE_PREFIX='lale-ela-3d-v1-';
const defaultSave=()=>({level:0, collected:{}, completed:false});
function loadSave(k){try{const d=JSON.parse(localStorage.getItem(SAVE_PREFIX+k));if(!d||typeof d!=='object')return defaultSave();return {level:clamp(Number(d.level)||0,0,4),collected:d.collected&&typeof d.collected==='object'?d.collected:{},completed:!!d.completed};}catch{return defaultSave();}}
function save(){if(!kid)return;try{localStorage.setItem(SAVE_PREFIX+kid,JSON.stringify(progress));}catch{}}
let kid=null,progress=defaultSave(),dialogShown=false,paused=false,challengeMode=false,soundOn=true;
let scene,camera,renderer,player,playerBody,avatar=null,avatarMixer=null,lastTime=0,elapsed=0;
let controls={keys:new Set(),joyX:0,joyY:0,jump:false,angle:0,zoom:11,dragging:false,lastX:0,lastY:0}, velocityY=0,actionTarget=null;
let collectibleSets=[],beacon=null,guideBeam=null, worldNodes=[],npcNodes=[],hotMeshes=[],clouds=[];
let minimap=$('minimap').getContext('2d');
const playerPos=V3(zoneData[0].x,0,zoneData[0].z+8), camPoint=V3(0,2,0);
const colors={bordo:0x801c45,mavi:0x6bd4f5,pink:0xff83b2,purple:0xa386ff};
const material=(c,more={})=>new THREE.MeshStandardMaterial({color:c,roughness:.86,metalness:0,...more});
const mat={grass:material(0x7bc97f),dirt:material(0xffd8a5),white:material(0xffffff),wood:material(0xac724f),gold:material(0xffce68,{emissive:0x4a2400,emissiveIntensity:.1}),tree:material(0x409f6d),dark:material(0x374d5e),pink:material(colors.pink),blue:material(colors.mavi),purple:material(colors.purple),bordo:material(colors.bordo)};
function mesh(geo,m,parent=scene,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=false;o.receiveShadow=false;parent.add(o);return o;}
function box(w,h,d,m,parent=scene,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),m,parent,x,y,z);}
function ball(r,m,parent=scene,x=0,y=0,z=0,seg=12){return mesh(new THREE.SphereGeometry(r,seg,10),m,parent,x,y,z);}
function cone(rad,h,m,parent=scene,x=0,y=0,z=0,n=7){return mesh(new THREE.ConeGeometry(rad,h,n),m,parent,x,y,z);}
function cylinder(r,rb,h,m,parent=scene,x=0,y=0,z=0,seg=12){return mesh(new THREE.CylinderGeometry(r,rb,h,seg),m,parent,x,y,z);}
function group(x=0,y=0,z=0,parent=scene){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
function torus(r,t,m,parent=scene,x=0,y=0,z=0){return mesh(new THREE.TorusGeometry(r,t,8,24),m,parent,x,y,z);}
function path(a,b,width=5){const mid=V3((a.x+b.x)/2,.035,(a.z+b.z)/2),len=Math.hypot(a.x-b.x,a.z-b.z),p=box(width,.08,len,mat.dirt,scene,mid.x,mid.y,mid.z);p.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);return p;}
function tree(x,z,scale=1,variant=0){const g=group(x,0,z);cylinder(.26*scale,.36*scale,2.2*scale,mat.wood,g,0,1.1*scale,0);if(variant===0){ball(1.35*scale,mat.tree,g,0,3*scale,0);ball(.87*scale,material(0x62bf71),g,.7*scale,3.3*scale,.15*scale);}else{cone(1.7*scale,3.1*scale,material(0x529f8d),g,0,3*scale,0);cone(1.2*scale,2.3*scale,material(0x62bdad),g,0,4.1*scale,0);}return g;}
function flower(x,z,color=0xf887b5){const g=group(x,0,z);cylinder(.04,.05,.4,material(0x379964),g,0,.28,0,7);for(let a=0;a<5;a++){const t=a*Math.PI*2/5;ball(.13,material(color),g,Math.sin(t)*.16,.55,Math.cos(t)*.16,8);}ball(.12,material(0xffdc66),g,0,.56,0,8);return g;}
function cloud(x,y,z,s=1){const g=group(x,y,z);let m=new THREE.MeshBasicMaterial({color:0xffffff});for(let i=0;i<4;i++)ball((i%2?.85:1.12)*s,m,g,(i-1.5)*.85*s,rand(-.15,.15)*s,0,10);clouds.push({g,offset:rand(0,10),speed:rand(.13,.32)});}
function banner(txt,x,y,z,w=8,bg='#ffffff',fg='#563e82'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const c=canvas.getContext('2d');c.fillStyle=bg;c.beginPath();c.roundRect(4,4,504,120,22);c.fill();c.strokeStyle='#f0e2ff';c.lineWidth=8;c.stroke();
  c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';c.font='bold 39px Trebuchet MS, sans-serif';c.fillText(txt,256,65,490);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const plane=mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide}),scene,x,y,z);plane.rotation.y=Math.PI/8;
  return plane;
}
function cottage(x,z,wall=0xffe7c7){const g=group(x,0,z);box(4,3.4,3.5,material(wall),g,0,1.7,0);const roof=cone(3.4,2.5,material(0xd06b7e),g,0,4.6,0,4);roof.rotation.y=Math.PI/4;box(1.15,2.1,.12,material(0x9b7257),g,0,1.05,1.81);for(const dx of [-1.3,1.3])box(.65,.7,.12,material(0x9be4f7),g,dx,2.5,1.82);return g;}
function stadium(x,z){const g=group(x,0,z);const floor=box(13,.28,11,material(0x66ba84),g,0,.25,0);for(let i=0;i<7;i++)box(.11,.12,11,material(0xf5fff3),g,-6+i*2,.48,0);
  for(const dir of [-1,1]){box(1.5,2.8,12,material(dir===1?0x842247:0x85d8f2),g,dir*7.4,1.35,0);for(let n=-4;n<=4;n+=2)box(.9,.6,1.6,material(0xf0e5ee),g,dir*7.4,2.7,n);}for(const zz of [-5.1,5.1]){box(4,.15,.15,mat.white,g,0,1.1,zz);box(.15,2,.15,mat.white,g,-2,1.3,zz);box(.15,2,.15,mat.white,g,2,1.3,zz);}banner('BORDO 💙 MAVİ',x,6,z-3,9,'#f4eaff','#762348');}
function musicStage(x,z){const g=group(x,0,z);box(13,1.2,7,material(0x7654b3),g,0,.6,0);box(13,.3,7,material(0xff99c5),g,0,1.3,0);for(let i=-2;i<=2;i++){const tower=box(.5,6,.5,material(0x643a96),g,i*2.8,3.8,-3.5);ball(.6,material([0xfaf184,0x85a7ff,0xf386cb][(i+5)%3],{emissive:0x552244,emissiveIntensity:.4}),g,i*2.8,6.3,-3.5);}banner('MÜZİK FESTİVALİ',x,8,z,9,'#fef3fc','#9a528c');}
function scotlandCastle(x,z,final=false){const g=group(x,0,z);const c=material(final?0xffc5e3:0xb9abc9),roof=material(final?0xee80a8:0x677dab),door=material(final?0xf8a866:0x796f9a);box(8,7,5,c,g,0,3.5,0);for(const xx of [-4.7,4.7]){cylinder(1.65,1.65,9,c,g,xx,4.5,0,8);cone(2.15,3.2,roof,g,xx,10.2,0,8);}box(2.2,3.4,.17,door,g,0,1.7,2.57);for(let y=4;y<7;y+=2)for(let x=-2;x<=2;x+=4)box(.7,1.2,.12,material(0xffe3a4),g,x,y,2.6);if(final){const t=ball(1.3,material(0xff7fa2,{emissive:0xcc3366,emissiveIntensity:.35}),g,0,9.5,0);t.scale.set(1.1,.92,.5);}return g;}
function rainbow(x,z){const g=group(x,0,z);for(let i=0;i<5;i++){const arc=torus(5.2-i*.45,.28,material([0xff779c,0xffae68,0xffdf73,0x80d2ac,0x9990ff][i]),g,0,4,0);arc.rotation.z=0;/* alt yarısı toprağın altında */}for(const p of [-5,5])ball(1.2,material(0xffffff),g,p,.7,0);}
function npc(label,emoji,x,z,color=0xe29fcf){const g=group(x,0,z);const dress=material(color);cylinder(.65,.85,1.5,dress,g,0,1.15,0,10);ball(.62,material(0xffd0b2),g,0,2.35,0);ball(.7,material(0x604c65),g,0,2.83,-.12);ball(.12,mat.dark,g,-.23,2.42,.52);ball(.12,mat.dark,g,.23,2.42,.52);ball(.09,mat.pink,g,0,2.18,.61);for(const side of [-1,1]){const arm=ball(.21,dress,g,side*.8,1.6,0);arm.scale.y=2.0;}const sign=banner(label,x,4.65,z,5.0,'#ffffff','#63487a');sign.lookAt(0,4.5,30);const data={g,sign,emoji,label,pos:V3(x,0,z)};npcNodes.push(data);return data;}
function specialToken(i,x,z,n){const g=group(x,0,z),c=[0xff88b4,0x7c2d55,0xffd06c,0xaa83e8,0xffd46c][i];let core;
  if(i===0){core=flower(0,0,c);g.add(core);core.position.y=.3;core.scale.setScalar(2);}
  else if(i===1){core=ball(.62,material(0xffffff),g,0,1,0);for(let k=0;k<6;k++){const a=k*Math.PI/3;ball(.24,material(k%2?colors.bordo:colors.mavi),g,Math.sin(a)*.48,1+Math.cos(a)*.4,.23,8);}}
  else if(i===2){core=torus(.46,.2,material(0xfdd65d,{emissive:0x9d6d15,emissiveIntensity:.45}),g,0,1,0);const stem=box(.2,.9,.15,mat.gold,g,.43,1.45,0);ball(.26,mat.gold,g,.4,1.9,0);}
  else if(i===3){const sh=ball(.72,material(0xb297f7,{emissive:0x46237a,emissiveIntensity:.25}),g,0,1,0);sh.scale.set(1.0,.88,.65);const sw=ball(.6,material(0xdfb0fd),g,0,1.2,.15);sw.scale.set(1.0,.5,.5);}
  else{const sh=ball(.64,material(0xffca75,{emissive:0xff8739,emissiveIntensity:.5}),g,0,1,0);sh.scale.set(.9,1.1,.7);torus(.92,.11,mat.gold,g,0,1,0);}
  const ring=torus(.92,.07,material(0xffffff,{emissive:0xffffff,emissiveIntensity:.5}),g,0,1.04,0);ring.rotation.x=Math.PI/2;
  const item={g,baseY:0,zone:i,index:n,pos:V3(x,0,z),taken:false,ring};hotMeshes.push(item);return item;
}
function decorations(){
  scene.background=new THREE.Color(0xccecff);scene.fog=new THREE.Fog(0xccecff,50,128);
  scene.add(new THREE.HemisphereLight(0xeaf8ff,0x84b980,2.2));const sun=new THREE.DirectionalLight(0xfff7d4,2.8);sun.position.set(-32,52,38);scene.add(sun);
  mesh(new THREE.PlaneGeometry(210,210),material(0x8fd69b),scene,0,-.1,0).rotation.x=-Math.PI/2;
  const lake=mesh(new THREE.CircleGeometry(18,48),material(0x8bd9ed,{transparent:true,opacity:.85}),scene,-50,-.065,-3);lake.rotation.x=-Math.PI/2;lake.scale.set(1.4,1,1);
  zoneData.forEach((z,i)=>{const grass=mesh(new THREE.CircleGeometry(i===4?18:17,48),material(z.color,{transparent:true,opacity:.96}),scene,z.x,-.035,z.z);grass.rotation.x=-Math.PI/2;const border=torus(i===4?18:17,.22,material(0xfff4e4),scene,z.x,.06,z.z);border.rotation.x=Math.PI/2;});
  path(zoneData[0],zoneData[1],4.6);path(zoneData[1],zoneData[2],4.6);path(zoneData[2],zoneData[3],4.6);path(zoneData[3],zoneData[4],4.6);path(zoneData[0],zoneData[3],2.7);
  banner('TRABZON YAYLASI',-22,7,9,8,'#fff5dd','#56815a');cottage(-28,8);cottage(-14,10,0xffcbd1);rainbow(-22,24);
  for(let i=0;i<9;i++)flower(-29+rand(0,16),4+rand(0,17),[0xf592b9,0xf7dc80,0xb79af4][i%3]);
  stadium(22,14);musicStage(22,-26);scotlandCastle(-22,-26);scotlandCastle(0,-53,true);banner('AİLE KALESİ ❤',0,13,-54,8,'#fff5ea','#ab568a');
  for(let i=0;i<64;i++){const x=rand(-57,57),z=rand(-68,36);let near=false;for(const zz of zoneData){if(Math.hypot(x-zz.x,z-zz.z)<(i%4===0?10:14))near=true;}if(near)continue;tree(x,z,rand(.6,1.35),i%3===0?1:0);}
  for(let i=0;i<25;i++){const x=rand(-54,54),z=rand(-65,33);if(zoneData.every(s=>Math.hypot(x-s.x,z-s.z)>10))flower(x,z,[0xe88bbf,0xf3dc74,0xa3a4ef][i%3]);}
  // Trabzon yaylasını çevreleyen karlı dağ silueti.
  for(let i=0;i<12;i++){const x=-90+i*16,z=51+Math.sin(i)*5,h=rand(13,29);const rock=cone(rand(10,16),h,material(i%2?0x90abaf:0x83a4a8),scene,x,h/2-.2,z,5);const snow=cone(6,h*.23,material(0xf9ffff),scene,x,h*.89,z,5);}
  for(let i=0;i<14;i++)cloud(rand(-65,65),rand(13,23),rand(-65,35),rand(.8,2));
  npc('DEDE & BABAANNE','💌',-22,19,0xff9d90);
  npc('TRABZONSPOR','🏆',22,25,0x85254c);
  npc('MÜZİK PERİSİ','🎤',22,-19,0xa575e5);
  npc('ANNEANNE','💌',-22,-18,0x779bdb);
  npc('NICOLE & OĞUZHAN','💖',0,-45,0xff8eb2);
  import('../js/vendor/loaders/GLTFLoader.js').then(({GLTFLoader})=>new GLTFLoader().loadAsync('../assets/characters/baba.glb')).then(g=>{const o=g.scene;const b=new THREE.Box3().setFromObject(o),sz=b.getSize(new THREE.Vector3());o.scale.multiplyScalar(3.4/sz.y);o.updateMatrixWorld(true);const nb=new THREE.Box3().setFromObject(o),c=nb.getCenter(new THREE.Vector3());o.position.set(1.9-c.x,-nb.min.y,-45-c.z);scene.add(o);npcNodes[4].g.position.x=-1.6;}).catch(()=>{});
  import('../js/vendor/loaders/GLTFLoader.js').then(({GLTFLoader})=>new GLTFLoader().loadAsync('../assets/characters/anne.glb')).then(g=>{const o=g.scene;const b=new THREE.Box3().setFromObject(o),sz=b.getSize(new THREE.Vector3());o.scale.multiplyScalar(3.3/sz.y);o.updateMatrixWorld(true);const nb=new THREE.Box3().setFromObject(o),c=nb.getCenter(new THREE.Vector3());o.position.set(-1.6-c.x,-nb.min.y,-45-c.z);scene.add(o);npcNodes[4].g.visible=false;}).catch(()=>{});
  const tokenOffsets=[[-7,0],[-2,-6],[6,2]];
  zoneData.forEach((z,i)=>{const items=[];tokenOffsets.forEach(([dx,dz],n)=>items.push(specialToken(i,z.x+dx,z.z+dz,n)));collectibleSets.push(items);});
  beacon=group(0,0,0);const arrow=cone(.44,1.15,material(0xffc45a,{emissive:0xb77012,emissiveIntensity:.45}),beacon,0,5,0);arrow.rotation.x=Math.PI;const orb=ball(.23,material(0xffffff,{emissive:0xffe4a3,emissiveIntensity:1}),beacon,0,5.8,0);beacon.visible=false;
  const geo=new THREE.CylinderGeometry(.13,.23,1,10);guideBeam=mesh(geo,material(0xffd784,{transparent:true,opacity:.22,depthWrite:false}),scene,0,2,0);guideBeam.visible=false;
}
function fallbackAvatar(who){const g=group(0,0,0,playerBody),dress=material(who==='lale'?0x8b74ee:0xff83b1),skin=material(0xffd4ba),hair=material(who==='lale'?0x593f34:0x674334);
  const skirt=cone(.9,1.8,dress,g,0,1,0,12);skirt.rotation.z=Math.PI;
  box(.9,1,.55,dress,g,0,1.95,0);ball(.57,skin,g,0,2.85,0);ball(.6,hair,g,0,3.11,-.16);
  for(let side of [-1,1]){ball(.29,skin,g,side*.95,1.9,0);const eye=ball(.065,mat.dark,g,side*.2,2.87,.52);ball(.38,hair,g,side*.58,2.42,-.24);ball(.25,material(0xffd8b3),g,side*.4,.18,0);}
  const bow=ball(.18,material(who==='lale'?0xffe4b7:0x9b75fd),g,.42,3.25,.22);return g;
}
function makePlayer(who){player=group(playerPos.x,0,playerPos.z);const shadow=mesh(new THREE.CircleGeometry(.86,24),material(0x4d8c75,{transparent:true,opacity:.22,depthWrite:false}),player,0,.03,0);shadow.rotation.x=-Math.PI/2;playerBody=group(0,0,0,player);avatar=fallbackAvatar(who);tryLoadAvatar(who);}
async function tryLoadAvatar(who){try{const {GLTFLoader}=await import('../js/vendor/loaders/GLTFLoader.js');const loader=new GLTFLoader();const gltf=await loader.loadAsync(`../assets/characters/${who}.glb`);if(who!==kid||!playerBody)return;
  const obj=gltf.scene;obj.updateMatrixWorld(true);const box3=new THREE.Box3().setFromObject(obj);const size=box3.getSize(new THREE.Vector3());if(size.y<.01)return;obj.scale.multiplyScalar(2.65/size.y);obj.updateMatrixWorld(true);const nBox=new THREE.Box3().setFromObject(obj);const center=nBox.getCenter(new THREE.Vector3());obj.position.sub(new THREE.Vector3(center.x,nBox.min.y,center.z));
  playerBody.remove(avatar);avatar=obj;playerBody.add(avatar);
  if(gltf.animations?.length){avatarMixer=new THREE.AnimationMixer(obj);const idle=gltf.animations.find(a=>/idle|walk/i.test(a.name))||gltf.animations[0];avatarMixer.clipAction(idle).play();}
}catch(e){console.info('3D karakter dosyası yüklenemedi; oyun içi karakter kullanılıyor.',e.message);}}
function setup3D(){try{scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(59,innerWidth/innerHeight,.1,250);renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'default'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.55));renderer.setSize(innerWidth,innerHeight);$('game').appendChild(renderer.domElement);
  decorations();const apply=()=>{renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.55));camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();};addEventListener('resize',apply);
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;controls.dragging=true;controls.lastX=e.clientX;controls.lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(!controls.dragging)return;const d=e.clientX-controls.lastX;controls.angle+=d*.005;controls.lastX=e.clientX;controls.lastY=e.clientY;});renderer.domElement.addEventListener('pointerup',()=>controls.dragging=false);renderer.domElement.addEventListener('pointercancel',()=>controls.dragging=false);
  renderer.domElement.addEventListener('wheel',e=>{controls.zoom=clamp(controls.zoom+Math.sign(e.deltaY)*.7,8,17);e.preventDefault();},{passive:false});
  lastTime=performance.now();requestAnimationFrame(loop);$('loading').classList.add('hidden');$('chooser').classList.remove('hidden');return true;
}catch(err){$('loading').classList.add('hidden');$('fatal').classList.remove('hidden');$('fatal-text').textContent='3D görüntü başlatılamadı: '+err.message;console.error(err);return false;}}
function dismissDialog(){if(challengeMode)return;dialogShown=false;$('dialog').classList.add('hidden');}
function openDialog({emoji='💌',kicker='BİR MESAJIN VAR',title='',text='',button='DEVAM ET ✨',photos=[],answers=null,onDone=()=>{}}){dialogShown=true;challengeMode=!!answers;$('dialog-emoji').textContent=emoji;$('dialog-kicker').textContent=kicker;$('dialog-title').textContent=title;$('dialog-text').textContent=text;$('dialog-close').textContent=button;$('dialog-answers').innerHTML='';$('dialog-answers').classList.toggle('hidden',!answers);$('dialog-close').classList.toggle('hidden',!!answers);$('dialog-photos').innerHTML='';$('dialog-photos').classList.toggle('hidden',!photos.length);
  for(const photo of photos){const fig=document.createElement('figure');const im=new Image();im.src=`../assets/family/${photo.file}.webp`;im.alt=photo.name;im.onerror=()=>{fig.remove();if(!$('dialog-photos').children.length)$('dialog-photos').classList.add('hidden');};fig.appendChild(im);const cap=document.createElement('figcaption');cap.textContent=photo.name;fig.appendChild(cap);$('dialog-photos').appendChild(fig);}
  const complete=()=>{try{speechSynthesis.cancel()}catch{}challengeMode=false;dialogShown=false;$('dialog').classList.add('hidden');onDone();};
  if(answers){answers.options.forEach((a,i)=>{const b=document.createElement('button');b.textContent=a;b.onclick=()=>{if(i!==answers.ok){b.classList.remove('wrong');void b.offsetWidth;b.classList.add('wrong');sound('wrong');$('dialog-text').textContent=answers.tip||text;speak((kid==='ela'?'Bir daha deneyelim! ':'')+(answers.tip||text));return;}b.classList.add('correct');sound('good');$('dialog-text').textContent='🌟 Harika! Doğru cevap!';speak('Harika! Doğru cevap!');$('dialog-answers').querySelectorAll('button').forEach(x=>x.disabled=true);setTimeout(complete,700);};$('dialog-answers').appendChild(b);});}
  $('dialog-close').onclick=complete;$('dialog').classList.remove('hidden');speak(title.replace(/✨/g,'')+'. '+text);}
/* Sesli okuma: cihazın Türkçe sesiyle; ses kapalıysa okunmaz. */
function speak(t,queue){if(!soundOn||!('speechSynthesis' in window)||!t)return;try{if(!queue)speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu,'').replace(/\s+/g,' ').trim());u.lang='tr-TR';const v=speechSynthesis.getVoices().find(v=>/^tr/i.test(v.lang));if(v)u.voice=v;u.rate=.95;u.pitch=1.1;speechSynthesis.speak(u);}catch{}}
let toastTimer;
function toast(t){if(kid==='ela')speak(t);const v=$('toast');v.textContent=t;v.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>v.classList.add('hidden'),1800);}
let audioCtx;
function sound(type){if(!soundOn)return;try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const notes=type==='good'?[523,659,784]:type==='win'?[523,659,784,1046,1318]:type==='wrong'?[180,145]:[650];notes.forEach((hz,i)=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),now=audioCtx.currentTime+i*.095;osc.type=type==='wrong'?'triangle':'sine';osc.frequency.setValueAtTime(hz,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.07,now+.02);gain.gain.exponentialRampToValueAtTime(.001,now+.22);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+.25);});}catch{}}
function startGame(who){kid=who;document.body.dataset.kid=who;try{$('pause-home').href='../#'+who;$('back-home').href='../#'+who;}catch{}progress=loadSave(kid);controls.keys.clear();$('chooser').classList.add('hidden');$('hud').classList.remove('hidden');$('hud-name').textContent=who.toUpperCase();$('hint').textContent='Yıldızlar sana yolu gösterecek ✨';paused=false;dialogShown=false;if(player){scene.remove(player);player=null;avatarMixer=null;}
  makePlayer(who);visitZone(progress.level);updateHUD();showWelcome();}
function visitZone(level){const z=zoneData[level];const x=z.x+3,zp=z.z+9;playerPos.set(x,0,zp);if(player){player.position.copy(playerPos);}controls.angle=0;controls.zoom=11;syncCollected();updateHUD();}
function syncCollected(){collectibleSets.forEach((arr,i)=>arr.forEach((item,n)=>{item.taken=!!(progress.collected[i]||[]).includes(n);item.g.visible=!item.taken;}));}
function currentCollectibles(){return collectibleSets[progress.level].filter(x=>!x.taken);}
function showWelcome(){if(progress.completed){openDialog({emoji:'💖',title:'Aileye Hoş Geldin!',text:'Bütün Sevgi Işıklarını topladın! Dünyayı keşfetmeye devam edebilir veya ilerlemeyi sıfırlayabilirsin.',photos:[{file:'anne',name:'Nicole'},{file:'baba',name:'Oğuzhan'}]});return;}
  const z=zoneData[progress.level];openDialog({emoji:z.emoji,kicker:`BÖLÜM ${progress.level+1} / 5`,title:`Merhaba ${kid==='lale'?'Lale':'Ela'}!`,text:`${z.intro}\n\nYürümek için ${matchMedia('(pointer:coarse)').matches?'soldaki kontrolü':'WASD / ok tuşlarını'} kullan. Kaybolursan “Yolu Göster”e bas!`,button:'HAYDİ OYNAYALIM! 🌟'});}
function updateHUD(){if(!kid)return;const i=progress.level,z=zoneData[i],done=3-currentCollectibles().length;$('light-count').textContent=progress.completed?5:i;$('zone-count').textContent=`BÖLÜM ${i+1} / 5`;$('zone-name').textContent=z.name;$('zone-emoji').textContent=z.emoji;$('progress-bar').style.width=`${done/3*100}%`;$('quest-found').textContent=`${done} / 3`;$('quest-text').textContent=progress.completed?'🌟 Macerayı tamamladın!':done<3?z.collect:`${z.npc} ile konuş!`;$('quest-range').textContent=done>=3?'💌 Rehber seni bekliyor':'✨ Parlayan işareti izle';}
function target(){if(!kid||progress.completed)return null;const remaining=currentCollectibles();if(!remaining.length)return {pos:npcNodes[progress.level].pos,isNPC:true,zone:progress.level};let best=remaining[0],dist=Infinity;for(const c of remaining){const d=c.pos.distanceToSquared(playerPos);if(d<dist){best=c;dist=d;}}return best;}
function collect(c){if(!c||c.taken)return;c.taken=true;c.g.visible=false;progress.collected[c.zone]??=[];if(!progress.collected[c.zone].includes(c.index))progress.collected[c.zone].push(c.index);save();sound('good');toast(`${zoneData[c.zone].icon} Harika ${kid==='lale'?'Lale':'Ela'}! +1`);updateHUD();if(!currentCollectibles().length){setTimeout(()=>{toast('💌 Şimdi rehberinle konuş!');},650);}}
function tryInteract(){if(!kid||paused||dialogShown)return;const t=target();if(!t)return;const d=Math.hypot(t.pos.x-playerPos.x,t.pos.z-playerPos.z);if(d>3.3){toast('🧭 Önce parlayan işarete yaklaş!');return;}if(t.isNPC)challenge();else collect(t);}
function challenge(){const lvl=progress.level,z=zoneData[lvl],q=questions[kid][lvl];openDialog({emoji:z.marker,kicker:`${z.npc.toUpperCase()} SENİNLE KONUŞUYOR`,title:`${z.title} ✨`,text:q.q,answers:{options:q.a,ok:q.ok,tip:q.tip},onDone:()=>finishLevel()});}
function finishLevel(){const lvl=progress.level,z=zoneData[lvl];sound('win');const last=lvl===4;const next=()=>{if(last){progress.completed=true;save();updateHUD();showFinal();return;}progress.level=lvl+1;save();visitZone(progress.level);showWelcome();};
  openDialog({emoji:'🌟',kicker:'GÖREV TAMAMLANDI',title:`${lvl+1}. SEVGİ IŞIĞI!`,text:z.done,button:last?'❤️ AİLEME KAVUŞ':'🚀 SONRAKİ BÖLGEYE GİT',photos:lvl===0?[{file:'dede',name:'Dede',fallback:'lale-ela'},{file:'babaanne',name:'Babaanne',fallback:'lale-ela'}]:lvl===3?[{file:'anneanne',name:'Anneanne',fallback:'lale-ela'}]:[],onDone:next});}
function showFinal(){const other=loadSave(kid==='lale'?'ela':'lale');const suffix=other.completed?'\n\n🌟 Lale ve Ela, ikiniz de bu macerayı tamamladınız. Ailemizin iki yıldızısınız!':'';openDialog({emoji:'👨‍👩‍👧‍👧',kicker:'SEVGİ PUSULASI TAMAMLANDI',title:`BAŞARDIN ${kid==='lale'?'LALE':'ELA'}! 💖`,text:`Annen Nicole ve Baban Oğuzhan sana sarılıyor!\nTrabzon'daki dedenle babaannen ve İskoçya'daki anneannen de seni çok seviyor.\n\nNerede olursak olalım, ailemizin sevgisi hep yanımızda!${suffix}`,photos:[{file:'anne',name:'Anne Nicole'},{file:'baba',name:'Baba Oğuzhan'}],button:'🌈 DÜNYAYI KEŞFET',onDone:()=>toast('💖 Seni çok seviyoruz!')});}
function guide(){if(!kid||paused||dialogShown)return;const t=target();if(!t){toast('💖 Bütün görevler tamamlandı!');return;}const d=Math.hypot(t.pos.x-playerPos.x,t.pos.z-playerPos.z);if(d<3){tryInteract();return;}const z=zoneData[progress.level];playerPos.set(t.pos.x+1.6,0,t.pos.z+2);player.position.copy(playerPos);sound('tap');toast('🧭 İşte aradığın yer!');}
function keyboard(){window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();controls.keys.add(e.code);if(e.repeat)return;if(e.code==='KeyE'||e.code==='Enter')tryInteract();if(e.code==='Space')controls.jump=true;if(e.code==='Escape'){if(dialogShown)return;togglePause();}});window.addEventListener('keyup',e=>controls.keys.delete(e.code));window.addEventListener('blur',()=>controls.keys.clear());}
function joystick(){const el=$('stick'),knob=$('stick-knob');let active=null;const move=e=>{const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,scale=Math.max(1,Math.hypot(dx,dy)),range=38,f=Math.min(1,scale/range);controls.joyX=dx/scale*f;controls.joyY=dy/scale*f;knob.style.transform=`translate(${controls.joyX*range}px,${controls.joyY*range}px)`;};el.addEventListener('pointerdown',e=>{active=e.pointerId;el.setPointerCapture(active);move(e);e.preventDefault();});el.addEventListener('pointermove',e=>{if(e.pointerId===active)move(e);});const end=e=>{if(e.pointerId!==active)return;active=null;controls.joyX=controls.joyY=0;knob.style.transform='';};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
  $('btn-jump').addEventListener('pointerdown',e=>{controls.jump=true;e.preventDefault();});$('btn-action').addEventListener('pointerdown',e=>{tryInteract();e.preventDefault();});}
function togglePause(){if(!kid||dialogShown)return;paused=!paused;if(paused)try{speechSynthesis.cancel()}catch{}$('pause').classList.toggle('hidden',!paused);}
function bindUI(){$('choose-lale').onclick=()=>startGame('lale');$('choose-ela').onclick=()=>startGame('ela');$('btn-menu').onclick=togglePause;$('resume').onclick=togglePause;$('btn-guide').onclick=guide;$('btn-interact').onclick=tryInteract;$('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'🔊 Ses: Açık':'🔇 Ses: Kapalı';if(soundOn)sound('tap');else try{speechSynthesis.cancel()}catch{}};$('reset').onclick=()=>{if(!kid)return;const old=kid;progress=defaultSave();save();paused=false;$('pause').classList.add('hidden');startGame(old);};keyboard();joystick();}
function drawMinimap(){const c=minimap,sz=180;c.clearRect(0,0,sz,sz);c.fillStyle='#e9f7d6';c.fillRect(0,0,sz,sz);const point=(x,z)=>[(x+65)/130*sz,(z+76)/122*sz];for(let i=0;i<zoneData.length;i++){const z=zoneData[i],p=point(z.x,z.z);c.beginPath();c.arc(...p,15,0,Math.PI*2);c.fillStyle=i===progress.level?'#ffbd68':i<progress.level?'#d0bbfb':'#a3d7ac';c.fill();c.fillStyle='#463c72';c.font='19px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(z.emoji,...p);}
  if(kid){const p=point(playerPos.x,playerPos.z);c.beginPath();c.arc(...p,6,0,Math.PI*2);c.fillStyle='#ff4787';c.fill();c.lineWidth=2;c.strokeStyle='#fff';c.stroke();const t=target();if(t){const pp=point(t.pos.x,t.pos.z);c.beginPath();c.arc(...pp,5,0,7);c.fillStyle='#ffca43';c.fill();}}
}
function loop(time){requestAnimationFrame(loop);const dt=Math.min((time-lastTime)/1000,.05)||.016;lastTime=time;elapsed+=dt;for(const c of clouds){c.g.position.x+=c.speed*dt;if(c.g.position.x>75)c.g.position.x=-75;}
  for(const arr of collectibleSets)for(const o of arr){if(o.taken)continue;o.g.position.y=o.baseY+Math.sin(elapsed*2.4+o.index)*.22;o.g.rotation.y+=dt*.8;}
  if(kid&&player){if(!paused&&!dialogShown){const ky=(controls.keys.has('KeyW')||controls.keys.has('ArrowUp')?1:0)-(controls.keys.has('KeyS')||controls.keys.has('ArrowDown')?1:0)-controls.joyY;const kx=(controls.keys.has('KeyD')||controls.keys.has('ArrowRight')?1:0)-(controls.keys.has('KeyA')||controls.keys.has('ArrowLeft')?1:0)+controls.joyX;const len=Math.hypot(kx,ky);let moving=false;if(len>.08){const speed=kid==='ela'?5.5:7.1,dx=(kx*Math.cos(controls.angle)-ky*Math.sin(controls.angle))/Math.max(1,len),dz=(-kx*Math.sin(controls.angle)-ky*Math.cos(controls.angle))/Math.max(1,len);playerPos.x=clamp(playerPos.x+dx*speed*dt,-69,69);playerPos.z=clamp(playerPos.z+dz*speed*dt,-73,43);playerBody.rotation.y=lerp(playerBody.rotation.y,Math.atan2(dx,dz),Math.min(1,dt*10));moving=true;}if(controls.jump&&Math.abs(playerPos.y)<.01){velocityY=7.3;sound('tap');}controls.jump=false;velocityY-=18*dt;playerPos.y=Math.max(0,playerPos.y+velocityY*dt);if(playerPos.y<=0)velocityY=0;player.position.copy(playerPos);if(!avatarMixer&&avatar){avatar.rotation.z=moving?Math.sin(elapsed*13)*.055:0;avatar.position.y=moving?Math.abs(Math.sin(elapsed*11))*.09:0;}if(avatarMixer)avatarMixer.update(dt);const t=target();actionTarget=null;if(t){const d=Math.hypot(t.pos.x-playerPos.x,t.pos.z-playerPos.z);if(d<3.2)actionTarget=t;if(!t.isNPC&&d<1.9){collect(t);}beacon.visible=true;beacon.position.set(t.pos.x,.15+Math.sin(elapsed*2)*.25,t.pos.z);guideBeam.visible=true;guideBeam.position.set(t.pos.x,2.4,t.pos.z);guideBeam.scale.set(1,4.4,1);$('quest-range').textContent=`🧭 ${Math.max(0,Math.round(d))} m uzaklıkta`;}else{beacon.visible=false;guideBeam.visible=false;}$('interact-wrap').classList.toggle('hidden',!actionTarget);}
    const focus=V3(playerPos.x,1.55+playerPos.y*.7,playerPos.z);const camGoal=V3(playerPos.x+Math.sin(controls.angle)*controls.zoom,6.4+playerPos.y+controls.zoom*.16,playerPos.z+Math.cos(controls.angle)*controls.zoom);camera.position.lerp(camGoal,Math.min(1,dt*5));camPoint.lerp(focus,Math.min(1,dt*7));camera.lookAt(camPoint);
  }else{camera.position.set(13,30,48);camera.lookAt(0,0,-9);}
  drawMinimap();renderer.render(scene,camera);
}

window.__w3d={get progress(){return progress},guide:()=>guide(),interact:()=>tryInteract(),q:()=>questions[kid][progress.level],get dialog(){return dialogShown}};
try{window.__lale3dStarted=true;bindUI();const ready=setup3D();const requested=new URLSearchParams(location.search).get('kid');if(ready&&(requested==='lale'||requested==='ela')){startGame(requested);}}catch(err){console.error(err);$('loading').classList.add('hidden');$('fatal').classList.remove('hidden');$('fatal-text').textContent=err.message;}
