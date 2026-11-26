import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Remonte en haut de page à chaque changement de route (ignore les ancres #). */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, search, hash])

  return null
}
