# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Champi is a French mushroom identification web app built from a scanned field-guide booklet by Aurélie Sanchez, a teacher who is the author of the key (43 pages, a dichotomous key inspired by Courtecuisse). Vite + React 19 + react-router 7, static, deployed as a Cloudflare Worker with static assets (Workers Builds on the GitHub remote, config in wrangler.jsonc; do not add a _redirects SPA rule, it loops on Workers). All UI text is French.

## Commands

```bash
npm run dev      # dev server on :5173
npm run build    # runs the data check first (a broken key fails the build), then outputs dist/, deployed by "npx wrangler deploy"
npm run data     # merge source/fragments into src/data and check the key (exit 1 on problems)
npm run external # ~10 min: wikidata links + commons/inaturalist photos into src/data/external.json
npm run frnames  # french names the booklet lacks, from french wikipedia titles, into src/data/frnames.json (merged by npm run data, the booklet name always wins)
```

`tools/fetch_external.js` matches species on the Wikidata taxon name (P225). Booklet spellings that do not match go in its `NAME_FIX` map. Photos are hotlinked, never downloaded, and hidden if the host stops serving them (`components/Photo.jsx`). `external.json` is big, so `lib/external.js` loads it lazily with `useExternal()`: never import it directly. Licenses are limited to CC BY, CC BY-SA, CC BY-NC, CC0 and public domain, and the author is always shown.

There is no test suite and no linter. `npm run data` is the integrity check: it reports broken `next` links, missing species or images, unreachable nodes and species, duplicate node or figure ids, and edibility conflicts between pages.

Image pipeline (Python venv in `tools/.venv`, PyMuPDF + Pillow; the PDF is not versioned, it lives in `tools/in/livret.pdf`):

```bash
tools/.venv/Scripts/python -I tools/render_pages.py tools/in/livret.pdf   # pages -> tools/out/pages/pNN.png (p31 rotated) + public/livret/pNN.webp
tools/.venv/Scripts/python -I tools/crop.py                               # source/figures.json -> public/img/*.webp
```

## Data flow

`source/fragments/*.json` is the source of truth, one file per lot of booklet pages, in the format described in `source/SCHEMA.md`. `source/pages/pNN.md` is the faithful text transcription of each page (the "editable text"), kept in sync by hand.

`tools/build_data.js` merges the fragments into generated files. Never edit these by hand:
- `src/data/key.json`: `{ start: "p03", nodes }`. A node is one question with choices, and each choice has either `next` (node id) or `species` (species id).
- `src/data/species.json`: one entry per species, merged across pages. When pages disagree on edibility the most severe one wins (`mortel` > `toxique` > `comestible` > `inconnu`).
- `src/data/extra.json`: a copy of `general-extra.json` (glossary, observation guide, bibliography).
- `source/figures.json`: every drawing with its crop box in page fractions, read by `crop.py`.

Key conventions:
- Node ids are `pNN-keyword`. Cross-page references must use the shared anchors listed in SCHEMA.md (`p27` lactaires, `p37` cortinaires…).
- Species ids are the latin name slugged.
- Figure names are `pNN-<printed number>`, or `pNN-a` when the drawing has no number. Pictograms from pages 1-2 are `picto-*` and `silhouette-*`.
- The key is a graph, not a tree: species appear on several paths, and there are loops (p28 points back to p27). `src/lib/key.js` handles this with seen sets.
- Edibility is only what the booklet marks: ☺ comestible, skull toxique, skull plus "mortel" = mortel, no marker = inconnu. Never infer "comestible". This is a public site, so treat edibility data as safety-critical.

## App structure

`src/App.jsx` holds the routes and layout (the footer carries the safety disclaimer). The pages are `/cle/:nodeId` (guided key), `/espece/:id`, `/catalogue`, `/glossaire`, `/guide`, `/a-propos` (credits, disclaimer, link to report errors) and `/livret/:n`. The last one shows the scan next to `source/pages/pNN.md`, rendered with `marked` and lazy loaded through `import.meta.glob`.

`src/lib/key.js` provides:
- `reachableSpecies(nodeId)`, used for the "N espèces possibles" counter and the "Je ne sais pas" panel.
- `pathTo(speciesId)`, the shortest path from p03, shown on species pages.

The breadcrumb lives in react-router `location.state.trail`. Images are `/img/<name>.webp`, rendered through `components/Img.jsx`, which hides itself on error. Styling is a single `src/styles.css` with color tokens on `:root` ("carnet naturaliste" look: cream paper, brown ink, moss green, danger red).

## Conventions from the owner

- Write code for humans: easy to read, modify and fix. Do not over-engineer, and add no dependencies, TypeScript or CSS framework without a reason.
- Keep comments minimal, short and lowercase.
- Use no em dashes in code, UI text or docs.
- Git: commit and push to `main` on both remotes (`origin` = Gitea, `github` = GitHub). Never add a Co-Authored-By line or mention Claude in commit messages.
