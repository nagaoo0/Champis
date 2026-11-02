// line drawing from public/img, hidden if the file is missing
export default function Img({ name, alt = '', className }) {
  return (
    <img
      src={`/img/${name}.webp`}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => (e.currentTarget.style.display = 'none')}
    />
  )
}
