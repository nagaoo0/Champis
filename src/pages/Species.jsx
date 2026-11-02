import { Link, useParams } from 'react-router-dom'
import species from '../data/species.json'
import tree from '../data/key.json'
import { pathTo } from '../lib/key'
import EdibilityBadge from '../components/EdibilityBadge'
import Img from '../components/Img'
import NotFound from './NotFound'

export default function Species() {
  const { id } = useParams()
  const sp = species[id]
  if (!sp) return <NotFound />

  const confusions = (sp.confusions ?? []).filter((c) => species[c])
  const deadlyConfusions = confusions.filter((c) => species[c].edibility === 'mortel')
  const path = pathTo(id)

  return (
    <article>
      <h1 className="latin-title">{sp.latin}</h1>
      <p className="fr-title">{sp.fr}</p>
      <p><EdibilityBadge edibility={sp.edibility} /></p>

      {sp.edibility === 'mortel' && (
        <div className="alert alert-solid" role="alert">Espèce mortelle</div>
      )}
      {deadlyConfusions.length > 0 && (
        <div className="alert alert-soft" role="alert">
          Risque de confusion avec une espèce mortelle :{' '}
          {deadlyConfusions.map((c, i) => (
            <span key={c}>
              {i > 0 && ', '}
              <Link to={`/espece/${c}`} className="latin">{species[c].latin}</Link>
            </span>
          ))}
        </div>
      )}

      {sp.images?.length > 0 && (
        <div className="figures">
          {sp.images.map((name) => <Img key={name} name={name} alt={sp.latin} />)}
        </div>
      )}

      {sp.note && <p className="species-note">{sp.note}</p>}

      {confusions.length > 0 && (
        <section>
          <h2>Ne pas confondre avec</h2>
          <ul className="confusions">
            {confusions.map((c) => (
              <li key={c}>
                <Link to={`/espece/${c}`}>
                  <span className="latin">{species[c].latin}</span> <span className="fr">{species[c].fr}</span>
                </Link>
                <EdibilityBadge edibility={species[c].edibility} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Comment y arriver dans la clé</h2>
        {path ? (
          <ol className="path">
            {path.map((step, i) => (
              <li key={step.node}>
                <Link to={`/cle/${step.node}`} state={{ trail: path.slice(0, i) }}>{step.label}</Link>
                <span className="hint"> ({tree.nodes[step.node].title}, p. {tree.nodes[step.node].page})</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>Cette espèce n'est pas reliée à la clé.</p>
        )}
      </section>

      {sp.pages?.length > 0 && <p className="eyebrow">Livret p. {sp.pages.join(', ')}</p>}
    </article>
  )
}
