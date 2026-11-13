// merges source/fragments/*.json into src/data/, then checks the key
// usage: node tools/build_data.js
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

const FRAG = 'source/fragments/'
const SEVERITY = ['inconnu', 'comestible', 'toxique', 'mortel']

const nodes = {}
const species = {}
const figures = {}
const problems = []

const union = (a = [], b = []) => [...new Set([...a, ...b])]

for (const file of readdirSync(FRAG).filter(f => f.endsWith('.json') && f !== 'general-extra.json')) {
  const frag = JSON.parse(readFileSync(FRAG + file, 'utf8'))

  for (const [id, node] of Object.entries(frag.nodes ?? {})) {
    if (nodes[id]) problems.push(`node ${id} defined twice (${file})`)
    nodes[id] = node
  }

  for (const [id, sp] of Object.entries(frag.species ?? {})) {
    const old = species[id]
    if (!old) { species[id] = { confusions: [], images: [], pages: [], ...sp }; continue }
    // same species on several pages: keep the most severe edibility, to stay on the safe side
    if (old.edibility !== sp.edibility) {
      problems.push(`edibility conflict on ${id}: ${old.edibility} vs ${sp.edibility} (${file})`)
      if (SEVERITY.indexOf(sp.edibility) > SEVERITY.indexOf(old.edibility)) old.edibility = sp.edibility
    }
    if (sp.note && !old.note?.includes(sp.note)) old.note = old.note ? `${old.note} ${sp.note}` : sp.note
    old.fr ||= sp.fr
    old.current ||= sp.current
    old.confusions = union(old.confusions, sp.confusions)
    old.images = union(old.images, sp.images)
    old.pages = union(old.pages, sp.pages).sort((a, b) => a - b)
  }

  for (const fig of frag.figures ?? []) {
    if (figures[fig.name]) problems.push(`figure ${fig.name} defined twice (${file})`)
    figures[fig.name] = fig
    // figures linked to a species show up on its page even if the agent forgot the images field
    if (fig.species && species[fig.species]) species[fig.species].images = union(species[fig.species].images, [fig.name])
  }
}

// second pass, figures can come before their species in file order
for (const fig of Object.values(figures)) {
  if (fig.species && species[fig.species]) species[fig.species].images = union(species[fig.species].images, [fig.name])
}

// french names the booklet lacks, fetched by tools/fetch_fr_names.js (the booklet always wins)
try {
  const fr = JSON.parse(readFileSync('src/data/frnames.json', 'utf8'))
  for (const [id, name] of Object.entries(fr)) if (species[id] && !species[id].fr) species[id].fr = name
} catch {
  // file is optional
}

// checks
const START = 'p03'
const seenNodes = new Set()
const seenSpecies = new Set()
const walk = id => {
  if (seenNodes.has(id) || !nodes[id]) return
  seenNodes.add(id)
  for (const c of nodes[id].choices) {
    if (c.next) walk(c.next)
    if (c.species) seenSpecies.add(c.species)
  }
}
walk(START)

for (const [id, node] of Object.entries(nodes)) {
  if (!node.choices?.length) problems.push(`node ${id} has no choices`)
  for (const c of node.choices ?? []) {
    if (c.next && !nodes[c.next]) problems.push(`node ${id}: next "${c.next}" missing`)
    if (c.species && !species[c.species]) problems.push(`node ${id}: species "${c.species}" missing`)
    if (c.img && !figures[c.img]) problems.push(`node ${id}: img "${c.img}" missing`)
    if (c.next && c.species) problems.push(`node ${id}: choice has next and species`)
  }
  if (!seenNodes.has(id)) problems.push(`node ${id} unreachable from ${START}`)
}
for (const [id, sp] of Object.entries(species)) {
  if (!seenSpecies.has(id)) problems.push(`species ${id} not reachable in the key`)
  for (const c of sp.confusions) if (!species[c]) problems.push(`species ${id}: confusion "${c}" missing`)
  for (const i of sp.images) if (!figures[i]) problems.push(`species ${id}: image "${i}" missing`)
  if (!SEVERITY.includes(sp.edibility)) problems.push(`species ${id}: bad edibility "${sp.edibility}"`)
}

const json = v => JSON.stringify(v, null, 1)
writeFileSync('src/data/key.json', json({ start: START, nodes }))
writeFileSync('src/data/species.json', json(species))
writeFileSync('source/figures.json', json(Object.values(figures)))
writeFileSync('src/data/extra.json', readFileSync(FRAG + 'general-extra.json', 'utf8'))

console.log(`${Object.keys(nodes).length} nodes, ${Object.keys(species).length} species, ${Object.keys(figures).length} figures`)
console.log(problems.length ? problems.join('\n') : 'no problems')
process.exitCode = problems.length ? 1 : 0
