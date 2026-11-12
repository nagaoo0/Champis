// remote photo, fades in when loaded, hidden if the host no longer serves it
export default function Photo({ src, alt = '', className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      data-photo=""
      referrerPolicy="no-referrer"
      onLoad={(e) => (e.currentTarget.dataset.loaded = '')}
      onError={(e) => (e.currentTarget.style.display = 'none')}
    />
  )
}
