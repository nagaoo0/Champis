import extra from '../data/extra.json'
import Img from '../components/Img'
import { useTitle } from '../lib/title'

export default function Guide() {
  useTitle("Guide d'observation")
  return (
    <section>
      <h1>Guide d'observation</h1>
      {extra.guide.map((section) => (
        <div key={section.title} className="guide-section">
          <h2>{section.title}</h2>
          <p className="guide-text">{section.text}</p>
          {section.images?.length > 0 && (
            <div className="figures">
              {section.images.map((name) => <Img key={name} name={name} alt={section.title} />)}
            </div>
          )}
        </div>
      ))}

      {extra.bibliography?.length > 0 && (
        <div className="guide-section">
          <h2>Bibliographie</h2>
          <ul>
            {extra.bibliography.map((ref) => <li key={ref}>{ref}</li>)}
          </ul>
        </div>
      )}
    </section>
  )
}
