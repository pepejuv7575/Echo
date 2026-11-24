/* ====== Jeux musicaux ====== */
'use strict';

function screenGames(el) {
  const b = S.best;
  el.innerHTML = `
    <div class="pagehead"><h1>🎮 Jeux</h1><p>Apprends sans t'en rendre compte !</p></div>
    <div class="games">
      <button class="game g1" data-g="hero"><span class="ge">⚡</span><div><b>Note Hero</b><small>Joue les notes au bon moment</small><em>Record : ${b.hero || 0}</em></div></button>
      <button class="game g2" data-g="echo"><span class="ge">🦜</span><div><b>Écho</b><small>Répète la mélodie, elle s'allonge</small><em>Record : niveau ${b.echo || 0}</em></div></button>
      <button class="game g3" data-g="bird"><span class="ge">🐦</span><div><b>Envol</b><small>Ta note fait voler l'oiseau</small><em>Record : ${b.bird || 0}</em></div></button>
      <button class="game g4" data-g="ear"><span class="ge">👂</span><div><b>Oreille d'or</b><small>Devine la note jouée (sans micro)</small><em>Record : ${b.ear || 0}/10</em></div></button>
    </div>`;
  $$('[data-g]', el).forEach(x => x.onclick = () => {
    const g = x.dataset.g;
    if (g === 'hero') go(screenHeroPick);
    if (g === 'echo') go(screenEcho);
    if (g === 'bird') go(screenBird);
    if (g === 'ear') go(screenEar);
  });
}
screenGames.navTab = 'games';

/* ---------- utilitaire canvas ---------- */
function setupCanvas(canvas) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, w, h };
}
function rrect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
const COL_BLOW = '#3FA9FF', COL_DRAW = '#FF9A3C';

