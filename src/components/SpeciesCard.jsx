import { Link } from 'react-router-dom'
import species from '../data/species.json'
import { useExternal } from '../lib/external'
import EdibilityBadge from './EdibilityBadge'
import Photo from './Photo'

export default function SpeciesCard({ id, compact = false }) {
  const external = useExternal()
  const sp = species[id]
  if (!sp) return null
  const photo = external[id]?.photos?.[0]
  return (
    <Link to={`/espece/${id}`} className={compact ? 'species-card compact' : 'species-card'}>
      <span className="card-photo" aria-hidden="true">
        {photo && <Photo src={photo.thumb} />}
      </span>
      <span className="species-card-text">
        <span className="latin">{sp.latin}</span>
        <span className="fr">{sp.fr}</span>
        <EdibilityBadge edibility={sp.edibility} />
      </span>
    </Link>
  )
}
