// Dessins originaux de cartes siciliennes (SVG), style traditionnel
var CardArt = (function () {
  var GOLD = '#e8b923', GOLD_D = '#8a6510', RED = '#d42a1e', RED_D = '#7a1410',
      GREEN = '#2f9a3e', GREEN_D = '#145a20', BLUE = '#2f6fd0', SKIN = '#f6d2b0',
      INK = '#2a1a0a', YEL = '#f5c518', GREY = '#d9d9d9', WHITE = '#fffdf6';

  function n(v) { return Math.round(v * 100) / 100; }

  /* ---------- Symboles ---------- */
  function coin(x, y, r) {
    var s = '<g transform="translate(' + n(x) + ' ' + n(y) + ')">';
    s += '<circle r="' + r + '" fill="' + GOLD + '" stroke="' + GOLD_D + '" stroke-width="' + n(r * 0.08) + '"/>';
    s += '<circle r="' + n(r * 0.78) + '" fill="none" stroke="' + GOLD_D + '" stroke-width="' + n(r * 0.05) + '"/>';
    s += '<circle r="' + n(r * 0.62) + '" fill="#f3cf55" stroke="' + GOLD_D + '" stroke-width="' + n(r * 0.04) + '"/>';
    // rosace à 8 pétales
    for (var i = 0; i < 8; i++) {
      s += '<ellipse cx="0" cy="' + n(-r * 0.33) + '" rx="' + n(r * 0.12) + '" ry="' + n(r * 0.24) + '" fill="' + RED + '" stroke="' + GOLD_D + '" stroke-width="' + n(r * 0.03) + '" transform="rotate(' + (i * 45) + ')"/>';
    }
    s += '<circle r="' + n(r * 0.14) + '" fill="' + GREEN + '" stroke="' + GOLD_D + '" stroke-width="' + n(r * 0.03) + '"/>';
    // perles du bord
    for (var j = 0; j < 16; j++) {
      var a = j * Math.PI / 8;
      s += '<circle cx="' + n(Math.cos(a) * r * 0.89) + '" cy="' + n(Math.sin(a) * r * 0.89) + '" r="' + n(r * 0.05) + '" fill="' + GOLD_D + '"/>';
    }
    return s + '</g>';
  }

  function cup(x, y, h) {
    var k = h / 40; // dessin de référence : 40 de haut, centré
    var s = '<g transform="translate(' + n(x) + ' ' + n(y) + ') scale(' + n(k) + ')" stroke="' + INK + '" stroke-width="1.1" stroke-linejoin="round">';
    s += '<ellipse cx="0" cy="18" rx="9" ry="2.6" fill="' + RED + '"/>';                  // pied
    s += '<path d="M-3 17 L-2 9 L2 9 L3 17 Z" fill="' + GOLD + '"/>';                     // tige
    s += '<ellipse cx="0" cy="8.5" rx="5" ry="1.8" fill="' + GREEN + '"/>';               // noeud
    s += '<path d="M-12 -12 C-13 0 -7 7 0 7 C7 7 13 0 12 -12 Z" fill="' + RED + '"/>';     // coupe
    s += '<path d="M-9 -6 C-6 -2 6 -2 9 -6" fill="none" stroke="' + GOLD + '" stroke-width="1.6"/>';
    s += '<path d="M-12 -12 L-14 -16 L14 -16 L12 -12 Z" fill="' + GREEN + '"/>';           // bord
    s += '<path d="M-12 -9 C-18 -9 -18 -2 -11 -1" fill="none" stroke="' + GREEN_D + '" stroke-width="2"/>';
    s += '<path d="M12 -9 C18 -9 18 -2 11 -1" fill="none" stroke="' + GREEN_D + '" stroke-width="2"/>';
    s += '<path d="M-6 -16 C-4 -22 4 -22 6 -16 Z" fill="' + GOLD + '"/>';                 // couvercle
    s += '<circle cx="0" cy="-21.5" r="1.8" fill="' + RED + '"/>';
    return s + '</g>';
  }

  // épée verticale, pointe en haut, longueur L, centre au milieu
  function sword(x, y, L, ang) {
    var k = L / 100;
    var s = '<g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(' + (ang || 0) + ') scale(' + n(k) + ')" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round">';
    s += '<path d="M-3.5 30 C-5 5 -4 -25 2 -50 C3 -25 4 5 3.5 30 Z" fill="' + GREEN + '"/>';   // lame courbe
    s += '<path d="M0 28 C-0.5 5 0 -20 1.5 -44" fill="none" stroke="' + GREEN_D + '" stroke-width="1"/>';
    s += '<path d="M-14 30 C-10 26 10 26 14 30 C10 35 -10 35 -14 30 Z" fill="' + YEL + '"/>'; // garde
    s += '<circle cx="-14" cy="30" r="2.6" fill="' + RED + '"/><circle cx="14" cy="30" r="2.6" fill="' + RED + '"/>';
    s += '<rect x="-3" y="33" width="6" height="12" rx="2" fill="' + RED + '"/>';            // poignée
    s += '<circle cx="0" cy="48" r="4.2" fill="' + YEL + '"/>';                            // pommeau
    return s + '</g>';
  }

  // bâton vertical, gros bout en haut
  function baton(x, y, L, ang) {
    var k = L / 100;
    var s = '<g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(' + (ang || 0) + ') scale(' + n(k) + ')" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round">';
    s += '<path d="M-3.5 48 L-6 0 C-10 -20 -12 -38 0 -50 C12 -38 10 -20 6 0 L3.5 48 Z" fill="' + GREEN + '"/>';
    s += '<path d="M0 -50 C10 -38 9 -20 5.5 -2 L2 -2 C4 -20 4 -36 0 -50 Z" fill="' + RED + '" stroke="none"/>';
    s += '<path d="M-7 -30 L-11 -33 M7 -18 L11 -20 M-6 -8 L-10 -9" stroke="' + GREEN_D + '" stroke-width="2"/>'; // noeuds
    s += '<path d="M-6 8 C-14 2 -16 14 -8 14 C-2 14 2 6 6 8 C14 2 16 14 8 14" fill="none" stroke="' + BLUE + '" stroke-width="2.4"/>'; // ruban
    s += '<rect x="-5" y="6" width="10" height="5" fill="' + YEL + '"/>';
    return s + '</g>';
  }

  /* ---------- Cartes numériques ---------- */
  var GRID = {
    1: [[50, 80]],
    2: [[50, 44], [50, 116]],
    3: [[50, 30], [50, 80], [50, 130]],
    4: [[29, 42], [71, 42], [29, 118], [71, 118]],
    5: [[29, 36], [71, 36], [50, 80], [29, 124], [71, 124]],
    6: [[29, 34], [71, 34], [29, 80], [71, 80], [29, 126], [71, 126]],
    7: [[29, 30], [71, 30], [50, 57], [29, 84], [71, 84], [29, 132], [71, 132]]
  };

  function pips(suit, r) {
    var pts = GRID[r], out = '';
    if (suit === 'D') {
      var rad = r === 1 ? 33 : r === 2 ? 22 : r === 3 ? 18 : r <= 5 ? 17 : 15;
      pts.forEach(function (p) { out += coin(p[0], p[1], rad); });
    } else if (suit === 'C') {
      var h = r === 1 ? 80 : r === 2 ? 50 : r === 3 ? 40 : r <= 5 ? 38 : 32;
      pts.forEach(function (p) { out += cup(p[0], p[1], h); });
    } else {
      var draw = suit === 'S' ? sword : baton;
      if (r === 1) return draw(50, 80, 135, 0);
      if (r <= 3) {
        // éventail croisé
        var spread = 26 * (r - 1);
        for (var i = 0; i < r; i++) out += draw(50, 82, 128, -spread / 2 + spread * i / (r - 1));
      } else {
        var L = r <= 5 ? 64 : r === 6 ? 50 : 44;
        pts.forEach(function (p, i) { out += draw(p[0], p[1], L, i % 2 ? 14 : -14); });
      }
    }
    return out;
  }

  /* ---------- Figures ---------- */
  function heldSymbol(suit, x, y, size) {
    if (suit === 'D') return coin(x, y, size * 0.45);
    if (suit === 'C') return cup(x, y, size);
    if (suit === 'S') return sword(x, y, size * 2.4, 0);
    return baton(x, y, size * 2.2, -10);
  }

  function person(suit, king, x, y, s) {
    // personnage debout ; (x,y) = haut de la tête ; s = échelle
    var tunic = { D: GREEN, C: BLUE, S: GREEN, B: RED }[suit];
    var cape = { D: RED, C: RED, S: RED, B: BLUE }[suit];
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round">';
    // cape
    g += '<path d="M-14 22 C-24 60 -26 95 -20 112 L20 112 C26 95 24 60 14 22 Z" fill="' + cape + '"/>';
    // jambes
    g += '<rect x="-9" y="84" width="7" height="28" fill="' + YEL + '"/><rect x="2" y="84" width="7" height="28" fill="' + YEL + '"/>';
    g += '<path d="M-12 112 L-1 112 L-1 117 L-14 117 Z M1 112 L12 112 L14 117 L1 117 Z" fill="' + INK + '"/>';
    // tunique
    g += '<path d="M-13 22 L13 22 L17 86 L-17 86 Z" fill="' + tunic + '"/>';
    g += '<path d="M-17 80 L17 80" stroke="' + YEL + '" stroke-width="3"/>';
    g += '<path d="M-13 50 L13 50" stroke="' + YEL + '" stroke-width="2.4"/>';
    // bras
    g += '<path d="M-13 26 L-22 54 L-16 56 L-8 34 Z" fill="' + tunic + '"/>';
    g += '<path d="M13 26 L24 46 L19 50 L9 34 Z" fill="' + tunic + '"/>';
    g += '<circle cx="-19" cy="56" r="3.5" fill="' + SKIN + '"/><circle cx="22" cy="49" r="3.5" fill="' + SKIN + '"/>';
    // col + tête
    g += '<path d="M-9 20 L9 20 L6 25 L-6 25 Z" fill="' + WHITE + '"/>';
    g += '<ellipse cx="0" cy="9" rx="8.5" ry="10" fill="' + SKIN + '"/>';
    g += '<circle cx="-3" cy="7" r="1" fill="' + INK + '" stroke="none"/><circle cx="3" cy="7" r="1" fill="' + INK + '" stroke="none"/>';
    if (king) {
      g += '<path d="M-8 12 C-8 24 8 24 8 12 C5 15 -5 15 -8 12 Z" fill="#eee"/>'; // barbe
      g += '<path d="M-9 0 L-9 -9 L-5 -4 L0 -11 L5 -4 L9 -9 L9 0 Z" fill="' + YEL + '"/>'; // couronne
      g += '<circle cx="0" cy="-3" r="1.5" fill="' + RED + '"/>';
    } else {
      g += '<path d="M-9 4 C-10 -6 10 -6 9 4 C5 0 -5 0 -9 4 Z" fill="#7a4a1a"/>';       // cheveux
      g += '<path d="M-11 -1 C-6 -9 8 -9 12 -2 L14 -4 C10 -11 -8 -12 -13 -2 Z" fill="' + RED + '"/>'; // bonnet
    }
    g += '<path d="M-2 13 L2 13" stroke-width="1"/>';
    g += '</g>';
    // symbole tenu dans la main droite (côté droit de la carte)
    var hx = x + 22 * s, hy = y + 49 * s;
    var sym = suit === 'S' || suit === 'B'
      ? heldSymbol(suit, hx, hy - 18 * s, 18 * s)
      : heldSymbol(suit, hx + 4 * s, hy - 12 * s, 22 * s);
    return g + sym;
  }

  function horse(x, y, s, suit) {
    var cloth = { D: RED, C: GREEN, S: RED, B: BLUE }[suit];
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" stroke="' + INK + '" stroke-width="1.3" stroke-linejoin="round">';
    // queue
    g += '<path d="M-30 -4 C-44 0 -44 22 -38 34 C-36 22 -34 10 -28 4 Z" fill="#9a9a9a"/>';
    // pattes arrière + avant
    g += '<path d="M-24 8 L-28 40 L-22 40 L-16 10 Z" fill="' + GREY + '"/>';
    g += '<path d="M-14 10 L-12 40 L-6 40 L-6 12 Z" fill="' + GREY + '"/>';
    g += '<path d="M14 10 L20 26 L14 40 L20 40 L27 26 L22 8 Z" fill="' + GREY + '"/>';
    g += '<path d="M22 6 L34 18 L38 14 L28 2 Z" fill="' + GREY + '"/>';
    g += '<path d="M-29 40 L-21 40 L-21 44 L-30 44 Z M-13 40 L-5 40 L-5 44 L-14 44 Z M13 40 L21 40 L21 44 L12 44 Z" fill="' + INK + '"/>';
    g += '<path d="M36 13 L41 17 L38 20 L34 17 Z" fill="' + INK + '"/>';
    // corps
    g += '<ellipse cx="-2" cy="0" rx="32" ry="14" fill="' + WHITE + '"/>';
    // cou + tête
    g += '<path d="M18 -6 C22 -22 26 -32 32 -40 L46 -30 C44 -26 40 -24 36 -24 C32 -18 30 -6 26 6 Z" fill="' + WHITE + '"/>';
    g += '<path d="M24 -34 C20 -26 18 -16 18 -8" fill="none" stroke="#9a9a9a" stroke-width="4"/>'; // crinière
    g += '<circle cx="36" cy="-33" r="1.4" fill="' + INK + '" stroke="none"/>';
    g += '<path d="M32 -40 L33 -47 L36 -41 Z" fill="' + WHITE + '"/>';
    g += '<path d="M44 -31 L30 -24 M30 -24 L8 -10" fill="none" stroke="' + RED_D + '" stroke-width="1.4"/>'; // rênes
    // tapis de selle
    g += '<path d="M-14 -12 L14 -12 L18 10 L-18 10 Z" fill="' + cloth + '"/>';
    g += '<path d="M-18 6 L18 6" stroke="' + YEL + '" stroke-width="2.4"/>';
    g += '</g>';
    return g;
  }

  function rider(suit, x, y, s) {
    var tunic = { D: BLUE, C: RED, S: GREEN, B: GREEN }[suit];
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round">';
    g += '<path d="M-4 30 L4 30 L8 52 L2 54 Z" fill="' + YEL + '"/>';                // jambe
    g += '<path d="M1 52 L10 52 L10 56 L0 56 Z" fill="' + INK + '"/>';
    g += '<path d="M-9 4 L9 4 L11 32 L-11 32 Z" fill="' + tunic + '"/>';              // buste
    g += '<path d="M9 8 L22 -2 L24 2 L12 14 Z" fill="' + tunic + '"/>';               // bras levé
    g += '<circle cx="23" cy="-1" r="3" fill="' + SKIN + '"/>';
    g += '<ellipse cx="0" cy="-6" rx="7" ry="8.5" fill="' + SKIN + '"/>';
    g += '<circle cx="2" cy="-8" r="0.9" fill="' + INK + '" stroke="none"/>';
    g += '<path d="M-9 -9 C-8 -20 10 -20 10 -9 L13 -9 L13 -12 C10 -22 -10 -22 -12 -11 Z" fill="' + RED + '"/>'; // chapeau
    g += '</g>';
    return g + heldSymbol(suit, x + 26 * s, y - 12 * s, suit === 'S' || suit === 'B' ? 16 * s : 20 * s);
  }

  function face(suit, r) {
    if (r === 8) return person(suit, false, 46, 22, 1.08);
    if (r === 10) return person(suit, true, 46, 20, 1.1);
    // Cavallo
    return horse(46, 108, 0.95, suit) + rider(suit, 42, 54, 0.95);
  }

  /* ---------- Assemblage ---------- */
  var cache = {};
  function svg(card) {
    if (cache[card]) return cache[card];
    var suit = card[0], r = parseInt(card.slice(1), 10);
    var body = r <= 7 ? pips(suit, r) : face(suit, r);
    var out = '<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
      '<rect x="1" y="1" width="98" height="158" rx="7" fill="' + WHITE + '" stroke="#bfb39a" stroke-width="1.5"/>' +
      '<rect x="5" y="5" width="90" height="150" rx="4" fill="none" stroke="#e7dcc3" stroke-width="0.8"/>' +
      '<g>' + body + '</g></svg>';
    cache[card] = out;
    return out;
  }

  function back() {
    if (cache.back) return cache.back;
    var p = '';
    for (var yy = 14; yy <= 146; yy += 12) {
      for (var xx = 14; xx <= 86; xx += 12) {
        p += '<path d="M' + xx + ' ' + (yy - 5) + ' L' + (xx + 5) + ' ' + yy + ' L' + xx + ' ' + (yy + 5) + ' L' + (xx - 5) + ' ' + yy + ' Z" fill="none" stroke="#f4f0e6" stroke-width="0.9"/>';
        p += '<circle cx="' + xx + '" cy="' + yy + '" r="1.3" fill="#f4f0e6"/>';
      }
    }
    var out = '<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="1" y="1" width="98" height="158" rx="7" fill="#f4f0e6" stroke="#888" stroke-width="1.5"/>' +
      '<rect x="6" y="6" width="88" height="148" rx="4" fill="#1d1d1d"/>' + p +
      '<rect x="9" y="9" width="82" height="142" rx="3" fill="none" stroke="#f4f0e6" stroke-width="1.2"/>' +
      '<ellipse cx="50" cy="80" rx="18" ry="26" fill="#1d1d1d" stroke="#f4f0e6" stroke-width="1.4"/>' +
      '<path d="M50 60 C60 70 60 90 50 100 C40 90 40 70 50 60 Z" fill="none" stroke="#f4f0e6" stroke-width="1.2"/>' +
      '<circle cx="50" cy="80" r="4" fill="#f4f0e6"/></svg>';
    cache.back = out;
    return out;
  }

  return { svg: svg, back: back };
})();
if (typeof module !== 'undefined') module.exports = CardArt;
