import Link from 'next/link'
import { LogoMark } from '@/components/ui/LogoMark'
import { SocialLinks } from '@/components/ui/SocialLinks'

export function Topbar() {
  return (
    <header className="flex items-center justify-between px-10 h-[52px] border-b border-[#3a3a3a] sticky top-0 z-50 bg-[rgba(30,30,30,0.96)] backdrop-blur-md">
      <div className="flex items-center gap-4">
        <LogoMark size={28} />
        <Link href="/" className="font-['Bebas_Neue'] text-[18px] tracking-[0.12em] text-[#e8e8e8] no-underline">
          AUTOMATION<span className="text-[#c8861a]">SWITCH</span>
        </Link>
      </div>

      <nav className="flex items-center gap-8">
        <Link href="/articles" className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.08em] text-[#707070] no-underline hover:text-[#c8861a] transition-colors">
          Articles
        </Link>
        <Link href="/tools" className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.08em] text-[#707070] no-underline hover:text-[#c8861a] transition-colors">
          Tools
        </Link>
        <Link href="/about" className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.08em] text-[#707070] no-underline hover:text-[#c8861a] transition-colors">
          About
        </Link>

        <div className="flex items-center gap-3 pr-4 border-r border-[#3a3a3a]">
          <SocialLinks size={14} />
        </div>

        <Link
          href="/#subscribe"
          className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.08em] text-white bg-[#c8861a] px-4 py-[7px] no-underline hover:opacity-85 transition-opacity"
        >
          Subscribe
        </Link>
      </nav>
    </header>
  )
}
