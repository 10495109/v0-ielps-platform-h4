/**
 * The IELPS aperture mark from the brand identity pack.
 *
 * Inlined rather than loaded from /public so it inherits currentColor-free
 * brand colours exactly as supplied, renders with no extra request, and cannot
 * break when the export is served under a basePath. The same artwork is kept in
 * public/brand/ as the distributable asset for anyone who needs the file.
 */
export function BrandMark({
  className = 'size-9',
  reversed = false,
  title = 'IELPS',
}: {
  className?: string
  /** Use on dark surfaces: the tile becomes white and the bars purple. */
  reversed?: boolean
  title?: string
}) {
  const tile = reversed ? '#FFFFFF' : '#512EAB'
  const bar = reversed ? '#512EAB' : '#FFFFFF'

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <path d="M14 4 H60 V50 A10 10 0 0 1 50 60 H4 V14 A10 10 0 0 1 14 4 Z" fill={tile} />
      <circle cx="23" cy="21" r="5" fill="#FFCE00" />
      <rect x="18.5" y="31" width="9" height="25" rx="4.5" fill={bar} />
      <rect x="36" y="19" width="18" height="6" rx="3" fill="#22C7C6" />
      <rect x="36" y="31" width="18" height="6" rx="3" fill={bar} opacity="0.85" />
      <rect x="36" y="43" width="11" height="6" rx="3" fill={bar} opacity="0.55" />
    </svg>
  )
}
