import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1e1e1e',
        'bg-2': '#252525',
        'bg-3': '#2d2d2d',
        border: '#3a3a3a',
        amber: '#c8861a',
        'amber-dim': '#8a5c10',
        text: '#b0b0b0',
        'text-dim': '#707070',
        'text-bright': '#e8e8e8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [typography],
}

export default config
