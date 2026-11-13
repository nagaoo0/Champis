import { Link } from 'react-router-dom'
import extra from '../data/extra.json'
import { useTitle } from '../lib/title'

const ISSUES = 'https://github.com/nagaoo0/Champis/issues/new'

export default function About() {
  useTitle('À propos')
  return (
    <section>
      <h1>À propos et crédits</h1>

      <div className="alert alert-soft" role="note">
        Champi est une aide pédagogique. Elle ne remplace ni un mycologue, ni un pharmacien, ni
        une association mycologique. Ne consommez jamais un champignon sur la seule foi de cette
        application, et faites contrôler chaque récolte.
      </div>

      <p className="credit">
        La clé d'identification a été conçue par <strong>Aurélie Sanchez</strong>, professeure, dont le
        livret de détermination est à l'origine de ce site. Merci à elle.
      </p>

      <h2>D'où viennent les données</h2>
      <p>
        La clé de détermination, les espèces, les remarques de comestibilité et les dessins viennent
        d'un livret de détermination des champignons sur le terrain, scanné puis transcrit à la main.
        La transcription peut contenir des erreurs : la page <Link to="/livret/1">Livret</Link> montre
        chaque scan à côté de son texte pour vérifier. Quand le livret ne dit rien d'une espèce, elle
        est marquée « comestibilité inconnue », ce qui ne veut pas dire qu'elle est sans danger.
      </p>
      <p>
        Les dessins sont ceux du livret, nettoyés. Les points douteux de la transcription (dessins sans
        numéro, légendes illisibles) sont expliqués dans les notes du projet.
      </p>

      <h2>Photos et liens</h2>
      <p>
        Les photos viennent de Wikimedia Commons et d'iNaturalist, sous licences Creative Commons.
        L'auteur et la licence sont indiqués sous chaque photo, avec un lien vers la source. Certaines
        sont réservées à un usage non commercial. Une photo peut être mal identifiée à la source : elle
        ne suffit jamais à reconnaître un champignon. Les liens vers Wikipédia, INPN, MycoDB, MycoBank,
        iNaturalist et GBIF sont retrouvés automatiquement à partir du nom latin et peuvent se tromper
        quand le livret utilise un ancien nom. Quelques noms français absents du livret viennent des titres de pages Wikipédia.
      </p>

      <h2>Signaler une erreur</h2>
      <p>
        Une confusion manquante, une comestibilité douteuse, une question mal formulée ? Écrivez-nous
        sur <a href={ISSUES} target="_blank" rel="noopener">la page de suivi du projet</a> en indiquant
        l'espèce ou la page du livret concernée. Les corrections de mycologues sont les bienvenues.
      </p>

      <h2>Vérifier les données</h2>
      <p>
        Deux pages servent à relire le travail : <Link to="/comestibilite">la liste des comestibilités</Link>,
        espèce par espèce avec ses pages du livret, et <Link to="/doutes">les doutes de transcription</Link>,
        page par page.
      </p>

      {extra.bibliography?.length > 0 && (
        <>
          <h2>Bibliographie du livret</h2>
          <ul>
            <h2>Vérifier les données</h2>
      <p>
        Deux pages servent à relire le travail : <Link to="/comestibilite">la liste des comestibilités</Link>,
        espèce par espèce avec ses pages du livret, et <Link to="/doutes">les doutes de transcription</Link>,
        page par page.
      </p>

      {extra.bibliography.map((ref) => <li key={ref}>{ref}</li>)}
          </ul>
        </>
      )}
    </section>
  )
}
