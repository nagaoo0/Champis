// remote photo, hidden if the host no longer serves it
export default function Photo({ src, alt = '', className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => (e.currentTarget.style.display = 'none')}
    />
  )
}
