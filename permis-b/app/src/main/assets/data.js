// ===== Données Permis B Belgique =====
const THEMES={
gen:["📘","Règles générales"],
sig:["🚸","Signalisation & marquages"],
vit:["⏱️","Vitesse"],
prio:["🔀","Priorités"],
dep:["↔️","Dépassement & croisement"],
stat:["🅿️","Arrêt & stationnement"],
auto:["🛣️","Autoroute"],
feux:["💡","Feux & signaux lumineux"],
alc:["🍺","Alcool, drogues, GSM"],
secu:["🛡️","Sécurité & enfants"],
vuln:["🚶","Piétons, cyclistes & zones"],
veh:["🚗","Véhicule & documents"],
acc:["🚑","Accident & premiers secours"],
dist:["📏","Distances & freinage"],
eco:["🌱","Éco-conduite & mécanique"],
perm:["🎓","Permis & examens"]
};

// [nom, forme, symbole, explication]
const SG={
A1a:["Virage dangereux à gauche","tri","curveL","Annonce un virage dangereux vers la gauche. Hors agglomération, les panneaux de danger sont placés à environ 150 m du danger."],
A1b:["Virage dangereux à droite","tri","curveR","Annonce un virage dangereux vers la droite."],
A7:["Rétrécissement de la chaussée","tri","narrow","La chaussée devient plus étroite : ralentir, serrer à droite, attention aux croisements."],
A15:["Chaussée glissante","tri","slip","Risque de dérapage : réduire la vitesse, éviter les freinages et coups de volant brusques."],
A17:["Signaux lumineux (feux)","tri","lights","Annonce un carrefour ou un passage réglé par des feux."],
A21:["Passage pour piétons","tri","ped","Annonce un passage pour piétons : ralentir et être prêt à céder le passage."],
A23:["Endroit fréquenté par des enfants","tri","kids","Écoles, plaines de jeux : enfants imprévisibles, ralentir."],
A31:["Travaux","tri","works","Zone de travaux : ralentir, ouvriers et obstacles possibles."],
A51:["Danger (autre)","tri","t:!","Danger non prévu par un autre panneau ; un panonceau précise souvent la nature du danger."],
B1:["Cédez le passage","b1","","Je dois céder le passage aux usagers circulant sur la voie que j'aborde, dans les deux sens."],
B5:["Stop","stop","","Arrêt complet obligatoire à la ligne d'arrêt (ou à l'endroit d'où l'on voit), puis céder le passage dans les deux sens."],
B9:["Route prioritaire","b9","","J'ai la priorité à toutes les intersections de cette route jusqu'au panneau B11."],
B11:["Fin de route prioritaire","b11","","La priorité ne s'applique plus : on revient aux règles générales (priorité de droite) ou à la signalisation."],
B15:["Priorité à la prochaine intersection","tri","b15","J'ai la priorité uniquement à la prochaine intersection."],
B17:["Priorité de droite à la prochaine intersection","tri","b17","À la prochaine intersection, je dois céder le passage à ceux qui viennent de ma droite."],
B19:["Cédez le passage aux conducteurs venant en sens inverse","rr","b19","Passage étroit : je dois laisser passer ceux qui viennent en face."],
B21:["Priorité par rapport aux conducteurs venant en sens inverse","sq","b21","Passage étroit : j'ai la priorité sur ceux qui viennent en face (avec prudence)."],
C1:["Sens interdit","c1","","Accès interdit dans ce sens à tout conducteur (sauf exception indiquée par panonceau, ex. cyclistes)."],
C3:["Accès interdit dans les deux sens","rr","","Accès interdit, dans les deux sens, à tout conducteur."],
C31a:["Interdiction de tourner à gauche","rr","noleft","Interdit de tourner à gauche à la prochaine intersection."],
C33:["Interdiction de faire demi-tour","rr","uturn","Demi-tour interdit jusqu'à la prochaine intersection incluse."],
C35:["Interdiction de dépasser","rr","cars","Interdit de dépasser par la gauche un véhicule à plus de deux roues (on peut dépasser motos, vélos, cyclomoteurs à deux roues)."],
C43:["Limitation de vitesse","rr","t:50","Interdiction de dépasser la vitesse indiquée."],
C45:["Fin de limitation de vitesse","c45","t:50","Fin de la limitation : la vitesse générale de l'endroit s'applique à nouveau."],
D1:["Direction obligatoire","rb","up","Obligation de suivre la direction indiquée par la flèche."],
D5:["Carrefour giratoire","rb","round","Obligation de tourner dans le sens des flèches. Combiné avec B1 : céder le passage aux usagers sur l'anneau."],
D7:["Piste cyclable obligatoire","rb","bike","Piste réservée aux cyclistes (et speed pedelecs, trottinettes…) ; interdite aux voitures."],
E1:["Stationnement interdit","e1","","Stationnement interdit du côté où se trouve le panneau ; l'arrêt reste permis."],
E3:["Arrêt et stationnement interdits","e3","","Interdiction de s'arrêter et de stationner du côté du panneau."],
E9a:["Stationnement autorisé (parking)","sq","t:P","Parking autorisé. Des panonceaux peuvent limiter (disque, payant, véhicules…)."],
F1:["Début d'agglomération","f1","t:NAMUR","Début d'agglomération : en Wallonie 50 km/h, à Bruxelles 30 km/h, sauf signalisation contraire."],
F3:["Fin d'agglomération","f3","t:NAMUR","Fin d'agglomération : vitesse hors agglomération (Wallonie/Bruxelles 90, Flandre 70)."],
F4a:["Début de zone 30","zone","","Vitesse limitée à 30 km/h dans toute la zone jusqu'au panneau F4b."],
F5:["Autoroute","sq","highway","Début d'autoroute : 120 km/h maximum, 70 km/h minimum, piétons, cyclistes et cyclomoteurs interdits."],
F9:["Route pour automobiles","sq","car","Route réservée aux véhicules automobiles ; règles proches de l'autoroute."],
F12a:["Zone résidentielle / de rencontre","sq","house","20 km/h ; piétons sur toute la largeur, jeux autorisés ; stationnement uniquement aux emplacements marqués."],
F19:["Voie à sens unique","sq","up","Circulation autorisée dans un seul sens (cyclistes parfois autorisés en sens inverse)."],
F45:["Voie sans issue","sq","dead","Impasse : pas de sortie au bout de la rue."],
F49:["Passage pour piétons","sq","pedtri","Indique l'emplacement d'un passage pour piétons."],
F111:["Rue cyclable","sq","bike","Les cyclistes peuvent utiliser toute la largeur ; 30 km/h maximum ; interdit de dépasser les cyclistes."]
};

