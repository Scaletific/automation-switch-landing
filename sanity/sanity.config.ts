import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { article } from './schemaTypes/article'
import { author } from './schemaTypes/author'
import { category } from './schemaTypes/category'
import { tool } from './schemaTypes/tool'
import { skillSource } from './schemaTypes/skillSource'
import { siteSettings } from './schemaTypes/siteSettings'
import { comparisonTable } from './schemaTypes/comparisonTable'
import { calloutBox } from './schemaTypes/calloutBox'
import { proConList } from './schemaTypes/proConList'
import { howToSteps } from './schemaTypes/howToSteps'
import { codeBlock } from './schemaTypes/codeBlock'
import { statHighlight } from './schemaTypes/statHighlight'
import { glossaryTerm } from './schemaTypes/glossaryTerm'
import { toolReview } from './schemaTypes/toolReview'
import { testimonial } from './schemaTypes/testimonial'

export default defineConfig({
  name: 'automationswitch',
  title: 'Automation Switch',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [structureTool()],
  schema: {
    // Order matters — dependency types must be registered before types that reference them.
    // Object types (body blocks) are registered first so article.body can reference them.
    types: [
      // Object types (body blocks)
      comparisonTable,
      calloutBox,
      proConList,
      howToSteps,
      codeBlock,
      statHighlight,
      // Base document types
      siteSettings,
      author,
      category,
      // Main content types (reference author, category, and object types above)
      article,
      tool,
      skillSource,
      // Standalone document types
      glossaryTerm,
      toolReview,
      testimonial,
    ],
  },
})
