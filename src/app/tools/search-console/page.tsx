import type { Metadata } from 'next'
import SearchConsoleCopilot from './SearchConsoleCopilot'

export const metadata: Metadata = {
  title: 'Search Console Copilot | Automation Switch',
  description:
    'Connect Google Search Console, run indexing audits, query performance data, and use in-app agent actions to prioritize SEO fixes.',
}

export default function SearchConsoleCopilotPage() {
  return <SearchConsoleCopilot />
}