// ===== COURS =====
const CH=[
{id:"gen",t:"Règles générales & définitions",h:`
<h3>Définitions essentielles</h3>
<ul><li><b>Voie publique</b> : toute la route, trottoirs et accotements compris.</li>
<li><b>Chaussée</b> : partie aménagée pour les véhicules (sans trottoirs ni pistes cyclables).</li>
<li><b>Bande de circulation</b> : subdivision de la chaussée, assez large pour une file de véhicules.</li>
<li><b>Agglomération</b> : commence au panneau {{F1}} et se termine au panneau {{F3}}. C'est le panneau qui compte, pas les maisons.</li>
<li><b>Arrêt</b> : immobilisation le temps nécessaire pour embarquer/débarquer des personnes ou des choses. Au-delà, c'est du <b>stationnement</b>.</li></ul>
<h3>Hiérarchie des règles</h3>
<ol><li>Injonctions des <b>agents qualifiés</b> (police…)</li><li><b>Signaux lumineux</b> (feux)</li><li><b>Panneaux</b> et marquages</li><li><b>Règles générales</b> du code</li></ol>
<div class="tip">Un agent bras levé verticalement = arrêt pour tous, sauf ceux déjà engagés dans le carrefour. Un agent qui vous fait face ou vous tourne le dos, bras tendus horizontalement = vous devez vous arrêter.</div>
<h3>Position sur la chaussée</h3>
<ul><li>Rouler <b>à droite</b>, aussi près que possible du bord droit.</li>
<li>Sur plusieurs bandes : utiliser la <b>bande de droite</b> ; les autres servent à dépasser. En circulation dense, on peut rester dans sa file.</li>
<li><b>Tirette</b> : quand une bande se termine en trafic dense, on s'insère alternativement juste avant le rétrécissement.</li></ul>
<h3>Manœuvres</h3>
<ul><li>Celui qui manœuvre (démarrer, changer de bande, faire demi-tour, marche arrière, sortir d'un parking) <b>cède le passage</b> à tous les autres.</li>
<li>Clignotant <b>avant</b> la manœuvre, suffisamment tôt.</li>
<li>Marche arrière : courte, sans danger ; <b>jamais sur autoroute</b>.</li>
<li>Klaxon : seulement pour éviter un accident (et hors agglomération, pour avertir qu'on va dépasser).</li></ul>`},
{id:"sig",t:"Signalisation & marquages",h:`
<h3>Les familles de panneaux</h3>
<ul><li><b>A – Danger</b> (triangle rouge) {{A1a}} {{A23}} : à ~150 m du danger hors agglomération.</li>
<li><b>B – Priorité</b> {{B1}} {{B5}} {{B9}} {{B11}} {{B15}} {{B17}}</li>
<li><b>C – Interdiction</b> (rond, bord rouge) {{C1}} {{C43}} {{C35}}</li>
<li><b>D – Obligation</b> (rond bleu) {{D1}} {{D5}} {{D7}}</li>
<li><b>E – Arrêt et stationnement</b> {{E1}} {{E3}} {{E9a}}</li>
<li><b>F – Indication</b> (carré/rectangle) {{F4a}} {{F5}} {{F12a}}</li></ul>
<p>Le catalogue complet est dans l'onglet <b>Panneaux</b>.</p>
<h3>Marquages au sol</h3>
<ul><li><b>Ligne blanche continue</b> : interdiction de la franchir et de la chevaucher.</li>
<li><b>Ligne discontinue</b> : peut être franchie (dépassement si autorisé).</li>
<li><b>Flèches de rabattement</b> : annoncent une ligne continue, il faut se rabattre.</li>
<li><b>Ligne blanche double</b> (continue + discontinue) : on suit la ligne la plus proche de soi.</li>
<li><b>Ligne d'arrêt</b> (large, continue) : stop ou feu. <b>Dents de requin / ligne de triangles</b> : cédez le passage.</li>
<li><b>Zone d'évitement</b> (hachures blanches) : interdit d'y circuler et de s'y arrêter.</li>
<li><b>Ligne jaune discontinue</b> au bord : stationnement interdit. <b>Ligne jaune continue</b> : arrêt et stationnement interdits.</li>
<li><b>Sas vélo</b> : zone devant le feu réservée aux cyclistes ; la voiture s'arrête à la première ligne.</li></ul>`},
{id:"vit",t:"Vitesse",h:`
<table><tr><th>Lieu</th><th>Wallonie</th><th>Bruxelles</th><th>Flandre</th></tr>
<tr><td>Agglomération</td><td>50</td><td>30</td><td>50</td></tr>
<tr><td>Hors agglomération</td><td>90</td><td>70/90*</td><td>70</td></tr>
<tr><td>2×2 bandes avec berme centrale</td><td>120</td><td>—</td><td>70–90**</td></tr>
<tr><td>Autoroute</td><td>120 (min 70)</td><td>120</td><td>120</td></tr>
<tr><td>Zone 30 / rue cyclable</td><td>30</td><td>30</td><td>30</td></tr>
<tr><td>Zone résidentielle / de rencontre</td><td>20</td><td>20</td><td>20</td></tr></table>
<p class="small">* Bruxelles : la plupart des routes hors agglomération sont signalées. ** selon signalisation. Toujours vérifier les panneaux !</p>
<div class="tip">La vitesse maximale n'est pas une vitesse conseillée : il faut toujours pouvoir s'arrêter devant un obstacle prévisible (brouillard, pluie, virage, enfants, nuit…).</div>
<p>La limitation {{C43}} prend fin au panneau {{C45}}, à un panneau de vitesse différent, ou à l'entrée/sortie d'agglomération.</p>`},
{id:"prio",t:"Priorités",h:`
<h3>Règle de base : priorité de droite</h3>
<p>Sans signalisation, je cède le passage à celui qui vient de <b>ma droite</b>.</p>
<h3>Exceptions</h3>
<ul><li>Panneaux {{B1}} {{B5}} : je cède le passage dans les deux sens.</li>
<li>Route prioritaire {{B9}} jusqu'à {{B11}} ; priorité ponctuelle {{B15}}.</li>
<li>Celui qui sort d'un <b>chemin de terre</b>, d'un sentier, d'un parking ou d'une propriété cède à tous.</li>
<li>Le <b>tram</b> a la priorité, même venant de gauche, sauf signalisation contraire.</li>
<li><b>Véhicules prioritaires</b> (feux bleus + sirène) : libérer le passage, s'arrêter si nécessaire.</li>
<li>En agglomération, laisser le <b>bus</b> quitter son arrêt quand il met son clignotant.</li></ul>
<h3>Changement de direction</h3>
<ul><li>Tourner à gauche : céder à ceux qui viennent en face.</li>
<li>Tourner (gauche ou droite) : céder aux piétons et cyclistes qui vont tout droit ou traversent la rue où je m'engage.</li></ul>
<h3>Giratoire {{D5}}</h3>
<ul><li>Avec {{B1}} : je cède à ceux qui sont déjà sur l'anneau.</li>
<li>Clignotant <b>à droite pour sortir</b> (obligatoire) ; pas obligatoire en entrant.</li></ul>
<div class="tip">Feux éteints ou orange clignotant : ce sont les panneaux qui s'appliquent ; sans panneau, la priorité de droite.</div>`},
{id:"dep",t:"Dépassement & croisement",h:`
<h3>Dépasser</h3>
<ul><li>Par la <b>gauche</b> en règle générale.</li>
<li>Par la <b>droite</b> : un véhicule qui tourne à gauche et s'est placé à gauche ; un <b>tram</b> (si la place le permet).</li>
<li>Avant : rétro, angle mort, clignotant, espace suffisant, visibilité suffisante.</li>
<li>Cycliste : distance latérale d'au moins <b>1 m en agglomération</b> et <b>1,5 m hors agglomération</b>.</li></ul>
<h3>Interdit de dépasser</h3>
<ul><li>À l'approche d'un <b>sommet de côte</b> ou d'un <b>virage</b> sans visibilité suffisante.</li>
<li>Aux <b>intersections</b>, sauf : sur route prioritaire, carrefour réglé par feux/agent, ou dépassement d'un deux-roues.</li>
<li>À l'approche d'un <b>passage à niveau</b> sans barrières.</li>
<li>Avec le panneau {{C35}} ou si une ligne continue doit être franchie.</li>
<li>Dans une rue cyclable {{F111}} : on ne dépasse pas les cyclistes.</li></ul>
<h3>Être dépassé</h3><p>Serrer à droite, ne pas accélérer.</p>
<h3>Croiser</h3>
<ul><li>Laisser une distance latérale suffisante.</li>
<li>Obstacle de <b>mon côté</b> : je laisse passer ceux qui viennent en face.</li>
<li>Passages étroits : {{B19}} je cède, {{B21}} j'ai la priorité.</li></ul>`},
{id:"stat",t:"Arrêt & stationnement",h:`
<ul><li>S'arrêter/stationner à <b>droite</b> dans le sens de circulation ; dans une voie à <b>sens unique</b> : des deux côtés.</li>
<li>Hors agglomération, de préférence sur l'accotement.</li></ul>
<h3>Arrêt ET stationnement interdits</h3>
<ul><li>Sur les trottoirs (sauf signalisation), pistes cyclables, passages pour piétons et cyclistes, et à <b>moins de 5 m</b> en deçà.</li>
<li>Aux carrefours et à moins de 5 m de la chaussée transversale.</li>
<li>Sur les passages à niveau, dans les tunnels, sur l'autoroute.</li>
<li>Quand une ligne jaune continue borde la chaussée, ou avec {{E3}}.</li></ul>
<h3>Stationnement interdit</h3>
<ul><li>À moins de <b>15 m</b> de part et d'autre d'un arrêt de bus ou de tram.</li>
<li>Devant les entrées carrossables (sauf pour le véhicule dont la plaque est affichée sur l'accès).</li>
<li>En double file ; quand une ligne jaune discontinue borde la chaussée ; avec {{E1}}.</li>
<li>Sur les emplacements réservés aux personnes handicapées sans carte.</li></ul>
<h3>Zone bleue</h3><p>Disque de stationnement obligatoire, <b>2 heures</b> maximum, du lundi au samedi de 9h à 18h (sauf indication contraire).</p>
<div class="tip">Avant d'ouvrir la portière : rétroviseur + regard par-dessus l'épaule (technique de la main opposée) pour ne pas faucher un cycliste.</div>`},
{id:"auto",t:"Autoroute",h:`
<ul><li>{{F5}} Vitesse max <b>120 km/h</b>, minimum <b>70 km/h</b> (si conditions normales).</li>
<li>Interdits : piétons, cyclistes, cyclomoteurs, véhicules agricoles…</li>
<li>Entrée : utiliser la bande d'accélération et <b>céder le passage</b> à ceux qui roulent sur l'autoroute.</li>
<li>Utiliser la bande de droite ; bandes de gauche pour dépasser.</li>
<li><b>Strictement interdits</b> : marche arrière, demi-tour, traverser la berme, s'arrêter sur la bande d'arrêt d'urgence sans nécessité.</li>
<li>Sortie ratée : continuer jusqu'à la suivante.</li>
<li>Camions &gt; 7,5 t : au moins 50 m entre eux.</li>
<li>Bouchon : feux de détresse pour avertir les suivants.</li></ul>
<h3>Panne sur autoroute</h3>
<ol><li>Se ranger le plus à droite possible (bande d'arrêt d'urgence), feux de détresse.</li>
<li>Enfiler le <b>gilet fluo</b> avant de sortir, sortir côté droit.</li>
<li>Se mettre derrière la glissière de sécurité.</li>
<li>Placer le triangle à au moins <b>100 m</b> (si possible sans danger).</li>
<li>Appeler l'assistance ou le 112.</li></ol>`},
{id:"feux",t:"Feux & signaux lumineux",h:`
<h3>Éclairage du véhicule</h3>
<ul><li><b>Feux de croisement</b> : entre la tombée et le lever du jour, et de jour quand la visibilité est inférieure à <b>200 m</b>.</li>
<li><b>Feux de route</b> : interdits quand on croise, quand on suit de près un véhicule, ou s'ils peuvent éblouir.</li>
<li><b>Antibrouillard arrière</b> : seulement si visibilité &lt; <b>100 m</b> (brouillard, neige, forte pluie).</li>
<li><b>Feux de détresse</b> : véhicule immobilisé dangereux, ralentissement brusque, remorquage.</li>
<li>Ébloui : ralentir, regarder le bord droit de la route.</li></ul>
<h3>Feux de circulation</h3>
<ul><li><b>Rouge</b> : interdiction de franchir la ligne d'arrêt.</li>
<li><b>Orange fixe</b> : s'arrêter, sauf si on est trop près pour le faire en sécurité.</li>
<li><b>Vert</b> : passage permis, sans bloquer le carrefour, en cédant aux piétons/cyclistes en tournant.</li>
<li><b>Flèche verte</b> : direction permise, en cédant aux usagers qui circulent régulièrement.</li>
<li><b>Orange clignotant</b> : prudence, ce sont les panneaux (ou la priorité de droite) qui s'appliquent.</li>
<li><b>Feux rouges clignotants</b> (passage à niveau, pont mobile) : arrêt obligatoire.</li></ul>`},
{id:"alc",t:"Alcool, drogues, GSM & fatigue",h:`
<ul><li>Taux max : <b>0,5 g/l</b> de sang (0,22 mg/l d'air expiré).</li>
<li>Conducteurs professionnels : <b>0,2 g/l</b>.</li>
<li>Drogues : <b>tolérance zéro</b> (test salivaire).</li>
<li>Seul le <b>temps</b> élimine l'alcool (environ 0,1 à 0,15 g/l par heure) : café, eau ou douche n'y changent rien.</li>
<li>Médicaments : lire la notice, demander au médecin/pharmacien.</li>
<li><b>GSM en main interdit</b> pendant la conduite, y compris à un feu rouge ou dans un bouchon. Kit mains libres/support : à utiliser sans se laisser distraire.</li>
<li>Fatigue : pause toutes les <b>2 heures</b> ; au premier signe (bâillements, yeux lourds), s'arrêter.</li></ul>
<div class="tip">L'alcool augmente le temps de réaction, réduit le champ visuel et donne un faux sentiment de sécurité.</div>`},
{id:"secu",t:"Sécurité, ceinture & enfants",h:`
<ul><li>Ceinture <b>obligatoire à l'avant et à l'arrière</b>. Le conducteur est responsable des passagers de moins de 18 ans.</li>
<li>Enfants de moins de <b>1,35 m</b> : dispositif de retenue adapté (siège, rehausseur).</li>
<li>Siège enfant <b>dos à la route à l'avant</b> : seulement si l'airbag passager est <b>désactivé</b>.</li>
<li>Appuie-tête : le haut au niveau du sommet de la tête.</li>
<li>Avant de partir : siège, volant, rétroviseurs, ceinture.</li>
<li><b>Angle mort</b> : toujours tourner la tête avant de changer de bande ou de tourner.</li>
<li>Aquaplaning : lever le pied, ne pas freiner brutalement, tenir le volant droit.</li>
<li>Choc à 50 km/h ≈ chute d'environ 10 m (3 étages).</li></ul>`},
{id:"vuln",t:"Piétons, cyclistes & zones",h:`
<ul><li>Passage pour piétons {{F49}} : approcher à allure modérée et <b>céder le passage</b> aux piétons engagés ou qui s'apprêtent à s'engager.</li>
<li>En tournant : céder aux piétons et cyclistes qui traversent ou vont tout droit.</li>
<li>Piéton aveugle (canne blanche) ou personne avec chien guide : céder, s'arrêter si besoin.</li>
<li>Enfants, personnes âgées : comportements imprévisibles, ralentir.</li></ul>
<h3>Zones</h3>
<ul><li>Zone 30 {{F4a}} : 30 km/h (souvent aux abords des écoles).</li>
<li>Zone résidentielle/de rencontre {{F12a}} : <b>20 km/h</b>, piétons sur toute la largeur, jeux permis, ne pas mettre les piétons en danger.</li>
<li>Rue cyclable {{F111}} : 30 km/h, interdit de dépasser les cyclistes.</li>
<li>Sens unique limité : {{C1}} avec panonceau « excepté cyclistes » → s'attendre à croiser des vélos.</li></ul>
<h3>Trottinettes électriques</h3>
<p>Elles roulent sur la piste cyclable ou à défaut sur la chaussée, pas sur le trottoir ; âge minimum 16 ans.</p>`},
{id:"veh",t:"Véhicule, chargement & documents",h:`
<h3>Documents à bord</h3>
<ul><li>Permis de conduire, certificat d'immatriculation, preuve d'assurance, certificat de contrôle technique.</li></ul>
<h3>Équipement obligatoire en Belgique</h3>
<ul><li>Triangle de danger, gilet fluorescent, <b>extincteur</b> et <b>trousse de secours</b>.</li></ul>
<h3>Entretien</h3>
<ul><li>Pneus : profondeur minimum <b>1,6 mm</b>. Pneus hiver non obligatoires mais conseillés.</li>
<li>Contrôle technique : première fois après <b>4 ans</b>, puis chaque année.</li>
<li>Témoin rouge (huile, frein, température) : s'arrêter dès que possible.</li></ul>
<h3>Ce que permet le permis B</h3>
<ul><li>Véhicules jusqu'à <b>3 500 kg</b> (MMA) et maximum <b>8 passagers</b> + le conducteur.</li>
<li>Remorque jusqu'à <b>750 kg</b>, ou plus lourde si l'ensemble ne dépasse pas 3 500 kg (code B96 jusqu'à 4 250 kg).</li>
<li>Le chargement ne doit pas gêner la vue, ni tomber, ni dépasser sans signalisation.</li></ul>`},
{id:"acc",t:"Accident & premiers secours",h:`
<h3>P.A.S. : Protéger – Alerter – Secourir</h3>
<ol><li><b>Protéger</b> : feux de détresse, gilet, triangle (30 m sur route, 100 m sur autoroute), couper le moteur.</li>
<li><b>Alerter</b> : <b>112</b> (ambulance/pompiers), <b>101</b> (police). Dire où, quoi, combien de blessés.</li>
<li><b>Secourir</b> : rassurer, couvrir, ne pas déplacer un blessé sauf danger.</li></ol>
<ul><li>Victime inconsciente qui respire : <b>position latérale de sécurité</b>.</li>
<li>Ne respire pas : 112 + réanimation (30 compressions / 2 insufflations), défibrillateur.</li>
<li>Motard : ne pas retirer le casque (sauf pour libérer les voies respiratoires).</li>
<li>Dégâts matériels uniquement : <b>constat européen</b>, signé par les deux, chacun garde un exemplaire.</li>
<li>Quitter les lieux sans s'identifier = <b>délit de fuite</b>.</li></ul>`},
{id:"dist",t:"Distances & freinage",h:`
<ul><li><b>Distance d'arrêt = distance de réaction + distance de freinage</b>.</li>
<li>Temps de réaction moyen : environ <b>1 seconde</b> (plus avec fatigue, alcool, GSM).</li>
<li>Distance de réaction ≈ (vitesse / 10) × 3 : à 50 km/h ≈ 15 m, à 90 km/h ≈ 27 m.</li>
<li>Distance de freinage ≈ (vitesse / 10)² : à 50 ≈ 25 m, à 90 ≈ 81 m (sol sec).</li>
<li>Vitesse ×2 → distance de freinage <b>×4</b>. Sur sol mouillé : environ ×2.</li>
<li><b>Règle des 2 secondes</b> : choisir un repère fixe et compter « 1001, 1002 ».</li>
<li>Avec ABS : freiner à fond et continuer à diriger.</li></ul>`},
{id:"eco",t:"Éco-conduite & mécanique",h:`
<ul><li>Anticiper, rouler en souplesse, utiliser le frein moteur.</li>
<li>Passer vite au rapport supérieur (vers 2 000–2 500 tr/min).</li>
<li>Pneus sous-gonflés, climatisation, coffre de toit, charges inutiles → surconsommation.</li>
<li>Couper le moteur lors d'un arrêt prolongé.</li>
<li>Niveau d'huile : véhicule à plat, moteur froid.</li>
<li><b>LEZ</b> (zones de basses émissions) à Bruxelles, Anvers, Gand : accès selon la norme Euro du véhicule.</li></ul>`},
{id:"perm",t:"Permis & examens",h:`
<h3>Examen théorique</h3>
<ul><li><b>50 questions</b> à choix multiple (2 ou 3 réponses, une seule bonne).</li>
<li>Réussite : <b>41/50</b> minimum.</li>
<li>Faute simple : −1 point. <b>Faute grave : −5 points</b> → deux fautes graves = échec.</li>
<li>Âge : à partir de 17 ans. Réussite valable 3 ans. Pas de limite de tentatives.</li>
<li>Depuis 2026 : la formation théorique et pratique doit se faire dans la <b>même région</b>.</li></ul>
<h3>Apprentissage</h3>
<ul><li>Filière libre (avec guide) ou auto-école, selon les règles de ta région.</li>
<li>Plaque <b>L</b> (L blanc sur fond bleu) à l'arrière pendant l'apprentissage avec guide.</li></ul>
<h3>Examen pratique – ce qui est évalué</h3>
<ul><li>Vérifications du véhicule (pneus, feux, niveaux, documents).</li>
<li>Manœuvres : parking (créneau, en épi/bataille), demi-tour, démarrage en côte, marche arrière.</li>
<li>Circulation : observation, rétroviseurs + angle mort, placement, vitesse adaptée, priorités, anticipation, usagers vulnérables.</li>
<li>Fautes éliminatoires typiques : brûler un feu ou un stop, refus de priorité, mise en danger, intervention de l'examinateur.</li></ul>
<p class="small">Les règles évoluent et varient selon la région. Vérifie toujours auprès de ton centre d'examen et sur le code de la route officiel.</p>`}
];

