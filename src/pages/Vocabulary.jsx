import { Link } from 'react-router-dom'
import tree from '../data/key.json'
import { termsOfNode } from '../lib/glossary'
import { slug } from '../lib/text'
import { useTitle } from '../lib/title'

const nodes = Object.entries(tree.nodes)
  .map(([id, node]) => ({ id, node, terms: termsOfNode(node) }))
  .filter((n) => n.terms.length > 0)

export default function Vocabulary() {
  useTitle('Vocabulaire des questions')
  return (
    <section>
      <h1>Vocabulaire des questions</h1>
      <p>{nodes.length} questions de la clé utilisent des termes du glossaire.</p>
      {nodes.map(({ id, node, terms }) => (
        <div key={id} className="vocab-node">
          <p className="eyebrow">{node.title} · p. {node.page}</p>
          <p><Link to={`/cle/${id}`}>{node.question}</Link></p>
          <dl>
            {terms.map((t) => (
              <div key={t.term} className="terms-item">
                <div>
                  <dt><Link to={`/glossaire#${slug(t.term)}`}>{t.term}</Link></dt>
                  <dd>{t.def}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  )
}
