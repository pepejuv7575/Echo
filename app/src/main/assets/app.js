"use strict";
/* ============ Outils ============ */
const A = window.Android;
function nat(fn, ...a){ try{ if(A && typeof A[fn]==="function") return A[fn](...a); }catch(e){} return undefined; }
const $ = s => document.querySelector(s);
const esc = s => String(s==null?"":s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => String(s||"").toLowerCase().replace(/œ/g,"oe").replace(/æ/g,"ae").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[’'`\-]/g," ").replace(/\s+/g," ");
const store = {
  get(k,d){ try{ const v=localStorage.getItem("dolci."+k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem("dolci."+k, JSON.stringify(v)); }catch(e){} }
};
const S = {
  favs: store.get("favs", []), done: store.get("done", {}), notes: store.get("notes", {}),
  shop: store.get("shop", []), timers: store.get("timers", []),
  settings: Object.assign({voixMinuteur:true, lectureAuto:false, lireReponses:false}, store.get("settings", {})),
  chat: store.get("chat", [])
};
function save(k){ store.set(k, S[k]); }
const R = {}; RECETTES.forEach((r,i)=>{ r.idx=i; R[r.id]=r; r._s = norm([r.n,r.it,r.reg,r.cat,r.desc,(r.tags||[]).join(" "),r.ing.map(x=>Array.isArray(x)?x[2]:"").join(" ")].join(" ")); });
const VRAIES = RECETTES.filter(r=>r.zone!=="base");
const DIFF = ["","Facile","Moyen","Difficile"];
const stars = d => "★".repeat(d)+"☆".repeat(3-d);
function fmtMin(m){ if(!m||m<=0) return "—"; if(m<60) return m+" min"; if(m<1440){ const h=Math.floor(m/60), mm=m%60; return h+" h"+(mm?" "+String(mm).padStart(2,"0"):""); } const j=Math.round(m/1440*2)/2; return String(j).replace(".",",")+" j"; }
function fmtSec(s){ s=Math.max(0,Math.round(s)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(x).padStart(2,"0"); }
function fmtDur(s){ if(s<60) return s+" s"; const m=Math.round(s/60); return fmtMin(m); }
const num = v => String(v).replace(".",",");
function frac(v){ const i=Math.floor(v), d=v-i; if(Math.abs(d-0.5)<0.01) return (i?i+" ":"")+"½"; if(Math.abs(d-0.25)<0.01) return (i?i+" ":"")+"¼"; if(Math.abs(d-0.75)<0.01) return (i?i+" ":"")+"¾"; return num(Math.round(v*100)/100); }
function toast(t, ms){ const el=$("#toast"); el.textContent=t; el.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>el.hidden=true, ms||2600); }
function speak(t){ if(!t) return; const clean=String(t).replace(/<[^>]+>/g," ").replace(/[•▶◀⏱️⏰🎬🛒🤖📤✅♥🔊🎤]/g,""); if(nat("speak", clean)===undefined && window.speechSynthesis){ try{ const u=new SpeechSynthesisUtterance(clean); u.lang="fr-FR"; speechSynthesis.cancel(); speechSynthesis.speak(u);}catch(e){} } }
function stopSpeak(){ nat("stopSpeaking"); try{ window.speechSynthesis && speechSynthesis.cancel(); }catch(e){} }
function share(t){ if(nat("share", t)===undefined){ if(navigator.share) navigator.share({text:t}).catch(()=>{}); else { try{ navigator.clipboard.writeText(t); toast("Copié dans le presse-papiers"); }catch(e){} } } }
function openUrl(u){ if(nat("openUrl", u)===undefined) window.open(u, "_blank"); }
function yt(q){ openUrl("https://www.youtube.com/results?search_query="+encodeURIComponent(q)); }

/* Voix (reconnaissance) */
let voiceHandler = null;
window.onVoiceResult = t => { if(voiceHandler) voiceHandler(String(t||"")); };
window.onVoiceError = m => toast(m || "Reconnaissance vocale indisponible. Vérifie que l'application Google est installée.");
function listen(prompt, handler){
  voiceHandler = handler;
  if(A && A.listen){ nat("listen", prompt||"Je t'écoute…"); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ window.onVoiceError(); return; }
  try{ const r=new SR(); r.lang="fr-FR"; r.onresult=e=>window.onVoiceResult(e.results[0][0].transcript); r.onerror=()=>window.onVoiceError(); r.start(); toast("🎤 Je t'écoute…"); }catch(e){ window.onVoiceError(); }
}

/* ============ Quantités ============ */
function scaledNum(q, f){ return q==null ? null : q*f; }
function fq(q, unit, f){
  if(q==null) return "";
  let v=q*f;
  if(unit==="g"||unit==="ml"){
    v = v>=100 ? Math.round(v/5)*5 : v>=10 ? Math.round(v) : Math.round(v*10)/10;
    if(unit==="g" && v>=1000) return num(Math.round(v/10)/100)+" kg";
    if(unit==="ml" && v>=1000) return num(Math.round(v/10)/100)+" l";
    return num(v)+" "+unit;
  }
  if(unit==="l"){ if(v<1) return Math.round(v*100)*10+" ml"; return num(Math.round(v*100)/100)+" l"; }
  v = Math.round(v*4)/4; if(unit===""||unit==="gouttes") v=Math.max(0.5, Math.round(v*2)/2); if(v===0) v=0.25;
  let u=unit; if(unit==="pincée" && v>1) u="pincées";
  return frac(v)+(u?" "+u:"");
}
function lbl(label, q, f){ if(label.indexOf("|")<0) return label; const [sg,pl]=label.split("|"); return (q!=null && q*f>1) ? pl : sg; }
function ingLines(r, f){ return r.ing.map(x => typeof x==="string" ? {grp:x} : {q:fq(x[0],x[1],f), l:lbl(x[2],x[0],f)}); }
function portInfo(r, port){ return r.port===1 ? {f:port, txt:"× "+num(port)+" "+r.pu} : {f:port/r.port, txt:port+" "+r.pu}; }
function portStep(r){ return r.port===1 ? 0.5 : r.port>=20 ? 5 : r.port>=10 ? 2 : 1; }

/* ============ Navigation ============ */
let stack = [{v:"home", p:{}}];
let cook = null;
const TITLES = {home:"Dolci d'Italia", list:"Recettes", assistant:"Assistant", courses:"Liste de courses", aide:"Aide & astuces"};
function go(v, p){ stack[stack.length-1].scroll = window.scrollY; stack.push({v, p:p||{}}); render(); }
function tab(v, p){ stack=[{v, p:p||{}}]; render(); }
function openR(id){ go("recipe", {id}); }
window.appBack = function(){
  if(!$("#sheet").hidden){ closeSheet(); return true; }
  if(cook){ exitCook(); return true; }
  if(stack.length>1){ stack.pop(); render(); return true; }
  if(stack[0].v!=="home"){ tab("home"); return true; }
  return false;
};
function render(){
  const cur = stack[stack.length-1];
  document.body.classList.toggle("assist", cur.v==="assistant");
  $("#btnBack").hidden = stack.length<=1;
  $("#title").textContent = cur.v==="recipe" ? (R[cur.p.id]||{}).n : (TITLES[cur.v]||"Dolci d'Italia");
  const root = stack[0].v;
  document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("on", b.dataset.tab===(cur.v==="assistant"?"assistant":root)));
  VIEWS[cur.v](cur.p);
  window.scrollTo(0, cur.scroll||0);
  renderTimers();
}
document.addEventListener("click", e => {
  const c = e.target.closest("[data-r]"); if(c){ openR(c.dataset.r); return; }
  const t = e.target.closest("#tabs button"); if(t){ tab(t.dataset.tab); }
});
$("#btnBack").onclick = () => window.appBack();
$("#btnTimers").onclick = () => timersSheet();

/* ============ Cartes ============ */
function card(r){ return `<button class="card" data-r="${r.id}"><div class="pic p${r.idx%6}">${r.e}</div><div class="tx"><div class="nm">${esc(r.n)}</div><div class="meta">${esc(r.reg.split(" (")[0])} · ⏱ ${fmtMin(r.p+r.c)}${r.r>=120?" + repos":""}</div><div class="meta"><span class="stars">${stars(r.d)}</span> ${DIFF[r.d]}${S.favs.includes(r.id)?" · ♥":""}</div></div></button>`; }
function mini(r){ return `<button class="mini" data-r="${r.id}"><div class="pic p${r.idx%6}">${r.e}</div><div class="tx">${esc(r.n)}</div></button>`; }
const FILTRES = [
  {id:"facile", l:"😊 Facile", f:r=>r.d===1},
  {id:"rapide", l:"⚡ Rapide", f:r=>r.p+r.c<=45 && r.r<=60},
  {id:"sans-cuisson", l:"❄️ Sans cuisson", f:r=>r.c===0 || (r.tags||[]).includes("sans-cuisson")},
  {id:"sans-gluten", l:"🌾 Sans gluten"}, {id:"sans-oeuf", l:"🥚 Sans œufs"},
  {id:"chocolat", l:"🍫 Chocolat"}, {id:"ricotta", l:"🧀 Ricotta"}, {id:"amande", l:"🌰 Amandes"},
  {id:"frit", l:"🔥 Frits"}, {id:"noel", l:"🎄 Noël"}, {id:"paques", l:"🐣 Pâques"}, {id:"carnaval", l:"🎭 Carnaval"}, {id:"ete", l:"☀️ Été"},
  {id:"fav", l:"♥ Favoris", f:r=>S.favs.includes(r.id)}
];
function passeFiltre(r, id){ const F=FILTRES.find(x=>x.id===id); if(!F) return true; return F.f ? F.f(r) : (r.tags||[]).includes(id); }
const CATS = [["Frit","🔥"],["Cuillère","🥄"],["Gâteau","🎂"],["Tarte","🥧"],["Biscuits","🍪"],["Glacé","🍨"],["Pâtisserie","🧁"],["Viennoiserie","🍞"],["Confiserie","🍬"],["Sans cuisson","❄️"],["Bases","📘"]];
function search(q){ const w=norm(q).split(" ").filter(x=>x.length>1).map(x=>x.replace(/s$/,"")); return RECETTES.filter(r=>w.every(x=>r._s.includes(x))); }

/* ============ Vues ============ */
const VIEWS = {};
VIEWS.home = () => {
  const day = Math.floor(Date.now()/86400000);
  const rj = VRAIES[day % VRAIES.length];
  const favs = S.favs.map(id=>R[id]).filter(Boolean);
  $("#view").innerHTML = `
  <div class="search"><input id="hq" type="search" placeholder="🔍 Recette ou ingrédient (ex. ricotta)" enterkeyhint="search"></div>
  <div class="chips">${FILTRES.filter(f=>f.id!=="fav").map(f=>`<button class="chip" onclick="go('list',{tag:'${f.id}'})">${f.l}</button>`).join("")}</div>
  <h2>Recette du jour</h2>
  <button class="hero-day" data-r="${rj.id}"><span class="em">${rj.e}</span><span><b>${esc(rj.n)}</b><span class="small">${esc(rj.reg)} · ${DIFF[rj.d]} · ${fmtMin(rj.p+rj.c)}</span></span></button>
  ${favs.length?`<h2>♥ Mes favoris</h2><div class="hscroll">${favs.map(mini).join("")}</div>`:""}
  <h2>🍋 Spécialités siciliennes</h2><div class="hscroll">${RECETTES.filter(r=>r.zone==="sicile").map(mini).join("")}</div>
  <h2>🇮🇹 Grands classiques italiens</h2><div class="hscroll">${RECETTES.filter(r=>r.zone==="italie").map(mini).join("")}</div>
  <h2>😊 Faciles pour débuter</h2><div class="hscroll">${VRAIES.filter(r=>r.d===1).map(mini).join("")}</div>
  <h2>Par catégorie</h2>
  <div class="cats">${CATS.map(([c,e])=>`<button class="cat" onclick="go('list',{cat:'${c}'})"><span>${e}</span>${c}</button>`).join("")}</div>
  <h2>📘 Recettes de base</h2><div class="hscroll">${RECETTES.filter(r=>r.zone==="base").map(mini).join("")}</div>
  <div class="box tip" style="margin-top:18px"><b>Besoin d'aide ?</b><br>Touche <b>🤖 Assistant</b> pour poser une question (même à voix haute), ou <b>❓ Aide</b> pour apprendre les techniques.</div>`;
  const hq=$("#hq"); hq.onkeydown = e => { if(e.key==="Enter" && hq.value.trim()) go("list",{q:hq.value.trim()}); };
};

VIEWS.list = p => {
  p.zone = p.zone||"all"; p.sort = p.sort||"nom";
  const z = [["all","Toutes"],["sicile","🍋 Sicile"],["italie","🇮🇹 Italie"],["base","📘 Bases"]];
  $("#view").innerHTML = `
  <div class="search"><input id="lq" type="search" placeholder="🔍 Nom, ingrédient, région…" value="${esc(p.q||"")}"></div>
  <div class="chips" id="cz">${z.map(([k,l])=>`<button class="chip ${p.zone===k?"on":""}" data-z="${k}">${l}</button>`).join("")}</div>
  <div class="chips" id="cd">${[1,2,3].map(d=>`<button class="chip ${p.d===d?"on":""}" data-d="${d}">${stars(d)} ${DIFF[d]}</button>`).join("")}
    <select id="ls" class="chip"><option value="nom">Tri : A → Z</option><option value="temps">Tri : plus rapide</option><option value="diff">Tri : plus facile</option></select></div>
  <div class="chips" id="cc">${CATS.map(([c,e])=>`<button class="chip ${p.cat===c?"on":""}" data-c="${c}">${e} ${c}</button>`).join("")}</div>
  <div class="chips" id="ct">${FILTRES.map(f=>`<button class="chip ${p.tag===f.id?"on":""}" data-t="${f.id}">${f.l}</button>`).join("")}</div>
  <p class="muted small" id="lcount"></p>
  <div class="grid" id="lres"></div>`;
  $("#ls").value = p.sort;
  const upd = () => {
    let list = p.q ? search(p.q) : RECETTES.slice();
    if(p.zone!=="all") list=list.filter(r=>r.zone===p.zone);
    if(p.d) list=list.filter(r=>r.d===p.d);
    if(p.cat) list=list.filter(r=>r.cat===p.cat);
    if(p.tag) list=list.filter(r=>passeFiltre(r,p.tag));
    if(p.sort==="temps") list.sort((a,b)=>(a.p+a.c)-(b.p+b.c));
    else if(p.sort==="diff") list.sort((a,b)=>a.d-b.d || a.n.localeCompare(b.n));
    else list.sort((a,b)=>a.n.localeCompare(b.n,"fr"));
    $("#lcount").textContent = list.length+" recette"+(list.length>1?"s":"");
    $("#lres").innerHTML = list.length ? list.map(card).join("") : `<div class="empty" style="grid-column:1/-1"><div>🤷</div>Aucune recette. Essaie un autre mot ou retire un filtre.<br><br><button class="btn" onclick="go('assistant',{q:${esc(JSON.stringify(p.q||""))}})">Demander à l'assistant</button></div>`;
  };
  const toggle = (sel, key, attr, conv) => $(sel).onclick = e => { const b=e.target.closest("button"); if(!b) return; const v=conv(b.dataset[attr]); p[key] = (p[key]===v && key!=="zone") ? undefined : v; $(sel).querySelectorAll("button").forEach(x=>x.classList.toggle("on", conv(x.dataset[attr])===p[key])); upd(); };
  toggle("#cz","zone","z",x=>x); toggle("#cd","d","d",Number); toggle("#cc","cat","c",x=>x); toggle("#ct","tag","t",x=>x);
  $("#ls").onchange = e => { p.sort=e.target.value; upd(); };
  $("#lq").oninput = e => { p.q=e.target.value; upd(); };
  upd();
};

VIEWS.recipe = p => {
  const r = R[p.id]; if(!r){ tab("home"); return; }
  if(p.port==null) p.port = r.port;
  p.chk = p.chk || {};
  const {f, txt} = portInfo(r, p.port);
  const fav = S.favs.includes(r.id), nDone = (S.done[r.id]||[]).length;
  const lines = ingLines(r, f);
  const longRepos = r.r>=600;
  const sim = VRAIES.filter(x=>x.id!==r.id && (x.cat===r.cat || x.zone===r.zone)).slice(0,8);
  $("#view").innerHTML = `
  <div class="rhead p${r.idx%6}">
    <div style="display:flex;justify-content:space-between;align-items:center"><span class="badge">${esc(r.reg)}</span><button class="heart" id="fav">${fav?"♥":"♡"}</button></div>
    <div class="em">${r.e}</div><h2>${esc(r.n)}</h2><div class="it">${esc(r.it)}</div>
    <div class="small" style="margin-top:6px"><span class="stars">${stars(r.d)}</span> ${DIFF[r.d]} · ${esc(r.cat)}${nDone?` · ✅ réalisée ${nDone} fois`:""}</div>
  </div>
  <p>${esc(r.desc)}</p>
  <div class="times"><div>Prépa<b>${fmtMin(r.p)}</b></div><div>Cuisson<b>${fmtMin(r.c)}</b></div><div>Repos<b>${fmtMin(r.r)}</b></div><div>Total<b>${fmtMin(r.p+r.c+r.r)}</b></div></div>
  ${longRepos?`<div class="box warn">⏳ <b>À prévoir à l'avance :</b> cette recette demande ${fmtMin(r.r)} de repos ou d'attente. Commence la veille si possible.</div>`:""}
  <div class="actions">
    <button class="btn main" onclick="startCook('${r.id}')">▶ Cuisiner pas à pas</button>
    <button class="btn" onclick="yt(R['${r.id}'].yt)">🎬 Vidéos (italien)</button>
    <button class="btn" onclick="yt(R['${r.id}'].ytfr)">🎬 Vidéos (français)</button>
    <button class="btn" id="addShop">🛒 Ajouter aux courses</button>
    <button class="btn" onclick="go('assistant',{ctx:'${r.id}'})">🤖 Poser une question</button>
    <button class="btn" id="shareR">📤 Partager</button>
    <button class="btn green" id="doneR">✅ Je l'ai faite !</button>
  </div>
  <h2>Ingrédients</h2>
  <div class="portions"><button id="pm">−</button><b>${esc(txt)}</b><button id="pp">+</button>${p.port!==r.port?`<button class="chip" id="pr" style="width:auto;border-radius:999px;height:auto">↺</button>`:""}</div>
  <ul class="ing" id="ingl">${lines.map((x,i)=>x.grp?`<li class="grp">${esc(x.grp)}</li>`:`<li data-i="${i}" class="${p.chk[i]?"done":""}"><span class="ck">${p.chk[i]?"✓":""}</span><span class="lbl">${x.q?`<span class="q">${esc(x.q)}</span> `:""}${esc(x.l)}</span></li>`).join("")}</ul>
  <p class="muted small">Touche un ingrédient pour le cocher quand il est prêt.</p>
  ${r.bases.length?`<h3>📘 Recettes de base utilisées</h3><div class="chips">${r.bases.map(b=>`<button class="chip" data-r="${b}">${R[b].e} ${esc(R[b].n)}</button>`).join("")}</div>`:""}
  <h2>Préparation</h2>
  <ol class="steps">${r.et.map((s,i)=>{ const [t,m]=Array.isArray(s)?s:[s,0]; return `<li>${esc(t)}${m>0?`<br><button class="tbtn" onclick="addTimer(${esc(JSON.stringify(r.n+" · étape "+(i+1)))},${m*60})">⏱️ Minuteur ${fmtMin(m)}</button>`:""}</li>`; }).join("")}</ol>
  ${r.ast.length?`<div class="box tip"><b>💡 Astuces du chef</b><ul>${r.ast.map(a=>`<li>${esc(a)}</li>`).join("")}</ul></div>`:""}
  ${r.err.length?`<div class="box warn"><b>⚠️ Erreurs à éviter</b><ul>${r.err.map(a=>`<li>${esc(a)}</li>`).join("")}</ul></div>`:""}
  <div class="box"><b>🧊 Conservation</b><br>${esc(r.cons)}</div>
  <div class="box"><b>📜 Un peu d'histoire</b><br>${esc(r.hist)}</div>
  <h3>📝 Mes notes</h3>
  <textarea id="note" placeholder="Ex. : moins de sucre la prochaine fois, four à 170 °C…">${esc(S.notes[r.id]||"")}</textarea>
  ${sim.length?`<h2>Tu aimeras aussi</h2><div class="hscroll">${sim.map(mini).join("")}</div>`:""}`;
  $("#fav").onclick = () => { const i=S.favs.indexOf(r.id); if(i>=0) S.favs.splice(i,1); else S.favs.push(r.id); save("favs"); $("#fav").textContent = i>=0?"♡":"♥"; toast(i>=0?"Retirée des favoris":"♥ Ajoutée aux favoris"); };
  const st = portStep(r);
  $("#pm").onclick = () => { p.port = Math.max(st, Math.round((p.port-st)*100)/100); keep(); };
  $("#pp").onclick = () => { p.port = Math.round((p.port+st)*100)/100; keep(); };
  if($("#pr")) $("#pr").onclick = () => { p.port = r.port; keep(); };
  function keep(){ const y=window.scrollY; VIEWS.recipe(p); window.scrollTo(0,y); }
  $("#ingl").onclick = e => { const li=e.target.closest("li[data-i]"); if(!li) return; const i=li.dataset.i; p.chk[i]=!p.chk[i]; li.classList.toggle("done", p.chk[i]); li.querySelector(".ck").textContent=p.chk[i]?"✓":""; };
  $("#addShop").onclick = () => { addRecipeToShop(r, f, txt); };
  $("#shareR").onclick = () => share(recipeText(r, f, txt));
  $("#doneR").onclick = () => { (S.done[r.id]=S.done[r.id]||[]).push(Date.now()); save("done"); toast("🎉 Bravo ! Recette ajoutée à ton historique."); keep(); };
  $("#note").oninput = e => { S.notes[r.id]=e.target.value; save("notes"); };
};
function recipeText(r, f, txt){
  const L = ingLines(r,f).map(x=>x.grp?"\n"+x.grp+" :":"• "+(x.q?x.q+" ":"")+x.l).join("\n");
  const E = r.et.map((s,i)=>(i+1)+". "+(Array.isArray(s)?s[0]:s)).join("\n");
  return `${r.e} ${r.n} (${r.it}) – ${txt}\n${r.reg}\n\nINGRÉDIENTS\n${L}\n\nPRÉPARATION\n${E}\n\nVidéos : https://www.youtube.com/results?search_query=${encodeURIComponent(r.yt)}\n\n— Partagé depuis Dolci d'Italia`;
}

/* ============ Mode guidé ============ */
function startCook(id){ const r=R[id]; const cur=stack[stack.length-1]; const f = cur.v==="recipe" && cur.p.id===id ? portInfo(r,cur.p.port).f : 1; cook={id, i:0, f}; nat("keepScreenOn", true); document.body.classList.add("cooking"); drawCook(); }
function exitCook(){ cook=null; stopSpeak(); nat("keepScreenOn", false); document.body.classList.remove("cooking"); const w=$("#cookWrap"); if(w) w.remove(); }
function cookStep(){ const r=R[cook.id]; const s=r.et[cook.i]; return Array.isArray(s)?{t:s[0],m:s[1]}:{t:s,m:0}; }
function drawCook(){
  const r=R[cook.id], n=r.et.length, s=cookStep(), last=cook.i===n-1;
  let w=$("#cookWrap"); if(!w){ w=document.createElement("div"); w.id="cookWrap"; w.className="cook"; document.body.appendChild(w); }
  w.innerHTML = `<div class="bar"><i style="width:${(cook.i+1)/n*100}%"></i></div>
  <div class="top"><button onclick="exitCook()">✕</button><span class="ttl">${r.e} ${esc(r.n)}</span><button onclick="cookIng()">📋</button><button onclick="speak(cookStep().t)">🔊</button><button onclick="cookVoice()">🎤</button></div>
  <div class="body" id="cookBody"><div class="num">ÉTAPE ${cook.i+1} / ${n}</div><div class="txt">${esc(s.t)}</div>
  <div class="bigt">${s.m>0?`<button onclick="addTimer(${esc(JSON.stringify(r.n+" · étape "+(cook.i+1)))},${s.m*60})">⏱️ Lancer ${fmtMin(s.m)}</button><button class="alt" onclick="phoneTimer(${s.m*60},${esc(JSON.stringify(r.n))})">⏰ Téléphone</button>`:""}
  ${last?`<button style="background:var(--green)" onclick="finishCook()">🎉 C'est prêt ! Buon appetito</button>`:""}</div>
  <p class="muted small" style="margin-top:22px">Astuce : balaie vers la gauche ou la droite, ou touche 🎤 et dis « suivant », « précédent », « répète », « minuteur », « ingrédients ».</p></div>
  <div class="nav"><button class="prev" onclick="cookGo(-1)" ${cook.i===0?"disabled style='opacity:.4'":""}>◀ Précédent</button><button class="next" onclick="${last?"finishCook()":"cookGo(1)"}">${last?"Terminer ✓":"Suivant ▶"}</button></div>`;
  const b=$("#cookBody"); let x0=null;
  b.ontouchstart=e=>{ x0=e.touches[0].clientX; };
  b.ontouchend=e=>{ if(x0==null) return; const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>70) cookGo(dx<0?1:-1); x0=null; };
  if(S.settings.lectureAuto) speak((cook.i+1)+". "+s.t);
}
function cookGo(d){ if(!cook) return; const n=R[cook.id].et.length; const i=cook.i+d; if(i<0||i>=n) return; cook.i=i; stopSpeak(); drawCook(); }
function finishCook(){ const id=cook.id; (S.done[id]=S.done[id]||[]).push(Date.now()); save("done"); exitCook(); toast("🎉 Bravo ! Recette réalisée. Buon appetito !", 3500); speak("Bravo ! Buon appetito !"); render(); }
function cookIng(){ const r=R[cook.id]; const L=ingLines(r,cook.f); openSheet(`<h2>📋 Ingrédients</h2><ul class="ing">${L.map(x=>x.grp?`<li class="grp">${esc(x.grp)}</li>`:`<li><span class="lbl">${x.q?`<span class="q">${esc(x.q)}</span> `:""}${esc(x.l)}</span></li>`).join("")}</ul><br><button class="btn full" onclick="speak(${esc(JSON.stringify(L.filter(x=>!x.grp).map(x=>(x.q?x.q+" ":"")+x.l).join(", ")))})">🔊 Lire la liste</button><br><br><button class="btn full main" onclick="closeSheet()">Fermer</button>`); }
function cookVoice(){ listen("Dis : suivant, précédent, répète, minuteur…", t => {
  const n=norm(t);
  if(/suivant|apres|ensuite|continu|prochaine|next|avance/.test(n)) cookGo(1);
  else if(/precedent|retour|avant|recule/.test(n)) cookGo(-1);
  else if(/repet|relis|lis |redis|encore|quoi/.test(n)) speak(cookStep().t);
  else if(/minuteur|chrono|timer|minute/.test(n)){ const sec=parseDuree(n) || cookStep().m*60; if(sec) addTimer(R[cook.id].n, sec); else toast("Dis par exemple : minuteur 10 minutes"); }
  else if(/ingredient|liste/.test(n)){ cookIng(); speak(ingLines(R[cook.id],cook.f).filter(x=>!x.grp).map(x=>(x.q?x.q+" ":"")+x.l).join(", ")); }
  else if(/stop|arrete|tais|silence/.test(n)) stopSpeak();
  else if(/termin|fini|quitte|ferme/.test(n)) exitCook();
  else { const a=answer(t); speak(a.txt); toast(a.txt.slice(0,160), 6000); }
}); }

/* ============ Minuteurs ============ */
function addTimer(label, sec){ S.timers.push({id:String(Date.now())+Math.floor(Math.random()*1000), label, end:Date.now()+sec*1000, dur:sec, ring:0}); save("timers"); renderTimers(); toast("⏱️ Minuteur lancé : "+fmtDur(sec)); }
function delTimer(id){ S.timers=S.timers.filter(t=>t.id!==id); save("timers"); renderTimers(); if(!$("#sheet").hidden && $("#tlist")) timersSheet(); }
function plusTimer(id, s){ const t=S.timers.find(t=>t.id===id); if(!t) return; if(t.ring){ t.ring=0; t.end=Date.now()+s*1000; } else t.end+=s*1000; save("timers"); renderTimers(); if($("#tlist")) timersSheet(); }
function phoneTimer(sec, label){ const ok=nat("phoneTimer", sec, label||"Dolci"); if(ok===false) toast("Impossible d'ouvrir l'horloge du téléphone."); else if(ok===undefined) toast("Disponible dans l'application Android."); else toast("⏰ Minuteur créé dans l'horloge du téléphone"); }
let audioCtx=null;
function beepWeb(){ try{ audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)(); const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.frequency.value=880; o.connect(g); g.connect(audioCtx.destination); g.gain.value=.3; o.start(); o.stop(audioCtx.currentTime+.6); }catch(e){} }
function ring(t){ if(nat("beep")===undefined) beepWeb(); if(nat("vibrate", 1200)===undefined && navigator.vibrate) navigator.vibrate([400,200,400]); }
setInterval(() => {
  if(!S.timers.length) return;
  const now=Date.now();
  S.timers.forEach(t => {
    if(now>=t.end){
      if(!t.ring){ t.ring=1; save("timers"); ring(t); toast("⏰ Terminé : "+t.label, 5000); if(S.settings.voixMinuteur) setTimeout(()=>speak("Minuteur terminé : "+t.label), 1600); }
      else if(t.ring<12 && Math.floor((now-t.end)/1000)%5===0){ t.ring++; ring(t); }
    }
  });
  renderTimers();
  if($("#tlist")) $("#tlist").querySelectorAll("[data-left]").forEach(el=>{ const t=S.timers.find(x=>x.id===el.dataset.left); if(t) el.textContent = t.ring?"Terminé !":fmtSec((t.end-now)/1000); });
}, 1000);
function renderTimers(){
  const bar=$("#timerBar"); if(!S.timers.length){ bar.hidden=true; bar.innerHTML=""; return; }
  bar.hidden=false; const now=Date.now();
  bar.innerHTML = S.timers.map(t=>`<button class="tpill ${t.ring?"ring":""}" onclick="timersSheet()">⏱ ${t.ring?"Terminé !":fmtSec((t.end-now)/1000)} <span class="small" style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.label.split(" · ")[0])}</span><span class="x" onclick="event.stopPropagation();delTimer('${t.id}')">✕</span></button>`).join("");
}
function timersSheet(){
  const now=Date.now();
  openSheet(`<h2>⏱️ Minuteurs</h2>
  <div id="tlist">${S.timers.length?S.timers.map(t=>`<div class="box"><b>${esc(t.label)}</b><div class="result" data-left="${t.id}">${t.ring?"Terminé !":fmtSec((t.end-now)/1000)}</div>
  <div class="row2"><button class="btn" onclick="plusTimer('${t.id}',60)">+1 min</button><button class="btn" onclick="plusTimer('${t.id}',300)">+5 min</button><button class="btn" onclick="delTimer('${t.id}')">${t.ring?"Arrêter":"Annuler"}</button></div></div>`).join(""):`<p class="muted">Aucun minuteur en cours.</p>`}</div>
  <h3>Nouveau minuteur</h3>
  <div class="chips">${[1,2,3,5,10,15,20,30,45,60,90,120].map(m=>`<button class="chip" onclick="addTimer('Minuteur ${fmtMin(m)}',${m*60});timersSheet()">${fmtMin(m)}</button>`).join("")}</div>
  <div class="row2"><input id="tmin" type="number" min="1" placeholder="Minutes" class="btn" style="text-align:center"><button class="btn green" onclick="const v=+$('#tmin').value;if(v>0){addTimer('Minuteur '+fmtMin(v),v*60);timersSheet()}">Lancer</button><button class="btn" onclick="const v=+$('#tmin').value;if(v>0)phoneTimer(v*60,'Dolci')">⏰ Tél.</button></div>
  <p class="muted small">Les minuteurs sonnent et vibrent quand l'application est ouverte. Pour quitter l'application en toute tranquillité, utilise ⏰ qui crée le minuteur dans l'horloge du téléphone.</p>
  <button class="btn full main" onclick="closeSheet()">Fermer</button>`);
}
function openSheet(h){ $("#sheetBody").innerHTML=h; $("#sheet").hidden=false; }
function closeSheet(){ $("#sheet").hidden=true; $("#sheetBody").innerHTML=""; }
$("#sheet").onclick = e => { if(e.target.id==="sheet") closeSheet(); };

/* ============ Courses ============ */
function addRecipeToShop(r, f, txt){
  const from = r.n+" ("+txt+")";
  ingLines(r,f).forEach(x=>{ if(!x.grp) S.shop.push({id:String(Date.now())+Math.random().toString(36).slice(2,6), t:x.l, q:x.q, from, ok:false}); });
  save("shop"); toast("🛒 Ingrédients ajoutés à la liste de courses");
}
VIEWS.courses = () => {
  const groups = {}; S.shop.forEach(it=>{ (groups[it.from]=groups[it.from]||[]).push(it); });
  const keys = Object.keys(groups);
  $("#view").innerHTML = `
  <div class="search"><input id="sq" placeholder="Ajouter un article (ex. 2 citrons)"><button class="btn green" id="sadd">＋</button></div>
  ${keys.length?keys.map(k=>`<h3>${esc(k)}</h3><ul class="ing shop">${groups[k].map(it=>`<li data-s="${it.id}" class="${it.ok?"done":""}"><span class="ck">${it.ok?"✓":""}</span><span class="lbl" style="flex:1">${it.q?`<span class="q">${esc(it.q)}</span> `:""}${esc(it.t)}</span></li>`).join("")}</ul>`).join("")
  :`<div class="empty"><div>🛒</div>Ta liste est vide.<br>Dans une recette, touche « Ajouter aux courses ».</div>`}
  ${keys.length?`<div class="row2"><button class="btn" id="sclr">Effacer les cochés</button><button class="btn" id="sall">Tout effacer</button></div><button class="btn full main" id="sshare">📤 Partager la liste (SMS, WhatsApp…)</button>`:""}`;
  const add = () => { const v=$("#sq").value.trim(); if(!v) return; S.shop.push({id:String(Date.now()), t:v, q:"", from:"Mes articles", ok:false}); save("shop"); VIEWS.courses(); };
  $("#sadd").onclick = add; $("#sq").onkeydown = e => { if(e.key==="Enter") add(); };
  document.querySelectorAll("[data-s]").forEach(li => li.onclick = () => { const it=S.shop.find(x=>x.id===li.dataset.s); it.ok=!it.ok; save("shop"); li.classList.toggle("done",it.ok); li.querySelector(".ck").textContent=it.ok?"✓":""; });
  if(keys.length){
    $("#sclr").onclick = () => { S.shop=S.shop.filter(x=>!x.ok); save("shop"); VIEWS.courses(); };
    $("#sall").onclick = () => { if(!$("#sall").dataset.c){ $("#sall").dataset.c=1; $("#sall").textContent="Confirmer ?"; return; } S.shop=[]; save("shop"); VIEWS.courses(); };
    $("#sshare").onclick = () => share("🛒 Liste de courses – Dolci d'Italia\n"+keys.map(k=>"\n"+k+"\n"+groups[k].filter(x=>!x.ok).map(x=>"☐ "+(x.q?x.q+" ":"")+x.t).join("\n")).join("\n"));
  }
};

/* ============ Assistant ============ */
let assistCtx = null;
function parseDuree(n){
  let s=0, m, found=false;
  const re=/(\d+(?:[.,]\d+)?)\s*(h(?:eures?)?|min(?:ute)?s?|mn|s(?:ec(?:onde)?s?)?)(?![a-z])/g;
  while((m=re.exec(n))){ found=true; const v=parseFloat(m[1].replace(",",".")), u=m[2]; s += u[0]==="h" ? v*3600 : (u[0]==="s" ? v : v*60); }
  const hm=n.match(/(\d+)\s*h\s*(\d{1,2})(?!\d)/); if(hm){ s=(+hm[1])*3600+(+hm[2])*60; found=true; }
  if(!found){ const x=n.match(/(\d+(?:[.,]\d+)?)/); if(x) s=parseFloat(x[1].replace(",","."))*60; }
  if(/demi heure/.test(n) && !s) s=1800;
  if(/quart d heure/.test(n) && !s) s=900;
  return Math.round(s);
}
const has = (n, k) => n.includes(norm(k));
function link(l, a){ return {l, a}; }
function rLinks(list){ return list.slice(0,8).map(r=>link(r.e+" "+r.n, `openR('${r.id}')`)); }
function out(h, links, txt){ return {h, links:links||[], txt: txt || h.replace(/<[^>]+>/g," ").replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/\s+/g," ").trim()}; }
function convAmount(s){ s=s.replace(",","."); if(/^une?$/.test(s)) return 1; if(s==="demi"||s==="demie") return .5; if(s==="deux") return 2; if(s==="trois") return 3; return parseFloat(s); }
function trouveIngredient(n){ let best=null; Object.keys(DENSITES).forEach(k=>{ if(n.includes(k) && (!best || k.length>best.length)) best=k; }); return best; }

function answer(raw){
  const n = " "+norm(raw).trim()+" ";
  const ctx = assistCtx ? R[assistCtx] : null;
  if(!n.trim()) return out("Pose-moi une question 😊");

  // 1. Minuteur
  if(/minuteur|timer|chrono|alarme|reveil|compte a rebours/.test(n) && /\d|demi heure|quart d heure/.test(n)){
    const sec=parseDuree(n); if(sec>0){ addTimer("Minuteur "+fmtDur(sec), sec); return out(`⏱️ C'est parti ! Minuteur de <b>${fmtDur(sec)}</b> lancé. Il est affiché en bas de l'écran et sonnera à la fin.`, [link("⏰ Aussi dans l'horloge du téléphone", `phoneTimer(${sec},'Dolci')`)]); }
  }
  if(/minuteur|timer|chrono/.test(n) && n.trim().split(" ").length<=3) return out("Combien de temps ? Dis par exemple « minuteur 10 minutes » ou « minuteur 1 h 30 ».", [link("⏱️ Ouvrir les minuteurs","timersSheet()")]);

  // 2. Politesse
  if(/^ (bonjour|salut|coucou|hello|buongiorno|ciao|bonsoir|hey|yo)\b/.test(n) && n.trim().split(" ").length<=4) return welcome();
  if(/merci|grazie|super|genial|parfait|top/.test(n) && n.trim().split(" ").length<=5) return out("Prego ! 😊 Bonne pâtisserie. Autre chose ?");
  if(/(que sais tu faire|tu sers a quoi|aide moi|tu peux faire quoi|comment tu marches|qui es tu|que peux tu)/.test(n)) return welcome(true);

  // 3. Conversions
  let m;
  if((m=n.match(/thermostat\s*(\d+)|\bth\s*(\d+)/))){ const th=+(m[1]||m[2]); return out(`Thermostat ${th} ≈ <b>${th*30} °C</b>. (Repère : th. 6 = 180 °C, th. 7 = 210 °C.)`); }
  if(/fahrenheit|°f|\d+\s*f\b/.test(n) && (m=n.match(/(\d+(?:[.,]\d+)?)/))){ const v=parseFloat(m[1].replace(",","."));
    if(/en fahrenheit|vers fahrenheit|c en f|celsius en/.test(n)) return out(`${v} °C = <b>${Math.round(v*9/5+32)} °F</b>`);
    return out(`${v} °F = <b>${Math.round((v-32)*5/9)} °C</b> (thermostat ${Math.round((v-32)*5/9/30)})`); }
  if((m=n.match(/(\d+(?:[.,]\d+)?|une?|demie?|deux|trois)\s*(tasses?|cups?|cuilleres? a soupe|cuilleres? a cafe|c a s|c a c|cas|cac|cs|cc)\b/))){
    const q=convAmount(m[1]); const u=m[2]; const ing=trouveIngredient(n.slice(m.index+m[0].length)) || trouveIngredient(n) || "eau";
    const key = /tasse|cup/.test(u) ? "cup" : /soupe|c a s|cas|cs/.test(u) ? "cas" : "cac";
    const g = DENSITES[ing][key]*q; const nom = {cup:"tasse(s) (240 ml)",cas:"cuillère(s) à soupe",cac:"cuillère(s) à café"}[key];
    return out(`${num(q)} ${nom} de ${ing} ≈ <b>${num(Math.round(g*10)/10)} g</b>.${["lait","eau","creme"].includes(ing)?` (soit ${num(Math.round(q*({cup:240,cas:15,cac:5}[key])))} ml)`:""}`, [link("⚖️ Convertisseur complet","tab('aide',{s:'conv'})")]);
  }
  if((m=n.match(/(\d+(?:[.,]\d+)?)\s*(g|grammes?)\s*(?:de |d )?([a-z ]*?)\s*(?:en|=|ca fait combien de|combien de|fait combien de)\s*(tasses?|cuilleres? a soupe|cuilleres? a cafe|cas|cac|cuilleres?)/))){
    const g=parseFloat(m[1].replace(",",".")); const ing=trouveIngredient(m[3]||n)||"eau"; const u=m[4]; const key=/tasse/.test(u)?"cup":/cafe|cac/.test(u)?"cac":"cas"; const d=DENSITES[ing][key];
    if(d) return out(`${g} g de ${ing} ≈ <b>${num(Math.round(g/d*10)/10)} ${({cup:"tasse(s)",cas:"cuillère(s) à soupe",cac:"cuillère(s) à café"})[key]}</b>.`);
  }
  if((m=n.match(/(\d+(?:[.,]\d+)?)\s*(oz|onces?)\b/))) return out(`${m[1]} oz ≈ <b>${Math.round(parseFloat(m[1].replace(",","."))*28.35)} g</b>`);
  if((m=n.match(/(\d+(?:[.,]\d+)?)\s*(lb|livres?)\b/))) return out(`${m[1]} lb ≈ <b>${Math.round(parseFloat(m[1].replace(",","."))*453.6)} g</b>`);
  if((m=n.match(/(\d+(?:[.,]\d+)?)\s*g\s*(?:de )?levure\s*(fraiche|seche|boulanger)/))){ const v=parseFloat(m[1].replace(",",".")); return m[2]==="seche" ? out(`${v} g de levure sèche = <b>${Math.round(v*3)} g de levure fraîche</b>.`) : out(`${v} g de levure fraîche = <b>${num(Math.round(v/3*10)/10)} g de levure sèche</b>.`); }
  if((m=n.match(/moule\D*(\d+)\D+(\d+)\s*cm/)) && /moule/.test(n)){ const a=+m[1], b=+m[2]; const k=(b*b)/(a*a); return out(`Pour passer d'un moule de ${a} cm à ${b} cm, multiplie les quantités par <b>${num(Math.round(k*100)/100)}</b>. Utilise le bouton + / − des portions dans la recette pour t'aider.`); }

  // 4. Problème (fort)
  const problemish = /rate|loupe|probleme|liquide|grumeau|casse|retomb|colle|brul|trop|pas assez|ne monte|ne leve|ne prend|tourne|dur |sec |seche|gras|cru|plat|affaiss|cristallis|granuleux|sauver|rattrap|pourquoi|aide/.test(n);
  const scoreP = PROBLEMES.map(p=>({p, s:p.k.reduce((a,k)=>a+(has(n," "+k)||has(n,k)&&k.length>4?(k.length<=3?.5:1):0),0)})).sort((a,b)=>b.s-a.s);
  if(scoreP[0].s>=2 && problemish || scoreP[0].s>=3 && !/ comment |technique|methode/.test(n)){
    const top=scoreP[0].p; let h=`🆘 <b>${esc(top.q)}</b>\n${esc(top.r)}`;
    if(scoreP[1] && scoreP[1].s>=scoreP[0].s && scoreP[1].s>=2) h+=`\n\n<b>${esc(scoreP[1].p.q)}</b>\n${esc(scoreP[1].p.r)}`;
    if(ctx && ctx.err.length) h+=`\n\n⚠️ Pour ${esc(ctx.n)} :\n• ${ctx.err.map(esc).join("\n• ")}`;
    return out(h, ctx?[link("📖 Revoir la recette",`openR('${ctx.id}')`)]:[]);
  }

  // 5. Techniques
  if(/comment|technique|methode|facon|astuce pour/.test(n)){
    const T = TECHNIQUES.map(t=>({t, s:norm(t.t).split(" ").filter(w=>w.length>3).reduce((a,w)=>a+(n.includes(w.replace(/s$/,""))?1:0),0)})).sort((a,b)=>b.s-a.s)[0];
    if(T.s>=1 && !(T.s===1 && /\b(blanc|creme)\b/.test(n) && !/neige|monte/.test(n) && T.t.t.includes("blancs"))) return out(`${T.t.e} <b>${esc(T.t.t)}</b>\n${T.t.s.map((x,i)=>(i+1)+". "+esc(x)).join("\n")}`, [link("👩‍🍳 Toutes les techniques","tab('aide',{s:'tech'})")]);
  }

  // 6. Aide sur l'application
  if(/\b(appli|application|app)\b|liste de course|favori|mode guide|pas a pas|comment utiliser|notes? perso|historique|partager|hors ligne|sans internet/.test(n)){
    const best = AIDE_APP.map(a=>({a, s:norm(a.t+" "+a.r).split(" ").filter(w=>w.length>4).reduce((x,w)=>x+(n.includes(w)?1:0),0)})).sort((a,b)=>b.s-a.s)[0];
    return out(`📱 <b>${esc(best.a.t)}</b>\n${esc(best.a.r)}`, [link("❓ Toute l'aide","tab('aide',{s:'app'})")]);
  }

  // 7. Substitutions
  if(/remplac|substitu|a la place|pas de |je n ai pas|j ai pas|il me manque|manque|equivalent|alternative|trouve pas|introuvable|sans /.test(n) && !/recette|dessert|idee|propose/.test(n)){
    const found = SUBSTITUTIONS.map(s=>({s, k:s.k.filter(k=>has(n,k)).sort((a,b)=>b.length-a.length)[0]})).filter(x=>x.k).sort((a,b)=>b.k.length-a.k.length);
    if(found.length){ const top=found.slice(0, found[1]&&found[1].k.length>=found[0].k.length-2&&found[1].s!==found[0].s?2:1); return out(top.map(x=>`🔄 <b>${esc(x.s.t)}</b>\n${esc(x.s.r)}`).join("\n\n"), [link("🔄 Toutes les substitutions","tab('aide',{s:'subs'})")]); }
    if(/remplac|substitu|a la place|equivalent/.test(n)) return out("Quel ingrédient veux-tu remplacer ? Par exemple : « par quoi remplacer le mascarpone ? »", [link("🔄 Voir toutes les substitutions","tab('aide',{s:'subs'})")]);
  }

  // 8. Idées / filtres
  const TAGW = [["facile","facile"],["simple","facile"],["debutant","facile"],["rapide","rapide"],["vite","rapide"],["presse","rapide"],["sans cuisson","sans-cuisson"],["sans four","sans-cuisson"],["sans gluten","sans-gluten"],["coeliaque","sans-gluten"],["sans oeuf","sans-oeuf"],["vegan","sans-oeuf"],["chocolat","chocolat"],["noel","noel"],["paques","paques"],["carnaval","carnaval"],["ete","ete"],["chaud","ete"],["frais","ete"],["frit","frit"],["beignet","frit"],["ricotta","ricotta"],["amande","amande"],["enfant","facile"],["fete","fete"]];
  const tg = TAGW.find(([w])=>n.includes(" "+w));
  if(tg && (/recette|dessert|idee|propose|conseill|sugger|quoi faire|que faire|cherche|liste|envie|gateau|faire|veux|donne/.test(n) || n.trim().split(" ").length<=3)){
    let list=VRAIES.filter(r=>passeFiltre(r,tg[1]));
    if(/sicil/.test(n)) list=list.filter(r=>r.zone==="sicile");
    if(list.length) return out(`Voici des idées${tg[1]!=="facile"?"":" faciles"} pour toi (${list.length}) 👇`, rLinks(list).concat(list.length>8?[link("Voir toutes ➜",`go('list',{tag:'${tg[1]}'})`)]:[]), "Voici des idées : "+list.slice(0,5).map(r=>r.n).join(", "));
  }
  if(/sicil/.test(n) && /recette|dessert|idee|propose|typique|specialite|liste/.test(n)){ const list=RECETTES.filter(r=>r.zone==="sicile"); return out(`🍋 Les ${list.length} spécialités siciliennes de l'appli :`, rLinks(list).concat([link("Voir toutes ➜","go('list',{zone:'sicile'})")])); }
  if(/hasard|surprise|aleatoire|n importe|inspire|quoi faire|que faire aujourd|je sais pas quoi/.test(n) && !/avec/.test(n)){ const r=VRAIES[Math.floor(Math.random()*VRAIES.length)]; return out(`🎲 Que dirais-tu de <b>${esc(r.n)}</b> ? ${esc(r.desc)}`, [link(r.e+" Voir la recette",`openR('${r.id}')`), link("🎲 Une autre","assistSend('surprise moi')")]); }

  // 9. Avec un ingrédient
  if((m=n.match(/(?:avec|j ai|il me reste|reste|utiliser)\s+(?:de la |du |des |de l |d |un |une |le |la |les |mes )?([a-z ]{3,40})/))){
    const words=m[1].split(" ").filter(w=>w.length>2 && !["que","qui","faire","pour","des","dans","quoi","recette","dessert","peux","faut","beaucoup","trop"].includes(w)).map(w=>w.replace(/s$/,""));
    if(words.length){ const list=VRAIES.map(r=>({r, s:words.filter(w=>r.ing.some(x=>Array.isArray(x)&&norm(x[2]).includes(w))).length})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.r);
      if(list.length) return out(`Avec ${esc(m[1].trim())}, tu peux faire (${list.length}) 👇`, rLinks(list), "Tu peux faire : "+list.slice(0,5).map(r=>r.n).join(", ")); }
  }

  // 10. Question sur une recette
  let rec=null, best=0;
  RECETTES.forEach(r=>{ const toks=norm(r.n+" "+r.it+" "+r.id.replace(/-/g," ")).split(" ").filter(w=>w.length>3 && !["siciliens","sicilienne","siciliani","siciliana","italienne","creme","sicile","maison","pate","torta","aux","alla","della","napolitaine","napoletana","saint","sainte"].includes(w)); const s=toks.filter(w=>n.includes(" "+w.replace(/s$/,""))).length; if(s>best){best=s; rec=r;} });
  const sub = /temps|combien de temps|duree|long|heure/.test(n)?"temps": /ingredient|acheter|besoin|faut il|quantite/.test(n)?"ing": /conserv|garder|frigo|congel|combien de jours|veille|avance|a l avance/.test(n)?"cons": /difficile|facile|niveau|dur a/.test(n)?"diff": /video|tuto|youtube|regarder|voir comment/.test(n)?"video": /histoire|origine|vient|invente|pourquoi s appelle/.test(n)?"hist": /astuce|conseil|secret|reussir|erreur|piege/.test(n)?"ast": /portion|personne|parts|combien de|pour combien/.test(n)?"port": /etape|comment faire|comment on fait|prepar|methode|recette/.test(n)?"etapes":null;
  if(!rec && ctx && sub) rec=ctx;
  if(rec){
    const r=rec, L=[link("📖 Ouvrir la recette",`openR('${r.id}')`), link("▶ Pas à pas",`startCook('${r.id}')`)];
    switch(sub){
      case "temps": return out(`${r.e} <b>${esc(r.n)}</b>\n• Préparation : ${fmtMin(r.p)}\n• Cuisson : ${fmtMin(r.c)}\n• Repos/attente : ${fmtMin(r.r)}\n• <b>Total : ${fmtMin(r.p+r.c+r.r)}</b>${r.r>=600?"\n⏳ Commence la veille !":""}`, L);
      case "ing": return out(`${r.e} <b>Ingrédients – ${esc(r.n)}</b> (${r.port} ${esc(r.pu)})\n${ingLines(r,1).map(x=>x.grp?"\n"+esc(x.grp)+" :":"• "+esc((x.q?x.q+" ":"")+x.l)).join("\n")}`, L.concat([link("🛒 Ajouter aux courses",`addRecipeToShop(R['${r.id}'],1,'${r.port} ${r.pu.replace(/'/g,"")}')`)]));
      case "cons": return out(`🧊 <b>${esc(r.n)}</b>\n${esc(r.cons)}${r.r>=240?"\n\nOui, elle se prépare très bien à l'avance (elle a de toute façon besoin de "+fmtMin(r.r)+" de repos).":""}`, L);
      case "diff": return out(`${r.e} <b>${esc(r.n)}</b> : niveau <b>${DIFF[r.d]}</b> ${stars(r.d)}.\n${r.d===3?"Elle demande de la patience, mais avec le mode pas à pas et les vidéos, tu vas y arriver !":r.d===2?"Accessible si tu suis bien les étapes.":"Parfaite pour débuter."}${r.err.length?"\n\n⚠️ Attention à :\n• "+r.err.map(esc).join("\n• "):""}`, L);
      case "video": return out(`🎬 Vidéos pour <b>${esc(r.n)}</b> :`, [link("🎬 En italien",`yt(R['${r.id}'].yt)`), link("🎬 En français",`yt(R['${r.id}'].ytfr)`)]);
      case "hist": return out(`📜 <b>${esc(r.n)}</b>\n${esc(r.hist)}`, L);
      case "ast": return out(`💡 <b>Réussir ${esc(r.n)}</b>\n• ${r.ast.concat(r.err).map(esc).join("\n• ")}`, L);
      case "port": return out(`${r.e} La recette est prévue pour <b>${r.port} ${esc(r.pu)}</b>. Dans la recette, utilise les boutons − et + pour adapter toutes les quantités automatiquement.`, L);
      case "etapes": return out(`${r.e} <b>${esc(r.n)}</b> en ${r.et.length} étapes :\n${r.et.map((s,i)=>(i+1)+". "+esc(Array.isArray(s)?s[0]:s)).join("\n")}`, L);
      default: if(best>=1) return out(`${r.e} <b>${esc(r.n)}</b> – ${esc(r.reg)}\n${esc(r.desc)}\n⏱ ${fmtMin(r.p+r.c)} de travail${r.r?" + "+fmtMin(r.r)+" de repos":""} · ${DIFF[r.d]}`, L.concat([link("🎬 Vidéos",`yt(R['${r.id}'].yt)`)]));
    }
  }

  // 11. Glossaire
  if((m=n.match(/(?:veut dire|c est quoi|signifie|qu est ce que|definition|traduction|ca se dit)\s+(?:un |une |le |la |les |du |de la |l )?([a-z0-9 .]+)/))){
    const w=m[1].trim(); const g=GLOSSAIRE.find(([k])=>norm(k).includes(w)||w.includes(norm(k).split(" ")[0]));
    if(g) return out(`📚 <b>${esc(g[0])}</b> : ${esc(g[1])}`, [link("📚 Glossaire","tab('aide',{s:'glo'})")]);
  }
  // 12. Problème (faible) ou substitution sur un seul mot
  if(scoreP[0].s>=1.5) return out(`🆘 <b>${esc(scoreP[0].p.q)}</b>\n${esc(scoreP[0].p.r)}`);
  const sub1 = SUBSTITUTIONS.find(s=>s.k.some(k=>norm(k).length>4 && has(n,k)));
  // 13. Recherche libre
  const res = search(raw);
  if(res.length) return out(`J'ai trouvé ${res.length} recette${res.length>1?"s":""} 👇`, rLinks(res));
  if(sub1) return out(`🔄 <b>${esc(sub1.t)}</b>\n${esc(sub1.r)}`);
  return out("Je n'ai pas bien compris 🤔. Essaie par exemple :\n• « Par quoi remplacer le mascarpone ? »\n• « Ma crème pâtissière a des grumeaux »\n• « Que faire avec de la ricotta ? »\n• « Combien de temps pour les cannoli ? »\n• « 1 tasse de farine en grammes »\n• « Minuteur 20 minutes »");
}
function welcome(full){
  const ctx = assistCtx ? R[assistCtx] : null;
  if(ctx && !full) return out(`Ciao ! 👋 Je t'aide pour <b>${esc(ctx.n)}</b>. Demande-moi le temps, les ingrédients, si tu peux la préparer la veille, par quoi remplacer un ingrédient, ou ce qu'il faut faire si quelque chose rate.`);
  return out(`Ciao ! 👋 Je suis ton assistant pâtissier, et je fonctionne même sans internet. Je peux :\n• 🔄 te dire par quoi <b>remplacer un ingrédient</b>\n• 🆘 t'aider à <b>sauver une recette ratée</b>\n• 💡 te donner <b>des idées</b> (« dessert facile », « que faire avec des amandes »)\n• ⚖️ <b>convertir</b> (tasses, cuillères, °F, thermostat)\n• ⏱️ lancer un <b>minuteur</b> (« minuteur 15 minutes »)\n• 📖 répondre sur une <b>recette</b> (« combien de temps pour la cassata »)\n\nTouche 🎤 pour me parler.`);
}
const SUGG_GEN = ["Dessert facile","Par quoi remplacer le mascarpone ?","Que faire avec de la ricotta ?","Ma crème a des grumeaux","1 tasse de farine en grammes","Recettes sans gluten","Surprise-moi !","Minuteur 10 minutes"];
const SUGG_CTX = ["Combien de temps ?","Quels ingrédients ?","Je peux la préparer la veille ?","Astuces pour réussir","Vidéos","Histoire","C'est difficile ?"];
VIEWS.assistant = p => {
  if(p.ctx!==undefined) assistCtx = p.ctx || null;
  const ctx = assistCtx ? R[assistCtx] : null;
  if(!S.chat.length || p.fresh) S.chat=[{me:false, ...welcome()}];
  if(ctx && !p._ctxShown){ p._ctxShown=1; S.chat.push({me:false, ...welcome()}); }
  const sugg = ctx ? SUGG_CTX : SUGG_GEN;
  $("#view").innerHTML = `
  <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px">
    ${ctx?`<span class="badge">${ctx.e} ${esc(ctx.n)}</span><button class="chip" onclick="assistCtx=null;tab('assistant')">✕</button>`:`<span class="muted small">Assistant hors ligne</span>`}
    <span style="flex:1"></span><button class="chip ${S.settings.lireReponses?"on":""}" id="tts">🔊 Lire</button><button class="chip" id="clr">🗑️</button></div>
  <div class="chat" id="chat"></div>
  <div class="composer"><div class="sugg">${sugg.map(s=>`<button class="chip" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div>
  <div class="row"><input id="ain" placeholder="Pose ta question…" enterkeyhint="send"><button class="round mic" id="amic">🎤</button><button class="round" id="asend">➤</button></div></div>`;
  drawChat();
  $("#asend").onclick = () => { assistSend($("#ain").value); };
  $("#ain").onkeydown = e => { if(e.key==="Enter") assistSend($("#ain").value); };
  $("#amic").onclick = () => listen("Pose ta question…", t => assistSend(t));
  document.querySelectorAll(".sugg [data-q]").forEach(b=>b.onclick=()=>assistSend(b.dataset.q));
  $("#tts").onclick = () => { S.settings.lireReponses=!S.settings.lireReponses; save("settings"); $("#tts").classList.toggle("on", S.settings.lireReponses); if(!S.settings.lireReponses) stopSpeak(); };
  $("#clr").onclick = () => { S.chat=[]; save("chat"); VIEWS.assistant({}); };
  if(p.q){ const q=p.q; p.q=""; assistSend(q); }
};
function drawChat(){
  const c=$("#chat"); if(!c) return;
  c.innerHTML = S.chat.map(m => m.me ? `<div class="msg me">${esc(m.t)}</div>` : `<div class="msg bot">${m.h}${m.links&&m.links.length?`<div class="links">${m.links.map(l=>`<button onclick="${esc(l.a)}">${esc(l.l)}</button>`).join("")}</div>`:""}</div>`).join("");
  setTimeout(()=>window.scrollTo(0, document.body.scrollHeight), 30);
}
function assistSend(t){
  t=String(t||"").trim(); if(!t) return;
  if(stack[stack.length-1].v!=="assistant"){ go("assistant",{q:t}); return; }
  S.chat.push({me:true, t});
  let a; try{ a=answer(t); }catch(e){ a=out("Oups, je me suis emmêlé les pinceaux 😅. Reformule ta question ?"); }
  S.chat.push({me:false, h:a.h, links:a.links, txt:a.txt});
  if(S.chat.length>60) S.chat=S.chat.slice(-60);
  save("chat"); drawChat();
  const i=$("#ain"); if(i) i.value="";
  if(S.settings.lireReponses) speak(a.txt);
}

/* ============ Aide ============ */
VIEWS.aide = p => {
  p.s = p.s || "app";
  const T = [["app","📱 L'appli"],["tech","👩‍🍳 Techniques"],["subs","🔄 Substitutions"],["conv","⚖️ Conversions"],["pb","🆘 Problèmes"],["glo","📚 Glossaire"],["set","⚙️ Réglages"]];
  let h = `<div class="chips tabs2">${T.map(([k,l])=>`<button class="chip ${p.s===k?"on":""}" onclick="stack[stack.length-1].p.s='${k}';render()">${l}</button>`).join("")}</div>`;
  const acc = (t, body, open) => `<div class="acc"><button onclick="const d=this.nextElementSibling;d.hidden=!d.hidden;this.querySelector('i').textContent=d.hidden?'＋':'−'">${t}<i>${open?"−":"＋"}</i></button><div ${open?"":"hidden"}>${body}</div></div>`;
  if(p.s==="app"){
    h += `<div class="box tip"><b>Bienvenue dans Dolci d'Italia ! 🇮🇹</b><br>${VRAIES.length} desserts typiques d'Italie et de Sicile + ${RECETTES.length-VRAIES.length} recettes de base, avec pas-à-pas, minuteurs, vidéos et un assistant.</div>`;
    h += AIDE_APP.map((a,i)=>acc(esc(a.t), `<p>${esc(a.r)}</p>`, i===0)).join("");
    h += `<h3>Pour bien commencer</h3><ol class="steps"><li>Choisis une recette marquée <b>★☆☆ Facile</b> (tiramisù, panna cotta, granita).</li><li>Lis-la entière une fois, et regarde une vidéo.</li><li>Ajoute les ingrédients aux courses.</li><li>Sors tous les ingrédients avant de commencer, pesés.</li><li>Lance le <b>mode pas à pas</b> et laisse-toi guider.</li></ol>`;
  } else if(p.s==="tech"){
    h += TECHNIQUES.map(t=>acc(t.e+" "+esc(t.t), `<ol>${t.s.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`)).join("");
    h += `<h3>🎬 Vidéos de techniques</h3><div class="chips" style="flex-wrap:wrap">${[["Monter les blancs","come montare albumi a neve ferma"],["Crème pâtissière","crema pasticcera ricetta"],["Pâte sablée","pasta frolla perfetta"],["Égoutter la ricotta","come scolare la ricotta"],["Frire sans risque","come friggere dolci temperatura olio"],["Poche à douille","come usare sac a poche"]].map(([l,q])=>`<button class="chip" onclick="yt('${q}')">🎬 ${l}</button>`).join("")}</div>`;
  } else if(p.s==="subs"){
    h += `<div class="search"><input id="subq" placeholder="🔍 Ingrédient à remplacer"></div><div id="subl"></div>`;
  } else if(p.s==="conv"){
    h += `<div class="box"><h3 style="margin-top:0">⚖️ Mesures → grammes</h3><div class="conv">
      <input id="cq" type="number" value="1" step="0.25" min="0"><select id="cu"><option value="cup">tasse (240 ml)</option><option value="cas">c. à soupe</option><option value="cac">c. à café</option><option value="g">grammes</option></select>
      <select id="ci" style="grid-column:1/-1">${Object.keys(DENSITES).filter(k=>k!=="amande").map(k=>`<option>${k}</option>`).join("")}</select></div><div class="result" id="cr"></div></div>
    <div class="box"><h3 style="margin-top:0">🌡️ Températures du four</h3><table style="width:100%;border-collapse:collapse;font-size:14.5px">${[[1,30],[2,60],[3,90],[4,120],[5,150],[6,180],[7,210],[8,240]].map(([t,c])=>`<tr style="border-top:1px solid var(--line)"><td style="padding:5px">Th. ${t}</td><td><b>${c} °C</b></td><td>${Math.round(c*9/5+32)} °F</td><td class="muted">${c-20} °C ventilé</td></tr>`).join("")}</table></div>
    <div class="box"><h3 style="margin-top:0">🍞 Levure</h3>10 g de levure fraîche = 3-4 g de levure sèche = ½ sachet de levure sèche de boulanger.<br>1 sachet de levure chimique ≈ 11 g.</div>
    <div class="box"><h3 style="margin-top:0">⭕ Changer de taille de moule</h3><div class="conv"><input id="m1" type="number" value="24"><input id="m2" type="number" value="20"></div><div class="small muted">Diamètre de la recette (cm) → ton moule (cm)</div><div class="result" id="mr"></div></div>
    <div class="box"><h3 style="margin-top:0">🥚 Œufs</h3>1 œuf moyen ≈ 50-55 g (blanc 30-35 g, jaune 18-20 g).</div>`;
  } else if(p.s==="pb"){
    h += PROBLEMES.map(x=>acc("🆘 "+esc(x.q), `<p>${esc(x.r)}</p>`)).join("");
  } else if(p.s==="glo"){
    h += `<ul class="ing">${GLOSSAIRE.map(([k,v])=>`<li><span><b>${esc(k)}</b> — ${esc(v)}</span></li>`).join("")}</ul>`;
  } else if(p.s==="set"){
    const tg=(k,l)=>`<li><span class="lbl" style="flex:1">${l}</span><button class="chip ${S.settings[k]?"on":""}" onclick="S.settings['${k}']=!S.settings['${k}'];save('settings');render()">${S.settings[k]?"Activé":"Désactivé"}</button></li>`;
    h += `<ul class="ing">${tg("voixMinuteur","🔊 Annoncer la fin des minuteurs à voix haute")}${tg("lectureAuto","📖 Lire automatiquement chaque étape en mode pas à pas")}${tg("lireReponses","🤖 Lire les réponses de l'assistant")}</ul>
    <h3>Mes données</h3><p class="muted small">${S.favs.length} favoris · ${Object.keys(S.notes).filter(k=>S.notes[k]).length} notes · ${Object.values(S.done).reduce((a,b)=>a+b.length,0)} recettes réalisées. Tout est enregistré uniquement sur ce téléphone.</p>
    <button class="btn full" onclick="if(this.dataset.c){localStorage.clear();location.reload()}else{this.dataset.c=1;this.textContent='Appuie encore pour confirmer'}">🗑️ Effacer toutes mes données</button>
    <h3>À propos</h3><p class="small muted">Dolci d'Italia – desserts typiques italiens et siciliens. Les vidéos s'ouvrent sur YouTube (connexion nécessaire). Tout le reste fonctionne hors ligne.</p>`;
  }
  $("#view").innerHTML = h;
  if(p.s==="subs"){ const upd=()=>{ const q=norm($("#subq").value); $("#subl").innerHTML=SUBSTITUTIONS.filter(s=>!q||norm(s.t+" "+s.k.join(" ")+" "+s.r).includes(q)).map(s=>`<div class="box"><b>🔄 ${esc(s.t)}</b><br>${esc(s.r)}</div>`).join("")||`<p class="muted">Rien trouvé. Demande à l'assistant !</p>`; }; $("#subq").oninput=upd; upd(); }
  if(p.s==="conv"){
    const c=()=>{ const q=parseFloat($("#cq").value)||0, u=$("#cu").value, d=DENSITES[$("#ci").value];
      if(u==="g") $("#cr").innerHTML=`${q} g ≈ ${d.cup?num(Math.round(q/d.cup*100)/100)+" tasse · ":""}${num(Math.round(q/d.cas*10)/10)} c. à soupe · ${num(Math.round(q/d.cac*10)/10)} c. à café`;
      else $("#cr").textContent = d[u] ? `≈ ${num(Math.round(q*d[u]*10)/10)} g` : "—"; };
    ["#cq","#cu","#ci"].forEach(s=>{$(s).oninput=c;$(s).onchange=c;}); c();
    const mc=()=>{ const a=+$("#m1").value, b=+$("#m2").value; $("#mr").textContent = a&&b ? "Multiplie les quantités par "+num(Math.round(b*b/(a*a)*100)/100) : ""; };
    $("#m1").oninput=mc; $("#m2").oninput=mc; mc();
  }
};

/* ============ Démarrage ============ */
render();
