export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="56" height="56" fill="none" stroke="#c8861a" strokeWidth="2.5"/>
      <rect x="11" y="11" width="15" height="34" fill="#c8861a"/>
      <rect x="30" y="11" width="17" height="17" fill="#1e1a14" opacity="0.25"/>
      <rect x="30" y="31" width="17" height="14" fill="#c8861a" opacity="0.45"/>
    </svg>
  )
}