function gameOver(el, { title, score, best, lines, xp, onRetry }) {
  addXp(xp);
  confetti(); Snd.blip('win');
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="ovbox"><div class="rbig">${score >= best ? '🏆' : '🎮'}</div><h2>${title}</h2>
    <div class="bigscore">${score}</div>${score >= best && score > 0 ? '<div class="newrec">Nouveau record !</div>' : `<small>Record : ${best}</small>`}
    ${lines || ''}<div class="rstats"><div><b>+${xp}</b><span>XP</span></div></div>
    <div class="rbtns"><button class="btn ghost" data-o="quit">Quitter</button><button class="btn primary" data-o="retry">Rejouer</button></div></div>`;
  el.appendChild(ov);
  $('[data-o="quit"]', ov).onclick = () => back();
  $('[data-o="retry"]', ov).onclick = onRetry;
}

/* ======================= NOTE HERO ======================= */
function screenHeroPick(el) {
  el.innerHTML = topbar('⚡ Note Hero') + `<div class="pad">
    <p class="muted">Les notes arrivent de la droite. Joue-les quand elles touchent la ligne !</p>
    <div class="seg" id="spd"><button data-v="1.1" class="on">🐢 Lent</button><button data-v="0.8">🚶 Normal</button><button data-v="0.6">🏃 Rapide</button></div>
    <div class="list">${SONGS.map(s => `<button class="row" data-s="${s.id}"><span class="re">${s.emoji}</span><div><b>${esc(s.title)}</b><small>${'🎵'.repeat(s.level)}</small></div><span>›</span></button>`).join('')}</div></div>`;
  bindBack(el);
  let spd = 1.1;
  $$('#spd button', el).forEach(b => b.onclick = () => { $$('#spd button', el).forEach(x => x.classList.remove('on')); b.classList.add('on'); spd = +b.dataset.v; });
  $$('[data-s]', el).forEach(b => b.onclick = () => go(screenHero, b.dataset.s, spd));
}
screenHeroPick.navTab = 'games';

function screenHero(el, songId, step = 1.0) {
  const song = SONGS.find(s => s.id === songId);
  const key = keyOff();
  el.innerHTML = `<div class="gamewrap"><div class="ghud"><button class="back" data-back>✕</button><div class="gscore">0</div><div class="gcombo"></div></div>
    <canvas class="gcanvas"></canvas><div class="gmsg">Prépare-toi… 🎵</div>
    <div class="gfoot"><span class="gdet">—</span><button class="btn small ghost" data-a="demo">🔊 Écouter</button></div></div>`;
  bindBack(el);
  const canvas = $('canvas', el);
  let { g, w, h } = setupCanvas(canvas);
  const flat = song.lines.flat();
  const holesUsed = Array.from(new Set(flat.map(t => parseTab(t).hole))).sort((a, b) => a - b);
  const lead = 3.0;
  const notes = flat.map((t, i) => ({ t, m: tabMidi(t, key), time: lead + i * step, hole: parseTab(t).hole, state: 0 }));
  const hitX = 70, speed = 130;
  const laneH = Math.min(46, (h - 40) / holesUsed.length);
  const laneY = hole => 20 + (holesUsed.indexOf(hole) + 0.5) * laneH + (h - 40 - laneH * holesUsed.length) / 2;
  let score = 0, combo = 0, maxCombo = 0, hits = 0, startT = null, raf = 0, ended = false;
  let det = null, okAcc = 0, released = true, lastHitM = null, lastT = 0, flash = [], muteUntil = 0;
  const win = Math.max(0.35, step * 0.5);

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (startT == null) startT = ts;
    const now = (ts - startT) / 1000;
    const dt = lastT ? Math.min(0.1, (ts - lastT) / 1000) : 0.016; lastT = ts;

    // jugement
    const cur = notes.find(n => n.state === 0);
    if (cur) {
      const dtime = now - cur.time;
      if (dtime > win) { cur.state = 2; combo = 0; flash.push({ x: hitX, y: laneY(cur.hole), txt: 'Raté', col: '#ff5c7a', t: now }); }
      else if (Math.abs(dtime) <= win && det && det.midi != null && ts > muteUntil) {
        const match = Math.abs(det.midi - cur.m) < 0.5;
        if (match && (released || cur.m !== lastHitM)) {
          okAcc += dt;
          if (okAcc >= 0.09) {
            cur.state = 1; hits++; combo++; maxCombo = Math.max(maxCombo, combo);
            const perfect = Math.abs(dtime) < win * 0.45;
            score += (perfect ? 150 : 100) + combo * 10;
            flash.push({ x: hitX, y: laneY(cur.hole), txt: perfect ? 'Parfait !' : 'Bien', col: perfect ? '#4EE6C8' : '#FFB020', t: now });
            lastHitM = cur.m; released = false; okAcc = 0;
            Snd.blip('tick');
          }
        } else okAcc = 0;
      }
    }
    if (det && (det.midi == null || Math.abs(det.midi - (lastHitM || 0)) >= 0.5 || det.rms < 0.5 * (det.peak || 0))) released = true;

    // dessin
    g.clearRect(0, 0, w, h);
    holesUsed.forEach(ho => {
      const y = laneY(ho);
      g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(0, y - laneH / 2 + 2, w, laneH - 4);
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.font = '600 11px system-ui'; g.textAlign = 'left';
      g.fillText('trou ' + ho, 4, y + 4);
    });
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.globalAlpha = 0.8;
    g.beginPath(); g.moveTo(hitX, 10); g.lineTo(hitX, h - 10); g.stroke(); g.globalAlpha = 1;

    notes.forEach(n => {
      const x = hitX + (n.time - now) * speed;
      if (x < -60 || x > w + 60) return;
      if (n.state === 1) return;
      const y = laneY(n.hole);
      const draw = n.t.startsWith('-');
      g.globalAlpha = n.state === 2 ? 0.3 : 1;
      g.fillStyle = draw ? COL_DRAW : COL_BLOW;
      rrect(g, x - 22, y - laneH / 2 + 5, 44, laneH - 10, 10); g.fill();
      g.fillStyle = '#10082a'; g.font = '800 17px system-ui'; g.textAlign = 'center';
      g.fillText(n.t, x, y + 6);
      g.globalAlpha = 1;
    });
    flash = flash.filter(f => now - f.t < 0.7);
    flash.forEach(f => {
      g.globalAlpha = 1 - (now - f.t) / 0.7; g.fillStyle = f.col; g.font = '800 16px system-ui'; g.textAlign = 'left';
      g.fillText(f.txt, f.x + 12, f.y - 18 - (now - f.t) * 40); g.globalAlpha = 1;
    });

    $('.gscore', el).textContent = score;
    $('.gcombo', el).textContent = combo > 1 ? `Combo x${combo}` : '';
    if (now < lead - 0.5) $('.gmsg', el).textContent = 'Prépare-toi… ' + Math.ceil(lead - now);
    else $('.gmsg', el).textContent = cur ? `Prochaine : ${cur.t}  (${tabLabel(cur.t)})` : '';

    if (!ended && notes.every(n => n.state !== 0)) {
      ended = true;
      cancelAnimationFrame(raf);
      Snd.stopListening();
      const acc = Math.round(100 * hits / notes.length);
      const best = Math.max(S.best.hero || 0, score);
      S.best.hero = best;
      if (score >= 1000) award('hero');
      S.songsPlayed[songId] = 1;
      save();
      gameOver(el, {
        title: song.title, score, best, xp: 10 + Math.round(acc / 5),
        lines: `<p>🎯 Précision : <b>${acc}%</b> · Meilleur combo : <b>${maxCombo}</b></p>`,
        onRetry: () => replace(screenHero, songId, step),
      });
    }
  }

  let peak = 0;
  Snd.listen(d => {
    peak = d.midi != null ? Math.max(peak * 0.97, d.rms) : peak * 0.9;
    d.peak = peak;
    det = d;
    $('.gdet', el).innerHTML = d.midi != null ? '🎤 ' + midiName(d.midi, S.settings.english) : '🎤 —';
  }).catch(() => { $('.gmsg', el).textContent = '🎤 Micro indisponible'; });
  $('[data-a="demo"]', el).onclick = () => {
    const d = Snd.playSeq(flat.slice(0, 8).map(t => tabMidi(t, key)), 0.5, 0.45);
    muteUntil = performance.now() + d * 1000 + 300;
  };
  raf = requestAnimationFrame(frame);
  const onResize = () => { ({ g, w, h } = setupCanvas(canvas)); };
  window.addEventListener('resize', onResize);
  return () => { ended = true; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
}
screenHero.full = true;

/* ======================= ÉCHO (Simon) ======================= */
function screenEcho(el) {
  const key = keyOff();
  const pool = ['4', '-4', '5', '-5', '6', '-6'];
  const colors = ['#3FA9FF', '#FF9A3C', '#4EE6C8', '#FF6B9A', '#8B7CFF', '#FFD23F'];
  el.innerHTML = topbar('🦜 Écho', { right: '<div class="echolv">Niv. <b>1</b></div>' }) + `<div class="pad echo">
    <div class="echomsg">Écoute la mélodie…</div>
    <div class="pads">${pool.map((t, i) => `<button class="epad" data-t="${t}" style="--c:${colors[i]}"><b>${t}</b><small>${tabLabel(t)}</small></button>`).join('')}</div>
    <div class="lives">❤️❤️❤️</div>
    <div class="echodet">🎤 —</div>
    <p class="muted center">Rejoue la mélodie à l'harmonica. Pas de micro ? Touche les cases.</p>
    <div class="sbtns"><button class="btn primary" data-a="start">▶ Jouer</button></div></div>`;
  bindBack(el);
  let seq = [], pos = 0, phase = 'idle', lives = 3, okAcc = 0, wrongAcc = 0, released = true, lastM = null, timers = [], lastT = 0;
  const msg = $('.echomsg', el);
  const pads = $$('.epad', el);
  const light = (t, ms = 450) => {
    const p = pads.find(x => x.dataset.t === t);
    if (!p) return;
    p.classList.add('lit'); timers.push(setTimeout(() => p.classList.remove('lit'), ms));
  };
  function setLives() { $('.lives', el).textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives); }

  function nextRound() {
    let t; do { t = pick(pool); } while (seq.length && Math.abs(pool.indexOf(t) - pool.indexOf(seq[seq.length - 1])) > 3);
    seq.push(t);
    showSeq();
  }
  function showSeq() {
    phase = 'show'; pos = 0;
    $('.echolv b', el).textContent = seq.length;
    msg.textContent = '👂 Écoute bien…';
    const stepMs = Math.max(450, 800 - seq.length * 30);
    seq.forEach((t, i) => timers.push(setTimeout(() => { Snd.playNote(tabMidi(t, key), stepMs / 1000 * 0.8); light(t, stepMs * 0.7); }, 600 + i * stepMs)));
    timers.push(setTimeout(() => { phase = 'listen'; released = true; lastM = null; msg.innerHTML = '🎵 À toi ! Note 1/' + seq.length; }, 600 + seq.length * stepMs + 250));
  }
  function good() {
    light(seq[pos], 250);
    lastM = tabMidi(seq[pos], key); released = false;
    pos++; okAcc = 0; wrongAcc = 0;
    if (pos >= seq.length) {
      phase = 'wait'; Snd.blip('ok');
      msg.textContent = pick(['Bravo ! 🎉', 'Parfait ! ✨', 'Excellent ! 🦜']);
      if (seq.length >= 6) award('echo');
      S.best.echo = Math.max(S.best.echo || 0, seq.length); save();
      timers.push(setTimeout(nextRound, 1100));
    } else msg.innerHTML = `🎵 Note ${pos + 1}/${seq.length}`;
  }
  function bad(played) {
    lives--; setLives(); Snd.blip('bad');
    phase = 'wait';
    if (lives <= 0) {
      Snd.stopListening();
      const score = seq.length - 1;
      const best = Math.max(S.best.echo || 0, score);
      S.best.echo = best; save();
      gameOver(el, { title: 'Écho', score, best, xp: 5 + score * 4, lines: '<p>Niveau atteint</p>', onRetry: () => replace(screenEcho) });
      return;
    }
    msg.innerHTML = `Oups ! Il fallait ${chip(seq[pos])}${played ? ', tu as joué ' + chip(played) : ''}. On réécoute…`;
    timers.push(setTimeout(showSeq, 1800));
  }

  pads.forEach(p => p.onclick = () => {
    Snd.playNote(tabMidi(p.dataset.t, key), 0.35);
    if (phase !== 'listen') return;
    if (p.dataset.t === seq[pos] || tabMidi(p.dataset.t, key) === tabMidi(seq[pos], key)) good(); else bad(p.dataset.t);
  });

  $('[data-a="start"]', el).onclick = e => {
    e.target.closest('.sbtns').classList.add('hidden');
    Snd.listen(d => {
      const dt = lastT ? Math.min(100, d.t - lastT) : 30; lastT = d.t;
      $('.echodet', el).innerHTML = d.midi != null ? '🎤 ' + midiName(d.midi, S.settings.english) : '🎤 —';
      if (d.midi == null || (lastM != null && Math.abs(d.midi - lastM) >= 0.5)) released = true;
      if (phase !== 'listen' || d.midi == null) { okAcc = 0; wrongAcc = Math.max(0, wrongAcc - dt); return; }
      const target = tabMidi(seq[pos], key);
      if (Math.abs(d.midi - target) < 0.5) {
        if (!released && target === lastM) return;
        okAcc += dt; wrongAcc = 0;
        if (okAcc > 180) good();
      } else {
        okAcc = 0;
        const c = tabsForMidi(Math.round(d.midi), key, false);
        if (c.length) { wrongAcc += dt; if (wrongAcc > 450) bad(c[0].tab); }
      }
    }).catch(() => { $('.echodet', el).textContent = '🎤 Micro indisponible : touche les cases'; });
    nextRound();
  };
  return () => timers.forEach(clearTimeout);
}
screenEcho.navTab = 'games';

/* ======================= ENVOL (oiseau) ======================= */
function screenBird(el) {
  const key = keyOff();
  const lanes = ['4', '-4', '5', '-5', '6', '-6'];
  const laneM = lanes.map(t => tabMidi(t, key));
  el.innerHTML = `<div class="gamewrap"><div class="ghud"><button class="back" data-back>✕</button><div class="gscore">0</div><div class="glives">❤️❤️❤️</div></div>
    <canvas class="gcanvas sky"></canvas><div class="gmsg">Joue une note pour voler à sa hauteur. Passe dans les trous ! 🐦</div>
    <div class="gfoot"><span class="gdet">🎤 —</span><button class="btn small primary" data-a="go">▶ Décoller</button></div></div>`;
  bindBack(el);
  const canvas = $('canvas', el);
  let { g, w, h } = setupCanvas(canvas);
  const laneH = () => (h - 30) / lanes.length;
  const laneY = i => h - 15 - (i + 0.5) * laneH();
  let birdY = laneY(0), targetLane = -1, pipes = [], score = 0, lives = 3, inv = 0, t = 0, nextPipe = 1.5, gapLane = 2;
  let raf = 0, running = false, lastTs = 0, ended = false, speed = 80;

  Snd.listen(d => {
    let best = -1, bd = 1;
    if (d.midi != null) laneM.forEach((m, i) => { const df = Math.abs(d.midi - m); if (df < 0.5 && df < bd) { bd = df; best = i; } });
    targetLane = best;
    $('.gdet', el).innerHTML = d.midi != null ? '🎤 ' + midiName(d.midi, S.settings.english) + (best >= 0 ? ' ' + chip(lanes[best], 'mini') : '') : '🎤 —';
  }).catch(() => { $('.gmsg', el).textContent = '🎤 Micro indisponible : ce jeu a besoin du micro.'; });

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016; lastTs = ts;
    if (running) {
      t += dt;
      speed = 80 + Math.min(70, score * 3);
      // oiseau
      if (targetLane >= 0) birdY += (laneY(targetLane) - birdY) * Math.min(1, dt * 8);
      else birdY = Math.min(h - 18, birdY + 70 * dt);
      // tuyaux
      nextPipe -= dt;
      if (nextPipe <= 0) {
        gapLane = Math.max(0, Math.min(lanes.length - 1, gapLane + pick([-2, -1, -1, 0, 1, 1, 2])));
        pipes.push({ x: w + 30, lane: gapLane, passed: false });
        nextPipe = Math.max(1.6, 2.8 - score * 0.05);
      }
      pipes.forEach(p => p.x -= speed * dt);
      pipes = pipes.filter(p => p.x > -60);
      inv = Math.max(0, inv - dt);
      const bx = 80, br = 13, pw = 44;
      pipes.forEach(p => {
        const gy = laneY(p.lane), gh = laneH() * 1.25;
        if (!p.passed && p.x + pw / 2 < bx - br) { p.passed = true; score++; Snd.blip('tick'); if (score >= 15) award('bird'); }
        if (Math.abs(p.x - bx) < pw / 2 + br && (birdY - br < gy - gh / 2 || birdY + br > gy + gh / 2) && inv <= 0 && !p.hit) {
          p.hit = true; lives--; inv = 1.5; Snd.blip('bad');
          $('.glives', el).textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(3 - Math.max(0, lives));
          $('.gmsg', el).innerHTML = `Aïe ! Ce trou demandait ${chip(lanes[p.lane])}`;
          if (lives <= 0) end();
        }
      });
    }
    // dessin
    g.clearRect(0, 0, w, h);
    lanes.forEach((tb, i) => {
      const y = laneY(i);
      g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, y - 0.5, w, 1);
      g.fillStyle = tb.startsWith('-') ? COL_DRAW : COL_BLOW; g.font = '800 13px system-ui'; g.textAlign = 'left';
      g.fillText(tb, 6, y + 5);
    });
    pipes.forEach(p => {
      const gy = laneY(p.lane), gh = laneH() * 1.25;
      const grad = g.createLinearGradient(p.x - 22, 0, p.x + 22, 0);
      grad.addColorStop(0, '#2bd48f'); grad.addColorStop(1, '#159a63');
      g.fillStyle = grad;
      rrect(g, p.x - 22, -10, 44, gy - gh / 2 + 10, 8); g.fill();
      rrect(g, p.x - 22, gy + gh / 2, 44, h - gy - gh / 2 + 10, 8); g.fill();
      g.fillStyle = '#fff'; g.font = '800 15px system-ui'; g.textAlign = 'center';
      g.fillText(lanes[p.lane], p.x, gy + 5);
    });
    // oiseau
    const bx = 80;
    if (!(inv > 0 && Math.floor(inv * 10) % 2)) {
      g.save(); g.translate(bx, birdY);
      g.rotate(targetLane >= 0 ? -0.1 : 0.35);
      g.fillStyle = '#FFD23F'; g.beginPath(); g.ellipse(0, 0, 16, 13, 0, 0, 7); g.fill();
      g.fillStyle = '#FFB020'; g.beginPath(); g.ellipse(-4, 2, 8, 5, -0.4 + Math.sin(t * 18) * 0.5, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(6, -4, 4.5, 0, 7); g.fill();
      g.fillStyle = '#111'; g.beginPath(); g.arc(7.5, -4, 2, 0, 7); g.fill();
      g.fillStyle = '#FF6B3C'; g.beginPath(); g.moveTo(14, -1); g.lineTo(22, 2); g.lineTo(14, 5); g.fill();
      g.restore();
    }
    $('.gscore', el).textContent = score;
  }
  function end() {
    if (ended) return;
    ended = true; running = false;
    cancelAnimationFrame(raf);
    Snd.stopListening();
    const best = Math.max(S.best.bird || 0, score);
    S.best.bird = best; save();
    gameOver(el, { title: 'Envol', score, best, xp: 5 + score * 3, lines: '<p>obstacles franchis</p>', onRetry: () => replace(screenBird) });
  }
  $('[data-a="go"]', el).onclick = e => { e.target.classList.add('hidden'); running = true; Snd.ensureCtx(); };
  raf = requestAnimationFrame(frame);
  return () => { ended = true; cancelAnimationFrame(raf); };
}
screenBird.full = true;

/* ======================= OREILLE D'OR ======================= */
function screenEar(el) {
  const key = keyOff();
  el.innerHTML = topbar("👂 Oreille d'or") + `<div class="pad">
    <p class="muted">Écoute la note et trouve quel trou la joue. Pas besoin de micro !</p>
    <div class="seg" id="diff"><button data-v="0" class="on">🟢 Facile</button><button data-v="1">🟠 Moyen</button><button data-v="2">🔴 Expert</button></div>
    <div class="sbtns"><button class="btn primary" data-a="go">▶ Commencer</button></div></div>`;
  bindBack(el);
  let diff = 0;
  $$('#diff button', el).forEach(b => b.onclick = () => { $$('#diff button', el).forEach(x => x.classList.remove('on')); b.classList.add('on'); diff = +b.dataset.v; });
  $('[data-a="go"]', el).onclick = () => run();

  function run() {
    const pools = [['4', '5', '6', '7'], ['4', '-4', '5', '-5', '6', '-6', '-7', '7'], ['1', '-1', '2', '3', '-3', '4', '-4', '5', '-5', '6', '-6', '-7', '7', '-8', '8', '-9', '9']];
    const pool = pools[diff];
    let q = 0, score = 0;
    const pad = $('.pad', el);
    function ask() {
      if (q >= 10) {
        const best = Math.max(S.best.ear || 0, score);
        S.best.ear = best; save();
        if (score === 10) award('ear');
        gameOver(el, { title: "Oreille d'or", score, best, xp: 5 + score * 2, lines: '<p>bonnes réponses sur 10</p>', onRetry: () => replace(screenEar) });
        return;
      }
      const ans = pick(pool);
      const am = tabMidi(ans, key);
      const others = shuffle(pool.filter(t => tabMidi(t, key) !== am)).slice(0, 3);
      const opts = shuffle([ans, ...others]);
      pad.innerHTML = `<div class="earq">Question ${q + 1}/10 · Score ${score}</div>
        <button class="bigplay">🔊</button>
        <button class="btn small ghost refbtn">Note repère : Do (4)</button>
        <div class="opts grid2">${opts.map(t => `<button class="opt tabopt" data-t="${t}">${chip(t)}<small>${tabLabel(t)}</small></button>`).join('')}</div>
        <div class="explain hidden"></div>`;
      const play = () => Snd.playNote(am, 0.9);
      $('.bigplay', pad).onclick = play;
      $('.refbtn', pad).onclick = () => Snd.playNote(tabMidi('4', key), 0.7);
      setTimeout(play, 350);
      let answered = false;
      $$('.opt', pad).forEach(b => b.onclick = () => {
        if (answered) return; answered = true;
        const ok = b.dataset.t === ans;
        b.classList.add(ok ? 'right' : 'wrong');
        $(`.opt[data-t="${ans}"]`, pad).classList.add('right');
        Snd.blip(ok ? 'ok' : 'bad');
        if (ok) score++;
        else { const ex = $('.explain', pad); ex.innerHTML = `C'était ${chip(ans)} (${midiName(am, S.settings.english)})`; ex.classList.remove('hidden'); }
        q++;
        setTimeout(ask, ok ? 800 : 1700);
      });
    }
    ask();
  }
}
screenEar.navTab = 'games';
