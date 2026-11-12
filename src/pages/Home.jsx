import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import tree from '../data/key.json'
import species from '../data/species.json'
import SpeciesCard from '../components/SpeciesCard'
import { useTitle } from '../lib/title'

const deadly = Object.keys(species)
  .filter((id) => species[id].edibility === 'mortel')
  .sort((a, b) => species[a].latin.localeCompare(species[b].latin))

const STEPS = [
  ['1', 'Observez', "le dessous du chapeau, le pied, les voiles, la chair, la couleur de la sporée."],
  ['2', 'Répondez', "à une question à la fois. En cas de doute, « Je ne sais pas » montre les espèces de chaque branche."],
  ['3', 'Vérifiez', "la fiche de l'espèce, ses photos, ses confusions possibles, puis faites contrôler la récolte."],
]

export default function Home() {
  useTitle('')
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  function search(e) {
    e.preventDefault()
    navigate('/catalogue?q=' + encodeURIComponent(q.trim()))
  }

  return (
    <section className="home">
      <div className="home-hero">
        <h1>Identifier un champignon</h1>
        <p className="lead">
          Répondez à quelques questions simples sur ce que vous observez : la clé vous
          guide pas à pas vers l'espèce, avec ses risques de confusion.
        </p>
        <Link to={`/cle/${tree.start}`} className="btn btn-big">Commencer l'identification</Link>
      </div>

      <ol className="steps">
        {STEPS.map(([n, title, text]) => (
          <li key={n}>
            <span className="step-num">{n}</span>
            <div>
              <strong>{title}</strong> {text}
            </div>
          </li>
        ))}
      </ol>

      <form onSubmit={search} className="search" role="search">
        <label htmlFor="home-q">Vous connaissez déjà son nom ?</label>
        <div className="search-row">
          <input
            id="home-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cèpe, Amanita, bolets..."
          />
          <button type="submit" className="btn">Chercher</button>
        </div>
      </form>

      <h2>Les espèces mortelles de la clé</h2>
      <p className="hint">
        Neuf espèces sont marquées mortelles dans le livret. Apprenez à les reconnaître avant de cueillir.
      </p>
      <div className="species-grid">
        {deadly.map((id) => <SpeciesCard key={id} id={id} compact />)}
      </div>

      <ul className="home-links">
        <li><Link to="/guide">Guide d'observation</Link></li>
        <li><Link to="/catalogue">Catalogue des espèces</Link></li>
        <li><Link to="/glossaire">Glossaire</Link></li>
        <li><Link to="/a-propos">À propos et crédits</Link></li>
      </ul>
    </section>
  )
}
