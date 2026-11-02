import { Link } from 'react-router-dom'
import { splitTerms } from '../lib/glossary'
import { slug } from '../lib/text'
import Img from './Img'

// text with glossary words underlined (not links: they often sit inside a choice button)
export function Marked({ text }) {
  return splitTerms(text).map((p, i) =>
    p.entry ? <span key={i} className="term-mark" title={p.entry.def}>{p.text}</span> : p.text,
  )
}

export function TermsPanel({ entries }) {
  if (!entries.length) return null
  return (
    <details className="terms-panel">
      <summary>Vocabulaire de cette question ({entries.length})</summary>
      <dl>
        {entries.map((e) => (
          <div key={e.term} className="terms-item">
            {e.img && <Img name={e.img} alt={e.term} />}
            <div>
              <dt><Link to={`/glossaire#${slug(e.term)}`}>{e.term}</Link></dt>
              <dd>{e.def}</dd>
            </div>
          </div>
        ))}
      </dl>
    </details>
  )
}
