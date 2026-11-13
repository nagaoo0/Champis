import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import tree from '../data/key.json'
import species from '../data/species.json'
import { useExternal } from '../lib/external'
import Photo from '../components/Photo'
import { parseTrail, reachableSpecies, stepsLeft, trailQuery } from '../lib/key'
import Img from '../components/Img'
import SpeciesCard from '../components/SpeciesCard'
import { Marked, TermsPanel } from '../components/Terms'
import { termsIn, termsOfNode } from '../lib/glossary'
import { useTitle } from '../lib/title'
import NotFound from './NotFound'

// key forces a fresh state (panel closed) on each node
export default function Key() {
  const { nodeId } = useParams()
  return <KeyNode key={nodeId} nodeId={nodeId} />
}

// long branches show a few species, deadly ones first so they are never hidden
const SAMPLE = 6
const isDeadly = (id) => species[id]?.edibility === 'mortel'
const deadlyFirst = (ids) => [...ids.filter(isDeadly), ...ids.filter((id) => !isDeadly(id))]
const sample = (ids) => deadlyFirst(ids).slice(0, SAMPLE)

function KeyNode({ nodeId }) {
  const [showAll, setShowAll] = useState(false)
  const [openTerm, setOpenTerm] = useState(null)
  const external = useExternal()
  const navigate = useNavigate()
  const location = useLocation()
  const node = tree.nodes[nodeId]
  useTitle(node?.title)
  const [params] = useSearchParams()
  const trail = parseTrail(params.get('chemin'), nodeId)

  if (!node) return <NotFound />

  const possible = [...reachableSpecies(nodeId)]
  const deadly = possible.filter(isDeadly).length
  const withPhoto = (ids) => ids.filter((id) => external[id]?.photos?.length)
  const examples = deadlyFirst(withPhoto(possible)).slice(0, 4)
  const steps = stepsLeft(nodeId)
  const terms = termsOfNode(node)
  // a term is underlined only where it first appears: question, intro, then each label and hint
  const texts = [node.question, node.intro, ...node.choices.flatMap((c) => [c.label, c.hint])]
  const seenBefore = (i) => new Set(termsIn(texts.slice(0, i)))

  function go(choice, i) {
    navigate(choice.next ? `/cle/${choice.next}${trailQuery([...trail, { node: nodeId, index: i }])}` : `/espece/${choice.species}`)
  }

  // photos shown on a choice: its species, or a few examples behind it
  const isStart = nodeId === tree.start
  const pics = node.choices.map((c) => {
    if (isStart) return { ids: [] }
    const ids = withPhoto(c.species ? [c.species] : [...reachableSpecies(c.next)])
    return c.species ? { ids } : { ids: deadlyFirst(ids).slice(0, 3), more: ids.length - 3 }
  })
  const anyPics = pics.some((p) => p.ids.length)

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
              const label = tree.nodes[step.node].choices[step.index].label
              return (
                <li key={i}>
                  {last ? (
                    <span aria-current="step">{label}</span>
                  ) : (
                    <Link to={`/cle/${trail[i + 1].node}${trailQuery(trail.slice(0, i + 1))}`}>{label}</Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <p className="eyebrow">{node.title} · <Link to={`/livret/${node.page}`}>Livret p. {node.page}</Link></p>
      <h1 className="question"><Marked text={node.question} seen={seenBefore(0)} onTerm={setOpenTerm} /></h1>
      {node.intro && <p className="intro"><Marked text={node.intro} seen={seenBefore(1)} onTerm={setOpenTerm} /></p>}

      <p className="counter">
        {possible.length} espèce{possible.length > 1 ? 's' : ''} possible{possible.length > 1 ? 's' : ''}
        {deadly > 0 && <strong className="danger"> dont {deadly} mortelle{deadly > 1 ? 's' : ''}</strong>}
        {steps > 1 && <span className="steps-left"> · environ {steps} questions pour arriver à une espèce</span>}
      </p>

      {openTerm && (
        <div className="term-popup" role="note">
          <strong>{openTerm.term}</strong> : {openTerm.def}
          <button type="button" className="link-button" onClick={() => setOpenTerm(null)}>Fermer</button>
        </div>
      )}

      <div className="choices">
        {node.choices.map((choice, i) => {
          const { ids, more } = pics[i]
          return (
            <button key={i} type="button" className="choice" onClick={() => go(choice, i)}>
              {choice.img && isStart && <Img name={choice.img} />}
              {anyPics && (
                <span className={choice.next && ids.length ? 'choice-pic strip' : 'choice-pic'} aria-hidden="true">
                  {ids.map((id) => <Photo key={id} src={external[id].photos[0].thumb} className={choice.species ? 'choice-photo' : isDeadly(id) ? 'deadly' : undefined} />)}
                  {more > 0 && <small>+{more}</small>}
                </span>
              )}
              <span className="choice-text">
                <strong><Marked text={choice.label} seen={seenBefore(2 + 2 * i)} onTerm={setOpenTerm} /></strong>
                {choice.hint && <span className="hint"><Marked text={choice.hint} seen={seenBefore(3 + 2 * i)} onTerm={setOpenTerm} /></span>}
                {choice.note && <em className="note">{choice.note}</em>}
              </span>
            </button>
          )
        })}
      </div>

      <TermsPanel entries={terms} />

      {examples.length > 0 && (
        <div className="examples">
          <p className="eyebrow">Exemples dans cette branche</p>
          <ul>
            {examples.map((id) => (
              <li key={id} className={species[id].edibility === 'mortel' ? 'deadly' : undefined}>
                <Link to={`/espece/${id}`}>
                  <Photo src={external[id].photos[0].thumb} />
                  <span className="latin">
                    {species[id].edibility === 'mortel' && '☠ '}
                    {species[id].latin}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

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
                <button type="button" className="branch-title" onClick={() => go(choice, i)}>
                  {choice.label}
                </button>
                <p className="hint">{ids.length} espèce{ids.length > 1 ? 's' : ''}</p>
                <div className="species-grid">
                  {sample(ids).map((id) => <SpeciesCard key={id} id={id} compact />)}
                </div>
                {ids.length > SAMPLE && <p className="hint">et {ids.length - SAMPLE} autres : touchez le titre pour suivre cette branche.</p>}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
