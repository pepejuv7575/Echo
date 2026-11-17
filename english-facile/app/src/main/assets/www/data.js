/* =========================================================
   Contenu pédagogique : leçons (unités) et scènes de mise en situation
   words   : [anglais, français, prononciation figurée]
   phrases : [anglais, français]
   ========================================================= */

window.UNITS = [
  {
    id: "greet", emoji: "👋", title: "Salutations", level: "Débutant",
    lesson: `
      <p>En anglais, on salue de façon simple. <b>Hello</b> marche partout, <b>Hi</b> est plus familier.</p>
      <p>Selon le moment de la journée :</p>
      <ul>
        <li><b>Good morning</b> : le matin (jusqu'à midi)</li>
        <li><b>Good afternoon</b> : l'après-midi</li>
        <li><b>Good evening</b> : le soir (pour saluer)</li>
        <li><b>Good night</b> : seulement pour dire <i>au revoir</i> le soir / aller dormir</li>
      </ul>
      <p class="tip">💡 Astuce : à « How are you? », on répond presque toujours « <b>I'm fine, thanks. And you?</b> »</p>`,
    words: [
      ["hello", "bonjour / salut", "hè-LO"],
      ["hi", "salut", "haï"],
      ["goodbye", "au revoir", "goud-BAÏ"],
      ["bye", "salut (au revoir)", "baï"],
      ["good morning", "bonjour (matin)", "goud MOR-ning"],
      ["good evening", "bonsoir", "goud IV-ning"],
      ["good night", "bonne nuit", "goud naït"],
      ["please", "s'il te plaît", "pliiz"],
      ["thank you", "merci", "THank you"],
      ["sorry", "désolé", "SO-ri"],
      ["yes", "oui", "yèss"],
      ["no", "non", "nô"]
    ],
    phrases: [
      ["How are you?", "Comment vas-tu ?"],
      ["I'm fine, thank you.", "Je vais bien, merci."],
      ["Nice to meet you.", "Enchanté."],
      ["See you later!", "À plus tard !"],
      ["Have a nice day!", "Bonne journée !"]
    ]
  },
  {
    id: "intro", emoji: "🙋", title: "Se présenter", level: "Débutant",
    lesson: `
      <p>Le verbe <b>to be</b> (être) est la base pour se présenter :</p>
      <ul>
        <li><b>I am</b> (I'm) = je suis</li>
        <li><b>You are</b> (you're) = tu es / vous êtes</li>
        <li><b>He is / She is</b> (he's / she's) = il est / elle est</li>
      </ul>
      <p>Pour l'âge, on utilise <b>to be</b> et non « avoir » : <b>I am 25 (years old)</b> = j'ai 25 ans.</p>
      <p class="tip">💡 « I come from France » ou « I'm from France » = je viens de France.</p>`,
    words: [
      ["name", "nom / prénom", "néïm"],
      ["I am", "je suis", "aï am"],
      ["years old", "ans (âge)", "yirz ôld"],
      ["from", "de (origine)", "from"],
      ["live", "habiter / vivre", "liv"],
      ["French", "français", "frènch"],
      ["English", "anglais", "ING-lish"],
      ["country", "pays", "KAN-tri"],
      ["city", "ville", "SI-ti"],
      ["student", "étudiant", "STIOU-dent"],
      ["job", "travail / métier", "djob"],
      ["friend", "ami", "frènd"]
    ],
    phrases: [
      ["My name is Paul.", "Je m'appelle Paul."],
      ["What is your name?", "Comment t'appelles-tu ?"],
      ["I am thirty years old.", "J'ai trente ans."],
      ["I'm from France.", "Je viens de France."],
      ["I live in Brussels.", "J'habite à Bruxelles."]
    ]
  },
  {
    id: "numbers", emoji: "🔢", title: "Les nombres", level: "Débutant",
    lesson: `
      <p>De 13 à 19, les nombres finissent par <b>-teen</b> (accent sur la fin) : thir<b>TEEN</b>, four<b>TEEN</b>…</p>
      <p>Les dizaines finissent par <b>-ty</b> (accent au début) : <b>THIR</b>ty, <b>FOR</b>ty…</p>
      <p class="tip">💡 Attention : thirteen (13) ≠ thirty (30). Écoute bien où tombe l'accent !</p>
      <p>Pour l'heure : <b>What time is it?</b> → <b>It's three o'clock</b> (il est 3 h).</p>`,
    words: [
      ["one", "un", "ouann"],
      ["two", "deux", "tou"],
      ["three", "trois", "THrii"],
      ["four", "quatre", "for"],
      ["five", "cinq", "faïv"],
      ["six", "six", "siks"],
      ["seven", "sept", "SÈ-venn"],
      ["eight", "huit", "éït"],
      ["nine", "neuf", "naïn"],
      ["ten", "dix", "tènn"],
      ["twenty", "vingt", "TOUENN-ti"],
      ["hundred", "cent", "HANN-dred"]
    ],
    phrases: [
      ["How old are you?", "Quel âge as-tu ?"],
      ["What time is it?", "Quelle heure est-il ?"],
      ["It's ten o'clock.", "Il est dix heures."],
      ["How much is it?", "Combien ça coûte ?"],
      ["It's five dollars.", "C'est cinq dollars."]
    ]
  },
  {
    id: "colors", emoji: "🎨", title: "Couleurs & objets", level: "Débutant",
    lesson: `
      <p>En anglais, l'adjectif se place <b>avant</b> le nom et ne s'accorde jamais :</p>
      <ul>
        <li>a <b>red</b> car = une voiture rouge</li>
        <li>two <b>red</b> cars = deux voitures rouges (pas de « s » à red !)</li>
      </ul>
      <p>Article : <b>a</b> devant une consonne (a book), <b>an</b> devant une voyelle (an apple).</p>`,
    words: [
      ["red", "rouge", "rèd"],
      ["blue", "bleu", "blou"],
      ["green", "vert", "griin"],
      ["yellow", "jaune", "YÈ-lo"],
      ["black", "noir", "blak"],
      ["white", "blanc", "ouaït"],
      ["book", "livre", "bouk"],
      ["phone", "téléphone", "fône"],
      ["car", "voiture", "kar"],
      ["house", "maison", "haouss"],
      ["table", "table", "TÉÏ-bel"],
      ["key", "clé", "kii"]
    ],
    phrases: [
      ["My car is blue.", "Ma voiture est bleue."],
      ["What color is it?", "De quelle couleur est-ce ?"],
      ["I have a black phone.", "J'ai un téléphone noir."],
      ["Where are my keys?", "Où sont mes clés ?"],
      ["This is an apple.", "C'est une pomme."]
    ]
  },
  {
    id: "family", emoji: "👨‍👩‍👧", title: "La famille", level: "Débutant",
    lesson: `
      <p>Pour dire « le … de quelqu'un », on utilise <b>'s</b> :</p>
      <ul><li><b>Paul's sister</b> = la sœur de Paul</li></ul>
      <p>Les possessifs : <b>my</b> (mon/ma), <b>your</b> (ton/ta), <b>his</b> (son, à lui), <b>her</b> (son, à elle), <b>our</b> (notre), <b>their</b> (leur).</p>
      <p class="tip">💡 « His mother » = la mère de lui ; « her mother » = la mère d'elle.</p>`,
    words: [
      ["mother", "mère", "MA-ZEr"],
      ["father", "père", "FA-ZEr"],
      ["sister", "sœur", "SIS-ter"],
      ["brother", "frère", "BRA-ZEr"],
      ["son", "fils", "sann"],
      ["daughter", "fille (enfant)", "DÔ-ter"],
      ["parents", "parents", "PÈ-rents"],
      ["children", "enfants", "TCHIL-dren"],
      ["husband", "mari", "HAZ-bend"],
      ["wife", "femme (épouse)", "ouaïf"],
      ["grandmother", "grand-mère", "GRAND-ma-ZEr"],
      ["baby", "bébé", "BÉÏ-bi"]
    ],
    phrases: [
      ["I have two brothers.", "J'ai deux frères."],
      ["Do you have children?", "As-tu des enfants ?"],
      ["This is my wife.", "Voici ma femme."],
      ["Her father is a doctor.", "Son père est médecin."],
      ["We are a big family.", "Nous sommes une grande famille."]
    ]
  },
  {
    id: "food", emoji: "🍔", title: "Nourriture & boissons", level: "Facile",
    lesson: `
      <p>Pour commander poliment, on dit <b>I would like</b> (I'd like) = je voudrais.</p>
      <p><b>Can I have…?</b> est aussi très courant et poli.</p>
      <p>Dénombrable / indénombrable :</p>
      <ul>
        <li><b>some</b> water, <b>some</b> bread (pas de pluriel)</li>
        <li><b>an</b> apple, <b>two</b> apples</li>
      </ul>
      <p class="tip">💡 « I'm hungry » = j'ai faim ; « I'm thirsty » = j'ai soif (on utilise « être » !).</p>`,
    words: [
      ["water", "eau", "OUÔ-ter"],
      ["bread", "pain", "brèd"],
      ["coffee", "café", "KO-fi"],
      ["tea", "thé", "tii"],
      ["milk", "lait", "milk"],
      ["apple", "pomme", "A-pel"],
      ["chicken", "poulet", "TCHI-kenn"],
      ["fish", "poisson", "fich"],
      ["cheese", "fromage", "tchiiz"],
      ["breakfast", "petit-déjeuner", "BRÈK-fest"],
      ["lunch", "déjeuner", "lannch"],
      ["dinner", "dîner", "DI-ner"]
    ],
    phrases: [
      ["I'm hungry.", "J'ai faim."],
      ["I would like a coffee, please.", "Je voudrais un café, s'il vous plaît."],
      ["Can I have the bill, please?", "L'addition, s'il vous plaît ?"],
      ["Do you like fish?", "Aimes-tu le poisson ?"],
      ["It's delicious!", "C'est délicieux !"]
    ]
  },
  {
    id: "verbs", emoji: "🏃", title: "Verbes du quotidien", level: "Facile",
    lesson: `
      <p>Au présent simple, le verbe ne change pas… sauf à <b>he / she / it</b> où on ajoute <b>-s</b> :</p>
      <ul>
        <li>I <b>work</b> → she <b>works</b></li>
        <li>I <b>go</b> → he <b>goes</b></li>
      </ul>
      <p>Négation : <b>I don't</b> work / she <b>doesn't</b> work.</p>
      <p>Question : <b>Do</b> you work? / <b>Does</b> she work?</p>
      <p class="tip">💡 Pour une action en cours : <b>I am eating</b> = je suis en train de manger.</p>`,
    words: [
      ["eat", "manger", "iit"],
      ["drink", "boire", "drink"],
      ["sleep", "dormir", "sliip"],
      ["work", "travailler", "oueurk"],
      ["go", "aller", "gô"],
      ["come", "venir", "kamm"],
      ["speak", "parler", "spiik"],
      ["read", "lire", "riid"],
      ["write", "écrire", "raït"],
      ["buy", "acheter", "baï"],
      ["want", "vouloir", "ouonnt"],
      ["understand", "comprendre", "ann-der-STAND"]
    ],
    phrases: [
      ["I speak a little English.", "Je parle un peu anglais."],
      ["I don't understand.", "Je ne comprends pas."],
      ["Can you repeat, please?", "Pouvez-vous répéter, s'il vous plaît ?"],
      ["She works in a bank.", "Elle travaille dans une banque."],
      ["What do you want to do?", "Que veux-tu faire ?"]
    ]
  },
  {
    id: "travel", emoji: "✈️", title: "Voyage & directions", level: "Intermédiaire",
    lesson: `
      <p>Pour demander son chemin : <b>Excuse me, where is…?</b> ou <b>How can I get to…?</b></p>
      <ul>
        <li><b>Turn left / right</b> = tournez à gauche / droite</li>
        <li><b>Go straight on</b> = allez tout droit</li>
        <li><b>It's next to…</b> = c'est à côté de…</li>
        <li><b>It's opposite…</b> = c'est en face de…</li>
      </ul>
      <p class="tip">💡 « Excuse me » pour attirer l'attention, « Sorry » pour s'excuser après une gêne.</p>`,
    words: [
      ["airport", "aéroport", "ÈR-port"],
      ["train station", "gare", "tréïn STÉÏ-chenn"],
      ["ticket", "billet", "TI-ket"],
      ["passport", "passeport", "PASS-port"],
      ["luggage", "bagages", "LA-guidj"],
      ["hotel", "hôtel", "ho-TÈL"],
      ["left", "gauche", "lèft"],
      ["right", "droite", "raït"],
      ["street", "rue", "striit"],
      ["map", "carte / plan", "map"],
      ["far", "loin", "far"],
      ["near", "près", "nir"]
    ],
    phrases: [
      ["Excuse me, where is the station?", "Excusez-moi, où est la gare ?"],
      ["Turn left at the end of the street.", "Tournez à gauche au bout de la rue."],
      ["Is it far from here?", "Est-ce loin d'ici ?"],
      ["A ticket to London, please.", "Un billet pour Londres, s'il vous plaît."],
      ["I have a reservation.", "J'ai une réservation."]
    ]
  },
  {
    id: "shopping", emoji: "🛍️", title: "Shopping", level: "Intermédiaire",
    lesson: `
      <p>Phrases clés au magasin :</p>
      <ul>
        <li><b>How much is this?</b> = combien coûte ceci ?</li>
        <li><b>Can I try it on?</b> = je peux l'essayer ?</li>
        <li><b>Do you have it in a bigger size?</b> = vous l'avez en plus grand ?</li>
      </ul>
      <p>Comparatif : adjectif court + <b>-er</b> (cheaper, bigger), adjectif long + <b>more</b> (more expensive).</p>`,
    words: [
      ["shop", "magasin", "chop"],
      ["price", "prix", "praïss"],
      ["cheap", "pas cher", "tchiip"],
      ["expensive", "cher", "ix-PÈN-siv"],
      ["size", "taille", "saïz"],
      ["shirt", "chemise", "cheurt"],
      ["shoes", "chaussures", "chouz"],
      ["money", "argent", "MA-ni"],
      ["card", "carte (bancaire)", "kard"],
      ["cash", "espèces", "kach"],
      ["big", "grand", "big"],
      ["small", "petit", "smôl"]
    ],
    phrases: [
      ["How much is this shirt?", "Combien coûte cette chemise ?"],
      ["Can I try it on?", "Je peux l'essayer ?"],
      ["It's too expensive.", "C'est trop cher."],
      ["Can I pay by card?", "Je peux payer par carte ?"],
      ["I'm just looking, thanks.", "Je regarde seulement, merci."]
    ]
  },
  {
    id: "time", emoji: "📅", title: "Jours, temps & météo", level: "Intermédiaire",
    lesson: `
      <p>Les jours et les mois prennent toujours une <b>majuscule</b> : Monday, January.</p>
      <p>Prépositions : <b>on</b> Monday (un jour), <b>in</b> July (un mois), <b>at</b> 8 o'clock (une heure).</p>
      <p>La météo : <b>It's sunny / rainy / cold / hot</b>.</p>
      <p class="tip">💡 « What's the weather like? » = quel temps fait-il ?</p>`,
    words: [
      ["Monday", "lundi", "MANN-déï"],
      ["Friday", "vendredi", "FRAÏ-déï"],
      ["Sunday", "dimanche", "SANN-déï"],
      ["today", "aujourd'hui", "tou-DÉÏ"],
      ["tomorrow", "demain", "tou-MO-rô"],
      ["yesterday", "hier", "YÈS-ter-déï"],
      ["week", "semaine", "ouiik"],
      ["weather", "météo / temps", "OUÈ-ZEr"],
      ["sunny", "ensoleillé", "SA-ni"],
      ["rain", "pluie", "réïn"],
      ["cold", "froid", "kôld"],
      ["hot", "chaud", "hot"]
    ],
    phrases: [
      ["What day is it today?", "Quel jour sommes-nous ?"],
      ["See you on Monday!", "À lundi !"],
      ["What's the weather like?", "Quel temps fait-il ?"],
      ["It's cold and rainy.", "Il fait froid et il pleut."],
      ["I was at home yesterday.", "J'étais à la maison hier."]
    ]
  },
  {
    id: "work", emoji: "💼", title: "Le travail", level: "Avancé",
    lesson: `
      <p>Pour parler de son métier : <b>I work as a…</b> / <b>I'm a…</b> (I'm a teacher).</p>
      <p>Le passé simple (prétérit) : verbes réguliers en <b>-ed</b> (worked, called). Beaucoup d'irréguliers : go → <b>went</b>, have → <b>had</b>, do → <b>did</b>.</p>
      <p>Question au passé : <b>Did</b> you finish? → Yes, I <b>did</b>.</p>
      <p class="tip">💡 Le « present perfect » : <b>I have worked here for 3 years</b> = je travaille ici depuis 3 ans.</p>`,
    words: [
      ["office", "bureau", "O-fiss"],
      ["meeting", "réunion", "MII-ting"],
      ["boss", "patron", "boss"],
      ["colleague", "collègue", "KO-liig"],
      ["email", "e-mail", "II-méïl"],
      ["salary", "salaire", "SA-le-ri"],
      ["interview", "entretien", "IN-ter-viou"],
      ["skills", "compétences", "skilz"],
      ["experience", "expérience", "ix-PI-ri-enss"],
      ["company", "entreprise", "KAMM-pe-ni"],
      ["deadline", "date limite", "DÈD-laïn"],
      ["busy", "occupé", "BI-zi"]
    ],
    phrases: [
      ["I work as a nurse.", "Je travaille comme infirmier."],
      ["I have a meeting at ten.", "J'ai une réunion à dix heures."],
      ["I'll send you an email.", "Je vous enverrai un e-mail."],
      ["I have worked here for three years.", "Je travaille ici depuis trois ans."],
      ["Could you help me with this?", "Pourriez-vous m'aider avec ceci ?"]
    ]
  },
  {
    id: "health", emoji: "🩺", title: "Santé & urgences", level: "Avancé",
    lesson: `
      <p>Pour dire où on a mal : <b>I have a headache</b> (mal à la tête), <b>My back hurts</b> (j'ai mal au dos).</p>
      <p>Les conseils avec <b>should</b> : <b>You should rest</b> = tu devrais te reposer.</p>
      <p>Urgences : <b>Help!</b> / <b>Call an ambulance!</b> / <b>I need a doctor.</b></p>
      <p class="tip">💡 « I feel sick » = je me sens mal / j'ai la nausée.</p>`,
    words: [
      ["doctor", "médecin", "DOK-ter"],
      ["hospital", "hôpital", "HOS-pi-tel"],
      ["pharmacy", "pharmacie", "FAR-me-si"],
      ["medicine", "médicament", "MÈD-sinn"],
      ["pain", "douleur", "péïn"],
      ["headache", "mal de tête", "HÈD-éïk"],
      ["fever", "fièvre", "FII-ver"],
      ["sick", "malade", "sik"],
      ["tired", "fatigué", "TAÏ-erd"],
      ["help", "aide / à l'aide", "hèlp"],
      ["head", "tête", "hèd"],
      ["stomach", "ventre / estomac", "STA-mek"]
    ],
    phrases: [
      ["I need a doctor.", "J'ai besoin d'un médecin."],
      ["I have a headache.", "J'ai mal à la tête."],
      ["Where is the nearest pharmacy?", "Où est la pharmacie la plus proche ?"],
      ["You should drink water.", "Tu devrais boire de l'eau."],
      ["Call an ambulance, please!", "Appelez une ambulance, s'il vous plaît !"]
    ]
  }
];

