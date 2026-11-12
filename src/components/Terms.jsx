import { Link } from 'react-router-dom'
import { splitTerms } from '../lib/glossary'
import { slug } from '../lib/text'
import Img from './Img'

// a tap shows the definition (onTerm), the click is not passed on to the choice button
// terms in seen (shown earlier on the page) and repeats in this text stay plain
export function Marked({ text, onTerm, seen }) {
  const shown = new Set(seen)
  return splitTerms(text).map((p, i) => {
    const first = p.entry && !shown.has(p.entry)
    if (first) shown.add(p.entry)
    return first ? (
      <span
        key={i}
        className="term-mark"
        title={p.entry.def}
        onClick={(e) => {
          e.stopPropagation()
          onTerm?.(p.entry)
        }}
      >
        {p.text}
      </span>
    ) : (
      p.text
    )
  })
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