// ===== QUESTIONS : [thème, grave(1/0), question, réponses, index bonne réponse, explication, panneau] =====
const QS=[
["gen",0,"Où commence une agglomération ?",["Au panneau portant le nom de la localité (F1)","Dès qu'il y a des maisons des deux côtés","Au premier feu de signalisation"],0,"L'agglomération commence au panneau F1 et se termine au panneau F3. C'est le panneau qui compte.","F1"],
["gen",0,"La chaussée, c'est :",["La partie de la voie publique aménagée pour les véhicules","Toute la largeur de la route, trottoirs compris","Uniquement la bande de droite"],0,"La chaussée ne comprend ni trottoirs, ni accotements, ni pistes cyclables."],
["gen",0,"En règle générale, je dois circuler :",["Le plus près possible du bord droit de la chaussée","Au milieu de la chaussée","Sur la bande de mon choix"],0,"Règle de base : rester à droite."],
["gen",0,"Hors agglomération, sur une chaussée à plusieurs bandes dans mon sens, je roule :",["Sur la bande de droite et j'utilise les autres pour dépasser","Sur la bande du milieu","Sur la bande de gauche si je roule vite"],0,"La bande de droite est la règle ; les autres servent au dépassement."],
["gen",0,"Qui a la priorité absolue sur les autres indications ?",["L'agent qualifié (police)","Les feux de signalisation","Les panneaux"],0,"Ordre : agent > feux > panneaux > règles générales."],
["gen",0,"Un agent lève le bras verticalement. Cela signifie :",["Arrêt pour tous, sauf ceux déjà engagés dans le carrefour","Accélérez","Passage libre pour tous"],0,"Le bras levé est un signal d'arrêt général."],
["gen",1,"Un agent me fait face, les bras tendus horizontalement. Je dois :",["M'arrêter","Passer","Tourner à droite uniquement"],0,"Les usagers venant de face ou de dos de l'agent doivent s'arrêter."],
["gen",0,"Quand dois-je mettre mon clignotant ?",["Suffisamment avant de changer de direction ou de bande","Seulement si quelqu'un me suit","Pendant que je tourne"],0,"On avertit avant la manœuvre, pas pendant."],
["gen",0,"Je peux utiliser le klaxon :",["Pour éviter un accident","Pour saluer quelqu'un","Pour faire démarrer la voiture devant moi au feu vert"],0,"Le klaxon sert à éviter un accident (et hors agglomération à avertir d'un dépassement)."],
["gen",1,"Puis-je faire marche arrière sur l'autoroute si j'ai raté ma sortie ?",["Non, jamais","Oui, sur la bande d'arrêt d'urgence","Oui, avec les feux de détresse"],0,"Marche arrière et demi-tour sont strictement interdits sur autoroute. Je continue jusqu'à la sortie suivante."],
["gen",0,"Je démarre d'une place de stationnement. Je dois :",["Céder le passage aux autres usagers","Passer en premier car je mets mon clignotant","Klaxonner pour avertir"],0,"Celui qui effectue une manœuvre cède le passage à tous."],
["gen",0,"Une bande se termine dans un bouchon. Je m'insère :",["Alternativement, juste avant le rétrécissement (tirette)","Le plus tôt possible","Quand quelqu'un me fait signe"],0,"La tirette est obligatoire en circulation dense."],
["gen",0,"L'arrêt, c'est :",["Immobiliser le véhicule le temps d'embarquer ou débarquer des personnes ou des choses","Immobiliser le véhicule plus de 2 heures","Couper le moteur"],0,"Au-delà de ce temps nécessaire, il s'agit de stationnement."],

["sig",0,"Ce panneau annonce :",["Un virage dangereux à gauche","Une obligation de tourner à gauche","Une route sinueuse"],0,"Triangle rouge = danger. Ici : virage à gauche.","A1a"],
["sig",0,"Ce panneau signifie :",["Rétrécissement de la chaussée","Pont mobile","Fin d'autoroute"],0,"La chaussée se rétrécit : ralentir et serrer à droite.","A7"],
["sig",0,"Ce panneau annonce :",["Une chaussée glissante","Un virage en S","Une route en travaux"],0,"Réduire la vitesse et éviter les gestes brusques.","A15"],
["sig",0,"Ce panneau annonce :",["Des feux de signalisation","Un passage à niveau","Un carrefour giratoire"],0,"Annonce un carrefour réglé par des feux.","A17"],
["sig",0,"Ce panneau annonce :",["Un endroit fréquenté par des enfants","Un passage pour piétons","Une zone résidentielle"],0,"Écoles, plaines de jeux : prudence.","A23"],
["sig",0,"Que signifie ce panneau ?",["Danger autre ; un panonceau précise souvent lequel","Fin de toutes les interdictions","Poste de secours"],0,"Le point d'exclamation signale un danger non couvert par un autre panneau.","A51"],
["sig",0,"Hors agglomération, un panneau de danger est placé à environ :",["150 m du danger","50 m du danger","500 m du danger"],0,"Environ 150 m hors agglomération, plus près en agglomération."],
["sig",1,"Ce panneau m'oblige à :",["Céder le passage aux usagers de la voie que j'aborde, dans les deux sens","M'arrêter complètement même si la voie est libre","Céder seulement à ceux qui viennent de droite"],0,"B1 : cédez le passage. L'arrêt n'est obligatoire que si nécessaire.","B1"],
["sig",1,"Devant ce panneau, la voie est totalement dégagée. Je dois :",["M'arrêter complètement quand même","Ralentir sans m'arrêter","Passer si personne ne vient"],0,"Au STOP, l'arrêt complet est toujours obligatoire.","B5"],
["sig",0,"Ce panneau signifie :",["Route prioritaire : j'ai la priorité aux intersections","Cédez le passage","Fin de route prioritaire"],0,"B9 : priorité jusqu'au panneau B11.","B9"],
["sig",0,"Ce panneau signifie :",["Fin de route prioritaire","Route prioritaire","Interdiction de dépasser"],0,"Après B11, les règles générales (priorité de droite) s'appliquent.","B11"],
["sig",0,"Ce panneau signifie :",["Priorité à la prochaine intersection seulement","Croisement avec une voie ferrée","Hôpital"],0,"B15 : priorité ponctuelle, uniquement à la prochaine intersection.","B15"],
["sig",1,"Ce panneau signifie :",["À la prochaine intersection, je cède à droite","J'ai la priorité","Passage à niveau"],0,"B17 : rappel de la priorité de droite.","B17"],
["sig",0,"Ce panneau signifie :",["Je dois céder le passage aux conducteurs qui viennent en face","J'ai la priorité sur ceux qui viennent en face","Circulation à double sens"],0,"B19 dans un passage étroit : je laisse passer.","B19"],
["sig",0,"Ce panneau signifie :",["J'ai la priorité sur les conducteurs venant en sens inverse","Je dois céder aux conducteurs venant en face","Route à sens unique"],0,"B21 : priorité dans le passage étroit (avec prudence).","B21"],
["sig",1,"Ce panneau signifie :",["Sens interdit pour tout conducteur","Stationnement interdit","Route fermée aux camions"],0,"C1 : accès interdit dans ce sens.","C1"],
["sig",0,"Ce panneau signifie :",["Accès interdit dans les deux sens à tout conducteur","Fin de zone","Route prioritaire"],0,"C3 : cercle blanc bordé de rouge, sans symbole.","C3"],
["sig",0,"Ce panneau signifie :",["Interdiction de tourner à gauche","Obligation de tourner à gauche","Demi-tour interdit"],0,"C31a : tourner à gauche interdit.","C31a"],
["sig",0,"Ce panneau signifie :",["Demi-tour interdit","Virage dangereux","Sens giratoire"],0,"C33 : demi-tour interdit.","C33"],
["sig",1,"Avec ce panneau, puis-je dépasser une voiture ?",["Non","Oui, si la ligne est discontinue","Oui, si elle roule lentement"],0,"C35 interdit de dépasser un véhicule à plus de deux roues. On peut dépasser un vélo ou une moto.","C35"],
["sig",0,"Avec ce panneau, puis-je dépasser une moto ?",["Oui, si les conditions le permettent","Non, jamais","Seulement en agglomération"],0,"C35 ne vise que les véhicules à plus de deux roues.","C35"],
["sig",1,"Ce panneau signifie :",["Interdiction de dépasser 50 km/h","Vitesse conseillée de 50 km/h","Vitesse minimale de 50 km/h"],0,"C43 : vitesse maximale.","C43"],
["sig",0,"Ce panneau signifie :",["Fin de la limitation de vitesse","Vitesse minimale","Interdiction de rouler à 50"],0,"C45 : la vitesse générale de l'endroit s'applique à nouveau.","C45"],
["sig",0,"Ce panneau signifie :",["Direction obligatoire","Route prioritaire","Sens unique"],0,"Panneau rond bleu = obligation.","D1"],
["sig",0,"Ce panneau signifie :",["Carrefour giratoire : tourner dans le sens des flèches","Demi-tour autorisé","Parking"],0,"D5, souvent combiné avec B1.","D5"],
["sig",0,"Ce panneau signifie :",["Piste cyclable obligatoire","Parking vélos","Location de vélos"],0,"D7 : réservé aux cyclistes ; interdit aux voitures.","D7"],
["sig",0,"Ce panneau signifie :",["Stationnement interdit (l'arrêt reste permis)","Arrêt et stationnement interdits","Parking payant"],0,"Une seule barre : stationnement interdit.","E1"],
["sig",1,"Ce panneau signifie :",["Arrêt et stationnement interdits","Stationnement interdit seulement","Fin d'interdiction"],0,"La croix : ni arrêt, ni stationnement.","E3"],
["sig",0,"Ce panneau signifie :",["Début de zone 30","Vitesse conseillée 30","Fin de zone 30"],0,"F4a : 30 km/h dans toute la zone jusqu'au panneau F4b.","F4a"],
["sig",0,"Ce panneau signifie :",["Début d'autoroute","Pont","Route pour automobiles"],0,"F5 : règles de l'autoroute.","F5"],
["sig",0,"Ce panneau signifie :",["Route pour automobiles","Garage","Parking"],0,"F9 : réservée aux véhicules automobiles.","F9"],
["sig",0,"Ce panneau signifie :",["Zone résidentielle ou de rencontre","Lotissement privé","Fin d'agglomération"],0,"F12a : 20 km/h, piétons prioritaires de fait.","F12a"],
["sig",0,"Ce panneau signifie :",["Voie sans issue","Hôpital","Stationnement autorisé"],0,"F45 : impasse.","F45"],
["sig",0,"Ce panneau signifie :",["Rue cyclable","Piste cyclable obligatoire","Parking vélos"],0,"F111 : 30 km/h max, on ne dépasse pas les cyclistes.","F111"],
["sig",1,"Une ligne blanche continue au milieu de la route :",["Ne peut être ni franchie ni chevauchée","Peut être franchie pour dépasser un vélo","Peut être franchie la nuit"],0,"Franchir une ligne continue est une infraction grave."],
["sig",0,"Une ligne blanche continue doublée d'une ligne discontinue de mon côté :",["Je peux la franchir","Je ne peux pas la franchir","Je dois m'arrêter"],0,"On respecte la ligne la plus proche de soi : ici, discontinue."],
["sig",0,"Des flèches courbes sur une ligne discontinue annoncent :",["Une ligne continue : il faut se rabattre","Un parking","Une sortie d'autoroute"],0,"Ce sont les flèches de rabattement."],
["sig",0,"Une ligne de triangles blancs (dents de requin) sur la chaussée signifie :",["Cédez le passage","Stop","Ralentisseur uniquement"],0,"C'est le marquage du cédez-le-passage."],
["sig",0,"Une zone de hachures blanches (zone d'évitement) :",["Je ne peux ni y circuler ni m'y arrêter","Je peux m'y garer brièvement","Elle est réservée aux bus"],0,"La zone d'évitement est interdite à la circulation."],
["sig",0,"Une ligne jaune discontinue le long du trottoir signifie :",["Stationnement interdit","Arrêt et stationnement interdits","Parking pour livraisons"],0,"Jaune discontinue = stationnement interdit ; jaune continue = arrêt et stationnement interdits."],

["vit",1,"En Wallonie, vitesse maximale en agglomération (sauf signalisation) :",["50 km/h","30 km/h","70 km/h"],0,"50 km/h en Wallonie et en Flandre."],
["vit",1,"En Région de Bruxelles-Capitale, vitesse générale en agglomération :",["30 km/h","50 km/h","40 km/h"],0,"Depuis 2021, la règle générale à Bruxelles est 30 km/h."],
["vit",1,"En Wallonie, hors agglomération sur une route ordinaire :",["90 km/h","70 km/h","120 km/h"],0,"90 km/h en Wallonie, 70 km/h par défaut en Flandre."],
["vit",0,"En Flandre, hors agglomération (sans panneau), la vitesse maximale est :",["70 km/h","90 km/h","50 km/h"],0,"La Flandre a abaissé la vitesse par défaut à 70 km/h."],
["vit",1,"Vitesse maximale sur autoroute :",["120 km/h","130 km/h","100 km/h"],0,"120 km/h, et 70 km/h minimum."],
["vit",0,"Vitesse minimale sur autoroute (conditions normales) :",["70 km/h","50 km/h","90 km/h"],0,"Un véhicule trop lent est dangereux sur autoroute."],
["vit",1,"Dans une zone résidentielle ou de rencontre :",["20 km/h","30 km/h","10 km/h"],0,"20 km/h maximum."],
["vit",0,"Dans une rue cyclable :",["30 km/h","20 km/h","50 km/h"],0,"30 km/h et interdiction de dépasser les cyclistes."],
["vit",0,"En Wallonie, sur une route hors agglomération à 2×2 bandes séparées par une berme centrale :",["120 km/h","90 km/h","100 km/h"],0,"120 km/h en Wallonie sur ces routes, sauf signalisation."],
["vit",0,"La vitesse maximale autorisée :",["Doit être adaptée : je dois pouvoir m'arrêter devant un obstacle prévisible","Doit toujours être atteinte","Est une vitesse conseillée"],0,"On adapte toujours sa vitesse aux circonstances."],
["vit",0,"Par brouillard épais, je dois :",["Ralentir pour pouvoir m'arrêter dans la distance que je vois","Rouler normalement avec les antibrouillards","Suivre de près les feux arrière du véhicule devant"],0,"La vitesse doit permettre de s'arrêter dans l'espace visible."],
["vit",0,"Une limitation de vitesse (C43) prend fin :",["Au panneau de fin de limitation, à un autre panneau de vitesse ou à l'entrée/sortie d'agglomération","Après 1 km","Au prochain feu"],0,"Plusieurs signaux mettent fin à la limitation."],

["prio",1,"À une intersection sans signalisation, une voiture vient de ma droite :",["Je lui cède le passage","J'ai la priorité car je suis sur une route plus large","Le premier arrivé passe"],0,"Sans signalisation : priorité de droite."],
["prio",1,"Je suis sur une route prioritaire (B9). Une voiture arrive de droite :",["J'ai la priorité, mais je reste prudent","Je dois lui céder","Le plus rapide passe"],0,"Sur la route prioritaire, ceux des rues latérales cèdent.","B9"],
["prio",0,"Un véhicule sort d'un chemin de terre à ma droite :",["Il doit me céder le passage","J'ai l'obligation de lui céder","Celui qui klaxonne passe"],0,"Les usagers sortant d'un chemin de terre ou d'un sentier cèdent le passage."],
["prio",0,"Une voiture sort d'un parking à ma droite :",["Elle doit me céder le passage","Je dois lui céder (priorité de droite)","Le plus gros véhicule passe"],0,"Sortir d'un lieu non ouvert à la circulation = céder à tous."],
["prio",1,"Un tram arrive de ma gauche à une intersection sans signalisation :",["Je lui cède le passage","J'ai la priorité de droite","Je klaxonne et je passe"],0,"Le tram a la priorité, sauf signalisation contraire."],
["prio",1,"Une ambulance, feux bleus et sirène, arrive derrière moi :",["Je libère le passage, en m'arrêtant si nécessaire","Je continue normalement","J'accélère pour aller plus vite qu'elle"],0,"On doit céder le passage aux véhicules prioritaires en intervention."],
["prio",0,"Une ambulance a ses feux bleus allumés mais sans sirène :",["Elle n'est pas prioritaire mais je reste attentif","Elle est prioritaire","Je dois m'arrêter"],0,"La priorité exige feux bleus ET avertisseur spécial."],
["prio",1,"J'entre dans un giratoire signalé par D5 et B1 :",["Je cède à ceux qui sont déjà sur l'anneau","J'ai la priorité de droite","Ceux sur l'anneau me cèdent"],0,"Le B1 à l'entrée impose de céder aux usagers de l'anneau.","D5"],
["prio",0,"Dans un giratoire, le clignotant :",["Est obligatoire à droite pour sortir","Est obligatoire à gauche pour entrer","Est interdit"],0,"Le clignotant droit pour sortir est obligatoire ; en entrant, il n'est pas obligatoire."],
["prio",1,"Je tourne à gauche ; une voiture arrive en face et va tout droit :",["Je la laisse passer","Je passe d'abord car j'ai mis mon clignotant","Elle doit me céder"],0,"En tournant à gauche, on cède à ceux qui viennent en face."],
["prio",0,"Les feux sont en panne (éteints) :",["Je respecte les panneaux de priorité, sinon la priorité de droite","J'ai la priorité","Je dois m'arrêter et attendre la police"],0,"Sans feux, ce sont les panneaux, ou à défaut la priorité de droite."],
["prio",0,"Feu orange clignotant :",["Prudence ; les panneaux ou la priorité de droite s'appliquent","Je dois m'arrêter","J'ai la priorité"],0,"Le clignotant orange n'accorde aucune priorité."],
["prio",0,"En agglomération, un bus à l'arrêt met son clignotant pour repartir :",["Je ralentis et m'arrête si nécessaire pour le laisser partir","Je le dépasse vite","Il doit attendre que je sois passé"],0,"En agglomération, on doit permettre au bus de quitter son arrêt."],
["prio",0,"Le feu est vert mais le carrefour est encombré :",["Je ne m'engage pas si je risque de le bloquer","Je m'engage car le feu est vert","Je klaxonne"],0,"Il est interdit de s'engager si on risque de rester bloqué au milieu."],
["prio",1,"Au panneau B17, une voiture arrive de gauche, rien à droite :",["Elle doit me céder, je passe prudemment","Je dois lui céder","Je dois m'arrêter"],0,"B17 rappelle la priorité de droite : celui de gauche me cède.","B17"],

["dep",0,"En règle générale, je dépasse :",["Par la gauche","Par la droite","Du côté le plus large"],0,"Le dépassement se fait par la gauche."],
["dep",0,"Je peux dépasser par la droite :",["Un véhicule qui tourne à gauche et s'est placé à gauche","Un camion lent sur une route de campagne","Jamais"],0,"Aussi un tram, si la place le permet."],
["dep",0,"Un tram circule au milieu de la chaussée :",["Je le dépasse par la droite si la place est suffisante","Je le dépasse par la gauche","Interdit de le dépasser"],0,"Le tram se dépasse par la droite."],
["dep",1,"J'arrive près d'un sommet de côte sans visibilité. Je peux dépasser :",["Non","Oui, si je vais vite","Oui, si la ligne est discontinue"],0,"Interdit : je ne vois pas ce qui arrive en face."],
["dep",1,"Dépasser dans un virage sans visibilité suffisante :",["Est interdit","Est permis si je klaxonne","Est permis la nuit"],0,"Faute grave classique."],
["dep",0,"Hors agglomération, distance latérale minimale pour dépasser un cycliste :",["1,5 m","1 m","50 cm"],0,"1,5 m hors agglomération, 1 m en agglomération."],
["dep",0,"En agglomération, distance latérale minimale pour dépasser un cycliste :",["1 m","50 cm","2 m"],0,"1 m en agglomération."],
["dep",0,"Peut-on dépasser à une intersection ?",["Non, sauf sur route prioritaire, carrefour réglé (feux/agent) ou pour dépasser un deux-roues","Oui, toujours","Jamais, même un vélo"],0,"Règle des intersections et ses exceptions."],
["dep",1,"À l'approche d'un passage à niveau sans barrières, le dépassement :",["Est interdit","Est permis","Est permis pour les motos"],0,"Trop dangereux : interdit."],
["dep",0,"Je suis en train d'être dépassé. Je dois :",["Serrer à droite et ne pas accélérer","Accélérer","Freiner brusquement"],0,"Faciliter le dépassement."],
["dep",0,"Un obstacle se trouve de mon côté sur une route étroite. Une voiture arrive en face :",["Je la laisse passer","Elle doit me laisser passer","Je passe en premier car je roulais déjà"],0,"Celui qui a l'obstacle de son côté cède."],
["dep",0,"Avant de dépasser, je vérifie :",["Rétroviseurs, angle mort, clignotant, visibilité et espace","Seulement le rétroviseur intérieur","Rien si la route est droite"],0,"Les vérifications sont indispensables."],
["dep",1,"Dans une rue cyclable, puis-je dépasser un cycliste ?",["Non","Oui, à 1 m de distance","Oui, s'il roule lentement"],0,"Dans une rue cyclable, les véhicules motorisés ne dépassent pas les cyclistes.","F111"],

["stat",0,"Je stationne en principe :",["À droite par rapport au sens de circulation","Du côté où il y a de la place","À gauche"],0,"Dans une rue à sens unique, on peut aussi stationner à gauche."],
["stat",0,"Dans une rue à sens unique, je peux stationner :",["Des deux côtés","Seulement à droite","Seulement à gauche"],0,"Sauf signalisation contraire."],
["stat",1,"Arrêt et stationnement sont interdits avant un passage pour piétons à moins de :",["5 m","2 m","10 m"],0,"5 m en deçà des passages pour piétons et pour cyclistes."],
["stat",0,"Le stationnement est interdit près d'un arrêt de bus à moins de :",["15 m de part et d'autre","5 m","30 m"],0,"15 m de chaque côté du panneau d'arrêt."],
["stat",0,"Devant une entrée de garage (accès carrossable), peut stationner :",["Uniquement le véhicule dont la plaque est affichée sur l'accès","Tout le monde pour 5 minutes","Personne, même le propriétaire"],0,"Exception pour le véhicule dont le numéro d'immatriculation est affiché."],
["stat",0,"En zone bleue, avec le disque, la durée maximale est en général :",["2 heures","30 minutes","4 heures"],0,"2 heures, du lundi au samedi de 9h à 18h (sauf indication)."],
["stat",0,"Une place réservée aux personnes handicapées :",["Est réservée aux véhicules avec la carte spéciale","Est libre le soir","Est permise 5 minutes"],0,"La carte doit être visible."],
["stat",0,"Stationner en double file :",["Est interdit","Est permis 10 minutes","Est permis avec les feux de détresse"],0,"Le stationnement en double file est interdit."],
["stat",1,"S'arrêter ou stationner sur une piste cyclable :",["Est interdit","Est permis pour décharger","Est permis la nuit"],0,"Interdit : on oblige les cyclistes à se déporter."],
["stat",0,"Peut-on stationner sur le trottoir ?",["Non, sauf signalisation qui l'autorise","Oui, s'il reste 1 m","Oui, hors agglomération"],0,"Le trottoir est pour les piétons."],
["stat",0,"Près d'un carrefour, arrêt et stationnement sont interdits à moins de :",["5 m de la chaussée transversale","1 m","20 m"],0,"Pour garder la visibilité."],
["stat",0,"Avant d'ouvrir ma portière côté rue :",["Je regarde dans le rétro et par-dessus l'épaule","J'ouvre doucement sans regarder","Je klaxonne"],0,"Un cycliste peut arriver : technique de la main opposée."],
["stat",0,"Quand je quitte ma voiture en stationnement :",["Je coupe le moteur, serre le frein et ferme le véhicule","Je laisse tourner le moteur","Je laisse la clé si c'est court"],0,"Bonnes pratiques et sécurité."],

["auto",1,"Sur l'autoroute, il est strictement interdit :",["De faire demi-tour ou marche arrière","De rouler à 100 km/h","D'utiliser la bande de gauche pour dépasser"],0,"Ces manœuvres sont très graves sur autoroute."],
["auto",0,"En entrant sur l'autoroute par la bande d'accélération :",["Je cède le passage à ceux qui circulent sur l'autoroute","J'ai la priorité","Je m'arrête au bout de la bande"],0,"On adapte sa vitesse et on s'insère sans gêner."],
["auto",0,"En panne sur l'autoroute, je place mon triangle à au moins :",["100 m","30 m","10 m"],0,"100 m sur autoroute, 30 m ailleurs (si possible sans danger)."],
["auto",0,"En panne sur l'autoroute, je me mets en sécurité :",["Gilet fluo, sortie côté droit, derrière la glissière","Je reste assis dans la voiture","J'attends sur la bande d'arrêt d'urgence"],0,"Se protéger d'abord."],
["auto",0,"J'ai raté ma sortie d'autoroute :",["Je continue jusqu'à la sortie suivante","Je recule sur la bande d'arrêt d'urgence","Je fais demi-tour par la berme"],0,"Seule option sûre et légale."],
["auto",0,"La bande d'arrêt d'urgence :",["Est réservée aux arrêts nécessaires (panne, malaise)","Peut servir à dépasser dans un bouchon","Peut servir à faire une pause"],0,"Sauf signalisation particulière."],
["auto",0,"Je m'approche d'un bouchon brutal sur l'autoroute :",["J'allume mes feux de détresse pour avertir les suivants","Je klaxonne","J'allume les feux de route"],0,"Avertir d'un ralentissement soudain."],
["auto",0,"Les piétons et cyclistes sur l'autoroute :",["Sont interdits","Sont permis sur la bande d'arrêt d'urgence","Sont permis la journée"],0,"Autoroute interdite à ces usagers.","F5"],
["auto",0,"Sur autoroute, en circulation fluide, je roule :",["Sur la bande de droite","Sur la bande du milieu","À gauche si je veux"],0,"Les autres bandes servent au dépassement."],
["auto",0,"En files parallèles denses, la file de droite avance plus vite que la mienne :",["Ce n'est pas considéré comme un dépassement par la droite","C'est interdit","Je dois me rabattre"],0,"En circulation dense en files, rouler plus vite à droite n'est pas un dépassement interdit."],

["feux",0,"De jour, j'allume les feux de croisement quand la visibilité est inférieure à :",["200 m","100 m","50 m"],0,"Et toujours entre la tombée et le lever du jour."],
["feux",0,"Le feu antibrouillard arrière est permis quand la visibilité est inférieure à :",["100 m","200 m","300 m"],0,"Il éblouit sinon les usagers qui suivent."],
["feux",0,"Les feux de route sont interdits :",["Quand je croise un véhicule ou que j'en suis un de près","Hors agglomération la nuit","Sur autoroute"],0,"Ils éblouissent."],
["feux",1,"Feu rouge :",["Interdiction de franchir la ligne d'arrêt","Je passe si personne ne vient","Je peux tourner à droite"],0,"Brûler un feu rouge est une infraction grave."],
["feux",1,"Le feu passe à l'orange alors que je suis encore loin :",["Je m'arrête","J'accélère","Je passe car ce n'est pas rouge"],0,"L'orange signifie l'arrêt, sauf si l'on est trop près pour s'arrêter en sécurité."],
["feux",0,"Une flèche verte s'allume à côté d'un feu rouge :",["Je peux aller dans la direction de la flèche en cédant aux usagers qui circulent régulièrement","J'ai la priorité absolue","Je dois attendre le vert"],0,"Par exemple, aux piétons qui traversent avec leur feu vert."],
["feux",1,"Feux rouges clignotants à un passage à niveau :",["Arrêt obligatoire","Prudence, je peux passer","Je passe vite"],0,"Un train approche."],
["feux",0,"Les feux de détresse s'utilisent :",["Véhicule immobilisé dangereux, ralentissement soudain, remorquage","Pour stationner en double file","Quand il pleut"],0,"Pas une autorisation de stationner !"],
["feux",0,"La nuit, je suis ébloui par un véhicule en face :",["Je ralentis et regarde le bord droit de la route","Je mets mes feux de route","Je ferme les yeux un instant"],0,"Réduire la vitesse et regarder à droite."],
["feux",0,"Feu vert, je tourne à droite et des piétons traversent :",["Je leur cède le passage","Je passe, j'ai le vert","Je klaxonne"],0,"En tournant, on cède aux piétons qui traversent."],

["alc",1,"Taux d'alcool maximum pour un conducteur ordinaire :",["0,5 g/l de sang","0,8 g/l","0,2 g/l"],0,"Soit 0,22 mg/l d'air alvéolaire expiré."],
["alc",0,"Taux d'alcool maximum pour un conducteur professionnel :",["0,2 g/l","0,5 g/l","0,0 g/l"],0,"Chauffeurs de bus, camions, taxis…"],
["alc",0,"Pour éliminer l'alcool plus vite :",["Rien, seul le temps compte","Boire du café","Prendre une douche froide"],0,"Environ 0,1 à 0,15 g/l par heure."],
["alc",1,"Pour les drogues au volant, la règle est :",["Tolérance zéro","Une petite quantité est tolérée","Seul le cannabis est toléré"],0,"Détection par test salivaire."],
["alc",0,"L'alcool provoque :",["Un temps de réaction plus long et un champ visuel réduit","De meilleurs réflexes","Une meilleure vision de nuit"],0,"Et un faux sentiment de sécurité."],
["alc",1,"Tenir son GSM en main en conduisant :",["Est interdit, même à l'arrêt à un feu rouge","Est permis à un feu rouge","Est permis pour un court appel"],0,"Seul un kit mains libres ou un support est permis."],
["alc",0,"Un médicament avec un pictogramme d'avertissement :",["Je lis la notice et demande conseil avant de conduire","Je peux conduire sans souci","Je le prends avec de l'alcool"],0,"Certains médicaments sont incompatibles avec la conduite."],
["alc",0,"Sur un long trajet, je fais une pause :",["Toutes les 2 heures environ","Toutes les 5 heures","Seulement si j'ai faim"],0,"La fatigue est une cause majeure d'accidents."],
["alc",0,"Je commence à bâiller et mes yeux se ferment :",["Je m'arrête dès que possible pour me reposer","J'ouvre la fenêtre et je continue","Je monte la radio"],0,"Seul le repos est efficace."],

["secu",0,"La ceinture de sécurité est obligatoire :",["À l'avant et à l'arrière","Seulement à l'avant","Seulement sur autoroute"],0,"Pour tous les occupants."],
["secu",0,"Qui est responsable du port de la ceinture d'un passager de 15 ans ?",["Le conducteur","Le passager seul","Ses parents uniquement"],0,"Le conducteur est responsable des passagers de moins de 18 ans."],
["secu",1,"Un enfant de moins de 1,35 m doit voyager :",["Dans un dispositif de retenue adapté","Avec la ceinture adulte seule","Sur les genoux d'un adulte"],0,"Siège-auto ou rehausseur adapté."],
["secu",0,"Siège enfant dos à la route à l'avant :",["Uniquement si l'airbag passager est désactivé","Toujours permis","Interdit"],0,"L'airbag pourrait blesser gravement l'enfant."],
["secu",0,"L'appuie-tête est bien réglé quand :",["Son haut est au niveau du sommet de la tête","Il est au niveau de la nuque","Il est abaissé au maximum"],0,"Il protège du coup du lapin."],
["secu",0,"L'angle mort se contrôle :",["En tournant la tête","Avec le rétroviseur intérieur","Inutile avec des rétroviseurs"],0,"Un regard par-dessus l'épaule."],
["secu",0,"En cas d'aquaplaning :",["Je lève le pied et je tiens le volant droit","Je freine fort","Je donne un coup de volant"],0,"Laisser les pneus retrouver l'adhérence."],
["secu",0,"Un choc à 50 km/h équivaut à une chute d'environ :",["10 m (3 étages)","2 m","30 m"],0,"D'où l'importance de la ceinture."],
["secu",0,"Avant un virage, je ralentis :",["Avant d'entrer dans le virage","Au milieu du virage","À la sortie"],0,"Freiner en ligne droite, puis tourner."],

["vuln",1,"Un piéton s'apprête à traverser sur un passage pour piétons :",["Je m'arrête pour le laisser traverser","Je passe car il n'est pas encore engagé","Je klaxonne"],0,"On cède aux piétons engagés ou qui s'apprêtent à s'engager.","F49"],
["vuln",1,"Je tourne à droite ; un cycliste roule tout droit sur la piste cyclable à ma droite :",["Je le laisse passer","Je tourne avant lui","Il doit s'arrêter"],0,"Attention à l'angle mort !"],
["vuln",1,"Je tourne dans une rue ; des piétons la traversent :",["Je leur cède le passage","Ils doivent attendre","Je passe si j'ai le vert"],0,"Même sans passage pour piétons."],
["vuln",0,"Un piéton avec une canne blanche traverse :",["Je m'arrête et le laisse traverser","Je klaxonne pour l'avertir","Je le contourne"],0,"Personne malvoyante : grande prudence."],
["vuln",0,"Dans une zone résidentielle, les piétons :",["Peuvent utiliser toute la largeur de la voie publique","Doivent rester sur le trottoir","Doivent céder aux voitures"],0,"Les jeux y sont aussi autorisés.","F12a"],
["vuln",0,"Dans une zone de rencontre, je stationne :",["Uniquement aux emplacements marqués","Où je veux","Sur le trottoir"],0,"Stationnement limité aux emplacements indiqués.","F12a"],
["vuln",0,"Un sens interdit avec panonceau « excepté cyclistes » (sens unique limité) :",["Je dois m'attendre à croiser des cyclistes","Les cyclistes sont interdits","Je peux y entrer en voiture"],0,"Les vélos peuvent circuler en sens inverse.","C1"],
["vuln",0,"Au feu rouge, un sas vélo est tracé devant la ligne :",["Je m'arrête à la première ligne, avant le sas","Je m'arrête dans le sas","Je peux le traverser"],0,"Le sas est réservé aux cyclistes."],
["vuln",0,"Les trottinettes électriques circulent :",["Sur la piste cyclable, à défaut sur la chaussée","Sur le trottoir","Sur l'autoroute"],0,"Âge minimum 16 ans."],
["vuln",0,"Je longe une école à l'heure de sortie :",["Je ralentis fortement et je suis prêt à m'arrêter","Je klaxonne","Je garde ma vitesse"],0,"Les enfants sont imprévisibles.","A23"],
["vuln",0,"Un ballon roule sur la chaussée devant moi :",["Je freine : un enfant peut suivre","Je l'évite et je continue","J'accélère"],0,"Anticiper le danger caché."],
["vuln",0,"Un cycliste âgé zigzague légèrement devant moi :",["Je garde une grande distance et ne dépasse qu'avec beaucoup d'espace","Je le serre pour passer","Je klaxonne longuement"],0,"Usager vulnérable."],

["veh",0,"Profondeur minimale des sculptures des pneus :",["1,6 mm","1 mm","3 mm"],0,"En dessous, le pneu est interdit."],
["veh",0,"Équipement obligatoire dans une voiture en Belgique :",["Triangle, gilet fluo, extincteur, trousse de secours","Triangle seulement","Gilet et roue de secours"],0,"L'extincteur et la trousse sont obligatoires en Belgique."],
["veh",0,"Documents à avoir à bord :",["Permis, immatriculation, assurance, contrôle technique","Seulement la carte d'identité","Seulement l'assurance"],0,"Ils peuvent être demandés lors d'un contrôle."],
["veh",0,"Le premier contrôle technique d'une voiture neuve a lieu :",["Après 4 ans","Après 1 an","Après 10 ans"],0,"Puis chaque année."],
["veh",0,"Les pneus hiver en Belgique :",["Ne sont pas obligatoires mais conseillés","Sont obligatoires de novembre à mars","Sont interdits"],0,"Recommandés sous 7 °C."],
["veh",0,"Avec un permis B, je peux conduire un véhicule de :",["3 500 kg maximum et 8 passagers maximum","5 000 kg","Jusqu'à 15 passagers"],0,"Au-delà : permis C ou D."],
["veh",0,"Avec un permis B, une remorque :",["Jusqu'à 750 kg, ou plus si l'ensemble ne dépasse pas 3 500 kg","De n'importe quel poids","Est interdite"],0,"Le code B96 permet jusqu'à 4 250 kg."],
["veh",0,"Un témoin rouge de pression d'huile s'allume :",["Je m'arrête dès que possible et coupe le moteur","Je continue jusqu'à la maison","J'accélère"],0,"Risque de casser le moteur."],
["veh",0,"Le chargement de mon véhicule :",["Ne doit pas gêner la vue ni risquer de tomber","Peut cacher la lunette arrière","Peut dépasser sans signalisation"],0,"Il doit être bien arrimé."],

["acc",0,"Premier réflexe sur un lieu d'accident :",["Protéger : feux de détresse, gilet, triangle","Déplacer les blessés","Prendre des photos"],0,"P.A.S. : Protéger, Alerter, Secourir."],
["acc",0,"Numéro d'urgence pour une ambulance ou les pompiers :",["112","101","100 000"],0,"Le 101 est pour la police."],
["acc",0,"Numéro de la police en Belgique :",["101","112 uniquement","999"],0,"Le 112 fonctionne aussi dans toute l'Europe."],
["acc",0,"Une victime est inconsciente mais respire :",["Je la mets en position latérale de sécurité","Je la fais asseoir","Je lui donne à boire"],0,"La PLS protège les voies respiratoires."],
["acc",0,"Une victime ne respire plus :",["J'appelle le 112 et je commence la réanimation","J'attends les secours sans rien faire","Je la secoue"],0,"30 compressions / 2 insufflations, défibrillateur si disponible."],
["acc",0,"Un motard blessé porte son casque :",["Je ne le retire pas (sauf pour libérer les voies respiratoires)","Je le retire tout de suite","Je le fais marcher"],0,"Risque de lésion de la colonne."],
["acc",0,"Hors autoroute, le triangle se place à au moins :",["30 m","5 m","100 m"],0,"Il doit être visible à 50 m."],
["acc",0,"Accident sans blessé, juste des dégâts :",["Je remplis un constat européen avec l'autre conducteur","Je pars si les dégâts sont petits","J'appelle toujours l'ambulance"],0,"Chacun garde un exemplaire signé."],
["acc",1,"Quitter les lieux d'un accident sans s'identifier :",["Est un délit de fuite","Est permis si personne n'est blessé","Est permis la nuit"],0,"Infraction très grave."],

["dist",0,"La distance d'arrêt est :",["Distance de réaction + distance de freinage","Distance de freinage seule","La distance jusqu'au véhicule devant"],0,"On parcourt une distance avant même de freiner."],
["dist",0,"Temps de réaction moyen d'un conducteur attentif :",["Environ 1 seconde","0,1 seconde","5 secondes"],0,"Plus long avec fatigue, alcool, GSM."],
["dist",0,"La distance de sécurité minimale avec le véhicule devant :",["2 secondes","1 seconde","10 mètres en toutes circonstances"],0,"Plus si la route est mouillée."],
["dist",0,"Si ma vitesse double, ma distance de freinage :",["Est multipliée par 4","Double","Reste la même"],0,"La distance de freinage augmente avec le carré de la vitesse."],
["dist",0,"Sur route mouillée, la distance de freinage :",["Est environ doublée","Est la même","Diminue"],0,"Adapter vitesse et distance."],
["dist",0,"À 50 km/h, la distance de réaction est d'environ :",["15 m","5 m","50 m"],0,"(50/10) × 3 = 15 m."],
["dist",0,"À 90 km/h sur sol sec, la distance d'arrêt est d'environ :",["108 m","50 m","200 m"],0,"Réaction 27 m + freinage 81 m."],
["dist",0,"Avec l'ABS, en freinage d'urgence :",["Je freine à fond et je continue à diriger","Je pompe sur la pédale","Je freine doucement"],0,"L'ABS empêche le blocage des roues."],
["dist",0,"Un véhicule me suit de trop près :",["J'augmente ma distance avec celui qui me précède","Je freine brusquement","J'accélère"],0,"Je me donne plus de marge pour freiner progressivement."],

["eco",0,"Pour économiser du carburant :",["J'anticipe et je roule en souplesse","J'accélère fort entre les feux","Je roule en première le plus longtemps possible"],0,"La conduite souple est plus sûre et économique."],
["eco",0,"Je passe au rapport supérieur :",["Assez tôt, vers 2 000–2 500 tr/min","Au régime maximum","Jamais avant 4 000 tr/min"],0,"Moins de consommation."],
["eco",0,"Des pneus sous-gonflés :",["Augmentent la consommation et réduisent la sécurité","N'ont aucun effet","Économisent du carburant"],0,"Vérifier la pression régulièrement."],
["eco",0,"Le niveau d'huile se vérifie :",["Véhicule à plat, moteur froid","Moteur tournant","Après un long trajet, en pente"],0,"Pour une mesure correcte."],
["eco",0,"Un coffre de toit vide laissé en permanence :",["Augmente la consommation","Améliore l'aérodynamisme","Ne change rien"],0,"Résistance à l'air."],
["eco",0,"Une LEZ (zone de basses émissions) :",["Limite l'accès selon la norme d'émission du véhicule","Est une zone 30","Est un parking gratuit"],0,"Bruxelles, Anvers, Gand…"],

["perm",0,"Combien de questions compte l'examen théorique du permis B ?",["50","40","80"],0,"50 questions à choix multiple."],
["perm",0,"Score minimum pour réussir l'examen théorique :",["41/50","35/50","45/50"],0,"Au maximum 9 points de pénalité."],
["perm",0,"Une faute grave à l'examen théorique coûte :",["5 points","1 point","10 points"],0,"Deux fautes graves = échec (50 − 10 = 40)."],
["perm",0,"La réussite de l'examen théorique est valable :",["3 ans","1 an","À vie"],0,"Pour passer l'examen pratique."],
["perm",0,"Après un échec à l'examen théorique :",["On peut se réinscrire sans limite de tentatives","On doit attendre 6 mois","On ne peut le repasser que 3 fois"],0,"Pas de délai obligatoire."],
["perm",0,"Depuis 2026, la formation théorique et pratique :",["Doit être faite dans la même région","Peut se faire dans deux régions","Est la même pour toute l'Europe"],0,"Wallonie, Bruxelles et Flandre ont leurs propres règles."],
["perm",0,"La plaque L d'apprentissage est :",["Un L blanc sur fond bleu à l'arrière","Un L rouge sur fond blanc","Un L noir sur fond jaune"],0,"Obligatoire pendant l'apprentissage avec un guide."],
["perm",0,"À l'examen pratique, brûler un STOP :",["Est une faute éliminatoire","Coûte 1 point","Est toléré"],0,"Les fautes de priorité ou de mise en danger sont éliminatoires."]
];
