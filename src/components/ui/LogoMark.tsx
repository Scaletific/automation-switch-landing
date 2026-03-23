export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="24" height="24" stroke="#e8a020" strokeWidth="1.5"/>
      <rect x="7" y="7" width="6" height="14" fill="#e8a020"/>
      <rect x="15" y="7" width="6" height="7" fill="#3a3a3a"/>
      <rect x="15" y="16" width="6" height="5" fill="#e8a020" opacity="0.4"/>
    </svg>
  )
}
