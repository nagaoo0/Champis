// offline support: app shell, hashed assets, booklet scans and fonts are cached, photos never are
// bump CACHE only if the rules below change (hashed assets take care of themselves)
const CACHE = 'champi-v1'
const MAX_LIVRET = 60
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

// install: cache the shell, then the files it points to. the first page load happens
// before this worker controls the page, so its js and css would otherwise be missed
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await cache.add('/index.html')
      const html = await (await cache.match('/index.html')).text()
      const urls = html.match(/\/assets\/[^"'\s]+|https:\/\/fonts\.googleapis\.com\/[^"'\s]+/g) || []
      // best effort: one failed file must not break the install
      await Promise.all(urls.map((u) => cache.add(u.replace(/&amp;/g, '&')).catch(() => {})))
      self.skipWaiting()
    })(),
  )
})

// activate: drop old caches and take control of the open page right away
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name !== CACHE) await caches.delete(name)
      }
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // every route is served by index.html: network first, cached shell when offline
  if (req.mode === 'navigate') {
    event.respondWith(navigate(req))
    return
  }

  // fonts: stale while revalidate
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req))
    return
  }

  // anything else cross-origin (photos) goes straight to the network
  if (url.origin !== self.location.origin) return

  // hashed files never change: cache first
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(req))
    return
  }

  if (url.pathname.startsWith('/img/') || url.pathname.startsWith('/livret/')) {
    event.respondWith(staleWhileRevalidate(req))
  }
})

// a weak signal can hang instead of failing: give up on the network after a few seconds
const NAVIGATE_TIMEOUT = 4000

async function navigate(req) {
  const cache = await caches.open(CACHE)
  const timeout = new Promise((_, reject) => setTimeout(reject, NAVIGATE_TIMEOUT))
  try {
    const res = await Promise.race([fetch(req), timeout])
    // keep the offline shell in step with the latest deploy
    if (res.ok && res.headers.get('content-type')?.includes('text/html')) cache.put('/index.html', res.clone())
    return res
  } catch {
    return (await cache.match('/index.html')) || Response.error()
  }
}

function storable(res) {
  return res.ok || res.type === 'opaque'
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(req)
  if (hit) return hit
  const res = await fetch(req)
  if (storable(res)) cache.put(req, res.clone())
  return res
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(req)
  const refresh = fetch(req)
    .then(async (res) => {
      if (storable(res)) {
        await cache.put(req, res.clone())
        if (req.url.includes('/livret/')) await trim(cache)
      }
      return res
    })
    .catch(() => hit)
  return hit || refresh
}

// keep only the newest booklet scans (cache keys are in insertion order)
async function trim(cache) {
  const keys = (await cache.keys()).filter((r) => r.url.includes('/livret/'))
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_LIVRET))) await cache.delete(key)
}
