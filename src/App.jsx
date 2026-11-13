import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import tree from './data/key.json'
import Home from './pages/Home'
import Key from './pages/Key'
import Species from './pages/Species'
import Catalog from './pages/Catalog'
import Glossary from './pages/Glossary'
import Booklet from './pages/Booklet'
import About from './pages/About'
import Guide from './pages/Guide'
import Vocabulary from './pages/Vocabulary'
import Edibility from './pages/Edibility'
import Doubts from './pages/Doubts'
import NotFound from './pages/NotFound'

const NAV = [
  { label: 'Identifier', to: `/cle/${tree.start}`, prefix: '/cle' },
  { label: 'Catalogue', to: '/catalogue', prefix: '/catalogue' },
  { label: 'Guide', to: '/guide', prefix: '/guide' },
  { label: 'Glossaire', to: '/glossaire', prefix: '/glossaire' },
  { label: 'Livret', to: '/livret/1', prefix: '/livret' },
  { label: 'À propos', to: '/a-propos', prefix: '/a-propos' },
]

export default function App() {
  const { pathname, hash } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef(null)

  // phone menu closes on navigation and on Escape (focus goes back to the button)
  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      menuButton.current.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // new page: go to the top, or to the #anchor if there is one
  useEffect(() => {
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <>
      <header className="site-header">
        <div className="page header-row">
          <Link to="/" className="brand">Champi</Link>
          <button
            ref={menuButton}
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            Menu
          </button>
          <nav id="main-nav" className={menuOpen ? 'open' : undefined} aria-label="Navigation principale">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={pathname.startsWith(item.prefix) ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* key restarts the page entrance animation on each route */}
      <main className="page" key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cle/:nodeId" element={<Key />} />
          <Route path="/espece/:id" element={<Species />} />
          <Route path="/catalogue" element={<Catalog />} />
          <Route path="/glossaire" element={<Glossary />} />
          <Route path="/livret" element={<Navigate to="/livret/1" replace />} />
          <Route path="/livret/:n" element={<Booklet />} />
          <Route path="/vocabulaire" element={<Vocabulary />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/comestibilite" element={<Edibility />} />
          <Route path="/doutes" element={<Doubts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <p className="page">
          Aide pédagogique tirée du livret de détermination d'Aurélie Sanchez. Ne consommez jamais un
          champignon sur la seule foi de cette application : faites contrôler chaque récolte par un
          pharmacien ou une association mycologique. Photos : Wikimedia Commons et
          iNaturalist, licences Creative Commons (auteur et licence indiqués sur chaque photo).
        </p>
      </footer>
    </>
  )
}
