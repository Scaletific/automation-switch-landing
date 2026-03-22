import Link from 'next/link'
import { SocialLinks } from '@/components/ui/SocialLinks'

export function Footer() {
  return (
    <footer className="border-t border-[#3a3a3a] px-10 py-10 flex items-center justify-between bg-[#252525] mt-20 flex-wrap gap-6">
      <div className="font-['Bebas_Neue'] text-[20px] tracking-[0.1em] text-[#e8e8e8]">
        AUTOMATION<span className="text-[#c8861a]">SWITCH</span>
      </div>

      <SocialLinks size={16} />

      <nav className="flex gap-7">
        {['Articles', 'Tools', 'About', 'Newsletter'].map(label => (
          <Link
            key={label}
            href={`/${label.toLowerCase()}`}
            className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#707070] no-underline hover:text-[#c8861a] transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#707070]">
        © {new Date().getFullYear()} Automation Switch
      </div>
    </footer>
  )
}
