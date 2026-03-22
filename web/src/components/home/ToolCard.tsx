import type { Tool } from '@/lib/types'

export function ToolCard({ tool }: { tool: Tool }) {
  const isLive = tool.status === 'live'
  return (
    <a href={tool.url ?? '#'} className="no-underline" target={tool.url ? '_blank' : undefined} rel="noreferrer">
      <div className="card-hover-bar bg-[#1e1e1e] hover:bg-[#252525] transition-colors p-7 cursor-pointer h-full">
        {tool.icon && (
          <div className="w-9 h-9 bg-[rgba(200,134,26,0.09)] border border-[#8a5c10] flex items-center justify-center mb-4 text-[16px]">
            {tool.icon}
          </div>
        )}
        <div className="font-['Bebas_Neue'] text-[22px] tracking-[0.04em] text-[#e8e8e8] mb-2">{tool.name}</div>
        <p className="text-[12px] font-light leading-[1.7] text-[#707070] mb-4">{tool.tagline}</p>
        <span className={`font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.12em] inline-flex items-center gap-1.5 ${isLive ? 'text-[#5dba8a]' : 'text-[#707070]'}`}>
          <span className={`w-[5px] h-[5px] rounded-full ${isLive ? 'bg-[#5dba8a] animate-pulse' : 'bg-[#707070]'}`} />
          {tool.status === 'live' ? 'Live' : tool.status === 'beta' ? 'Beta' : 'Coming Soon'}
        </span>
      </div>
    </a>
  )
}
