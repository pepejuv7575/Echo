/* ====== Harmonica Facile — application principale ====== */
'use strict';

/* ---------- Utilitaires ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const todayStr = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const tabClass = t => (String(t).startsWith('-') ? 'draw' : 'blow');
const chip = (t, extra = '') => `<span class="tabchip ${tabClass(t)} ${extra}">${esc(t)}</span>`;

/* ---------- État sauvegardé ---------- */
const DEFAULT_STATE = {
  xp: 0, streak: 0, lastDay: null, todayXp: 0, todayDate: null, goal: 60,
  done: {}, stars: {}, badges: {}, songsPlayed: {}, best: {}, weak: {}, notesOk: 0,
  dailyDone: null, name: '',
  settings: { key: 'C', english: false, sens: 0.012, labels: true },
};
let S;
function loadState() {
  try { S = Object.assign({}, DEFAULT_STATE, JSON.parse(localStorage.getItem('harmo') || '{}')); }
  catch (e) { S = Object.assign({}, DEFAULT_STATE); }
  S.settings = Object.assign({}, DEFAULT_STATE.settings, S.settings || {});
  if (S.todayDate !== todayStr()) { S.todayXp = 0; S.todayDate = todayStr(); }
  Snd.setSensitivity(S.settings.sens);
}
function save() { try { localStorage.setItem('harmo', JSON.stringify(S)); } catch (e) { } }
const keyOff = () => (KEYS[S.settings.key] || KEYS.C).off;

/* ---------- Progression ---------- */
const levelOf = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
const levelXp = lv => 40 * (lv - 1) * (lv - 1);
const LEVEL_NAMES = ['Débutant', 'Apprenti', 'Souffleur', 'Mélodiste', 'Musicien', 'Bluesman', 'Virtuose', 'Maître', 'Légende'];
const levelName = lv => LEVEL_NAMES[Math.min(LEVEL_NAMES.length - 1, lv - 1)];

function addXp(n) {
  const before = levelOf(S.xp);
  S.xp += n;
  const t = todayStr();
  if (S.todayDate !== t) { S.todayXp = 0; S.todayDate = t; }
  S.todayXp += n;
  if (S.lastDay !== t) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak = (S.lastDay === todayStr(y)) ? S.streak + 1 : 1;
    S.lastDay = t;
  }
  if (S.streak >= 3) award('streak3');
  if (S.streak >= 7) award('streak7');
  const after = levelOf(S.xp);
  if (after > before) {
    toast(`⬆️ Niveau ${after} : ${levelName(after)} !`, 'level');
    if (after >= 5) award('level5');
  }
  save();
  updateHeader();
}

function award(id) {
  if (S.badges[id]) return;
  const b = BADGES.find(x => x.id === id);
  if (!b) return;
  S.badges[id] = todayStr();
  save();
  setTimeout(() => { toast(`${b.emoji} Badge débloqué : ${b.name}`, 'badge'); Snd.blip('win'); }, 600);
}

function noteWeak(tab, n = 1) { S.weak[tab] = (S.weak[tab] || 0) + n; }
function noteStrong(tab) { if (S.weak[tab]) S.weak[tab] = Math.max(0, S.weak[tab] - 0.25); }

/* ---------- Interface commune ---------- */
function toast(msg, cls = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + cls;
  t.innerHTML = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3100);
}

function confetti() {
  const c = document.createElement('canvas');
  c.className = 'confetti';
  c.width = innerWidth; c.height = innerHeight;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  const cols = ['#FFB020', '#4EE6C8', '#FF6B9A', '#8B7CFF', '#fff'];
  const P = Array.from({ length: 120 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5,
    vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4, r: 4 + Math.random() * 5,
    a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, col: pick(cols),
  }));
  let f = 0;
  (function step() {
    g.clearRect(0, 0, c.width, c.height);
    P.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.a += p.va; p.vy += 0.05;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.col;
      g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore();
    });
    if (++f < 170) requestAnimationFrame(step); else c.remove();
  })();
}

function updateHeader() {
  const lv = levelOf(S.xp);
  const el = $('#hdr');
  if (!el) return;
  el.innerHTML = `
    <div class="hstat" title="Série">🔥 <b>${S.streak}</b></div>
    <div class="hstat" title="XP">⭐ <b>${S.xp}</b></div>
    <div class="hstat lvl">Niv. <b>${lv}</b></div>
    <button class="hbtn" id="hdrTuner" aria-label="Accordeur">🎚️</button>`;
  $('#hdrTuner').onclick = () => go(screenTuner);
}

/* ---------- Navigation ---------- */
const App = { stack: [], cleanup: null };
function go(fn, ...args) { App.stack.push({ fn, args }); render(); }
function replace(fn, ...args) { App.stack.pop(); go(fn, ...args); }
function tab(fn) { App.stack = [{ fn, args: [] }]; render(); }
function back() {
  if (App.stack.length > 1) { App.stack.pop(); render(); return true; }
  return false;
}
window.onAndroidBack = () => back();
window.onAndroidPause = () => { Snd.pauseMic(); };

function render() {
  if (App.cleanup) { try { App.cleanup(); } catch (e) { console.error(e); } }
  App.cleanup = null;
  Snd.stopListening();
  const top = App.stack[App.stack.length - 1];
  const root = $('#screen');
  root.innerHTML = '';
  root.scrollTop = 0;
  const el = document.createElement('div');
  el.className = 'screen-in';
  root.appendChild(el);
  App.cleanup = top.fn(el, ...top.args) || null;
  const nav = top.fn.navTab || (App.stack[0].fn.navTab);
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === nav));
  $('#app').classList.toggle('fullscreen', !!top.fn.full);
}

function topbar(title, opts = {}) {
  return `<div class="topbar"><button class="back" data-back>‹</button><h2>${title}</h2>${opts.right || '<span></span>'}</div>`;
}
function bindBack(el) { $$('[data-back]', el).forEach(b => b.onclick = () => back()); }

/* ---------- Composant : harmonica visuel ---------- */
function tabsForMidi(m, key, withBends) {
  const out = [];
  for (let h = 1; h <= 10; h++) {
    if (BLOW[h - 1] + key === m) out.push({ hole: h, draw: false, bend: 0, tab: String(h) });
    if (DRAW[h - 1] + key === m) out.push({ hole: h, draw: true, bend: 0, tab: '-' + h });
    if (withBends && [1, 2, 3, 4, 6].includes(h) && DRAW[h - 1] - 1 + key === m && DRAW[h - 1] - 1 > BLOW[h - 1])
      out.push({ hole: h, draw: true, bend: 1, tab: '-' + h + "'" });
  }
  return out;
}