/* ---------------- Scènes animées de mise en situation ---------------- */
window.SCENES = [
  {
    id: "cafe", emoji: "☕", title: "Au café", place: "Coffee shop · Londres",
    bg: "linear-gradient(180deg,#FDE68A 0%,#F59E0B 60%,#92400E 100%)",
    props: "☕🥐🧁",
    chars: [
      { name: "Barista", emoji: "🧑‍🍳", pitch: 1.15, voice: "female" },
      { name: "Toi", emoji: "🙂", pitch: 0.9, voice: "male" }
    ],
    lines: [
      [0, "Hi! What can I get you?", "Salut ! Qu'est-ce que je vous sers ?"],
      [1, "Hello! Can I have a cappuccino, please?", "Bonjour ! Je peux avoir un cappuccino, s'il vous plaît ?"],
      [0, "Sure. Small, medium or large?", "Bien sûr. Petit, moyen ou grand ?"],
      [1, "Medium, please.", "Moyen, s'il vous plaît."],
      [0, "Anything else?", "Autre chose ?"],
      [1, "Yes, a croissant, please.", "Oui, un croissant, s'il vous plaît."],
      [0, "For here or to go?", "Sur place ou à emporter ?"],
      [1, "To go, please. How much is it?", "À emporter, s'il vous plaît. Combien ça fait ?"],
      [0, "That's six pounds fifty.", "Ça fait six livres cinquante."],
      [1, "Here you are. Thank you!", "Voilà. Merci !"]
    ],
    video: "english conversation ordering coffee for beginners"
  },
  {
    id: "airport", emoji: "🛫", title: "À l'aéroport", place: "Check-in · Heathrow",
    bg: "linear-gradient(180deg,#BAE6FD 0%,#60A5FA 60%,#1E3A8A 100%)",
    props: "✈️🧳🛂",
    chars: [
      { name: "Agent", emoji: "👩‍✈️", pitch: 1.1, voice: "female" },
      { name: "Toi", emoji: "🙂", pitch: 0.9, voice: "male" }
    ],
    lines: [
      [0, "Good morning. Can I see your passport, please?", "Bonjour. Puis-je voir votre passeport, s'il vous plaît ?"],
      [1, "Good morning. Here it is.", "Bonjour. Le voici."],
      [0, "Where are you flying to today?", "Où allez-vous aujourd'hui ?"],
      [1, "I'm flying to New York.", "Je vais à New York."],
      [0, "How many bags are you checking in?", "Combien de bagages enregistrez-vous ?"],
      [1, "Just one suitcase.", "Juste une valise."],
      [0, "Would you like a window or an aisle seat?", "Vous préférez une place côté hublot ou couloir ?"],
      [1, "A window seat, please.", "Côté hublot, s'il vous plaît."],
      [0, "Here is your boarding pass. Gate twelve.", "Voici votre carte d'embarquement. Porte douze."],
      [1, "Thank you very much!", "Merci beaucoup !"]
    ],
    video: "english conversation at the airport check in"
  },
  {
    id: "hotel", emoji: "🏨", title: "À l'hôtel", place: "Réception · Hôtel",
    bg: "linear-gradient(180deg,#E9D5FF 0%,#A78BFA 60%,#4C1D95 100%)",
    props: "🛎️🔑🛏️",
    chars: [
      { name: "Réceptionniste", emoji: "🧑‍💼", pitch: 1.0, voice: "male" },
      { name: "Toi", emoji: "🙂", pitch: 1.2, voice: "female" }
    ],
    lines: [
      [0, "Good evening! Welcome to the Grand Hotel.", "Bonsoir ! Bienvenue au Grand Hôtel."],
      [1, "Good evening. I have a reservation.", "Bonsoir. J'ai une réservation."],
      [0, "What name is it under?", "À quel nom ?"],
      [1, "It's under the name Martin.", "Au nom de Martin."],
      [0, "Yes, a double room for three nights.", "Oui, une chambre double pour trois nuits."],
      [1, "That's right. What time is breakfast?", "C'est ça. À quelle heure est le petit-déjeuner ?"],
      [0, "Breakfast is from seven to ten.", "Le petit-déjeuner est de sept à dix heures."],
      [1, "Is there Wi-Fi in the room?", "Y a-t-il le Wi-Fi dans la chambre ?"],
      [0, "Yes, it's free. Here is your key. Room two oh five.", "Oui, c'est gratuit. Voici votre clé. Chambre 205."],
      [1, "Great, thank you!", "Super, merci !"]
    ],
    video: "english conversation hotel check in"
  },
  {
    id: "directions", emoji: "🗺️", title: "Demander son chemin", place: "Dans la rue · New York",
    bg: "linear-gradient(180deg,#BBF7D0 0%,#34D399 60%,#065F46 100%)",
    props: "🚕🏙️🚦",
    chars: [
      { name: "Toi", emoji: "🙂", pitch: 0.9, voice: "male" },
      { name: "Passante", emoji: "👩", pitch: 1.2, voice: "female" }
    ],
    lines: [
      [0, "Excuse me, can you help me?", "Excusez-moi, pouvez-vous m'aider ?"],
      [1, "Of course. What are you looking for?", "Bien sûr. Que cherchez-vous ?"],
      [0, "Where is the train station, please?", "Où est la gare, s'il vous plaît ?"],
      [1, "Go straight on and turn left at the bank.", "Allez tout droit et tournez à gauche à la banque."],
      [0, "Is it far from here?", "Est-ce loin d'ici ?"],
      [1, "No, it's about five minutes on foot.", "Non, c'est à environ cinq minutes à pied."],
      [0, "So, straight on, then left at the bank?", "Donc, tout droit, puis à gauche à la banque ?"],
      [1, "Exactly. The station is opposite the park.", "Exactement. La gare est en face du parc."],
      [0, "Thank you so much!", "Merci beaucoup !"],
      [1, "You're welcome. Have a nice day!", "De rien. Bonne journée !"]
    ],
    video: "english conversation asking for directions"
  },
  {
    id: "restaurant", emoji: "🍽️", title: "Au restaurant", place: "Restaurant · Dublin",
    bg: "linear-gradient(180deg,#FECACA 0%,#F87171 60%,#7F1D1D 100%)",
    props: "🍝🍷🕯️",
    chars: [
      { name: "Serveur", emoji: "🤵", pitch: 0.95, voice: "male" },
      { name: "Toi", emoji: "🙂", pitch: 1.2, voice: "female" }
    ],
    lines: [
      [0, "Good evening. A table for how many?", "Bonsoir. Une table pour combien ?"],
      [1, "A table for two, please.", "Une table pour deux, s'il vous plaît."],
      [0, "Here is the menu. Can I get you something to drink?", "Voici la carte. Je vous sers quelque chose à boire ?"],
      [1, "Two glasses of water, please.", "Deux verres d'eau, s'il vous plaît."],
      [0, "Are you ready to order?", "Êtes-vous prêts à commander ?"],
      [1, "Yes. I would like the chicken with vegetables.", "Oui. Je voudrais le poulet aux légumes."],
      [0, "Excellent choice. Anything for dessert?", "Excellent choix. Un dessert ?"],
      [1, "No, thank you. Can we have the bill, please?", "Non, merci. Pouvons-nous avoir l'addition ?"],
      [0, "Of course. Do you want to pay by card?", "Bien sûr. Vous voulez payer par carte ?"],
      [1, "Yes, please. It was delicious!", "Oui, s'il vous plaît. C'était délicieux !"]
    ],
    video: "english conversation at a restaurant ordering food"
  },
  {
    id: "shop", emoji: "👕", title: "Magasin de vêtements", place: "Boutique · Manchester",
    bg: "linear-gradient(180deg,#FBCFE8 0%,#F472B6 60%,#831843 100%)",
    props: "👗👟🛍️",
    chars: [
      { name: "Vendeuse", emoji: "👩‍💼", pitch: 1.2, voice: "female" },
      { name: "Toi", emoji: "🙂", pitch: 0.9, voice: "male" }
    ],
    lines: [
      [0, "Hello! Can I help you?", "Bonjour ! Je peux vous aider ?"],
      [1, "Yes, I'm looking for a jacket.", "Oui, je cherche une veste."],
      [0, "What size are you?", "Quelle est votre taille ?"],
      [1, "Medium, I think.", "Medium, je pense."],
      [0, "How about this blue one?", "Que pensez-vous de celle-ci, en bleu ?"],
      [1, "I like it. Can I try it on?", "Elle me plaît. Je peux l'essayer ?"],
      [0, "Sure, the fitting rooms are over there.", "Bien sûr, les cabines sont là-bas."],
      [1, "It's a bit small. Do you have a large?", "Elle est un peu petite. Vous avez un large ?"],
      [0, "Yes, here you are. It's forty pounds.", "Oui, voilà. C'est quarante livres."],
      [1, "Perfect, I'll take it!", "Parfait, je la prends !"]
    ],
    video: "english conversation shopping for clothes"
  },
  {
    id: "doctor", emoji: "🩺", title: "Chez le médecin", place: "Cabinet médical",
    bg: "linear-gradient(180deg,#CFFAFE 0%,#22D3EE 60%,#155E75 100%)",
    props: "💊🩹🌡️",
    chars: [
      { name: "Docteur", emoji: "👨‍⚕️", pitch: 0.9, voice: "male" },
      { name: "Toi", emoji: "🙂", pitch: 1.2, voice: "female" }
    ],
    lines: [
      [0, "Hello, what seems to be the problem?", "Bonjour, quel est le problème ?"],
      [1, "I don't feel well. I have a headache.", "Je ne me sens pas bien. J'ai mal à la tête."],
      [0, "How long have you had it?", "Depuis combien de temps ?"],
      [1, "Since yesterday morning.", "Depuis hier matin."],
      [0, "Do you have a fever?", "Avez-vous de la fièvre ?"],
      [1, "Yes, a little. And I'm very tired.", "Oui, un peu. Et je suis très fatiguée."],
      [0, "I think it's the flu. You should rest at home.", "Je pense que c'est la grippe. Vous devriez vous reposer à la maison."],
      [1, "Do I need any medicine?", "Ai-je besoin de médicaments ?"],
      [0, "Take this twice a day and drink lots of water.", "Prenez ceci deux fois par jour et buvez beaucoup d'eau."],
      [1, "Thank you, doctor.", "Merci, docteur."]
    ],
    video: "english conversation at the doctor"
  },
  {
    id: "interview", emoji: "🤝", title: "Entretien d'embauche", place: "Bureau · Entreprise",
    bg: "linear-gradient(180deg,#E2E8F0 0%,#94A3B8 60%,#1E293B 100%)",
    props: "💼📄☕",
    chars: [
      { name: "Recruteuse", emoji: "👩‍💼", pitch: 1.1, voice: "female" },
      { name: "Toi", emoji: "🙂", pitch: 0.9, voice: "male" }
    ],
    lines: [
      [0, "Thank you for coming. Please, sit down.", "Merci d'être venu. Asseyez-vous, je vous prie."],
      [1, "Thank you for having me.", "Merci de me recevoir."],
      [0, "Can you tell me a little about yourself?", "Pouvez-vous me parler un peu de vous ?"],
      [1, "I'm a sales manager and I have five years of experience.", "Je suis responsable commercial et j'ai cinq ans d'expérience."],
      [0, "Why do you want to work for our company?", "Pourquoi voulez-vous travailler pour notre entreprise ?"],
      [1, "I like your products and I want new challenges.", "J'aime vos produits et je veux de nouveaux défis."],
      [0, "What are your main strengths?", "Quelles sont vos principales qualités ?"],
      [1, "I'm organized, and I work well in a team.", "Je suis organisé et je travaille bien en équipe."],
      [0, "Great. Do you have any questions for me?", "Très bien. Avez-vous des questions ?"],
      [1, "Yes. When can I expect an answer?", "Oui. Quand puis-je espérer une réponse ?"]
    ],
    video: "english job interview conversation practice"
  }
];
