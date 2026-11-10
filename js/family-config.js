/* =====================================================================
   AİLE AYARLARI — Lale & Ela: Sevgi Yolculuğu
   İsimleri, fotoğrafları, mesajları ve ses dosyalarını buradan
   değiştirebilirsiniz. Fotoğraf yoksa oyun sevimli bir karakter gösterir.
   ===================================================================== */
const FAMILY = {
  anne:     { name: 'Nicole',  call: 'Annen Nicole',  sign: 'Annen Nicole',  photo: 'assets/family/anne.webp' },
  baba:     { name: 'Oğuzhan', call: 'Baban Oğuzhan', sign: 'Baban Oğuzhan', photo: 'assets/family/baba.webp' },
  parents:  { photo: 'assets/family/anne-baba.webp' },           // yapboz için ikisinin birlikte fotoğrafı
  lale:     { name: 'Lale', age: 8, photo: 'assets/family/lale.webp' },
  ela:      { name: 'Ela',  age: 4, photo: 'assets/family/ela.webp' },
  sisters:  { photo: 'assets/family/lale-ela.webp' },
  // İsteğe bağlı: bu dosyaları assets/family/ klasörüne eklerseniz otomatik görünür.
  dede:     { name: 'Deden',      where: 'Trabzon',  photo: 'assets/family/dede.webp' },
  babaanne: { name: 'Babaannen',  where: 'Trabzon',  photo: 'assets/family/babaanne.webp' },
  anneanne: { name: 'Anneannen',  where: 'İskoçya',  photo: 'assets/family/anneanne.webp' }
};

/* Başlangıç mektubu (iki kardeşe birlikte) */
const ADV_LETTER = [
  'Canımız Lale ve Ela,',
  'Anneniz Nicole ve babanız Oğuzhan olarak size çok özel bir sürpriz hazırladık!',
  "Bize ulaşmak için Sevgi Pusulası'nın beş ışığını yakmanız gerekiyor.",
  "Yolculuğunuzda Trabzon'daki dedeniz ve babaanneniz, İskoçya'daki anneanneniz ve sizi seven bütün dostlarınız yanınızda olacak.",
  'Unutmayın, hangi ülkede olursak olalım, ailemizin sevgisi her zaman bizimle!',
  'Sizi çok seviyoruz!',
  'Nicole & Oğuzhan ❤️'
];

/* Final mesajları */
const ADV_FINAL = {
  lale: {
    big: 'BAŞARDIN LALE! 🌟',
    sub: "Sevgi Pusulası'nın beş ışığını yaktın ve annene, babana ulaştın!",
    lines: [
      'Canımız Lale,',
      "Trabzon'un dağlarından İskoçya'nın şatolarına, futbol sahasından müzik sahnesine kadar ne güzel bir yolculuk yaptın!",
      'Seninle gurur duyuyoruz.',
      'Her zaman yanında olacağız.',
      'Seni çok seviyoruz!',
      'Annen Nicole ve Baban Oğuzhan ❤️'
    ]
  },
  ela: {
    big: 'AFERİN ELA! 💖',
    sub: 'Anne ve babana ulaştın!',
    lines: [
      'Canımız Ela!',
      'Deden, babaannen ve anneannen sana kocaman sevgiler gönderiyor!',
      'Sen çok güzel oyunlar oynadın ve bütün kalpleri topladın.',
      'Aferin küçük yıldızımız!',
      'Seni çok seviyoruz!',
      'Annen Nicole ve Baban Oğuzhan ❤️'
    ],
    banner: 'SENİ ÇOK SEVİYORUZ! ❤️'
  },
  forever: 'AİLEMİZİN SEVGİSİ SONSUZA KADAR!'
};

/* İki kardeş de bitirince açılan ortak final */
const ADV_SISTERS = {
  title: 'LALE & ELA – AİLEMİZİN İKİ YILDIZI!',
  lines: [
    'Canımız Lale ve Ela,',
    'Siz bizim hayatımızdaki en güzel iki hediyesiniz.',
    "Trabzon'daki dedeniz ve babaanneniz, İskoçya'daki anneanneniz, anneniz Nicole ve babanız Oğuzhan sizi çok seviyor.",
    "İster Trabzon'da, ister İskoçya'da, ister dünyanın başka bir köşesinde olalım...",
    'AİLEMİZİN SEVGİSİ HER ZAMAN BİZİ BİR ARADA TUTAR!',
    'Sizi dünyalar kadar seviyoruz! ❤️'
  ],
  footer: 'LALE ❤️ ELA ❤️ NICOLE ❤️ OĞUZHAN'
};

/* =====================================================================
   SES DOSYALARI (isteğe bağlı)
   Kendi sesinizi kaydedip assets/sounds/ klasörüne koyun, sonra
   oyundaki cümlenin AYNISINI anahtar olarak yazın. Örnek:
     'Elaaa! Deden ve babaannen sana kocaman öpücük gönderiyor!': 'assets/sounds/ela-dede.mp3',
   Kayıt bulunmayan cümleler cihazın Türkçe sesiyle okunur.
   ===================================================================== */
const ADV_SOUNDS = {
  voices: {
  },
  // Bölüm müziği yerine kendi dosyanızı çalmak için (trabzon, stadium, scotland, concert, castle, map, final):
  music: {
  }
};
