// french common names missing from the booklet, taken from the title of the french wikipedia page
// usage: npm run frnames   (needs src/data/external.json from npm run external)
// a title that starts with the latin genus is not a common name, so it is skipped
import { readFileSync, writeFileSync } from 'node:fs'

const species = JSON.parse(readFileSync('src/data/species.json', 'utf8'))
const external = JSON.parse(readFileSync('src/data/external.json', 'utf8'))

const names = {}
let missing = 0
for (const [id, sp] of Object.entries(species)) {
  if (sp.fr) continue
  missing++
  const url = external[id]?.wikipedia
  if (!url) continue
  const title = decodeURIComponent(url.split('/wiki/')[1] ?? '').replace(/_/g, ' ')
  const genus = sp.latin.split(' ')[0]
  if (!title || title.includes('(') || title.split(' ')[0] === genus) continue
  names[id] = title
}

writeFileSync('src/data/frnames.json', JSON.stringify(names, null, 1) + '\n')
console.log(`${missing} species without a french name, ${Object.keys(names).length} found`)
