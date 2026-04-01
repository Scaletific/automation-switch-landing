import type { Metadata } from 'next'
import { CalloutBox } from '@/components/articles/CalloutBox'
import { ProConList } from '@/components/articles/ProConList'
import { HowToSteps } from '@/components/articles/HowToSteps'
import { CodeBlock } from '@/components/articles/CodeBlock'
import { StatHighlight } from '@/components/articles/StatHighlight'
import { ComparisonTable } from '@/components/articles/ComparisonTable'

export const metadata: Metadata = {
  title: 'Component Library | Automation Switch',
  description: 'Live demo of all article body block components.',
}

const N8N_WORKFLOW_CODE = `{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "new-lead"
      }
    },
    {
      "name": "Enrich with Clearbit",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://person.clearbit.com/v2/combined/find",
        "method": "GET"
      }
    },
    {
      "name": "Send to CRM",
      "type": "n8n-nodes-base.hubspot",
      "parameters": {
        "operation": "upsert"
      }
    }
  ]
}`

const HOW_TO_STEPS = [
  {
    _key: 'step-1',
    title: 'Map your existing manual process',
    description:
      'Before touching any automation tool, walk through the task end to end and note every decision point, data source, and handoff. This becomes your workflow blueprint.',
  },
  {
    _key: 'step-2',
    title: 'Choose the right trigger',
    description:
      'In n8n, every workflow starts with a trigger node — a webhook, a schedule, or an app event. Match the trigger to when the real-world event actually occurs.',
  },
  {
    _key: 'step-3',
    title: 'Build the happy path first',
    description:
      'Wire up the straightforward success case before adding error handling or branching. This gives you something testable within minutes rather than hours.',
  },
  {
    _key: 'step-4',
    title: 'Add error handling and retries',
    description:
      'Use n8n\'s Error Trigger node and Set node to route failures to a Slack alert or a database log. Configure retries on flaky HTTP requests to external APIs.',
  },
  {
    _key: 'step-5',
    title: 'Test with real data, then activate',
    description:
      'Run the workflow in test mode against a live webhook payload or a real spreadsheet row. Verify outputs match expectations, then flip the Active toggle.',
  },
]

export default function DemoPage() {
  return (
    <div className="demo-page">
      <h1 className="demo-page-title">
        Component <span>Library</span>
      </h1>
      <p className="demo-page-sub">
        Article body blocks — automation switch design system
      </p>

      {/* CalloutBox */}
      <p className="demo-section-label">CalloutBox</p>

      <CalloutBox
        variant="info"
        title="n8n is open-source"
        body="You can self-host n8n on any VPS or run it locally for free. The cloud version starts at $20/month and removes the need to manage infrastructure."
      />

      <CalloutBox
        variant="tip"
        body="When building multi-step workflows, use the Split In Batches node to avoid hitting API rate limits. Process 10 records at a time with a 1-second pause between batches."
      />

      <CalloutBox
        variant="warning"
        title="Credentials are not encrypted at rest by default"
        body="If you self-host n8n, configure an encryption key in your environment variables before storing any OAuth tokens or API keys in the credential store."
      />

      <CalloutBox
        variant="danger"
        title="Never expose your webhook URL publicly without authentication"
        body="An unauthenticated webhook endpoint is an open door. Add Basic Auth or a secret header check as the first node in any production workflow that accepts inbound HTTP requests."
      />

      {/* StatHighlight */}
      <p className="demo-section-label">StatHighlight</p>

      <StatHighlight
        figure="73%"
        label="of small businesses that automate repetitive tasks report recovering more than 5 hours per week per employee"
        context="Workflow automation tools like n8n and Make have lowered the technical barrier enough that non-developers can now build production-grade automations in an afternoon."
        source="McKinsey Digital, 2024"
      />

      <StatHighlight
        figure="$18k"
        label="average annual savings per knowledge worker when document-heavy workflows are fully automated"
        source="Forrester Research, 2023"
      />

      {/* ProConList */}
      <p className="demo-section-label">ProConList</p>

      <ProConList
        title="n8n vs Zapier — which is right for your business?"
        pros={[
          'Self-hostable: no per-task pricing that scales against you',
          'Full JavaScript expressions inside any node',
          'Native AI agent nodes with LangChain integration built in',
          'Unlimited workflow executions on the self-hosted plan',
          'Active open-source community with 500+ node types',
        ]}
        cons={[
          'Steeper learning curve than Zapier for non-technical users',
          'Self-hosting requires basic DevOps knowledge',
          'Fewer pre-built templates than the Zapier marketplace',
          'UI can feel cluttered with complex multi-branch flows',
        ]}
      />

      {/* HowToSteps */}
      <p className="demo-section-label">HowToSteps</p>

      <HowToSteps
        title="How to build your first n8n automation workflow"
        steps={HOW_TO_STEPS}
      />

      {/* CodeBlock */}
      <p className="demo-section-label">CodeBlock</p>

      <CodeBlock
        language="json"
        filename="lead-enrichment-workflow.json"
        code={N8N_WORKFLOW_CODE}
      />

      <CodeBlock
        language="javascript"
        code={`// n8n Function node: normalise incoming webhook payload
const lead = $input.first().json

return [{
  json: {
    email: lead.email?.toLowerCase().trim(),
    name: [lead.firstName, lead.lastName].filter(Boolean).join(' '),
    source: lead.utm_source ?? 'unknown',
    createdAt: new Date().toISOString(),
  }
}]`}
      />

      {/* ComparisonTable */}
      <p className="demo-section-label">ComparisonTable</p>

      <ComparisonTable
        headline="Workflow Automation Platforms Compared"
        tools={[
          { name: 'n8n' },
          { name: 'Make' },
          { name: 'Zapier' },
        ]}
        rows={[
          { criteria: 'Self-Hostable', values: ['check', 'x', 'x'] },
          { criteria: 'Free Tier', values: ['check', 'check', 'check'] },
          { criteria: 'Code Nodes', values: ['check', 'partial', 'partial'] },
          { criteria: 'AI Agent Nodes', values: ['check', 'check', 'x'] },
          { criteria: 'Branching Logic', values: ['check', 'check', 'check'] },
          { criteria: 'Webhook Triggers', values: ['check', 'check', 'check'] },
          { criteria: 'Community Templates', values: ['500+', '1,000+', '5,000+'] },
          { criteria: 'Starting Price', values: ['Free / $20', 'Free / $9', 'Free / $20'] },
        ]}
        bestFor={[
          'Technical teams wanting full control',
          'Visual builders who need complexity',
          'Non-technical teams wanting simplicity',
        ]}
        winnerIndex={0}
      />
    </div>
  )
}
