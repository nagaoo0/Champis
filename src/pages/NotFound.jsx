import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="not-found">
      <h1>Page introuvable</h1>
      <p>Cette page n'existe pas, ou plus.</p>
      <Link to="/" className="btn">Retour à l'accueil</Link>
    </section>
  )
}
