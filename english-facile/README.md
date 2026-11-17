# 📱 English Facile

Application Android **100 % gratuite** pour apprendre l'anglais facilement : sans abonnement, sans publicité, sans objectif quotidien ni chrono. Tu apprends à ton rythme.

## ⬇️ Télécharger l'application

👉 **[Page des téléchargements : prends la version « English Facile » la plus récente](https://github.com/pepejuv7575/Echo/releases)**

1. Ouvre le lien ci-dessus depuis ton téléphone Android.
2. Touche **EnglishFacile.apk** pour le télécharger.
3. Ouvre le fichier. Si Android le demande, autorise « Installer des applications inconnues » pour ton navigateur.
4. Lance **English Facile** et autorise le micro pour les exercices d'oral.

## ✨ Ce qu'il y a dedans

- **📚 12 leçons** (salutations, nombres, famille, nourriture, voyage, shopping, travail, santé…), chacune en 3 étapes :
  - 📖 **Lire** : explication en français, vocabulaire avec prononciation figurée, phrases utiles avec audio
  - 🎤 **Répéter** : tu prononces en anglais et tu reçois un score de 0 à 100 %, avec les mots bien ou mal prononcés en couleur
  - ✍️ **Exercice** : QCM, écoute, écriture, phrases à remettre dans l'ordre
- **🎮 6 jeux** : Quiz éclair (avec combos), Memory, Phrases en désordre, Écoute & choisis, Défi prononciation, Lettres mélangées
- **🎬 8 situations animées** (café, aéroport, hôtel, demander son chemin, restaurant, magasin, médecin, entretien d'embauche) : personnages animés qui parlent avec sous-titres, puis **jeu de rôle** où tu joues un personnage à voix haute, avec score. Un bouton ouvre aussi de vraies vidéos YouTube gratuites sur la même situation.
- **🏆 Scores** : XP, niveaux, 12 badges, records des jeux, précision de prononciation, étoiles par leçon
- Fonctionne **hors ligne** (sauf les vidéos YouTube). La progression reste sur ton téléphone.

## 🔧 Notes techniques

- La voix anglaise utilise le moteur de synthèse vocale du téléphone (Google TTS). Si la voix ne parle pas anglais, installe la langue « Anglais (États-Unis) » dans *Paramètres → Synthèse vocale*.
- La reconnaissance vocale utilise celle d'Android (application Google). Pour qu'elle marche sans Internet, télécharge l'anglais hors ligne dans les réglages vocaux de Google.
- L'APK est compilé automatiquement par **GitHub Actions** à chaque modification (`.github/workflows/english-facile.yml`).
- Code : application web (`app/src/main/assets/www`) dans une WebView Android, avec un pont Java vers la voix et le micro (`MainActivity.java`).

### Modifier le contenu

Les leçons et les scènes sont dans `app/src/main/assets/www/data.js`. Ajoute des mots, des phrases ou des scènes, envoie la modification sur GitHub, et un nouvel APK est compilé tout seul.
