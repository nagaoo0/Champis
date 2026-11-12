// fetches external links and openly licensed photos (wikidata + wikimedia commons) into src/data/external.json
// usage: npm run external
import { readFileSync, writeFileSync } from 'node:fs'

const HEADERS = { 'User-Agent': 'champi-build/0.1 (https://github.com/nagaoo0/Champis)' }
const LICENSE_OK = /^(CC BY( |$)|CC BY-SA|CC0|Public domain|PD)/i
const FILE_SKIP = /map|range|distribution|drawing|illustration|diagram|spore|plate|tafel/i
const FIELDS = ['item', 'img', 'cat', 'taxref', 'mycobank', 'inat', 'gbif', 'fr']
const MAX_PHOTOS = 3

const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const unique = (list) => [...new Set(list)]

async function getJson(url, options) {
  for (let i = 1; i <= 4; i++) {
    const res = await fetch(url, { ...options, headers: { ...HEADERS, ...options?.headers } })
    if (res.ok) return res.json()
    await pause(2000 * i)
  }
  throw new Error('request failed: ' + url.slice(0, 120))
}

// booklet name -> name used on wikidata, a spelling or the current name (checked by hand, 2026-11)
const NAME_FIX = {
  'Laetiporus sulfureus': 'Laetiporus sulphureus',
  'Leccinum crocopodium': 'Leccinum crocipodium',
  'Marasmiellus androsaceus': 'Gymnopus androsaceus',
  'Entoloma rhodopollum': 'Entoloma rhodopolium',
  'Inocybe piriodora': 'Inocybe pyriodora',
  'Russula sylvestris': 'Russula silvestris',
  'Russula romelii': 'Russula romellii',
  'Agaricus silvicola': 'Agaricus sylvicola',
  'Cortinarius rufoolivaceus': 'Cortinarius rufo-olivaceus',
  'Lepista panaeola': 'Lepista panaeolus',
  'Tricholoma sulfureum': 'Tricholoma sulphureum',
  'Tricholoma terreum': 'Tricholoma terraria', // wikidata item Q27266 carries this taxon name
  'Polyporus durus': 'Picipes badius', // the synonym search lands on a tropical Nigroporus
  'Rozites caperatus': 'Cortinarius caperatus',
  'Coprinus micaceus': 'Coprinellus micaceus',
  'Coprinus plicatilis': 'Parasola plicatilis',
  'Collybia peronata': 'Gymnopus peronatus',
  'Lactarius necator': 'Lactarius turpis',
  'Gymnopilus spectabilis': 'Gymnopilus junonius',
  'Geastrum sessile': 'Geastrum fimbriatum',
  'Inocybe patouillardii': 'Inocybe erubescens',
  'Inocybe jurana': 'Inocybe adaequata',
  'Cuphophyllus niveus': 'Cuphophyllus virgineus',
  'Clavulina cristata': 'Clavulina coralloides',
  'Russula fageticola': 'Russula nobilis',
  'Lepiota josserandii': 'Lepiota subincarnata',
}

// ids ending in -spp look up the genus
const lookupName = (sp) => NAME_FIX[sp.latin] ?? sp.latin.replace(/ spp\.$/, '')

