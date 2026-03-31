import { client } from '@sanity/lib/client'
import { toolsQuery } from '@sanity/lib/queries'
import { ToolCard } from '@/components/home/ToolCard'
import type { Tool } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tools | Automation Switch',
  description: 'AI-powered automation tools built by Automation Switch. From cold email intelligence to workflow visualisation.',
}

export const revalidate = 60

const PLACEHOLDER_TOOLS: Tool[] = [
  { _id: 'p1', name: 'PRECISION REACH', slug: { current: 'precision-reach' }, tagline: 'AI-powered cold email intelligence. Research an industry, surface stakeholder pain points, and generate high-converting email sequences automatically.', icon: '🎯', status: 'live', url: '/precisionreach.html' },
  { _id: 'p2', name: 'FLOWMAP', slug: { current: 'flowmap' }, tagline: 'Visualise your existing workflow as a structured automation map. Identify where friction lives before you build a single trigger.', icon: '⚡', status: 'soon', url: null },
  { _id: 'p3', name: 'HOOKBASE', slug: { current: 'hookbase' }, tagline: 'A lightweight webhook relay and inspector. Test, monitor, and debug integrations between your tools without a backend.', icon: '🔗', status: 'soon', url: null },
]

export default async function ToolsPage() {
  const tools = await client.fetch<Tool[]>(toolsQuery)
  const showTools = (tools && tools.length > 0) ? tools : PLACEHOLDER_TOOLS

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">What we build</div>
        <h1 className="page-title-xl">TOOLS</h1>
        <p className="page-sub">
          Practical automation tooling for teams that move fast.
          Each tool is built around a real workflow problem we have seen teams struggle with.
        </p>
      </div>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">ALL TOOLS</h2>
        </div>
        <div className="tools-grid">
          {showTools.map(tool => (
            <ToolCard key={tool._id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Mission blurb */}
      <div className="mission" style={{ marginBottom: '80px' }}>
        <div className="mission-eyebrow">How we build</div>
        <div className="mission-text">
          Every tool starts with a<br />
          workflow problem we have<br />
          seen teams <em>struggle with.</em>
        </div>
        <p className="mission-sub">
          We do not build tools for the sake of building.
          Each product on this page was designed around a specific bottleneck we observed across multiple businesses.
          If we have not seen the problem ourselves, we do not build for it.
        </p>
      </div>
    </>
  )
}
