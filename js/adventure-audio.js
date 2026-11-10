/* Sevgi Yolculuğu — konuşma (Web Speech / mp3) ve özgün bölüm müzikleri (Web Audio) */
const AdvAudio = (() => {
  const store = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const keep = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let musicOn = store('adv_music', true);
  const isMuted = () => (typeof muted !== 'undefined' && muted);
  const actx = () => (typeof ac === 'function' ? ac() : null);

  /* ---------- konuşma ---------- */
  let audioEl = null, queue = [], speaking = false;
  const hasTTS = 'speechSynthesis' in window;
  function voiceFor(lang) {
    if (!hasTTS) return null;
    const vs = speechSynthesis.getVoices(), p = lang.slice(0, 2).toLowerCase();
    return vs.find(v => v.lang && v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase()) ||
           vs.find(v => v.lang && v.lang.toLowerCase().startsWith(p)) || null;
  }
  if (hasTTS) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch (e) {} }
  const clean = t => String(t).replace(/<[^>]+>/g, ' ').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
  function stopSpeak() {
    queue = []; speaking = false;
    try { if (audioEl) { audioEl.pause(); audioEl = null; } if (hasTTS) speechSynthesis.cancel(); } catch (e) {}
  }
  /* speak(text, {lang, queue}) — kayıtlı mp3 varsa onu, yoksa cihaz sesini kullanır */
  function speak(text, opt) {
    opt = opt || {};
    if (!text || isMuted()) return;
    if (!opt.queue) stopSpeak();
    queue.push({ text, lang: opt.lang || 'tr-TR' });
    if (!speaking) next();
  }
  function next() {
    const it = queue.shift();
    if (!it) { speaking = false; return; }
    speaking = true;
    const file = ADV_SOUNDS.voices[it.text];
    if (file) {
      try { audioEl = new Audio(file); audioEl.onended = next; audioEl.onerror = () => tts(it); audioEl.play().catch(() => tts(it)); return; } catch (e) {}
    }
    tts(it);
  }
  function tts(it) {
    const t = clean(it.text);
    if (!hasTTS || !t) { setTimeout(next, 50); return; }
    try {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = it.lang; const v = voiceFor(it.lang); if (v) u.voice = v;
      u.rate = it.lang.startsWith('en') ? .92 : .96; u.pitch = 1.12;
      u.onend = next; u.onerror = next;
      speechSynthesis.speak(u);
    } catch (e) { setTimeout(next, 50); }
  }

  /* ---------- yumuşak nota ---------- */
  function note(f, dur, type, vol, when) {
    if (isMuted()) return;
    const a = actx(); if (!a) return;
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || .05, t + .03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .05);
  }
  function noise(dur, vol, hp, when) {
    if (isMuted()) return;
    const a = actx(); if (!a) return;
    const t = a.currentTime + (when || 0);
    const b = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = a.createBufferSource(); s.buffer = b;
    const f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 3000;
    const g = a.createGain(); g.gain.value = vol || .03;
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
  const kick = (when) => { const a = actx(); if (!a || isMuted()) return; const t = a.currentTime + (when || 0); const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + .15); g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .18); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + .2); };
  const chirp = () => { const f = 2200 + Math.random() * 1400; note(f, .08, 'sine', .018); note(f * 1.2, .07, 'sine', .015, .09); };
  const hz = (root, semi) => root * Math.pow(2, semi / 12);

  /* ---------- bölüm müzikleri (özgün, sentezlenmiş) ---------- */
  const THEMES = {
    trabzon:  { root: 330, scale: [0, 2, 4, 7, 9], ms: 430, wave: 'triangle', vol: .035, birds: true, waves: true },
    stadium:  { root: 392, scale: [0, 2, 4, 5, 7, 9], ms: 300, wave: 'square', vol: .018, beat: 'clap' },
    scotland: { root: 294, scale: [0, 2, 5, 7, 9], ms: 480, wave: 'triangle', vol: .035, drone: true },
    concert:  { root: 440, scale: [0, 3, 5, 7, 10], ms: 260, wave: 'sawtooth', vol: .014, beat: 'dance' },
    castle:   { root: 523, scale: [0, 4, 7, 11, 14], ms: 520, wave: 'sine', vol: .04, bells: true },
    map:      { root: 392, scale: [0, 2, 4, 7, 9], ms: 500, wave: 'sine', vol: .035 },
    final:    { root: 523, scale: [0, 2, 4, 5, 7, 9, 11], ms: 380, wave: 'triangle', vol: .04, bells: true }
  };
  let timer = null, musicEl = null, curTheme = null, paused = false;
  function startMusic(theme) {
    if (curTheme === theme && (timer || musicEl)) return;
    stopMusic(); curTheme = theme;
    if (!musicOn) return;
    const file = ADV_SOUNDS.music[theme];
    if (file) { try { musicEl = new Audio(file); musicEl.loop = true; musicEl.volume = .35; if (!isMuted()) musicEl.play().catch(() => {}); return; } catch (e) {} }
    const T = THEMES[theme] || THEMES.map;
    const mel = []; for (let i = 0; i < 16; i++) mel.push(Math.random() < .2 ? null : Math.floor(Math.random() * T.scale.length) + (Math.random() < .25 ? T.scale.length : 0));
    let step = 0;
    timer = setInterval(() => {
      if (paused || isMuted()) { step++; return; }
      const i = mel[step % 16];
      if (i !== null) { const n = T.scale.length; note(hz(T.root, T.scale[i % n] + 12 * Math.floor(i / n)), T.ms / 1000 * 1.8, T.wave, T.vol); }
      if (step % 4 === 0) note(hz(T.root / 2, T.scale[[0, 3, 4, 0][Math.floor(step / 4) % 4] % T.scale.length]), T.ms / 1000 * 3.6, 'sine', T.vol * .9);
      if (T.drone && step % 8 === 0) { note(T.root / 4, T.ms / 1000 * 8, 'sawtooth', .008); note(T.root / 2 * 1.5, T.ms / 1000 * 8, 'sine', .012); }
      if (T.beat === 'clap') { if (step % 2 === 0) kick(); if (step % 4 === 2) noise(.12, .04, 1500); }
      if (T.beat === 'dance') { kick(); if (step % 2 === 1) noise(.05, .025, 6000); }
      if (T.birds && Math.random() < .1) chirp();
      if (T.waves && step % 16 === 0) noise(1.6, .012, 400);
      if (T.bells && step % 8 === 4) note(hz(T.root * 2, T.scale[step % T.scale.length]), 1.2, 'sine', .02);
      step++;
    }, T.ms);
  }
  function stopMusic() { clearInterval(timer); timer = null; if (musicEl) { try { musicEl.pause(); } catch (e) {} musicEl = null; } curTheme = null; }
  function pauseMusic(v) { paused = v; if (musicEl) { try { v ? musicEl.pause() : musicEl.play().catch(() => {}); } catch (e) {} } }
  function toggleMusic(theme) { musicOn = !musicOn; keep('adv_music', musicOn); if (musicOn) startMusic(theme || curTheme || 'map'); else stopMusic(); return musicOn; }
  function refresh() { if (isMuted()) { stopSpeak(); if (musicEl) try { musicEl.pause(); } catch (e) {} } else if (musicEl) musicEl.play().catch(() => {}); }

  /* kutlama melodisi */
  function celebrate() {
    const m = [523, 659, 784, 1047, 988, 784, 880, 1047, 1175, 1319];
    m.forEach((f, i) => { note(f, .5, 'triangle', .06, i * .2); note(f / 2, .5, 'sine', .03, i * .2); });
    [0, .4, .8, 1.2, 1.6].forEach(t => note(2093, .8, 'sine', .015, t + 1));
  }
  const softBoop = () => { note(330, .18, 'sine', .05); note(392, .22, 'sine', .04, .12); };

  return { speak, stopSpeak, startMusic, stopMusic, pauseMusic, toggleMusic, refresh, musicOn: () => musicOn, note, kick, noise, celebrate, softBoop, hz };
})();
