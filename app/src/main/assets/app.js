'use strict';
/* =========================================================
   RCSC Zèbres — application fan du Royal Charleroi Sporting Club
   Données en direct : ESPN (classement, matchs, stats, effectif),
   Google Actualités (actus + mercato), YouTube (vidéos officielles).
   ========================================================= */

const TEAM_ID = '3616';
const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/soccer/';
const ESPN_STD = 'https://site.api.espn.com/apis/v2/sports/soccer/';
const LEAGUES = {
  'bel.1': 'Pro League',
  'bel.cup': 'Coupe de Belgique',
  'uefa.champions': 'Ligue des Champions',
  'uefa.europa': 'Europa League',
  'uefa.europa.conf': 'Conference League',
  'uefa.champions_qual': 'Qualif. Ligue des Champions',
  'uefa.europa_qual': 'Qualif. Europa League',
  'uefa.europa.conf_qual': 'Qualif. Conference League'
};
const YT_CHANNEL_ID = 'UCuB2BBoeKhLNLFpfXGsX4Iw';
const YT_HANDLE = 'https://www.youtube.com/@SportingCharleroiTV';
const gnews = q => 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=fr&gl=BE&ceid=BE:fr';
const NEWS_URL = gnews('"Sporting Charleroi" OR "Sporting de Charleroi" OR "RCSC" OR "les Zèbres" Charleroi');
const MERCATO_URL = gnews('Charleroi (transfert OR mercato OR transfer OR prêt OR "s\'engage" OR recrue OR signe) football');
const OFFICIAL_FEED = 'https://www.sporting-charleroi.be/feed/';
const TZ = 'Europe/Brussels';

const MIN = 60 * 1000;
const state = { tab: 'home', matchFilter: 'upcoming', force: false };
const store = { matches: [], roster: [] };
let renderSeq = 0;
let timers = [];

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- Réseau (pont natif Android, sans CORS) ---------------- */
const pending = {};
let reqSeq = 0;
window.__cb = (id, ok, body) => {
  const p = pending[id];
  if (!p) return;
  delete pending[id];
  ok ? p.res(body) : p.rej(new Error(body || 'Erreur réseau'));
};
function httpGet(url) {
  if (window.Native && window.Native.fetch) {
    return new Promise((res, rej) => {
      const id = 'r' + (++reqSeq);
      pending[id] = { res, rej };
      window.Native.fetch(id, url);
      setTimeout(() => { if (pending[id]) { delete pending[id]; rej(new Error('Délai dépassé')); } }, 45000);
    });
  }
  return fetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); });
}
const memCache = {};
async function cached(url, ttl) {
  const key = 'c:' + url;
  let c = memCache[key];
  if (!c) { try { c = JSON.parse(localStorage.getItem(key)); } catch (e) { c = null; } }
  if (c && !state.force && Date.now() - c.t < ttl) return c.d;
  try {
    const d = await httpGet(url);
    memCache[key] = { t: Date.now(), d };
    try { localStorage.setItem(key, JSON.stringify(memCache[key])); } catch (e) { /* quota */ }
    return d;
  } catch (e) {
    if (c) return c.d; // hors-ligne : dernière version connue
    throw e;
  }
}
const getJSON = async (url, ttl) => JSON.parse(await cached(url, ttl));

/* ---------------- Formatage ---------------- */
const fmtDate = d => d.toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ });
const fmtDateLong = d => d.toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
const fmtTime = d => d.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
function ago(d) {
  if (!d || isNaN(d)) return '';
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 3600) return 'il y a ' + Math.max(1, Math.round(s / 60)) + ' min';
  if (s < 86400) return 'il y a ' + Math.round(s / 3600) + ' h';
  if (s < 7 * 86400) return 'il y a ' + Math.round(s / 86400) + ' j';
  return fmtDate(d);
}
const loader = () => '<div class="loader"><div></div></div>';
const errorBox = (msg, e) => `<div class="error">⚠️ ${esc(msg)}<div class="small" style="margin-top:6px;opacity:.7">${esc(e && e.message || '')}</div></div>`;
const logoOf = t => (t && (t.logo || (t.logos && t.logos[0] && t.logos[0].href))) || '';

/* ---------------- Données : matchs ---------------- */
function parseEvent(ev, slug) {
  const comp = (ev.competitions && ev.competitions[0]) || {};
  const st = (comp.status && comp.status.type) || (ev.status && ev.status.type) || {};
  const cs = comp.competitors || [];
  const side = ha => {
    const c = cs.find(x => x.homeAway === ha) || {};
    const t = c.team || {};
    let score = c.score;
    if (score && typeof score === 'object') score = score.displayValue != null ? score.displayValue : score.value;
    let so = c.shootoutScore != null ? c.shootoutScore : (c.score && c.score.shootoutDisplayValue);
    return { id: String(t.id || ''), name: t.shortDisplayName || t.displayName || t.name || '?', full: t.displayName || t.name || '', logo: logoOf(t), score: score == null ? '' : String(score).replace(/\.0$/, ''), so: so, winner: c.winner };
  };
  return {
    id: String(ev.id), slug,
    leagueName: LEAGUES[slug] || (ev.league && ev.league.name) || slug,
    date: new Date(comp.date || ev.date),
    timeValid: comp.timeValid !== false && ev.timeValid !== false,
    state: st.state || 'pre', detail: st.shortDetail || st.detail || '', completed: !!st.completed,
    statusName: st.name || '',
    venue: comp.venue && (comp.venue.fullName || (comp.venue.address && comp.venue.address.city)) || '',
    attendance: comp.attendance,
    home: side('home'), away: side('away')
  };
}
async function getMatches() {
  const urls = [];
  Object.keys(LEAGUES).forEach(slug => {
    urls.push({ slug, url: ESPN + slug + '/teams/' + TEAM_ID + '/schedule' });
    urls.push({ slug, url: ESPN + slug + '/teams/' + TEAM_ID + '/schedule?fixture=true' });
  });
  const results = await Promise.allSettled(urls.map(u => getJSON(u.url, 5 * MIN).then(j => ({ slug: u.slug, j }))));
  const map = {};
  let anyOk = false;
  results.forEach(r => {
    if (r.status !== 'fulfilled') return;
    anyOk = true;
    (r.value.j.events || []).forEach(ev => {
      const m = parseEvent(ev, r.value.slug);
      if (m.home.id !== TEAM_ID && m.away.id !== TEAM_ID) return;
      const prev = map[m.id];
      if (!prev || (m.completed && !prev.completed) || (m.state === 'in')) map[m.id] = m;
    });
  });
  if (!anyOk) throw new Error('Impossible de charger les matchs');
  const list = Object.values(map).filter(m => !/POSTPONED|CANCELED|CANCELLED/.test(m.statusName) || m.state !== 'post');
  list.sort((a, b) => a.date - b.date);
  store.matches = list;
  return list;
}
function resultOf(m) {
  if (m.state !== 'post' || m.home.score === '' || m.away.score === '') return '';
  const usHome = m.home.id === TEAM_ID;
  const us = +(usHome ? m.home.score : m.away.score), them = +(usHome ? m.away.score : m.home.score);
  if (us > them) return 'V';
  if (us < them) return 'D';
  const w = usHome ? m.home.winner : m.away.winner;
  const lw = usHome ? m.away.winner : m.home.winner;
  if (w === true) return 'V';
  if (lw === true) return 'D';
  return 'N';
}
const played = ms => ms.filter(m => m.state === 'post' && resultOf(m));
const upcoming = ms => ms.filter(m => m.state === 'pre' && m.date.getTime() > Date.now() - 3 * 3600 * 1000);
const liveOnes = ms => ms.filter(m => m.state === 'in');