function Harp(container, opts = {}) {
  const key = keyOff();
  const en = S.settings.english;
  const holes = [];
  let html = '<div class="harp"><div class="harp-cover top"></div><div class="harp-holes">';
  for (let h = 1; h <= 10; h++) {
    html += `<div class="hole" data-h="${h}">
      <span class="hn bn">${S.settings.labels ? midiShort(BLOW[h - 1] + key, en) : ''}</span>
      <span class="hnum">${h}</span>
      <span class="hn dn">${S.settings.labels ? midiShort(DRAW[h - 1] + key, en) : ''}</span>
      <i class="arrow"></i></div>`;
  }
  html += '</div><div class="harp-cover bottom"></div></div>';
  container.innerHTML = html;
  $$('.hole', container).forEach(e => holes.push(e));

  if (opts.tap) {
    holes.forEach(e => {
      e.addEventListener('pointerdown', ev => {
        const r = e.getBoundingClientRect();
        const draw = (ev.clientY - r.top) > r.height / 2;
        const h = +e.dataset.h;
        const m = (draw ? DRAW : BLOW)[h - 1] + key;
        Snd.playNote(m, 0.55);
        e.classList.add(draw ? 'det-draw' : 'det-blow');
        setTimeout(() => e.classList.remove('det-draw', 'det-blow'), 350);
        if (opts.onTap) opts.onTap((draw ? '-' : '') + h, m);
      });
    });
  }

  return {
    clearTargets() { holes.forEach(e => e.classList.remove('tg-blow', 'tg-draw', 'tg-bend', 'mark-blow', 'mark-draw')); },
    setTarget(t) {
      this.clearTargets();
      if (!t) return;
      const p = parseTab(t);
      const e = holes[p.hole - 1];
      e.classList.add(p.draw ? 'tg-draw' : 'tg-blow');
      if (p.bend) e.classList.add('tg-bend');
    },
    mark(tabs) {
      this.clearTargets();
      tabs.forEach(t => { const p = parseTab(t); holes[p.hole - 1].classList.add(p.draw ? 'mark-draw' : 'mark-blow'); });
    },
    setDetected(midi) {
      holes.forEach(e => e.classList.remove('det-blow', 'det-draw'));
      if (midi == null) return;
      tabsForMidi(Math.round(midi), key, true).forEach(c => holes[c.hole - 1].classList.add(c.draw ? 'det-draw' : 'det-blow'));
    },
  };
}

/* ---------- Juge : compare la note jouée à la cible ---------- */
function judge(target, d) {
  const key = keyOff();
  const tm = tabMidi(target, key);
  const tp = parseTab(target);
  if (!d.sound) return { state: 'silence' };
  if (d.midi == null) return { state: 'unclear', msg: "Son pas net 🤔 Joue un seul trou : lèvres en petit « O »." };
  const diff = d.midi - tm;
  if (Math.abs(diff) < 0.5) return { state: 'ok', cents: Math.round(diff * 100) };

  if (tp.bend) {
    const unbent = tm + tp.bend;
    if (Math.abs(d.midi - unbent) < 0.5) return { state: 'close', msg: "Bonne note de départ ! Maintenant fais-la descendre : « i… ou » 👇" };
    if (d.midi < unbent && d.midi > tm) return { state: 'close', msg: 'Ça descend ! Encore un peu… 🎸' };
  }

  const cands = tabsForMidi(Math.round(d.midi), key, false);
  if (!cands.length) {
    if (Math.abs(diff) < 1.5) {
      return {
        state: 'close', msg: diff < 0
          ? "Un peu trop bas : détends la gorge et joue plus doucement."
          : "Un peu trop haut : relâche les lèvres."
      };
    }
    return { state: 'wrong', msg: "Cette note n'est pas dans l'harmonica : tu joues peut-être 2 trous. Resserre les lèvres." };
  }
  cands.sort((a, b) => Math.abs(a.hole - tp.hole) - Math.abs(b.hole - tp.hole));
  const c = cands[0];
  const act = tp.draw ? '<b>aspire ⬇️</b>' : '<b>souffle ⬆️</b>';
  if (c.hole === tp.hole) {
    return { state: 'wrong', played: c.tab, msg: `Bon trou 👍 mais il faut ${tp.draw ? '<b>ASPIRER ⬇️</b>' : '<b>SOUFFLER ⬆️</b>'}` };
  }
  const n = tp.hole - c.hole;
  const dir = n > 0 ? 'la droite ➡️' : 'la gauche ⬅️';
  let msg = `Tu joues ${chip(c.tab)} → glisse de <b>${Math.abs(n)} trou${Math.abs(n) > 1 ? 's' : ''}</b> vers ${dir}`;
  if (c.draw !== tp.draw) msg += ` et ${act}`;
  return { state: 'wrong', played: c.tab, msg };
}

