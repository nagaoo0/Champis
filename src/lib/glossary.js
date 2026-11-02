import extra from '../data/extra.json'

// words too common in the key to be worth underlining everywhere
const SKIP = new Set(['pied', 'chapeau', 'lamelles', 'lamelle', 'exemplaire mature'])
// "lames decurrentes" is often written "tres decurrentes": also match the qualifier alone
const QUALIFIER_OF = /^(lames|chair|silhouette) /
// other spellings used by the key
const ALIASES = { sporee: ['spore'] }

// lowercase, accents removed, one char for one char so match positions stay valid
const fold = (text) => [...text].map((c) => c.normalize('NFD')[0]).join('').toLowerCase()

function wordsFor(term) {
  const base = fold(term).replace(/\s*\(.*\)/, '')
  const words = base.split(' / ')
  if (QUALIFIER_OF.test(base)) words.push(base.replace(QUALIFIER_OF, ''))
  words.push(...(ALIASES[base] ?? []))
  return words.filter((w) => !SKIP.has(w))
}

const entries = extra.glossary
  .flatMap((entry) => wordsFor(entry.term).map((word) => ({ word, entry })))
  .sort((a, b) => b.word.length - a.word.length) // longest first: "volve en sac" before "volve"

const pattern = new RegExp(
  `(?<![a-z])(${entries.map((e) => e.word.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')).join('|')})(s|x|es)?(?![a-z])`,
  'g',
)
const entryOf = new Map(entries.map((e) => [e.word, e.entry]))

// [{ text, entry? }] pieces of a string, entry set on glossary words
export function splitTerms(text = '') {
  const pieces = []
  let last = 0
  for (const m of fold(text).matchAll(pattern)) {
    if (m.index > last) pieces.push({ text: text.slice(last, m.index) })
    pieces.push({ text: text.slice(m.index, m.index + m[0].length), entry: entryOf.get(m[1]) })
    last = m.index + m[0].length
  }
  if (last < text.length) pieces.push({ text: text.slice(last) })
  return pieces
}

// glossary entries used in some texts, each once, in order of appearance
export function termsIn(texts) {
  const found = new Set()
  for (const text of texts) for (const p of splitTerms(text)) if (p.entry) found.add(p.entry)
  return [...found]
}