/* ---------------- Données : classement ---------------- */
async function getStandings() {
  const j = await getJSON(ESPN_STD + 'bel.1/standings', 10 * MIN);
  const groups = (j.children && j.children.length ? j.children : [j]).map(g => {
    const entries = ((g.standings && g.standings.entries) || []).map(e => {
      const s = {};
      (e.stats || []).forEach(x => { s[x.name] = x.value != null ? x.value : x.summary; s[x.name + '_d'] = x.displayValue || x.summary; });
      return { team: e.team || {}, s, note: e.note };
    });
    entries.sort((a, b) => (a.s.rank || 99) - (b.s.rank || 99));
    return { name: g.name || g.abbreviation || 'Pro League', season: (g.standings && g.standings.seasonDisplayName) || '', entries };
  });
  return groups;
}

/* ---------------- Données : effectif ---------------- */
const POS = { G: 'Gardiens', D: 'Défenseurs', M: 'Milieux', F: 'Attaquants' };
function posKey(p) {
  const a = ((p.position && (p.position.abbreviation || p.position.name)) || '').toUpperCase();
  if (a.startsWith('G')) return 'G';
  if (a.startsWith('D')) return 'D';
  if (a.startsWith('M')) return 'M';
  if (a.startsWith('F') || a.startsWith('A') || a.startsWith('S')) return 'F';
  return 'M';
}
function statsOf(p) {
  const out = {};
  const cats = (p.statistics && p.statistics.splits && p.statistics.splits.categories) || [];
  cats.forEach(c => (c.stats || []).forEach(s => { if (!(s.name in out)) out[s.name] = s; }));
  return out;
}
const sv = (st, ...names) => { for (const n of names) if (st[n]) return Number(st[n].value != null ? st[n].value : st[n].displayValue) || 0; return 0; };
async function getRoster() {
  const j = await getJSON(ESPN + 'bel.1/teams/' + TEAM_ID + '/roster', 6 * 60 * MIN);
  let ath = j.athletes || [];
  if (ath.length && ath[0].items) ath = ath.flatMap(g => g.items || []);
  store.roster = ath;
  return ath;
}

/* ---------------- Données : actus RSS ---------------- */
function tagText(node, name) {
  const el = node.getElementsByTagName(name)[0];
  return el ? (el.textContent || '').trim() : '';
}
function firstImg(html) {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html || '');
  return m ? m[1] : '';
}
async function getRss(url, ttl) {
  const xml = await cached(url, ttl);
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const items = Array.from(doc.getElementsByTagName('item'));
  return items.map(i => {
    const source = tagText(i, 'source');
    let title = tagText(i, 'title');
    if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3));
    const enc = tagText(i, 'content:encoded');
    let img = '';
    const media = i.getElementsByTagName('media:content')[0] || i.getElementsByTagName('enclosure')[0];
    if (media && media.getAttribute('url')) img = media.getAttribute('url');
    if (!img) img = firstImg(enc) || firstImg(tagText(i, 'description'));
    return { title, link: tagText(i, 'link'), date: new Date(tagText(i, 'pubDate')), source, img };
  }).filter(x => x.title);
}
async function getOfficialNews() {
  try { return (await getRss(OFFICIAL_FEED, 20 * MIN)).map(n => Object.assign(n, { source: n.source || 'sporting-charleroi.be', official: true })); }
  catch (e) { return []; }
}

/* ---------------- Données : vidéos YouTube ---------------- */
async function getVideos() {
  const parse = xml => {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    return Array.from(doc.getElementsByTagName('entry')).map(e => {
      const id = tagText(e, 'yt:videoId');
      const th = e.getElementsByTagName('media:thumbnail')[0];
      const stats = e.getElementsByTagName('media:statistics')[0];
      return {
        id, title: tagText(e, 'title'), date: new Date(tagText(e, 'published')),
        thumb: (th && th.getAttribute('url')) || ('https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'),
        views: stats ? stats.getAttribute('views') : ''
      };
    }).filter(v => v.id);
  };
  try {
    const v = parse(await cached('https://www.youtube.com/feeds/videos.xml?channel_id=' + YT_CHANNEL_ID, 30 * MIN));
    if (v.length) return v;
  } catch (e) { /* on tente la découverte de la chaîne */ }
  const page = await cached(YT_HANDLE, 24 * 60 * MIN);
  const m = /"(?:channelId|externalId)":"(UC[\w-]{22})"/.exec(page) || /channel\/(UC[\w-]{22})/.exec(page);
  if (!m) throw new Error('Chaîne YouTube introuvable');
  return parse(await cached('https://www.youtube.com/feeds/videos.xml?channel_id=' + m[1], 30 * MIN));
}

