# Léa – secrétaire virtuelle (Android)

Application de discussion avec Léa, une secrétaire virtuelle IA (personnage fictif) :
conversation libre, conseils, organisation, et photos d'elle générées selon la pose ou la tenue demandée.

## Installer
1. Onglet **Releases** → « Léa – dernière version » → `Lea-secretaire.apk` → télécharger sur le téléphone.
2. Ouvrir le fichier et autoriser « Installer des applis inconnues ».
3. Au premier lancement, coller une clé Google Gemini gratuite (https://aistudio.google.com/apikey), sans carte bancaire.

## Utiliser
- Écris un message puis ➤ pour discuter.
- Décris une pose ou une tenue puis 📷 pour recevoir une photo (environ 1 minute).
- ⚙️ : changer la clé ou effacer la conversation.

## Compilation
Chaque push sur la branche `lea-secretaire` déclenche GitHub Actions (`.github/workflows/lea-apk.yml`),
qui compile l'APK et le publie dans la release `lea-latest`.
