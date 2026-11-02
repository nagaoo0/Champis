const LABELS = {
  comestible: 'Comestible',
  toxique: '☠ Toxique',
  mortel: '☠ Mortel',
  inconnu: 'Comestibilité inconnue',
}

export default function EdibilityBadge({ edibility }) {
  const kind = LABELS[edibility] ? edibility : 'inconnu'
  return <span className={`badge badge-${kind}`}>{LABELS[kind]}</span>
}
