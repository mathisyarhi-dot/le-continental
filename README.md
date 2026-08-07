# Le Continental Sea Palace — Site vitrine

Site web une page (mobile-first), bilingue FR/EN, du café-restaurant et bar
à sushi **Le Continental Sea Palace**, à l'entrée de la corniche de Mehdia
(Kénitra, Maroc) : présentation, carte complète (86 plats), petits-déjeuners
signature, bar à sushi, galerie photo, avis, réservation (WhatsApp/tél.) et
carte Google Maps.

C'est un **site statique** (HTML + CSS + JavaScript) : aucune étape de build
n'est nécessaire pour le déployer. Il peut être mis en ligne tel quel.

---

## 🚀 Mettre en ligne sur Vercel (sans rien installer)

1. Crée un dépôt sur **GitHub** (bouton « New repository »).
2. **Téléverse tout le contenu de ce dossier** à la racine du dépôt
   (glisser-déposer les fichiers sur la page GitHub, ou via Git — voir plus bas).
3. Va sur **[vercel.com](https://vercel.com)** → connecte-toi avec GitHub →
   **Add New… → Project** → choisis ton dépôt → **Import**.
4. Réglages d'import — laisse tout par défaut :
   - **Framework Preset : Other**
   - **Build Command :** *(vide)*
   - **Output Directory :** *(vide / racine)*
5. Clique **Deploy**. En ~20 secondes ton site est en ligne avec une URL
   `…vercel.app`. ✅
6. Pour brancher `lecontinental.ma` : Vercel → ton projet → **Settings → Domains**
   → ajoute le domaine → suis les instructions DNS chez ton registrar.

> Chaque fois que tu pousses une modification sur GitHub, Vercel redéploie
> automatiquement.

### Via Git en ligne de commande (optionnel)

```bash
cd le-continental
git init
git add .
git commit -m "Site Le Continental Sea Palace"
git branch -M main
git remote add origin https://github.com/<ton-compte>/le-continental.git
git push -u origin main
```

---

## Organisation des fichiers

```
le-continental/
├── index.html          ← page FR (racine, langue par défaut)
├── en/
│   └── index.html      ← page EN
├── css/
│   └── style.css       ← tous les styles (jetons + sections)
├── js/
│   └── main.js         ← burger, onglets de la carte, badge ouvert/fermé
├── assets/              ← logos (PNG, détourés depuis l'avatar du resto)
├── photos/               ← vide au départ, voir « Photos » ci-dessous
├── content/              ← données sources + générateur (voir plus bas)
├── favicon-16.png, favicon-32.png, apple-touch-icon.png, og.jpg
├── robots.txt
├── sitemap.xml
└── vercel.json
```

## Modifier le contenu (prix, textes, horaires…)

Les deux pages (`index.html` et `en/index.html`) sont **générées** à partir
des fichiers JSON dans `content/`, pour éviter de devoir répéter un
changement dans les deux langues à la main.

1. Modifie le JSON concerné dans `content/` (ex. `content/menu.json` pour
   changer un prix, `content/fr.json`/`content/en.json` pour un texte
   d'interface, `content/info.json` pour le téléphone/adresse/horaires).
2. Régénère les deux pages : `node content/generate.mjs` (nécessite
   [Node.js](https://nodejs.org)).
3. Vérifie le rendu (`npx http-server .` ou ouvre `index.html` dans un
   navigateur), commit, push — Vercel redéploie automatiquement.

Le dossier `content/` n'est **pas** chargé par le site déployé (Vercel sert
uniquement `index.html`/`en/index.html`) — c'est un outil pour toi, pas une
dépendance de production. Tu peux aussi modifier `index.html`/`en/index.html`
directement à la main si tu préfères éviter Node — dans ce cas, pense à
répercuter le même changement dans le second fichier.

## Photos

Le restaurant n'a pas encore fourni ses visuels : chaque emplacement affiche
un placeholder rayé crème avec une légende expliquant ce qui doit y aller —
ça sert de brief photo. Pour ajouter une vraie photo, dépose le fichier au
chemin exact attendu dans `photos/` puis régénère (`node content/generate.mjs`) :

| Emplacement | Fichier attendu | Ratio |
|---|---|---|
| Hero principal (terrasse, fin de journée) | `photos/hero-terrasse.webp` | 4:5 |
| Hero secondaire — petit-déj dressé | `photos/hero-petit-dej.webp` | 1:1 |
| Hero secondaire — comptoir sushi | `photos/hero-sushi.webp` | 1:1 |
| Carte petit-déj — Sabah Fès | `photos/petit-dej-sabah-fes.webp` | 4:3 |
| Carte petit-déj — Norvégien Light | `photos/petit-dej-norvegien.webp` | 4:3 |
| Carte petit-déj — Le Port | `photos/petit-dej-le-port.webp` | 4:3 |
| Bar à sushi | `photos/sushi-comptoir.webp` | 4:5 |
| Galerie — large | `photos/galerie/01.webp` | 3:2 |
| Galerie — verticale | `photos/galerie/02.webp` | 3:4 |
| Galerie — carrées ×3 | `photos/galerie/03.webp`, `04.webp`, `05.webp` | 1:1 |

`.jpg`/`.jpeg`/`.png` marchent aussi comme fallback si tu n'as pas de WebP.
Les noms viennent de `content/gallery.json` (`file`) et
`content/signature.json` (`photo`) — change le nom là plutôt que de renommer
ta photo.

## À obtenir du propriétaire avant mise en ligne

- Le logo vectoriel (SVG ou AI) — les PNG actuels sont détourés depuis un raster
- Les photos, aux emplacements et ratios ci-dessus
- La carte du bar à sushi (plats et prix — la structure de page est prête,
  voir l'onglet « Bar à sushi » de `content/menu.json`)
- Confirmation des prix relevés et des horaires
- L'URL exacte de la page Facebook (`content/info.json` → `social.facebook`)
- Les coordonnées GPS exactes (`content/info.json` → `address.geo`) et les
  accès à la fiche Google Business, ou l'autorisation de la créer

## Notes techniques

- **Bilingue réel** : FR à la racine, EN sous `/en/`, avec `hreflang`
  réciproques et une entrée JSON-LD `Restaurant` par langue (pas de bascule
  JS côté client — de vraies URLs, meilleur pour le référencement local).
- **Aucun formulaire de réservation** : WhatsApp (`wa.me`) et `tel:`
  uniquement, message pré-rempli selon la langue.
- **JS minimal** (`js/main.js`) : burger mobile, onglets de la carte, badge
  ouvert/fermé (recalculé côté client toutes les 60 s). Pas de framework,
  pas de bibliothèque de carrousel/lightbox.
- **Emplacements photo** : rayés crème avec légende tant qu'aucun fichier
  n'existe au chemin attendu — pas de widget d'import en ligne (ça n'a de
  sens que dans l'outil de design qui a produit la maquette).
