import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import tree from '../data/key.json'
import species from '../data/species.json'
import { reachableSpecies } from '../lib/key'
import Img from '../components/Img'
import SpeciesCard from '../components/SpeciesCard'
import NotFound from './NotFound'

// key forces a fresh state (panel closed) on each node
export default function Key() {
  const { nodeId } = useParams()
  return <KeyNode key={nodeId} nodeId={nodeId} />
}

function KeyNode({ nodeId }) {
  const [showAll, setShowAll] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const node = tree.nodes[nodeId]
  const trail = location.state?.trail ?? []

  if (!node) return <NotFound />

  const possible = [...reachableSpecies(nodeId)]
  const deadly = possible.filter((id) => species[id]?.edibility === 'mortel').length

  function go(choice) {
    const state = { trail: [...trail, { node: nodeId, label: choice.label }] }
    navigate(choice.next ? `/cle/${choice.next}` : `/espece/${choice.species}`, { state })
  }

  return (
    <section>
      <div className="key-actions">
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} disabled={location.key === 'default'}>
          Retour
        </button>
        <Link to={`/cle/${tree.start}`} className="btn btn-ghost">Recommencer</Link>
      </div>

      {trail.length > 0 && (
        <nav aria-label="Étapes précédentes" className="crumbs">
          <ol>
            <li><Link to={`/cle/${tree.start}`}>Départ</Link></li>
            {trail.map((step, i) => {
              const last = i === trail.length - 1
              const target = last ? nodeId : trail[i + 1].node
              return (
                <li key={i}>
                  {last ? (
                    <span aria-current="step">{step.label}</span>
                  ) : (
                    <Link to={`/cle/${target}`} state={{ trail: trail.slice(0, i + 1) }}>{step.label}</Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <p className="eyebrow">{node.title} · Livret p. {node.page}</p>
      <h1 className="question">{node.question}</h1>
      {node.intro && <p className="intro">{node.intro}</p>}

      <p className="counter">
        {possible.length} espèce{possible.length > 1 ? 's' : ''} possible{possible.length > 1 ? 's' : ''}
        {deadly > 0 && <strong className="danger"> dont {deadly} mortelle{deadly > 1 ? 's' : ''}</strong>}
      </p>

      <div className="choices">
        {node.choices.map((choice, i) => (
          <button key={i} type="button" className="choice" onClick={() => go(choice)}>
            {choice.img && <Img name={choice.img} />}
            <span className="choice-text">
              <strong>{choice.label}</strong>
              {choice.hint && <span className="hint">{choice.hint}</span>}
              {choice.note && <em className="note">{choice.note}</em>}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-ghost unsure-toggle"
        aria-expanded={showAll}
        onClick={() => setShowAll(!showAll)}
      >
        Je ne sais pas
      </button>

      {showAll && (
        <div className="unsure">
          <p>Voici ce que chaque choix permet d'atteindre. Touchez un titre pour suivre cette branche.</p>
          {node.choices.map((choice, i) => {
            const ids = choice.species ? [choice.species] : [...reachableSpecies(choice.next)]
            return (
              <div key={i} className="unsure-branch">
                <button type="button" className="branch-title" onClick={() => go(choice)}>
                  {choice.label}
                </button>
                <div className="species-grid">
                  {ids.map((id) => <SpeciesCard key={id} id={id} compact />)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
