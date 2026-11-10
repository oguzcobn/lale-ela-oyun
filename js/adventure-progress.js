/* Sevgi Yolculuğu — ilerleme kaydı (her çocuk ayrı, localStorage) */
const AdvProgress = (() => {
  const KEY = 'sevgi_yolculugu_v1';
  const blank = () => ({ stars: [false, false, false, false, false], cur: null, done: false, plays: 0, justUnlocked: null });
  function all() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function saveAll(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function get(k) {
    const p = Object.assign(blank(), all()[k] || {});
    if (!Array.isArray(p.stars) || p.stars.length !== 5) p.stars = blank().stars;
    return p;
  }
  function set(k, p) { const a = all(); a[k] = p; saveAll(a); }
  const count = k => get(k).stars.filter(Boolean).length;
  function award(k, lv) {
    const p = get(k), was = p.stars[lv];
    p.stars[lv] = true; p.cur = null;
    if (!was && lv < 4) p.justUnlocked = lv + 1;
    set(k, p); return !was;
  }
  function setCur(k, lv, task) { const p = get(k); p.cur = { level: lv, task }; set(k, p); }
  function markDone(k) { const p = get(k); if (!p.done) p.plays = (p.plays || 0) + 1; p.done = true; set(k, p); }
  function reset(k) { const p = get(k); const n = blank(); n.done = p.done; n.plays = p.plays; set(k, n); }
  function unlocked(k, lv) { const p = get(k); return lv === 0 || p.stars[lv - 1] || p.stars[lv]; }
  function clearJust(k) { const p = get(k); p.justUnlocked = null; set(k, p); }
  function flag(name, v) {
    const a = all(); a.flags = a.flags || {};
    if (v === undefined) return !!a.flags[name];
    a.flags[name] = v; saveAll(a);
  }
  return { get, set, count, award, setCur, markDone, reset, unlocked, clearJust, flag };
})();
