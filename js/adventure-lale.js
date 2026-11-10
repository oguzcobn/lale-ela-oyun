/* =====================================================================
   LALE'NİN MACERASI (8 yaş) — Sevgi Pusulası'nın Sırrı
   ===================================================================== */
const LQ = {
  add(lo, hi) { const a = aRnd(lo, hi), b = aRnd(lo, hi); return { q: `${a} + ${b}`, ans: a + b }; },
  sub(lo, hi) { const a = aRnd(lo + 10, hi + 10), b = aRnd(lo, Math.min(hi, a - 1)); return { q: `${a} − ${b}`, ans: a - b }; },
  mul() { const a = aRnd(2, 9), b = aRnd(2, 6); return { q: `${a} × ${b}`, ans: a * b }; },
  pattern(set, kinds) {
    const [A, B, C] = aShuffle(set);
    const P = { ab: [A, B, A, B, A, B, A], abc: [A, B, C, A, B, C, A], aab: [A, A, B, A, A, B, A], abb: [A, B, B, A, B, B, A] };
    const k = aPick(kinds), seq = P[k], next = { ab: B, abc: B, aab: A, abb: B }[k];
    const opts = aShuffle([...new Set([next, A, B, C])].slice(0, 3));
    if (!opts.includes(next)) opts[0] = next;
    return { say: 'Örüntüde eksik olan hangisi?', visual: seq.join(' ') + ' <span class="qmark">?</span>', vclass: 'pat', options: aShuffle(opts).map(o => ({ html: o, ok: o === next })), hint: 'İpucu: Baştan başlayıp hangi parçanın tekrar ettiğini bul.' };
  },
  nextNum() {
    const s = aPick([2, 3, 4, 5, 10]), st = aRnd(1, 12), seq = [0, 1, 2, 3].map(i => st + i * s), ans = st + 4 * s;
    return { say: 'Sıradaki sayı ne olmalı?', visual: seq.join(', ') + ', <span class="qmark">?</span>', options: numOpts(ans, 3, [s, 1, 2]), hint: `İpucu: Sayılar her seferinde ${s} artıyor.` };
  },
  odd() {
    const sets = [[['🍎', '🍌', '🍇', '🍓'], '⚽'], [['🐶', '🐱', '🐰', '🐻'], '🍕'], [['🚗', '🚌', '🚲', '🚂'], '🌸'], [['⚽', '🏀', '🎾', '🏐'], '🐟'], [['🌸', '🌻', '🌷', '🌹'], '🚀'], [['🎸', '🎹', '🥁', '🎺'], '🍩']];
    const [g, odd] = aPick(sets);
    return { say: 'Hangisi diğerlerinden farklı?', visual: '🤔', options: aShuffle([...aShuffle(g).slice(0, 3).map(e => ({ html: e })), { html: odd, ok: true }]), hint: 'İpucu: Üçü aynı gruptan, biri bambaşka bir şey.' };
  },
  shapeFit() {
    const ks = aShuffle(['heart', 'star', 'triangle', 'circle', 'square', 'diamond', 'moon', 'hexagon']).slice(0, 3), k = ks[0];
    const cols = aShuffle(['#ff6fa8', '#9b6bff', '#4fb3ff', '#3fcf86', '#ffc93c']);
    return { say: 'Hangi şekil boşluğa uyar?', visual: `<span class="hole">${SVG.shape(k, '', true)}</span>`, options: aShuffle(ks.map((s, i) => ({ html: SVG.shape(s, cols[i]), ok: s === k, cls: 'shp' }))), hint: 'İpucu: Boşluğun köşe sayısına dikkat et.' };
  }
};
const mathItem = (o, extra) => Object.assign({ visual: `${o.q} = <span class="qmark">?</span>`, options: numOpts(o.ans, 3, [10, 2, 1, 4]), hint: 'İpucu: Önce onlukları, sonra birlikleri topla.' }, extra || {});

