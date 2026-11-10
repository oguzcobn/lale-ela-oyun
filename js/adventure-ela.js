/* =====================================================================
   ELA'NIN MACERASI (4 yaş) — çok kolay, sesli, büyük dokunma alanları
   ===================================================================== */
const EC = { red: '#ff4d5e', yellow: '#ffd23f', blue: '#3fa9ff', green: '#4cd187', pink: '#ff7eb6', purple: '#a06bff' };
const flowerOpt = (c, ok) => ({ html: SVG.flower(c), ok, cls: 'xl' });
const shapeOpt = (k, c, ok) => ({ html: SVG.shape(k, c), ok, cls: 'xl shp' });
const balloonOpt = (c, ok, sz) => ({ html: `<span class="bal" style="--s:${sz || 1}">${SVG.balloon(c)}</span>`, ok, cls: 'xl' });
const photoOpt = (who, ok) => ({ html: `<span class="pho">${Adv.img(who)}</span><b class="pn">${FAMILY[who].name}</b>`, ok, cls: 'xl photo' });

const ADV_ELA = {
  title: 'Ela ve Sevgi Pusulası', mapTitle: "Ela'nın Haritası",
  levels: [
    /* ---------- 1. TRABZON'DA DEDE VE BABAANNE ---------- */
    {
      name: "Trabzon'da Dede ve Babaanne", short: 'Trabzon', emoji: '🌸', theme: 'trabzon', guide: '🐰',
      intro: 'Elaaa! Deden ve babaannen sana kocaman öpücük gönderiyor!',
      introScene: { type: 'message', people: ['dede', 'babaanne'], lines: [{ text: 'Elaaa! Deden ve babaannen sana kocaman öpücük gönderiyor! 😘', ms: 3200 }], btn: '▶ Oynayalım!' },
      tasks: [
        () => ({ type: 'choice', say: 'Ela, kırmızı çiçeğe dokun!', options: aShuffle([flowerOpt(EC.red, true), flowerOpt(EC.yellow), flowerOpt(EC.blue)]), okSay: 'Yaşasın! Kırmızı çiçek dans ediyor!', wrongSay: 'Bu başka renk. Kırmızı çiçeği bulalım!' }),
        { type: 'tapCount', say: 'Bir, iki, üç! Hadi kelebeklere dokunalım!', need: 3, fcls: 'float', items: [1, 2, 3].map(() => ({ html: '<span class="emo-xl">🦋</span>' })), okSay: 'Üç kelebek! Aferin Ela!' },
        () => ({ type: 'choice', say: 'Dedenin bordo-mavi topunu bul!', options: aShuffle([{ html: SVG.ball(TS_BORDO, TS_MAVI), ok: true, cls: 'xl' }, { html: SVG.ball('#ff9a3c', '#ffd23f'), cls: 'xl' }, { html: SVG.ball('#4cd187', '#a06bff'), cls: 'xl' }]), okSay: 'Buldun! Bordo-mavi top! 💙❤️' }),
        () => ({ type: 'choice', say: 'Babaannenin kalbini seç! Kalp hangisi?', options: aShuffle([shapeOpt('heart', EC.pink, true), shapeOpt('star', EC.yellow), shapeOpt('circle', EC.blue)]), okSay: 'Kalbi buldun! Babaannen sana sarılıyor!' })
      ],
      outro: 'Aferin Ela! Deden ve babaannen seninle gurur duyuyor! Birinci Sevgi Işığı yandı!'
    },

    /* ---------- 2. MİNİK TRABZONSPORLU ELA ---------- */
    {
      name: 'Minik Trabzonsporlu Ela', short: 'Futbol', emoji: '⚽', theme: 'stadium', guide: '🐻',
      intro: 'Ela, haydi Trabzonspor için gol atalım!',
      tasks: [
        () => ({ type: 'choice', say: 'Bordo balona dokun!', options: aShuffle([balloonOpt(TS_BORDO, true), balloonOpt(EC.yellow), balloonOpt(EC.green)]), okSay: 'Bordo balon! Aferin!' }),
        () => ({ type: 'choice', say: 'Şimdi mavi balona dokun!', options: aShuffle([balloonOpt(TS_MAVI, true), balloonOpt(EC.pink), balloonOpt(EC.yellow)]), okSay: 'Mavi balon! Süpersin!' }),
        () => ({ type: 'choice', say: 'Futbol topunu bul!', options: aShuffle([{ html: '<span class="emo-xl">⚽</span>', ok: true, cls: 'xl' }, { html: '<span class="emo-xl">🍎</span>', cls: 'xl' }, { html: '<span class="emo-xl">🧸</span>', cls: 'xl' }]), okSay: 'İşte futbol topu!' }),
        { type: 'goalTap', say: 'Büyük kaleye dokun, gol atalım!', okSay: 'GOOOOL! Aferin küçük Trabzonsporlu Ela!' },
        { type: 'floatTap', say: 'Üç bordo-mavi yıldızı topla!', count: 3, speed: .7, html: i => SVG.star(i % 2 ? TS_MAVI : TS_BORDO), okSay: 'Üç yıldız! Harikasın!' }
      ],
      outro: 'GOOOOL! İkinci Sevgi Işığı yandı! Aferin Ela!'
    },

    /* ---------- 3. İSKOÇYA'DAKİ ANNEANNEM ---------- */
    {
      name: "İskoçya'daki Anneannem", short: 'İskoçya', emoji: '✈️', theme: 'scotland', guide: '🐑',
      intro: "Uçağa binip İskoçya'ya, anneannene gidiyoruz!",
      introScene: [
        { type: 'plane', from: 'Trabzon', to: 'İskoçya', say: 'Vıııın! Uçuyoruz! ✈️' },
        { type: 'message', people: ['anneanne'], lines: [{ text: 'Hello Ela! I love you!', lang: 'en-GB', ms: 2200 }, { text: 'Anneannen sana kocaman sarılıyor! 🤗', ms: 2600 }], btn: '▶ Oynayalım!' }
      ],
      tasks: [
        () => ({ type: 'choice', say: 'Büyük kırmızı kalbi bul!', options: aShuffle([{ html: `<span class="hsz" style="--s:1">${SVG.shape('heart', EC.red)}</span>`, ok: true, cls: 'xl' }, { html: `<span class="hsz" style="--s:.5">${SVG.shape('heart', EC.red)}</span>`, cls: 'xl' }, { html: `<span class="hsz" style="--s:1">${SVG.shape('heart', EC.blue)}</span>`, cls: 'xl' }]), okSay: 'Büyük kırmızı kalp! Aferin!' }),
        { type: 'tapCount', say: 'Üç yıldızı sayalım! Yıldızlara dokun!', need: 3, fcls: 'float', items: [1, 2, 3].map(() => ({ html: '<span class="emo-xl">⭐</span>' })), okSay: 'Bir, iki, üç! Üç yıldız!' },
        { type: 'keyDoor', say: 'İskoçya şatosunun kapısını açalım! Anahtara dokun!', okSay: 'Kapı açıldı! İçeride koyunlar var! 🐑' },
        { type: 'puzzle', src: 'anneanne', cols: 2, rows: 1, say: 'Anneannenin resmini tamamla! Resme dokun!', okSay: 'İşte anneannen! Sana kocaman öpücük!' }
      ],
      outro: 'Yaşasın! Üçüncü Sevgi Işığı yandı!'
    },

    /* ---------- 4. ELA'NIN MANIFEST PARTİSİ ---------- */
    {
      name: "Ela'nın Manifest Partisi", short: 'Parti', emoji: '🎶', theme: 'concert', guide: '🎤',
      intro: "Ela! Manifest'i çok sevdiğini biliyoruz! Haydi dans edelim!",
      tasks: [
        { type: 'floatTap', say: 'Müzikle dans eden yıldızlara dokun!', count: 4, speed: 1.4, html: i => SVG.star(['#ff6fa8', '#ffc93c', '#4fb3ff', '#a06bff'][i]), okSay: 'Bütün yıldızları yakaladın!' },
        { type: 'lamps', say: 'Işıkları yakalım!', lamps: [{ c: '#ff6fa8', name: 'Pembe' }, { c: '#ffd23f', name: 'Sarı' }, { c: '#3fa9ff', name: 'Mavi' }], okSay: 'Sahne ışıl ışıl oldu!' },
        () => ({ type: 'choice', say: 'Büyük müzik notasını bul!', options: aShuffle([{ html: `<span class="hsz" style="--s:1">${SVG.note('#a06bff')}</span>`, ok: true, cls: 'xl' }, { html: `<span class="hsz" style="--s:.5">${SVG.note('#a06bff')}</span>`, cls: 'xl' }, { html: `<span class="hsz" style="--s:.5">${SVG.note('#ff6fa8')}</span>`, cls: 'xl' }]), okSay: 'Büyük nota! La la laaa! 🎵' }),
        { type: 'tapCount', say: 'Balonları patlatalım! Dört balona dokun!', need: 4, fcls: 'float', items: [EC.pink, EC.yellow, EC.blue, EC.purple, EC.green].map(c => ({ html: `<span class="bal">${SVG.balloon(c)}</span>` })), okSay: 'Pat pat pat pat! Dört balon!' },
        { type: 'dancer', say: 'Dansçı ayıcığa dokun, dans etsin!', html: '🐻', need: 4, okSay: 'Yaşasın Ela! Harika dans ettin!' }
      ],
      outro: 'Yaşasın Ela! Harika dans ettin! Dördüncü Sevgi Işığı yandı!'
    },

    /* ---------- 5. ANNE NICOLE VE BABA OĞUZHAN'A KAVUŞMA ---------- */
    {
      name: "Nicole ve Oğuzhan'a Kavuşma", short: 'Şato', emoji: '🏰', theme: 'castle', guide: '🐦',
      intro: 'Ela! Annen Nicole ve baban Oğuzhan seni bekliyor!',
      tasks: [
        () => ({ type: 'choice', say: "Annen Nicole'ün fotoğrafına dokun!", options: aShuffle([photoOpt('anne', true), photoOpt('baba')]), okSay: 'Annen Nicole! Seni çok seviyor! 💖' }),
        () => ({ type: 'choice', say: "Şimdi baban Oğuzhan'ın fotoğrafına dokun!", options: aShuffle([photoOpt('anne'), photoOpt('baba', true)]), okSay: 'Baban Oğuzhan! Sana kocaman sarılıyor! 💙' }),
        { type: 'floatTap', say: 'Beş sevgi kalbini topla!', count: 5, speed: .5, html: () => SVG.shape('heart', '#ff6fa8'), okSay: 'Beş kalp! Kalbin sevgiyle doldu!' },
        () => ({ type: 'choice', say: 'Büyük altın anahtarı seç!', options: aShuffle([{ html: '<span class="hsz emo" style="--s:1">🗝️</span>', ok: true, cls: 'xl' }, { html: '<span class="hsz emo" style="--s:.5">🗝️</span>', cls: 'xl' }, { html: '<span class="hsz emo" style="--s:.5">🔑</span>', cls: 'xl' }]), okSay: 'Büyük altın anahtar! Şimdi kapıyı açalım!' }),
        { type: 'keyDoor', say: 'Ela, anahtara dokun! Şimdi kapıyı açalım!', okSay: 'AFERİN ELA! ANNE VE BABANA ULAŞTIN!' }
      ],
      outro: 'Beşinci Sevgi Işığı yandı! Anne ve baban kapının arkasında!'
    }
  ]
};
