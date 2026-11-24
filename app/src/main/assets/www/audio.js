/* ====== Audio : synthé harmonica + détection de hauteur au micro ====== */
'use strict';

const Snd = (() => {
  let ctx = null;
  let master = null;
  let micStream = null, micSource = null, analyser = null, buf = null;
  let listening = false, rafId = 0, lastDetect = 0;
  let listener = null;
  const history = [];
  let sensitivity = 0.012; // seuil RMS

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const ftom = f => 69 + 12 * Math.log2(f / 440);

  /* --- Synthé façon harmonica (anches) --- */
  function playNote(midi, dur = 0.6, when = 0, vol = 0.35) {
    const c = ensureCtx();
    const t0 = c.currentTime + when;
    const f = mtof(midi);
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, t0);
    out.gain.exponentialRampToValueAtTime(vol, t0 + 0.05);
    out.gain.setValueAtTime(vol, t0 + Math.max(0.06, dur - 0.08));
    out.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.05);

    const filt = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = Math.min(5000, f * 5);
    filt.Q.value = 2;

    const o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = f;
    const o2 = c.createOscillator(); o2.type = 'square'; o2.frequency.value = f * 1.003;
    const g2 = c.createGain(); g2.gain.value = 0.35;
    // léger vibrato
    const lfo = c.createOscillator(); lfo.frequency.value = 5.2;
    const lfoG = c.createGain(); lfoG.gain.value = f * 0.004;
    lfo.connect(lfoG); lfoG.connect(o1.frequency); lfoG.connect(o2.frequency);

    o1.connect(filt); o2.connect(g2); g2.connect(filt);
    filt.connect(out); out.connect(master);
    [o1, o2, lfo].forEach(o => { o.start(t0); o.stop(t0 + dur + 0.1); });
  }

  function playSeq(midis, step = 0.55, dur = 0.5) {
    midis.forEach((m, i) => playNote(m, dur, i * step));
    return midis.length * step;
  }

  function blip(type) {
    const c = ensureCtx();
    const t = c.currentTime;
    const seq = type === 'ok' ? [[880, 0], [1318, 0.07]]
      : type === 'win' ? [[784, 0], [988, 0.1], [1175, 0.2], [1568, 0.3]]
        : type === 'tick' ? [[1200, 0]]
          : [[220, 0], [180, 0.08]];
    seq.forEach(([f, d]) => {
      const o = c.createOscillator(); const g = c.createGain();
      o.type = type === 'bad' ? 'triangle' : 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(type === 'tick' ? 0.08 : 0.25, t + d + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + (type === 'win' ? 0.35 : 0.15));
      o.connect(g); g.connect(master);
      o.start(t + d); o.stop(t + d + 0.4);
    });
  }

  /* --- Micro --- */
  async function startMic() {
    ensureCtx();
    if (micStream) return true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nomedia');
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    micSource = ctx.createMediaStreamSource(micStream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    buf = new Float32Array(analyser.fftSize);
    micSource.connect(analyser);
    return true;
  }

  function stopMic() {
    stopListening();
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); }
    micStream = null; micSource = null; analyser = null;
  }

  /* Détection : fonction de différence normalisée (méthode McLeod) */
  function detect() {
    analyser.getFloatTimeDomainData(buf);
    const N = buf.length;
    let rms = 0;
    for (let i = 0; i < N; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / N);
    if (rms < sensitivity) return { freq: -1, rms, clarity: 0 };

    const sr = ctx.sampleRate;
    const W = 1024;
    const minLag = Math.max(2, Math.floor(sr / 3200));
    const maxLag = Math.min(N - W - 1, Math.ceil(sr / 140));
    const nsdf = new Float32Array(maxLag + 2);
    for (let tau = minLag; tau <= maxLag + 1; tau++) {
      let acf = 0, m = 0;
      for (let i = 0; i < W; i++) {
        const a = buf[i], b = buf[i + tau];
        acf += a * b; m += a * a + b * b;
      }
      nsdf[tau] = m > 0 ? 2 * acf / m : 0;
    }
    // pics après le premier passage par zéro
    let tau = minLag;
    while (tau < maxLag && nsdf[tau] > 0) tau++;
    const peaks = [];
    let best = 0;
    for (; tau <= maxLag; tau++) {
      if (nsdf[tau] > 0 && nsdf[tau] > nsdf[tau - 1] && nsdf[tau] >= nsdf[tau + 1]) {
        peaks.push(tau);
        if (nsdf[tau] > best) best = nsdf[tau];
      }
    }
    if (!peaks.length || best < 0.5) return { freq: -1, rms, clarity: best };
    const thr = best * 0.88;
    let p = peaks.find(t => nsdf[t] >= thr);
    // interpolation parabolique
    const y0 = nsdf[p - 1], y1 = nsdf[p], y2 = nsdf[p + 1];
    const den = (y0 - 2 * y1 + y2);
    const shift = den !== 0 ? 0.5 * (y0 - y2) / den : 0;
    const period = p + shift;
    return { freq: sr / period, rms, clarity: y1 };
  }

  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (!analyser || ts - lastDetect < 30) return;
    lastDetect = ts;
    const r = detect();
    let out;
    if (r.freq > 0) {
      const m = ftom(r.freq);
      history.push(m);
      if (history.length > 3) history.shift();
      const sorted = history.slice().sort((a, b) => a - b);
      const med = sorted[Math.floor(sorted.length / 2)];
      const near = Math.round(med);
      out = { midi: med, note: near, cents: Math.round((med - near) * 100), freq: r.freq, rms: r.rms, clarity: r.clarity, sound: true };
    } else {
      history.length = 0;
      out = { midi: null, note: null, cents: 0, freq: -1, rms: r.rms, clarity: r.clarity, sound: r.rms >= sensitivity };
    }
    out.t = ts;
    if (listener) {
      try { listener(out); } catch (e) { console.error(e); }
    }
  }

  async function listen(cb) {
    await startMic();
    listener = cb;
    if (!listening) {
      listening = true;
      rafId = requestAnimationFrame(loop);
    }
  }

  function stopListening() {
    listener = null;
    pausedListener = null;
    listening = false;
    cancelAnimationFrame(rafId);
    history.length = 0;
  }

  function setSensitivity(v) { sensitivity = v; }

  let pausedListener = null;
  function pauseMic() {
    const l = listener || pausedListener;
    stopMic();
    pausedListener = l;
  }
  function resumeMic() {
    if (pausedListener) { const l = pausedListener; pausedListener = null; listen(l).catch(() => { }); }
  }

  return { ensureCtx, playNote, playSeq, blip, listen, stopListening, stopMic, pauseMic, resumeMic, setSensitivity, mtof, ftom,
    get hasMic() { return !!micStream; } };
})();
