import { Link, useParams } from 'react-router-dom'
import species from '../data/species.json'
import { useExternal } from '../lib/external'
import Photo from '../components/Photo'
import tree from '../data/key.json'
import { pathTo, trailQuery } from '../lib/key'
import { useTitle } from '../lib/title'
import EdibilityBadge from '../components/EdibilityBadge'
import NotFound from './NotFound'

const LINKS = [
  ['wikipedia', 'Wikipédia'],
  ['inpn', 'INPN'],
  ['mycodb', 'MycoDB'],
  ['mycobank', 'MycoBank'],
  ['inaturalist', 'iNaturalist'],
  ['gbif', 'GBIF'],
]

export default function Species() {
  const { id } = useParams()
  const external = useExternal()
  const sp = species[id]
  useTitle(sp?.latin)
  if (!sp) return <NotFound />

  const confusions = (sp.confusions ?? []).filter((c) => species[c])
  const deadlyConfusions = confusions.filter((c) => species[c].edibility === 'mortel')
  const path = pathTo(id)
  const [hero, ...more] = external[id]?.photos ?? []
  const links = LINKS.filter(([key]) => external[id]?.[key])

  return (
    <article>
      <div className={hero ? 'species-top has-photo' : 'species-top'}>
        <div className="species-head">
          <h1 className="latin-title">{sp.latin}</h1>
          <p className="fr-title">{sp.fr}</p>
          {sp.current && (
            <p>Nom actuel : <i className="latin">{sp.current}</i> <small>(photos et liens sous ce nom)</small></p>
          )}
          {sp.edibility === 'mortel' ? (
            <div className="alert alert-solid" role="alert"><span aria-hidden="true">☠</span> Espèce mortelle</div>
          ) : (
            <p><EdibilityBadge edibility={sp.edibility} /></p>
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
        </div>

        {hero && (
          <figure className="species-hero">
            <Photo src={hero.thumb} alt={sp.latin} />
            <figcaption>
              <a href={hero.page} target="_blank" rel="noopener">Photo : {hero.author}, {hero.license}</a>
              <span className="hint">Photo indicative : une photo ne suffit jamais à identifier un champignon.</span>
            </figcaption>
          </figure>
        )}

        {sp.note && <p className="species-note">{sp.note}</p>}
      </div>

      {more.length > 0 && (
        <section>
          <h2>Autres photos</h2>
          <div className="photos">
            {more.map((p) => (
              <figure key={p.thumb}>
                <Photo src={p.thumb} alt={sp.latin} />
                <figcaption>
                  <a href={p.page} target="_blank" rel="noopener">Photo : {p.author}, {p.license}</a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {links.length > 0 && (
        <section>
          <h2>En savoir plus</h2>
          <ul className="external-links">
            {links.map(([key, label]) => (
              <li key={key}><a href={external[id][key]} target="_blank" rel="noopener">{label}</a></li>
            ))}
          </ul>
        </section>
      )}

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
                <Link to={`/cle/${step.node}${trailQuery(path.slice(0, i))}`}>{step.label}</Link>
                <span className="hint"> ({tree.nodes[step.node].title}, p. {tree.nodes[step.node].page})</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>Cette espèce n'est pas reliée à la clé.</p>
        )}
      </section>

      {sp.pages?.length > 0 && (
        <p className="eyebrow">
          Livret{' '}
          {sp.pages.map((p, i) => (
            <span key={p}>{i > 0 && ', '}<Link to={`/livret/${p}`}>p. {p}</Link></span>
          ))}
        </p>
      )}
    </article>
  )
}
