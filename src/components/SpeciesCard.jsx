import { Link } from 'react-router-dom'
import species from '../data/species.json'
import EdibilityBadge from './EdibilityBadge'
import Img from './Img'

export default function SpeciesCard({ id, compact = false }) {
  const sp = species[id]
  if (!sp) return null
  return (
    <Link to={`/espece/${id}`} className={compact ? 'species-card compact' : 'species-card'}>
      {sp.images?.[0] && <Img name={sp.images[0]} />}
      <span className="species-card-text">
        <span className="latin">{sp.latin}</span>
        <span className="fr">{sp.fr}</span>
        <EdibilityBadge edibility={sp.edibility} />
      </span>
    </Link>
  )
}