const ADV_LALE = {
  title: 'Lale ve Sevgi Pusulası', mapTitle: "Lale'nin Haritası",
  levels: [
    /* ---------- 1. TRABZON'UN YEŞİL DAĞLARI ---------- */
    {
      name: "Trabzon'un Yeşil Dağları", short: 'Trabzon', emoji: '⛰️', theme: 'trabzon', guide: '🐟',
      intro: "Merhaba Lale! Trabzon'a hoş geldin! Ben Hamsi. Deden ve babaannen sana çok özel bir mesaj bıraktı.",
      introScene: {
        type: 'message', people: ['dede', 'babaanne'], lines: [
          { who: 'dede', text: "Canım torunum Lale! Trabzon'un dağları kadar güçlü, denizi kadar özgür ol. Görevleri başarıyla tamamlayacağına inanıyorum!", ms: 4200 },
          { who: 'babaanne', text: "Güzel Lale'm, sana kocaman sevgiler gönderiyorum. Şimdi biraz zekânı kullanalım bakalım!", ms: 3200 }
        ], btn: 'Görevlere Başla ▶'
      },
      tasks: [
        () => ({
          type: 'mapFind', say: "Karadeniz haritasında Trabzon'u bul! İpucu: Trabzon, Giresun ile Rize'nin arasında.",
          okSay: 'Buldun! İşte Trabzon, bordo-mavi kalbimiz! 💙❤️', hint: "Giresun'un sağında, Rize'nin solunda!",
          cities: [{ n: 'Samsun', x: 40, y: 128, show: true }, { n: 'Ordu', x: 120, y: 132 }, { n: 'Giresun', x: 185, y: 126, show: true }, { n: 'Trabzon', x: 250, y: 120, ok: true }, { n: 'Rize', x: 310, y: 118, show: true }, { n: 'Artvin', x: 362, y: 112 }]
        }),
        () => {
          const a = aRnd(3, 6), b = aRnd(2, 5), c1 = aRnd(14, 24), d1 = aRnd(5, 9), cups = aRnd(4, 7), per = aRnd(2, 4);
          return {
            type: 'series', say: 'Çay bahçesindeyiz! Babaanne çayları hazırlıyor. Problemleri çöz!',
            items: [
              { say: `Bir masada ${a} bardak çay, diğerinde ${b} bardak çay var. Toplam kaç bardak?`, visual: `🫖 ${'🍵'.repeat(a)} + ${'🍵'.repeat(b)}`, vclass: 'q', options: numOpts(a + b, 3, [1, 2, 3]), hint: 'İpucu: Bardakları tek tek say.' },
              { say: `Çay bahçesinde ${c1} kişi vardı. ${d1} kişi eve gitti. Kaç kişi kaldı?`, visual: `${c1} − ${d1} = <span class="qmark">?</span>`, options: numOpts(c1 - d1, 3, [1, 2, 10]), hint: "İpucu: 'Gitti' demek çıkarma yapacağız." },
              { say: `${cups} masanın her birinde ${per} simit var. Toplam kaç simit?`, visual: `${cups} × ${per} = <span class="qmark">?</span> 🥯`, options: numOpts(cups * per, 3, [per, 1, 2]), hint: `İpucu: ${per} + ${per} + ... şeklinde ${cups} kez topla.` }
            ]
          };
        },
        {
          type: 'hidden', say: 'Deden çay bahçesine 5 bordo-mavi yıldız sakladı. Hepsini bul!', decor: ['🌿', '🌿', '🌱', '🍃', '🫖', '🌳'], sceneCls: 'teagarden',
          items: [{ html: SVG.star(TS_BORDO), name: 'bordo' }, { html: SVG.star(TS_MAVI), name: 'mavi' }, { html: SVG.star(TS_BORDO), name: 'bordo' }, { html: SVG.star(TS_MAVI), name: 'mavi' }, { html: SVG.star(TS_BORDO), name: 'bordo' }]
        },
        () => ({ type: 'series', say: 'Babaannenin üç parçalı mantık bulmacası!', items: [LQ.pattern(['💙', '❤️', '🐟'], ['ab', 'abb']), LQ.nextNum(), LQ.odd()] })
      ],
      outroScene: { type: 'message', people: ['dede', 'babaanne'], lines: [{ text: "Helal olsun Lale! Karadeniz'in küçük kahramanı! 💙❤️", ms: 2400 }], btn: 'Işığı Al ✨', confetti: true },
      outro: 'Birinci Sevgi Işığı yandı! Trabzon seninle gurur duyuyor!'
    },

    /* ---------- 2. TRABZONSPOR ŞAMPİYONLUK MACERASI ---------- */
    {
      name: 'Bordo-Mavi Şampiyonluk', short: 'Stadyum', emoji: '⚽', theme: 'stadium', guide: '🐻',
      intro: "Hoş geldin Lale! Ben takımın maskotu Ayıcık. Biliyorum ki sen de Ela da Trabzonspor'u çok seviyorsunuz. Şimdi takımımıza yardım etme zamanı!",
      tasks: [
        () => {
          const nums = aShuffle([1, 3, 5, 7, 8, 9, 10, 11]).slice(0, 5).sort((a, b) => a - b);
          return {
            type: 'tapOrder', consume: true, say: 'Formaları küçük numaradan büyüğe doğru sırala!', visual: 'Forma numaralarını küçükten büyüğe diz 👕',
            chips: nums.map((n, i) => ({ id: 'n' + n, html: SVG.jersey(i % 2 ? TS_MAVI : TS_BORDO, n) })), seq: nums.map(n => 'n' + n), slotCls: 'jerseys',
            hint: 'İpucu: En küçük numaradan başla.'
          };
        },
        () => {
          const g1 = aRnd(1, 3), g2 = aRnd(1, 3), fans = aRnd(12, 30), more = aRnd(6, 15);
          return {
            type: 'series', say: 'Skor tabelasını tamamlayalım!',
            items: [
              { say: `İlk yarıda ${g1}, ikinci yarıda ${g2} gol attık. Toplam kaç gol?`, visual: `<span class="score">⚽ ${g1} + ${g2} = <span class="qmark">?</span></span>`, options: numOpts(g1 + g2, 3, [1, 2]) },
              { say: `Tribünde ${fans} bordo bayrak, ${more} mavi bayrak var. Toplam kaç bayrak?`, visual: `🚩 ${fans} + ${more} = <span class="qmark">?</span>`, options: numOpts(fans + more, 3, [10, 1, 2]), hint: 'İpucu: Önce onlukları topla.' },
              { say: 'Bir maç iki devre. Her devre 45 dakika. Maç toplam kaç dakika sürer?', visual: '⏱️ 45 + 45 = <span class="qmark">?</span>', options: numOpts(90, 3, [10, 5]), hint: 'İpucu: 45 + 45 = 40 + 40 + 5 + 5' }
            ]
          };
        },
        { type: 'goalKick', say: 'Topu turuncu dubaların arasından kaleye götür! Yön tuşlarını kullan ya da gitmek istediğin yere dokun.', goalSay: 'GOOOOL! Harikasın Lale!' },
        {
          type: 'dragMatch', say: 'Eksik parçaları yerleştirip bordo-mavi bayrağı tamamla!', visual: 'Bayrak: bordo, mavi, bordo, mavi', tcls: 'flag4', replace: true,
          targets: [{ html: '', key: 'b', style: `background:${TS_BORDO}`, fixed: true, cls: 'pre' }, { html: '?', key: 'm' }, { html: '?', key: 'b' }, { html: '', key: 'm', style: `background:${TS_MAVI}`, fixed: true, cls: 'pre' }],
          items: [{ html: `<span class="stripe" style="background:${TS_MAVI}"></span>`, key: 'm' }, { html: `<span class="stripe" style="background:${TS_BORDO}"></span>`, key: 'b' }],
          onPlace: (tg, d) => { tg.style.background = d.dataset.key === 'b' ? TS_BORDO : TS_MAVI; tg.innerHTML = '⚽'; },
          hint: 'İpucu: Renkler sırayla değişiyor.'
        },
        () => ({
          type: 'series', say: 'Üç soruluk futbol mantık görevi!',
          items: [
            { say: 'Bir futbol takımında sahada kaç oyuncu olur?', visual: '⚽🏟️', options: numOpts(11, 3, [1, 2]), hint: 'İpucu: 10’dan bir fazla.' },
            { say: 'Lale 3 gol, Ela 2 gol attı. İkisi birlikte kaç gol attı?', visual: '⚽⚽⚽ + ⚽⚽', options: numOpts(5, 3, [1, 2]) },
            Object.assign(LQ.pattern(['❤️', '💙', '⚽'], ['abc', 'aab']), { say: 'Tribündeki tezahürat örüntüsünü tamamla!' })
          ]
        })
      ],
      outro: "Trabzonspor'un küçük yıldızı Lale, ikinci Sevgi Işığı'nı kazandı!"
    },

    /* ---------- 3. İSKOÇYA'DAKİ ANNEANNEYE YOLCULUK ---------- */
    {
      name: "İskoçya'da Anneanne", short: 'İskoçya', emoji: '🏰', theme: 'scotland', guide: '🦄',
      intro: "Sihirli bir uçakla İskoçya'ya, anneannene gidiyoruz!",
      introScene: [
        { type: 'plane', from: 'Trabzon', to: 'İskoçya', say: "Uçuyoruz! Trabzon'dan İskoçya'ya! ✈️" },
        { type: 'message', people: ['anneanne'], lines: [
          { who: 'anneanne', text: 'Hello my lovely Lale! Welcome to Scotland!', lang: 'en-GB', ms: 2800 },
          { who: 'anneanne', text: 'Canım Lale, seni çok seviyorum! Sana birkaç küçük sürpriz hazırladım.', ms: 3000 }
        ], btn: 'Görevlere Başla ▶' }
      ],
      tasks: [
        {
          type: 'dragMatch', say: 'İngilizce kelimeleri resimleriyle eşleştir! (cat, star, heart, castle, family)', tcls: 'pics', icls: 'words',
          targets: [{ html: '🐱', key: 'cat' }, { html: '⭐', key: 'star' }, { html: '❤️', key: 'heart' }, { html: '🏰', key: 'castle' }, { html: '👨‍👩‍👧‍👧', key: 'family' }],
          items: ['cat', 'star', 'heart', 'castle', 'family'].map(w => ({ html: w, key: w })),
          onPlace: (tg, d, n, x) => x.speak(d.dataset.key, { lang: 'en-GB' }),
          hint: 'İpucu: cat = kedi, star = yıldız, heart = kalp, castle = şato, family = aile'
        },
        { type: 'maze', say: "Edinburgh Şatosu'na ulaşmak için labirentten geç!", goal: '🏰' },
        { type: 'puzzle', src: 'scotflag', cols: 2, rows: 2, say: 'İskoçya bayrağını tamamla! İki parçaya dokunarak yerlerini değiştir.', okSay: 'Mavi zemin üzerinde beyaz çarpı: İskoçya bayrağı!' },
        { type: 'memory', say: 'Anneannenin hazırladığı hafıza kartlarını eşleştir!', pairs: 6, symbols: ['🏰', '🐑', '🦄', '🫖', '🌈', '🐕', '🎻', '💜'] }
      ],
      outro: "Well done, Lale! I'm so proud of you! Üçüncü Sevgi Işığı yandı!",
      outroVoice: "Well done, Lale! I'm so proud of you!", outroLang: 'en-GB'
    },

    /* ---------- 4. MANIFEST'İN BÜYÜLÜ SAHNESİ ---------- */
    {
      name: "Manifest'in Büyülü Sahnesi", short: 'Konser', emoji: '🎤', theme: 'concert', guide: '🎤',
      intro: "Hoş geldin Lale! Manifest'i çok sevdiğini duyduk! Bugün sen de bu büyülü sahnenin yıldızı olacaksın!",
      tasks: [
        { type: 'simon', say: 'Renkli ritim dizisini hatırla ve tekrar et!', lengths: [3, 4, 5] },
        () => {
          const cols = { p: ['#ff6fa8', 'Pembe'], m: ['#9b6bff', 'Mor'], b: ['#4fb3ff', 'Mavi'] };
          const pat = aPick([['p', 'm', 'b'], ['p', 'p', 'm'], ['b', 'm', 'm'], ['m', 'b', 'p']]);
          const pre = [...pat, ...pat], seq = [...pat];
          const lamp = id => SVG.lamp(cols[id][0], true);
          return { type: 'tapOrder', say: 'Sahne ışıkları bir sırayla yanıyor. Sırayı devam ettir!', visual: 'Işık sırasını tamamla 💡', prefill: pre.map(lamp), seq, chips: Object.keys(cols).map(id => ({ id, html: lamp(id) })), slotCls: 'lights8', tone: { p: 523, m: 659, b: 784 }, hint: 'İpucu: İlk üç ışığın sırası tekrar ediyor.' };
        },
        {
          type: 'dragMatch', say: 'Notaları sesine göre portedeki doğru yere sürükle! Do en alçak, Fa en yüksek.', tcls: 'staff', replace: true,
          targets: [['Do', 0], ['Re', 1], ['Mi', 2], ['Fa', 3]].map(([n, i]) => ({ html: `<small>${n}</small>`, key: n, style: `margin-top:${(3 - i) * 22}px` })),
          items: [['Do', '#ff6fa8'], ['Re', '#ffc93c'], ['Mi', '#3fcf86'], ['Fa', '#4fb3ff']].map(([n, c]) => ({ html: SVG.note(c, n), key: n })),
          onPlace: (tg, d) => AdvAudio.note({ Do: 523, Re: 587, Mi: 659, Fa: 698 }[d.dataset.key], .5, 'triangle', .07),
          hint: 'İpucu: Her notanın üzerinde adı yazıyor.'
        },
        { type: 'stampFill', say: 'Manifest hayran afişini yıldızlar ve kalplerle süsle! Her parlayan yuvaya dokun.', title: 'MANIFEST', sub: '❤️ LALE ❤️', stamps: ['⭐', '💖', '💜', '✨'], spots: [[8, 10], [80, 8], [6, 70], [84, 72], [44, 82], [26, 40], [66, 42]] },
        { type: 'rhythm', say: 'Ritim oyunu! Notalar çizgiye gelince aynı renkteki butona dokun.', need: 10 }
      ],
      outroScene: { type: 'banner', text: 'LALE, SEN BİR YILDIZSIN! 🌟', sub: '🎤 🎶 💜' },
      outro: 'Dördüncü Sevgi Işığı yandı! Sahne seninle parladı!'
    },

    /* ---------- 5. NICOLE VE OĞUZHAN'IN SEVGİ ŞATOSU ---------- */
    {
      name: 'Nicole ve Oğuzhan’ın Şatosu', short: 'Sevgi Şatosu', emoji: '💖', theme: 'castle', guide: '🕊️',
      intro: 'Sevgi Şatosu’na ulaştın Lale! Kapıda dört ışık parlıyor. Beşinci ışık için son bulmacaları çözmelisin.',
      introScene: { type: 'doorLights', say: 'Dört ışık yerinde! Beşinci ışık seni bekliyor. ✨' },
      tasks: [
        { type: 'puzzle', src: 'parents', cols: 3, rows: 3, say: 'Annen Nicole ve baban Oğuzhan’ın fotoğrafını tamamla! İki parçaya dokunarak yerlerini değiştir.', okSay: 'İşte annen Nicole ve baban Oğuzhan! 💖' },
        {
          type: 'dragMatch', say: 'Her sevgi sembolünü kendi yerine götür: Trabzon, İskoçya ve evimiz!', tcls: 'places',
          targets: [{ html: '<b>Trabzon</b>', key: 'tr' }, { html: '<b>İskoçya</b>', key: 'sc' }, { html: '<b>Evimiz</b>', key: 'ev' }],
          items: [{ html: SVG.ball(TS_BORDO, TS_MAVI), key: 'tr' }, { html: '🦄', key: 'sc' }, { html: '🏡', key: 'ev' }],
          hint: 'İpucu: Bordo-mavi top Trabzon’un, tek boynuzlu at İskoçya’nın, ev de bizim!'
        },
        () => ({ type: 'word', say: 'Ailenin mesajlarındaki eksik kelimeleri harflerle tamamla!', items: aShuffle([{ sentence: 'Ailemizin ____ her zaman bizimle!', word: 'SEVGİ', clue: '💖' }, { sentence: 'Biz kocaman bir ____ yiz!', word: 'AİLE', clue: '👨‍👩‍👧‍👧' }, { sentence: 'Seni bütün ____ ile seviyoruz!', word: 'KALP', clue: '❤️' }]).slice(0, 2) }),
        { type: 'goldHeart', say: 'Son olarak büyük altın kalbe dokun!', okSay: 'Beşinci Sevgi Işığı yandı! Kapı açılıyor!' }
      ],
      outro: 'Pusulanın beş ışığı da yandı! Şimdi kapıyı aç, annen ve baban seni bekliyor!'
    }
  ]
};
