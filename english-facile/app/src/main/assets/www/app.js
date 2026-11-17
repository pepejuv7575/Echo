/* =========================================================
   English Facile — application d'apprentissage de l'anglais
   100 % gratuite, hors ligne, sans abonnement, sans objectif quotidien.
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const UNITS = window.UNITS, SCENES = window.SCENES;
  const main = $("#main");

  /* ---------------- Progression (stockée sur le téléphone) ---------------- */
  const KEY = "englishfacile_v1";
  const defaults = () => ({
    xp: 0, units: {}, scenes: {}, words: {}, pron: { count: 0, sum: 0, great: 0 },
    games: { played: 0, best: {} }, answers: { ok: 0, total: 0 }, perfect: 0,
    settings: { rate: 0.9, sound: true, gameUnit: "all" }, badges: {}
  });
  let P;
  try { P = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { P = defaults(); }
  P.settings = Object.assign(defaults().settings, P.settings || {});
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} };

  const levelOf = (xp) => Math.floor(Math.sqrt(xp / 40)) + 1;
  const xpForLevel = (l) => 40 * (l - 1) * (l - 1);
  const LEVEL_NAMES = ["Débutant", "Curieux", "Apprenti", "Explorateur", "Voyageur", "Bavard", "Confirmé", "Expert", "Bilingue", "Légende"];
  const levelName = (l) => LEVEL_NAMES[Math.min(l - 1, LEVEL_NAMES.length - 1)];

  function addXP(n) {
    if (n <= 0) return;
    const before = levelOf(P.xp);
    P.xp += Math.round(n);
    save();
    updateHeader(true);
    const after = levelOf(P.xp);
    if (after > before) { toast(`🎉 Niveau ${after} atteint : ${levelName(after)} !`); confetti(); }
    checkBadges();
  }
  function learnWord(en) { if (!P.words[en]) { P.words[en] = 1; save(); } }

  function updateHeader(bump) {
    $("#xpPill").textContent = `⭐ ${P.xp} XP`;
    $("#lvlPill").textContent = `Niv. ${levelOf(P.xp)}`;
    if (bump) { const x = $("#xpPill"); x.classList.remove("bump"); void x.offsetWidth; x.classList.add("bump"); }
  }

  /* ---------------- Badges ---------------- */
  const BADGES = [
    { id: "first", em: "🌱", name: "Première leçon", test: () => doneUnits() >= 1 },
    { id: "five", em: "📘", name: "5 leçons", test: () => doneUnits() >= 5 },
    { id: "all", em: "🎓", name: "Toutes les leçons", test: () => doneUnits() >= UNITS.length },
    { id: "w50", em: "🧠", name: "50 mots", test: () => Object.keys(P.words).length >= 50 },
    { id: "w120", em: "📖", name: "120 mots", test: () => Object.keys(P.words).length >= 120 },
    { id: "mic", em: "🎤", name: "1re prononciation", test: () => P.pron.count >= 1 },
    { id: "accent", em: "🗣️", name: "20 prononciations excellentes", test: () => P.pron.great >= 20 },
    { id: "scene1", em: "🎬", name: "1re scène jouée", test: () => Object.keys(P.scenes).length >= 1 },
    { id: "scene4", em: "🌍", name: "4 situations", test: () => Object.keys(P.scenes).length >= 4 },
    { id: "games10", em: "🎮", name: "10 parties", test: () => P.games.played >= 10 },
    { id: "perfect", em: "💯", name: "Sans faute", test: () => P.perfect >= 1 },
    { id: "xp1000", em: "🏆", name: "1000 XP", test: () => P.xp >= 1000 }
  ];
  const doneUnits = () => UNITS.filter((u) => (P.units[u.id] || {}).stars > 0).length;
  function checkBadges() {
    BADGES.forEach((b) => {
      if (!P.badges[b.id] && b.test()) { P.badges[b.id] = Date.now(); save(); setTimeout(() => toast(`${b.em} Badge débloqué : ${b.name}`), 700); }
    });
  }

  /* ---------------- Toast, sons, confettis ---------------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
  }
  window.toast = toast;

  let actx;
  function beep(good) {
    if (!P.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = good ? [660, 880] : [300, 220];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = good ? "sine" : "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, actx.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.2, actx.currentTime + i * 0.12 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + i * 0.12 + 0.2);
        o.connect(g); g.connect(actx.destination);
        o.start(actx.currentTime + i * 0.12); o.stop(actx.currentTime + i * 0.12 + 0.22);
      });
    } catch (e) {}
  }
  function confetti() {
    const fx = $("#fx"); const cols = ["#4F46E5", "#F59E0B", "#10B981", "#EC4899", "#06B6D4"];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement("div"); c.className = "conf";
      c.style.left = Math.random() * 100 + "vw"; c.style.background = cols[i % cols.length];
      c.style.animationDuration = 1.4 + Math.random() * 1.4 + "s"; c.style.animationDelay = Math.random() * 0.4 + "s";
      fx.appendChild(c); setTimeout(() => c.remove(), 3500);
    }
  }

  /* ---------------- Voix : synthèse & reconnaissance ---------------- */
  const NB = window.AndroidBridge;
  const Speech = {
    pending: {}, seq: 0,
    speak(text, opt = {}) {
      return new Promise((resolve) => {
        const rate = opt.rate || P.settings.rate, pitch = opt.pitch || 1, voice = opt.voice || "";
        const id = "u" + (++this.seq);
        let done = false;
        const fin = () => { if (!done) { done = true; delete this.pending[id]; resolve(); } };
        this.pending[id] = fin;
        setTimeout(fin, 1800 + text.length * 95 / rate);
        if (NB) { NB.speak(text, rate, pitch, id, voice); return; }
        if ("speechSynthesis" in window) {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "en-US"; u.rate = rate; u.pitch = pitch;
          const v = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.startsWith("en"));
          if (v.length) u.voice = v.find((x) => /US/.test(x.lang)) || v[0];
          u.onend = fin; u.onerror = fin;
          speechSynthesis.speak(u);
        } else fin();
      });
    },
    stop() {
      Object.values(this.pending).forEach((f) => f());
      if (NB) NB.stopSpeaking(); else if ("speechSynthesis" in window) speechSynthesis.cancel();
    },
    listening: null,
    listen() {
      return new Promise((resolve, reject) => {
        this.listening = { resolve, reject };
        if (NB) { NB.startListening("en-US"); return; }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { this.listening = null; reject("unavailable"); return; }
        const r = new SR(); r.lang = "en-US"; r.maxAlternatives = 5; r.interimResults = false;
        r.onresult = (e) => window.onSpeechResult(Array.from(e.results[0]).map((a) => a.transcript));
        r.onerror = (e) => window.onSpeechError(e.error);
        r.start();
      });
    }
  };
  window.onSpeakDone = (id) => { const f = Speech.pending[id]; if (f) f(); };
  window.onTtsReady = () => {};
  window.onSpeechResult = (arr) => { const l = Speech.listening; Speech.listening = null; if (l) l.resolve(arr || []); };
  window.onSpeechError = (code) => { const l = Speech.listening; Speech.listening = null; if (l) l.reject(code); };
  const say = (t, slow) => Speech.speak(t, slow ? { rate: 0.55 } : {});

  /* ---------------- Notation de la prononciation ---------------- */
  const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function numWords(n) {
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
    if (n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + numWords(n % 100) : "");
    return String(n);
  }
  const CONTR = { "i'm": "i am", "it's": "it is", "that's": "that is", "what's": "what is", "you're": "you are", "we're": "we are", "they're": "they are",
    "he's": "he is", "she's": "she is", "there's": "there is", "don't": "do not", "doesn't": "does not", "didn't": "did not", "can't": "cannot",
    "won't": "will not", "i'll": "i will", "you'll": "you will", "we'll": "we will", "i'd": "i would", "i've": "i have", "isn't": "is not",
    "aren't": "are not", "let's": "let us", "o'clock": "oclock", "okay": "ok", "mum": "mom", "colour": "color", "wifi": "wifi" };
  function norm(s) {
    s = String(s).toLowerCase().replace(/[’`´]/g, "'");
    s = s.replace(/(\d)[.,:](\d)/g, "$1 $2").replace(/[£$€%]/g, " ").replace(/-/g, "");
    s = s.replace(/[^a-z0-9' ]/g, " ");
    let t = s.split(/\s+/).filter(Boolean).map((w) => CONTR[w] || w).join(" ");
    t = t.replace(/\d+/g, (m) => numWords(+m)).replace(/'/g, "");
    return t.split(/\s+/).filter(Boolean);
  }
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  const wsim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length, 1);
  function scoreOne(target, heard) {
    const t = norm(target), h = norm(heard);
    if (!t.length) return { score: 0, flags: [] };
    if (!h.length) return { score: 0, flags: t.map(() => false) };
    if (t.length === 1) {
      const best = Math.max(...h.map((w) => wsim(t[0], w)), wsim(t[0], h.join("")));
      const sc = best >= 0.99 ? 100 : Math.round(best * 85);
      return { score: sc, flags: [best >= 0.75] };
    }
    // alignement mot à mot (LCS avec tolérance)
    const m = t.length, n = h.length, dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      const s = wsim(t[i - 1], h[j - 1]); const match = s >= 0.75 ? s : 0;
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1], match ? dp[i - 1][j - 1] + match : 0);
    }
    const flags = new Array(m).fill(false);
    let i = m, j = n;
    while (i > 0 && j > 0) {
      const s = wsim(t[i - 1], h[j - 1]);
      if (s >= 0.75 && Math.abs(dp[i][j] - (dp[i - 1][j - 1] + s)) < 1e-9) { flags[i - 1] = true; i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
    }
    const denom = Math.max(m, (m + n) / 2);
    return { score: Math.min(100, Math.round((dp[m][n] / denom) * 100)), flags };
  }
  function scoreSpeech(target, alts) {
    let best = { score: 0, flags: norm(target).map(() => false), heard: alts[0] || "" };
    alts.forEach((a) => { const r = scoreOne(target, a); if (r.score > best.score) best = { ...r, heard: a }; });
    return best;
  }
  function verdict(s) {
    if (s >= 85) return ["Excellent ! 🎉", "#10B981"];
    if (s >= 65) return ["Très bien ! 👍", "#22C55E"];
    if (s >= 40) return ["Presque ! Encore un effort 💪", "#F59E0B"];
    return ["Réessaie, tu vas y arriver 🙂", "#EF4444"];
  }
  function recordPron(score) {
    P.pron.count++; P.pron.sum += score; if (score >= 85) P.pron.great++; save();
  }
  const SPEECH_ERR = {
    unavailable: "La reconnaissance vocale n'est pas disponible. Installe ou active l'application « Google » (reconnaissance vocale) sur ton téléphone.",
    permission: "Autorise l'accès au micro pour pratiquer l'oral.",
    nomatch: "Je n'ai rien compris. Parle un peu plus fort et plus près du micro.",
    timeout: "Je n'ai rien entendu. Appuie sur le micro puis parle.",
    network: "La reconnaissance vocale a besoin d'Internet sur ce téléphone (ou télécharge l'anglais hors ligne dans les réglages Google)."
  };

  /**
   * Composant « écoute & prononce » réutilisable.
   * item = {en, fr, ph}; onScore(score) appelé à chaque essai.
   */
  function pronounceWidget(box, item, onScore, opts = {}) {
    box.innerHTML = `
      <div class="pron">
        ${opts.hideText ? `<div class="target" id="pt">🙈 ••• </div>` : `<div class="target">${esc(item.en)}</div>`}
        ${item.ph && !opts.hideText ? `<div class="ph">🗣️ ${esc(item.ph)}</div>` : ""}
        ${item.fr ? `<div class="muted">${esc(item.fr)}</div>` : ""}
        <div class="row" style="justify-content:center;margin-top:10px">
          <button class="btn sec small" data-a="listen">🔊 Écouter</button>
          <button class="btn sec small" data-a="slow">🐢 Lentement</button>
          ${opts.hideText ? `<button class="btn sec small" data-a="show">👀 Voir</button>` : ""}
        </div>
        <button class="mic" data-a="mic">🎤</button>
        <div class="muted" id="pstate">Appuie sur le micro et dis la phrase en anglais</div>
        <div id="pres"></div>
      </div>`;
    const st = $("#pstate", box), res = $("#pres", box), mic = $('[data-a="mic"]', box);
    box.querySelector('[data-a="listen"]').onclick = () => say(item.en);
    box.querySelector('[data-a="slow"]').onclick = () => say(item.en, true);
    const showB = box.querySelector('[data-a="show"]');
    if (showB) showB.onclick = () => { $("#pt", box).textContent = item.en; };
    mic.onclick = async () => {
      if (mic.classList.contains("listening")) return;
      Speech.stop();
      mic.classList.add("listening"); st.textContent = "🎙️ Je t'écoute… parle maintenant !"; res.innerHTML = "";
      try {
        const alts = await Speech.listen();
        mic.classList.remove("listening");
        const r = scoreSpeech(item.en, alts);
        const [txt, col] = verdict(r.score);
        const words = item.en.split(/\s+/);
        const tnorm = norm(item.en);
        const colored = tnorm.length === words.length
          ? words.map((w, i) => `<span class="wd ${r.flags[i] ? "y" : "n"}">${esc(w)}</span>`).join("")
          : `<span class="wd ${r.score >= 65 ? "y" : "n"}">${esc(item.en)}</span>`;
        res.innerHTML = `
          <div class="ringscore" style="--p:${r.score};--c:${col}"><span>${r.score}%</span></div>
          <h3 style="color:${col}">${txt}</h3>
          <div>${colored}</div>
          <div class="heard">J'ai entendu : « ${esc(r.heard || "…")} »</div>`;
        st.textContent = "Tu peux réessayer autant que tu veux.";
        beep(r.score >= 65);
        recordPron(r.score);
        if (r.score >= 65) norm(item.en).length <= 2 && learnWord(item.en);
        onScore && onScore(r.score);
      } catch (code) {
        mic.classList.remove("listening");
        st.textContent = SPEECH_ERR[code] || "Petit souci avec le micro, réessaie.";
      }
    };
  }

  /* ---------------- Navigation ---------------- */
  const stack = [];
  let currentTab = "home";
  function go(fn, ...args) { stack.push([fn, args]); render(); }
  function render() {
    Speech.stop();
    const [fn, args] = stack[stack.length - 1];
    main.innerHTML = ""; main.style.animation = "none"; void main.offsetWidth; main.style.animation = "";
    fn(main, ...args);
    updateHeader();
    window.scrollTo(0, 0);
  }
  function goBack() {
    if ($(".feedback")) { $(".feedback").remove(); }
    if (stack.length > 1) { stack.pop(); render(); return true; }
    if (currentTab !== "home") { setTab("home"); return true; }
    return false;
  }
  window.goBack = goBack;
  const TABS = { home: Home, lessons: Lessons, games: Games, scenes: Scenes, scores: Scores };
  function setTab(t) {
    currentTab = t; stack.length = 0;
    $$("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === t));
    go(TABS[t]);
  }
  $$("#tabs button").forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
  const backBtn = (label = "Retour") => `<button class="back" data-back>‹ ${label}</button>`;
  function bindBack(el) { $$("[data-back]", el).forEach((b) => (b.onclick = goBack)); }
  const starsHtml = (n) => `<span class="stars">${[1, 2, 3].map((i) => `<span class="${i <= n ? "on" : ""}">★</span>`).join("")}</span>`;

  /* ---------------- Contenu utilitaire ---------------- */
  const wordItems = (u) => u.words.map(([en, fr, ph]) => ({ en, fr, ph, unit: u.id, kind: "word" }));
  const phraseItems = (u) => u.phrases.map(([en, fr]) => ({ en, fr, unit: u.id, kind: "phrase" }));
  const allWords = () => UNITS.flatMap(wordItems);
  const allPhrases = () => UNITS.flatMap(phraseItems);
  function poolFor(unitId) {
    const us = unitId === "all" ? UNITS : UNITS.filter((u) => u.id === unitId);
    return { words: us.flatMap(wordItems), phrases: us.flatMap(phraseItems) };
  }

  /* ---------------- Générateur de questions ---------------- */
  function distractors(item, key, pool, n = 3) {
    const same = pool.filter((x) => x[key] !== item[key] && x.kind === item.kind);
    const others = (item.kind === "word" ? allWords() : allPhrases()).filter((x) => x[key] !== item[key]);
    const out = [];
    for (const x of shuffle(same).concat(shuffle(others))) { if (out.length >= n) break; if (!out.includes(x[key])) out.push(x[key]); }
    return out;
  }
  function makeQ(type, item, pool) {
    switch (type) {
      case "en2fr": return { type: "choice", item, prompt: item.en, speak: item.en, sub: "Que veut dire ce mot ?", answer: item.fr, options: shuffle([item.fr, ...distractors(item, "fr", pool)]) };
      case "fr2en": return { type: "choice", item, prompt: item.fr, sub: "Comment dit-on en anglais ?", answer: item.en, options: shuffle([item.en, ...distractors(item, "en", pool)]) };
      case "listen": return { type: "choice", item, listen: true, speak: item.en, sub: "Écoute et choisis ce que tu entends", answer: item.en, options: shuffle([item.en, ...distractors(item, "en", pool)]) };
      case "order": return { type: "order", item, prompt: item.fr, sub: "Remets les mots dans l'ordre", answer: item.en };
      case "type": return { type: "type", item, prompt: item.fr, sub: "Écris le mot en anglais", answer: item.en };
    }
  }
  function lessonQuestions(u) {
    const ws = wordItems(u), ps = phraseItems(u), pool = ws.concat(ps);
    const qs = [];
    pick(ws, 3).forEach((w) => qs.push(makeQ("en2fr", w, pool)));
    pick(ws, 2).forEach((w) => qs.push(makeQ("fr2en", w, pool)));
    pick(ws, 2).forEach((w) => qs.push(makeQ("listen", w, pool)));
    pick(ws, 1).forEach((w) => qs.push(makeQ("type", w, pool)));
    pick(ps, 2).forEach((p) => qs.push(makeQ("order", p, pool)));
    return shuffle(qs);
  }

  /**
   * Moteur de quiz générique.
   */
  function runQuiz(box, questions, opt) {
    let i = 0, ok = 0, combo = 0, points = 0;
    const total = questions.length;
    function next() {
      if (i >= total) return finish();
      const q = questions[i];
      box.innerHTML = `
        <div class="qhead">
          <button class="iconbtn" data-quit>✕</button>
          <div class="progress grow"><div style="width:${(i / total) * 100}%"></div></div>
          <b>${combo >= 2 ? "🔥" + combo : ""}</b>
        </div>
        <div id="qbody"></div>`;
      $("[data-quit]", box).onclick = goBack;
      const body = $("#qbody", box);
      if (q.type === "choice") renderChoice(body, q); else if (q.type === "order") renderOrder(body, q); else renderType(body, q);
    }
    function answered(correct, q, note) {
      P.answers.total++; if (correct) { P.answers.ok++; ok++; combo++; learnWord(q.item.en); } else combo = 0;
      const gain = correct ? 10 + Math.min(combo - 1, 5) * 2 : 0;
      points += gain; save();
      beep(correct);
      const fb = document.createElement("div");
      fb.className = "feedback " + (correct ? "good" : "badf");
      fb.innerHTML = `
        <h3>${correct ? (note || "Bravo ! ✅") + (gain ? ` +${gain} XP` : "") : "Pas tout à fait ❌"}</h3>
        <div style="margin:4px 0 10px">Réponse : <b>${esc(q.answer)}</b>${q.item.fr && q.answer !== q.item.fr ? ` — ${esc(q.item.fr)}` : ""}</div>
        <div class="row"><button class="iconbtn" data-s>🔊</button><button class="btn ${correct ? "ok" : ""} grow" data-n>Continuer</button></div>`;
      document.body.appendChild(fb);
      say(q.item.en);
      $("[data-s]", fb).onclick = () => say(q.item.en);
      $("[data-n]", fb).onclick = () => { fb.remove(); i++; next(); };
    }
    function renderChoice(body, q) {
      body.innerHTML = `
        ${q.listen ? `<button class="bigspeak" data-sp>🔊</button><div class="center"><button class="btn ghost small" data-slow>🐢 Plus lentement</button></div>`
          : `<div class="qprompt">${esc(q.prompt)} ${q.speak ? `<button class="iconbtn" data-sp>🔊</button>` : ""}</div>`}
        <div class="qsub">${q.sub}</div>
        <div class="opts">${q.options.map((o) => `<button class="opt">${esc(o)}</button>`).join("")}</div>`;
      const sp = $("[data-sp]", body); if (sp) sp.onclick = () => say(q.speak);
      const sl = $("[data-slow]", body); if (sl) sl.onclick = () => say(q.speak, true);
      if (q.speak) setTimeout(() => say(q.speak), 250);
      let done = false;
      $$(".opt", body).forEach((b) => (b.onclick = () => {
        if (done) return; done = true;
        const correct = b.textContent === q.answer;
        $$(".opt", body).forEach((x) => { if (x.textContent === q.answer) x.classList.add("right"); });
        if (!correct) b.classList.add("wrong");
        answered(correct, q);
      }));
    }
    function renderOrder(body, q) {
      const toks = q.answer.split(/\s+/);
      const chips = shuffle(toks.map((t, k) => ({ t, k })));
      body.innerHTML = `
        <div class="qprompt" style="font-size:19px">${esc(q.prompt)}</div>
        <div class="qsub">${q.sub}</div>
        <div class="answer" id="ans"></div>
        <div class="chips" id="pool">${chips.map((c, idx) => `<button class="chip" data-i="${idx}">${esc(c.t)}</button>`).join("")}</div>
        <div style="margin-top:20px" class="row"><button class="btn sec" data-clr>↺</button><button class="btn grow" data-ok disabled>Vérifier</button></div>`;
      const ans = $("#ans", body), okb = $("[data-ok]", body);
      const chosen = [];
      $$("#pool .chip", body).forEach((b) => (b.onclick = () => {
        if (b.classList.contains("used")) return;
        b.classList.add("used"); chosen.push(+b.dataset.i);
        const c = document.createElement("button"); c.className = "chip"; c.textContent = b.textContent;
        c.onclick = () => { const pos = chosen.indexOf(+b.dataset.i); chosen.splice(pos, 1); c.remove(); b.classList.remove("used"); okb.disabled = chosen.length !== toks.length; };
        ans.appendChild(c);
        okb.disabled = chosen.length !== toks.length;
      }));
      $("[data-clr]", body).onclick = () => { chosen.length = 0; ans.innerHTML = ""; $$("#pool .chip", body).forEach((b) => b.classList.remove("used")); okb.disabled = true; };
      okb.onclick = () => {
        okb.disabled = true;
        const built = chosen.map((ix) => chips[ix].t).join(" ");
        answered(norm(built).join(" ") === norm(q.answer).join(" "), q);
      };
    }
    function renderType(body, q) {
      body.innerHTML = `
        <div class="qprompt">${esc(q.prompt)}</div>
        <div class="qsub">${q.sub}${q.item.ph ? ` · indice : <i>${esc(q.item.ph)}</i>` : ""}</div>
        <input class="type" id="tin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Écris ici…">
        <div style="margin-top:14px" class="row"><button class="btn sec" data-h>💡 Écouter</button><button class="btn grow" data-ok>Vérifier</button></div>`;
      const inp = $("#tin", body);
      setTimeout(() => inp.focus(), 200);
      $("[data-h]", body).onclick = () => say(q.answer);
      const check = () => {
        const a = norm(inp.value).join(" "), b = norm(q.answer).join(" ");
        if (!a) return;
        inp.blur(); $("[data-ok]", body).disabled = true;
        if (a === b) answered(true, q);
        else if (b.length > 4 && lev(a, b) <= 1) answered(true, q, "Presque parfait (petite faute) ✅");
        else answered(false, q);
      };
      $("[data-ok]", body).onclick = check;
      inp.onkeydown = (e) => { if (e.key === "Enter") check(); };
    }
    function finish() {
      const pct = Math.round((ok / total) * 100);
      const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
      if (ok === total) P.perfect++;
      save();
      addXP(points);
      if (stars >= 2) confetti();
      box.innerHTML = `
        <div class="card result">
          <div class="big">${stars === 3 ? "🏆" : stars === 2 ? "🎉" : stars === 1 ? "👍" : "💪"}</div>
          <div class="sc">${ok} / ${total}</div>
          ${starsHtml(stars).replace('class="stars"', 'class="stars" style="font-size:34px"')}
          <p class="muted">+${points} XP gagnés</p>
          <p>${stars >= 2 ? "Super travail !" : "Chaque essai te fait progresser. Recommence quand tu veux, sans pression."}</p>
          <div class="row"><button class="btn sec grow" data-again>↺ Rejouer</button><button class="btn grow" data-done>Terminer</button></div>
        </div>`;
      $("[data-again]", box).onclick = () => opt.again ? opt.again() : render();
      $("[data-done]", box).onclick = goBack;
      opt.onFinish && opt.onFinish({ ok, total, pct, stars, points });
    }
    next();
  }

  /* =========================================================
     ÉCRANS
     ========================================================= */

  function Home(el) {
    const lvl = levelOf(P.xp), cur = xpForLevel(lvl), nxt = xpForLevel(lvl + 1);
    const nextUnit = UNITS.find((u) => !(P.units[u.id] || {}).stars) || UNITS[0];
    el.innerHTML = `
      <div class="card hero">
        <h1 style="margin:0 0 4px">Hello ! 👋</h1>
        <div class="muted">Apprends l'anglais à ton rythme. Pas d'abonnement, pas d'objectif quotidien, pas de chrono : juste toi et tes progrès.</div>
        <div style="margin:14px 0 6px" class="row"><b>Niveau ${lvl} · ${levelName(lvl)}</b><span class="grow"></span><small>${P.xp - cur} / ${nxt - cur} XP</small></div>
        <div class="progress"><div style="width:${((P.xp - cur) / (nxt - cur)) * 100}%"></div></div>
      </div>
      <div class="card tap unit" id="cont">
        <div class="em">${nextUnit.emoji}</div>
        <div class="grow"><div class="muted">Continuer</div><h3>${nextUnit.title}</h3><span class="tag">${nextUnit.level}</span></div>
        <button class="btn small">▶</button>
      </div>
      <h2>Que veux-tu faire ?</h2>
      <div class="grid2">
        <button class="tile" data-t="lessons"><span class="em">📚</span><b>Leçons</b><small>Écrit + oral, 12 thèmes</small></button>
        <button class="tile" data-t="games"><span class="em">🎮</span><b>Jeux</b><small>6 jeux pour apprendre en s'amusant</small></button>
        <button class="tile" data-t="scenes"><span class="em">🎬</span><b>Situations</b><small>Scènes animées et jeux de rôle</small></button>
        <button class="tile" data-g="pron"><span class="em">🎤</span><b>Prononciation</b><small>Parle et reçois un score</small></button>
      </div>
      <h2>Tes progrès</h2>
      <div class="statgrid">
        <div class="stat"><b>${Object.keys(P.words).length}</b><small>mots appris</small></div>
        <div class="stat"><b>${doneUnits()}/${UNITS.length}</b><small>leçons terminées</small></div>
      </div>`;
    $("#cont", el).onclick = () => go(Lesson, nextUnit);
    $$("[data-t]", el).forEach((b) => (b.onclick = () => setTab(b.dataset.t)));
    $('[data-g="pron"]', el).onclick = () => { currentTab = "games"; $$("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === "games")); stack.length = 0; stack.push([Games, []]); go(GamePron); };
  }

  function Lessons(el) {
    el.innerHTML = `<h1>📚 Leçons</h1>
      <p class="muted">Toutes les leçons sont ouvertes : commence où tu veux. Chaque leçon a 3 étapes : 📖 lire, 🎤 répéter à voix haute, ✍️ s'exercer.</p>
      ${UNITS.map((u, i) => {
        const s = (P.units[u.id] || {}).stars || 0;
        return `<div class="card tap unit" data-u="${i}">
          <div class="em">${u.emoji}</div>
          <div class="grow"><h3>${i + 1}. ${u.title}</h3>
            <div class="row"><span class="tag ${s ? "done" : ""}">${s ? "Terminé" : u.level}</span>${starsHtml(s)}</div></div>
          <span style="font-size:22px;color:#9CA3AF">›</span></div>`;
      }).join("")}`;
    $$("[data-u]", el).forEach((c) => (c.onclick = () => go(Lesson, UNITS[+c.dataset.u])));
  }

  function Lesson(el, u, step = "read") {
    el.innerHTML = `${backBtn("Leçons")}
      <h1>${u.emoji} ${u.title}</h1>
      <div class="steps">
        <button data-s="read">📖 Lire</button>
        <button data-s="oral">🎤 Répéter</button>
        <button data-s="ex">✍️ Exercice</button>
      </div>
      <div id="lbody"></div>`;
    bindBack(el);
    const body = $("#lbody", el);
    const show = (s) => {
      Speech.stop();
      $$(".steps button", el).forEach((b) => b.classList.toggle("active", b.dataset.s === s));
      if (s === "read") LessonRead(body, u, show);
      if (s === "oral") LessonOral(body, u, show);
      if (s === "ex") LessonEx(body, u);
    };
    $$(".steps button", el).forEach((b) => (b.onclick = () => show(b.dataset.s)));
    show(step);
  }

  function LessonRead(body, u, show) {
    body.innerHTML = `
      <div class="card lessontext">${u.lesson}</div>
      <h2>Vocabulaire <small class="muted">(touche 🔊 pour écouter)</small></h2>
      <div class="card">${u.words.map(([en, fr, ph], i) => `
        <div class="word"><button class="iconbtn" data-w="${i}">🔊</button>
          <div class="grow"><div class="en">${esc(en)}</div><div class="ph">${esc(ph)}</div></div>
          <div class="fr">${esc(fr)}</div></div>`).join("")}
      </div>
      <p class="muted" style="font-size:12px">ℹ️ Prononciation figurée : les syllabes en MAJUSCULES sont accentuées. « TH » = langue entre les dents (souffle), « Z » dans « ZE » = TH doux.</p>
      <h2>Phrases utiles</h2>
      <div class="card">${u.phrases.map(([en, fr], i) => `
        <div class="word"><button class="iconbtn" data-p="${i}">🔊</button>
          <div class="grow"><div class="en" style="font-size:16px">${esc(en)}</div><div class="fr">${esc(fr)}</div></div>
          <button class="iconbtn" data-ps="${i}">🐢</button></div>`).join("")}
      </div>
      <button class="btn full" data-next>Étape suivante : 🎤 Répéter ›</button>`;
    $$("[data-w]", body).forEach((b) => (b.onclick = () => { say(u.words[+b.dataset.w][0]); learnWord(u.words[+b.dataset.w][0]); }));
    $$("[data-p]", body).forEach((b) => (b.onclick = () => say(u.phrases[+b.dataset.p][0])));
    $$("[data-ps]", body).forEach((b) => (b.onclick = () => say(u.phrases[+b.dataset.ps][0], true)));
    $("[data-next]", body).onclick = () => show("oral");
  }

  function LessonOral(body, u, show) {
    const items = pick(wordItems(u), 5).concat(phraseItems(u));
    const scores = new Array(items.length).fill(0);
    let i = 0;
    function draw() {
      body.innerHTML = `
        <div class="qhead"><div class="progress grow"><div style="width:${(i / items.length) * 100}%"></div></div><b>${i + 1}/${items.length}</b></div>
        <div class="card" id="pw"></div>
        <div class="row"><button class="btn sec" data-prev ${i === 0 ? "disabled" : ""}>‹</button>
          <button class="btn grow" data-next>${i === items.length - 1 ? "Terminer" : "Suivant ›"}</button></div>
        <p class="muted center" style="font-size:13px">Pas de pression : tu peux passer un mot et revenir plus tard.</p>`;
      pronounceWidget($("#pw", body), items[i], (s) => { scores[i] = Math.max(scores[i], s); });
      setTimeout(() => say(items[i].en), 300);
      $("[data-prev]", body).onclick = () => { i--; draw(); };
      $("[data-next]", body).onclick = () => { if (i < items.length - 1) { i++; draw(); } else end(); };
    }
    function end() {
      const tried = scores.filter((s) => s > 0);
      const avg = tried.length ? Math.round(tried.reduce((a, b) => a + b, 0) / tried.length) : 0;
      const xp = tried.reduce((a, s) => a + Math.round(s / 10), 0);
      const st = P.units[u.id] = P.units[u.id] || {}; st.oral = Math.max(st.oral || 0, avg); save();
      addXP(xp);
      if (avg >= 75) confetti();
      body.innerHTML = `<div class="card result">
        <div class="big">🗣️</div><div class="sc">${avg}%</div>
        <p>Score moyen de prononciation (${tried.length} essais) · +${xp} XP</p>
        <button class="btn full" data-ex>Étape suivante : ✍️ Exercice ›</button>
        <button class="btn ghost full" data-again>↺ Recommencer l'oral</button></div>`;
      $("[data-ex]", body).onclick = () => show("ex");
      $("[data-again]", body).onclick = () => show("oral");
    }
    draw();
  }

  function LessonEx(body, u) {
    runQuiz(body, lessonQuestions(u), {
      again: () => LessonEx(body, u),
      onFinish: ({ stars, pct }) => {
        const st = P.units[u.id] = P.units[u.id] || {};
        st.stars = Math.max(st.stars || 0, stars || (pct > 0 ? 1 : 0));
        st.best = Math.max(st.best || 0, pct);
        save(); checkBadges();
      }
    });
  }

  /* ---------------- Jeux ---------------- */
  const GAMES = [
    { id: "quiz", em: "⚡", name: "Quiz éclair", desc: "Traduis vite et enchaîne les combos" },
    { id: "memory", em: "🃏", name: "Memory", desc: "Retrouve les paires anglais / français" },
    { id: "order", em: "🧩", name: "Phrases en désordre", desc: "Reconstruis la phrase" },
    { id: "listen", em: "👂", name: "Écoute & choisis", desc: "Entraîne ton oreille" },
    { id: "pron", em: "🎤", name: "Défi prononciation", desc: "Parle et vise 100 %" },
    { id: "letters", em: "🔤", name: "Lettres mélangées", desc: "Épelle le mot anglais" }
  ];
  function Games(el) {
    el.innerHTML = `<h1>🎮 Jeux</h1>
      <div class="card"><label class="muted">Thème des jeux</label>
        <select id="gu"><option value="all">🌍 Tous les thèmes</option>${UNITS.map((u) => `<option value="${u.id}">${u.emoji} ${u.title}</option>`).join("")}</select></div>
      <div class="grid2">${GAMES.map((g) => `<button class="tile" data-g="${g.id}"><span class="em">${g.em}</span><b>${g.name}</b><small>${g.desc}</small>
        ${P.games.best[g.id] ? `<small>🏅 Record : ${P.games.best[g.id]}</small>` : ""}</button>`).join("")}</div>`;
    const sel = $("#gu", el); sel.value = P.settings.gameUnit; sel.onchange = () => { P.settings.gameUnit = sel.value; save(); };
    const map = { quiz: GameQuiz, memory: GameMemory, order: GameOrder, listen: GameListen, pron: GamePron, letters: GameLetters };
    $$("[data-g]", el).forEach((b) => (b.onclick = () => go(map[b.dataset.g])));
  }
  function gameDone(id, score) {
    P.games.played++;
    P.games.best[id] = Math.max(P.games.best[id] || 0, score);
    save(); checkBadges();
  }
  function GameQuiz(el) {
    const { words, phrases } = poolFor(P.settings.gameUnit); const pool = words.concat(phrases);
    const qs = pick(words, 10).map((w, k) => makeQ(k % 2 ? "fr2en" : "en2fr", w, pool));
    runQuiz(el, qs, { again: () => render(), onFinish: (r) => gameDone("quiz", r.points) });
  }
  function GameListen(el) {
    const { words, phrases } = poolFor(P.settings.gameUnit); const pool = words.concat(phrases);
    const items = pick(words, 6).concat(pick(phrases, 4));
    runQuiz(el, shuffle(items).map((w) => makeQ("listen", w, pool)), { again: () => render(), onFinish: (r) => gameDone("listen", r.points) });
  }
  function GameOrder(el) {
    const { words, phrases } = poolFor(P.settings.gameUnit); const pool = words.concat(phrases);
    let src = phrases.slice();
    if (src.length < 8) src = src.concat(allPhrases().filter((p) => !src.includes(p)));
    runQuiz(el, pick(src, 8).map((p) => makeQ("order", p, pool)), { again: () => render(), onFinish: (r) => gameDone("order", r.points) });
  }
  function GameMemory(el) {
    const { words } = poolFor(P.settings.gameUnit);
    const sel = pick(words, 6);
    const cards = shuffle(sel.flatMap((w, k) => [{ k, txt: w.en, en: true, w }, { k, txt: w.fr, en: false, w }]));
    let open = [], found = 0, moves = 0, lock = false;
    el.innerHTML = `${backBtn("Jeux")}<h1>🃏 Memory</h1>
      <p class="muted">Retourne les cartes et associe chaque mot anglais à sa traduction. Coups : <b id="mv">0</b></p>
      <div class="mem">${cards.map((c, i) => `<div class="mcard" data-i="${i}"><div class="in"><div class="f">?</div><div class="b ${c.en ? "en" : ""}">${esc(c.txt)}</div></div></div>`).join("")}</div>`;
    bindBack(el);
    $$(".mcard", el).forEach((d) => (d.onclick = async () => {
      const i = +d.dataset.i, c = cards[i];
      if (lock || d.classList.contains("flip")) return;
      d.classList.add("flip"); if (c.en) say(c.txt);
      open.push([d, c]);
      if (open.length === 2) {
        moves++; $("#mv", el).textContent = moves; lock = true;
        const [[d1, c1], [d2, c2]] = open; open = [];
        if (c1.k === c2.k && c1.en !== c2.en) {
          d1.classList.add("done"); d2.classList.add("done"); beep(true); found++; learnWord(c1.w.en); lock = false;
          if (found === sel.length) {
            const score = Math.max(20, 120 - (moves - 6) * 8);
            await sleep(500); confetti(); addXP(Math.round(score / 3)); gameDone("memory", score);
            el.insertAdjacentHTML("beforeend", `<div class="card result" style="margin-top:14px"><div class="big">🎉</div><div class="sc">${score} pts</div>
              <p>Terminé en ${moves} coups · +${Math.round(score / 3)} XP</p><button class="btn full" data-again>↺ Rejouer</button></div>`);
            $("[data-again]", el).onclick = () => render();
          }
        } else {
          await sleep(900); d1.classList.remove("flip"); d2.classList.remove("flip"); lock = false;
        }
      }
    }));
  }
  function GameLetters(el) {
    const { words } = poolFor(P.settings.gameUnit);
    const items = pick(words.filter((w) => /^[a-z]+$/i.test(w.en) && w.en.length >= 3), 8);
    let i = 0, score = 0;
    function draw() {
      if (i >= items.length) {
        confetti(); addXP(score); gameDone("letters", score);
        el.innerHTML = `<div class="card result"><div class="big">🔤</div><div class="sc">${score} pts</div><p>+${score} XP</p>
          <div class="row"><button class="btn sec grow" data-again>↺ Rejouer</button><button class="btn grow" data-back>Terminer</button></div></div>`;
        $("[data-again]", el).onclick = () => render(); bindBack(el); return;
      }
      const w = items[i], target = w.en.toLowerCase();
      let letters = shuffle(target.split("").map((ch, k) => ({ ch, k })));
      if (letters.map((x) => x.ch).join("") === target) letters = letters.reverse();
      let typed = [], hints = 0;
      el.innerHTML = `
        <div class="qhead"><button class="iconbtn" data-back>✕</button><div class="progress grow"><div style="width:${(i / items.length) * 100}%"></div></div><b>${score} pts</b></div>
        <div class="qprompt">${esc(w.fr)}</div><div class="qsub">Épelle le mot en anglais</div>
        <div class="answer" id="ans" style="justify-content:center;font-size:26px;font-weight:900;letter-spacing:4px"></div>
        <div class="chips" id="pool">${letters.map((l, idx) => `<button class="chip" data-i="${idx}" style="min-width:44px;font-size:20px">${l.ch.toUpperCase()}</button>`).join("")}</div>
        <div class="row" style="margin-top:20px"><button class="btn sec" data-clr>↺</button><button class="btn sec" data-hint>💡 Indice</button><button class="btn sec" data-sp>🔊</button></div>`;
      bindBack(el);
      const ans = $("#ans", el);
      const upd = () => { ans.textContent = typed.map((x) => letters[x].ch.toUpperCase()).join("") || "…"; };
      upd();
      const check = () => {
        if (typed.length !== target.length) return;
        const word = typed.map((x) => letters[x].ch).join("");
        if (word === target) {
          const g = Math.max(4, 15 - hints * 4); score += g; beep(true); learnWord(w.en); say(w.en);
          toast(`✅ ${w.en} = ${w.fr}  +${g}`); i++; setTimeout(draw, 900);
        } else { beep(false); ans.classList.add("wrong"); toast("Pas encore… essaie un autre ordre"); }
      };
      $$("#pool .chip", el).forEach((b) => (b.onclick = () => {
        if (b.classList.contains("used")) return; b.classList.add("used"); typed.push(+b.dataset.i); upd(); check();
      }));
      $("[data-clr]", el).onclick = () => { typed = []; $$("#pool .chip", el).forEach((b) => b.classList.remove("used")); upd(); };
      $("[data-sp]", el).onclick = () => say(w.en);
      $("[data-hint]", el).onclick = () => {
        hints++; typed = []; $$("#pool .chip", el).forEach((b) => b.classList.remove("used"));
        const n = Math.min(hints, target.length - 1);
        for (let p = 0; p < n; p++) {
          const idx = letters.findIndex((l, ix) => l.ch === target[p] && !typed.includes(ix));
          typed.push(idx); $(`#pool .chip[data-i="${idx}"]`, el).classList.add("used");
        }
        upd();
      };
    }
    draw();
  }
  function GamePron(el) {
    const { words, phrases } = poolFor(P.settings.gameUnit);
    const items = shuffle(pick(words, 4).concat(pick(phrases, 4)));
    const scores = new Array(items.length).fill(0);
    let i = 0;
    function draw() {
      el.innerHTML = `
        <div class="qhead"><button class="iconbtn" data-back>✕</button><div class="progress grow"><div style="width:${(i / items.length) * 100}%"></div></div><b>${i + 1}/${items.length}</b></div>
        <h1 class="center">🎤 Défi prononciation</h1>
        <div class="card" id="pw"></div>
        <button class="btn full" data-next>${i === items.length - 1 ? "Voir mon score" : "Suivant ›"}</button>`;
      bindBack(el);
      pronounceWidget($("#pw", el), items[i], (s) => { scores[i] = Math.max(scores[i], s); });
      $("[data-next]", el).onclick = () => { if (i < items.length - 1) { i++; draw(); } else end(); };
    }
    function end() {
      const total = scores.reduce((a, b) => a + b, 0), avg = Math.round(total / items.length);
      addXP(Math.round(total / 10)); gameDone("pron", avg); if (avg >= 70) confetti();
      el.innerHTML = `<div class="card result"><div class="big">🗣️</div><div class="sc">${avg}%</div>
        <p>Précision moyenne · +${Math.round(total / 10)} XP</p>
        ${items.map((it, k) => `<div class="row" style="justify-content:space-between;padding:4px 0"><span>${esc(it.en)}</span><b>${scores[k]}%</b></div>`).join("")}
        <div class="row" style="margin-top:12px"><button class="btn sec grow" data-again>↺ Rejouer</button><button class="btn grow" data-back>Terminer</button></div></div>`;
      $("[data-again]", el).onclick = () => render(); bindBack(el);
    }
    draw();
  }

  /* ---------------- Situations (scènes animées) ---------------- */
  function Scenes(el) {
    el.innerHTML = `<h1>🎬 Situations</h1>
      <p class="muted">Regarde des scènes animées de la vie réelle, avec voix et sous-titres, puis joue le rôle toi-même en parlant dans le micro.</p>
      ${SCENES.map((s, i) => {
        const best = P.scenes[s.id];
        return `<div class="card tap unit" data-s="${i}">
          <div class="em" style="background:${s.bg}">${s.emoji}</div>
          <div class="grow"><h3>${s.title}</h3><div class="muted">${s.place}</div>
          ${best != null ? `<span class="tag done">🎤 Meilleur score : ${best}%</span>` : `<span class="tag">${s.lines.length} répliques</span>`}</div>
          <span style="font-size:22px;color:#9CA3AF">›</span></div>`;
      }).join("")}`;
    $$("[data-s]", el).forEach((c) => (c.onclick = () => go(Scene, SCENES[+c.dataset.s])));
  }

  function Scene(el, sc) {
    let idx = 0, playing = false, showFr = true, runId = 0;
    el.innerHTML = `${backBtn("Situations")}
      <h1>${sc.emoji} ${sc.title}</h1>
      <div class="stage" style="background:${sc.bg}">
        <div class="place">📍 ${esc(sc.place)}</div>
        <div class="props">${sc.props}</div>
        <div class="floor"></div>
        ${sc.chars.map((c, k) => `<div class="actor a${k}" id="ac${k}"><div class="av">${c.emoji}</div><br><span class="nm">${esc(c.name)}</span></div>`).join("")}
        <div id="bub"></div>
      </div>
      <div class="controls">
        <button class="iconbtn" data-prev>⏮</button>
        <button class="btn" data-play style="min-width:130px">▶ Regarder</button>
        <button class="iconbtn" data-nextl>⏭</button>
        <button class="iconbtn" data-slow title="Lentement">🐢</button>
      </div>
      <div class="row" style="justify-content:center;margin-bottom:12px">
        <label class="switch"><input type="checkbox" id="frT" checked> Sous-titres français</label>
      </div>
      <div class="card">
        <h3>🎭 Joue le rôle</h3>
        <p class="muted">L'autre personnage te parle, et tu réponds à voix haute. Tu reçois un score pour chaque réplique.</p>
        <div class="row wrap">${sc.chars.map((c, k) => `<button class="btn ${k ? "sec" : "acc"} grow" data-role="${k}">${c.emoji} Jouer « ${esc(c.name)} »</button>`).join("")}</div>
      </div>
      <div class="card" id="script"><h3>📜 Dialogue complet</h3>${sc.lines.map((l, k) => `
        <div class="line" data-l="${k}"><span class="who">${sc.chars[l[0]].emoji}</span><div class="tx grow"><b>${esc(l[1])}</b><small>${esc(l[2])}</small></div><button class="iconbtn" data-say="${k}">🔊</button></div>`).join("")}
      </div>
      <button class="btn sec full" data-video>📺 Voir de vraies vidéos de cette situation (YouTube, gratuit)</button>
      <p class="muted center" style="font-size:12px">Nécessite Internet. Les scènes animées ci-dessus fonctionnent hors ligne.</p>`;
    bindBack(el);
    const bub = $("#bub", el), playB = $("[data-play]", el);
    const voiceOf = (k) => ({ pitch: sc.chars[k].pitch, voice: sc.chars[k].voice });
    function showLine(k, extra = "") {
      const [sp, en, fr] = sc.lines[k];
      $$(".actor", el).forEach((a, j) => a.classList.toggle("talk", j === sp));
      bub.innerHTML = `<div class="bubble s${sp}">${esc(en)}${showFr ? `<small>${esc(fr)}</small>` : ""}${extra}</div>`;
      $$(".line", el).forEach((l) => l.classList.toggle("cur", +l.dataset.l === k));
    }
    function idle() { $$(".actor", el).forEach((a) => a.classList.remove("talk")); }
    async function play(fromK, slow) {
      const my = ++runId; playing = true; playB.textContent = "⏸ Pause";
      for (let k = fromK; k < sc.lines.length; k++) {
        if (my !== runId) return;
        idx = k; showLine(k);
        await Speech.speak(sc.lines[k][1], Object.assign(voiceOf(sc.lines[k][0]), slow ? { rate: 0.6 } : {}));
        if (my !== runId) return;
        idle(); await sleep(450);
      }
      playing = false; playB.textContent = "↺ Revoir"; idx = 0;
      P.seen = P.seen || {};
      if (!P.seen[sc.id]) { P.seen[sc.id] = 1; save(); addXP(15); toast("🎬 Scène regardée : +15 XP"); }
      bub.innerHTML = `<div class="bubble s0">🎬 Fin de la scène ! À toi de jouer le rôle 👇</div>`;
    }
    function stop() { runId++; playing = false; Speech.stop(); idle(); playB.textContent = "▶ Reprendre"; }
    playB.onclick = () => (playing ? stop() : play(idx));
    $("[data-slow]", el).onclick = () => { stop(); play(idx, true); };
    $("[data-prev]", el).onclick = () => { stop(); idx = Math.max(0, idx - 1); showLine(idx); Speech.speak(sc.lines[idx][1], voiceOf(sc.lines[idx][0])); };
    $("[data-nextl]", el).onclick = () => { stop(); idx = Math.min(sc.lines.length - 1, idx + 1); showLine(idx); Speech.speak(sc.lines[idx][1], voiceOf(sc.lines[idx][0])); };
    $("#frT", el).onchange = (e) => { showFr = e.target.checked; if (bub.innerHTML) showLine(idx); };
    $$("[data-say]", el).forEach((b) => (b.onclick = () => { stop(); idx = +b.dataset.say; showLine(idx); Speech.speak(sc.lines[idx][1], voiceOf(sc.lines[idx][0])).then(idle); }));
    $$("[data-role]", el).forEach((b) => (b.onclick = () => { stop(); go(RolePlay, sc, +b.dataset.role); }));
    $("[data-video]", el).onclick = () => {
      const url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(sc.video);
      if (NB) NB.openUrl(url); else window.open(url, "_blank");
    };
    bub.innerHTML = `<div class="bubble s0">▶ Appuie sur « Regarder » pour lancer la scène</div>`;
  }

  function RolePlay(el, sc, role) {
    const mine = sc.lines.map((l, k) => (l[0] === role ? k : -1)).filter((k) => k >= 0);
    const scores = {};
    let k = 0, hide = false, runId = 0;
    const voiceOf = (s) => ({ pitch: sc.chars[s].pitch, voice: sc.chars[s].voice });
    el.innerHTML = `${backBtn("Scène")}
      <h1>🎭 Tu es « ${esc(sc.chars[role].name)} »</h1>
      <div class="stage" style="background:${sc.bg};height:250px">
        <div class="place">📍 ${esc(sc.place)}</div><div class="props">${sc.props}</div><div class="floor"></div>
        ${sc.chars.map((c, j) => `<div class="actor a${j}"><div class="av">${c.emoji}</div><br><span class="nm">${esc(j === role ? "Toi" : c.name)}</span></div>`).join("")}
        <div id="bub"></div>
      </div>
      <label class="switch" style="margin-bottom:10px"><input type="checkbox" id="hideT"> Mode défi : cacher mon texte (je lis seulement la traduction)</label>
      <div id="turn"></div>`;
    bindBack(el);
    const bub = $("#bub", el), turn = $("#turn", el);
    $("#hideT", el).onchange = (e) => { hide = e.target.checked; if (sc.lines[k] && sc.lines[k][0] === role) myTurn(); };
    const talk = (s) => $$(".actor", el).forEach((a, j) => a.classList.toggle("talk", j === s));
    async function step() {
      const my = ++runId;
      while (k < sc.lines.length && sc.lines[k][0] !== role) {
        const [s, en, fr] = sc.lines[k];
        talk(s);
        bub.innerHTML = `<div class="bubble s${s}">${esc(en)}<small>${esc(fr)}</small></div>`;
        turn.innerHTML = `<div class="card center muted">👂 Écoute bien…</div>`;
        await Speech.speak(en, voiceOf(s));
        if (my !== runId) return;
        talk(-1); await sleep(350); k++;
      }
      if (k >= sc.lines.length) return end();
      myTurn();
    }
    function myTurn() {
      const [s, en, fr] = sc.lines[k];
      talk(-1);
      bub.innerHTML = `<div class="bubble s${s}">${hide ? "🤔 …" : esc(en)}<small>${esc(fr)}</small></div>`;
      turn.innerHTML = `<div class="card" id="pw"></div><button class="btn full" data-go>Réplique suivante ›</button>`;
      pronounceWidget($("#pw", turn), { en, fr }, (sc2) => { scores[k] = Math.max(scores[k] || 0, sc2); talk(role); setTimeout(() => talk(-1), 900); }, { hideText: hide });
      $("[data-go]", turn).onclick = () => { k++; step(); };
    }
    function end() {
      talk(-1);
      const vals = mine.map((m) => scores[m] || 0);
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1));
      P.scenes[sc.id] = Math.max(P.scenes[sc.id] || 0, avg); save();
      const xp = 20 + Math.round(avg / 2);
      addXP(xp); if (avg >= 60) confetti();
      bub.innerHTML = `<div class="bubble s0">👏 Bravo, scène terminée !</div>`;
      turn.innerHTML = `<div class="card result"><div class="big">🎬</div><div class="sc">${avg}%</div>
        <p>Score moyen de tes répliques · +${xp} XP</p>
        ${mine.map((m) => `<div class="row" style="justify-content:space-between;padding:4px 0;text-align:left"><span class="grow">${esc(sc.lines[m][1])}</span><b>${scores[m] || 0}%</b></div>`).join("")}
        <div class="row" style="margin-top:12px"><button class="btn sec grow" data-again>↺ Rejouer</button><button class="btn grow" data-back>Terminer</button></div></div>`;
      $("[data-again]", turn).onclick = () => render(); bindBack(turn);
    }
    step();
  }

  /* ---------------- Scores ---------------- */
  function Scores(el) {
    const lvl = levelOf(P.xp);
    const pronAvg = P.pron.count ? Math.round(P.pron.sum / P.pron.count) : 0;
    const acc = P.answers.total ? Math.round((P.answers.ok / P.answers.total) * 100) : 0;
    const sceneCount = SCENES.filter((s) => P.scenes[s.id] != null).length;
    el.innerHTML = `<h1>🏆 Mes scores</h1>
      <div class="card hero center"><div style="font-size:44px">🏅</div><h2 style="margin:4px 0">Niveau ${lvl} · ${levelName(lvl)}</h2><div class="muted">${P.xp} XP au total</div></div>
      <div class="statgrid">
        <div class="stat"><b>${Object.keys(P.words).length}</b><small>mots appris</small></div>
        <div class="stat"><b>${doneUnits()}/${UNITS.length}</b><small>leçons terminées</small></div>
        <div class="stat"><b>${pronAvg}%</b><small>prononciation moyenne (${P.pron.count} essais)</small></div>
        <div class="stat"><b>${acc}%</b><small>bonnes réponses (${P.answers.total})</small></div>
        <div class="stat"><b>${sceneCount}/${SCENES.length}</b><small>situations jouées</small></div>
        <div class="stat"><b>${P.games.played}</b><small>parties de jeux</small></div>
      </div>
      <h2>Badges</h2>
      <div class="badges">${BADGES.map((b) => `<div class="badge ${P.badges[b.id] ? "" : "off"}"><div class="em">${b.em}</div><small>${b.name}</small></div>`).join("")}</div>
      <h2>Leçons</h2>
      <div class="card">${UNITS.map((u) => { const s = P.units[u.id] || {}; return `
        <div class="word"><span style="font-size:22px">${u.emoji}</span><div class="grow"><b>${u.title}</b>
          <div class="muted" style="font-size:12px">Exercice : ${s.best || 0}% · Oral : ${s.oral || 0}%</div></div>${starsHtml(s.stars || 0)}</div>`; }).join("")}</div>
      <h2>Records des jeux</h2>
      <div class="card">${GAMES.map((g) => `<div class="word"><span style="font-size:22px">${g.em}</span><div class="grow">${g.name}</div><b>${P.games.best[g.id] || 0}${g.id === "pron" ? "%" : " pts"}</b></div>`).join("")}</div>
      <h2>⚙️ Réglages</h2>
      <div class="card">
        <label class="muted">Vitesse de la voix</label>
        <select id="rate"><option value="0.7">🐢 Lente</option><option value="0.9">🙂 Normale</option><option value="1.05">🐇 Rapide</option></select>
        <div style="height:12px"></div>
        <label class="switch"><input type="checkbox" id="snd"> Effets sonores</label>
        <div style="height:12px"></div>
        <button class="btn sec full" data-test>🔊 Tester la voix anglaise</button>
        <div style="height:10px"></div>
        <button class="btn ghost full" data-reset style="color:#EF4444">Remettre ma progression à zéro</button>
      </div>
      <p class="muted center" style="font-size:12px">English Facile · 100 % gratuit, sans publicité, sans abonnement.<br>Ta progression reste sur ton téléphone.</p>`;
    const r = $("#rate", el); r.value = String(P.settings.rate); if (!r.value) r.value = "0.9";
    r.onchange = () => { P.settings.rate = parseFloat(r.value); save(); say("This is my English voice."); };
    const snd = $("#snd", el); snd.checked = P.settings.sound; snd.onchange = () => { P.settings.sound = snd.checked; save(); };
    $("[data-test]", el).onclick = () => say("Hello! Welcome to English Facile. Let's learn together!");
    let armed = false;
    $("[data-reset]", el).onclick = (e) => {
      if (!armed) { armed = true; e.target.textContent = "⚠️ Appuie encore pour confirmer"; return; }
      const s = P.settings; P = defaults(); P.settings = s; save(); toast("Progression remise à zéro"); render();
    };
  }

  /* ---------------- Démarrage ---------------- */
  setTab("home");
  checkBadges();
})();
