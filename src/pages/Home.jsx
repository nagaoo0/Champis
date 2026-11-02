import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import tree from '../data/key.json'

export default function Home() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  function search(e) {
    e.preventDefault()
    navigate('/catalogue?q=' + encodeURIComponent(q.trim()))
  }

  return (
    <section className="home">
      <h1>Identifier un champignon</h1>
      <p className="lead">
        Répondez à quelques questions simples sur ce que vous observez : la clé vous
        guide pas à pas vers l'espèce, avec ses risques de confusion.
      </p>
      <Link to={`/cle/${tree.start}`} className="btn btn-big">Commencer l'identification</Link>

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

      <ul className="home-links">
        <li><Link to="/guide">Guide d'observation</Link></li>
        <li><Link to="/catalogue">Catalogue des espèces</Link></li>
        <li><Link to="/glossaire">Glossaire</Link></li>
      </ul>
    </section>
  )
}
