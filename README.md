# Champi

Clé d'identification des champignons sur le terrain, tirée d'un livret scanné (43 pages). Vite + React, site statique déployé sur Cloudflare Pages.

Aide pédagogique uniquement : ne consommez jamais un champignon sur la seule foi de cette application.

## Lancer

```bash
npm install
npm run dev
```

`npm run build` produit `dist/`. Sur Cloudflare Pages : commande `npm run build`, dossier de sortie `dist`. `public/_redirects` gère les routes de l'app.

## Organisation

- `source/pages/pNN.md` : transcription texte de chaque page du livret, à relire et corriger.
- `source/fragments/*.json` : la clé structurée par lot de pages (questions, espèces, cadrage des dessins). Format décrit dans `source/SCHEMA.md`. C'est la source de vérité des données.
- `src/data/` : généré, ne pas éditer à la main.
- `public/img/` : dessins découpés, générés.
- `tools/` : scripts d'extraction et de fusion.

## Corriger la clé

1. Modifier le fragment concerné dans `source/fragments/` (et le `.md` de la page pour garder le texte à jour).
2. `npm run data` : fusionne les fragments dans `src/data/` et liste les problèmes (lien cassé, espèce inaccessible, image manquante).

## Régénérer les images

Le PDF n'est pas versionné. Placez-le dans `tools/in/livret.pdf`, puis :

```bash
python -m venv tools/.venv
tools/.venv/Scripts/python -m pip install pymupdf pillow
tools/.venv/Scripts/python tools/render_pages.py tools/in/livret.pdf
npm run data
tools/.venv/Scripts/python tools/crop.py
```

`crop.py` lit les cadres de `source/figures.json` (fractions de page) et écrit `public/img/*.webp` plus une planche de contrôle `tools/out/contact.html`.
