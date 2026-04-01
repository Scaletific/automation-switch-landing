export interface CalloutBoxProps {
  variant: 'info' | 'tip' | 'warning' | 'danger'
  title?: string
  body: string
}

export function CalloutBox({ variant, title, body }: CalloutBoxProps) {
  const label = variant.toUpperCase()

  return (
    <div className={`callout callout--${variant}`}>
      <div className="callout-label">{label}</div>
      {title && <div className="callout-title">{title}</div>}
      <p className="callout-body">{body}</p>
    </div>
  )
}