// name -> candidate items (one merged object per wikidata item)
// viaSynonym: the booklet name may be an outdated synonym, so look for items that list it with
// "taxon synonym" (P1420), in either direction
async function sparql(names, viaSynonym) {
  const match = viaSynonym
    ? '?old wdt:P225 ?name . { ?item wdt:P1420 ?old } UNION { ?old wdt:P1420 ?item }'
    : '?item wdt:P225 ?name .'
  const query = `SELECT ?name ?item ?img ?cat ?taxref ?mycobank ?inat ?gbif ?fr WHERE {
    VALUES ?name {${names.map((n) => `"${n}"`).join(' ')}} ${match}
    OPTIONAL{?item wdt:P18 ?img} OPTIONAL{?item wdt:P373 ?cat} OPTIONAL{?item wdt:P3186 ?taxref}
    OPTIONAL{?item wdt:P962 ?mycobank} OPTIONAL{?item wdt:P3151 ?inat} OPTIONAL{?item wdt:P846 ?gbif}
    OPTIONAL{?fr schema:about ?item; schema:isPartOf <https://fr.wikipedia.org/>} }`
  const data = await getJson('https://query.wikidata.org/sparql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/sparql-results+json' },
    body: new URLSearchParams({ query }),
  })
  const found = new Map()
  for (const row of data.results.bindings) {
    const items = found.get(row.name.value) ?? new Map()
    const merged = items.get(row.item.value) ?? {}
    for (const f of FIELDS) merged[f] ??= row[f]?.value
    items.set(row.item.value, merged)
    found.set(row.name.value, items)
  }
  await pause(1000)
  return found
}

const score = (item) => FIELDS.filter((f) => item[f]).length
const best = (items) => [...items].sort((a, b) => score(b) - score(a))[0]

async function sparqlAll(names, viaSynonym) {
  const found = new Map()
  for (let i = 0; i < names.length; i += 50) {
    console.log(`wikidata${viaSynonym ? ' (synonyms)' : ''} ${i}/${names.length}`)
    for (const [name, items] of await sparql(names.slice(i, i + 50), viaSynonym)) {
      found.set(name, [...(found.get(name) ?? []), ...items.values()])
    }
  }
  return found
}

const stripTags = (html) => html?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

// commons file pages (with imageinfo) -> photos, license and format filtered
function toPhotos(pages) {
  return Object.values(pages ?? {})
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .filter((p) => /\.(jpe?g|png)$/i.test(p.title) && !FILE_SKIP.test(p.title) && p.imageinfo)
    .map((p) => {
      const info = p.imageinfo[0]
      const meta = info.extmetadata ?? {}
      return {
        title: p.title.replace(/_/g, ' ').toLowerCase(),
        thumb: info.thumburl?.split('?')[0],
        page: info.descriptionurl,
        author: stripTags(meta.Artist?.value) || 'auteur inconnu',
        license: meta.LicenseShortName?.value,
        licenseUrl: meta.LicenseUrl?.value,
      }
    })
    .filter((p) => p.thumb && LICENSE_OK.test(p.license ?? ''))
}

const COMMONS = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=640'

async function commonsFiles(params) {
  const data = await getJson(`${COMMONS}&${params}`)
  await pause(200)
  return toPhotos(data.query?.pages)
}

// curated field photos of an inaturalist taxon. most are cc-by-nc, fine for this free site
const INAT_LICENSES = { 'cc-by': 'CC BY', 'cc-by-sa': 'CC BY-SA', 'cc-by-nc': 'CC BY-NC', 'cc-by-nc-sa': 'CC BY-NC-SA', cc0: 'CC0' }

async function inatPhotos(taxonId) {
  const data = await getJson(`https://api.inaturalist.org/v1/taxa/${taxonId}`)
  await pause(1000) // inaturalist asks for about one request per second
  return (data.results?.[0]?.taxon_photos ?? [])
    .map(({ photo }) => photo)
    .filter((p) => INAT_LICENSES[p.license_code])
    .map((p) => ({
      title: 'inat:' + p.id,
      thumb: p.medium_url,
      page: `https://www.inaturalist.org/photos/${p.id}`,
      author: p.attribution.replace(/^\(c\)\s*/, '').replace(/,? some rights reserved.*$/, '').replace(/,? no rights reserved.*$/, ''),
      license: INAT_LICENSES[p.license_code],
      licenseUrl: `https://creativecommons.org/licenses/${p.license_code.replace('cc-', '')}/4.0/`,
    }))
}

const fileTitle = (url) => 'File:' + decodeURIComponent(url.split('/').pop()).replace(/_/g, ' ')

