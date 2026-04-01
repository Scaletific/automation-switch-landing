export interface StatHighlightProps {
  figure: string
  label: string
  source?: string
  context?: string
}

export function StatHighlight({ figure, label, source, context }: StatHighlightProps) {
  return (
    <div className="stat-highlight">
      <div className="stat-highlight-figure">{figure}</div>
      <div className="stat-highlight-label">{label}</div>
      {context && <p className="stat-highlight-context">{context}</p>}
      {source && <div className="stat-highlight-source">Source: {source}</div>}
    </div>
  )
}
