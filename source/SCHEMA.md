# Format des données

Source : `tools/out/pages/pNN.png` (rendu 200 dpi du livret, page NN = numéro imprimé).

Chaque lot de pages produit :

1. `source/pages/pNN.md` : transcription fidèle et complète de la page (titres, hiérarchie en listes imbriquées, gras/italique utiles, noms latins en italique). Marqueurs : `☺` comestible, `☠` toxique, `☠ **mortel**` mortel. Renvois gardés tels quels (« voir p. 37 »). Légendes de dessins à la fin sous `## Figures`. Texte illisible : `[illisible]`.
2. `source/fragments/<lot>.json` : `{ "nodes": {}, "species": {}, "figures": [] }`.

## nodes

Un nœud = une question de la clé (un couplet ou un groupe de choix au même niveau).

```json
"p10-pied-lisse": {
  "page": 10,
  "title": "Bolets : pied sans écailles",
  "question": "Le chapeau est-il visqueux ?",
  "intro": "texte optionnel affiché avant les choix (NB, mise en garde)",
  "choices": [
    { "label": "Chapeau visqueux ou collant", "hint": "jamais de réseau sur le pied", "next": "p10-suillus" },
    { "label": "Chapeau couvert d'écailles noirâtres", "hint": "pores anguleux grisâtres", "species": "strobilomyces-strobilaceus", "img": "p10-5" }
  ]
}
```

- `question` : question courte en français simple, déduite du couplet.
- `label` : le critère du livret, condensé mais fidèle. `hint` : le reste des détails du critère.
- Un choix a soit `next` (id de nœud), soit `species` (id d'espèce). Jamais les deux.
- `note` optionnel sur un choix pour les renvois secondaires (« si pied jaune, voir aussi… »).
- `img` optionnel : nom d'une figure (voir plus bas) qui illustre le critère.
- Ids de nœuds : `pNN-motcle`, en minuscules, sans accents.

### Ancres partagées entre lots

Ces ids doivent exister (créés par le lot qui possède la page) et sont les seuls à utiliser pour renvoyer vers une autre page :

| id | contenu |
|---|---|
| `p03` | clé générale (départ) |
| `p04` | lames sans voile général ni partiel |
| `p05` | hyménophore lisse infère/amphigène |
| `p07` | hyménophore lisse supère |
| `p08` | hyménophore interne |
| `p09` | polypores |
| `p10` | bolets |
| `p12` | lames décurrentes sans voile |
| `p14` | voile général sans anneau |
| `p15` | anneau ou armille, sans voile général |
| `p17` | cortine |
| `p20` | pied latéral ou absent (pleurotoïdes) |
| `p21` | pied nu, lames non décurrentes (sommaire A à E) |
| `p22-b` | sporée blanche et lames pâles |
| `p24-c` | sporée rose |
| `p25-d` | sporée ocre à brune |
| `p26-e` | sporée noire ou violacée |
| `p27` | lactaires |
| `p29` | russules |
| `p32` | amanites |
| `p34` | hygrophores |
| `p35` | lépiotes |
| `p36` | agarics |
| `p37` | cortinaires |
| `p39` | tricholomes |

Un renvoi vers une espèce d'une autre page se fait par son id d'espèce (`"species": "laccaria-laccata"`).

## species

```json
"boletus-edulis": {
  "latin": "Boletus edulis",
  "fr": "Cèpe de Bordeaux",
  "group": "Bolets",
  "edibility": "comestible",
  "note": "Pores blancs puis jaune verdâtre, réseau blanc sur le pied.",
  "confusions": ["tylopilus-felleus"],
  "images": ["p11-4"],
  "pages": [11]
}
```

- Id : nom latin en minuscules, espaces en tirets, sans « var. » (`amanita-phalloides-alba`). Groupes : `peziza-spp`.
- `edibility` : `comestible` (☺), `toxique` (☠), `mortel` (☠ + « mortel »), `inconnu` (aucun marqueur). Ne jamais déduire « comestible » sans ☺.
- `current` optionnel : nom accepté aujourd'hui quand le livret utilise un synonyme (`Rozites caperatus` : `Cortinarius caperatus`). Sert à chercher les photos et les liens, et s'affiche sur la fiche. Le nom du livret reste le nom principal. À poser sur une seule des entrées de l'espèce.
- `note` : caractères clés et remarques du livret (« comestible cuit, toxique cru », « indigeste », « inconsommable ! »). Court.
- `confusions` : ids des espèces citées dans « ne pas confondre avec », « attention à ».
- `group` : nom français du groupe tel que le titre de page (Bolets, Amanites, Russules…).

## figures

```json
{ "name": "p11-4", "page": 11, "box": [0.52, 0.10, 0.95, 0.38], "species": "boletus-edulis", "caption": "Cèpe de Bordeaux" }
```

- `name` : `pNN-<numéro imprimé>` ; dessins sans numéro : `pNN-a`, `pNN-b`…
- `box` : `[x0, y0, x1, y1]` en fractions (0 à 1) de la largeur et hauteur de la page. Large plutôt que serré : tout le dessin, ses légendes fléchées incluses, mais pas le texte de la clé voisin.
- `species` optionnel si le dessin est générique.

### Pictogrammes des pages 1 et 2 (noms réservés)

Utilisables par tous les lots dans `img` :
`picto-lames-libres`, `picto-lames-adnees`, `picto-lames-echancrees`, `picto-lames-decurrentes`,
`picto-chapeau-plat`, `picto-chapeau-campanule`, `picto-chapeau-conique`, `picto-chapeau-convexe`, `picto-chapeau-infundibuliforme`,
`picto-anneau-descendant`, `picto-anneau-ascendant`, `picto-cortine`, `picto-anneau-double`, `picto-anneau-coulissant`,
`picto-chair-fibreuse`, `picto-chair-grenue`,
`picto-pied-fusiforme`, `picto-pied-ventru`, `picto-pied-obese`, `picto-pied-radicant`, `picto-pied-bulbeux`, `picto-pied-clave`,
`picto-volve-sac`, `picto-volve-circoncise`, `picto-voile-friable`, `picto-anatomie`,
`picto-sporee`, `silhouette-clitocyboide`, `silhouette-collybioide`, `silhouette-mycenoide`, `silhouette-marasmioide`, `silhouette-tricholomoide`.