const species = JSON.parse(readFileSync('src/data/species.json', 'utf8'))
const ids = Object.keys(species)
const names = unique(ids.map((id) => lookupName(species[id])))

const items = await sparqlAll(names, false)
const pick = (name) => (items.get(name) ? best(items.get(name)) : undefined)

// weak matches (no item or no photo): add synonyms, then for "var." names the plain species
const weak = names.filter((n) => !pick(n)?.img)
for (const [name, list] of await sparqlAll(weak, true)) items.set(name, [...(items.get(name) ?? []), ...list])
const stillEmpty = names.filter((n) => !pick(n) && n.includes(' var. '))
for (const name of stillEmpty) {
  const plain = name.split(' var. ')[0]
  const list = (await sparqlAll([plain], false)).get(plain)
  if (list) items.set(name, list)
}

// p18 images in one go, then the commons category of each species
const mainTitles = unique(names.map((n) => pick(n)?.img).filter(Boolean).map(fileTitle))
const mainPhotos = new Map()
for (let i = 0; i < mainTitles.length; i += 50) {
  const titles = encodeURIComponent(mainTitles.slice(i, i + 50).join('|'))
  for (const p of await commonsFiles(`titles=${titles}`)) mainPhotos.set(p.title, p)
}

const external = {}
const noMatch = []
for (const id of ids) {
  const sp = species[id]
  const name = lookupName(sp)
  const item = pick(name)
  const entry = {}
  if (!item) noMatch.push(sp.latin)
  else {
    entry.wikidata = item.item
    entry.wikipedia = item.fr
    entry.inpn = item.taxref && `https://inpn.mnhn.fr/espece/cd_nom/${item.taxref}`
    entry.mycobank = item.mycobank && `https://www.mycobank.org/page/Name%20details%20page/${item.mycobank}`
    entry.inaturalist = item.inat && `https://www.inaturalist.org/taxa/${item.inat}`
    entry.gbif = item.gbif && `https://www.gbif.org/species/${item.gbif}`
  }
  if (/^[A-Z][a-z]+ [a-z-]+/.test(sp.latin) && !sp.latin.endsWith(' spp.')) {
    const [genus, epithet] = sp.latin.split(' ')
    entry.mycodb = `https://www.mycodb.fr/fiche.php?genre=${genus}&espece=${epithet}`
  }

  const photos = []
  const main = item?.img && mainPhotos.get(fileTitle(item.img).toLowerCase())
  if (main) photos.push(main)
  // inaturalist field photos first, the commons category (often market or herbarium shots) only as a fallback
  try {
    const more = item?.inat ? await inatPhotos(item.inat) : []
    if (!more.length && item?.cat) {
      const cat = encodeURIComponent('Category:' + item.cat)
      more.push(...(await commonsFiles(`generator=categorymembers&gcmtype=file&gcmtitle=${cat}&gcmlimit=10`)))
    }
    for (const p of more) if (photos.length < MAX_PHOTOS && !photos.some((x) => x.title === p.title)) photos.push(p)
  } catch (err) {
    console.warn(`extra photos failed for ${sp.latin}: ${err.message}`)
  }
  entry.photos = photos.slice(0, MAX_PHOTOS).map(({ title, ...photo }) => photo)

  if (Object.values(entry).some((v) => v && v.length !== 0)) external[id] = entry
}

writeFileSync('src/data/external.json', JSON.stringify(external, null, 1) + '\n')

const withPhotos = Object.values(external).filter((e) => e.photos.length).length
const withLinks = Object.values(external).filter((e) => e.wikidata).length
console.log(`\n${ids.length} species: ${withLinks} with wikidata links, ${withPhotos} with photos, ${ids.length - Object.keys(external).length} with nothing`)
console.log(`no wikidata match (${noMatch.length}): ${noMatch.join(', ')}`)