/* ---------- Moteur d'exercice : écoute, juge et corrige ---------- */
function Player(el, opts) {
  const key = keyOff();
  const lines = opts.lines || [opts.seq];
  const items = [];
  lines.forEach((ln, li) => ln.forEach((t, i) => items.push({ t, li, first: i === 0 })));
  const hold = opts.hold || 300;
  const mode = opts.mode || 'learn';

  let idx = 0, holdAcc = 0, lastT = 0, needRelease = false, peakRms = 0;
  let wrongAcc = 0, wrongCounted = false, errors = 0, done = false, muteUntil = 0;
  let releaseWait = 0, silentFor = 0;
  const perNote = {};
  const t0 = performance.now();

  el.innerHTML = `
    <div class="player">
      ${opts.title ? `<div class="ptitle">${opts.title}</div>` : ''}
      ${opts.text ? `<div class="ptext">${opts.text}</div>` : ''}
      <div class="tabline">${items.map((it, i) => `${it.first && it.li > 0 ? '<br class="lb">' : ''}<span class="tok ${tabClass(it.t)}" data-i="${i}">${esc(it.t)}</span>`).join('')}</div>
      <div class="harpbox"></div>
      <div class="pmain">
        <div class="ring">
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="rbg"/><circle cx="50" cy="50" r="44" class="rfg" stroke-dasharray="276.5" stroke-dashoffset="276.5"/></svg>
          <div class="ringin"><div class="rtab"></div><div class="ract"></div></div>
        </div>
        <div class="pdet"><div class="dlabel">J'entends</div><div class="dnote">—</div><div class="dcents"></div></div>
      </div>
      <div class="feedback">Prêt ? Joue la note quand tu veux 🎵</div>
      <div class="pbtns">
        <button class="btn ghost" data-a="listen">🔊 Écouter</button>
        <button class="btn ghost" data-a="note">🎵 La note</button>
        <button class="btn ghost" data-a="skip">⏭ Passer</button>
      </div>
      <div class="micwarn hidden">
        🎤 Micro indisponible. Autorise le micro dans les réglages Android de l'app, ou valide à la main :
        <button class="btn small" data-a="manual">✔ J'ai joué la note</button>
      </div>
    </div>`;

  const harp = Harp($('.harpbox', el));
  const ring = $('.rfg', el);
  const fb = $('.feedback', el);
  const dnote = $('.dnote', el), dcents = $('.dcents', el);

  function setFb(html, cls = '') { fb.className = 'feedback ' + cls; fb.innerHTML = html; }
  function setRing(p) { ring.style.strokeDashoffset = 276.5 * (1 - Math.min(1, p)); }

  function showCurrent() {
    $$('.tok', el).forEach((e, i) => {
      e.classList.toggle('cur', i === idx);
      e.classList.toggle('past', i < idx);
    });
    const cur = $(`.tok[data-i="${idx}"]`, el);
    if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    if (idx >= items.length) return;
    const t = items[idx].t;
    const p = parseTab(t);
    harp.setTarget(t);
    $('.rtab', el).textContent = t;
    $('.rtab', el).className = 'rtab ' + tabClass(t);
    $('.ract', el).innerHTML = (p.draw ? 'Aspire ⬇️' : 'Souffle ⬆️') + (p.bend ? '<br>+ bend' : '');
    setRing(0);
  }

  function success() {
    const t = items[idx].t;
    $(`.tok[data-i="${idx}"]`, el).classList.add(wrongCounted ? 'meh' : 'good');
    if (!wrongCounted) noteStrong(t);
    S.notesOk++;
    if (S.notesOk === 1) award('first_note');
    if (parseTab(t).bend) award('bend');
    Snd.blip('ok');
    const prevM = tabMidi(t, key);
    idx++;
    holdAcc = 0; wrongAcc = 0; wrongCounted = false; releaseWait = 0;
    if (idx >= items.length) return finish(false);
    needRelease = tabMidi(items[idx].t, key) === prevM;
    setFb(pick(['Bravo ! 👏', 'Parfait ! ✨', 'Super ! 🎉', 'Oui ! 💪', 'Joli ! 🎶']) + (needRelease ? '<br><small>Même note : coupe le souffle (« ta ») puis rejoue.</small>' : ''), 'ok');
    showCurrent();
  }

  function finish(aborted) {
    if (done) return;
    done = true;
    Snd.stopListening();
    harp.setTarget(null);
    save();
    const secs = (performance.now() - t0) / 1000;
    if (opts.onDone) opts.onDone({ errors, perNote, secs, total: items.length, aborted });
  }

  function countError(t) {
    errors++;
    perNote[t] = (perNote[t] || 0) + 1;
    noteWeak(t);
    wrongCounted = true;
    $(`.tok[data-i="${idx}"]`, el).classList.add('err');
    if (mode === 'test') Snd.blip('bad');
  }

  function onFrame(d) {
    if (done) return;
    const dt = lastT ? Math.min(100, d.t - lastT) : 30;
    lastT = d.t;
    if (d.t < muteUntil) return;

    // affichage de ce qu'on entend
    if (d.midi != null) {
      const m = Math.round(d.midi);
      const tabs = tabsForMidi(m, key, true).map(c => c.tab);
      dnote.innerHTML = `${midiName(m, S.settings.english)} ${tabs.length ? tabs.map(t => chip(t, 'mini')).join('') : ''}`;
      dcents.textContent = (d.cents > 0 ? '+' : '') + d.cents + ' cents';
      harp.setDetected(d.midi);
    } else {
      dnote.textContent = d.sound ? '~' : '—';
      dcents.textContent = '';
      harp.setDetected(null);
    }

    const target = items[idx].t;
    const r = judge(target, d);

    if (needRelease) {
      if (r.state !== 'ok' || d.rms < peakRms * 0.45) { silentFor += dt; if (silentFor > 40) { needRelease = false; silentFor = 0; } }
      else { silentFor = 0; releaseWait += dt; if (releaseWait > 1200) setFb('Coupe le souffle une seconde entre les deux notes (dis « ta ») 👅', 'info'); return; }
    }

    if (r.state === 'ok') {
      holdAcc += dt;
      peakRms = Math.max(peakRms * 0.98, d.rms);
      wrongAcc = 0;
      setRing(holdAcc / hold);
      const c = r.cents;
      let msg = holdAcc < hold ? 'C\'est ça ! Tiens la note… ⏳' : '';
      if (Math.abs(c) > 30) msg += c > 0 ? '<br><small>Juste, un peu haut</small>' : '<br><small>Juste, un peu bas</small>';
      setFb(msg, 'ok');
      if (holdAcc >= hold) success();
    } else {
      holdAcc = Math.max(0, holdAcc - dt * 1.5);
      setRing(holdAcc / hold);
      if (r.state === 'wrong') {
        wrongAcc += dt;
        if (wrongAcc > 120) setFb(r.msg, 'bad');
        if (wrongAcc > 400 && !wrongCounted) countError(target);
      } else if (r.state === 'close' || r.state === 'unclear') {
        wrongAcc = Math.max(0, wrongAcc - dt);
        setFb(r.msg, 'info');
      } else {
        wrongAcc = Math.max(0, wrongAcc - dt);
      }
    }
  }

  function micFail() {
    $('.micwarn', el).classList.remove('hidden');
    setFb('Le micro ne répond pas 🎤', 'bad');
  }

  el.onclick = e => {
    const b = e.target.closest('[data-a]');
    if (!b || done) return;
    const a = b.dataset.a;
    if (a === 'listen') {
      const rest = items.slice(idx, idx + 12).map(it => tabMidi(it.t, key));
      const dur = Snd.playSeq(rest, 0.55, 0.48);
      muteUntil = performance.now() + dur * 1000 + 300;
      let k = 0;
      const iv = setInterval(() => {
        $$('.tok', el).forEach(x => x.classList.remove('play'));
        const tk = $(`.tok[data-i="${idx + k}"]`, el);
        if (k >= rest.length || !tk) { clearInterval(iv); return; }
        tk.classList.add('play'); k++;
      }, 550);
    } else if (a === 'note') {
      Snd.playNote(tabMidi(items[idx].t, key), 0.8);
      muteUntil = performance.now() + 1100;
    } else if (a === 'skip') {
      if (!wrongCounted) countError(items[idx].t);
      wrongCounted = true;
      success();
    } else if (a === 'manual') {
      success();
    }
  };

  showCurrent();
  Snd.listen(onFrame).catch(err => { console.warn(err); micFail(); });

  return () => { done = true; Snd.stopListening(); };
}

function starsFor(errors, total) {
  const ratio = errors / Math.max(1, total);
  if (errors <= 1 && ratio <= 0.1) return 3;
  if (ratio <= 0.25) return 2;
  if (ratio <= 0.5) return 1;
  return 0;
}
const starStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);

function weakAdvice(perNote) {
  const list = Object.entries(perNote).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (!list.length) return '<p class="adv good">Aucune erreur : ton souffle est précis ! 💎</p>';
  return '<div class="adv"><b>À travailler :</b>' + list.map(([t]) => {
    const p = parseTab(t);
    let tip;
    if (p.bend) tip = "Le bend demande de baisser la langue (« i… ou »). Persévère !";
    else if (p.draw && p.hole <= 3) tip = "Aspiration grave : gorge ouverte, aspire doucement et profondément.";
    else if (!p.draw && p.hole >= 8) tip = "Aigus : souffle très doucement, lèvres serrées.";
    else if (p.hole === 7) tip = "Trou 7 : attention, l'aspiré (Si) vient avant le soufflé (Do).";
    else if (p.draw) tip = "Inspire comme à travers une paille, sans forcer.";
    else tip = "Vérifie ta position : compte les trous depuis la gauche.";
    return `<div class="advrow">${chip(t)} <span>${tip}</span></div>`;
  }).join('') + '</div>';
}

/* ---------- Écran résultat ---------- */
function showResult(el, { title, stars, xp, errors, total, perNote, secs, onRetry, onNext, onDrill, passed = true }) {
  if (passed) { confetti(); Snd.blip('win'); }
  el.innerHTML = `
    <div class="result">
      <div class="rbig">${passed ? (stars === 3 ? '🏆' : stars === 2 ? '🎉' : '👍') : '💪'}</div>
      <h2>${title}</h2>
      ${stars != null ? `<div class="stars s${stars}">${starStr(stars)}</div>` : ''}
      <div class="rstats">
        <div><b>+${xp}</b><span>XP</span></div>
        <div><b>${total - Math.min(total, errors)}/${total}</b><span>notes justes</span></div>
        ${secs ? `<div><b>${Math.round(secs)}s</b><span>temps</span></div>` : ''}
      </div>
      ${!passed ? '<p class="adv">Il faut au moins 1 étoile pour réussir. Tu y es presque, réessaie !</p>' : ''}
      ${perNote ? weakAdvice(perNote) : ''}
      <div class="rbtns">
        ${onDrill && perNote && Object.keys(perNote).length ? '<button class="btn ghost" data-r="drill">🎯 M\'entraîner sur mes erreurs</button>' : ''}
        ${onRetry ? '<button class="btn ghost" data-r="retry">↻ Recommencer</button>' : ''}
        <button class="btn primary" data-r="next">${onNext ? 'Continuer' : 'Terminer'}</button>
      </div>
    </div>`;
  $('[data-r="next"]', el).onclick = () => (onNext ? onNext() : back());
  const rr = $('[data-r="retry"]', el); if (rr) rr.onclick = onRetry;
  const rd = $('[data-r="drill"]', el); if (rd) rd.onclick = () => onDrill(Object.keys(perNote));
}

