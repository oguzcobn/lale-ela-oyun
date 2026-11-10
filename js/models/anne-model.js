/* Anne Nicole — stilize 3D karakter (Lale, Ela ve Baba modelleriyle aynı tarz)
   Fotoğraftaki ayrıntılar: ortadan ayrılmış uzun kumral-kızıl saç, mavi-gri gözler,
   hafif çiller, gülümseme, önü açık açık-mavi çizgili gömlek, lacivert-gri tişört. */
export function buildAnne(THREE) {
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .75, metalness: 0 }, o));
  // çizgili gömlek dokusu
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const g2 = cv.getContext('2d');
  g2.fillStyle = '#dfe7fb'; g2.fillRect(0, 0, 64, 64); g2.fillStyle = '#9fb3ec'; for (let x = 0; x < 64; x += 8) g2.fillRect(x, 0, 3, 64);
  const stripe = new THREE.CanvasTexture(cv); stripe.wrapS = stripe.wrapT = THREE.RepeatWrapping; stripe.repeat.set(3, 2); stripe.colorSpace = THREE.SRGBColorSpace;
  const skin = M(0xf3d2bd), hair = M(0x7a4a2c, { roughness: .85 }), hairHi = M(0x9a6139, { roughness: .85 }),
    shirt = M(0xffffff, { map: stripe, roughness: .9 }), tee = M(0x4f5f7a, { roughness: .95 }), jeans = M(0x6f86b0, { roughness: .9 }),
    shoe = M(0xf4f4f6), eyeW = M(0xffffff), iris = M(0x7f98a8), pupil = M(0x1d2430), lip = M(0xd9877a), cheek = M(0xf2a5a0, { transparent: true, opacity: .45, depthWrite: false }),
    freck = M(0xc98d6c), brow = M(0x6a3f25), button = M(0xffffff);
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); parent.add(m); return m; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d, 2, 2, 2);
  const cyl = (rt, rb, h, s = 18) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r, w = 24, h = 18) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 12);

  /* bacaklar: açık kot, beyaz spor ayakkabı */
  for (const sx of [-1, 1]) {
    add(cyl(.1, .085, .78), jeans, sx * .11, .45, 0);
    add(box(.17, .09, .3), shoe, sx * .11, .045, .05);
    add(sph(.085), shoe, sx * .11, .06, .17, 0, 0, 0, 1, .7, 1);
  }
  add(box(.38, .2, .24), jeans, 0, .86, 0);
  /* tişört gövdesi */
  add(cyl(.18, .21, .62, 20), tee, 0, 1.2, 0, 0, 0, 0, 1.05, 1, .78);
  add(new THREE.TorusGeometry(.085, .015, 8, 20), tee, 0, 1.5, .06, Math.PI / 2.4, 0, 0, 1, 1, .7);
  /* önü açık çizgili gömlek */
  for (const sx of [-1, 1]) {
    add(box(.15, .7, .05), shirt, sx * .15, 1.15, .155, 0, sx * -.22, 0);
    add(box(.12, .07, .03), shirt, sx * .1, 1.5, .14, -.3, sx * -.5, sx * .5);   // yaka
    add(box(.05, .64, .26), shirt, sx * .22, 1.17, -.01);
    for (let i = 0; i < 3; i++) if (sx > 0) add(sph(.012, 8, 6), button, .1, 1.35 - i * .17, .185);
  }
  add(box(.44, .7, .05), shirt, 0, 1.15, -.15);
  /* kollar (gömlek kolları) */
  g.userData.arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(sx * .25, 1.45, 0); g.add(arm);
    add(sph(.075), shirt, 0, 0, 0, 0, 0, 0, 1, 1, 1, arm);
    add(cyl(.068, .062, .33), shirt, 0, -.165, 0, 0, 0, 0, 1, 1, 1, arm);
    const fore = new THREE.Group(); fore.position.set(0, -.33, 0); arm.add(fore);
    add(cyl(.062, .055, .27), shirt, 0, -.13, 0, 0, 0, 0, 1, 1, 1, fore);
    add(sph(.05), skin, 0, -.31, 0, 0, 0, 0, 1, 1.15, .85, fore);
    arm.rotation.set(-.12, 0, sx * .1); fore.rotation.x = -.25; g.userData.arms.push(arm);
  }
  /* boyun ve baş */
  add(cyl(.055, .065, .12), skin, 0, 1.58, 0);
  const head = new THREE.Group(); head.position.set(0, 1.8, 0); g.add(head); g.userData.head = head;
  add(sph(.19), skin, 0, 0, 0, 0, 0, 0, .9, 1.05, .96, head);
  add(sph(.15), skin, 0, -.085, .03, 0, 0, 0, .82, .72, .9, head);            // çene
  add(sph(.028, 12, 10), skin, 0, -.02, .182, 0, 0, 0, .8, 1, 1.1, head);     // burun
  /* gözler: mavi-gri */
  for (const sx of [-1, 1]) {
    add(sph(.027, 14, 10), eyeW, sx * .066, .025, .16, 0, 0, 0, 1.15, .8, .35, head);
    add(sph(.017, 12, 10), iris, sx * .066, .023, .168, 0, 0, 0, 1, 1, .3, head);
    add(sph(.008, 8, 6), pupil, sx * .066, .023, .172, 0, 0, 0, 1, 1, .3, head);
    add(sph(.004, 6, 5), eyeW, sx * .061, .028, .175, 0, 0, 0, 1, 1, .3, head);
    add(box(.065, .012, .015), brow, sx * .068, .075, .168, 0, 0, sx * -.08, 1, 1, 1, head);
    add(sph(.04, 12, 10), cheek, sx * .1, -.045, .14, 0, 0, 0, 1, .7, .4, head);
    for (const [fx, fy] of [[.05, -.025], [.075, -.03], [.06, -.04]]) add(sph(.0032, 6, 5), freck, sx * fx, fy, .17, 0, 0, 0, 1, 1, .4, head); // çiller
    add(sph(.04, 12, 10), skin, sx * .172, -.01, 0, 0, 0, 0, .5, 1, .8, head); // kulak
  }
  /* gülümseme */
  add(new THREE.TorusGeometry(.04, .011, 8, 20, Math.PI), lip, 0, -.075, .162, Math.PI, 0, 0, 1, .55, 1, head);
  /* saç: ortadan ayrılmış üst, yüzü çerçeveleyen uzun tutamlar, sırtta uzun saç */
  for (const sx of [-1, 1]) {
    add(cap(.055, .3), hair, sx * .17, -.08, -.02, 0, 0, sx * .05, 1, 1, 1, head);        // yan saç
    add(cap(.06, .42), hair, sx * .15, -.2, .06, .12, 0, sx * .08, 1, 1, .8, head);       // ön tutam
    add(cap(.05, .5), hairHi, sx * .13, -.26, -.03, .05, 0, sx * .06, 1, 1, .8, head);
  }
  add(new THREE.SphereGeometry(.2, 24, 14, 0, Math.PI * 2, 0, Math.PI * .5), hair, 0, .03, -.01, -.18, 0, 0, .95, 1.03, 1.04, head); // üst
  add(box(.008, .004, .13), skin, 0, .235, .03, -.25, 0, 0, 1, 1, 1, head);              // orta ayrım çizgisi
  add(cap(.17, .62), hair, 0, -.27, -.1, .1, 0, 0, 1.15, 1, .55, head);                   // sırttaki uzun saç
  add(cap(.12, .5), hairHi, 0, -.38, -.15, .12, 0, 0, 1.2, 1, .45, head);
  g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  g.name = 'Nicole';
  return g;
}