/* ---------------- Composants ---------------- */
function teamCol(t) {
  return `<div class="team ${t.id === TEAM_ID ? 'us' : ''}">${t.logo ? `<img src="${esc(t.logo)}" loading="lazy" alt="">` : ''}<span>${esc(t.name)}</span></div>`;
}
function matchCard(m) {
  const r = resultOf(m);
  let when;
  if (m.state === 'in') when = `<b class="live">● EN DIRECT ${esc(m.detail)}</b>`;
  else if (m.state === 'pre') when = fmtDate(m.date) + ' · ' + (m.timeValid ? fmtTime(m.date) : 'heure à confirmer');
  else when = fmtDate(m.date) + (m.detail && !/^FT$|Final|^TF$/i.test(m.detail) ? ' · ' + esc(m.detail) : '');
  const so = (m.home.so != null && m.away.so != null) ? `<span class="small muted">t.a.b. ${esc(m.home.so)}-${esc(m.away.so)}</span>` : '';
  const center = m.state === 'pre'
    ? '<span class="vs">VS</span>'
    : `<span>${esc(m.home.score)} - ${esc(m.away.score)}</span>${so}${r ? `<span class="res res-${r}">${r === 'V' ? 'VICTOIRE' : r === 'N' ? 'NUL' : 'DÉFAITE'}</span>` : ''}`;
  return `<div class="match ${m.state === 'in' ? 'is-live' : ''}" data-match="${esc(m.id)}">
    <div class="mhead"><span>${esc(m.leagueName)}</span><span>${when}</span></div>
    <div class="mbody">${teamCol(m.home)}<div class="score">${center}</div>${teamCol(m.away)}</div>
    ${m.venue ? `<div class="mfoot">📍 ${esc(m.venue)}</div>` : ''}
  </div>`;
}
function formStrip(ms, n) {
  const last = played(ms).slice(-n);
  return `<div class="form">${last.map(m => `<i class="${resultOf(m)}" title="${esc(m.home.name + ' ' + m.home.score + '-' + m.away.score + ' ' + m.away.name)}">${resultOf(m)}</i>`).join('')}</div>`;
}
function newsItem(n) {
  return `<div class="news" data-open="${esc(n.link)}">
    ${n.img ? `<img src="${esc(n.img)}" loading="lazy" alt="" onerror="this.remove()">` : ''}
    <div><div class="nt">${n.official ? '<span class="tag">Officiel</span>' : ''}${esc(n.title)}</div>
    <div class="ns">${esc(n.source)}${n.source ? ' · ' : ''}${esc(ago(n.date))}</div></div>
  </div>`;
}
function seasonSummary(ms, leagueOnly) {
  const list = played(ms).filter(m => !leagueOnly || m.slug === 'bel.1');
  const s = { j: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, hv: 0, hn: 0, hd: 0, av: 0, an: 0, ad: 0, cs: 0, best: null };
  list.forEach(m => {
    const h = m.home.id === TEAM_ID, us = +(h ? m.home.score : m.away.score), th = +(h ? m.away.score : m.home.score);
    const r = resultOf(m);
    s.j++; s.bp += us; s.bc += th; if (th === 0) s.cs++;
    if (r === 'V') { s.v++; h ? s.hv++ : s.av++; } else if (r === 'N') { s.n++; h ? s.hn++ : s.an++; } else { s.d++; h ? s.hd++ : s.ad++; }
    if (!s.best || us - th > s.best.diff) s.best = { diff: us - th, m };
  });
  return s;
}