function drillSeq(tabs, n = 10) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(tabs[i % tabs.length]);
  return shuffle(out);
}

/* ======================================================
   ÉCRANS
   ====================================================== */

/* ---------- Accueil ---------- */
function allLessons() { const out = []; UNITS.forEach(u => u.lessons.forEach(l => out.push({ u, l }))); return out; }
function isUnlocked(id) {
  const all = allLessons();
  const i = all.findIndex(x => x.l.id === id);
  return i <= 0 || !!S.done[all[i - 1].l.id];
}
function nextLesson() { return allLessons().find(x => !S.done[x.l.id]); }

function screenHome(el) {
  const lv = levelOf(S.xp);
  const p0 = levelXp(lv), p1 = levelXp(lv + 1);
  const pct = Math.round(100 * (S.xp - p0) / (p1 - p0));
  const nx = nextLesson();
  const goalPct = Math.min(100, Math.round(100 * S.todayXp / S.goal));
  const dailyOk = S.dailyDone === todayStr();
  const doneCount = Object.keys(S.done).length, total = allLessons().length;
  const h = new Date().getHours();
  const hello = h < 12 ? 'Bonjour' : h < 18 ? 'Salut' : 'Bonsoir';
  el.innerHTML = `
    <div class="home">
      <div class="hero">
        <div class="hero-txt">
          <div class="hello">${hello}${S.name ? ' ' + esc(S.name) : ''} 👋</div>
          <div class="lvname">Niveau ${lv} · ${levelName(lv)}</div>
          <div class="bar"><i style="width:${pct}%"></i></div>
          <div class="barlbl">${S.xp - p0} / ${p1 - p0} XP</div>
        </div>
        <div class="hero-harp">🎵</div>
      </div>

      <div class="card goal">
        <div class="goal-ring" style="--p:${goalPct}"><span>${goalPct}%</span></div>
        <div><b>Objectif du jour</b><br><small>${S.todayXp} / ${S.goal} XP ${goalPct >= 100 ? '✅ atteint !' : ''}</small><br><small>🔥 Série : ${S.streak} jour${S.streak > 1 ? 's' : ''}</small></div>
      </div>

      ${nx ? `<button class="card cta" id="cont">
        <div class="cta-emoji">${nx.u.emoji}</div>
        <div class="cta-txt"><small>${doneCount ? 'Continuer' : 'Commencer'} · ${esc(nx.u.title)}</small><b>${esc(nx.l.title)}</b></div>
        <div class="cta-go">▶</div></button>`
      : `<div class="card cta done"><div class="cta-emoji">🏆</div><div class="cta-txt"><b>Cours terminé !</b><small>Continue avec les morceaux et les jeux.</small></div></div>`}

      <div class="grid">
        <button class="tile t1" data-go="daily"><span>📅</span><b>Défi du jour</b><small>${dailyOk ? 'Réussi ✅' : '+50 XP bonus'}</small></button>
        <button class="tile t2" data-go="songs"><span>🎤</span><b>Morceaux</b><small>${SONGS.length} chansons</small></button>
        <button class="tile t3" data-go="games"><span>🎮</span><b>Jeux</b><small>4 jeux musicaux</small></button>
        <button class="tile t4" data-go="tuner"><span>🎚️</span><b>Accordeur</b><small>& harmonica virtuel</small></button>
      </div>

      <div class="card tip">💡 <b>Astuce :</b> ${pick(TIPS)}</div>
      <div class="card mini-prog">📚 Cours : <b>${doneCount}/${total}</b> leçons <div class="bar thin"><i style="width:${100 * doneCount / total}%"></i></div></div>
    </div>`;
  const c = $('#cont', el);
  if (c) c.onclick = () => go(screenLesson, nx.l.id);
  $$('[data-go]', el).forEach(b => b.onclick = () => {
    const g = b.dataset.go;
    if (g === 'daily') go(screenDaily);
    if (g === 'songs') go(screenSongs);
    if (g === 'games') tab(screenGames);
    if (g === 'tuner') go(screenTuner);
  });
}
screenHome.navTab = 'home';

/* ---------- Cours ---------- */
function screenCourse(el) {
  let html = '<div class="pagehead"><h1>📚 Le cours</h1><p>Avance pas à pas, l\'app t\'écoute et te corrige.</p></div>';
  UNITS.forEach((u, ui) => {
    const n = u.lessons.filter(l => S.done[l.id]).length;
    html += `<div class="unit" style="--uc:${u.color}">
      <div class="unit-h"><span class="ue">${u.emoji}</span><div><small>Unité ${ui + 1}</small><b>${esc(u.title)}</b></div><span class="uprog">${n}/${u.lessons.length}</span></div>
      <div class="path">`;
    u.lessons.forEach((l, li) => {
      const unlocked = isUnlocked(l.id);
      const done = !!S.done[l.id];
      const st = S.stars[l.id];
      const icon = l.exam ? '🎓' : l.song ? '🎵' : done ? '✓' : unlocked ? '▶' : '🔒';
      html += `<button class="node ${done ? 'done' : ''} ${unlocked ? '' : 'locked'} ${l.exam ? 'exam' : ''}" data-l="${l.id}" style="--off:${[0, 40, 60, 40, 0, -40, -60, -40][li % 8]}px">
        <span class="nic">${icon}</span><span class="nlbl">${esc(l.title)}${st != null ? `<em>${starStr(st)}</em>` : ''}</span></button>`;
    });
    html += '</div></div>';
  });
  el.innerHTML = html;
  $$('.node', el).forEach(b => b.onclick = () => {
    if (b.classList.contains('locked')) { toast('🔒 Termine la leçon précédente d\'abord'); Snd.blip('bad'); return; }
    go(screenLesson, b.dataset.l);
  });
}
screenCourse.navTab = 'course';

function findLesson(id) {
  for (const u of UNITS) for (const l of u.lessons) if (l.id === id) return { u, l };
  return null;
}

function songSteps(song) {
  const steps = [{
    type: 'info', title: `${song.emoji} ${song.title}`,
    text: `Écoute d'abord la mélodie avec le bouton 🔊, puis joue-la ligne par ligne.<br><br>${song.lines.map(l => l.map(t => chip(t)).join(' ')).join('<br>')}`,
    holes: Array.from(new Set(song.lines.flat())), song: song.id,
  }];
  song.lines.forEach((ln, i) => steps.push({ type: 'play', title: `Ligne ${i + 1}`, seq: ln, hold: 220 }));
  steps.push({ type: 'play', title: 'Tout le morceau !', lines: song.lines, hold: 220 });
  return steps;
}

