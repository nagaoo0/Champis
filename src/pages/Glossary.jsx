import extra from '../data/extra.json'
import { slug } from '../lib/text'
import Img from '../components/Img'

const terms = [...extra.glossary].sort((a, b) => a.term.localeCompare(b.term, 'fr'))

export default function Glossary() {
  return (
    <section>
      <h1>Glossaire</h1>
      <dl className="glossary">
        {terms.map((t) => (
          <div key={t.term} id={slug(t.term)} className="term">
            <dt>{t.term}</dt>
            <dd>
              {t.def}
              {t.img && <Img name={t.img} alt={t.term} />}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
