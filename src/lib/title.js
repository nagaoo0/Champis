import { useEffect } from 'react'

// browser tab title, "Champi" alone when no text is given
export function useTitle(text) {
  useEffect(() => {
    document.title = text ? `${text} · Champi` : 'Champi'
  }, [text])
}
