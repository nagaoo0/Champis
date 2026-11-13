import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { marked } from 'marked'
import { useTitle } from '../lib/title'

// same transcriptions as the booklet page, all loaded here
const texts = import.meta.glob('../../source/pages/*.md', { query: '?raw', import: 'default' })

// the "## Doutes" section of a page, up to the next heading
function doubtsOf(md) {
  const m = md.match(/^## Doutes\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)
  return m ? m[1].trim() : ''
}

const P = ({ n }) => <Link to={`/livret/${n}`}>p. {n}</Link>

export default function Doubts() {
  useTitle('Doutes')
  const [pages, setPages] = useState(null) // [{ n, html }]
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    Promise.all(
      Object.entries(texts).map(async ([path, load]) => ({
        n: Number(path.match(/p(\d+)\.md$/)[1]),
        html: marked.parse(doubtsOf(await load())),
      })),
    )
      .then((all) => setPages(all.filter((p) => p.html).sort((a, b) => a.n - b.n)))
      .catch(() => setFailed(true))
  }, [])

  return (
    <section>
      <h1>Doutes de transcription</h1>

      <h2>À vérifier avec l'autrice</h2>
      <ul>
        <li>Page <P n={11} /> : <i className="latin">Xerocomellus chrysenteron</i> est cité deux fois.</li>
        <li>Pages <P n={27} /> et <P n={28} /> : <i className="latin">Lactarius blennius</i>.</li>
        <li>
          Pages <P n={29} /> et <P n={30} /> : <i className="latin">Russula ochroleuca</i>,{' '}
          <i className="latin">Russula atropurpurea</i>, <i className="latin">Russula artesiana</i>.
        </li>
        <li>
          Pages <P n={29} /> et <P n={31} /> : <i className="latin">Russula exalbicans</i>,{' '}
          <i className="latin">Russula velenovskyi</i>.
        </li>
      </ul>

      <h2>Notes page par page</h2>
      {failed && <p>Textes indisponibles hors connexion.</p>}
      {!pages && !failed && <p>Chargement…</p>}
      {pages?.map(({ n, html }) => (
        <div key={n} className="doubts-page">
          <h3><Link to={`/livret/${n}`}>Page {n}</Link></h3>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ))}
    </section>
  )
}
