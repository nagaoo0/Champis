import { useEffect, useState } from 'react'

// photos and links are big, so they load after the first paint
let loading
let loaded

function load() {
  loading ??= import('../data/external.json').then((m) => (loaded = m.default))
  return loading
}

// {} until the file has arrived
export function useExternal() {
  const [data, setData] = useState(loaded ?? {})
  useEffect(() => {
    if (!loaded) load().then(setData)
  }, [])
  return data
}
