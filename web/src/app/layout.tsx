import type { Metadata } from 'next'
import './globals.css'
import { Topbar } from '@/components/layout/Topbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: { default: 'Automation Switch', template: '%s — Automation Switch' },
  description: 'Practical automation tools, guides, and workflows for businesses that move fast.',
  metadataBase: new URL('https://automationswitch.com'),
  openGraph: {
    siteName: 'Automation Switch',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Topbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
