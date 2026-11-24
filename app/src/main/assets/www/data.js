/* ====== Données : harmonica diatonique 10 trous, cours, morceaux ====== */
'use strict';

// Harmonica diatonique en Do (Richter). MIDI : 60 = Do4 (do du milieu)
const BLOW = [60, 64, 67, 72, 76, 79, 84, 88, 91, 96];
const DRAW = [62, 67, 71, 74, 77, 81, 83, 86, 89, 93];

// Tonalités d'harmonica : décalage en demi-tons par rapport au Do
const KEYS = {
  'C': { label: 'Do (C)', off: 0 },
  'D': { label: 'Ré (D)', off: 2 },
  'E': { label: 'Mi (E)', off: 4 },
  'F': { label: 'Fa (F)', off: 5 },
  'G': { label: 'Sol (G)', off: -5 },
  'A': { label: 'La (A)', off: -3 },
  'Bb': { label: 'Si♭ (B♭)', off: -2 },
};

const NOTE_FR = ['Do', 'Do♯', 'Ré', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'Si♭', 'Si'];
const NOTE_EN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];

/* Notation tablature :
   "4"   = souffler trou 4
   "-4"  = aspirer trou 4
   "-4'" = aspirer trou 4 avec bend (note baissée d'un demi-ton) */