function makeExamSeq(pool, n, melodic) {
  const out = [];
  let i = rand(0, pool.length - 1);
  for (let k = 0; k < n; k++) {
    if (melodic) { i = Math.max(0, Math.min(pool.length - 1, i + pick([-2, -1, -1, 1, 1, 2]))); out.push(pool[i]); }
    else { let t; do { t = pick(pool); } while (out.length && t === out[out.length - 1]); out.push(t); }
  }
  return out;
}

function completeLesson(id, xp, stars) {
  const first = !S.done[id];
  S.done[id] = todayStr();
  if (stars != null) S.stars[id] = Math.max(S.stars[id] || 0, stars);
  const gained = first ? xp : Math.round(xp / 4);
  addXp(gained);
  award('lesson1');
  const f = findLesson(id);
  if (f && f.u.lessons.every(l => S.done[l.id]) && f.u.id === 'u1') award('unit1');
  if (f && f.l.exam) award('exam1');
  if (stars === 3) award('perfect');
  if (allLessons().every(x => S.done[x.l.id])) award('all');
  save();
  return gained;
}

function screenLesson(el, id) {
  const f = findLesson(id);
  if (!f) { back(); return; }
  const { l } = f;
  if (l.exam) return screenExam(el, l);
  let steps = l.song ? songSteps(SONGS.find(s => s.id === l.song)) : l.steps;
  let si = 0, errs = 0, total = 0, cleanup = null;
  const perNote = {};

  el.innerHTML = `
    <div class="lesson">
      <div class="lbar"><button class="back" data-back>✕</button><div class="bar"><i></i></div></div>
      <div class="lbody"></div>
    </div>`;
  bindBack(el);
  const body = $('.lbody', el);

  function stepDone(addErr = 0, addTot = 0) {
    errs += addErr; total += addTot;
    si++;
    showStep();
  }

  function showStep() {
    if (cleanup) { cleanup(); cleanup = null; }
    $('.lbar .bar i', el).style.width = (100 * si / steps.length) + '%';
    if (si >= steps.length) {
      const stars = total ? starsFor(errs, total) : 3;
      const gained = completeLesson(l.id, l.xp, stars);
      if (l.song) { S.songsPlayed[l.song] = 1; award('song'); save(); }
      const nx = nextLesson();
      showResult(body, {
        title: 'Leçon terminée !', stars, xp: gained, errors: errs, total: total || 1, perNote,
        onRetry: () => replace(screenLesson, id),
        onNext: nx && nx.l.id !== id ? () => replace(screenLesson, nx.l.id) : null,
        onDrill: tabs => replace(screenDrill, 'Mes erreurs', drillSeq(tabs)),
      });
      return;
    }
    const s = steps[si];
    body.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'step step-' + s.type;
    body.appendChild(box);

    if (s.type === 'info') {
      box.innerHTML = `<h2>${s.title}</h2><div class="stext">${s.text}</div><div class="harpbox"></div>
        <div class="sbtns">${s.holes && s.holes.length ? '<button class="btn ghost" data-a="hear">🔊 Écouter</button>' : ''}<button class="btn primary" data-a="next">Compris !</button></div>`;
      const hp = Harp($('.harpbox', box), { tap: true });
      if (s.holes) hp.mark(s.holes);
      $('[data-a="next"]', box).onclick = () => stepDone();
      const hb = $('[data-a="hear"]', box);
      if (hb) hb.onclick = () => {
        const seq = s.song ? SONGS.find(x => x.id === s.song).lines.flat() : s.holes;
        Snd.playSeq(seq.map(t => tabMidi(t, keyOff())), s.song ? 0.45 : 0.6, 0.42);
      };
    } else if (s.type === 'play') {
      cleanup = Player(box, {
        title: s.title, text: s.text, seq: s.seq, lines: s.lines, hold: s.hold,
        onDone: r => {
          Object.entries(r.perNote).forEach(([k, v]) => perNote[k] = (perNote[k] || 0) + v);
          stepDone(r.errors, r.total);
        },
      });
    } else if (s.type === 'quiz') {
      box.innerHTML = `<h2>Question</h2><div class="stext">${s.q}</div>
        <div class="opts">${s.options.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join('')}</div>
        <div class="explain hidden"></div><div class="sbtns"><button class="btn primary hidden" data-a="next">Continuer</button></div>`;
      $$('.opt', box).forEach(b => b.onclick = () => {
        if (box.dataset.answered) return;
        box.dataset.answered = 1;
        const ok = +b.dataset.i === s.answer;
        b.classList.add(ok ? 'right' : 'wrong');
        $$('.opt', box)[s.answer].classList.add('right');
        Snd.blip(ok ? 'ok' : 'bad');
        const ex = $('.explain', box);
        ex.innerHTML = (ok ? '✅ Exact ! ' : '❌ Pas tout à fait. ') + s.explain;
        ex.classList.remove('hidden');
        $('[data-a="next"]', box).classList.remove('hidden');
        $('[data-a="next"]', box).onclick = () => stepDone(ok ? 0 : 1, 1);
      });
    } else if (s.type === 'ear') {
      const key = keyOff();
      const opts = shuffle(s.options);
      box.innerHTML = `<h2>👂 ${s.title}</h2><div class="stext">Écoute la note et trouve laquelle c'est.</div>
        <button class="bigplay">🔊</button>
        <div class="opts row">${opts.map(t => `<button class="opt tabopt" data-t="${t}">${chip(t)}<small>${tabLabel(t)}</small></button>`).join('')}</div>
        <div class="explain hidden"></div><div class="sbtns"><button class="btn primary hidden" data-a="next">Continuer</button></div>`;
      const play = () => Snd.playNote(tabMidi(s.tab, key), 0.9);
      $('.bigplay', box).onclick = play;
      setTimeout(play, 400);
      $$('.opt', box).forEach(b => b.onclick = () => {
        if (box.dataset.answered) return;
        box.dataset.answered = 1;
        const ok = b.dataset.t === s.tab;
        b.classList.add(ok ? 'right' : 'wrong');
        $(`.opt[data-t="${s.tab}"]`, box).classList.add('right');
        Snd.blip(ok ? 'ok' : 'bad');
        const ex = $('.explain', box);
        ex.innerHTML = ok ? '✅ Bien entendu ! ' : `❌ C'était ${chip(s.tab)}. Plus le trou est à droite, plus c'est aigu.`;
        ex.classList.remove('hidden');
        $('[data-a="next"]', box).classList.remove('hidden');
        $('[data-a="next"]', box).onclick = () => stepDone(ok ? 0 : 1, 1);
      });
    }
  }
  showStep();
  return () => { if (cleanup) cleanup(); };
}
screenLesson.full = true;

