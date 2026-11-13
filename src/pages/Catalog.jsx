import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import species from '../data/species.json'
import { normalize } from '../lib/text'
import { useTitle } from '../lib/title'
import EdibilityBadge from '../components/EdibilityBadge'
import SpeciesCard from '../components/SpeciesCard'

const EDIBILITIES = ['comestible', 'toxique', 'mortel', 'inconnu']
const entries = Object.entries(species).sort((a, b) => a[1].latin.localeCompare(b[1].latin))
const groups = [...new Set(entries.map(([, sp]) => sp.group))].sort((a, b) => a.localeCompare(b, 'fr'))

export default function Catalog() {
  useTitle('Catalogue')
  const [params, setParams] = useSearchParams()
  const [group, setGroup] = useState('')
  const [selected, setSelected] = useState([]) // empty means all
  const q = params.get('q') ?? ''

  function toggle(edibility) {
    setSelected(selected.includes(edibility) ? selected.filter((e) => e !== edibility) : [...selected, edibility])
  }

  const needle = normalize(q.trim())
  const results = entries.filter(([, sp]) => {
    const text = normalize(`${sp.latin} ${sp.fr} ${sp.group} ${sp.note ?? ''}`)
    return (
      text.includes(needle) &&
      (!group || sp.group === group) &&
      (selected.length === 0 || selected.includes(sp.edibility))
    )
  })

  return (
    <section>
      <h1>Catalogue</h1>

      <div className="filters">
        <label>
          Recherche
          <input
            type="search"
            value={q}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
            placeholder="Nom, groupe ou caractère (odeur, habitat...)"
          />
        </label>
        <label>
          Groupe
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">Tous les groupes</option>
            {groups.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
      </div>

      <div className="chips" role="group" aria-label="Comestibilité">
        {EDIBILITIES.map((e) => (
          <button key={e} type="button" className="chip" aria-pressed={selected.includes(e)} onClick={() => toggle(e)}>
            <EdibilityBadge edibility={e} />
          </button>
        ))}
        {selected.length > 0 && (
          <button type="button" className="link-button" onClick={() => setSelected([])}>Tout afficher</button>
        )}
      </div>

      <p className="counter" aria-live="polite">{results.length} espèce{results.length > 1 ? 's' : ''}</p>

      <p className="hint"><Link to="/comestibilite">Vérifier les comestibilités du catalogue</Link></p>

      {results.length === 0 ? (
        <p>Aucune espèce ne correspond à cette recherche.</p>
      ) : (
        <div className="species-grid">
          {results.map(([id]) => <SpeciesCard key={id} id={id} />)}
        </div>
      )}
    </section>
  )
}