/* ---------------- Vues ---------------- */
async function viewHome() {
  const [mR, tR, nR, oR] = await Promise.allSettled([getMatches(), getStandings(), getRss(NEWS_URL, 15 * MIN), getOfficialNews()]);
  let html = '';
  const ms = mR.status === 'fulfilled' ? mR.value : [];
  const live = liveOnes(ms);
  if (live.length) {
    html += '<h2>En direct</h2>' + live.map(matchCard).join('');
    timers.push(setTimeout(() => { state.force = true; show('home', true); }, 60 * 1000));
  }
  const next = upcoming(ms)[0];
  if (next) {
    html += `<div class="hero"><div class="lbl">Prochain match · ${esc(next.leagueName)}</div>${matchCard(next).replace('class="match ', 'class="match" style="background:none;border:0;padding:0" data-x="')}
      <div class="small muted" style="text-align:center">${esc(fmtDateLong(next.date))}${next.timeValid ? ' à ' + fmtTime(next.date) : ''}</div>
      <div class="countdown" id="cd" data-t="${next.date.getTime()}"></div></div>`;
  }
  const last = played(ms).slice(-1)[0];
  if (last) html += '<h2>Dernier résultat</h2>' + matchCard(last);

  if (tR.status === 'fulfilled') {
    const g = tR.value[0];
    const us = g.entries.find(e => String(e.team.id) === TEAM_ID);
    if (us) {
      html += `<h2>Pro League ${esc(g.season)}</h2><div class="kpis">
        <div class="kpi"><b>${esc(us.s.rank)}<sup style="font-size:12px">e</sup></b><span>Position</span></div>
        <div class="kpi"><b>${esc(us.s.points)}</b><span>Points</span></div>
        <div class="kpi"><b>${esc(us.s.gamesPlayed)}</b><span>Joués</span></div>
        <div class="kpi"><b>${esc(us.s.pointDifferential_d || us.s.pointDifferential)}</b><span>Diff.</span></div></div>
        <div class="card" data-tab="table" style="display:flex;justify-content:space-between;align-items:center">
          <div><div class="small muted">Forme (5 derniers)</div>${formStrip(ms, 5)}</div>
          <div class="small">${esc(us.s.wins)}V · ${esc(us.s.ties)}N · ${esc(us.s.losses)}D ›</div></div>`;
    }
  }
  const news = [...(oR.status === 'fulfilled' ? oR.value.slice(0, 2) : []), ...(nR.status === 'fulfilled' ? nR.value.sort((a, b) => b.date - a.date).slice(0, 5) : [])];
  if (news.length) html += '<h2>Dernières infos</h2>' + news.map(newsItem).join('') + '<button class="btn ghost" data-tab="news">Toutes les actus ›</button>';
  if (!html) throw new Error('Aucune donnée disponible (connexion ?)');
  return html;
}
function startCountdown() {
  const el = $('#cd');
  if (!el) return;
  const t = +el.dataset.t;
  const tick = () => {
    let d = Math.max(0, t - Date.now()) / 1000;
    const j = Math.floor(d / 86400); d -= j * 86400;
    const h = Math.floor(d / 3600); d -= h * 3600;
    const m = Math.floor(d / 60); const s = Math.floor(d - m * 60);
    el.innerHTML = [[j, 'jours'], [h, 'heures'], [m, 'min'], [s, 'sec']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
  };
  tick();
  timers.push(setInterval(tick, 1000));
}

async function viewTable() {
  const groups = await getStandings();
  let html = '';
  groups.forEach(g => {
    const notes = {};
    html += `<h2>${esc(g.name)} ${esc(g.season)}</h2><div class="tbl-wrap"><table>
      <tr><th>#</th><th style="text-align:left">Équipe</th><th>J</th><th>V</th><th>N</th><th>D</th><th>BP</th><th>BC</th><th>DB</th><th>Pts</th></tr>`;
    g.entries.forEach(e => {
      const c = e.note && e.note.color ? (e.note.color[0] === '#' ? e.note.color : '#' + e.note.color) : 'transparent';
      if (e.note && e.note.description) notes[e.note.description] = c;
      html += `<tr class="${String(e.team.id) === TEAM_ID ? 'us' : ''}">
        <td class="pos" style="border-left-color:${esc(c)}">${esc(e.s.rank)}</td>
        <td class="tm">${logoOf(e.team) ? `<img src="${esc(logoOf(e.team))}" loading="lazy" alt="">` : ''}${esc(e.team.shortDisplayName || e.team.displayName)}</td>
        <td>${esc(e.s.gamesPlayed)}</td><td>${esc(e.s.wins)}</td><td>${esc(e.s.ties)}</td><td>${esc(e.s.losses)}</td>
        <td>${esc(e.s.pointsFor)}</td><td>${esc(e.s.pointsAgainst)}</td><td>${esc(e.s.pointDifferential_d || e.s.pointDifferential)}</td>
        <td class="pts">${esc(e.s.points)}</td></tr>`;
    });
    html += '</table></div>';
    const keys = Object.keys(notes);
    if (keys.length) html += '<div class="legend">' + keys.map(k => `<span><i style="background:${esc(notes[k])}"></i>${esc(trNote(k))}</span>`).join('') + '</div>';
  });
  html += '<p class="small muted">J = joués · V = victoires · N = nuls · D = défaites · BP/BC = buts pour/contre · DB = différence de buts</p>';
  return html;
}
function trNote(k) {
  return k.replace(/Championship playoffs?/i, 'Play-offs I (titre)')
    .replace(/Europe(an)? playoffs?/i, 'Play-offs II (Europe)')
    .replace(/Relegation playoffs?/i, 'Play-offs III (maintien)')
    .replace(/Relegation/i, 'Relégation').replace(/Promotion/i, 'Promotion');
}

async function viewMatches() {
  const ms = await getMatches();
  const live = liveOnes(ms);
  const up = upcoming(ms);
  const past = played(ms).slice().reverse();
  const f = state.matchFilter;
  let html = `<div class="seg"><button data-filter="upcoming" class="${f === 'upcoming' ? 'on' : ''}">À venir (${up.length})</button>
    <button data-filter="results" class="${f === 'results' ? 'on' : ''}">Résultats (${past.length})</button>
    <button data-filter="stats" class="${f === 'stats' ? 'on' : ''}">Stats saison</button></div>`;
  if (live.length) {
    html += '<h2>En direct</h2>' + live.map(matchCard).join('');
    timers.push(setTimeout(() => { state.force = true; show('matches', true); }, 60 * 1000));
  }
  if (f === 'upcoming') html += up.length ? up.map(matchCard).join('') : '<div class="empty">Aucun match programmé pour le moment.</div>';
  else if (f === 'results') html += past.length ? past.map(matchCard).join('') : '<div class="empty">Aucun match joué.</div>';
  else html += seasonStatsHtml(ms);
  html += '<p class="small muted" style="text-align:center">Touchez un match pour voir les stats, les buteurs et les compositions.</p>';
  return html;
}
function seasonStatsHtml(ms) {
  const all = seasonSummary(ms, false), lg = seasonSummary(ms, true);
  const block = (t, s) => !s.j ? '' : `<h2>${t}</h2>
    <div class="kpis"><div class="kpi"><b>${s.j}</b><span>Matchs</span></div><div class="kpi"><b style="color:var(--win)">${s.v}</b><span>Victoires</span></div>
    <div class="kpi"><b>${s.n}</b><span>Nuls</span></div><div class="kpi"><b style="color:var(--loss)">${s.d}</b><span>Défaites</span></div></div>
    <div class="card"><dl class="info">
      <dt>Buts marqués</dt><dd>${s.bp} (${(s.bp / s.j).toFixed(2)} / match)</dd>
      <dt>Buts encaissés</dt><dd>${s.bc} (${(s.bc / s.j).toFixed(2)} / match)</dd>
      <dt>Clean sheets</dt><dd>${s.cs}</dd>
      <dt>À domicile</dt><dd>${s.hv}V · ${s.hn}N · ${s.hd}D</dd>
      <dt>À l'extérieur</dt><dd>${s.av}V · ${s.an}N · ${s.ad}D</dd>
      <dt>% victoires</dt><dd>${Math.round(100 * s.v / s.j)} %</dd>
      ${s.best && s.best.diff > 0 ? `<dt>Plus large victoire</dt><dd>${esc(s.best.m.home.name)} ${esc(s.best.m.home.score)}-${esc(s.best.m.away.score)} ${esc(s.best.m.away.name)}</dd>` : ''}
    </dl></div>`;
  return (block('Toutes compétitions', all) + block('Pro League', lg)) || '<div class="empty">Pas encore de statistiques.</div>';
}

const MSTAT = {
  possessionPct: 'Possession (%)', totalShots: 'Tirs', shotsOnTarget: 'Tirs cadrés', wonCorners: 'Corners',
  foulsCommitted: 'Fautes', yellowCards: 'Cartons jaunes', redCards: 'Cartons rouges', offsides: 'Hors-jeu',
  saves: 'Arrêts', accuratePasses: 'Passes réussies', totalPasses: 'Passes', passPct: 'Précision des passes',
  totalCrosses: 'Centres', totalTackles: 'Tacles', interceptions: 'Interceptions', effectiveClearance: 'Dégagements',
  totalLongBalls: 'Longs ballons', blockedShots: 'Tirs contrés'
};
async function openMatch(id) {
  const m = store.matches.find(x => x.id === id);
  if (!m) return;
  openModal(matchCard(m) + loader());
  let s;
  try { s = await getJSON(ESPN + m.slug + '/summary?event=' + id, m.state === 'post' ? 60 * MIN : 2 * MIN); }
  catch (e) { setModal(matchCard(m) + errorBox('Détails indisponibles pour ce match.', e)); return; }
  let html = matchCard(m);
  const gi = s.gameInfo || (s.boxscore && s.boxscore.gameInfo) || {};
  const venue = gi.venue && (gi.venue.fullName + (gi.venue.address && gi.venue.address.city ? ', ' + gi.venue.address.city : ''));
  html += `<div class="card"><dl class="info"><dt>Date</dt><dd>${esc(fmtDateLong(m.date))}${m.timeValid ? ' · ' + fmtTime(m.date) : ''}</dd>
    ${venue ? `<dt>Stade</dt><dd>${esc(venue)}</dd>` : ''}
    ${gi.attendance ? `<dt>Spectateurs</dt><dd>${Number(gi.attendance).toLocaleString('fr-BE')}</dd>` : ''}
    ${gi.officials && gi.officials[0] ? `<dt>Arbitre</dt><dd>${esc(gi.officials[0].displayName || gi.officials[0].fullName)}</dd>` : ''}
    <dt>Compétition</dt><dd>${esc(m.leagueName)}</dd></dl></div>`;

  // Faits de match
  const homeId = m.home.id;
  let evs = (s.keyEvents || []).filter(e => {
    const t = ((e.type && (e.type.text || e.type.type)) || '').toLowerCase();
    return e.scoringPlay || /goal|card|penalty|substitution|but|carton/.test(t);
  }).map(e => {
    const t = ((e.type && (e.type.text || e.type.type)) || '').toLowerCase();
    const icon = e.scoringPlay || /goal/.test(t) ? '⚽' : /red/.test(t) ? '🟥' : /yellow/.test(t) ? '🟨' : /substitution/.test(t) ? '🔄' : '•';
    const names = (e.participants || []).map(p => p.athlete && p.athlete.displayName).filter(Boolean);
    let label = names.length ? names[0] : (e.shortText || e.text || '');
    if (icon === '🔄' && names.length > 1) label = '↑ ' + names[0] + ' ↓ ' + names[1];
    else if (icon === '⚽' && names.length > 1) label += ' (passe : ' + names[1] + ')';
    if (/own goal/.test(t)) label += ' (csc)';
    if (/penalty/.test(t) && icon === '⚽') label += ' (pen.)';
    return { clock: (e.clock && e.clock.displayValue) || '', icon, label, home: e.team && String(e.team.id) === homeId };
  });
  if (!evs.length) {
    const det = (s.header && s.header.competitions && s.header.competitions[0] && s.header.competitions[0].details) || [];
    evs = det.map(d => ({
      clock: (d.clock && d.clock.displayValue) || '',
      icon: d.scoringPlay ? '⚽' : d.redCard ? '🟥' : d.yellowCard ? '🟨' : '•',
      label: ((d.athletesInvolved || []).map(a => a.displayName).join(', ') || (d.type && d.type.text) || '') + (d.penaltyKick ? ' (pen.)' : '') + (d.ownGoal ? ' (csc)' : ''),
      home: d.team && String(d.team.id) === homeId
    }));
  }
  if (evs.length) {
    html += '<h2>Faits de match</h2><div class="card">' + evs.map(e => `<div class="ev">
      <div class="l">${e.home ? esc(e.label) + ' ' + e.icon : ''}</div><div class="t">${esc(e.clock)}</div><div class="r">${!e.home ? e.icon + ' ' + esc(e.label) : ''}</div></div>`).join('') + '</div>';
  }

  // Statistiques
  const bt = (s.boxscore && s.boxscore.teams) || [];
  const bh = bt.find(t => t.homeAway === 'home') || bt[0], ba = bt.find(t => t.homeAway === 'away') || bt[1];
  if (bh && ba && bh.statistics && bh.statistics.length) {
    const get = (t, n) => (t.statistics.find(x => x.name === n) || {});
    let names = Object.keys(MSTAT).filter(n => get(bh, n).displayValue != null);
    const preMatch = m.state === 'pre';
    if (!names.length) names = bh.statistics.map(x => x.name).slice(0, 14);
    html += `<h2>${preMatch ? 'Stats de la saison' : 'Statistiques du match'}</h2><div class="card">
      <div class="lab small" style="display:flex;justify-content:space-between;margin-bottom:6px"><b>${esc(m.home.name)}</b><b>${esc(m.away.name)}</b></div>`;
    names.forEach(n => {
      const a = get(bh, n), b = get(ba, n);
      const va = parseFloat(a.displayValue) || 0, vb = parseFloat(b.displayValue) || 0, tot = va + vb || 1;
      html += `<div class="statrow"><div class="lab"><b>${esc(a.displayValue)}</b><span>${esc(MSTAT[n] || a.label || n)}</span><b>${esc(b.displayValue)}</b></div>
        <div class="bars"><div class="side"><div class="h" style="width:${100 * va / tot}%"></div></div><div class="side r"><div class="a" style="width:${100 * vb / tot}%"></div></div></div></div>`;
    });
    html += '</div>';
  }

  // Forme récente
  const lfg = s.lastFiveGames || (s.boxscore && s.boxscore.lastFiveGames) || [];
  if (lfg.length) {
    const L = { W: 'V', D: 'N', L: 'D' };
    html += '<h2>Forme récente</h2><div class="card">' + lfg.map(t => `<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0">
      <b>${esc((t.team && (t.team.shortDisplayName || t.team.displayName)) || '')}</b>
      <div class="form">${(t.events || []).map(e => { const r = L[e.gameResult] || e.gameResult || '?'; return `<i class="${esc(r)}" title="${esc((e.opponent && e.opponent.displayName) || '')} ${esc(e.score || '')}">${esc(r)}</i>`; }).join('')}</div></div>`).join('') + '</div>';
  }

  // Compositions
  const ro = s.rosters || [];
  if (ro.length === 2 && ro.some(r => (r.roster || []).length)) {
    const rh = ro.find(r => r.homeAway === 'home') || ro[0], ra = ro.find(r => r.homeAway === 'away') || ro[1];
    const col = r => {
      const list = r.roster || [];
      const st = list.filter(p => p.starter), sub = list.filter(p => !p.starter);
      const li = p => `<li><b>${esc(p.jersey || '')}</b>${esc(p.athlete && p.athlete.displayName)}${p.subbedOut ? ' <span class="muted">↓</span>' : ''}${p.subbedIn ? ' <span class="muted">↑</span>' : ''}</li>`;
      return `<div><div style="font-weight:800;margin-bottom:4px">${esc(r.team && (r.team.shortDisplayName || r.team.displayName))}${r.formation ? ` <span class="muted small">(${esc(r.formation)})</span>` : ''}</div>
        <ul>${st.map(li).join('')}</ul>${sub.length ? `<div class="small muted" style="margin:8px 0 2px">Remplaçants</div><ul>${sub.map(li).join('')}</ul>` : ''}</div>`;
    };
    html += '<h2>Compositions</h2><div class="card lineups">' + col(rh) + col(ra) + '</div>';
  }
  const vids = s.videos || [];
  if (vids.length) {
    html += '<h2>Vidéos</h2>' + vids.slice(0, 6).map(v => `<div class="news" data-open="${esc((v.links && v.links.mobile && v.links.mobile.href) || (v.links && v.links.web && v.links.web.href) || '')}">
      ${v.thumbnail ? `<img src="${esc(v.thumbnail)}" alt="">` : ''}<div><div class="nt">${esc(v.headline)}</div></div></div>`).join('');
  }
  setModal(html);
}

const PSTAT = {
  appearances: 'Matchs', subIns: 'Entrées en jeu', totalGoals: 'Buts', goalAssists: 'Passes décisives',
  totalShots: 'Tirs', shotsOnTarget: 'Tirs cadrés', yellowCards: 'Cartons jaunes', redCards: 'Cartons rouges',
  foulsCommitted: 'Fautes commises', foulsSuffered: 'Fautes subies', offsides: 'Hors-jeu', ownGoals: 'Buts contre son camp',
  saves: 'Arrêts', goalsConceded: 'Buts encaissés', shotsFaced: 'Tirs subis', cleanSheet: 'Clean sheets', penaltyKickSaved: 'Penaltys arrêtés'
};
async function viewSquad() {
  const ath = await getRoster();
  if (!ath.length) return '<div class="empty">Effectif indisponible.</div>';
  const withStats = ath.map(p => ({ p, st: statsOf(p) }));
  const top = (key, n) => withStats.map(x => ({ x, v: sv(x.st, key) })).filter(o => o.v > 0).sort((a, b) => b.v - a.v).slice(0, n);
  const scorers = top('totalGoals', 5), assists = top('goalAssists', 5);
  let html = '';
  if (scorers.length || assists.length) {
    const ol = arr => arr.length ? `<ol>${arr.map(o => `<li data-player="${esc(o.x.p.id)}">${esc(o.x.p.displayName)} <b>${o.v}</b></li>`).join('')}</ol>` : '<div class="small muted">—</div>';
    html += `<h2>Meilleurs joueurs</h2><div class="leaders"><div class="card"><b>⚽ Buteurs</b>${ol(scorers)}</div><div class="card"><b>🎯 Passeurs</b>${ol(assists)}</div></div>`;
  }
  ['G', 'D', 'M', 'F'].forEach(k => {
    const grp = withStats.filter(x => posKey(x.p) === k).sort((a, b) => (+a.p.jersey || 99) - (+b.p.jersey || 99));
    if (!grp.length) return;
    html += `<h2>${POS[k]} (${grp.length})</h2><div class="grid">` + grp.map(({ p, st }) => {
      const apps = sv(st, 'appearances'), g = sv(st, 'totalGoals'), a = sv(st, 'goalAssists'), sav = sv(st, 'saves');
      return `<div class="player" data-player="${esc(p.id)}"><div class="num">${esc(p.jersey || '–')}</div><div>
        <div class="pname">${esc(p.displayName)}</div>
        <div class="pmeta">${p.flag && p.flag.href ? `<img src="${esc(p.flag.href)}" alt="">` : ''}${esc(p.citizenship || '')}${p.age ? ' · ' + esc(p.age) + ' ans' : ''}</div>
        <div class="chips"><span class="chip">${apps} m.</span>${k === 'G' ? `<span class="chip">${sav} arr.</span>` : `<span class="chip">⚽ ${g}</span><span class="chip">🎯 ${a}</span>`}</div>
      </div></div>`;
    }).join('') + '</div>';
  });
  html += '<p class="small muted">Statistiques Pro League de la saison en cours. Touchez un joueur pour sa fiche complète.</p>';
  return html;
}
function openPlayer(id) {
  const p = store.roster.find(x => String(x.id) === String(id));
  if (!p) return;
  const st = statsOf(p);
  const born = p.dateOfBirth ? new Date(p.dateOfBirth) : null;
  const bp = p.birthPlace ? [p.birthPlace.city, p.birthPlace.country].filter(Boolean).join(', ') : '';
  const inj = (p.injuries || []).map(i => i.status || i.type || '').filter(Boolean).join(', ');
  let html = `<div style="display:flex;gap:14px;align-items:center;margin-bottom:14px"><div class="num" style="width:64px;height:64px;font-size:26px">${esc(p.jersey || '–')}</div>
    <div><div style="font-size:20px;font-weight:800">${esc(p.fullName || p.displayName)}</div><div class="muted">${esc((p.position && (p.position.displayName || p.position.name)) || '')}</div></div></div>
    <div class="card"><dl class="info">
      ${p.age ? `<dt>Âge</dt><dd>${esc(p.age)} ans</dd>` : ''}
      ${born && !isNaN(born) ? `<dt>Né le</dt><dd>${born.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</dd>` : ''}
      ${bp ? `<dt>Lieu de naissance</dt><dd>${esc(bp)}</dd>` : ''}
      ${p.citizenship ? `<dt>Nationalité</dt><dd>${p.flag && p.flag.href ? `<img src="${esc(p.flag.href)}" style="width:18px;vertical-align:middle;margin-right:5px" alt="">` : ''}${esc(p.citizenship)}</dd>` : ''}
      ${p.displayHeight ? `<dt>Taille</dt><dd>${esc(p.displayHeight)}</dd>` : ''}
      ${p.displayWeight ? `<dt>Poids</dt><dd>${esc(p.displayWeight)}</dd>` : ''}
      ${inj ? `<dt>Infirmerie</dt><dd style="color:var(--loss)">${esc(inj)}</dd>` : ''}
    </dl></div><h2>Statistiques saison</h2>`;
  const keys = Object.keys(st);
  if (keys.length) {
    const ordered = Object.keys(PSTAT).filter(k => st[k]).concat(keys.filter(k => !PSTAT[k]));
    html += '<div class="card"><dl class="info">' + ordered.map(k => `<dt>${esc(PSTAT[k] || st[k].displayName || k)}</dt><dd>${esc(st[k].displayValue != null ? st[k].displayValue : st[k].value)}</dd>`).join('') + '</dl></div>';
  } else html += '<div class="empty">Pas de statistiques pour ce joueur.</div>';
  const q = encodeURIComponent((p.fullName || p.displayName) + ' Charleroi');
  html += `<button class="btn" data-open="https://news.google.com/search?q=${q}&hl=fr&gl=BE&ceid=BE:fr">📰 Actus du joueur</button>
    <button class="btn ghost" data-open="https://www.youtube.com/results?search_query=${q}">▶ Vidéos</button>
    <button class="btn ghost" data-open="https://www.transfermarkt.fr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(p.fullName || p.displayName)}">💶 Valeur marchande</button>`;
  openModal(html);
}

async function viewNews() {
  const [g, o] = await Promise.allSettled([getRss(NEWS_URL, 15 * MIN), getOfficialNews()]);
  const off = o.status === 'fulfilled' ? o.value : [];
  const gen = g.status === 'fulfilled' ? g.value : [];
  if (!off.length && !gen.length) throw (g.reason || new Error('Aucune actu'));
  let html = '';
  if (off.length) html += '<h2>Communiqués officiels</h2>' + off.slice(0, 8).map(newsItem).join('');
  html += '<h2>Dans la presse</h2>' + gen.sort((a, b) => b.date - a.date).slice(0, 40).map(newsItem).join('');
  html += '<button class="btn ghost" data-open="https://www.sporting-charleroi.be/">Site officiel ›</button>';
  return html;
}
async function viewMercato() {
  const list = (await getRss(MERCATO_URL, 20 * MIN)).sort((a, b) => b.date - a.date);
  let html = `<div class="card"><b>💼 Mercato des Zèbres</b><div class="small muted" style="margin-top:4px">Transferts, prêts, rumeurs et prolongations : la presse belge et internationale en continu.</div>
    <div style="margin-top:8px"><button class="btn" data-open="https://www.transfermarkt.fr/schnellsuche/ergebnis/schnellsuche?query=Sporting+Charleroi">Transfermarkt ›</button>
    <button class="btn ghost" data-open="https://news.google.com/search?q=Charleroi%20transfert&hl=fr&gl=BE&ceid=BE:fr">Plus d'articles ›</button></div></div>`;
  html += '<h2>Derniers échos</h2>' + (list.length ? list.slice(0, 40).map(newsItem).join('') : '<div class="empty">Aucune info mercato récente.</div>');
  return html;
}
async function viewVideos() {
  let html = `<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:8px">
    <div><b>▶ Sporting Charleroi TV</b><div class="small muted">Chaîne YouTube officielle du club</div></div>
    <button class="btn" data-open="${YT_HANDLE}">Ouvrir</button></div>`;
  try {
    const v = await getVideos();
    html += '<h2>Dernières vidéos</h2><div class="vgrid">' + v.map(x => `<div class="video" data-open="https://www.youtube.com/watch?v=${esc(x.id)}">
      <div class="thumb"><img src="${esc(x.thumb)}" loading="lazy" alt=""></div>
      <div class="vt">${esc(x.title)}</div><div class="vs2">${esc(ago(x.date))}${x.views ? ' · ' + Number(x.views).toLocaleString('fr-BE') + ' vues' : ''}</div></div>`).join('') + '</div>';
  } catch (e) {
    html += errorBox('Impossible de charger les vidéos pour le moment.', e);
  }
  html += `<h2>Recherches rapides</h2>
    <button class="btn ghost" data-open="https://www.youtube.com/results?search_query=Charleroi+r%C3%A9sum%C3%A9+Pro+League">Résumés de matchs</button>
    <button class="btn ghost" data-open="https://www.youtube.com/results?search_query=Sporting+Charleroi+buts">Tous les buts</button>
    <button class="btn ghost" data-open="https://www.youtube.com/results?search_query=Charleroi+conf%C3%A9rence+de+presse">Conférences de presse</button>`;
  return html;
}
function viewClub() {
  const v = (window.Native && window.Native.version) ? window.Native.version() : 'web';
  return `<h2>Carte d'identité</h2><div class="card"><dl class="info">
    <dt>Nom</dt><dd>Royal Charleroi Sporting Club</dd>
    <dt>Surnom</dt><dd>Les Zèbres · les Carolos</dd>
    <dt>Fondation</dt><dd>1904</dd>
    <dt>Matricule</dt><dd>22</dd>
    <dt>Couleurs</dt><dd>Noir et blanc</dd>
    <dt>Ville</dt><dd>Charleroi (Hainaut, Belgique)</dd>
    <dt>Stade</dt><dd>Stade du Pays de Charleroi (« le Mambourg »)</dd>
    <dt>Championnat</dt><dd>Jupiler Pro League (D1 belge)</dd>
  </dl></div>
  <h2>Palmarès & histoire</h2><div class="card" style="line-height:1.5;font-size:14px">
    <div>🥈 <b>Vice-champion de Belgique</b> en 1968-69</div>
    <div>🏆 <b>Finaliste de la Coupe de Belgique</b> en 1978 et 1993</div>
    <div>🇪🇺 Plusieurs participations aux coupes européennes (Coupe UEFA, Europa League)</div>
    <div>⚔️ Grand rival historique : le Standard de Liège, et derby wallon face à La Louvière</div>
    <div class="muted small" style="margin-top:8px">Club phare de Wallonie, le Sporting est connu pour l'ambiance du Mambourg et la ferveur de ses supporters.</div>
  </div>
  <h2>Liens officiels</h2>
  <button class="btn" data-open="https://www.sporting-charleroi.be/">🌐 Site officiel</button>
  <button class="btn" data-open="https://ticketing.sporting-charleroi.be/">🎟️ Billetterie & boutique</button>
  <button class="btn ghost" data-open="https://www.facebook.com/rcsc.be">Facebook</button>
  <button class="btn ghost" data-open="https://www.instagram.com/rcsc.officiel/">Instagram</button>
  <button class="btn ghost" data-open="https://twitter.com/SportCharleroi">X / Twitter</button>
  <button class="btn ghost" data-open="https://www.tiktok.com/@rcsc_officiel">TikTok</button>
  <button class="btn ghost" data-open="${YT_HANDLE}">YouTube</button>
  <button class="btn ghost" data-open="https://www.google.com/maps/search/?api=1&query=Stade+du+Pays+de+Charleroi">📍 Itinéraire vers le stade</button>
  <div class="foot">Application de fan non officielle · v${esc(v)}<br>Données : ESPN, Google Actualités, YouTube. Mises à jour automatiques, consultables hors ligne (dernière version).</div>`;
}

/* ---------------- Navigation ---------------- */
const views = { home: viewHome, table: viewTable, matches: viewMatches, squad: viewSquad, news: viewNews, mercato: viewMercato, videos: viewVideos, club: viewClub };
function clearTimers() { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = []; }
async function show(tab, silent) {
  state.tab = tab;
  clearTimers();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const btn = document.querySelector('#tabs button[data-tab="' + tab + '"]');
  if (btn && btn.scrollIntoView) btn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  const c = $('#content');
  if (!silent) { c.innerHTML = loader(); window.scrollTo(0, 0); }
  const token = ++renderSeq;
  const rb = document.querySelector('[data-refresh]');
  rb.classList.add('spin');
  try {
    const html = await views[tab]();
    if (token !== renderSeq) return;
    c.innerHTML = html;
    if (tab === 'home') startCountdown();
  } catch (e) {
    if (token !== renderSeq) return;
    c.innerHTML = errorBox('Chargement impossible. Vérifiez votre connexion puis touchez ⟳.', e);
  } finally {
    if (token === renderSeq) { rb.classList.remove('spin'); state.force = false; }
  }
}
function openModal(html) { $('#modal-body').innerHTML = html; $('#modal').classList.remove('hidden'); $('.sheet').scrollTop = 0; }
function setModal(html) { if (!$('#modal').classList.contains('hidden')) $('#modal-body').innerHTML = html; }
function closeModal() { $('#modal').classList.add('hidden'); $('#modal-body').innerHTML = ''; }
function openUrl(url) {
  if (!url) return;
  if (window.Native && window.Native.open) window.Native.open(url); else window.open(url, '_blank');
}
window.onBack = () => {
  if (!$('#modal').classList.contains('hidden')) { closeModal(); return true; }
  if (state.tab !== 'home') { show('home'); return true; }
  return false;
};

document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-match],[data-open],[data-filter],[data-player],[data-refresh],[data-close]');
  if (!t) { if (e.target.id === 'modal') closeModal(); return; }
  if (t.hasAttribute('data-close')) return closeModal();
  if (t.hasAttribute('data-refresh')) { state.force = true; return show(state.tab); }
  if (t.dataset.open) { e.preventDefault(); return openUrl(t.dataset.open); }
  if (t.dataset.match) return openMatch(t.dataset.match);
  if (t.dataset.player) return openPlayer(t.dataset.player);
  if (t.dataset.filter) { state.matchFilter = t.dataset.filter; return show('matches', true); }
  if (t.dataset.tab) { closeModal(); return show(t.dataset.tab); }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && state.tab === 'home') show('home', true); });

show('home');
