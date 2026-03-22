const items = [
  'Workflow Automation', 'Business Process', 'Tool Integration',
  'No-Code Pipelines', 'Agent Orchestration', 'Connected Systems',
]

export function Ticker() {
  const repeated = [...items, ...items]
  return (
    <div className="border-t border-b border-[#3a3a3a] overflow-hidden whitespace-nowrap py-[10px] bg-[#252525]">
      <div className="ticker-animate inline-block">
        {repeated.map((item, i) => (
          <span key={i} className={`font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] px-7 ${i % 2 === 1 ? 'text-[#c8861a]' : 'text-[#707070]'}`}>
            {i % 2 === 1 ? '///' : item}
          </span>
        ))}
      </div>
    </div>
  )
}
