// Moteur de jeu : Briscola avec cartes siciliennes (40 cartes, 2 joueurs)
var Briscola = (function () {
  var SUITS = {
    D: { n: 'Denari', s: '🪙', c: '#b8860b' },
    C: { n: 'Coppe', s: '🏆', c: '#c0392b' },
    S: { n: 'Spade', s: '⚔️', c: '#34495e' },
    B: { n: 'Bastoni', s: '🪵', c: '#2e7d32' }
  };
  // 8 = Fante, 9 = Cavallo, 10 = Re
  var POINTS = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2 };
  var STRENGTH = { 1: 10, 3: 9, 10: 8, 9: 7, 8: 6, 7: 5, 6: 4, 5: 3, 4: 2, 2: 1 };

  function suit(c) { return c[0]; }
  function rank(c) { return parseInt(c.slice(1), 10); }
  function points(c) { return POINTS[rank(c)] || 0; }
  function label(c) { var r = rank(c); return r === 1 ? 'A' : r <= 7 ? String(r) : ['F', 'C', 'R'][r - 8]; }
  function rankName(c) {
    var r = rank(c);
    return { 1: 'Asso', 8: 'Fante', 9: 'Cavallo', 10: 'Re' }[r] || String(r);
  }

  function shuffle(a, rnd) {
    rnd = rnd || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function newGame(leader, rnd) {
    var deck = [];
    ['D', 'C', 'S', 'B'].forEach(function (s) { for (var r = 1; r <= 10; r++) deck.push(s + r); });
    shuffle(deck, rnd);
    var g = {
      deck: deck,
      hands: [deck.splice(0, 3), deck.splice(0, 3)],
      briscola: null, trump: null,
      table: [], pts: [0, 0], tricks: [0, 0],
      leader: leader || 0, turn: leader || 0,
      phase: 'play', lastWinner: null
    };
    g.briscola = deck.shift();
    deck.push(g.briscola); // la briscola est la dernière carte piochée
    g.trump = suit(g.briscola);
    return g;
  }

  // la carte b (jouée en second) bat-elle la carte a ?
  function beats(b, a, trump) {
    if (suit(a) === suit(b)) return STRENGTH[rank(b)] > STRENGTH[rank(a)];
    return suit(b) === trump;
  }

  function play(g, p, idx) {
    if (g.phase !== 'play' || g.turn !== p || g.table.length >= 2) return false;
    if (idx < 0 || idx >= g.hands[p].length) return false;
    var card = g.hands[p].splice(idx, 1)[0];
    g.table.push({ p: p, card: card });
    if (g.table.length === 1) g.turn = 1 - p;
    else g.phase = 'resolve';
    return true;
  }

  function resolve(g) {
    if (g.phase !== 'resolve') return;
    var a = g.table[0], b = g.table[1];
    var w = beats(b.card, a.card, g.trump) ? b.p : a.p;
    g.pts[w] += points(a.card) + points(b.card);
    g.tricks[w]++;
    g.lastWinner = w;
    g.table = [];
    if (g.deck.length >= 2) {
      g.hands[w].push(g.deck.shift());
      g.hands[1 - w].push(g.deck.shift());
    }
    g.turn = g.leader = w;
    g.phase = (g.hands[0].length === 0 && g.hands[1].length === 0) ? 'over' : 'play';
  }

  // Ce que voit le joueur p (on cache la main adverse et le talon)
  function view(g, p, names) {
    return {
      me: p,
      hand: g.hands[p].slice(),
      oppCount: g.hands[1 - p].length,
      deckCount: g.deck.length,
      briscola: g.briscola,
      briscolaInDeck: g.deck.length > 0,
      trump: g.trump,
      table: g.table.map(function (t) { return { mine: t.p === p, card: t.card }; }),
      myPts: g.pts[p], oppPts: g.pts[1 - p],
      myTricks: g.tricks[p], oppTricks: g.tricks[1 - p],
      myTurn: g.phase === 'play' && g.turn === p,
      phase: g.phase,
      lastWinnerMe: g.lastWinner === null ? null : g.lastWinner === p,
      myName: names ? names[p] : '', oppName: names ? names[1 - p] : ''
    };
  }

  // IA simple pour le mode solo
  function cpuChoose(g, p) {
    var hand = g.hands[p], trump = g.trump;
    function cost(c) { return points(c) * 3 + (suit(c) === trump ? 20 : 0) + STRENGTH[rank(c)] * 0.1; }
    function cheapest(cards) { return cards.slice().sort(function (x, y) { return cost(x) - cost(y); })[0]; }
    var choice;
    if (g.table.length === 0) {
      choice = cheapest(hand);
    } else {
      var lead = g.table[0].card;
      var winners = hand.filter(function (c) { return beats(c, lead, trump); });
      var sameSuitWin = winners.filter(function (c) { return suit(c) === suit(lead); });
      var leadPts = points(lead);
      if (sameSuitWin.length) {
        // gagner avec la même couleur : prendre la plus forte en points
        choice = sameSuitWin.sort(function (x, y) { return points(y) - points(x); })[0];
      } else if (winners.length && (leadPts >= 3 || g.deck.length <= 4)) {
        choice = cheapest(winners);
      } else {
        choice = cheapest(hand);
      }
    }
    return hand.indexOf(choice);
  }

  return {
    SUITS: SUITS, newGame: newGame, play: play, resolve: resolve, view: view,
    cpuChoose: cpuChoose, points: points, label: label, rankName: rankName,
    suit: suit, rank: rank, beats: beats
  };
})();
if (typeof module !== 'undefined') module.exports = Briscola;
