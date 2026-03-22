import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { article } from './schemaTypes/article'
import { category } from './schemaTypes/category'
import { tool } from './schemaTypes/tool'

export default defineConfig({
  name: 'automationswitch',
  title: 'Automation Switch',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [article, category, tool],
  },
})