/* ---------- Examen / test noté ---------- */
function screenExam(el, l) {
  const seq = makeExamSeq(l.pool, l.length, l.melodic);
  el.innerHTML = `<div class="lesson"><div class="lbar"><button class="back" data-back>✕</button><div class="examtag">🎓 ${esc(l.title)}</div></div><div class="lbody"></div></div>`;
  bindBack(el);
  const body = $('.lbody', el);
  body.innerHTML = `<div class="step"><h2>🎓 ${esc(l.title)}</h2>
    <div class="stext">Tu vas jouer <b>${l.length} notes</b> au hasard parmi :<br><br>${l.pool.map(t => chip(t)).join(' ')}<br><br>
    Chaque fausse note tenue compte comme une erreur. Il faut <b>au moins 1 étoile</b> pour réussir.</div>
    <div class="sbtns"><button class="btn primary" data-a="go">C'est parti !</button></div></div>`;
  let cleanup = null;
  $('[data-a="go"]', body).onclick = () => {
    body.innerHTML = '<div class="step"></div>';
    cleanup = Player($('.step', body), {
      title: 'Joue les notes', seq, hold: 300, mode: 'test',
      onDone: r => {
        const stars = starsFor(r.errors, r.total);
        const passed = stars >= 1;
        const gained = passed ? completeLesson(l.id, l.xp, stars) : 5;
        if (!passed) addXp(5);
        showResult(body, {
          title: passed ? 'Examen réussi !' : 'Pas encore…', stars, xp: gained, errors: r.errors, total: r.total,
          perNote: r.perNote, secs: r.secs, passed,
          onRetry: () => replace(screenLesson, l.id),
          onDrill: tabs => replace(screenDrill, 'Mes erreurs', drillSeq(tabs)),
        });
      },
    });
  };
  return () => { if (cleanup) cleanup(); };
}
screenExam.full = true;

/* ---------- Pratique ---------- */
const DRILLS = [
  { id: 'up', emoji: '🪜', title: 'Gamme montante', seq: ['4', '-4', '5', '-5', '6', '-6', '-7', '7'] },
  { id: 'down', emoji: '⬇️', title: 'Gamme descendante', seq: ['7', '-7', '-6', '6', '-5', '5', '-4', '4'] },
  { id: 'arp', emoji: '🌈', title: 'Arpèges', seq: ['4', '5', '6', '7', '6', '5', '4', '-4', '-5', '-6', '-5', '-4'] },
  { id: 'third', emoji: '🦘', title: 'Tierces', seq: ['4', '5', '-4', '-5', '5', '6', '-5', '-6', '6', '-7', '-6', '7'] },
  { id: 'low', emoji: '🐻', title: 'Les graves', seq: ['1', '-1', '2', '-2', '3', '-3', '3', '-2', '2', '-1', '1'] },
  { id: 'high', emoji: '🐦', title: 'Les aigus', seq: ['7', '-8', '8', '-9', '9', '-10', '10', '-10', '9', '-9', '8', '-8', '7'] },
  { id: 'rand', emoji: '🎲', title: 'Notes au hasard', gen: () => makeExamSeq(['4', '-4', '5', '-5', '6', '-6', '-7', '7'], 12) },
  { id: 'bend', emoji: '🎸', title: 'Atelier bend', seq: ['-4', "-4'", '-4', "-4'", '-1', "-1'", '-6', "-6'"], hold: 400 },
];

function screenPractice(el) {
  const weak = Object.entries(S.weak).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
  el.innerHTML = `
    <div class="pagehead"><h1>🎯 Pratique</h1><p>Exercices, morceaux et tests notés.</p></div>
    <h3 class="sec">Tests & défis</h3>
    <div class="list">
      <button class="row" data-x="daily"><span class="re">📅</span><div><b>Défi du jour</b><small>${S.dailyDone === todayStr() ? 'Réussi aujourd\'hui ✅' : '8 notes · +50 XP'}</small></div><span>›</span></button>
      <button class="row" data-x="level"><span class="re">📝</span><div><b>Test de niveau</b><small>3 difficultés, note sur 3 étoiles</small></div><span>›</span></button>
      ${weak.length ? `<button class="row hl" data-x="weak"><span class="re">🩹</span><div><b>Mes notes faibles</b><small>${weak.map(t => chip(t, 'mini')).join(' ')}</small></div><span>›</span></button>` : ''}
    </div>
    <h3 class="sec">Exercices</h3>
    <div class="grid small">${DRILLS.map(d => `<button class="tile" data-d="${d.id}"><span>${d.emoji}</span><b>${d.title}</b>${S.best['drill_' + d.id] != null ? `<small>${starStr(S.best['drill_' + d.id])}</small>` : ''}</button>`).join('')}</div>
    <h3 class="sec">Morceaux</h3>
    <div class="list"><button class="row" data-x="songs"><span class="re">🎤</span><div><b>Tous les morceaux</b><small>${Object.keys(S.songsPlayed).length}/${SONGS.length} joués</small></div><span>›</span></button>
    <button class="row" data-x="tuner"><span class="re">🎚️</span><div><b>Accordeur & jeu libre</b><small>Vois chaque note que tu joues</small></div><span>›</span></button></div>`;
  $$('[data-d]', el).forEach(b => b.onclick = () => {
    const d = DRILLS.find(x => x.id === b.dataset.d);
    go(screenDrill, d.title, d.gen ? d.gen() : d.seq, 'drill_' + d.id, d.hold);
  });
  $$('[data-x]', el).forEach(b => b.onclick = () => {
    const x = b.dataset.x;
    if (x === 'daily') go(screenDaily);
    if (x === 'level') go(screenLevelTest);
    if (x === 'weak') go(screenDrill, 'Mes notes faibles', drillSeq(weak, 12), null);
    if (x === 'songs') go(screenSongs);
    if (x === 'tuner') go(screenTuner);
  });
}
screenPractice.navTab = 'practice';

function screenDrill(el, title, seq, bestKey, hold) {
  el.innerHTML = `<div class="lesson"><div class="lbar"><button class="back" data-back>✕</button><div class="examtag">${esc(title)}</div></div><div class="lbody"><div class="step"></div></div></div>`;
  bindBack(el);
  const body = $('.lbody', el);
  return Player($('.step', body), {
    title, seq, hold: hold || 300,
    onDone: r => {
      const stars = starsFor(r.errors, r.total);
      if (bestKey) S.best[bestKey] = Math.max(S.best[bestKey] || 0, stars);
      const xp = 10 + stars * 5;
      addXp(xp);
      if (stars === 3) award('perfect');
      showResult(body, {
        title: 'Exercice terminé', stars, xp, errors: r.errors, total: r.total, perNote: r.perNote, secs: r.secs,
        onRetry: () => replace(screenDrill, title, seq, bestKey, hold),
        onDrill: tabs => replace(screenDrill, 'Mes erreurs', drillSeq(tabs)),
      });
    },
  });
}
screenDrill.full = true;

function screenDaily(el) {
  const d = todayStr();
  const r = seeded(parseInt(d.replace(/-/g, ''), 10));
  const pool = ['4', '-4', '5', '-5', '6', '-6', '-7', '7'];
  const seq = []; let i = Math.floor(r() * pool.length);
  for (let k = 0; k < 8; k++) { i = Math.max(0, Math.min(pool.length - 1, i + [-2, -1, 1, 2][Math.floor(r() * 4)])); seq.push(pool[i]); }
  el.innerHTML = `<div class="lesson"><div class="lbar"><button class="back" data-back>✕</button><div class="examtag">📅 Défi du ${d.split('-').reverse().join('/')}</div></div><div class="lbody"><div class="step"></div></div></div>`;
  bindBack(el);
  const body = $('.lbody', el);
  return Player($('.step', body), {
    title: 'Le défi du jour', text: 'Une nouvelle mélodie chaque jour. 2 étoiles minimum pour le bonus !', seq, hold: 280, mode: 'test',
    onDone: res => {
      const stars = starsFor(res.errors, res.total);
      let xp = 10 + stars * 5;
      if (stars >= 2 && S.dailyDone !== d) { xp += 50; S.dailyDone = d; award('daily'); }
      addXp(xp);
      showResult(body, {
        title: stars >= 2 ? 'Défi réussi !' : 'Défi tenté', stars, xp, errors: res.errors, total: res.total, perNote: res.perNote, secs: res.secs,
        passed: stars >= 1, onRetry: () => replace(screenDaily),
      });
    },
  });
}
screenDaily.full = true;

