import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { marked } from 'marked'
import tree from '../data/key.json'
import species from '../data/species.json'
import EdibilityBadge from '../components/EdibilityBadge'
import NotFound from './NotFound'
import { useTitle } from '../lib/title'

// page transcriptions, loaded one at a time
const texts = import.meta.glob('../../source/pages/*.md', { query: '?raw', import: 'default' })
const textOf = Object.fromEntries(Object.entries(texts).map(([path, load]) => [Number(path.match(/p(\d+)\.md$/)[1]), load]))
const PAGES = Object.keys(textOf).map(Number).sort((a, b) => a - b)
const pad = (n) => String(n).padStart(2, '0')

// first key title found on each page, to name the pages in the selector
const titleOf = {}
for (const node of Object.values(tree.nodes)) titleOf[node.page] ??= node.title

export default function Booklet() {
  const n = Number(useParams().n)
  return textOf[n] ? <BookletPage key={n} n={n} /> : <NotFound />
}

function BookletPage({ n }) {
  useTitle(`Livret p. ${n}`)
  const [html, setHtml] = useState('')
  const navigate = useNavigate()
  const i = PAGES.indexOf(n)
  const prev = PAGES[i - 1]
  const next = PAGES[i + 1]
  const nodes = Object.entries(tree.nodes).filter(([, node]) => node.page === n)
  const onPage = Object.entries(species).filter(([, sp]) => sp.pages?.includes(n))

  useEffect(() => {
    textOf[n]().then((md) => setHtml(marked.parse(md)))
  }, [n])

  return (
    <section>
      <h1>Livret, page {n}</h1>
      <nav className="booklet-nav" aria-label="Pages du livret">
        {prev ? <Link to={`/livret/${prev}`} className="btn btn-ghost">← p. {prev}</Link> : <span />}
        <select value={n} onChange={(e) => navigate(`/livret/${e.target.value}`)} aria-label="Aller à la page">
          {PAGES.map((p) => (
            <option key={p} value={p}>p. {p}{titleOf[p] ? ` · ${titleOf[p]}` : ''}</option>
          ))}
        </select>
        {next ? <Link to={`/livret/${next}`} className="btn btn-ghost">p. {next} →</Link> : <span />}
      </nav>

      <div className="booklet">
        <div className="booklet-text">
          <p className="hint">Transcription du scan, à vérifier en cas de doute.</p>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <a className="booklet-scan" href={`/livret/p${pad(n)}.webp`} target="_blank" rel="noopener">
          <img src={`/livret/p${pad(n)}.webp`} alt={`Scan de la page ${n} du livret`} />
          <span className="hint">Ouvrir le scan en grand</span>
        </a>
      </div>

      {(nodes.length > 0 || onPage.length > 0) && (
        <div className="booklet-links">
          {nodes.length > 0 && (
            <div>
              <h2>Questions de cette page</h2>
              <ul>
                {nodes.map(([id, node]) => (
                  <li key={id}><Link to={`/cle/${id}`}>{node.question}</Link></li>
                ))}
              </ul>
            </div>
          )}
          {onPage.length > 0 && (
            <div>
              <h2>Espèces de cette page</h2>
              <ul>
                {onPage.map(([id, sp]) => (
                  <li key={id}>
                    <Link to={`/espece/${id}`} className="latin">{sp.latin}</Link> <EdibilityBadge edibility={sp.edibility} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
