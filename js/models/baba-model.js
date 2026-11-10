/* Baba Oğuzhan — stilize 3D karakter (Lale ve Ela modelleriyle aynı tarz)
   Fotoğraftaki ayrıntılar: koyu kısa kabarık saç, altın çerçeveli pilot gözlüğü,
   hafif sakal, cepli siyah gömlek-ceket, açık mavi bantlı bordo kazak, siyah pantolon. */
export function buildBaba(THREE) {
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .75, metalness: 0 }, o));
  const skin = M(0xe7b48f), hair = M(0x2b1d16, { roughness: .9 }), jacket = M(0x1d1c22, { roughness: .95 }), jacketDark = M(0x121117),
    sweater = M(0x7a1e2e, { roughness: .9 }), band = M(0xbfd8ea, { roughness: .9 }), pants = M(0x15151b), shoe = M(0x0e0e12),
    lens = M(0x231c22, { roughness: .15, metalness: .4 }), gold = M(0xd4a84a, { roughness: .3, metalness: .9 }), stub = M(0x6b5040, { transparent: true, opacity: .35, roughness: 1, depthWrite: false }),
    button = M(0x2e2d35, { metalness: .3 }), lip = M(0xb8755f), white = M(0xffffff);
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); parent.add(m); return m; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d, 2, 2, 2);
  const cyl = (rt, rb, h, s = 16) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r, w = 24, h = 18) => new THREE.SphereGeometry(r, w, h);

  /* bacaklar ve ayakkabılar */
  for (const sx of [-1, 1]) {
    add(cyl(.11, .1, .78), pants, sx * .13, .45, 0);
    add(box(.2, .1, .34), shoe, sx * .13, .05, .05);
    add(sph(.1), shoe, sx * .13, .07, .18, 0, 0, 0, 1, .7, 1);
  }
  /* kalça */
  add(box(.44, .2, .26), pants, 0, .86, 0);

  /* gövde: bordo kazak + açık mavi bant */
  const torso = add(cyl(.22, .24, .62, 20), sweater, 0, 1.2, 0, 0, 0, 0, 1.08, 1, .78);
  add(cyl(.225, .23, .14, 20), band, 0, 1.24, .005, 0, 0, 0, 1.09, 1, .79);
  add(cyl(.12, .14, .08, 16), sweater, 0, 1.53, 0);       // yaka (kazak)
  /* siyah gömlek-ceket: iki ön panel (açık), sırt, yaka, cepler, düğmeler */
  for (const sx of [-1, 1]) {
    add(box(.17, .66, .05), jacket, sx * .155, 1.17, .17, 0, sx * -.18, 0);
    add(box(.11, .1, .02), jacketDark, sx * .16, 1.33, .2, 0, sx * -.18, 0);       // göğüs cebi
    add(box(.12, .02, .025), jacket, sx * .16, 1.385, .205, 0, sx * -.18, 0);      // cep kapağı
    add(sph(.012, 8, 6), button, sx * .16, 1.365, .215);
    add(box(.1, .05, .04), jacket, sx * .12, 1.54, .12, 0, sx * -.5, sx * .35);    // yaka kıvrımı
    add(box(.06, .62, .3), jacket, sx * .26, 1.18, -.02);                           // yan
  }
  add(box(.5, .66, .05), jacket, 0, 1.18, -.17);                                    // sırt
  for (let i = 0; i < 4; i++) add(sph(.011, 8, 6), button, .085, 1.42 - i * .13, .205);
  /* kollar (eller cepte duruşu yerine sürüşe uygun öne uzanmış) */
  g.userData.arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(sx * .3, 1.45, 0); g.add(arm);
    add(sph(.085), jacket, 0, 0, 0, 0, 0, 0, 1, 1, 1, arm);
    add(cyl(.075, .07, .34), jacket, 0, -.17, 0, 0, 0, 0, 1, 1, 1, arm);
    const fore = new THREE.Group(); fore.position.set(0, -.34, 0); arm.add(fore);
    add(cyl(.07, .065, .3), jacket, 0, -.14, 0, 0, 0, 0, 1, 1, 1, fore);
    add(cyl(.072, .072, .03), jacketDark, 0, -.29, 0, 0, 0, 0, 1, 1, 1, fore);       // manşet
    add(sph(.058), skin, 0, -.34, 0, 0, 0, 0, 1, 1.15, .85, fore);                   // el
    arm.rotation.set(-.15, 0, sx * .12); fore.rotation.x = -.3;
    arm.userData.fore = fore; g.userData.arms.push(arm);
  }

  /* boyun ve baş */
  add(cyl(.065, .075, .12), skin, 0, 1.6, 0);
  const head = new THREE.Group(); head.position.set(0, 1.83, 0); g.add(head); g.userData.head = head;
  add(sph(.2), skin, 0, 0, 0, 0, 0, 0, .92, 1.05, .98, head);
  add(sph(.16), skin, 0, -.09, .03, 0, 0, 0, .9, .75, .95, head);                    // çene
  add(sph(.163, 20, 14), stub, 0, -.095, .04, 0, 0, 0, .88, .7, .9, head);          // hafif sakal
  add(box(.09, .016, .02), stub, 0, -.07, .175, 0, 0, 0, 1, 1, 1, head);             // bıyık gölgesi
  for (const sx of [-1, 1]) add(sph(.045, 12, 10), skin, sx * .185, -.01, 0, 0, 0, 0, .55, 1, .8, head); // kulaklar
  add(sph(.03, 12, 10), skin, 0, -.02, .19, 0, 0, 0, .8, 1, 1.1, head);              // burun
  add(new THREE.TorusGeometry(.045, .01, 8, 20, Math.PI), lip, 0, -.085, .17, Math.PI, 0, 0, 1, .6, 1, head); // gülümseme
  /* saç: kısa yanlar, üstte kabarık */
  add(new THREE.SphereGeometry(.205, 24, 16, 0, Math.PI * 2, Math.PI * .35, Math.PI * .4), hair, 0, .02, -.03, 0, 0, 0, .96, 1.02, 1.0, head); // ense
  const capG = new THREE.SphereGeometry(.205, 24, 12, 0, Math.PI * 2, 0, Math.PI * .5);
  add(capG, hair, 0, .045, -.005, 0, 0, 0, .96, 1, 1.02, head);
  for (const [x, y, z, s] of [[-.08, .19, .08, .09], [0, .21, .1, .1], [.08, .19, .08, .09], [-.04, .2, 0, .1], [.05, .2, -.02, .1], [0, .19, -.09, .09]]) add(sph(s, 12, 10), hair, x, y, z, 0, 0, 0, 1, .6, 1, head);
  for (const sx of [-1, 1]) add(box(.02, .09, .06), hair, sx * .172, .01, .03, 0, 0, 0, 1, 1, 1, head);   // favori
  /* kaşlar */
  for (const sx of [-1, 1]) add(box(.07, .016, .02), hair, sx * .07, .085, .18, 0, 0, sx * -.12, 1, 1, 1, head);
  /* pilot gözlüğü */
  const gl = new THREE.Group(); gl.position.set(0, .03, .19); head.add(gl);
  for (const sx of [-1, 1]) {
    const lensG = new THREE.CircleGeometry(.055, 24);
    add(lensG, lens, sx * .065, 0, .002, 0, 0, 0, 1, .85, 1, gl).material.side = THREE.DoubleSide;
    add(new THREE.TorusGeometry(.056, .006, 6, 28), gold, sx * .065, 0, 0, 0, 0, 0, 1, .85, 1, gl);
    add(sph(.012, 8, 6), white, sx * .085, .02, .006, 0, 0, 0, 1.4, .8, .3, gl);    // parlama
    add(box(.12, .008, .008), gold, sx * .155, .012, -.09, 0, sx * 1.35, 0, 1, 1, 1, gl); // sap
  }
  add(box(.04, .006, .006), gold, 0, .028, .002, 0, 0, 0, 1, 1, 1, gl);              // köprü
  add(new THREE.TorusGeometry(.012, .004, 6, 12, Math.PI), gold, 0, .004, .002, 0, 0, 0, 1, 1, 1, gl);

  g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  g.name = 'Oguzhan';
  return g;
}