function screenLevelTest(el) {
  const levels = [
    { id: 'easy', emoji: '🟢', name: 'Facile', pool: ['4', '-4', '5', '-5', '6'], n: 8 },
    { id: 'mid', emoji: '🟠', name: 'Moyen', pool: ['4', '-4', '5', '-5', '6', '-6', '-7', '7'], n: 12 },
    { id: 'hard', emoji: '🔴', name: 'Difficile', pool: ['1', '-1', '2', '-2', '3', '-3', '4', '-4', '5', '-5', '6', '-6', '-7', '7', '-8', '8', '-9', '9'], n: 16 },
  ];
  el.innerHTML = topbar('📝 Test de niveau') + `<div class="pad">
    <p class="muted">Des notes au hasard, chronométrées. L'app note ta précision et te dit quoi travailler.</p>
    <div class="list">${levels.map(lv => `<button class="row" data-lv="${lv.id}"><span class="re">${lv.emoji}</span><div><b>${lv.name}</b><small>${lv.n} notes · record ${S.best['test_' + lv.id] != null ? starStr(S.best['test_' + lv.id]) : '—'}</small></div><span>›</span></button>`).join('')}</div></div>`;
  bindBack(el);
  $$('[data-lv]', el).forEach(b => b.onclick = () => {
    const lv = levels.find(x => x.id === b.dataset.lv);
    go(screenTestRun, lv);
  });
}
screenLevelTest.navTab = 'practice';

function screenTestRun(el, lv) {
  const seq = makeExamSeq(lv.pool, lv.n);
  el.innerHTML = `<div class="lesson"><div class="lbar"><button class="back" data-back>✕</button><div class="examtag">📝 Test ${lv.name}</div></div><div class="lbody"><div class="step"></div></div></div>`;
  bindBack(el);
  const body = $('.lbody', el);
  return Player($('.step', body), {
    title: `Test ${lv.name}`, seq, hold: 280, mode: 'test',
    onDone: r => {
      const stars = starsFor(r.errors, r.total);
      S.best['test_' + lv.id] = Math.max(S.best['test_' + lv.id] || 0, stars);
      const xp = 10 + stars * 10;
      addXp(xp);
      if (stars === 3) award('perfect');
      showResult(body, {
        title: `Test ${lv.name}`, stars, xp, errors: r.errors, total: r.total, perNote: r.perNote, secs: r.secs,
        passed: stars >= 1, onRetry: () => replace(screenTestRun, lv),
        onDrill: tabs => replace(screenDrill, 'Mes erreurs', drillSeq(tabs)),
      });
    },
  });
}
screenTestRun.full = true;

/* ---------- Morceaux ---------- */
function screenSongs(el) {
  el.innerHTML = topbar('🎤 Morceaux') + `<div class="pad"><div class="list">
    ${SONGS.map(s => `<button class="row" data-s="${s.id}"><span class="re">${s.emoji}</span><div><b>${esc(s.title)}</b><small>${'🎵'.repeat(s.level)} ${S.songsPlayed[s.id] ? '· joué ✅' : ''} ${S.best['song_' + s.id] != null ? starStr(S.best['song_' + s.id]) : ''}</small></div><span>›</span></button>`).join('')}
  </div></div>`;
  bindBack(el);
  $$('[data-s]', el).forEach(b => b.onclick = () => go(screenSong, b.dataset.s));
}
screenSongs.navTab = 'practice';

function screenSong(el, id) {
  const s = SONGS.find(x => x.id === id);
  const key = keyOff();
  el.innerHTML = topbar(`${s.emoji} ${esc(s.title)}`) + `<div class="pad">
    <div class="card songtabs">${s.lines.map((l, li) => `<div class="sline">${l.map((t, i) => `<span class="tabchip ${tabClass(t)}" data-k="${li}-${i}">${t}</span>`).join('')}</div>`).join('')}</div>
    <div class="tempo">Tempo : <input type="range" min="0.3" max="0.9" step="0.05" value="0.55" id="tempo"> <span id="tv">normal</span></div>
    <div class="sbtns col">
      <button class="btn ghost" data-a="listen">🔊 Écouter le morceau</button>
      <button class="btn primary" data-a="play">🎵 Je joue (l'app m'écoute)</button>
      <button class="btn ghost" data-a="hero">⚡ En mode Note Hero</button>
    </div></div>`;
  bindBack(el);
  const tempo = $('#tempo', el);
  tempo.oninput = () => { const v = +tempo.value; $('#tv', el).textContent = v < 0.45 ? 'rapide' : v > 0.7 ? 'lent' : 'normal'; };
  let timers = [];
  $('[data-a="listen"]', el).onclick = () => {
    timers.forEach(clearTimeout); timers = [];
    const step = +tempo.value;
    const flat = [];
    s.lines.forEach((l, li) => l.forEach((t, i) => flat.push({ t, k: `${li}-${i}` })));
    Snd.playSeq(flat.map(f => tabMidi(f.t, key)), step, step * 0.9);
    flat.forEach((f, i) => timers.push(setTimeout(() => {
      $$('.songtabs .tabchip', el).forEach(c => c.classList.remove('play'));
      const c = $(`[data-k="${f.k}"]`, el); if (c) c.classList.add('play');
    }, i * step * 1000)));
    timers.push(setTimeout(() => $$('.songtabs .tabchip', el).forEach(c => c.classList.remove('play')), flat.length * step * 1000));
  };
  $('[data-a="play"]', el).onclick = () => go(screenSongPlay, id);
  $('[data-a="hero"]', el).onclick = () => go(screenHero, id);
  return () => timers.forEach(clearTimeout);
}
screenSong.navTab = 'practice';

function screenSongPlay(el, id) {
  const s = SONGS.find(x => x.id === id);
  el.innerHTML = `<div class="lesson"><div class="lbar"><button class="back" data-back>✕</button><div class="examtag">${s.emoji} ${esc(s.title)}</div></div><div class="lbody"><div class="step"></div></div></div>`;
  bindBack(el);
  const body = $('.lbody', el);
  return Player($('.step', body), {
    title: s.title, lines: s.lines, hold: 220,
    onDone: r => {
      const stars = starsFor(r.errors, r.total);
      S.songsPlayed[id] = 1;
      S.best['song_' + id] = Math.max(S.best['song_' + id] || 0, stars);
      award('song');
      if (Object.keys(S.songsPlayed).length >= 5) award('songs5');
      const xp = 15 + stars * 5;
      addXp(xp);
      showResult(body, {
        title: 'Morceau joué !', stars, xp, errors: r.errors, total: r.total, perNote: r.perNote, secs: r.secs,
        onRetry: () => replace(screenSongPlay, id),
        onDrill: tabs => replace(screenDrill, 'Mes erreurs', drillSeq(tabs)),
      });
    },
  });
}
screenSongPlay.full = true;

