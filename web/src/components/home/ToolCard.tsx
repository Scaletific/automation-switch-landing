import type { Tool } from '@/lib/types'

export function ToolCard({ tool }: { tool: Tool }) {
  const statusLabel = tool.status === 'live' ? 'Live' : tool.status === 'beta' ? 'Beta' : 'Coming Soon'
  return (
    <a href={tool.url ?? '#'} className="tool-card" target={tool.url ? '_blank' : undefined} rel="noreferrer">
      {tool.icon && <div className="tool-icon">{tool.icon}</div>}
      <div className="tool-name">{tool.name}</div>
      <p className="tool-desc">{tool.tagline}</p>
      <span className={`tool-status ${tool.status}`}>
        <span className="status-dot" />
        {statusLabel}
      </span>
    </a>
  )
}
