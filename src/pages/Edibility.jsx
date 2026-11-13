import { Link } from 'react-router-dom'
import species from '../data/species.json'
import { useTitle } from '../lib/title'
import EdibilityBadge from '../components/EdibilityBadge'

const ORDER = [
  ['mortel', 'Mortelles'],
  ['toxique', 'Toxiques'],
  ['comestible', 'Comestibles'],
  ['inconnu', 'Comestibilité inconnue'],
]
const entries = Object.entries(species).sort((a, b) => a[1].latin.localeCompare(b[1].latin))

export default function Edibility() {
  useTitle('Comestibilités')
  return (
    <section className="edibility-review">
      <h1>Comestibilités du livret</h1>
      <p>
        La comestibilité vient uniquement des marques du livret : ☺ comestible, tête de mort toxique,
        tête de mort avec la mention « mortel » mortel, aucune marque inconnu. Chaque ligne renvoie aux pages
        du livret pour vérifier. Les <Link to="/doutes">doutes de transcription</Link> sont réunis à part.
      </p>

      {ORDER.map(([kind, title]) => {
        const rows = entries.filter(([, sp]) => (sp.edibility || 'inconnu') === kind)
        return (
          <div key={kind}>
            <h2>{title} ({rows.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Nom latin</th>
                  <th>Nom français</th>
                  <th>Comestibilité</th>
                  <th>Livret</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([id, sp]) => (
                  <tr key={id}>
                    <td><Link to={`/espece/${id}`} className="latin">{sp.latin}</Link></td>
                    <td>{sp.fr}</td>
                    <td><EdibilityBadge edibility={sp.edibility} /></td>
                    <td>
                      {sp.pages?.map((p, i) => (
                        <span key={p}>{i > 0 && ', '}<Link to={`/livret/${p}`}>p. {p}</Link></span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </section>
  )
}