function parseTab(t) {
  t = String(t).trim();
  const bend = (t.match(/'/g) || []).length;
  const draw = t.startsWith('-');
  const hole = parseInt(t.replace(/[-']/g, ''), 10);
  return { hole, draw, bend, tab: t };
}

function tabMidi(t, keyOff) {
  const p = typeof t === 'string' ? parseTab(t) : t;
  const base = (p.draw ? DRAW : BLOW)[p.hole - 1];
  return base - p.bend + (keyOff || 0);
}

function midiName(m, english) {
  const n = ((Math.round(m) % 12) + 12) % 12;
  const oct = Math.floor(Math.round(m) / 12) - 1;
  return (english ? NOTE_EN : NOTE_FR)[n] + oct;
}
function midiShort(m, english) {
  const n = ((Math.round(m) % 12) + 12) % 12;
  return (english ? NOTE_EN : NOTE_FR)[n];
}

function tabLabel(t) {
  const p = parseTab(t);
  let s = (p.draw ? 'Aspirer ' : 'Souffler ') + 'trou ' + p.hole;
  if (p.bend) s += ' (bend)';
  return s;
}

/* ====== Morceaux (domaine public) ====== */
const SONGS = [
  {
    id: 'lune', title: 'Au clair de la lune', level: 1, emoji: '🌙',
    lines: [
      ['4', '4', '4', '-4', '5', '-4'],
      ['4', '5', '-4', '-4', '4'],
      ['4', '4', '4', '-4', '5', '-4'],
      ['4', '5', '-4', '-4', '4'],
    ],
  },
  {
    id: 'mary', title: 'Mary avait un petit agneau', level: 1, emoji: '🐑',
    lines: [
      ['5', '-4', '4', '-4', '5', '5', '5'],
      ['-4', '-4', '-4', '5', '6', '6'],
      ['5', '-4', '4', '-4', '5', '5', '5'],
      ['5', '-4', '-4', '5', '-4', '4'],
    ],
  },
  {
    id: 'jacques', title: 'Frère Jacques', level: 1, emoji: '🔔',
    lines: [
      ['4', '-4', '5', '4', '4', '-4', '5', '4'],
      ['5', '-5', '6', '5', '-5', '6'],
      ['6', '-6', '6', '-5', '5', '4'],
      ['6', '-6', '6', '-5', '5', '4'],
      ['4', '3', '4', '4', '3', '4'],
    ],
  },
  {
    id: 'twinkle', title: 'Ah ! vous dirai-je, maman', level: 2, emoji: '⭐',
    lines: [
      ['4', '4', '6', '6', '-6', '-6', '6'],
      ['-5', '-5', '5', '5', '-4', '-4', '4'],
      ['6', '6', '-5', '-5', '5', '5', '-4'],
      ['6', '6', '-5', '-5', '5', '5', '-4'],
      ['4', '4', '6', '6', '-6', '-6', '6'],
      ['-5', '-5', '5', '5', '-4', '-4', '4'],
    ],
  },
  {
    id: 'joie', title: 'Ode à la joie', level: 2, emoji: '🎉',
    lines: [
      ['5', '5', '-5', '6', '6', '-5', '5', '-4'],
      ['4', '4', '-4', '5', '5', '-4', '-4'],
      ['5', '5', '-5', '6', '6', '-5', '5', '-4'],
      ['4', '4', '-4', '5', '-4', '4', '4'],
    ],
  },
  {
    id: 'saints', title: 'Oh When the Saints', level: 2, emoji: '🎺',
    lines: [
      ['4', '5', '-5', '6'],
      ['4', '5', '-5', '6'],
      ['4', '5', '-5', '6', '5', '4', '5', '-4'],
      ['5', '5', '-4', '4', '4', '5', '6', '6', '-5'],
      ['5', '-5', '6', '5', '4', '-4', '4'],
    ],
  },
  {
    id: 'jingle', title: 'Vive le vent (Jingle Bells)', level: 3, emoji: '🎄',
    lines: [
      ['5', '5', '5', '5', '5', '5'],
      ['5', '6', '4', '-4', '5'],
      ['-5', '-5', '-5', '-5', '-5', '5', '5'],
      ['5', '5', '-4', '-4', '5', '-4', '6'],
      ['5', '5', '5', '5', '5', '5'],
      ['5', '6', '4', '-4', '5'],
      ['-5', '-5', '-5', '-5', '-5', '5', '5'],
      ['5', '6', '6', '-5', '-4', '4'],
    ],
  },
  {
    id: 'anniv', title: 'Joyeux anniversaire', level: 3, emoji: '🎂',
    lines: [
      ['6', '6', '-6', '6', '7', '-7'],
      ['6', '6', '-6', '6', '-8', '7'],
      ['6', '6', '9', '8', '7', '-7', '-6'],
      ['-9', '-9', '8', '7', '-8', '7'],
    ],
  },
  {
    id: 'oh_susanna', title: 'Oh! Susanna', level: 3, emoji: '🪕',
    lines: [
      ['4', '-4', '5', '6', '6', '-6', '6', '5', '4'],
      ['-4', '5', '5', '-4', '4', '-4'],
      ['4', '-4', '5', '6', '6', '-6', '6', '5', '4'],
      ['-4', '5', '5', '-4', '-4', '4'],
    ],
  },
];

/* ====== Cours ======
   Types d'étapes :
   info  : { title, text, holes?:[tabs à montrer], tip? }
   play  : { title, seq:[tabs], hold?:ms, text? }  -> l'app écoute et corrige
   quiz  : { q, options:[...], answer: index, explain }
   ear   : { title, tab, options:[tabs] } -> l'app joue un son, on devine
*/
const UNITS = [
  {
    id: 'u1', title: 'Découverte', emoji: '🌱', color: '#4EE6C8',
    lessons: [
      {
        id: 'l1', title: 'Ton harmonica', xp: 20,
        steps: [
          { type: 'info', title: 'Bienvenue ! 👋', text: "L'harmonica diatonique a <b>10 trous</b>. Chaque trou donne <b>2 notes</b> : une quand tu <b>souffles</b>, une quand tu <b>aspires</b>.<br><br>Ici, tu vas apprendre avec ton micro : l'app t'écoute et te dit si c'est juste !" , holes: [] },
          { type: 'info', title: 'Bien le tenir', text: "Tiens l'harmonica dans ta main <b>gauche</b>, les <b>numéros vers le haut</b>.<br><br>Les sons <b>graves</b> (trou 1) sont à <b>gauche</b>, les <b>aigus</b> (trou 10) à <b>droite</b>.", holes: ['1', '10'] },
          { type: 'info', title: 'Lire les tablatures', text: "On écrit les notes avec des chiffres :<br><br><span class='tabchip blow'>4</span> = <b>souffler</b> dans le trou 4<br><span class='tabchip draw'>-4</span> = <b>aspirer</b> dans le trou 4<br><br>Bleu = souffler ⬆️ &nbsp; Orange = aspirer ⬇️", holes: ['4', '-4'] },
          { type: 'quiz', q: 'Que veut dire <span class="tabchip draw">-6</span> ?', options: ['Souffler dans le trou 6', 'Aspirer dans le trou 6', 'Souffler 6 fois'], answer: 1, explain: 'Le signe moins veut dire aspirer.' },
          { type: 'quiz', q: 'Où sont les notes graves ?', options: ['À gauche (trou 1)', 'À droite (trou 10)', 'Au milieu'], answer: 0, explain: 'Trou 1 = le plus grave, à gauche.' },
        ],
      },
      {
        id: 'l2', title: 'Ta première note', xp: 30,
        steps: [
          { type: 'info', title: 'Une seule note', text: "Pour jouer un seul trou, forme un petit <b>« O »</b> avec tes lèvres, comme pour boire à la paille 🥤.<br><br>Pose les lèvres bien en avant sur l'harmonica, détendues. Souffle <b>doucement</b> : pas besoin de force !", holes: ['4'] },
          { type: 'play', title: 'Souffle dans le trou 4', seq: ['4'], hold: 700, text: 'Tiens la note jusqu\'à ce que le cercle se remplisse.' },
          { type: 'info', title: 'Maintenant, aspire', text: "Même trou, mais cette fois tu <b>inspires</b> doucement, comme si tu respirais à travers l'harmonica.", holes: ['-4'] },
          { type: 'play', title: 'Aspire dans le trou 4', seq: ['-4'], hold: 700 },
          { type: 'play', title: 'Souffle / aspire', seq: ['4', '-4', '4', '-4'], hold: 400, text: 'Alterne sans bouger la bouche.' },
        ],
      },
      {
        id: 'l3', title: 'Bouger d\'un trou', xp: 30,
        steps: [
          { type: 'info', title: 'Glisser', text: "Pour changer de trou, ne bouge pas la tête : fais <b>glisser l'harmonica</b> avec tes mains.<br><br>Vers la <b>droite</b> du trou = plus aigu.", holes: ['4', '5', '6'] },
          { type: 'play', title: 'Trous 4, 5, 6 soufflés', seq: ['4', '5', '6'], hold: 400 },
          { type: 'play', title: 'Trous 4, 5, 6 aspirés', seq: ['-4', '-5', '-6'], hold: 400 },
          { type: 'ear', title: 'Écoute bien', tab: '4', options: ['4', '6'] },
          { type: 'play', title: 'Mélange', seq: ['4', '-4', '5', '-5', '6', '-6'], hold: 350 },
        ],
      },
    ],
  },
  {
    id: 'u2', title: 'La gamme', emoji: '🪜', color: '#FFB020',
    lessons: [
      {
        id: 'l4', title: 'La gamme qui monte', xp: 40,
        steps: [
          { type: 'info', title: 'Do Ré Mi Fa Sol La Si Do', text: "La gamme de Do se joue des trous 4 à 7 :<br><br><span class='tabchip blow'>4</span> <span class='tabchip draw'>-4</span> <span class='tabchip blow'>5</span> <span class='tabchip draw'>-5</span> <span class='tabchip blow'>6</span> <span class='tabchip draw'>-6</span> <span class='tabchip draw'>-7</span> <span class='tabchip blow'>7</span><br><br>⚠️ Attention à la fin : au trou 7, on <b>aspire avant</b> de souffler !", holes: ['4', '-4', '5', '-5', '6', '-6', '-7', '7'] },
          { type: 'play', title: 'Do Ré Mi Fa', seq: ['4', '-4', '5', '-5'], hold: 350 },
          { type: 'play', title: 'Sol La Si Do', seq: ['6', '-6', '-7', '7'], hold: 350 },
          { type: 'quiz', q: 'Après <span class="tabchip draw">-6</span> (La), quelle note vient dans la gamme ?', options: ['7 soufflé', '-7 aspiré', '-6 encore'], answer: 1, explain: 'Si = -7 (aspiré), puis Do = 7 (soufflé).' },
          { type: 'play', title: 'Toute la gamme !', seq: ['4', '-4', '5', '-5', '6', '-6', '-7', '7'], hold: 350 },
        ],
      },
      {
        id: 'l5', title: 'La gamme qui descend', xp: 40,
        steps: [
          { type: 'play', title: 'Do Si La Sol', seq: ['7', '-7', '-6', '6'], hold: 350 },
          { type: 'play', title: 'Fa Mi Ré Do', seq: ['-5', '5', '-4', '4'], hold: 350 },
          { type: 'ear', title: 'Quelle note ?', tab: '-4', options: ['-4', '6', '7'] },
          { type: 'play', title: 'Toute la descente', seq: ['7', '-7', '-6', '6', '-5', '5', '-4', '4'], hold: 350 },
        ],
      },
      {
        id: 'l6', title: 'Les sauts', xp: 40,
        steps: [
          { type: 'info', title: 'Sauter des trous', text: "Parfois une mélodie saute un trou. Garde la bouche en « O » et glisse plus loin, sans souffler pendant le trajet.", holes: ['4', '6'] },
          { type: 'play', title: 'Sauts soufflés', seq: ['4', '6', '5', '7', '4'], hold: 350 },
          { type: 'play', title: 'Sauts aspirés', seq: ['-4', '-6', '-5', '-4'], hold: 350 },
          { type: 'play', title: 'Arpège de Do', seq: ['4', '5', '6', '7', '6', '5', '4'], hold: 300 },
        ],
      },
      { id: 'x1', title: 'Examen : la gamme', xp: 80, exam: true, pool: ['4', '-4', '5', '-5', '6', '-6', '-7', '7'], length: 10 },
    ],
  },
  {
    id: 'u3', title: 'Premières chansons', emoji: '🎵', color: '#FF6B9A',
    lessons: [
      {
        id: 'l7', title: 'Répéter une note', xp: 40,
        steps: [
          { type: 'info', title: 'Le coup de langue', text: "Pour jouer deux fois la même note, coupe le souffle entre les deux en disant <b>« ta »</b> ou <b>« da »</b> dans l'harmonica.<br><br>L'app attend que tu coupes le son avant de compter la note suivante.", holes: ['4'] },
          { type: 'play', title: 'Ta ta ta', seq: ['4', '4', '4'], hold: 250 },
          { type: 'play', title: 'Da da da (aspiré)', seq: ['-4', '-4', '-4'], hold: 250 },
        ],
      },
      { id: 'l8', title: 'Au clair de la lune', xp: 50, song: 'lune' },
      { id: 'l9', title: 'Frère Jacques', xp: 50, song: 'jacques' },
      { id: 'l10', title: 'Ode à la joie', xp: 60, song: 'joie' },
      { id: 'x2', title: 'Examen : mélodies', xp: 100, exam: true, pool: ['4', '-4', '5', '-5', '6', '-6'], length: 12, melodic: true },
    ],
  },
  {
    id: 'u4', title: 'Tout l\'harmonica', emoji: '🚀', color: '#8B7CFF',
    lessons: [
      {
        id: 'l11', title: 'Les graves', xp: 50,
        steps: [
          { type: 'info', title: 'Le registre grave', text: "Trous 1 à 3 : son chaud et profond. Les notes aspirées graves demandent une aspiration <b>douce et profonde</b>, gorge ouverte (dis « ah »).<br><br>Curiosité : <span class='tabchip draw'>-2</span> et <span class='tabchip blow'>3</span> donnent la <b>même note</b> (Sol) !", holes: ['1', '-1', '2', '-2', '3', '-3'] },
          { type: 'play', title: 'Graves soufflés', seq: ['1', '2', '3'], hold: 400 },
          { type: 'play', title: 'Graves aspirés', seq: ['-1', '-2', '-3'], hold: 450 },
          { type: 'quiz', q: 'Quelle note est identique à <span class="tabchip draw">-2</span> ?', options: ['2 soufflé', '3 soufflé', '-3 aspiré'], answer: 1, explain: '-2 et 3 donnent tous les deux un Sol.' },
        ],
      },
      {
        id: 'l12', title: 'Les aigus', xp: 50,
        steps: [
          { type: 'info', title: 'Le registre aigu', text: "Trous 7 à 10 : attention, <b>c'est inversé</b> ! À partir du trou 7, la note <b>soufflée est plus aiguë</b> que l'aspirée.<br><br>Gamme aiguë : <span class='tabchip blow'>7</span> <span class='tabchip draw'>-8</span> <span class='tabchip blow'>8</span> <span class='tabchip draw'>-9</span> <span class='tabchip blow'>9</span> <span class='tabchip draw'>-10</span> <span class='tabchip blow'>10</span>", holes: ['7', '-8', '8', '-9', '9', '-10', '10'] },
          { type: 'play', title: 'Montée aiguë', seq: ['7', '-8', '8', '-9'], hold: 350 },
          { type: 'play', title: 'Tout en haut', seq: ['9', '-10', '10'], hold: 350, text: 'Souffle très doucement dans les aigus.' },
        ],
      },
      {
        id: 'l13', title: 'Souffle long', xp: 50,
        steps: [
          { type: 'info', title: 'Respire avec ton ventre', text: "Un beau son vient du <b>ventre</b>, pas des joues. Respire calmement, épaules détendues, et garde un flux d'air <b>régulier</b>.", holes: ['5'] },
          { type: 'play', title: 'Tiens 2 secondes', seq: ['5'], hold: 2000 },
          { type: 'play', title: 'Tiens 3 secondes (aspiré)', seq: ['-4'], hold: 3000 },
          { type: 'play', title: 'Notes longues', seq: ['4', '-4', '5'], hold: 1500 },
        ],
      },
      {
        id: 'l14', title: 'Le bend (niveau pro)', xp: 80,
        steps: [
          { type: 'info', title: 'Faire « pleurer » la note', text: "Le <b>bend</b> baisse la note en aspirant. C'est le son du blues ! 🎸<br><br>Aspire <span class='tabchip draw'>-4</span>, puis baisse ta langue comme si tu disais <b>« i… ou »</b>, en dirigeant l'air vers le fond de la gorge. La note doit descendre.", holes: ['-4'] },
          { type: 'play', title: 'Note de départ', seq: ['-4'], hold: 500 },
          { type: 'play', title: 'Bend du trou 4', seq: ["-4'"], hold: 400, text: 'Dis « i… ou » en aspirant. Ça vient avec de la patience !' },
          { type: 'play', title: 'Bend du trou 1', seq: ["-1'"], hold: 400 },
        ],
      },
      { id: 'l15', title: 'Oh When the Saints', xp: 60, song: 'saints' },
      { id: 'x3', title: 'Grand examen final', xp: 150, exam: true, pool: ['3', '-3', '4', '-4', '5', '-5', '6', '-6', '-7', '7', '-8', '8'], length: 16 },
    ],
  },
];

const BADGES = [
  { id: 'first_note', emoji: '🎶', name: 'Première note', desc: 'Jouer ta première note juste' },
  { id: 'lesson1', emoji: '🌱', name: 'C\'est parti', desc: 'Terminer une leçon' },
  { id: 'unit1', emoji: '🥉', name: 'Découvreur', desc: 'Finir l\'unité Découverte' },
  { id: 'exam1', emoji: '🎓', name: 'Diplômé', desc: 'Réussir un examen' },
  { id: 'all', emoji: '🏆', name: 'Maître du souffle', desc: 'Terminer tout le cours' },
  { id: 'streak3', emoji: '🔥', name: 'Régulier', desc: '3 jours d\'affilée' },
  { id: 'streak7', emoji: '☄️', name: 'Inarrêtable', desc: '7 jours d\'affilée' },
  { id: 'song', emoji: '🎤', name: 'Musicien', desc: 'Jouer un morceau entier' },
  { id: 'songs5', emoji: '📀', name: 'Répertoire', desc: 'Jouer 5 morceaux différents' },
  { id: 'hero', emoji: '⚡', name: 'Note Hero', desc: '1000 points à Note Hero' },
  { id: 'echo', emoji: '🦜', name: 'Perroquet', desc: 'Atteindre le niveau 6 à Écho' },
  { id: 'bird', emoji: '🐦', name: 'Pilote', desc: 'Passer 15 obstacles à Envol' },
  { id: 'ear', emoji: '👂', name: 'Oreille d\'or', desc: '10/10 au quiz d\'oreille' },
  { id: 'bend', emoji: '🎸', name: 'Bluesman', desc: 'Réussir ton premier bend' },
  { id: 'perfect', emoji: '💎', name: 'Sans faute', desc: '3 étoiles à un test' },
  { id: 'daily', emoji: '📅', name: 'Défi du jour', desc: 'Réussir un défi quotidien' },
  { id: 'level5', emoji: '👑', name: 'Niveau 5', desc: 'Atteindre le niveau 5' },
];

const TIPS = [
  "Souffle doucement : l'harmonica n'aime pas la force, il aime la régularité.",
  "Lèvres détendues et bien en avant sur l'harmonica = son plus clair.",
  "Joue 10 minutes par jour plutôt qu'une heure le dimanche.",
  "Si deux notes sonnent en même temps, resserre un peu ton « O ».",
  "Respire avec le ventre, pas avec les épaules.",
  "Garde l'harmonica bien droit, numéros vers le haut.",
  "Tapote ton harmonica dans ta main après avoir joué pour enlever l'humidité.",
  "Le bend vient en quelques semaines : n'abandonne pas !",
  "Écoute d'abord la mélodie avec 🔊, puis joue-la.",
];
