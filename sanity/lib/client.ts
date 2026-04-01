import { createClient } from 'next-sanity'
import { getRuntimeEnv } from '@/lib/runtime-env'

export const client = createClient({
  projectId: getRuntimeEnv('NEXT_PUBLIC_SANITY_PROJECT_ID')!,
  dataset: getRuntimeEnv('NEXT_PUBLIC_SANITY_DATASET') ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
