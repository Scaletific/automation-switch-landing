import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { article } from './schemaTypes/article'
import { author } from './schemaTypes/author'
import { category } from './schemaTypes/category'
import { tool } from './schemaTypes/tool'
import { skillSource } from './schemaTypes/skillSource'
import { siteSettings } from './schemaTypes/siteSettings'

export default defineConfig({
  name: 'automationswitch',
  title: 'Automation Switch',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [structureTool()],
  schema: {
    // Order matters — author and category must be registered before article
    // because article holds references to both.
    types: [siteSettings, author, category, article, tool, skillSource],
  },
})