/* ---------- Accordeur + harmonica virtuel ---------- */
function screenTuner(el) {
  const key = keyOff();
  el.innerHTML = topbar('🎚️ Accordeur') + `<div class="pad tuner">
    <div class="tnote">—</div>
    <div class="ttab"></div>
    <div class="gauge"><div class="gscale"><span>-50</span><span>0</span><span>+50</span></div><div class="gneedle"></div><div class="gcenter"></div></div>
    <div class="tfreq">Joue une note…</div>
    <div class="tbreath"><span>Souffle</span><div class="bar"><i></i></div></div>
    <div class="harpbox"></div>
    <p class="muted center">Touche le haut d'un trou pour entendre la note soufflée, le bas pour l'aspirée.</p>
    <div class="micwarn hidden">🎤 Micro indisponible. Vérifie l'autorisation dans les réglages Android.</div>
  </div>`;
  bindBack(el);
  const harp = Harp($('.harpbox', el), { tap: true });
  const needle = $('.gneedle', el);
  const smooth = { c: 0 };
  Snd.listen(d => {
    $('.tbreath .bar i', el).style.width = Math.min(100, d.rms * 600) + '%';
    if (d.midi == null) {
      if (!d.sound) { $('.tnote', el).textContent = '—'; $('.ttab', el).innerHTML = ''; $('.tfreq', el).textContent = 'Joue une note…'; harp.setDetected(null); }
      return;
    }
    const m = Math.round(d.midi);
    smooth.c = smooth.c * 0.6 + d.cents * 0.4;
    $('.tnote', el).textContent = midiName(m, S.settings.english);
    const tabs = tabsForMidi(m, key, true);
    $('.ttab', el).innerHTML = tabs.length ? tabs.map(c => `${chip(c.tab)} <small>${tabLabel(c.tab)}</small>`).join('<br>') : '<small>Pas sur cet harmonica</small>';
    $('.tfreq', el).textContent = d.freq.toFixed(1) + ' Hz';
    needle.style.transform = `translateX(-50%) rotate(${Math.max(-50, Math.min(50, smooth.c)) * 1.2}deg)`;
    needle.classList.toggle('ok', Math.abs(smooth.c) < 12);
    harp.setDetected(d.midi);
  }).catch(() => $('.micwarn', el).classList.remove('hidden'));
}
screenTuner.navTab = 'home';

/* ---------- Profil ---------- */
function screenProfile(el) {
  const lv = levelOf(S.xp);
  const got = BADGES.filter(b => S.badges[b.id]).length;
  el.innerHTML = `
    <div class="pagehead"><h1>👤 Profil</h1></div>
    <div class="card prof">
      <div class="avatar">🎵</div>
      <div><input id="pname" placeholder="Ton prénom" value="${esc(S.name)}" maxlength="20"><br><small>Niveau ${lv} · ${levelName(lv)}</small></div>
    </div>
    <div class="statgrid">
      <div><b>${S.xp}</b><small>XP total</small></div>
      <div><b>${S.streak}🔥</b><small>Série</small></div>
      <div><b>${S.notesOk}</b><small>Notes justes</small></div>
      <div><b>${Object.keys(S.done).length}</b><small>Leçons</small></div>
    </div>
    <h3 class="sec">Badges ${got}/${BADGES.length}</h3>
    <div class="badges">${BADGES.map(b => `<div class="badge ${S.badges[b.id] ? 'got' : ''}"><span>${b.emoji}</span><b>${b.name}</b><small>${b.desc}</small></div>`).join('')}</div>
    <h3 class="sec">Réglages</h3>
    <div class="card settings">
      <label>Tonalité de ton harmonica
        <select id="skey">${Object.entries(KEYS).map(([k, v]) => `<option value="${k}" ${S.settings.key === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
      <small class="muted">C'est écrit sur le côté de l'harmonica (la plupart sont en Do / C).</small>
      <label>Noms des notes
        <select id="snames"><option value="fr" ${!S.settings.english ? 'selected' : ''}>Do Ré Mi</option><option value="en" ${S.settings.english ? 'selected' : ''}>C D E</option></select></label>
      <label>Afficher les notes sur l'harmonica <input type="checkbox" id="slabels" ${S.settings.labels ? 'checked' : ''}></label>
      <label>Objectif quotidien
        <select id="sgoal">${[30, 60, 100, 150].map(g => `<option value="${g}" ${S.goal === g ? 'selected' : ''}>${g} XP${g === 30 ? ' (cool)' : g === 60 ? ' (normal)' : g === 100 ? ' (sérieux)' : ' (intense)'}</option>`).join('')}</select></label>
      <label>Sensibilité du micro
        <input type="range" id="ssens" min="0.003" max="0.04" step="0.001" value="${S.settings.sens}"></label>
      <small class="muted">À gauche = plus sensible (pièce calme). À droite = ignore plus de bruit.</small>
      <button class="btn ghost danger" id="sreset">Remettre à zéro ma progression</button>
    </div>
    <p class="muted center">Harmonica Facile v1.0 · Fait avec ❤️</p>`;
  $('#pname', el).onchange = e => { S.name = e.target.value.trim(); save(); };
  $('#skey', el).onchange = e => { S.settings.key = e.target.value; save(); toast('Tonalité : ' + KEYS[S.settings.key].label); };
  $('#snames', el).onchange = e => { S.settings.english = e.target.value === 'en'; save(); };
  $('#slabels', el).onchange = e => { S.settings.labels = e.target.checked; save(); };
  $('#sgoal', el).onchange = e => { S.goal = +e.target.value; save(); };
  $('#ssens', el).onchange = e => { S.settings.sens = +e.target.value; Snd.setSensitivity(S.settings.sens); save(); };
  $('#sreset', el).onclick = () => {
    const b = $('#sreset', el);
    if (b.dataset.confirm) { localStorage.removeItem('harmo'); loadState(); updateHeader(); tab(screenHome); toast('Progression remise à zéro'); }
    else { b.dataset.confirm = 1; b.textContent = 'Appuie encore pour confirmer'; }
  };
}
screenProfile.navTab = 'profile';

/* ---------- Démarrage ---------- */
function boot() {
  loadState();
  updateHeader();
  $$('#nav button').forEach(b => b.onclick = () => {
    Snd.ensureCtx();
    const t = b.dataset.tab;
    tab({ home: screenHome, course: screenCourse, practice: screenPractice, games: screenGames, profile: screenProfile }[t]);
  });
  document.addEventListener('pointerdown', () => Snd.ensureCtx(), { once: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) Snd.pauseMic(); else Snd.resumeMic(); });
  if (!S.lastDay && !S.xp) showWelcome(); else tab(screenHome);
}

function showWelcome() {
  const root = $('#screen');
  root.innerHTML = `<div class="welcome">
    <div class="wlogo">🎵</div>
    <h1>Harmonica Facile</h1>
    <p>Apprends l'harmonica en t'amusant.<br>L'app <b>t'écoute</b> avec le micro et <b>te corrige</b> en direct.</p>
    <ul><li>📚 Un cours pas à pas</li><li>🎯 Exercices et tests notés</li><li>🎮 Des jeux musicaux</li><li>🏆 Badges, niveaux et séries</li></ul>
    <input id="wname" placeholder="Ton prénom (facultatif)" maxlength="20">
    <button class="btn primary big" id="wgo">Commencer 🚀</button>
    <small class="muted">Il te faut un harmonica diatonique 10 trous (en Do de préférence).</small>
  </div>`;
  $('#app').classList.add('fullscreen');
  $('#wgo').onclick = async () => {
    Snd.ensureCtx();
    S.name = $('#wname').value.trim();
    save();
    try { await Snd.listen(() => { }); Snd.stopListening(); } catch (e) { }
    $('#app').classList.remove('fullscreen');
    tab(screenHome);
  };
}

window.addEventListener('DOMContentLoaded', boot);
