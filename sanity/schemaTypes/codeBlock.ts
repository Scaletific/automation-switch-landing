import { defineField, defineType } from 'sanity'

export const codeBlock = defineType({
  name: 'codeBlock',
  title: 'Code Block',
  type: 'object',
  fields: [
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'JavaScript', value: 'javascript' },
          { title: 'TypeScript', value: 'typescript' },
          { title: 'Python', value: 'python' },
          { title: 'Bash / Shell', value: 'bash' },
          { title: 'JSON', value: 'json' },
          { title: 'YAML', value: 'yaml' },
          { title: 'SQL', value: 'sql' },
          { title: 'Plain Text', value: 'text' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'javascript',
    }),
    defineField({
      name: 'filename',
      title: 'Filename',
      type: 'string',
      description: 'Optional. E.g. "workflow.js" or "config.yaml".',
    }),
    defineField({
      name: 'code',
      title: 'Code',
      type: 'text',
      validation: r => r.required(),
    }),
  ],
  preview: {
    select: { language: 'language', filename: 'filename', code: 'code' },
    prepare({ language, filename, code }: { language?: string; filename?: string; code?: string }) {
      return {
        title: filename || `${language || 'code'} snippet`,
        subtitle: code?.slice(0, 60),
      }
    },
  },
})
